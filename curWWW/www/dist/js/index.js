$(document).ready(function() {
	url = window.location.toString();
	
	if(url.indexOf("data") > 0)
		initialize();
});

$('#login').click(function() {
	loginFacebook();
});

$('#next').click(function() {
	nextStep();
});

$('#submit').click(function() {
	registerCarpool();
});

$('#jump').click(function() {
	window.location = local + 'waiting.html?data={"id":"' + id + '"}';
});



//global variable		
var url = "";

var id = "";
var name = "";
var gender = "";			

var server = "http://noname0930.no-ip.org/carpool/api/";
var local = "file:///android_asset/www/";

var pushNotification = "";
var regid = "";

function initialize()
{
	var str = url.substring(url.indexOf("{"), url.length);
	var json = JSON.parse(decodeURIComponent(str));
	
	id = json.id;
	
	$('#login').attr('style', 'display:none');

	getName();	
	setURL();
	
	//all clear
	$('#login').attr('disabled', false);
	$('#next').attr('disabled', false);
}

function getName()
{
	var url = server + 'get_name.php?data={"id":"' + id + '"}';			
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");		
	xmlhttp.onreadystatechange = function() 
	{
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) 
		{			
			name = xmlhttp.responseText;
			$('#name').html('Hi, ' + xmlhttp.responseText);		
		}
	}
	xmlhttp.send();
}

function setURL()
{
	var temp = '?data={"id":"' + id + '"}';
	
	$('#state').html('已註冊');			
	$('#wall').attr('href', local + 'wall.html' + temp);
	$('#friendlist').attr('href', local + 'friendlist.html' + temp);
	$('#about').attr('href', local + 'about.html' + temp);
	$('#setting').attr('href', local + 'setting.html' + temp);
	$('#logo').attr('href', local + 'index.html' + temp);
	$('#image').attr('src', 'http://graph.facebook.com/' + id + '/picture?type=large');	
}

function setInfo(response)
{
	id = response.id;
	name = response.name;
	gender = response.gender;
	
	if(name.length > 0)
		checkCarpool();
}

function checkCarpool()
{
	var url = server + 'check.php?data={"id":"' + id + '"}';
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");		
	xmlhttp.onreadystatechange = function() 
	{
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) 
		{
			//registed
			if(xmlhttp.responseText.trim() === "success")
				window.location = local + 'index.html?data={"id":"' + id + '"}';
			else
			{
				$('#register_button').attr('style', 'display:');
				$('#state').html('尚未註冊');
				$('#name').html('Hi, ' + name);
				$('#dialog_name').html(name);
				$('#image').attr('src', 'http://graph.facebook.com/' + id + '/picture?type=large');	
				$('#dialog_image').attr('src', 'http://graph.facebook.com/' + id + '/picture?type=large');	
			}
		}
	}
	xmlhttp.send();
}

function registerCarpool()
{
	//get input
	var phone = $('#phone').val();
	
	if(phone.length < 10)
	{
		$('#register_state').html('手機格式錯誤');
	}
	else
	{
		var data = [];
		data.push({'id': id, 'name': name, 'gender': gender, 'phone': phone, 'regid': regid});	
		data = JSON.stringify(data);
		data = data.substring(1, data.length - 1);
		var url = server + 'register.php?data=' + data;
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", url, true);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");		
		xmlhttp.onreadystatechange = function() 
		{		 
			{
				//registed
				if(xmlhttp.responseText.trim() === "success")
				{
					var temp = [];
					temp.push({'id': id});
					var data = JSON.stringify(temp);
					data = data.substring(1, data.length - 1);
					window.location = (local + 'index.html?data=' + data);
				}
				else
				{
					$('#register_state').html(xmlhttp.responseText);
				}
			}
		}
		xmlhttp.send();
	}				
}


function nextStep()
{
	var temp = [];
	temp.push({'id': id});	
	var data = JSON.stringify(temp);
	data = data.substring(1, data.length - 1);
	window.location = local + 'initialization.html?data=' + data;	
}

//facebook api
var loginFacebook = function () 
{
	facebookConnectPlugin.login( ["email"],
		function (response) { apiTest() },
		function (response) { alert(JSON.stringify(response)) });
}
var apiTest = function () { 
	facebookConnectPlugin.api( "me/?fields=id,name,gender", ["user_birthday"],
		function (response) { setInfo(response); },
		function (response) { alert(JSON.stringify(response)) }); 
}
var logout = function () { 
	facebookConnectPlugin.logout( 
		function (response) { alert(JSON.stringify(response)) },
		function (response) { alert(JSON.stringify(response)) });
}		

//確認device ready
function onDeviceReady() 
{       		
	try 
	{ 
		//偵測裝置platform
		pushNotification = window.plugins.pushNotification;
		if (device.platform == 'android' || device.platform == 'Android' ) {
			//下一行senderID修改為google api project的project number
			pushNotification.register(successHandler, errorHandler, {"senderID":"47580372845","ecb":"onNotification"});
		}
	}
	catch(err) 
	{ 
		txt="There was an error on this page.\n\n"; 
		txt+="Error description: " + err.message + "\n\n"; 
	} 			
}

function onNotification(e) 
{
	//裝置動作                
	switch( e.event )
	{
		case 'registered':	//取得reg id
		if ( e.regid.length > 0 )
		{
			// Your GCM push server needs to know the regID before it can push to this device
			// here is where you might want to send it the regID for later use.
			regid = e.regid;
		}
		break;              
		case 'message':		//取得訊息
			// if this flag is set, this notification happened while we were in the foreground.
			// you might want to play a sound to get the user's attention, throw up a dialog, etc.
			if (e.foreground)		//當裝置開啟時接收訊息
			{				
				// if the notification contains a soundname, play it.
				// playing a sound also requires the org.apache.cordova.media plugin
				var my_media = new Media("/android_asset/www/" + e.soundname);
				my_media.play();
			}
			else
			{	// otherwise we were launched because the user touched a notification in the notification tray.
				if (e.coldstart)		//當裝置未開啟時接收訊息
					$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
				else					//當裝置再背景作業時接收訊息
				$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
			}	
			alert("message = " + e.payload.message);		//顯示message
		break;     
		case 'error':
			alert("error = " + e.msg);		//錯誤訊息
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
document.addEventListener('deviceready', onDeviceReady, true);