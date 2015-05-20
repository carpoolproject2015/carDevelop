 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");

	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();

	$data = $_GET['data'];
	$data = json_decode($data, true);

	$id = $data['id'];
	$curpoint = $data['curpoint'][0];

	$curpoint = json_encode($curpoint, true);
	echo $curpoint;

	$sql = "SELECT `aid` FROM `receiver` WHERE `aid` = '$id'";
	$result = mysql_query($sql);
	$num = mysql_num_rows($result);

	//reciever
	if($num > 0)
	{
		$sql = "UPDATE `receiver` SET `curpoint`= '$curpoint' WHERE `aid` = '$id'";
		$result = mysql_query($sql);
	}
	else
	{
		$sql = "UPDATE `requester` SET `curpoint`= '$curpoint' WHERE `aid` = '$id'";
		$result = mysql_query($sql);
	}
?>
