 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	$id = $data['id'];
	$carpool = $data['carpool'];
	//var_dump ($carpool);
	//$carpool = json_decode($carpool);
	//echo implode (",", $carpool[0]);;
	//var_dump($carpool);
	$carstr = "[";
	$nn = count($carpool);
	for($i = 0; $i < $nn; $i++){
		$n = count($carpool[$i]);
		$carstr = $carstr."[";
		for($j = 0; $j < $n; $j++){
			if($j != $n - 1)
				$carstr = $carstr.'{"at":'.$carpool[$i][$j]["at"].',"ng":'.$carpool[$i][$j]["ng"].'},';
			else
				$carstr = $carstr.'{"at":'.$carpool[$i][$j]["at"].',"ng":'.$carpool[$i][$j]["ng"].'}]';
		}
		if($i != $nn-1)
			$carstr = $carstr.",";
	}
	$carstr = $carstr.']';
	//echo $carstr;
	
	if(strlen($id) > 0)
	{
		$sql = "SELECT `carpoolpath` FROM `requester` WHERE `aid` = '$id'";
		$result = mysql_query($sql);
		$num = mysql_num_rows($result);

		if($num > 1)
			echo("failed");
		else
		{
			$ii = mysql_fetch_array($result);
			//echo $carpool;
			$sql = "UPDATE `requester` SET `carpoolpath` = '$carstr' WHERE `aid` = '$id'";	//§ó·srequester
			$result = mysql_query($sql);
			
			echo("success");
		}
	}
	else ("failed");
?>
