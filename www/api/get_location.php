 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$role = $data['role'];
	$array = $data['array'];
	
	$str = "[";
	
	//driver
	if($role == "driver")
	{	
		$index = 0;		
		while($index < sizeof($array))
		{
			$id = $array[$index]['id'];
			$sql = "SELECT `curpoint` FROM `requester` WHERE `aid` = '$id'";
			$result = mysql_query($sql);
			
			$i = mysql_fetch_array($result);
			
			$str .= $i['curpoint'];
			
			if($index != sizeof($array) - 1)
				$str .= ',';
			
			$index++;
		}	
	}
	else if($role == "passenger")
	{
		$id = $array[0]['id'];
		$sql = "SELECT `curpoint` FROM `receiver` WHERE `aid` = '$id'";
		$result = mysql_query($sql);
		
		$i = mysql_fetch_array($result);
		
		$str .= $i['curpoint'];
	}
	$str .= ']';
	echo $str;
?>
