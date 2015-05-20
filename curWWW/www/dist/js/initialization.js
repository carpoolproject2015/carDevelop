$(document).ready(function() {
	url = window.location.toString();
	initialize();
});

$('#0').click(function() {
	roleSelection(0);
});

$('#1').click(function() {
	roleSelection(1);
});

$('#next').click(function() {
	nextStep();
});

var url = "";
var id = "";
var role = "";

var server = "http://noname0930.no-ip.org/cidpool/api/";
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
function roleSelection(value)
{
	$('#content').attr('style', 'display:');
	if(value == "0")
	{
		$('#passenger').attr('style', 'display:');
		$('#driver').attr('style', 'display:none');
		
		role = 'passenger';
	}
	else if(value == "1")
	{
		$('#passenger').attr('style', 'display:none');
		$('#driver').attr('style', 'display:');
		
		role = 'driver';
	}
	$('#next').attr('disabled', false);
}
function getInput()
{
	var rating = $('#rating').val();
	var time = $('#time').val();
	var percentage = $('#percentage').val();

	var json = '"condition":[' + '{';
	
	json += '"rating":"' + rating + '",'; 		
	json += '"waiting":"' + time + '",';

	//selected passenger
	if(role == 'passenger')
	{			
		json += '"percentage":"' + percentage + '",';			
		json = '"role":"passenger",' + json;
		
		var distance = $('#distance').val();
		json += '"distance":"' + distance; 	
	}
	else if(role == 'driver')
	{
		json = '"role":"driver",' + json;
		
		
		var cid = $('#cid').val();
		var seat = $('#seat').val();
		
		json += '"cid":"' + cid + '",'; 		
		json += '"seat":"' + seat; 									
	}
	return json +'"}]';
}
function nextStep()
{		
	if($('#passenger').css('display') == "")
		updateCar();

	var json = '{"id":"' + id + '",' + getInput() + '}';
	alert(json);
	window.location = local + 'path.html?data=' + json;
}

function updateCar()
{
	var cid = $('#cid').val();
	
	var url = server + 'update_cid.php?data={"id":"' + id + '","cid":"' + cid + '"}';
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");		
	xmlhttp.onreadystatechange = function() 
	{
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) 
		{
			alert("success");
		}
	}
	xmlhttp.send();
}