 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$ids = $data['ids'];
	$n = count($ids);
	//var_dump($ids);
	$nows = array();
	for($i = 0; $i < $n; $i++){
		$id = $ids[$i]['id'];
		//echo $id;
		$sql = "SELECT `curpoint` FROM `receiver` WHERE `aid` = '$id'";
		$result = mysql_query($sql);
		$num = mysql_num_rows($result);
		//echo $num;
		if($num == 1){
			$res = mysql_fetch_array($result);
			array_push($nows,$res[0]);
		}		
	}
	//var_dump($nows);
	echo json_encode($nows);
?>
