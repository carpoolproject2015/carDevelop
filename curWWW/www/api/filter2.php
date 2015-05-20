<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$id = $data['id'];
	$condition = $data['condition'];
	//$selection = $data['role'];
	$threshold = $condition[0]['rating'];
		
	function getRating($fid){//取個人評價
		$sql = "SELECT `rating` FROM `account` WHERE `aid` = '$fid'";
		$result = mysql_query($sql);
		$i = mysql_fetch_array($result);
		return $i[0];
	}
	
	function getDriverThreshold($fid){//取司機門檻
		$sql = "SELECT `threshold` FROM `receiver` WHERE `aid` = '$fid'";
		$result = mysql_query($sql);
		$i = mysql_fetch_array($result);
		return $i[0];
	}
	
	//if($selection === 'passenger'){//requester
		$sql = "SELECT `receiver`.`aid` FROM `receiver`,`account` WHERE `account`.`rating` >= '$threshold' and `account`.`aid`=`receiver`.`aid` and `seat` != '0'";//篩選乘客評價門檻
		$result = mysql_query($sql);//司機評價符合乘客門檻
		$driver_num = mysql_num_rows($result);
		
		$resarr = array();
		$count = 0;
		for($i=0; $i < $driver_num; $i++){	
			$res = mysql_result($result,$i);
			if(getDriverThreshold($res) <= getRating($id)){//乘客評價符合司機門檻
				$resarr[$count] = $res;
				$count++;
			}
		}
		echo json_encode($resarr);

	//}
?>


