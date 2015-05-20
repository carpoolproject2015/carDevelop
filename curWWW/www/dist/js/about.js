$(document).ready(function() {
	url = window.location.toString();
	initialize();
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
}

function setURL()
{
	var temp = '?data={"id":"' + id + '"}';

	$('#wall').attr('href', local + 'wall.html' + temp);
	$('#friendlist').attr('href', local + 'friendlist.html' + temp);
	$('#about').attr('href', local + 'about.html' + temp);
	$('#setting').attr('href', local + 'setting.html' + temp);
	$('#logo').attr('href', local + 'index.html' + temp);
}
function nextStep()
{
	window.location = local + 'index.html?data=' + '{"id":"' + id + '"}';
}