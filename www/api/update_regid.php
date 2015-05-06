 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$id = $data['id'];
	$name = $data['name'];
	$phone = $data['phone'];
	$gender = $data['gender'];
	$regid = $data['regid'];
	
	if(strlen($id) > 0 && strlen($gender) > 0)
	{
		$sql = "INSERT INTO `account`(`aid`, `name`, `gender`, `phone`, `regid`, `cid`) VALUES ('$id','$name','$gender','$phone','$regid','null')";		
		$result = mysql_query($sql);
		echo $sql;
		echo("success");
	}
	else ("failed");
?>
