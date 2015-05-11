$(document).ready(function() {
    url = window.location.toString();
    initialize();
});

$('#accept').click(function() {
    var value = $('#accept').val();
    confirmCarpool(value);
});

$('#reject').click(function() {
    cancelCarpool();
});

var url = "";
var id = "";
var tid = "";
var json = "";

var server = "http://noname0930.no-ip.org/carpool/api/";
var local = "file:///android_asset/www/";

function initialize() {
    var str = url.substring(url.indexOf("{"), url.length);
    json = JSON.parse(decodeURIComponent(str));
    id = json.id;
    json = decodeURIComponent(str);
    setURL();
}

function setURL() {
    var temp = '?data={"id":"' + id + '"}';

    $('#wall').attr('href', local + 'wall.html' + temp);
    $('#friendlist').attr('href', local + 'friendlist.html' + temp);
    $('#about').attr('href', local + 'about.html' + temp);
    $('#setting').attr('href', local + 'setting.html' + temp);
    $('#logo').attr('href', local + 'index.html' + temp);
}

function confirmCarpool() {
    var data = json.substring(0, json.length - 1) + ',"tid":"' + tid + '","mode":"4"}';
    var xmlhttp = new XMLHttpRequest();
    url = server + 'gcm_server.php?data=' + data;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            window.location = local + 'trace.html';
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function cancelCarpool() {
    window.location = local + 'initialize.html?data={"id":"' + id + '"}';
}
