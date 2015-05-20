 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$id = $data['id'];
	$comment = $data['comment'];
	$fid = $data['fid'];	
	
	$sql = "SELECT MAX(`wnum`) FROM `wall`";
	$sql = "SELECT MAX(`wnum`) FROM `wall`";
	$result = mysql_query($sql);
	$max = mysql_fetch_array($result);
	$max = $max[0] + 1;
	
	$sql = "INSERT INTO `wall`(`wnum`, `wid`, `comment`, `time`, `uid`) VALUES ('$max','$fid','$comment',CURRENT_TIMESTAMP,'$id')";
	$result = mysql_query($sql);
	
	echo "success";
?>
