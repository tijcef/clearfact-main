<?php
/**
 * Plugin Name: ClearFact Services & Publications
 * Description: Private service requests, partnership applications, verified receipts, books and e-print catalogues for clearfact.ng.
 * Version: 1.0.0
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) exit;

function cfs_options() { return array_merge(['bank'=>'','account_name'=>'','account_number'=>'','payment_url'=>'','instructions'=>'','secret'=>''], (array)get_option('cfs_options', [])); }
function cfs_error($code, $message, $status=400) { return new WP_Error($code, $message, ['status'=>$status]); }
function cfs_url($url) { $url=esc_url_raw($url, ['https']); return wp_parse_url($url, PHP_URL_SCHEME)==='https' ? $url : ''; }
register_activation_hook(__FILE__, function() { $o=cfs_options(); if (!$o['secret']) { $o['secret']=wp_generate_password(48, false, false); update_option('cfs_options',$o,false); } });
add_action('init', function() {
    foreach (['cf_book'=>'ClearFact Books','cf_eprint'=>'ClearFact E-Print'] as $type=>$label) {
        register_post_type($type, ['label'=>$label,'public'=>false,'publicly_queryable'=>false,'exclude_from_search'=>true,'show_ui'=>true,'show_in_rest'=>false,'rewrite'=>false,'supports'=>['title','editor','thumbnail'],'capability_type'=>'post','map_meta_cap'=>true]);
    }
    register_post_type('cf_request', ['label'=>'ClearFact Requests','public'=>false,'publicly_queryable'=>false,'exclude_from_search'=>true,'show_ui'=>true,'show_in_rest'=>false,'rewrite'=>false,'supports'=>['title'],'capabilities'=>['edit_posts'=>'manage_options','edit_others_posts'=>'manage_options','publish_posts'=>'manage_options','read_private_posts'=>'manage_options','delete_posts'=>'manage_options','delete_others_posts'=>'manage_options','edit_post'=>'manage_options','read_post'=>'manage_options','delete_post'=>'manage_options','create_posts'=>'do_not_allow'],'map_meta_cap'=>false]);
});
add_action('rest_api_init', function() {
    register_rest_route('clearfact-services/v1','/config',['methods'=>'GET','permission_callback'=>'__return_true','callback'=>function($r){ $o=cfs_options(); $secret=$o['secret']; unset($o['secret']); $o['accepting_requests']=$secret && hash_equals($secret,(string)$r->get_header('x-clearfact-secret')); return $o; }]);
    register_rest_route('clearfact-services/v1','/catalogue',['methods'=>'GET','permission_callback'=>'__return_true','callback'=>function($r){
        $kind=$r->get_param('kind'); if (!in_array($kind,['books','eprint'],true)) return cfs_error('kind','Invalid catalogue.');
        $posts=get_posts(['post_type'=>$kind==='books'?'cf_book':'cf_eprint','post_status'=>'publish','posts_per_page'=>-1,'orderby'=>'date','order'=>'DESC']); $items=[];
        foreach($posts as $p) { $m=(array)get_post_meta($p->ID,'_cfs_publication',true); $items[]=['id'=>$p->ID,'title'=>wp_strip_all_tags(get_the_title($p)),'description'=>wp_strip_all_tags(strip_shortcodes($p->post_content)),'author'=>$m['author']??'','edition'=>$m['edition']??'','price'=>$m['price']??'','cover'=>cfs_url(get_the_post_thumbnail_url($p,'large')?:''),'url'=>cfs_url($m['url']??'')]; } return $items;
    }]);
    register_rest_route('clearfact-services/v1','/requests',['methods'=>'POST','permission_callback'=>function($r){ $secret=cfs_options()['secret']; return $secret && hash_equals($secret,(string)$r->get_header('x-clearfact-secret')) ? true : cfs_error('forbidden','Request unavailable.',403); },'callback'=>'cfs_submit']);
});
add_filter('rest_post_dispatch', function($response,$server,$request){ if (strpos($request->get_route(),'/clearfact-services/v1/')===0) { $response->header('Cache-Control','no-store'); $response->header('X-Robots-Tag','noindex, nofollow'); } return $response; },10,3);
function cfs_submit($r) {
    $d=$r->get_json_params(); if (!is_array($d)) return cfs_error('invalid','Invalid form.');
    foreach($d as $key=>$value) { if (!is_scalar($value) && $value!==null) return cfs_error('invalid','Invalid form value.'); }
    if (!empty($d['website_check'])) return cfs_error('invalid','Unable to accept this request.');
    $kind=$d['kind']??''; $name=sanitize_text_field($d['name']??''); $email=sanitize_email($d['email']??''); $brief=sanitize_textarea_field($d['brief']??''); $service=sanitize_text_field($d['service']??''); $uuid=$d['request_id']??'';
    $allowed=$kind==='partnership'?['Individual','Organisation']:['Display advertisement','Sponsored article','Event coverage','Video / social media campaign','E-print advertisement','Other media service'];
    if (!in_array($kind,['advertising','partnership'],true) || !in_array($service,$allowed,true) || strlen($name)<2 || strlen($name)>120 || !is_email($email) || strlen($email)>190 || strlen($brief)<20 || strlen($brief)>6000 || ($d['consent']??false)!==true || !preg_match('/^[a-f0-9-]{36}$/i',$uuid)) return cfs_error('validation','Check your name, email, selection, brief and consent.');
    $amount=(string)($d['amount']??''); if ($amount!=='' && (!preg_match('/^\d{1,9}(\.\d{1,2})?$/',$amount) || (float)$amount<=0)) return cfs_error('amount','Enter a valid amount in NGN.');
    $lock='cfs_req_'.hash('sha256',$uuid); $existing=get_option($lock);
    $fingerprint=hash('sha256',$email.'|'.$kind.'|'.$name.'|'.$brief);
    if (is_array($existing) && ($existing['fingerprint']??'')===$fingerprint && !empty($existing['id'])) return ['reference'=>get_post_meta($existing['id'],'_cfs_reference',true),'email_queued'=>(bool)get_post_meta($existing['id'],'_cfs_customer_mail',true)];
    if ($existing) return cfs_error('pending','This request is processing. Please retry shortly.',409);
    $rate='cfs_rate_'.hash_hmac('sha256',(string)$r->get_header('x-clearfact-client'),wp_salt()); $count=(int)get_transient($rate);
    if ($count>=8) return cfs_error('rate','Too many requests. Please try again in an hour or contact us by email.',429);
    if (!add_option($lock,['fingerprint'=>$fingerprint], '',false)) return cfs_error('pending','Request is processing. Please retry shortly.',409);
    set_transient($rate,$count+1,HOUR_IN_SECONDS);
    $id=wp_insert_post(['post_type'=>'cf_request','post_status'=>'private','post_title'=>ucfirst($kind).' — '.$name],true);
    if (is_wp_error($id) || !$id) { delete_option($lock); return cfs_error('storage','Unable to save your request. Please retry.',503); }
    $ref='CF-'.gmdate('Y').'-'.str_pad((string)$id,6,'0',STR_PAD_LEFT);
    $record=['kind'=>$kind,'name'=>$name,'email'=>$email,'organisation'=>substr(sanitize_text_field($d['organisation']??''),0,180),'phone'=>substr(sanitize_text_field($d['phone']??''),0,40),'service'=>$service,'brief'=>$brief,'materials'=>cfs_url(substr($d['materials']??'',0,1000)),'payment_reference'=>substr(sanitize_text_field($d['payment_reference']??''),0,120),'claimed_amount'=>$amount,'consent_at'=>gmdate('c')];
    update_post_meta($id,'_cfs_record',$record); update_post_meta($id,'_cfs_reference',$ref); update_post_meta($id,'_cfs_status','received'); update_option($lock,['fingerprint'=>$fingerprint,'id'=>$id],false);
    $to=$kind==='advertising'?'ads@clearfact.ng':'info@clearfact.ng';
    $staff=wp_mail($to,"New ClearFact $kind request: $ref","Reference: $ref\nName: $name\nEmail: $email\nService: $service\n\n$brief\n\nReview securely: ".admin_url("post.php?post=$id&action=edit"));
    update_post_meta($id,'_cfs_staff_mail',$staff?1:0);
    $message="Hello $name,\n\nYour ClearFact $kind request has been received.\nReference: $ref\n\n".($kind==='advertising'?"Email payment proof and creative files to ads@clearfact.ng, quoting this reference. Please pay only the amount and destination confirmed by our team. This acknowledgement is NOT a payment receipt. A receipt is issued after staff verify the payment.":"Our team will review your proposal and contact you. This acknowledgement is not a partnership agreement.")."\n\nClearFact Media Ltd\nhttps://clearfact.ng";
    $sent=wp_mail($email,"ClearFact request received — $ref",$message,['Reply-To: '.$to]); update_post_meta($id,'_cfs_customer_mail',$sent?1:0);
    return new WP_REST_Response(['reference'=>$ref,'email_queued'=>(bool)$sent],201);
}
add_action('admin_menu',function(){ add_options_page('ClearFact Services','ClearFact Services','manage_options','clearfact-services','cfs_settings'); });
function cfs_settings() {
    if (!current_user_can('manage_options')) return;
    if (isset($_POST['cfs_save'])) { check_admin_referer('cfs_settings'); $o=cfs_options(); foreach(['bank','account_name','account_number','instructions'] as $k) $o[$k]=sanitize_textarea_field(wp_unslash($_POST[$k]??'')); $o['payment_url']=cfs_url(wp_unslash($_POST['payment_url']??'')); if (!$o['secret']) $o['secret']=wp_generate_password(48,false,false); update_option('cfs_options',$o,false); echo '<div class="notice notice-success"><p>Settings saved.</p></div>'; }
    $o=cfs_options(); echo '<div class="wrap"><h1>ClearFact Services</h1><p>Add only verified company payment details and an approved HTTPS checkout link. Prices and service scope must be agreed with the customer before payment.</p><form method="post">'; wp_nonce_field('cfs_settings');
    foreach(['bank'=>'Bank','account_name'=>'Account name','account_number'=>'Account number','payment_url'=>'Secure payment link (HTTPS)','instructions'=>'Payment instructions'] as $k=>$label) echo '<p><label for="'.esc_attr($k).'">'.esc_html($label).'</label><br><textarea class="large-text" id="'.esc_attr($k).'" name="'.esc_attr($k).'" rows="2">'.esc_textarea($o[$k]).'</textarea></p>';
    submit_button('Save settings','primary','cfs_save'); echo '</form><h2>Website connection</h2><p>Set the Cloudflare Worker secret <code>CLEARFACT_SERVICES_SECRET</code> to this value. Never place it in a VITE variable or client code.</p><code style="overflow-wrap:anywhere">'.esc_html($o['secret']).'</code><h2>Staff workflow</h2><p>Open ClearFact Requests to review applications and briefs. Verify payments independently against your bank or provider before issuing a receipt. Only administrators can access these private records. Confirm your WordPress email service delivers mail to ads@clearfact.ng, info@clearfact.ng and customers.</p></div>';
}
add_action('add_meta_boxes',function(){
    foreach(['cf_book','cf_eprint'] as $type) add_meta_box('cfs_publication','Publication details','cfs_publication_box',$type,'normal','high');
    add_meta_box('cfs_request','Private request & payment receipt','cfs_request_box','cf_request','normal','high');
});
function cfs_publication_box($post) {
    wp_nonce_field('cfs_publication','cfs_nonce'); $m=(array)get_post_meta($post->ID,'_cfs_publication',true);
    echo '<p>Use the title and main editor for the name and description. Set a featured image for the cover. Publish only when ready; drafts never appear in the catalogue. Use a secure store link for paid files; public media links are not access-controlled.</p>';
    foreach(['author'=>'Author / publisher','edition'=>'Edition / volume / date','price'=>'Display price (e.g. NGN 2,000 or Free)','url'=>'Read / buy link (HTTPS)'] as $k=>$label) echo '<p><label>'.esc_html($label).'<br><input class="widefat" name="cfs_'.esc_attr($k).'" value="'.esc_attr($m[$k]??'').'"></label></p>';
}
add_action('save_post',function($id){
    if (!in_array(get_post_type($id),['cf_book','cf_eprint'],true) || wp_is_post_revision($id) || !isset($_POST['cfs_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['cfs_nonce'])),'cfs_publication') || !current_user_can('edit_post',$id)) return;
    $m=[]; foreach(['author','edition','price'] as $k) $m[$k]=sanitize_text_field(wp_unslash($_POST['cfs_'.$k]??'')); $m['url']=cfs_url(wp_unslash($_POST['cfs_url']??'')); update_post_meta($id,'_cfs_publication',$m);
});
function cfs_request_box($post) {
    if (!current_user_can('manage_options')) return;
    $d=(array)get_post_meta($post->ID,'_cfs_record',true); $ref=get_post_meta($post->ID,'_cfs_reference',true); $receipt=(array)get_post_meta($post->ID,'_cfs_receipt',true);
    echo '<h3>'.esc_html($ref).'</h3><p>Status: <strong>'.esc_html(get_post_meta($post->ID,'_cfs_status',true)).'</strong></p><table class="widefat striped">';
    foreach($d as $k=>$v) echo '<tr><th>'.esc_html(ucwords(str_replace('_',' ',$k))).'</th><td style="white-space:pre-wrap;overflow-wrap:anywhere">'.esc_html($v).'</td></tr>';
    echo '</table><p>Notification to staff: '.(get_post_meta($post->ID,'_cfs_staff_mail',true)?'accepted by mail system':'not queued — handle this record directly').'. Customer acknowledgement: '.(get_post_meta($post->ID,'_cfs_customer_mail',true)?'accepted by mail system':'not queued').'. Mail acceptance does not confirm inbox delivery.</p>';
    wp_nonce_field('cfs_review_'.$post->ID,'cfs_review_nonce');
    echo '<p><label>Request status <select name="cfs_status">'; foreach(['received','in_review','awaiting_payment','in_progress','completed','declined'] as $status) echo '<option value="'.esc_attr($status).'" '.selected(get_post_meta($post->ID,'_cfs_status',true),$status,false).'>'.esc_html($status).'</option>'; echo '</select></label> Update the record to save.</p>';
    if (($d['kind']??'')!=='advertising') return;
    if (!empty($receipt['number'])) { echo '<h3>Verified receipt '.esc_html($receipt['number']).'</h3><p>NGN '.esc_html($receipt['amount']).' · '.esc_html($receipt['transaction']).' · '.esc_html($receipt['paid_date']).'</p><p>Verified by staff user '.esc_html($receipt['verified_by']).'. Receipt email: '.(get_post_meta($post->ID,'_cfs_receipt_mail',true)?'accepted by mail system':'not queued').'.</p>'; if (!get_post_meta($post->ID,'_cfs_receipt_mail',true)) echo '<p><label><input type="checkbox" name="cfs_retry_receipt" value="1"> Retry receipt email on update</label></p>'; return; }
    echo '<h3>Issue a verified payment receipt</h3><p>Check the payment in the bank or payment provider account. A screenshot alone is not confirmation. The verified receipt is immutable.</p><p><label>Amount received (NGN) <input type="number" name="cfs_verified_amount" min="0.01" max="999999999" step="0.01"></label></p><p><label>Bank / provider transaction ID <input name="cfs_transaction" maxlength="120"></label></p><p><label>Payment date <input type="date" name="cfs_paid_date" max="'.esc_attr(gmdate('Y-m-d')).'"></label></p><p><label><input type="checkbox" name="cfs_verify" value="1"> I have independently verified this payment. Issue and email its receipt when I update this record.</label></p>';
}
function cfs_send_receipt($id,$receipt) {
    $d=get_post_meta($id,'_cfs_record',true); $ref=get_post_meta($id,'_cfs_reference',true);
    $body="CLEARFACT MEDIA LTD\nPAYMENT RECEIPT\n\nReceipt: {$receipt['number']}\nRequest: $ref\nCustomer: {$d['name']}\nOrganisation: {$d['organisation']}\nService: {$d['service']}\nAmount received: NGN {$receipt['amount']}\nTransaction: {$receipt['transaction']}\nPayment date: {$receipt['paid_date']}\nIssued: {$receipt['issued_at']}\n\nPayment has been verified by ClearFact staff. This receipt acknowledges the amount received; service delivery follows the agreed scope and schedule.\n\nContact: ads@clearfact.ng\nhttps://clearfact.ng";
    $sent=wp_mail($d['email'],'ClearFact payment receipt — '.$receipt['number'],$body,['Reply-To: ads@clearfact.ng']); update_post_meta($id,'_cfs_receipt_mail',$sent?1:0); return $sent;
}
add_action('save_post_cf_request',function($id){
    if (!current_user_can('manage_options') || wp_is_post_revision($id) || !isset($_POST['cfs_review_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['cfs_review_nonce'])),'cfs_review_'.$id)) return;
    $status=sanitize_key($_POST['cfs_status']??''); if(in_array($status,['received','in_review','awaiting_payment','in_progress','completed','declined'],true)) update_post_meta($id,'_cfs_status',$status);
    $d=(array)get_post_meta($id,'_cfs_record',true); if (($d['kind']??'')!=='advertising') return;
    $receipt=(array)get_post_meta($id,'_cfs_receipt',true);
    if (!empty($receipt['number'])) { if (!empty($_POST['cfs_retry_receipt']) && !get_post_meta($id,'_cfs_receipt_mail',true)) cfs_send_receipt($id,$receipt); return; }
    if (empty($_POST['cfs_verify'])) return;
    $amount=sanitize_text_field(wp_unslash($_POST['cfs_verified_amount']??'')); $transaction=sanitize_text_field(wp_unslash($_POST['cfs_transaction']??'')); $date=sanitize_text_field(wp_unslash($_POST['cfs_paid_date']??''));
    $parsed=DateTime::createFromFormat('!Y-m-d',$date);
    if (!preg_match('/^\d{1,9}(\.\d{1,2})?$/',$amount) || (float)$amount<=0 || !$transaction || strlen($transaction)>120 || !$parsed || $parsed->format('Y-m-d')!==$date || $date>gmdate('Y-m-d')) { set_transient('cfs_notice_'.get_current_user_id(),'Receipt not issued: enter a valid positive amount, transaction ID and payment date.',60); return; }
    // Atomic option prevents concurrent updates from generating two receipts.
    if (!add_option('cfs_receipt_lock_'.$id,1,'',false)) return;
    $txkey='cfs_tx_'.hash('sha256',strtolower(trim($transaction)));
    if (!add_option($txkey,$id,'',false)) { delete_option('cfs_receipt_lock_'.$id); set_transient('cfs_notice_'.get_current_user_id(),'Receipt not issued: this transaction ID has already been used.',60); return; }
    $receipt=['number'=>'CFR-'.gmdate('Y').'-'.str_pad((string)$id,6,'0',STR_PAD_LEFT),'amount'=>number_format((float)$amount,2,'.',''),'transaction'=>$transaction,'paid_date'=>$date,'issued_at'=>gmdate('c'),'verified_by'=>get_current_user_id()];
    if (!update_post_meta($id,'_cfs_receipt',$receipt)) { delete_option($txkey); delete_option('cfs_receipt_lock_'.$id); set_transient('cfs_notice_'.get_current_user_id(),'Receipt could not be saved. Please retry.',60); return; }
    cfs_send_receipt($id,$receipt);
});
add_action('admin_notices',function(){ $key='cfs_notice_'.get_current_user_id(); $message=get_transient($key); if($message){ delete_transient($key); echo '<div class="notice notice-error"><p>'.esc_html($message).'</p></div>'; } });
add_filter('manage_cf_request_posts_columns',function($cols){ $cols['cfs_kind']='Type'; $cols['cfs_reference']='Reference'; $cols['cfs_status']='Status'; return $cols; });
add_action('manage_cf_request_posts_custom_column',function($col,$id){ if($col==='cfs_kind'){ $d=get_post_meta($id,'_cfs_record',true); echo esc_html($d['kind']??''); } if($col==='cfs_reference') echo esc_html(get_post_meta($id,'_cfs_reference',true)); if($col==='cfs_status') echo esc_html(get_post_meta($id,'_cfs_status',true)); },10,2);
