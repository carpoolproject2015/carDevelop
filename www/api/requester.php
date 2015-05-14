 <?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset=UTF-8');
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$id = $data['id'];
	$condition = $data['condition'];
	$threshold = $condition[0]['rating'];
	$start = '{"latitude":"'.$data['start']['latitude'].'","longitude":"'.$data['start']['longitude'].'"}';
	$end = '{"latitude":"'.$data['end']['latitude'].'","longitude":"'.$data['end']['longitude'].'"}';
	
	//echo ($data['start']['latitude']);
	$path = $data['path'];
	//echo json_encode($path);
	//driver
	$sql = "SELECT `aid` FROM `requester` WHERE `aid` = '$id'";
	$result = mysql_query($sql);
	$num = mysql_num_rows($result);
	//echo $num;
	if($num == 1){
		if(sizeof($path) > 2)	
		{			
			$path = json_encode($path);
			$sql = "UPDATE `requester` SET `path` = '$path', `start`='$start', `end`='$end', `threshold`='$threshold' WHERE `aid` = '$id'";
			$result = mysql_query($sql);
			echo "success";
		}
	}
	else{
		if(sizeof($path) > 2)	
		{
			$path = json_encode($path);
			$sql = "INSERT INTO `requester`(`aid`, `path`, `start`, `end`, `curpoint`, `time`, `threshold`, `carpoolpath`) VALUES ('$id', '$path', '$start', '$end', '$start', CURRENT_TIMESTAMP, '$threshold', '')";
			$result = mysql_query($sql);
			echo "success";
		}
	}
?>
