 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$id = $data['id'];
	$role = $data['role'];
	
	//reciever
	if($role == "driver")
	{
		$sql = "SELECT `pid` FROM `history` WHERE `did` = '$id' AND `time` = '0000-00-00 00:00:00'";

	}
	else if($role == "passenger")
	{
		$sql = "SELECT `did` FROM `history` WHERE `pid` = '$id' AND `time` = '0000-00-00 00:00:00'";
	}

	$arr = array();
	$result = mysql_query($sql);
	
	while ($i = mysql_fetch_array($result))
	{
		$temp['id'] = $i[0];
		array_push($arr,$temp);
	}
	
	echo json_encode($arr, true);
?>
