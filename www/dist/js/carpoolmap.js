$(document).ready(function() {
    Initialize();

    $('.toggle-menu').jPushMenu();

    //resize window
    $(window).bind('resize', resizeScreen);

    $('#btnBoundEP').click(function() {
        SetMarkerStatus(2);
    });
	
    //cal path
    $('#btnPathCal').click(function() {
        if (StartPoint && EndPoint)
            calRoute();
        else {
            alert("偵測不到目前位置，請確認是否開啟GPS或在空曠的地方");
        }
    });

    //btn path compare
    $('#next').click(function() {
        if (pathJSON != null && PathLength != null)
        	nextStep(pathJSON, PathLength);
        else {
            alert("尚未選取路線");
        }
    });

    //click set marker event
    google.maps.event.addListener(map, 'click', function(event) {
        SetMarkerForMap(event.latLng);
    });
});

//global variables
var map;
var directionsRender = null;

var StartPoint = null;
var StartPointMarker = null;
var StartPointStatus = false;

var EndPoint = null;
var EndPointMarker = null;
var EndPointStatus = false;

var CurrentSelectedMarkerType = null;

//calculate route
var PathDirectionRender = null;
var PathDirectionsService = null;
var PathDotsMarkers = [];
var PathDots = [];
var PathLength = null;
var pathJSON = null;

function Initialize() {
    //set map block size
    resizeScreen();

    //get user current position
    GetUserCurrentPos();

    //initail map
    directionsRender = new google.maps.DirectionsRenderer();

    //set map options
    var mapOptions = {
        zoom: 18,
        center: new google.maps.LatLng(22.975228, 120.218398)
    };

    //set map
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    //directions set map
    directionsRender.setMap(map);
}

function updateLocation(id, latitude, longitude)
{
	var data = '{"id":"' + id + '","curpoint":[{"latitude":"' + latitude + '","longitude":"' + longitude + '"}]}';
	var server = "http://noname0930.no-ip.org/carpool/api/";
	var url = server + 'update_location.php?data=' + data;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");		
	xmlhttp.onreadystatechange = function() 
	{
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) 
		{
			console.log(xmlhttp.responseText);	
		}
	}
	xmlhttp.send();		
}

function DetectLocation(id, second, seton) 
{
	var GetCurrentPos = function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
					updateLocation(id, position.coords.latitude, position.coords.longitude);
				},
				function(error) {
					switch (error.code) {
						case error.PERMISSION_DENIED:
							console.log("User denied the request for Geolocation.");
							break;
						case error.POSITION_UNAVAILABLE:
							console.log("Location information is .");
							break;
						case error.TIMEOUT:
							console.log("The request to get user location timed out.");
							break;
						case error.UNKNOWN_ERROR:
							console.log("An unknown error occurred.");
							break;
					}
				});
		} else {
			alert("Not support geolocation");
		}
	}
	var thisid = null;
	if (seton) {
		thisid = setInterval(GetCurrentPos, second * 1000);
	} else {
		clearInterval(thisid);
	}
}


function calRoute() {
    StartPointMarker.setMap(null);
    EndPointMarker.setMap(null);

    //add service
    PathDirectionsService = new google.maps.DirectionsService();

    var PathRequest = {
        origin: StartPoint,
        destination: EndPoint,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true
    };

    var randColor = "#" + (randInt(50, 200)).toString(16) + (randInt(50, 200)).toString(16) + (randInt(50, 200)).toString(16);
    var PathPolylineOptions = {
        strokeColor: randColor,
        strokeOpacity: 0.9,
        strokeWeight: 8
    };

    PathDirectionsService.route(PathRequest, function(Response, Status) {
        if (Status == google.maps.DirectionsStatus.OK) {
            PathDirectionRender = new google.maps.DirectionsRenderer({
                polylineOptions: PathPolylineOptions,
                preserveViewport: true
            });

            PathDirectionRender.setMap(map);
            PathDirectionRender.setDirections(Response);
            UserPathStored(Response);
        }
    });

    ResetAllParameter();
}

function GetUserCurrentPos() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            if (StartPoint) {
                if (StartPoint.k != position.coords.latitude || StartPoint.D != position.coords.longitude) {
                    if (StartPointMarker != null)
                        StartPointMarker.setMap(null);

                    StartPoint = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    if (StartPoint != null)
                        StartPointStatus = true;

                    StartPointMarker = new google.maps.Marker({
                        position: StartPoint,
                        map: map,
                        icon: 'img/start_pin.png',
                        title: 'Start Point'
                    });

                    map.setCenter(StartPoint);
                }
            } else {
                if (StartPointMarker != null)
                    StartPointMarker.setMap(null);

                StartPoint = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				
				alert(position.coords.latitude + ', ' + position.coords.longitude);

                if (StartPoint != null)
                    StartPointStatus = true;

                StartPointMarker = new google.maps.Marker({
                    position: StartPoint,
                    map: map,
                    icon: 'img/start_pin.png',
                    title: 'Start Point'
                });

                map.setCenter(StartPoint);
            }
        }, function(error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert("User denied the request for Geolocation.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    alert("The request to get user location timed out.");
                    break;
                case error.UNKNOWN_ERROR:
                    alert("An unknown error occurred.");
                    break;
            }
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function UserPathStored(r) {
    var thisPath = GetPathPoint(r);
    pathJSON = JSON.stringify(thisPath);
    PathLength = r.routes[0].legs[0].distance.value;
    /*
    =====================================================================================
                                Store path data in database
                                format: json
    =====================================================================================
     */
}

function OutputPathPoints(response) {
    var thisPath = GetPathPoint(response);

    //record path dots
    PathDots = thisPath;

    for (var i = 0; i < thisPath.length; i++)
        if (i > 0 && i < thisPath.length - 1)
            SetPathMarkerDot(i - 1, thisPath[i]);
}

//r is response, p is path number
function GetPathPoint(r) {
    var localPath = [];
    var steps = r.routes[0].legs[0].steps;

    //initail
    localPath.push(steps[0].path[0]);

    for (var i = 0; i < steps.length; i++) {
        var innerStepPath = steps[i].path;

        for (var j = 1; j < innerStepPath.length; j++) {
            localPath.push(innerStepPath[j]);
        }
    }
    return localPath;
}

function SetPathMarkerDot(index, latLng) {
    var marker = null;

    PathDotsMarkers[index] = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: "img/path_dot.png",
        title: latLng.k + ", " + latLng.D
    });
    marker = PathDotsMarkers[index];

    google.maps.event.addListener(marker, 'click', function() {
        new google.maps.InfoWindow({
            content: '<div>' + latLng.k + ', ' + latLng.D + '</div>'
        }).open(map, marker);
    });
}

function ResetAllParameter() {
    EndPoint = null;

    CurrentSelectedMarkerType = null;

    if (PathDirectionRender != null)
        PathDirectionRender.setMap(null);

    for (var i = 0; i < PathDotsMarkers.length; i++)
        if (PathDotsMarkers[i] != null)
            PathDotsMarkers[i].setMap(null);
    PathDotsMarkers = [];

    PathDots = [];
}

function SetMarkerForMap(latLng) {
    if (CurrentSelectedMarkerType == null)
        return false;

    switch (CurrentSelectedMarkerType) {
        case 2:
            if (EndPointMarker != null)
                EndPointMarker.setMap(null);

            EndPointMarker = new google.maps.Marker({
                position: latLng,
                map: map,
                icon: 'img/end_pin.png',
                title: 'End Point'
            });

            EndPoint = latLng;
            EndPointStatus = true;
            SetMarkerStatus(0);

            if (StartPoint)
                calRoute();
            else {
                EndPointMarker.setMap(null);
                GetUserCurrentPos();
                alert("偵測不到目前位置，請確認是否開啟GPS或在空曠的地方");
            }
            break;
    }
}

function SetMarkerStatus(type) {
    switch (type) {
        case 2:
            CurrentSelectedMarkerType = 2;
            $('#btnBoundEP > img').addClass('hidden');
            $('#btnBoundSP > img').removeClass('hidden');
            break;
        case 0:
            CurrentSelectedMarkerType = 0;
            $('#btnBoundEP > img').removeClass('hidden');
            $('#btnBoundSP > img').removeClass('hidden');
            break;
    }
}

//functions for work==============================================================
//
//
//=================================== DIVIDE =====================================
//
//
//functions for work==============================================================
function isInt(value) {
    return !isNaN(value) && (function(x) {
        return (x | 0) === x;
    })(parseFloat(value))
}

function isNum(obj) {
    return !(typeof(obj) == 'undefined' || obj == null || obj == "") && !isNaN(obj);
}

function resizeScreen() {
    //set map block height and width
    var docHight = $(document).height();
    var mapblockH = docHight - 70;

    $('#map-block').css('height', mapblockH + 'px');
}

function randFloat(minVal, maxVal, floatVal) {
    var randVal = minVal + (Math.random() * (maxVal - minVal));
    return typeof floatVal == 'undefined' ? Math.round(randVal) : randVal.toFixed(floatVal);
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function genMyTimeStr() {
    var d = new Date();
    return d.getFullYear() + '_' + (d.getMonth() + 1) + '_' + d.getDate() + '_' + d.getHours() + '_' + d.getMinutes() + '_' + d.getSeconds();
}

function debugUsing(data) {
    var outputStr = "";
    for (var i = 0; i < data.length; i++) {
        outputStr += data[i].join(',') + '<br>';
    }
    $('body').append(outputStr);

    var w = window.open();
    $(w.document.body).html(outputStr);
}