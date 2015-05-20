 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");

	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();

	$data = $_GET['data'];
	$data = json_decode($data, true);

	$array = $data['array'];

	$index = 0;

	$str = "[";
	while($index < sizeof($array))
	{
		$id = $array[$index]['id'];
		$sql = "SELECT `account`.`name`,`requester`.`carpoolpath`, `requester`.`start`, `requester`.`end` FROM `requester`,`account` WHERE `account`.`aid` = '$id'";
		$result = mysql_query($sql);

		$i = mysql_fetch_array($result);
		$str .= '{"name":"'.$i['name'].'","start":'.$i['start'].',"end":'.$i['end'].',"carpoolpath":'.$i['carpoolpath'].'}';
		if($index != sizeof($array) - 1)
			$str .= ',';

		$index++;
	}
	$str .= "]";
	echo $str;
?>
