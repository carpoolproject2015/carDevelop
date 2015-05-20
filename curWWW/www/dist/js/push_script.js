	var pushNotification="";
            
	//確認device ready
	function onDeviceReady() {
				
		try 
		{ 
			//偵測裝置platform
			pushNotification = window.plugins.pushNotification;
			//$("#app-status-ul").append('<li>registering ' + device.platform + '</li>');
			if (device.platform == 'android' || device.platform == 'Android' ) {
				//下一行senderID修改為google api project的project number
				pushNotification.register(successHandler, errorHandler, {"senderID":"47580372845","ecb":"onNotification"});		// required!
			}
		}
		catch(err) 
		{ 
			txt="There was an error on this page.\n\n"; 
			txt+="Error description: " + err.message + "\n\n"; 
			alert(txt); 
		} 
	}
   
	function onNotification(e) {
		//裝置動作
		
		switch( e.event )
		{
			case 'registered':	//取得reg id
				break;

			case 'message':		//取得訊息

				navigator.notification.beep(2);

				//alert(e.payload.mode + ' ' + e.payload.tid + ' ' + e.pay.message);

				//passenger request driver
				if(e.payload.mode == '1')
				{
					alert("1");
					$("#dialog").modal('show');
					document.getElementById("message").innerHTML = e.payload.message;

					getName(e.payload.tid, "name");

					document.getElementById("image").src = "http://graph.facebook.com/" + e.payload.tid + "/picture?type=large";

					//driver get passenger's id
					tid = e.payload.tid;
				}
				else if(e.payload.mode == '2')
				{
					alert("2");
					$("#dialog").modal('show');
					document.getElementById("message").innerHTML = e.payload.message;
					getName(e.payload.tid, "name");

					document.getElementById("image").src = "http://graph.facebook.com/" + e.payload.tid + "/picture?type=large";

					//passenger get driver's id
					tid = e.payload.tid;
				}
				else if(e.payload.mode == '3')
				{
					alert(e.payload.message);
					//document.getElementById("content").style.display = "";
					window.location = local + 'initialize.html?data={"id":"' + id + '"}'
				}
				else if(e.payload.mode == '4')
				{
					//driver get passenger's id
					tid = e.payload.tid;

					alert('4');
					$("#dialog").modal('show');
					document.getElementById("message").innerHTML = e.payload.message;
					getName(e.payload.tid, "name");

					document.getElementById("image").src = "http://graph.facebook.com/" + e.payload.tid + "/picture?type=large";
				}

			break;
			
			case 'error':
				alert('<li>ERROR -> MSG:' + e.msg + '</li>');		//錯誤訊息
			break;
			
			default:
				alert('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
			break;
		}
	}
   
	function successHandler (result) {
		
	}
	
	function errorHandler (error) {
		
	}
	
	function getName(data, mode)
	{
		var url = server + 'get_name.php?data={"id":"' + data + '"}';			
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", url, true);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");		
		xmlhttp.onreadystatechange = function() 
		{
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200) 
			{			
				document.getElementById(mode).innerHTML = xmlhttp.responseText;
			}
		}
		xmlhttp.send();
	}
	
	document.addEventListener('deviceready', onDeviceReady, true);
			