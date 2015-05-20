 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$id = $data['id'];
	$cid = $data['cid'];
	
	$sql = "UPDATE `account` SET `cid`= '$cid' WHERE `aid` = '$id'";
	$result = mysql_query($sql);
?>
