 <?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset=UTF-8');
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$id = $data['id'];
	$condition = $data['condition'];
	$seat = $condition[0]['seat'];
	$threshold = $condition[0]['rating'];
	$waiting = $condition[0]['waiting'];
	
	$sql = "SELECT `aid` FROM `receiver` WHERE `aid` = '$id'";
	$result = mysql_query($sql);
	$num = mysql_num_rows($result);
	
	if($num > 0)
	{
		$sql = "UPDATE INTO `receiver`(`aid`, `path`, `seat`, `time`, `threshold`, `waiting`) VALUES ('$id','$path','$seat', CURRENT_TIMESTAMP, '$threshold', '$waiting')";
		$result = mysql_query($sql);
	}
	else
	{
		$path = $data['path'];
		//driver
		if(sizeof($path) > 2)	
		{			
			$path = json_encode($path);
			$sql = "INSERT INTO `receiver`(`aid`, `path`, `seat`, `time`, `threshold`, `waiting`) VALUES ('$id','$path','$seat', CURRENT_TIMESTAMP, '$threshold', '$waiting')";
			$result = mysql_query($sql);
		}
	}	
	/*
	$id = $data['id'];
	$phone = $data['phone'];
	$gender = $data['gender'];
	$name = $data['name'];
	
	if(strlen($id) > 0 && strlen($gender) > 0)
	{
		$sql = 'SELECT `aid` FROM `account` WHERE `aid` = '$id'';
		
		$result = mysql_query($sql);
		$num = mysql_num_rows($result);

		if($num > 0)
			echo('failed');
		else
		{
			$sql = 'INSERT INTO `account`(`aid`, `name`, `gender`, `phone`, `cid`) VALUES ('$id','$name','$gender','$phone','null')';		
			$result = mysql_query($sql);
			
			echo('success');
		}
	}
	else ('failed');
	*/
?>
