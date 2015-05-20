 <?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	
	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();
	
	$data = $_GET['data'];
	$data = json_decode($data, true);
	
	$id = $data['id'];
		
	$sql = "SELECT * FROM `wall` WHERE `wid` = '$id' ORDER BY `wnum` DESC";	
	$result = mysql_query($sql);
	
	$index = 0;
	while($index < 10 && $i = mysql_fetch_array($result))
	{		
		$image = '<img src="http://graph.facebook.com/'.$i['uid'].'/picture" alt="..." class="img-circle">';
		//friend name
		$ssql = "SELECT `name` FROM `account` WHERE `aid` = ".$i['uid'];	
		$rresult = mysql_query($ssql);		
		$j = mysql_fetch_array($rresult);
		$name = $j[0];
		
		if($index % 2 == 0)
		{
			echo '<li>';
		}
		else
		{
			echo '<li class="timeline-inverted">';
		}
		echo '	<div class="timeline-badge"><i class="glyphicon glyphicon-check"></i></div>';
		echo '	<div class="timeline-panel">';
		echo '	<div class="timeline-heading">';
		echo '	<h4 class="timeline-title">'.$image.$name.'</h4>';
		echo '	<p><small class="text-muted"><i class="glyphicon glyphicon-time"></i>'.$i['time'].'</small></p>';
		echo '	</div>';
		echo '	<div class="timeline-body">';
		if($i['rating'] != null)
		{
			for($k = 0; $k < $i['rating']; $k++)
			{
				echo '<span class="glyphicon glyphicon-star" aria-hidden="true"></span>';
			}
		}
		echo '	<p>'.$i['comment'].'</p>';
		echo '	</div>';
		echo '	</div>';
		echo '</li>';
		$index++;
	}
?>
