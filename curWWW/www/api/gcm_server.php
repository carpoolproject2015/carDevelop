<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");

	require_once '../config//db_connect.php';
	$db = new DB_CONNECT();


	$data = $_GET['data'];
	$data = json_decode($data, true);

	$id = $data['id'];
	$tid = $data['tid'];
	$mode = $data['mode'];

	$sql = "SELECT `regid` FROM `account` WHERE `aid` = '$tid'";
	$result = mysql_query($sql);
	$i = mysql_fetch_array($result);
	$regid = $i[0];

	//乘客選擇後，傳送訊息給司機，讓司機確認
	if($mode == "1")
	{
		$data = array('message' => '向您發出的共乘邀請',
					  'tid' => $id,
					  'mode' => '1');
	}
	else if($mode == "2")
	{
		$data = array('message' => '接受您的邀請',
					  'tid' => $id,
					  'mode' => '2');
	}
	else if($mode == "3")
	{
		$data = array('message' => '非常抱歉, 對方拒絕您的邀請',
					  'mode' => '3');
	}
	else if($mode == "4")
	{
		$data = array('message' => '配對成功 開始互相追蹤',
					  'tid' => $id,
					  'mode' => '4');
	}

	$ids = array();
	array_push($ids, $regid);

	sendGoogleCloudMessage( $data, $ids );


	function sendGoogleCloudMessage( $data, $ids )
	{
		$apiKey = 'AIzaSyAyXDQ5qH6PdwqfCLkAKDivEA5inEO7wXo';	//google api server key

		$url = 'https://android.googleapis.com/gcm/send';

		$post = array(
						'registration_ids'  => $ids,
						'data'              => $data,
						);

		$headers = array(
							'Authorization: key=' . $apiKey,
							'Content-Type: application/json'
						);

		//------------------------------
		// Initialize curl handle
		//------------------------------

		$ch = curl_init();

		//------------------------------
		// Set URL to GCM endpoint
		//------------------------------

		curl_setopt( $ch, CURLOPT_URL, $url );

		//------------------------------
		// Set request method to POST
		//------------------------------

		curl_setopt( $ch, CURLOPT_POST, true );

		//------------------------------
		// Set our custom headers
		//------------------------------

		curl_setopt( $ch, CURLOPT_HTTPHEADER, $headers );

		//------------------------------
		// Get the response back as
		// string instead of printing it
		//------------------------------

		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

		//------------------------------
		// Set post data as JSON
		//------------------------------

		curl_setopt( $ch, CURLOPT_POSTFIELDS, json_encode( $post ) );

		//------------------------------
		// Actually send the push!
		//------------------------------

		$result = curl_exec( $ch );

		//------------------------------
		// Error? Display it!
		//------------------------------

		if ( curl_errno( $ch ) )
		{
			echo 'GCM error: ' . curl_error( $ch );
		}

		//------------------------------
		// Close curl handle
		//------------------------------

		curl_close( $ch );

		//------------------------------
		// Debug GCM response
		//------------------------------

		echo $result;	//傳送訊息的結果
	}
?>
