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

		
		/*$count = 0;
		for($i=0; $i < $driver_num; $i++){
			if(getRating($resarr[$i]) >= $threshold){
				$result1[$count] = $resarr[$i];
				$count++;
			}
		}*/
		//篩選司機評價門檻
		
		$resarr = array();
		$count = 0;
		for($i=0; $i < $driver_num; $i++){	
			$res = mysql_result($result,$i);
			if(getDriverThreshold($res) <= getRating($id)){//乘客評價符合司機門檻
				$resarr[$count] = $res;
				$count++;
			}
		}
		//$resarr = array_values($resarr);//重整陣列
		
		$sql = "SELECT `path` FROM `requester` WHERE `aid` = '$id'";
		$result = mysql_query($sql);
		$temp = mysql_fetch_array($result);
		$p1 =  $temp[0];//取得乘客路徑
		
		//開始路徑比對
		//$count = count($resarr);
		$p2 = array();
		for($i=0; $i < $count; $i++){
			$res = $resarr[$i];
			$sql = "SELECT `path` FROM `receiver` WHERE `aid` = '$res'";
			$result = mysql_query($sql);
			$temp = mysql_fetch_array($result);
			$p2[$i] =  $temp[0];//取得司機路徑
		}
		//array_push($p2,$p1);//將乘客路徑放在最後一個
		echo json_encode($p2);

	//}
?>


