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
	
	$ssql = "SELECT `name` FROM `account` WHERE `aid` = ".$id;	
	$rresult = mysql_query($ssql);		
	$j = mysql_fetch_array($rresult);
	$name = $j[0];	
	
	echo '<div class="page-header">';
	echo '	<ul class="list-inline">';
	echo '		<li><img id="image" src="http://graph.facebook.com/'.$id.'/picture" alt="..." class="img-circle"></li>';
	echo '		<li><h3 id="name">'.$name.'</h3></li>';
	echo '		<li><h1><small><span class="label label-default">動態牆</span></small></h1></li>';
	echo '		<li><button data-toggle="modal" data-target=".bs-example-modal-sm" style="margin:right" type="button" class="btn btn-warning" onclick="setDialog('.$id.')">留言</button></li>';
	echo '	</ul>';
	echo '</div>';
	echo '<ul class="timeline" id="timeline" style="z-index:0">';
	
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
	echo '</ul>';
?>
