$(document).ready(function() {
	url = window.location.toString();
	initialize();
});

$('#next').click(function() {
	nextStep();
});

$('#submit').click(function() {
	sendGCM();
});

var url = "";
var id = "";
var did = "";

var json = "";

var server = "http://noname0930.no-ip.org/carpool/api/";
var local = "file:///android_asset/www/";			

function initialize()
{
	var str = url.substring(url.indexOf("{"), url.length);
	json = JSON.parse(decodeURIComponent(str));				
	id = json.id;
	
	var result = json.result;	
	var temp = json.result[0].did;
	
	result = JSON.stringify(result);
	json = decodeURIComponent(str);
	
	//set Table
	requestAPI(server + "result.php", json, "table");
	
	setURL();
}

function setURL()
{
	var temp = '?data={"id":"' + id + '"}';

	$('#wall').attr('href', local + 'wall.html' + temp);
	$('#friendlist').attr('href', local + 'friendlist.html' + temp);
	$('#about').attr('href', local + 'about.html' + temp);
	$('#setting').attr('href', local + 'setting.html' + temp);
	$('#logo').attr('href', local + 'index.html' + temp);

	//document.getElementById("image").src = 'http://graph.facebook.com/' + id + '/picture';
}

function nextStep()
{
	window.location = local + 'initialize.html?data=' + '{"id":"' + id + '"}';
}
function requestAPI(url, data, mode)
{
	var xmlhttp = new XMLHttpRequest();			
	url += "?data=" + data;
	xmlhttp.onreadystatechange = function() 
	{
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
		{
			document.getElementById(mode).innerHTML = xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();			
}

function setDialog(value)
{	
	$('#dialog_image').attr('src', 'http://graph.facebook.com/' + value + '/picture');

	requestAPI(server + "get_name.php", '{"id":"' + value + '"}', "dialog_name");
	requestAPI(server + "get_rating.php", '{"id":"' + value + '"}', "dialog_rating");
	
	did = value;
}

function sendGCM()
{
	var xmlhttp = new XMLHttpRequest();			
	url = server + 'gcm_server.php?data={"id":"' + id + '","tid":"' + did + '","mode":"1"}';
	xmlhttp.onreadystatechange = function() 
	{
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
		{
			alert(xmlhttp.responseText);
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
	
	window.location = local + 'waiting.html?data={"id":"' + id + '"}';
}