<?php
// WordPress/WooCommerce contract doubles: no real payment, email or file is sent.
define('ABSPATH',__DIR__);define('HOUR_IN_SECONDS',3600);define('ARRAY_A','ARRAY_A');
$hooks=[];$options=[];$orders=[];
function add_action($n,$f,...$x){global $hooks;$hooks[$n][]=$f;}function add_filter(...$x){}function register_activation_hook(...$x){}function get_option($n,$d=false){global $options;return $options[$n]??$d;}
function check($v,$label){if(!$v)throw new Exception('FAIL: '.$label);echo "PASS: $label\n";}
class DB {public $prefix='wp_';public $rows=[];function replace($table,$data,...$x){$this->rows[$data['item_id']]=$data;return 1;}function prepare($sql,...$x){return $sql;}function get_col($sql){return array_keys($this->rows);}function delete($table,$where,...$x){unset($this->rows[$where['item_id']]);}}
$wpdb=new DB;
class DateDouble {function date($format){return '2026-09-08 12:00:00';}}
class ItemDouble {public $total=100;public $tax=0;public $meta=['_cfb_book_id'=>10,'_cfb_author_id'=>7,'_cfb_commission_bps'=>2000];function get_meta($k){return $this->meta[$k]??'';}function get_total(){return $this->total;}function get_total_tax(){return $this->tax;}function get_name(){return 'Test digital book';}}
class RefundDouble {public $items=[];function get_items(){return $this->items;}}
class OrderDouble {public $customer=5;public $paid=true;public $paid_at=true;public $refunded=0;public $line_refund=0;public $refunds=[];public $items=[];public $status='completed';function get_customer_id(){return $this->customer;}function is_paid(){return $this->paid;}function get_date_paid(){return $this->paid_at?new DateDouble:false;}function get_total_refunded(){return $this->refunded;}function get_total_refunded_for_item($i){return $this->line_refund;}function get_items(){return $this->items;}function get_refunds(){return $this->refunds;}function get_currency(){return 'NGN';}function get_status(){return $this->status;}function get_date_created(){return new DateDouble;}}
function wc_get_order($id){global $orders;return $orders[$id]??false;}
require __DIR__.'/../wordpress-plugin/clearfact-books-store/clearfact-books-store.php';
check(cfb_cents('10.25')===1025,'prices parsed in minor units');check(cfb_cents('-2')===false&&cfb_cents('1.234')===false&&cfb_cents('NaN')===false,'invalid prices rejected');
check(cfb_line_financials(100,20,2000,true)===[8000,1600,6400],'commission calculated after refund');
check(cfb_line_financials(100,120,2000,true)===[0,0,0],'over-refund cannot create negative sales');
check(cfb_line_financials(100,0,2000,false)===[0,0,0],'unpaid order creates no earnings');
$item=new ItemDouble;$order=new OrderDouble;$order->items=[99=>$item];$orders[1]=$order;
check(cfb_download_allowed($order,$item,5),'paid owner may download');check(!cfb_download_allowed($order,$item,6),'different account cannot download');check(!cfb_download_allowed($order,$item,0),'anonymous buyer cannot download');
$order->paid=false;check(!cfb_download_allowed($order,$item,5),'pending or failed payment cannot download');$order->paid=true;$order->paid_at=false;check(!cfb_download_allowed($order,$item,5),'paid date required');$order->paid_at=true;
$order->refunded=1;check(!cfb_download_allowed($order,$item,5),'partial refund suspends download');$order->refunded=0;
cfb_sync_order(1);cfb_sync_order(1);check(count($wpdb->rows)===1&&$wpdb->rows[99]['net_cents']===8000,'repeated notifications do not duplicate earnings');
$item->meta['_cfb_commission_bps']=2000;$options['cfb_commission_bps']=4000;cfb_sync_order(1);check($wpdb->rows[99]['commission_cents']===2000,'order retains agreed commission snapshot');
$refundItem=new ItemDouble;$refundItem->total=-20;$refundItem->tax=-2;$refund=new RefundDouble;$refund->items=[$refundItem];$order->refunds=[$refund];$order->refunded=22;$order->line_refund=20;cfb_sync_order(1);check($wpdb->rows[99]['gross_cents']===8000&&$wpdb->rows[99]['net_cents']===6400,'allocated refund tax is not deducted twice');
$order->paid=false;$order->status='refunded';cfb_sync_order(1);check($wpdb->rows[99]['net_cents']===0,'refunded order reverses earnings');
$order->items=[];cfb_sync_order(1);check(count($wpdb->rows)===0,'removed order line removes stale earnings');
$source=file_get_contents(__DIR__.'/../wordpress-plugin/clearfact-books-store/clearfact-books-store.php');check(strpos($source,'media_handle_upload')===false&&strpos($source,'move_uploaded_file')===false,'full book implementation has no public-media upload path');
check(isset($hooks['admin_post_cfb_file'])&&isset($hooks['admin_post_nopriv_cfb_file']),'download entrypoints registered');
echo "Contract tests passed. Real gateway, email and WordPress integration still need staging checks.\n";
