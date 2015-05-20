 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$id = $data['id'];
	$result = $data['result'];
	
	echo '<thead>';
	echo '	<tr>';
	echo '		<th>司機姓名</th>';
	echo '		<th>共乘率</th>';
	echo '		<th>上車點距離</th>';
	echo '		<th>下車點距離</th>';
	echo '		<th>等待時間</th>';
	echo '	</tr>';
	echo '</thead>';
	echo '<tbody>';
	
	usort($result, 'sort_by_percentage');
	
	$index = 0;
	while($index < sizeof($result))
	{
		$did = $result[$index]['did'];
		$percentage = $result[$index]['percentage'];
		$on_d = $result[$index]['on_d'];
		$off_d = $result[$index]['off_d'];
		$wait = $result[$index]['wait'];
		
		//get name;
		$sql = "SELECT `name` FROM `account` WHERE `aid` = '$did'";	
		$rresult = mysql_query($sql);
		$name = mysql_fetch_array($rresult);
		$name = $name[0];	
		
		echo '<tr data-toggle="modal" data-target=".bs-example-modal-sm" onclick="setDialog('.$did.');">';
		echo '	<td>'.$name.'</td>';
		echo '	<td>'.ceil(substr($percentage, 0, 2)).'%</td>';
		echo '	<td>'.$on_d.'公尺</td>';
		echo '	<td>'.$off_d.'公尺</td>';
		echo '	<td>'.round(($wait/60),0).'分鐘</td>';
		echo '</tr>';
		
		$index++;
	}
	
	echo '</tbody>';
	
	function sort_by_percentage($a, $b)
	{
		if($b['percentage'] - $a['percentage'] != 0)
		{
			return $b['percentage'] - $a['percentage'];
		}
		else
		{
			if($a['on_d'] - $b['on_d'] != 0)
				return $a['on_d'] - $b['on_d'];
			else
			{
				if($a['off_d'] - $b['off_d'] != 0)
					return $a['off_d'] - $b['off_d'];
				else 
				{
					if($a['wait'] - $b['wait'] != 0)
						return $a['wait'] - $b['wait'];
				}
			}
		}
	}
?>
