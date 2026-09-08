<?php
// Contract tests with in-memory WordPress doubles; no email or network is sent.
define('ABSPATH',__DIR__); define('HOUR_IN_SECONDS',3600);
$options=[]; $meta=[]; $posts=[]; $transients=[]; $hooks=[]; $mails=[]; $mail_ok=false; $authorised=true;
class WP_Error { public $code,$message,$data; function __construct($c,$m,$d=[]){$this->code=$c;$this->message=$m;$this->data=$d;} }
class WP_REST_Response { public $data,$status; function __construct($d,$s=200){$this->data=$d;$this->status=$s;} }
class RequestDouble { public $data; function __construct($d){$this->data=$d;} function get_json_params(){return $this->data;} function get_header($h){return $h==='x-clearfact-client'?'192.0.2.5':'test-secret';} }
function check($condition,$label){if(!$condition)throw new Exception('FAIL: '.$label);echo "PASS: $label\n";}
function add_action($name,$fn,...$args){global $hooks;$hooks[$name][]=$fn;} function add_filter(...$x){} function register_activation_hook(...$x){}
function get_option($k,$d=false){global $options;return $options[$k]??$d;} function update_option($k,$v,...$x){global $options;$options[$k]=$v;return true;} function add_option($k,$v,...$x){global $options;if(isset($options[$k]))return false;$options[$k]=$v;return true;} function delete_option($k){global $options;unset($options[$k]);}
function get_post_meta($id,$k,...$x){global $meta;return $meta[$id][$k]??'';} function update_post_meta($id,$k,$v){global $meta;$meta[$id][$k]=$v;return true;}
function get_transient($k){global $transients;return $transients[$k]??false;} function set_transient($k,$v,...$x){global $transients;$transients[$k]=$v;} function delete_transient($k){global $transients;unset($transients[$k]);}
function sanitize_text_field($s){return trim(strip_tags((string)$s));} function sanitize_textarea_field($s){return trim(strip_tags((string)$s));} function sanitize_key($s){return $s;} function sanitize_email($s){return trim($s);} function is_email($s){return filter_var($s,FILTER_VALIDATE_EMAIL);} function esc_url_raw($s,...$x){return filter_var($s,FILTER_VALIDATE_URL)?$s:'';} function wp_parse_url(...$x){return parse_url(...$x);} function wp_salt(){return 'test-salt';} function is_wp_error($v){return $v instanceof WP_Error;}
function wp_insert_post($p,...$x){global $posts;$id=count($posts)+1;$posts[$id]=$p;return $id;} function admin_url($s){return 'https://cms.clearfact.ng/wp-admin/'.$s;} function wp_mail(...$args){global $mails,$mail_ok;$mails[]=$args;return $mail_ok;}
function current_user_can(...$x){global $authorised;return $authorised;} function wp_is_post_revision($id){return false;} function wp_unslash($s){return $s;} function wp_verify_nonce($nonce,$action){return $nonce==='valid';} function get_current_user_id(){return 5;}
require __DIR__.'/../wordpress-plugin/clearfact-services/clearfact-services.php';
$valid=['kind'=>'advertising','name'=>'Test Applicant','email'=>'test@example.invalid','brief'=>'Please schedule our approved advert for the agreed campaign dates.','service'=>'Display advertisement','consent'=>true,'request_id'=>'11111111-1111-4111-8111-111111111111'];
$bad=$valid;$bad['email']='invalid';check(cfs_submit(new RequestDouble($bad)) instanceof WP_Error,'invalid email rejected');
$bad=$valid;$bad['brief']=[];check(cfs_submit(new RequestDouble($bad)) instanceof WP_Error,'nested payload rejected');
$bad=$valid;$bad['amount']='-50';check(cfs_submit(new RequestDouble($bad)) instanceof WP_Error,'invalid claimed amount rejected');
$bad=$valid;$bad['consent']=false;check(cfs_submit(new RequestDouble($bad)) instanceof WP_Error,'consent required');
$result=cfs_submit(new RequestDouble($valid));check($result instanceof WP_REST_Response && $result->status===201,'request saved');
check($posts[1]['post_status']==='private','request stored privately');check($result->data['email_queued']===false,'mail failure reported without losing record');
check($mails[0][0]==='ads@clearfact.ng','advertising routed to correct mailbox');
$again=cfs_submit(new RequestDouble($valid));check(count($posts)===1 && $again['reference']===$result->data['reference'],'retry returns same reference without duplicate');
check(count($mails)===2,'retry does not send duplicate acknowledgement');
$partner=$valid;$partner['kind']='partnership';$partner['service']='Organisation';$partner['request_id']='22222222-2222-4222-8222-222222222222';
cfs_submit(new RequestDouble($partner));check($mails[2][0]==='info@clearfact.ng','partnership routed correctly');
$review=$hooks['save_post_cf_request'][0];
$_POST=['cfs_review_nonce'=>'valid','cfs_verify'=>'1','cfs_verified_amount'=>'5000.00','cfs_transaction'=>'BANK-TEST-001','cfs_paid_date'=>gmdate('Y-m-d'),'cfs_status'=>'in_progress'];
$authorised=false;$review(1);check(!get_post_meta(1,'_cfs_receipt',true),'unauthorised staff cannot issue receipt');$authorised=true;
$_POST['cfs_review_nonce']='bad';$review(1);check(!get_post_meta(1,'_cfs_receipt',true),'receipt action requires nonce');$_POST['cfs_review_nonce']='valid';
$_POST['cfs_paid_date']='2026-02-30';$review(1);check(!get_post_meta(1,'_cfs_receipt',true),'invalid calendar date rejected');$_POST['cfs_paid_date']=gmdate('Y-m-d');
$review(1);$receipt=get_post_meta(1,'_cfs_receipt',true);check($receipt['amount']==='5000.00' && $receipt['verified_by']===5,'verified receipt records amount and staff identity');
check(!get_post_meta(1,'_cfs_receipt_mail',true),'failed receipt mail remains retryable');
$_POST['cfs_verified_amount']='9000';$review(1);check(get_post_meta(1,'_cfs_receipt',true)['amount']==='5000.00','receipt immutable on repeated update');
$mail_ok=true;$_POST['cfs_retry_receipt']=1;$review(1);check(get_post_meta(1,'_cfs_receipt_mail',true)===1,'receipt email retry succeeds');unset($_POST['cfs_retry_receipt']);
$other=$valid;$other['request_id']='33333333-3333-4333-8333-333333333333';cfs_submit(new RequestDouble($other));$review(3);check(!get_post_meta(3,'_cfs_receipt',true),'duplicate transaction blocked across requests');
$review(2);check(!get_post_meta(2,'_cfs_receipt',true),'partnership has no payment receipt');
check(cfs_url('javascript:alert(1)')==='' && cfs_url('http://example.invalid')==='','unsafe publication and payment URLs rejected');
