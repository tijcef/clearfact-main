<?php
/**
 * Plugin Name: ClearFact Books Store
 * Description: Author submissions, editorial approval, WooCommerce checkout, private PDF delivery and manually reviewed author payouts.
 * Version: 1.0.0
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 */
if (!defined('ABSPATH')) exit;
define('CFB_VERSION','1.0.0');
function cfb_table(){global $wpdb;return $wpdb->prefix.'cfb_files';}
function cfb_money($cents){return 'NGN '.number_format($cents/100,2);}
function cfb_cents($value){if(!preg_match('/^\d{1,7}(\.\d{1,2})?$/',(string)$value))return false;return (int)round((float)$value*100);}
function cfb_rate(){return max(0,min(10000,(int)get_option('cfb_commission_bps',0)));}
function cfb_portal_url(){return admin_url('admin-post.php?action=cfb_portal');}
function cfb_file_url($id,$kind,$order=0,$item=0){return add_query_arg(['action'=>'cfb_file','book'=>(int)$id,'kind'=>$kind,'order'=>(int)$order,'item'=>(int)$item],admin_url('admin-post.php'));}
function cfb_install(){
 global $wpdb;require_once ABSPATH.'wp-admin/includes/upgrade.php';$table=cfb_table();$collate=$wpdb->get_charset_collate();
 dbDelta("CREATE TABLE $table (book_id bigint(20) unsigned NOT NULL, kind varchar(12) NOT NULL, part int unsigned NOT NULL, data mediumtext NOT NULL, PRIMARY KEY (book_id,kind,part)) $collate;");
 update_option('cfb_version',CFB_VERSION,false);
}
register_activation_hook(__FILE__,'cfb_install');
add_action('admin_init',function(){if(current_user_can('manage_options') && get_option('cfb_version')!==CFB_VERSION)cfb_install();});
add_action('init',function(){
 register_post_type('cf_manuscript',['label'=>'Book Submissions','public'=>false,'publicly_queryable'=>false,'show_ui'=>true,'show_in_rest'=>false,'exclude_from_search'=>true,'supports'=>['title'],'capabilities'=>['edit_posts'=>'manage_woocommerce','edit_others_posts'=>'manage_woocommerce','publish_posts'=>'manage_woocommerce','read_private_posts'=>'manage_woocommerce','delete_posts'=>'manage_woocommerce','delete_others_posts'=>'manage_woocommerce','edit_post'=>'manage_woocommerce','read_post'=>'manage_woocommerce','delete_post'=>'manage_woocommerce','create_posts'=>'do_not_allow'],'map_meta_cap'=>false]);
});
function cfb_staff(){return current_user_can('manage_woocommerce') || current_user_can('manage_options');}
function cfb_notice($message){set_transient('cfb_notice_'.get_current_user_id(),$message,120);}
function cfb_redirect($message){cfb_notice($message);wp_safe_redirect(cfb_portal_url());exit;}
function cfb_error($message,$status=400){wp_die(esc_html($message),'ClearFact Books',['response'=>$status]);}
function cfb_private_headers(){nocache_headers();header('X-Robots-Tag: noindex, nofollow');header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');}
function cfb_throttle($scope,$limit){$key='cfb_limit_'.hash_hmac('sha256',$scope,wp_salt());$count=(int)get_transient($key);if($count>=$limit)return false;set_transient($key,$count+1,HOUR_IN_SECONDS);return true;}
function cfb_validate_upload($file,$kind){
 if(!is_array($file)||($file['error']??UPLOAD_ERR_NO_FILE)!==UPLOAD_ERR_OK||!is_uploaded_file($file['tmp_name']??''))throw new Exception('Please attach all required files. The server may also need a higher upload limit.');
 $size=filesize($file['tmp_name']);$limit=$kind==='book'?20*1024*1024:($kind==='cover'?3*1024*1024:2*1024*1024);
 if(!$size||$size>$limit)throw new Exception('File too large: book PDF maximum 20 MB, cover 3 MB and sample PDF 2 MB.');
 if($kind==='cover'){$image=@getimagesize($file['tmp_name']);if(!$image||!in_array($image['mime'],['image/jpeg','image/png'],true)||$image[0]>6000||$image[1]>6000)throw new Exception('Cover must be a valid JPEG or PNG, no more than 6000 pixels per side.');$mime=$image['mime'];}
 else{$f=fopen($file['tmp_name'],'rb');$signature=fread($f,5);fclose($f);if($signature!=='%PDF-')throw new Exception('Book and sample must be PDF files.');$mime='application/pdf';}
 return ['size'=>$size,'mime'=>$mime,'sha256'=>hash_file('sha256',$file['tmp_name']),'parts'=>(int)ceil($size/262144)];
}
function cfb_store_upload($id,$kind,$file,$info){
 global $wpdb;$table=cfb_table();$stream=fopen($file['tmp_name'],'rb');if(!$stream)throw new Exception('Could not read the uploaded file.');$part=0;
 try{while(!feof($stream)){$bytes=fread($stream,262144);if($bytes===false)throw new Exception('Upload interrupted.');if($bytes==='')break;if($wpdb->insert($table,['book_id'=>$id,'kind'=>$kind,'part'=>$part++,'data'=>base64_encode($bytes)],['%d','%s','%d','%s'])===false)throw new Exception('Could not save the private file. Please retry.');}}finally{fclose($stream);}
 if($part!==$info['parts'])throw new Exception('Incomplete file. Please retry.');update_post_meta($id,'_cfb_file_'.$kind,$info);
}
function cfb_submission(){
 if(!is_user_logged_in()){auth_redirect();exit;}
 if(!function_exists('wc_get_product'))cfb_error('The bookstore is not available yet. Please contact info@clearfact.ng.',503);
 check_admin_referer('cfb_submit');$uid=get_current_user_id();
 if(!cfb_throttle('submit-'.$uid,6))cfb_redirect('Please wait before submitting another book.');
 $title=sanitize_text_field(wp_unslash($_POST['title']??''));$author=sanitize_text_field(wp_unslash($_POST['author']??''));$description=sanitize_textarea_field(wp_unslash($_POST['description']??''));$price=cfb_cents(wp_unslash($_POST['price']??''));$rate=cfb_rate();
 if(strlen($title)<2||strlen($title)>180||strlen($author)<2||strlen($author)>120||strlen($description)<40||strlen($description)>6000||$price===false||$price<100||$price>100000000||empty($_POST['rights'])||empty($_POST['commission_terms']))cfb_redirect('Check the title, author, description, price (NGN 1–1,000,000), rights and commission consent.');
 if((string)($_POST['rate']??'')!==(string)$rate)cfb_redirect('The commission terms changed. Please read the current rate and submit again.');
 $key=sanitize_text_field(wp_unslash($_POST['submission_key']??''));if(!preg_match('/^[a-f0-9-]{36}$/i',$key))cfb_redirect('Please reload the author portal before submitting.');
 $lock='cfb_submit_'.hash('sha256',$uid.'|'.$key);$previous=get_option($lock);
 if($previous)cfb_redirect('This submission is already saved or processing. Check My books below before sending another copy.');
 $id=0;$owns_lock=false;
 try{
  $files=[];foreach(['book','sample','cover'] as $kind)$files[$kind]=cfb_validate_upload($_FILES[$kind]??null,$kind);
  if($files['book']['sha256']===$files['sample']['sha256']||$files['sample']['size']>=$files['book']['size'])throw new Exception('Upload a shorter sample, not the complete book.');
  if(!add_option($lock,'processing','',false))throw new Exception('Submission already processing.');$owns_lock=true;
  $id=wp_insert_post(['post_type'=>'cf_manuscript','post_status'=>'pending','post_title'=>$title,'post_content'=>$description,'post_author'=>$uid],true);if(is_wp_error($id)||!$id){$id=0;throw new Exception('Could not save the submission.');}
  update_post_meta($id,'_cfb_author_name',$author);update_post_meta($id,'_cfb_price_cents',$price);update_post_meta($id,'_cfb_commission_bps',$rate);update_post_meta($id,'_cfb_rights_at',gmdate('c'));
  foreach($files as $kind=>$info)cfb_store_upload($id,$kind,$_FILES[$kind],$info);
  update_post_meta($id,'_cfb_upload_ready',1);update_option($lock,$id,false);
  wp_mail('info@clearfact.ng','Book awaiting review: '.$title,'A new book is ready for review: '.admin_url('post.php?post='.$id.'&action=edit'));
  cfb_redirect('Book submitted for review. It will appear publicly only after ClearFact approves it.');
 }catch(Exception $e){if($id){global $wpdb;$wpdb->delete(cfb_table(),['book_id'=>$id],['%d']);wp_delete_post($id,true);}if($owns_lock)delete_option($lock);cfb_redirect($e->getMessage());}
}
add_action('admin_post_cfb_submit','cfb_submission');
add_action('admin_post_nopriv_cfb_submit',function(){auth_redirect();});
function cfb_register(){
 check_admin_referer('cfb_register');$ip=(string)($_SERVER['REMOTE_ADDR']??'unknown');if(!cfb_throttle('register-'.$ip,5))cfb_error('Please wait before trying again.',429);
 $email=sanitize_email(wp_unslash($_POST['email']??''));$name=sanitize_text_field(wp_unslash($_POST['name']??''));if(!is_email($email)||strlen($email)>190||strlen($name)<2||strlen($name)>120||empty($_POST['consent'])||!empty($_POST['website']))cfb_error('Enter your name and email and accept the privacy notice.');
 if(!email_exists($email)){$id=wp_insert_user(['user_login'=>'cfreader_'.wp_generate_password(18,false,false),'user_email'=>$email,'display_name'=>$name,'user_pass'=>wp_generate_password(40,true,true),'role'=>'subscriber']);if(!is_wp_error($id))wp_new_user_notification($id,null,'user');}
 wp_safe_redirect(add_query_arg('registered','1',cfb_portal_url()));exit;
}
add_action('admin_post_nopriv_cfb_register','cfb_register');
add_action('admin_post_cfb_register',function(){wp_safe_redirect(cfb_portal_url());exit;});
function cfb_page_start($title){
 cfb_private_headers();header('Content-Type: text/html; charset=utf-8');echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'.esc_html($title).' | ClearFact Books</title><style>body{margin:0;background:#f5f7fa;color:#14243a;font:16px/1.6 system-ui,sans-serif}header{background:#102c4d;color:white;padding:20px max(20px,calc((100% - 1100px)/2))}header a{color:white}main{max-width:1100px;margin:32px auto;padding:0 20px}h1,h2,h3{line-height:1.25}h1,h2{font-family:Georgia,serif}.panel{background:white;border:1px solid #d3dce6;border-top:4px solid #b88a33;padding:24px;margin:24px 0;border-radius:5px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px}a{color:#164f85}label{display:block;margin:16px 0}input:not([type=checkbox]),textarea{box-sizing:border-box;width:100%;padding:11px;border:1px solid #94a4b6;border-radius:4px;font:inherit}input[type=checkbox]{margin-right:8px}button,.button{display:inline-block;background:#123d66;color:white;border:0;border-radius:4px;padding:12px 20px;cursor:pointer;font:inherit;text-decoration:none}.table{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:650px}td,th{text-align:left;padding:12px;border-bottom:1px solid #ddd;font-size:14px}.muted{color:#58677a}.notice{background:#eaf1f8;padding:16px;border-left:4px solid #b88a33}nav{display:flex;gap:20px;flex-wrap:wrap}small{font-size:14px}</style></head><body><header><strong>CLEARFACT BOOKS</strong><nav><a href="https://clearfact.ng/books">Bookstore</a><a href="'.esc_url(cfb_portal_url()).'">Author portal & purchases</a>'.(is_user_logged_in()?'<a href="'.esc_url(wp_logout_url(cfb_portal_url())).'">Sign out</a>':'').'</nav></header><main><h1>'.esc_html($title).'</h1>';
}
function cfb_page_end(){echo '</main></body></html>';exit;}
function cfb_portal(){
 cfb_page_start('Author portal & purchases');
 if(!is_user_logged_in()){
  if(isset($_GET['registered']))echo '<p class="notice">If a new account could be created, a password setup email has been requested. Check your inbox and spam folder. If you already have an account, sign in or reset your password. Contact info@clearfact.ng if the email does not arrive.</p>';
  echo '<div class="grid"><section class="panel"><h2>Sign in</h2><p>Submit a book, track earnings or download a purchase.</p><a class="button" href="'.esc_url(wp_login_url(cfb_portal_url())).'">Sign in</a><p><a href="'.esc_url(wp_lostpassword_url(cfb_portal_url())).'">Reset password</a></p></section><section class="panel"><h2>Create an account</h2><p>Use your email to receive a secure password setup link.</p><form method="post" action="'.esc_url(admin_url('admin-post.php')).'"><input type="hidden" name="action" value="cfb_register">';wp_nonce_field('cfb_register');echo '<label>Full name<input name="name" required maxlength="120" autocomplete="name"></label><label>Email<input type="email" name="email" required maxlength="190" autocomplete="email"></label><input name="website" tabindex="-1" autocomplete="off" style="display:none"><label><input type="checkbox" name="consent" required value="1">I agree to the <a href="https://clearfact.ng/privacy">Privacy Policy</a>.</label><button>Create account</button></form></section></div>';cfb_page_end();
 }
 $uid=get_current_user_id();$notice=get_transient('cfb_notice_'.$uid);if($notice){delete_transient('cfb_notice_'.$uid);echo '<p class="notice">'.esc_html($notice).'</p>';}
 if(!function_exists('wc_get_orders')){echo '<p class="notice">The bookstore is being prepared. Please contact info@clearfact.ng.</p>';cfb_page_end();}
 $page=max(1,absint($_GET['books_page']??1));$query=new WP_Query(['post_type'=>'cf_manuscript','post_status'=>['pending','publish','draft','private'],'author'=>$uid,'posts_per_page'=>20,'paged'=>$page]);
 echo '<section class="panel"><h2>My books</h2><div class="table"><table><thead><tr><th>Title</th><th>Review status</th><th>Proposed price</th><th>Commission agreed</th><th>Review note</th></tr></thead><tbody>';
 foreach($query->posts as $p)echo '<tr><td>'.esc_html($p->post_title).'</td><td>'.esc_html(get_post_meta($p->ID,'_cfb_review',true)?:'Pending review').'</td><td>'.esc_html(cfb_money((int)get_post_meta($p->ID,'_cfb_price_cents',true))).'</td><td>'.esc_html((int)get_post_meta($p->ID,'_cfb_commission_bps',true)/100).'%</td><td>'.esc_html(get_post_meta($p->ID,'_cfb_note',true)).'</td></tr>';
 if(!$query->posts)echo '<tr><td colspan="5">No books submitted yet.</td></tr>';echo '</tbody></table></div>';for($n=1;$n<=$query->max_num_pages;$n++)echo '<a style="margin-right:12px" href="'.esc_url(add_query_arg('books_page',$n,cfb_portal_url())).'">'.(int)$n.'</a>';echo '</section>';
 cfb_author_sales($uid);cfb_purchases($uid);
 $rate=cfb_rate();echo '<section class="panel"><h2>Submit a digital book</h2><p>Full books are stored privately. Only the cover, description and sample become public after review. First release supports PDF books.</p><p><strong>ClearFact commission for this submission: '.esc_html($rate/100).'%.</strong> Author earnings are the remaining share of the discounted book price, excluding tax and refunded amounts. ClearFact bears payment-provider fees. The agreed rate is saved with this submission.</p><form method="post" enctype="multipart/form-data" action="'.esc_url(admin_url('admin-post.php')).'"><input type="hidden" name="action" value="cfb_submit"><input type="hidden" name="rate" value="'.esc_attr($rate).'"><input type="hidden" name="submission_key" value="'.esc_attr(wp_generate_uuid4()).'">';wp_nonce_field('cfb_submit');
 echo '<div class="grid"><label>Book title *<input name="title" required maxlength="180"></label><label>Author / pen name *<input name="author" required maxlength="120"></label></div><label>Description *<textarea name="description" required minlength="40" maxlength="6000" rows="6"></textarea></label><label>Proposed price (NGN) *<input name="price" type="number" min="1" max="1000000" step="0.01" required></label><div class="grid"><label>Cover: JPEG or PNG, up to 3 MB *<input name="cover" type="file" accept="image/jpeg,image/png" required></label><label>Full book: PDF, up to 20 MB *<input name="book" type="file" accept="application/pdf" required></label><label>Short sample: PDF, up to 2 MB *<input name="sample" type="file" accept="application/pdf" required></label></div><label><input type="checkbox" name="rights" value="1" required>I own or have permission to publish and sell this book, cover and sample. I permit ClearFact to display the sample publicly after approval.</label><label><input type="checkbox" name="commission_terms" value="1" required>I accept the commission stated above and staff-reviewed payouts. Publication is subject to review.</label><button>Submit for ClearFact review</button></form></section>';cfb_page_end();
}
add_action('admin_post_cfb_portal','cfb_portal');add_action('admin_post_nopriv_cfb_portal','cfb_portal');

// One row per order line. Recalculation replaces values instead of adding earnings twice.
function cfb_ledger_install(){
 global $wpdb;require_once ABSPATH.'wp-admin/includes/upgrade.php';$c=$wpdb->get_charset_collate();
 dbDelta("CREATE TABLE {$wpdb->prefix}cfb_sales (item_id bigint(20) unsigned NOT NULL, order_id bigint(20) unsigned NOT NULL, book_id bigint(20) unsigned NOT NULL, author_id bigint(20) unsigned NOT NULL, title varchar(200) NOT NULL, currency varchar(8) NOT NULL, gross_cents bigint NOT NULL DEFAULT 0, commission_cents bigint NOT NULL DEFAULT 0, net_cents bigint NOT NULL DEFAULT 0, status varchar(24) NOT NULL, sale_date datetime NOT NULL, PRIMARY KEY (item_id), KEY author_id (author_id), KEY order_id (order_id)) $c;");
 dbDelta("CREATE TABLE {$wpdb->prefix}cfb_payouts (id bigint(20) unsigned NOT NULL AUTO_INCREMENT, author_id bigint(20) unsigned NOT NULL, amount_cents bigint NOT NULL, transfer_ref varchar(190) NOT NULL, staff_id bigint(20) unsigned NOT NULL, paid_at datetime NOT NULL, PRIMARY KEY (id), UNIQUE KEY transfer_ref (transfer_ref), KEY author_id (author_id)) $c;");
}
register_activation_hook(__FILE__,'cfb_ledger_install');
function cfb_book_for_product($id){return (int)get_post_meta($id,'_cfb_book_id',true);}
function cfb_snapshot_item($item,$product){
 if(!$product || $item->get_meta('_cfb_book_id'))return;
 $book=cfb_book_for_product($product->get_id());$post=get_post($book);if(!$post||$post->post_type!=='cf_manuscript')return;
 $item->add_meta_data('_cfb_book_id',$book,true);$item->add_meta_data('_cfb_author_id',(int)$post->post_author,true);$item->add_meta_data('_cfb_commission_bps',(int)get_post_meta($book,'_cfb_commission_bps',true),true);
}
add_action('woocommerce_checkout_create_order_line_item',function($item,$key,$values){cfb_snapshot_item($item,$values['data']??null);},10,3);
add_action('woocommerce_new_order_item',function($id,$item){if(is_a($item,'WC_Order_Item_Product')&&!$item->get_meta('_cfb_book_id')){cfb_snapshot_item($item,$item->get_product());if($item->get_meta('_cfb_book_id'))$item->save();}},10,2);
function cfb_line_financials($total,$refunded,$rate,$paid){$gross=$paid?max(0,(int)round(((float)$total-(float)$refunded)*100)):0;$commission=(int)round($gross*max(0,min(10000,$rate))/10000);return [$gross,$commission,$gross-$commission];}
function cfb_sync_order($id){
 if(!function_exists('wc_get_order'))return;$order=wc_get_order($id);if(!$order||is_a($order,'WC_Order_Refund'))return;global $wpdb;
 $items=$order->get_items();$subtotal=0;$allocated=0;foreach($items as $item_id=>$item){$subtotal+=(float)$item->get_total();}foreach($order->get_refunds() as $refund_order){foreach($refund_order->get_items() as $refund_item){$allocated+=abs((float)$refund_item->get_total())+abs((float)$refund_item->get_total_tax());}}
 // Unallocated order-level refunds are conservatively apportioned across book totals. Line-allocated tax is excluded from author earnings.
 $unallocated=max(0,(float)$order->get_total_refunded()-$allocated);$seen=[];
 foreach($items as $item_id=>$item){$book=(int)$item->get_meta('_cfb_book_id');$author=(int)$item->get_meta('_cfb_author_id');if(!$book||!$author)continue;$seen[]=(int)$item_id;
  $refund=abs((float)$order->get_total_refunded_for_item($item_id))+($subtotal>0?$unallocated*(float)$item->get_total()/$subtotal:0);
  [$gross,$commission,$net]=cfb_line_financials($item->get_total(),$refund,(int)$item->get_meta('_cfb_commission_bps'),$order->is_paid()&&(bool)$order->get_date_paid());
  $wpdb->replace($wpdb->prefix.'cfb_sales',['item_id'=>$item_id,'order_id'=>$id,'book_id'=>$book,'author_id'=>$author,'title'=>$item->get_name(),'currency'=>$order->get_currency(),'gross_cents'=>$gross,'commission_cents'=>$commission,'net_cents'=>$net,'status'=>$order->get_status(),'sale_date'=>$order->get_date_created()->date('Y-m-d H:i:s')],['%d','%d','%d','%d','%s','%s','%d','%d','%d','%s','%s']);
 }
 // Removed lines cannot leave stale earnings behind.
 $rows=$wpdb->get_col($wpdb->prepare("SELECT item_id FROM {$wpdb->prefix}cfb_sales WHERE order_id=%d",$id));foreach($rows as $row)if(!in_array((int)$row,$seen,true))$wpdb->delete($wpdb->prefix.'cfb_sales',['item_id'=>(int)$row],['%d']);
}
add_action('woocommerce_payment_complete','cfb_sync_order',20);
add_action('woocommerce_order_status_changed','cfb_sync_order',20);
add_action('woocommerce_order_refunded','cfb_sync_order',20);
add_action('woocommerce_saved_order_items','cfb_sync_order',20);
add_action('woocommerce_update_order','cfb_sync_order',20);
function cfb_author_totals($uid){global $wpdb;$sales=$wpdb->get_row($wpdb->prepare("SELECT COALESCE(SUM(gross_cents),0) gross,COALESCE(SUM(commission_cents),0) commission,COALESCE(SUM(net_cents),0) net FROM {$wpdb->prefix}cfb_sales WHERE author_id=%d AND currency='NGN'",$uid),ARRAY_A);$paid=(int)$wpdb->get_var($wpdb->prepare("SELECT COALESCE(SUM(amount_cents),0) FROM {$wpdb->prefix}cfb_payouts WHERE author_id=%d",$uid));return ['gross'=>(int)($sales['gross']??0),'commission'=>(int)($sales['commission']??0),'net'=>(int)($sales['net']??0),'paid'=>$paid,'balance'=>(int)($sales['net']??0)-$paid];}
function cfb_author_sales($uid){
 global $wpdb;$totals=cfb_author_totals($uid);echo '<section class="panel"><h2>Sales & earnings</h2><div class="grid">';foreach(['gross'=>'Sales after refunds','commission'=>'ClearFact commission','net'=>'Author earnings','paid'=>'Paid to you','balance'=>'Balance for staff review'] as $key=>$label)echo '<div><small>'.esc_html($label).'</small><h3>'.esc_html(cfb_money($totals[$key])).'</h3></div>';echo '</div><p class="muted">Earnings exclude tax and refunded amounts. A negative balance means refunds exceeded unpaid earnings. Payouts are reviewed and transferred by staff; the dashboard does not transfer money automatically.</p>';
 $page=max(1,absint($_GET['sales_page']??1));$rows=$wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}cfb_sales WHERE author_id=%d ORDER BY sale_date DESC,item_id DESC LIMIT 21 OFFSET %d",$uid,($page-1)*20),ARRAY_A);
 echo '<div class="table"><table><thead><tr><th>Order</th><th>Book</th><th>Status</th><th>Sales</th><th>Commission</th><th>Your earnings</th></tr></thead><tbody>';foreach(array_slice($rows,0,20) as $r)echo '<tr><td>#'.(int)$r['order_id'].'</td><td>'.esc_html($r['title']).'</td><td>'.esc_html($r['status']).'</td><td>'.esc_html(cfb_money($r['gross_cents'])).'</td><td>'.esc_html(cfb_money($r['commission_cents'])).'</td><td>'.esc_html(cfb_money($r['net_cents'])).'</td></tr>';if(!$rows)echo '<tr><td colspan="6">No sales recorded yet.</td></tr>';echo '</tbody></table></div>';if($page>1)echo '<a href="'.esc_url(add_query_arg('sales_page',$page-1,cfb_portal_url())).'">Previous</a> ';if(count($rows)>20)echo '<a href="'.esc_url(add_query_arg('sales_page',$page+1,cfb_portal_url())).'">Next</a>';
 echo '<h3>Payout history</h3><ul>';$payouts=$wpdb->get_results($wpdb->prepare("SELECT amount_cents,transfer_ref,paid_at FROM {$wpdb->prefix}cfb_payouts WHERE author_id=%d ORDER BY id DESC LIMIT 30",$uid),ARRAY_A);foreach($payouts as $p)echo '<li>'.esc_html(cfb_money($p['amount_cents']).' — '.$p['paid_at'].' — '.$p['transfer_ref']).'</li>';if(!$payouts)echo '<li>No payouts recorded.</li>';echo '</ul><p>For payout enquiries, email info@clearfact.ng with your account email. Buyer names and contact details are not shown to authors.</p></section>';
}
function cfb_download_allowed($order,$item,$uid){
 if(!$order||!$item||!$uid||(int)$order->get_customer_id()!==(int)$uid||!$order->is_paid()||!$order->get_date_paid()||!(int)$item->get_meta('_cfb_book_id'))return false;
 // Refunds revoke access immediately, including refunds without a line allocation.
 return (float)$order->get_total_refunded()<=0;
}
function cfb_order_links($order,$plain=false){
 if(!$order||!$order->is_paid()||!$order->get_date_paid())return;
 foreach($order->get_items() as $item_id=>$item){$book=(int)$item->get_meta('_cfb_book_id');if(!$book||!cfb_download_allowed($order,$item,$order->get_customer_id()))continue;$url=cfb_file_url($book,'book',$order->get_id(),$item_id);if($plain)echo "\nDownload ".wp_strip_all_tags($item->get_name())." (sign in with your purchasing account): $url\n";else echo '<p><a href="'.esc_url($url).'">Download '.esc_html($item->get_name()).'</a> <small>(sign in with your purchasing account)</small></p>';}
}
add_action('woocommerce_email_after_order_table',function($order,$admin,$plain){if(!$admin)cfb_order_links($order,$plain);},20,3);
add_action('woocommerce_thankyou',function($id){cfb_order_links(wc_get_order($id));});
add_action('woocommerce_view_order',function($id){$order=wc_get_order($id);if($order&&(int)$order->get_customer_id()===get_current_user_id())cfb_order_links($order);});
function cfb_purchases($uid){
 echo '<section class="panel"><h2>My purchases</h2>';$page=max(1,absint($_GET['orders_page']??1));$orders=wc_get_orders(['customer_id'=>$uid,'limit'=>10,'page'=>$page,'paginate'=>true,'orderby'=>'date','order'=>'DESC']);
 foreach($orders->orders as $order){$has=false;foreach($order->get_items() as $item)if($item->get_meta('_cfb_book_id'))$has=true;if(!$has)continue;echo '<h3>Order #'.esc_html($order->get_order_number()).' · '.esc_html(wc_get_order_status_name($order->get_status())).'</h3>';cfb_order_links($order);echo '<p><a href="'.esc_url($order->get_view_order_url()).'">View order and payment details</a></p>';}
 if(!$orders->orders)echo '<p>No purchases yet.</p>';if($page>1)echo '<a href="'.esc_url(add_query_arg('orders_page',$page-1,cfb_portal_url())).'">Previous</a> ';if($page<$orders->max_num_pages)echo '<a href="'.esc_url(add_query_arg('orders_page',$page+1,cfb_portal_url())).'">Next</a>';echo '<p class="muted">Downloads become available after payment is confirmed. Any refund on an order suspends that order’s book downloads; contact ClearFact if access needs review.</p></section>';
}
function cfb_file(){
 $id=absint($_GET['book']??0);$kind=sanitize_key($_GET['kind']??'');$post=get_post($id);if(!$post||$post->post_type!=='cf_manuscript'||!in_array($kind,['book','cover','sample'],true))cfb_error('File not found.',404);
 $uid=get_current_user_id();$reviewer=cfb_staff();$owner=$uid && $uid===(int)$post->post_author;
 if($kind==='book'&&!$reviewer&&!$owner){if(!$uid){auth_redirect();exit;}$order=function_exists('wc_get_order')?wc_get_order(absint($_GET['order']??0)):false;$item=$order?$order->get_item(absint($_GET['item']??0)):false;if(!cfb_download_allowed($order,$item,$uid)||(int)$item->get_meta('_cfb_book_id')!==$id)cfb_error('This account does not have a paid, active purchase for this book.',403);}
 if($kind!=='book'&&!$reviewer&&!$owner&&get_post_meta($id,'_cfb_review',true)!=='approved')cfb_error('File not found.',404);
 $info=get_post_meta($id,'_cfb_file_'.$kind,true);if(!$info||!get_post_meta($id,'_cfb_upload_ready',true))cfb_error('File temporarily unavailable. Contact ClearFact.',503);
 // Assemble into a temporary non-public stream and verify integrity before any download bytes are sent.
 global $wpdb;$tmp=tmpfile();if(!$tmp)cfb_error('Download temporarily unavailable.',503);$hash=hash_init('sha256');$size=0;
 for($part=0;$part<(int)$info['parts'];$part++){$row=$wpdb->get_var($wpdb->prepare('SELECT data FROM '.cfb_table().' WHERE book_id=%d AND kind=%s AND part=%d',$id,$kind,$part));$bytes=is_string($row)?base64_decode($row,true):false;if($bytes===false||$bytes===''){fclose($tmp);cfb_error('Incomplete file. Please contact ClearFact.',503);}hash_update($hash,$bytes);$size+=strlen($bytes);if(fwrite($tmp,$bytes)!==strlen($bytes)){fclose($tmp);cfb_error('Download temporarily unavailable.',503);}}
 if($size!==(int)$info['size']||!hash_equals($info['sha256'],hash_final($hash))){fclose($tmp);cfb_error('File integrity check failed. Please contact ClearFact.',503);}
 while(ob_get_level()>0){ob_end_clean();}
 cfb_private_headers();header('Content-Type: '.$info['mime']);header('Content-Length: '.$size);$ext=$kind==='cover'?($info['mime']==='image/png'?'png':'jpg'):'pdf';header('Content-Disposition: '.($kind==='cover'?'inline':'attachment').'; filename="clearfact-'.$id.'-'.$kind.'.'.$ext.'"');header("Content-Security-Policy: sandbox");rewind($tmp);fpassthru($tmp);fclose($tmp);exit;
}
add_action('admin_post_cfb_file','cfb_file');add_action('admin_post_nopriv_cfb_file','cfb_file');

add_action('add_meta_boxes',function(){add_meta_box('cfb_review','Book review & publication','cfb_review_box','cf_manuscript','normal','high');});
function cfb_review_box($post){
 if(!cfb_staff())return;$id=$post->ID;$ready=get_post_meta($id,'_cfb_upload_ready',true);$product_id=(int)get_post_meta($id,'_cfb_product_id',true);
 echo '<p><strong>Author:</strong> '.esc_html(get_post_meta($id,'_cfb_author_name',true)).' (account #'.(int)$post->post_author.')</p><p><strong>Proposed price:</strong> '.esc_html(cfb_money((int)get_post_meta($id,'_cfb_price_cents',true))).' · <strong>Agreed commission:</strong> '.esc_html((int)get_post_meta($id,'_cfb_commission_bps',true)/100).'%</p><p style="white-space:pre-wrap">'.esc_html($post->post_content).'</p>';
 if($ready)foreach(['cover','sample','book'] as $kind)echo '<p><a href="'.esc_url(cfb_file_url($id,$kind)).'" target="_blank" rel="noopener">Review '.esc_html($kind).'</a></p>';else echo '<p>Upload incomplete. This book cannot be approved.</p>';
 if($product_id)echo '<p><a href="'.esc_url(get_edit_post_link($product_id)).'">Open store product</a></p>';
 wp_nonce_field('cfb_review_'.$id,'cfb_review_nonce');echo '<p><label>Decision <select name="cfb_decision">';foreach(['pending'=>'Pending review','approved'=>'Approve and list for sale','changes_requested'=>'Request changes','rejected'=>'Reject','withdrawn'=>'Withdraw from sale'] as $value=>$label)echo '<option value="'.esc_attr($value).'" '.selected(get_post_meta($id,'_cfb_review',true)?:'pending',$value,false).'>'.esc_html($label).'</option>';echo '</select></label></p><p><label>Review note (visible to author)<br><textarea name="cfb_note" rows="4" class="widefat">'.esc_textarea(get_post_meta($id,'_cfb_note',true)).'</textarea></label></p><p>Use Update to save the decision. Approval creates a virtual WooCommerce product at the proposed price. Full PDFs never enter the Media Library. Review rights, content, sample and cover before approval. A requested revision should be submitted as a new book; existing purchased files remain available.</p>';
}
function cfb_approve($id){
 if(!function_exists('wc_get_product'))throw new Exception('Activate WooCommerce before approving books.');
 if(get_woocommerce_currency()!=='NGN')throw new Exception('Set the bookstore currency to NGN before approval.');
 $post=get_post($id);if(!$post||!get_post_meta($id,'_cfb_upload_ready',true))throw new Exception('Complete private book, sample and cover files are required.');
 $product_id=(int)get_post_meta($id,'_cfb_product_id',true);$product=$product_id?wc_get_product($product_id):new WC_Product_Simple();if(!$product)throw new Exception('The linked product is missing. Contact the administrator.');
 $product->set_name($post->post_title);$product->set_description(esc_html($post->post_content));$product->set_short_description('By '.get_post_meta($id,'_cfb_author_name',true));$product->set_regular_price(number_format((int)get_post_meta($id,'_cfb_price_cents',true)/100,2,'.',''));$product->set_sale_price('');$product->set_virtual(true);$product->set_downloadable(false);$product->set_sold_individually(true);$product->set_catalog_visibility('visible');$product->set_status('publish');$product->update_meta_data('_cfb_book_id',$id);$pid=$product->save();if(!$pid)throw new Exception('Could not save the product.');update_post_meta($id,'_cfb_product_id',$pid);
}
add_action('save_post_cf_manuscript',function($id){
 if(!cfb_staff()||wp_is_post_revision($id)||!isset($_POST['cfb_review_nonce'])||!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['cfb_review_nonce'])),'cfb_review_'.$id))return;
 $decision=sanitize_key($_POST['cfb_decision']??'');if(!in_array($decision,['pending','approved','changes_requested','rejected','withdrawn'],true))return;
 $lock='cfb-review-'.$id;global $wpdb;if((int)$wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 0)',$lock))!==1){cfb_notice('Another reviewer is saving this book. Please retry.');return;}
 try{
  if($decision==='approved')cfb_approve($id);else{$pid=(int)get_post_meta($id,'_cfb_product_id',true);if($pid&&function_exists('wc_get_product')){$product=wc_get_product($pid);if($product){$product->set_status('draft');$product->save();}}}
  $before=get_post_meta($id,'_cfb_review',true);update_post_meta($id,'_cfb_review',$decision);update_post_meta($id,'_cfb_note',substr(sanitize_textarea_field(wp_unslash($_POST['cfb_note']??'')),0,3000));update_post_meta($id,'_cfb_reviewed_by',get_current_user_id());update_post_meta($id,'_cfb_reviewed_at',gmdate('c'));
  if($before!==$decision){$author=get_userdata((int)get_post_field('post_author',$id));if($author)wp_mail($author->user_email,'ClearFact book review update','Your book review status is: '.$decision.'. View details at '.cfb_portal_url());}
 }catch(Exception $e){cfb_notice($e->getMessage());}finally{$wpdb->get_var($wpdb->prepare('SELECT RELEASE_LOCK(%s)',$lock));}
});
add_action('admin_notices',function(){if(!cfb_staff())return;$key='cfb_notice_'.get_current_user_id();$message=get_transient($key);if($message){delete_transient($key);echo '<div class="notice notice-warning"><p>'.esc_html($message).'</p></div>';}if(!function_exists('wc_get_product'))echo '<div class="notice notice-error"><p>ClearFact Books needs WooCommerce activated and an online payment gateway configured.</p></div>';});
add_filter('cfs_catalogue',function($items,$kind){
 if($kind!=='books'||!function_exists('wc_get_products'))return $items;
 $products=wc_get_products(['status'=>'publish','limit'=>-1,'meta_key'=>'_cfb_book_id','meta_compare'=>'EXISTS']);
 foreach($products as $p){$id=cfb_book_for_product($p->get_id());if(!$id||get_post_meta($id,'_cfb_review',true)!=='approved'||!get_post_meta($id,'_cfb_upload_ready',true))continue;
  $items[]=['id'=>$p->get_id(),'title'=>$p->get_name(),'description'=>wp_strip_all_tags(get_post_field('post_content',$id)),'author'=>get_post_meta($id,'_cfb_author_name',true),'edition'=>'PDF digital book','price'=>'NGN '.number_format((float)$p->get_price(),2),'cover'=>cfb_file_url($id,'cover'),'sample'=>cfb_file_url($id,'sample'),'url'=>get_permalink($p->get_id()),'store'=>true];
 }return $items;
},10,2);
add_filter('woocommerce_product_get_image',function($image,$product){$id=cfb_book_for_product($product->get_id());return $id?'<img src="'.esc_url(cfb_file_url($id,'cover')).'" alt="'.esc_attr($product->get_name()).' cover" style="max-width:100%;height:auto">':$image;},10,2);
add_action('woocommerce_single_product_summary',function(){global $product;if(!$product)return;$id=cfb_book_for_product($product->get_id());if($id)echo '<p><a href="'.esc_url(cfb_file_url($id,'sample')).'">Read a sample PDF</a></p><p>Full PDF delivered to your purchasing account after payment is confirmed. <a href="'.esc_url(cfb_portal_url()).'">Create an account or sign in</a>.</p>';},25);
add_filter('woocommerce_is_purchasable',function($ok,$product){$id=cfb_book_for_product($product->get_id());if(!$id)return $ok;return $ok&&get_woocommerce_currency()==='NGN'&&get_post_meta($id,'_cfb_review',true)==='approved'&&(bool)get_post_meta($id,'_cfb_upload_ready',true);},10,2);
function cfb_cart_has_books(){if(!function_exists('WC')||!WC()->cart)return false;foreach(WC()->cart->get_cart() as $row)if(cfb_book_for_product($row['product_id']))return true;return false;}
add_filter('woocommerce_checkout_registration_required',function($required){return cfb_cart_has_books()?true:$required;});
add_filter('woocommerce_checkout_registration_enabled',function($enabled){return cfb_cart_has_books()?true:$enabled;});
add_filter('pre_option_woocommerce_enable_guest_checkout',function($value){return cfb_cart_has_books()?'no':$value;});
add_filter('woocommerce_available_payment_gateways',function($gateways){if(cfb_cart_has_books())foreach(['bacs','cheque','cod'] as $id)unset($gateways[$id]);return $gateways;});
add_action('woocommerce_checkout_process',function(){if(cfb_cart_has_books()&&get_woocommerce_currency()!=='NGN')wc_add_notice('ClearFact Books checkout requires NGN. Please contact support.','error');});
// Mark book-only orders complete only after the gateway has called payment_complete.
add_action('woocommerce_payment_complete',function($id){$order=wc_get_order($id);if(!$order||!$order->is_paid())return;$all=true;foreach($order->get_items() as $item)if(!$item->get_meta('_cfb_book_id'))$all=false;if($all&&count($order->get_items()))$order->update_status('completed','Verified payment for ClearFact digital books.');},30);
add_filter('wp_robots',function($robots){if(function_exists('is_product')&&is_product()&&cfb_book_for_product(get_queried_object_id())){$robots['noindex']=true;$robots['follow']=true;unset($robots['index']);}return $robots;});
add_action('template_redirect',function(){if(function_exists('is_product')&&is_product()&&cfb_book_for_product(get_queried_object_id())){header('X-Robots-Tag: noindex, follow');}if(function_exists('is_checkout')&&(is_checkout()||is_account_page()||is_cart())){cfb_private_headers();}});
add_action('admin_menu',function(){add_submenu_page('woocommerce','ClearFact author payouts','ClearFact author payouts','manage_woocommerce','cfb-payouts','cfb_admin_payouts');add_options_page('ClearFact Books','ClearFact Books','manage_options','cfb-settings','cfb_settings');});
function cfb_settings(){
 if(!current_user_can('manage_options'))return;if(isset($_POST['cfb_save'])){check_admin_referer('cfb_settings');$rate=cfb_cents(wp_unslash($_POST['commission']??''));if($rate!==false&&$rate<=10000)update_option('cfb_commission_bps',$rate,false);else echo '<div class="notice notice-error"><p>Enter a commission between 0 and 100 percent.</p></div>';}
 echo '<div class="wrap"><h1>ClearFact Books</h1><p>Commission defaults to 0% until you set your business rate. Changes apply only to new submissions. Existing accepted rates stay with their books and order items. Author earnings exclude tax and refunded amounts; ClearFact bears gateway fees.</p><form method="post">';wp_nonce_field('cfb_settings');echo '<label>Commission percent <input name="commission" type="number" min="0" max="100" step="0.01" value="'.esc_attr(number_format(cfb_rate()/100,2,'.','')).'"></label>';submit_button('Save rate','primary','cfb_save');echo '</form><h2>Launch checklist</h2><ol><li>Activate WooCommerce, create its cart/checkout/account pages, and set NGN as the store currency.</li><li>Connect an approved online payment gateway in WooCommerce → Settings → Payments. Test payment, failure, cancellation, refund and webhook handling. No live keys are bundled.</li><li>Set WordPress upload_max_filesize to at least 20M and post_max_size to at least 32M.</li><li>Test account setup emails, order receipts and signed-in downloads. Full PDFs are stored in private database chunks, not public media files.</li><li>Exclude cart, checkout, My Account, admin-post.php and WooCommerce payment callbacks from all page caches. Verify that anonymous users cannot download a paid book.</li></ol><p><a href="'.esc_url(cfb_portal_url()).'">Open author portal</a></p></div>';
}
function cfb_record_payout(){
 if(!cfb_staff())cfb_error('Not authorised.',403);check_admin_referer('cfb_payout');$uid=absint($_POST['author_id']??0);$amount=cfb_cents(wp_unslash($_POST['amount']??''));$ref=sanitize_text_field(wp_unslash($_POST['transfer_ref']??''));
 if(!$uid||!get_userdata($uid)||$amount===false||$amount<=0||strlen($ref)<4||strlen($ref)>190||empty($_POST['verified']))cfb_error('Check author, amount, transfer reference and verification.');
 global $wpdb;$lock='cfb-payout-'.$uid;if((int)$wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 0)',$lock))!==1)cfb_error('Another payout is being recorded. Please retry.',409);
 try{
  // Refresh every known author order before checking the balance. Gateway status is authoritative.
  $order_ids=$wpdb->get_col($wpdb->prepare("SELECT DISTINCT order_id FROM {$wpdb->prefix}cfb_sales WHERE author_id=%d",$uid));foreach($order_ids as $order_id)cfb_sync_order($order_id);
  $totals=cfb_author_totals($uid);if($amount>$totals['balance'])throw new Exception('Amount exceeds the current unpaid author earnings.');
  if($wpdb->insert($wpdb->prefix.'cfb_payouts',['author_id'=>$uid,'amount_cents'=>$amount,'transfer_ref'=>$ref,'staff_id'=>get_current_user_id(),'paid_at'=>current_time('mysql',true)],['%d','%d','%s','%d','%s'])===false)throw new Exception('Could not record payout. The transfer reference may already have been used.');
  cfb_notice('Payout recorded. No bank transfer was initiated by this website.');
 }catch(Exception $e){cfb_notice($e->getMessage());}finally{$wpdb->get_var($wpdb->prepare('SELECT RELEASE_LOCK(%s)',$lock));}
 wp_safe_redirect(admin_url('admin.php?page=cfb-payouts'));exit;
}
add_action('admin_post_cfb_payout','cfb_record_payout');
function cfb_admin_payouts(){
 if(!cfb_staff())return;global $wpdb;echo '<div class="wrap"><h1>ClearFact author payouts</h1><p>Review WooCommerce order/payment/refund records and verify the author’s bank details privately. Transfer funds outside this dashboard, then record the actual transfer here. Recording a payout never initiates a transfer.</p><table class="widefat striped"><tr><th>Author account</th><th>Name</th><th>Net earnings</th><th>Paid</th><th>Balance</th></tr>';
 $authors=$wpdb->get_col("SELECT DISTINCT author_id FROM {$wpdb->prefix}cfb_sales ORDER BY author_id");foreach($authors as $uid){$u=get_userdata($uid);$t=cfb_author_totals($uid);echo '<tr><td>'.(int)$uid.'</td><td>'.esc_html($u?$u->display_name:'Deleted account').'</td><td>'.esc_html(cfb_money($t['net'])).'</td><td>'.esc_html(cfb_money($t['paid'])).'</td><td>'.esc_html(cfb_money($t['balance'])).'</td></tr>';}echo '</table><h2>Record a verified transfer</h2><form method="post" action="'.esc_url(admin_url('admin-post.php')).'"><input type="hidden" name="action" value="cfb_payout">';wp_nonce_field('cfb_payout');echo '<p><label>Author account ID <input type="number" name="author_id" min="1" required></label></p><p><label>Amount paid in NGN <input name="amount" type="number" min="0.01" max="9999999" step="0.01" required></label></p><p><label>Unique bank / provider transfer reference <input name="transfer_ref" required maxlength="190"></label></p><p><label><input type="checkbox" name="verified" value="1" required>I have verified this transfer to the correct author and checked their current balance.</label></p>';submit_button('Record completed transfer');echo '</form><h2>Reconcile order records</h2><p>Refresh the earnings ledger from WooCommerce after restoring orders or when reconciling payouts. Process each page before relying on the refreshed totals.</p><form method="post" action="'.esc_url(admin_url('admin-post.php')).'"><input type="hidden" name="action" value="cfb_reconcile"><input type="hidden" name="page" value="1">';wp_nonce_field('cfb_reconcile');submit_button('Reconcile first 50 orders');echo '</form></div>';
}
// Both classic checkout and the Store API must attach purchases to an account.
add_action('woocommerce_checkout_create_order',function($order){if(cfb_cart_has_books()&&!$order->get_customer_id())throw new Exception('Create an account or sign in before purchasing a ClearFact book.');},10);
add_action('woocommerce_store_api_checkout_update_order_from_request',function($order){foreach($order->get_items() as $item){$product=$item->get_product();cfb_snapshot_item($item,$product);if($item->get_meta('_cfb_book_id')){if(!$order->get_customer_id())throw new Exception('Sign in before purchasing a ClearFact book.');$item->save();}}},10);
// Avoid charging for a book whose approval was withdrawn after it entered a cart.
add_action('woocommerce_check_cart_items',function(){if(!function_exists('WC')||!WC()->cart)return;foreach(WC()->cart->get_cart() as $row){$id=cfb_book_for_product($row['product_id']);if($id&&get_post_meta($id,'_cfb_review',true)!=='approved')wc_add_notice('A book in your cart is no longer available. Please remove it before checkout.','error');}});
add_action('before_woocommerce_init',function(){if(class_exists('Automattic\\WooCommerce\\Utilities\\FeaturesUtil')){\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables',__FILE__,true);}});
// An administrator can reconcile after restoring orders or enabling the plugin on an existing store.
add_action('admin_post_cfb_reconcile',function(){
 if(!cfb_staff())cfb_error('Not authorised.',403);check_admin_referer('cfb_reconcile');$page=max(1,absint($_POST['page']??1));$orders=wc_get_orders(['limit'=>50,'page'=>$page,'paginate'=>true,'orderby'=>'ID','order'=>'ASC']);
 foreach($orders->orders as $order)cfb_sync_order($order->get_id());
 cfb_page_start('Reconcile book earnings');echo '<p>Processed order page '.(int)$page.' of '.(int)$orders->max_num_pages.'. This does not send payments or emails.</p>';if($page<$orders->max_num_pages){echo '<form method="post" action="'.esc_url(admin_url('admin-post.php')).'"><input type="hidden" name="action" value="cfb_reconcile"><input type="hidden" name="page" value="'.($page+1).'">';wp_nonce_field('cfb_reconcile');echo '<button>Process next 50 orders</button></form>';}else echo '<p>Reconciliation finished.</p>';echo '<p><a href="'.esc_url(admin_url('admin.php?page=cfb-payouts')).'">Back to payouts</a></p>';cfb_page_end();
});
