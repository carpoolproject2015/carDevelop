 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$id = $data['id'];
	$comment = $data['comment'];
	$rating = $data['rating'];
	$uid = $data['uid'];
	$role = $data['role'];
	
	$sql = "SELECT MAX(`wnum`) FROM `wall`";
	$result = mysql_query($sql);
	
	$max = mysql_fetch_array($result);
	$max = $max[0] + 1;
	
	$sql = "INSERT INTO `wall`(`wnum`, `wid`, `comment`, `time`, `rating`, `uid`) VALUES ('$max','$uid','$comment',CURRENT_TIMESTAMP,'$rating','$id')";	
	$result = mysql_query($sql);
	
	$sql = "SELECT AVG(`rating`) FROM `wall` WHERE `wid` = '$uid'";	
	$result = mysql_query($sql);
	$avg = mysql_fetch_array($result)[0];
	
	$sql = "UPDATE `account` SET `rating` = '$avg' WHERE `aid` = '$uid'";
	$result = mysql_query($sql);
	
	if($role == "driver")
	{
		$sql = "UPDATE `history` SET `time` = CURRENT_TIMESTAMP WHERE `did` = '$id' AND `pid` = '$uid'";
	}
	else if($role == "passenger")
	{
		$sql = "UPDATE `history` SET `time` = CURRENT_TIMESTAMP WHERE `pid` = '$id' AND `did` = '$uid'";
	}
	$result = mysql_query($sql);
?>
