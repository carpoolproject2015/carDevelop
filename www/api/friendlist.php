 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	$id = $data['id'];		
	$sql = "SELECT `friendlist` FROM `account` WHERE `aid` = '$id'";
	
	$result = mysql_query($sql);
	$i = mysql_fetch_array($result);
	
	echo'<table class="table table-hover" style="width:60%">';
	echo'  <tbody>';

	$friend = json_decode($i[0], true);
	
	$index = 0;
	while($index < sizeof($friend))
	{
		$image = '<img src="http://graph.facebook.com/'.$friend[$index]['aid'].'/picture" alt="..." class="img-circle">';
		echo'	<tr>';
		echo'	  <td><div data-toggle="modal" data-target=".bs-example-modal-lg" onclick="showFriend('.$friend[$index]['aid'].');">'.$image.'<p class="text-center">'.$friend[$index]['aid'].'</p></div></td>';
		echo'	</tr>';
		
		$index++;
	}
	echo'  </tbody>';
	echo'</table>';
?>
