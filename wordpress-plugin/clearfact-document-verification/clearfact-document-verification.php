<?php
/**
 * Plugin Name: ClearFact Document Verification
 * Description: Registers official ClearFact documents, generates secure verification links and QR codes, and exposes a public verification endpoint.
 * Version: 1.0.0
 */
if (!defined('ABSPATH')) exit;

add_action('init', function () {
  register_post_type('cf_document', [
    'labels' => ['name'=>'Document Verification','singular_name'=>'Official Document','add_new_item'=>'Register Official Document','edit_item'=>'Edit Official Document'],
    'public'=>false, 'show_ui'=>true, 'show_in_menu'=>true, 'menu_icon'=>'dashicons-shield-alt',
    'supports'=>['title'], 'capability_type'=>'post', 'map_meta_cap'=>true
  ]);
});

add_action('add_meta_boxes', function () { add_meta_box('cf_doc_details','Verification Details','cf_doc_box','cf_document','normal','high'); });
function cf_doc_box($post) {
  wp_nonce_field('cf_doc_save','cf_doc_nonce');
  $fields=['document_id'=>'Document ID','document_type'=>'Document Type','holder'=>'Recipient / Holder','issue_date'=>'Issue Date','status'=>'Status','token'=>'Secure Verification Token'];
  foreach($fields as $key=>$label){ $v=get_post_meta($post->ID,'_'.$key,true); echo '<p><label><strong>'.esc_html($label).'</strong></label><br>';
    if($key==='status'){ echo '<select name="'.$key.'">'; foreach(['Valid','Revoked','Expired','Superseded'] as $o) echo '<option '.selected($v,$o,false).'>'.$o.'</option>'; echo '</select>'; }
    else echo '<input style="width:100%;max-width:650px" name="'.$key.'" value="'.esc_attr($v).'" '.($key==='token'?'readonly':'').'>';
    echo '</p>'; }
  $token=get_post_meta($post->ID,'_token',true);
  if($token){
    $url='https://clearfact.ng/verify?token='.$token; $doc_id=get_post_meta($post->ID,'_document_id',true);
    echo '<hr><h3>Document QR Verification</h3>';
    echo '<p><strong>Verification URL</strong><br><input id="cf-verification-url" style="width:100%;max-width:650px" readonly value="'.esc_attr($url).'"></p>';
    echo '<div id="cf-qrcode" data-url="'.esc_attr($url).'" style="background:#fff;padding:12px;display:inline-block;border:1px solid #ddd"></div>';
    echo '<p style="margin-top:12px"><button type="button" class="button button-primary" id="cf-download-qr">Download QR Code</button> <button type="button" class="button" id="cf-copy-url">Copy Verification URL</button> <button type="button" class="button" id="cf-print-label">Print Verification Label</button></p>';
    echo '<p><strong>Recommended label:</strong><br>Document ID: '.esc_html($doc_id).'<br>Scan to verify authenticity</p>';
  } else echo '<p><em>Publish or update this document to generate its secure token and QR code.</em></p>';
}

add_action('save_post_cf_document', function($post_id){
  if(!isset($_POST['cf_doc_nonce']) || !wp_verify_nonce($_POST['cf_doc_nonce'],'cf_doc_save') || !current_user_can('edit_post',$post_id) || (defined('DOING_AUTOSAVE')&&DOING_AUTOSAVE)) return;
  foreach(['document_id','document_type','holder','issue_date','status'] as $key) if(isset($_POST[$key])) update_post_meta($post_id,'_'.$key,sanitize_text_field(wp_unslash($_POST[$key])));
  if(!get_post_meta($post_id,'_token',true)) update_post_meta($post_id,'_token',wp_generate_password(32,false,false));
},10,1);

add_action('rest_api_init', function(){ register_rest_route('clearfact/v1','/verify',['methods'=>'GET','permission_callback'=>'__return_true','callback'=>function($req){
  $code=sanitize_text_field($req->get_param('code')); if(!$code) return new WP_REST_Response(['valid'=>false],400);
  $q=new WP_Query(['post_type'=>'cf_document','post_status'=>'publish','posts_per_page'=>1,'meta_query'=>['relation'=>'OR',['key'=>'_document_id','value'=>$code,'compare'=>'='],['key'=>'_token','value'=>$code,'compare'=>'=']]]);
  if(!$q->have_posts()) return new WP_REST_Response(['valid'=>false],404);
  $id=$q->posts[0]->ID; $status=get_post_meta($id,'_status',true) ?: 'Valid';
  return new WP_REST_Response(['valid'=>true,'document_id'=>get_post_meta($id,'_document_id',true),'document_type'=>get_post_meta($id,'_document_type',true),'holder'=>get_post_meta($id,'_holder',true),'issue_date'=>get_post_meta($id,'_issue_date',true),'status'=>$status],200);
}]); });

add_action('admin_enqueue_scripts', function($hook){ global $post; if(!in_array($hook,['post.php','post-new.php'],true) || !$post || $post->post_type!=='cf_document') return; wp_enqueue_script('cf-qrcodejs','https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',[], '1.0.0', true); });
add_action('admin_footer-post.php','cf_qr_admin_script'); add_action('admin_footer-post-new.php','cf_qr_admin_script');
function cf_qr_admin_script(){ global $post; if(!$post || $post->post_type!=='cf_document') return; $doc_id=get_post_meta($post->ID,'_document_id',true); ?>
<script>document.addEventListener('DOMContentLoaded',function(){const box=document.getElementById('cf-qrcode');if(!box||typeof QRCode==='undefined')return;const url=box.dataset.url;new QRCode(box,{text:url,width:220,height:220,colorDark:'#000000',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});const getData=()=>{const c=box.querySelector('canvas');if(c)return c.toDataURL('image/png');const i=box.querySelector('img');return i?i.src:null};const dl=document.getElementById('cf-download-qr');if(dl)dl.addEventListener('click',()=>setTimeout(()=>{const d=getData();if(!d)return alert('QR image is not ready yet.');const a=document.createElement('a');a.href=d;a.download=<?php echo wp_json_encode(($doc_id?:'ClearFact-document').'-verification-QR.png'); ?>;a.click()},50));const cp=document.getElementById('cf-copy-url');if(cp)cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url);cp.textContent='Copied!';setTimeout(()=>cp.textContent='Copy Verification URL',1500)}catch(e){document.getElementById('cf-verification-url').select();document.execCommand('copy')}});const pr=document.getElementById('cf-print-label');if(pr)pr.addEventListener('click',()=>{const d=getData();if(!d)return alert('QR image is not ready yet.');const w=window.open('','_blank','width=520,height=650');const id=<?php echo wp_json_encode($doc_id); ?>;w.document.write('<!doctype html><html><head><title>ClearFact Verification Label</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:30px}.label{display:inline-block;border:1px solid #bbb;padding:20px;max-width:320px}img{width:220px;height:220px}.id{font-weight:700;margin:12px 0 6px}.small{font-size:12px;color:#444}</style></head><body><div class="label"><strong>CLEARFACT VERIFIED DOCUMENT</strong><br><img src="'+d+'"><div class="id">'+id+'</div><div>Scan to verify authenticity</div><div class="small">clearfact.ng</div></div><script>window.onload=function(){window.print()}<\/script></body></html>');w.document.close()})});</script><?php }
