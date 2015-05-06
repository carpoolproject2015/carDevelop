$(document).ready(function() {
	url = window.location.toString();
	initialize();
});

$('#next').click(function () {
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

	requestAPI(server + "get_name.php", str, "name");
	requestAPI(server + "friendlist.php", str, "table");
	
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
	
	$('#image').attr('src', 'http://graph.facebook.com/' + id + '/picture');
}
function nextStep()
{
	if($('#my_wall').css('disaplay') == "none")
	{
		$('#my_wall').attr('style', 'display:');
		$('#friend_wall').attr('style', 'display:none');
	}
	else
		window.location = local + 'index.html?data=' + '{"id":"' + id + '"}';
}
function requestAPI(url, data, id)
{
	var xmlhttp = new XMLHttpRequest();			
	url += "?data=" + data;
	xmlhttp.onreadystatechange = function() 
	{
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
		{
			document.getElementById(id).innerHTML = xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();			
}
function showFriend(fid)
{
	$('#my_wall').attr('style', 'display:none');
	$('#friend_wall').attr('style', 'display:');	
	$('#dialog_image').attr('src', 'http://graph.facebook.com/' + fid + '/picture');

	requestAPI(server + "get_name.php", '{"id":"' + fid + '"}', "dialog_name");
	requestAPI(server + "friend_wall.php", '{"id":"' + fid + '"}', "friend_wall");
}

function submitComment(fid)
{
	var comment = $('#comment').val();
	var data = '{"id":"' + id + '","fid":"' + fid + '","comment":"' + comment + '"}';
	requestAPI(server + 'add_wall.php', data, "state");
	requestAPI(server + "friend_wall.php", '{"id":"' + fid + '"}', "friend_wall");
}

function setDialog(fid)
{	
	$('#submit').val(fid);
}