<?php
//error_reporting(0);
//header("Content-type:text/html;charset=utf-8");

/*********************************************************

CONST

 **********************************************************/
define('appId', 'wxca9bd7684f48c1ee');
define('secret', '26ab668606a7f0df03a583533986fbd8');
define('token', 'mi_B406');
define('encodingAESKey', 'MdLh5s9FQzcRH9vtP8LyDdw7nwEVHRb6fGgaeRfKH3D');

define('PDO_DSN', 'mysql:host=' . SAE_MYSQL_HOST_M . ':' . SAE_MYSQL_PORT . ';dbname=' . SAE_MYSQL_DB);
define('PDO_USER', SAE_MYSQL_USER);
define('PDO_PASSWORD', SAE_MYSQL_PASS);

/*********************************************************

Function

 **********************************************************/
function getPDO($new = false) {
	if ($new || empty($GLOBALS["PDO"])) {
		$pdo = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
		$pdo->exec("SET NAMES utf8");
		if (empty($GLOBALS["PDO"])) {
			$GLOBALS["PDO"] = $pdo;
		}

		return $pdo;
	}
	return $GLOBALS["PDO"];
}
function apiMsg($code, $message = "", $json = array()) {
	$data["code"] = $code;
	$data["message"] = $message;
	$data["data"] = $json;
	echo json_encode($data);
	exit();
}
function makeFolder($folder) {
	if (!file_exists($folder)) {
		$preg = "/(\w:\/\/|\/)?[^:\/]+\/";
		while (preg_match($preg . "/", $folder, $match)) {
			$preg = $preg . "[^\/]+\/";
			//$match[0]=preg_replace("/:(?=\d)/","_",$match[0]);
			if (!file_exists($match[0])) {
				mkdir($match[0]);
			}

		}
	}
}
function saveBase64($str, $file, $overwrite) {
	$res["code"] = 1;
	if (strlen($str) > 10) {
		$str = str_replace('data:image/png;base64,', '', $str);
		$str = str_replace('data:image/jpeg;base64,', '', $str);
		$str = base64_decode($str);
		makeFolder($file);
		if ($file[strlen($file) - 1] == '/') {
			$res["message"] = md5($str);
			$file = $file . $res["message"];
		}
		if (empty($overwrite) && file_exists($file)) {
			$res["message"] = "已经存在";
		} else {
			$f = fopen($file, "wb");
			if ($f) {
				fwrite($f, $str);
				fclose($f);
				$res["code"] = 0;
			} else {
				$res["message"] = "系统错误";
			}

		}
	} else {
		$res["message"] = "文件损坏";
	}

	return $res;
}

/*

$link=mysql_connect("localhost","root","");

if($link)
{
mysql_select_db("test",$link);
//your code goes here
}
mysql_char("utf8");
function mysql_run($sql)
{
return mysql_query($sql);
}
function mysql_get($sql,$array_type=MYSQL_ASSOC)
{
$data=mysql_query($sql);
$row=mysql_fetch_array($data,$array_type);
if(!$row)return array();
$i=0;
do{
$rows[$i++]=$row;
}while($row=mysql_fetch_array($data,$array_type));
return $rows;
}
function getlastId()
{
$sql = "SELECT LAST_INSERT_ID() ";
$data= mysql_query($sql);
$row = mysql_fetch_array($data,MYSQL_NUM);
return $row[0];
}
function mysql_clo()
{
global $link;
mysql_close($link);
}
function mysql_empty($sql)
{
$data=mysql_query($sql);
if(mysql_num_rows($data)<1)return true;
return false;
}
function mysql_exist($tab)
{
return mysql_num_rows(mysql_query("SHOW TABLES LIKE '".$tab."'"))==1;
}
function mysql_field($tab)
{
if(!mysql_exist($tab))return false;
else{
$sql = "select * from {$tab}";
$res = mysql_query($sql);
$i=0;
while (@($row[$i]=mysql_field_name($res, $i))) {
++$i;
}
return $row;
}
}
function mysql_char($sql)
{
mysql_query("set names '".$sql."'");
}
function mysql_down($tab,$ret=false)
{
if(!mysql_exist($tab)){
if($ret)return false;
else echo "表格不存在";
}
else{
$str = "";
$field=mysql_field($tab);
for($i=0;$i<count($field);++$i){
$str.=$field[$i].",";
}$str.="\n";
$sql = "select * from {$tab}";
$data= mysql_get($sql,MYSQL_NUM);
for($i=0;$i<count($data);++$i){
for($j=0;$j<count($data[$i]);++$j){
$str.=$data[$i][$j].",";
}
$str.="\n";
}
if($ret)return $str;
else{
Header("Content-type: application/octet-stream");
Header("Accept-Ranges: bytes");
Header("Accept-Length: ".strlen($str));
Header("Content-Disposition: attachment; filename={$tab}.csv");
echo $str;
}
}
}
function mysql_table($sql)
{
$data=mysql_get($sql);
echo "<table align='center' border='1'>";
$first=true;
foreach($data as $row)
{
if($first)
{
echo "<tr>";
while(each($row))
{
list($key,$item)=each($row);
echo "<td>".$key."</td>";
}
echo "</tr>";
$first=false;
}
echo "<tr>";
for($i=0;$i<count($row)/2;++$i)
{
echo "<td>".$row[$i]."</td>";
}
echo "</tr>";
}
}
function my_log($str){
$file = fopen("log.txt","a");
if($file){
fwrite($file,$str." --->".getTime()."\r\n");
fclose($file);
}
}
function mysql_log($sql,$str="error"){
if(!mysql_query($sql)){
my_log($str." --->".$sql);
return false;
}
return true;
}
function vCode($num = 4, $size = 20, $width = 0, $height = 0) {
!$width && $width = $num * $size * 4 / 5 + 5;
!$height && $height = $size + 10;
// 去掉了 0 1 O l 等
$str = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVW";
$code = '';
for ($i = 0; $i < $num; $i++) {
$code .= $str[mt_rand(0, strlen($str)-1)];
}
// 画图像
$im = imagecreatetruecolor($width, $height);
// 定义要用到的颜色
$back_color = imagecolorallocate($im, 235, 236, 237);
$boer_color = imagecolorallocate($im, 118, 151, 199);
$text_color = imagecolorallocate($im, mt_rand(0, 200), mt_rand(0, 120), mt_rand(0, 120));
// 画背景
imagefilledrectangle($im, 0, 0, $width, $height, $back_color);
// 画边框
imagerectangle($im, 0, 0, $width-1, $height-1, $boer_color);
// 画干扰线
for($i = 0;$i < 5;$i++) {
$font_color = imagecolorallocate($im, mt_rand(0, 255), mt_rand(0, 255), mt_rand(0, 255));
imagearc($im, mt_rand(- $width, $width), mt_rand(- $height, $height), mt_rand(30, $width * 2), mt_rand(20, $height * 2), mt_rand(0, 360), mt_rand(0, 360), $font_color);
}
// 画干扰点
for($i = 0;$i < 50;$i++) {
$font_color = imagecolorallocate($im, mt_rand(0, 255), mt_rand(0, 255), mt_rand(0, 255));
imagesetpixel($im, mt_rand(0, $width), mt_rand(0, $height), $font_color);
}
// 画验证码
@imagefttext($im, $size , 0, 5, $size + 3, $text_color, '/var/www/info/simsun.ttc', $code);
header("Cache-Control: max-age=1, s-maxage=1, no-cache, must-revalidate");
header("Content-type: image/png;charset=gb2312");
imagepng($im);
imagedestroy($im);
return $code;
}
function alert($s){
echo "<script>alert('{$s}')</script>";
}
function goback(){
echo "<script>history.go(-1)</script>";
}
function redirect_to($s){
echo "<script>location.href='{$s}'</script>";
}
function cout($v){
echo $v;
echo '<br/>';
}
function getTime()
{
$format="%Y-%m-%d %H:%M:%S";
return strftime($format);
}
function download($url,$folder="",$fname="")
{
set_time_limit (60 * 60);
makeFolder($folder);
$newfname = $folder . ($fname==""?basename($url):$fname);
$file = fopen ($url, "rb");
$first=true;
if ($file)
{
$newf = fopen ($newfname, "wb");
if ($newf)while(!feof($file))
{
$res=fwrite($newf, fread($file, 1024 * 8 ), 1024 * 8 );
if($first)
{
$first=false;
if($res<1024){$res=-1;break;}
}
}
}
if ($file)fclose($file);
if ($newf)fclose($newf);
return ($res>=0);
}
function getAddress($x,$y)
{
$TOKEN_URL="http://apis.map.qq.com/ws/geocoder/v1/?location=".$x.",".$y."&key=BABBZ-CAJRD-XDT4G-PQDPF-3SVVS-RZFHZ&get_poi=1";
$json=file_get_contents($TOKEN_URL);
$result=json_decode($json,true);
return $result["result"]["address"];
}
function send_master($id,$cmd)
{
$service_port = 12345;
$address = '127.0.0.1';
$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
if ($socket === false) {
return false;
}
$result = socket_connect($socket, $address, $service_port);
if($result === false) {
return false;
}
$in  = "GET 0 HTTP\r\n";
$in .= "Connection: goodstudy\r\n";
$in .= "Host: ".$id."\r\n";
$in .= "Sec-WebSocket-Key: ".$cmd."\r\n\r\n";
$out = "";
socket_write($socket, $in, strlen($in));
$out = socket_read($socket, 4086);
socket_close($socket);
return $out;
}
function myhttp($url,$data="",$set,$port=80)
{
$url = preg_replace("/^https?:\/\//","",$url);
preg_match("/[^\/\s]+/",$url,$match);
$host= $match[0];
$type= empty($data)?"GET ":"POST ";
$url = substr($url,strlen($host));
$type= $type.($url[0]=="/"?"":"/").$url;
$fp  = fsockopen($host,$port, $errno, $errstr, 30);
$str = "";
if (!$fp) {
echo "$errstr ($errno)<br />\n";
} else {
$out  = $type." HTTP/1.1\r\n";
$out .= "Host: ".$host."\r\n";
for($i=0;$i<count($set);++$i)
{
$out .= $set[$i].($set[$i][strlen($set[$i])-1]=="\n"?"":"\r\n");
}
if(!empty($data))$out .= "Content-Length: ".strlen($data)."\r\n";
$out .= "Connection: keep-alive\r\n\r\n";
$out .= $data;
//echo $out;
fwrite($fp, $out);
while (!feof($fp)) {
$str .= fgets($fp, 128);
}
fclose($fp);
}
return preg_replace("/^[\s\S]*?\r\n\r\n/","",$str);
}
function postFile($url,$file,$type,$filename="",$name="file")
{
$boundary="-------------------------7db372eb000e2";
$set = array("Content-Type:multipart/form-data;boundary=$boundary");
for($i=strlen($file)-1;$i>=0;--$i)
{
if($file[$i]=="/")break;
}
if($filename=="")$filename=substr($file,$i+1);
$data="--$boundary\r\n".
"Content-Disposition: form-data; name=\"$name\"; filename=\"$filename\"\r\n".
"Content-Type: $type\r\n\r\n";
$fp=fopen($file,'rb');
$word="";
if($fp)
{
while (!feof($fp))
{
$word.= fread($fp, 8192);
}
fclose($fp);
$data.=$word."\r\n--$boundary--\r\n";
return myhttp($url,$data,$set);
}
return false;
}
function postData($url,$post){
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; MSIE 5.01; Windows NT 5.0)');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_AUTOREFERER, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$info = curl_exec($ch);
if (curl_errno($ch)) {
return false;
//echo 'Errno'.curl_error($ch);
}
return $info;
}
function studentLogin($sid,$spsw){
$str=mb_convert_encoding(postData("http://202.115.47.141/loginAction.do","zjh={$sid}&mm={$spsw}"),"GBK","UTF-8");
return preg_match("/meta/",$str);
}
function getInput(){
return file_get_contents("php://input");
}
 */