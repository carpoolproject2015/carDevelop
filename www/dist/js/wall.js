$(document).ready(function() {
	url = window.location.toString();
	initialize();
});

$('#next').click(function() {
	nextStep();
});

var url = "";
var id = "";	

var server = "http://noname0930.no-ip.org/carpool/api/";
var local = "file:///android_asset/www/";			
			
function initialize()
{
	var str = url.substring(url.indexOf("{"), url.length);
	var json = JSON.parse(decodeURIComponent(str));
	id = json.id;
	
	setURL();
	
	requestAPI(server + "get_name.php", decodeURIComponent(str), "name");
	requestAPI(server + "wall.php", decodeURIComponent(str), "timeline");
}

function setURL()
{
	var temp = '?data={"id":"' + id + '"}';

	$('#wall').attr('href', local + 'wall.html' + temp);
	$('#friendlist').attr('href', local + 'friendlist.html' + temp);
	$('#about').attr('href', local + 'about.html' + temp);
	$('#setting').attr('href', local + 'setting.html' + temp);
	$('#logo').attr('href', local + 'index.html' + temp);
	
	$('#image').attr('src', 'http://graph.facebook.com/' + id + '/picture');
}
function nextStep()
{
	window.location = local + 'index.html?data=' + '{"id":"' + id + '"}';
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