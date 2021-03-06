$(document).ready(function() {
    //set map block size
    resizeScreen();

    // initialize map
    InitialMap();

    Initialize();

    $('.toggle-menu').jPushMenu();

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
var PathDots = [];
var PathLength = null;
var pathJSON = null;

function InitialMap() {
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

function updateLocation(id, latitude, longitude) {
    var data = '{"id":"' + id + '","curpoint":[{"latitude":"' + latitude + '","longitude":"' + longitude + '"}]}';
    var server = "http://noname0930.no-ip.org/carpool/api/";
    var url = server + 'update_location.php?data=' + data;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            console.log(xmlhttp.responseText);
        }
    }
    xmlhttp.send();
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
            OutputPathPoints(Response);
        }
    });

    ResetAllParameter();
}

function OutputPathPoints(response) {
    var thisPath = GetPathPoint(response);

    //record path dots
    PathDots = thisPath;
    PathLength = response.routes[0].legs[0].distance.value;
    pathJSON = JSON.stringify(PathDots);
}

//r is response, p is path number
function GetPathPoint(r) {
    var localPath = [];
    var steps = r.routes[0].legs[0].steps;

    //initail
    localPath.push({
        'at': steps[0].path[0].lat(),
        'ng': steps[0].path[0].lng()
    });

    for (var i = 0; i < steps.length; i++) {
        var innerStepPath = steps[i].path;

        for (var j = 1; j < innerStepPath.length; j++) {
            localPath.push({
                'at': innerStepPath[j].lat(),
                'ng': innerStepPath[j].lng()
            });
        }
    }
    return localPath;
}

function ResetAllParameter() {
    EndPoint = null;

    CurrentSelectedMarkerType = null;

    if (PathDirectionRender != null)
        PathDirectionRender.setMap(null);

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


// match -========================================================================= START
// global variables
var url = window.location.toString();
var server = "http://52.68.75.40/carpool/api/";
var local = "file:///android_asset/www/";
var id = "";
var role = "";
var json = "";
var file = "";
var pathStr = "";
var driver_fid = "";
var wait_time = "";
var condition = new Array();
var distance = "";
var percentage = "";

var finalres = [];
var finalid = [];
var indexid = [];
var waiting = 0;
var oidd = [];
var did = [];
var dnow = [];
var jstr = "";
var pathJSON2 = "";
var res_num = 0;
var total = 0;
var totalL = 0;
var passenger_path = "";
var passenger_json = "";
var normal_onoff = "";
var count = 0;
var ori_2 = [];
var des_2 = [];
var oris = [];
var dess = [];
var offarr = []; //紀錄endoff
var pers = []; //紀錄per


function Initialize() {
    var str = url.substring(url.indexOf("{"), url.length);
    file = str;

    json = JSON.parse(decodeURIComponent(str));
    id = json.id;
    role = json.role;

    file = decodeURIComponent(file);

    condition = json.condition;
    distance = condition[0]['distance'];
    percentage = condition[0]['percentage'];
    waiting = condition[0]['waiting'];

    DetectLocation(id, 5, true);

    setURL();
}

function setURL() {
    document.getElementById("logo").href = 'http://noname0930.no-ip.org/carpool/index.html?data=' + '{"id":"' + id + '"}';
}

//傳資料給php
function requestAPI(url, data, gid) {
    url += '?data=' + data;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (gid == "path") {
                pathStr = xmlhttp.responseText; //php回傳的路徑資料 -- json格式
                requestAPI(server + "filter2.php", file, "other"); //取得評價篩選的司機ID => 93行
            } else if (gid == "other") {
                driver_fid = xmlhttp.responseText; //回傳司機id
                //擷取id字串
                did = [];
                while (driver_fid.match(',') != null) {
                    var tt = driver_fid.substring(driver_fid.indexOf('\"') + 1, driver_fid.indexOf(',') - 1);
                    did.push(tt);
                    driver_fid = driver_fid.substring(driver_fid.indexOf(',') + 1, driver_fid.lastIndexOf(']') + 1);
                }
                did.push(driver_fid.substring(driver_fid.indexOf('\"') + 1, driver_fid.lastIndexOf('\"')));

                //組成json
                var getnow = '{"ids":[';
                for (var i = 0; i < did.length; i++) {
                    if (i != did.length - 1)
                        getnow += '{"id":"' + did[i] + '"},';
                    else
                        getnow += '{"id":"' + did[i] + '"}]}';
                }

                requestAPI(server + "get_driver_now.php", getnow, "drivernow"); //取得評價篩選後的司機目前位置 => 115行
            } else if (gid == "drivernow") {
                var now = xmlhttp.responseText;
                now = JSON.parse(now);
                for (var i = 0; i < now.length; i++) {
                    var nnow = JSON.parse(now[i]);
                    dnow.push(JSON.parse('{"at":' + nnow["latitude"] + ',"ng":' + nnow["longitude"] + '}'));
                }
                Compare(); //路徑比對 => 269行
            } else if (gid == "store") {
                var set_carpool = '{"id":"' + id + '","carpool":' + JSON.stringify(finalres) + '}';
                requestAPI(server + "set_carpool.php", set_carpool, "update"); //更新乘客carpool path => 130行
            } else if (gid == "update") {
                //跳轉到result頁面
                window.location = 'file:///android_asset/www/result.html?data=' + jstr;
            } else {
                wait_time = xmlhttp.responseText;
                var index2;
                for (var i = 0; i < indexid.length; i++) {
                    if (gid == indexid[i]) {
                        index2 = i;
                        break;
                    }
                }

                var oris_len = oris.length;

                //計算距離 => 153行
                CalDistance(oris[i], dess[i], indexid[i], index2);
            }
        }
    }
}

function CalDistance(ori, des, index, index2) {
    var success = function(response, status) {
        if (status == google.maps.DistanceMatrixStatus.OK) {
            total++;

            var origins = response.originAddresses;
            var destinations = response.destinationAddresses;

            var dis_2 = [];
            var time_2 = [];

            for (var i = 0; i < origins.length; i++) {
                var results = response.rows[i].elements;
                var dis_temp = [];
                var time_temp = [];
                for (var j = 0; j < results.length; j++) {
                    var element = results[j];
                    dis_temp.push(element.distance.value);
                    time_temp.push(element.duration.value);
                }
                dis_2.push(dis_temp);
                time_2.push(time_temp);
            }

            var finalwait = 0;
            //比較司機與乘客到上車點的時間哪個花較長時間
            if (time_2[1][1] > time_2[0][0]) {
                finalwait = time_2[1][1];
            } else {
                finalwait = time_2[0][0];
            }

            normal_onoff = '","on_d":"' + dis_2[0][0] + '","off_d":"' + new Number(offarr[index2]).toFixed(0) + '","wait":"' + finalwait;

            var tell = true;
            //乘客起點到上車點距離篩選
            if (dis_2[0][0] > parseInt(distance)) {
                //delete finalres[total - 1];
                finalres.shift();
                tell = false;
                alert("不符上車點距離限制!" + distance + "\n乘客相距上車點: " + dis_2[0][0]);
            } //司機願意等待時間篩選
            else if (finalwait > wait_time * 60) {
                //delete finalres[total - 1];
                finalres.shift();
                tell = false;
                alert("不符司機等待時間!" + wait_time * 60 + "\n等待時間: " + finalwait);
            } //乘客願意等待時間篩選
            else if (finalwait > waiting * 60) {
                //delete finalres[total - 1];
                finalres.shift();
                tell = false;
                alert("不符乘客等待時間!" + waiting * 60 + "\n等待時間: " + finalwait);
            }

            //將路徑加入查詢結果
            if (tell) {
                res_num++;

                if (jstr != "") {
                    jstr = jstr + ',{"did":"' + did[parseInt(index)] + '","percentage":"' + pers[index2] + normal_onoff + '"}';
                } else {
                    jstr = '[{"did":"' + did[parseInt(index)] + '","percentage":"' + pers[index2] + normal_onoff + '"}';
                }
            }

            //符合的路徑數 + 不符合的路徑數 = 全部路徑數
            if ((total + count) == pathJSON2.length) {
                if (res_num != 0) {
                    jstr += "]";
                    jstr = '{"id":"' + id + '","result":' + jstr + '}';
                    alert("JSON:" + jstr);

                    requestAPI(server + "requester.php", passenger_json, "store"); //儲存乘客路徑 => 124行
                } else {
                    alert("無符合條件之重疊路徑");
                }
            }
        } else { //距離請求失敗
            total++;

            finalres.shift();

            if ((total + count) == pathJSON2.length) {
                if (res_num != 0) {
                    jstr += "]";
                    jstr = '{"id":"' + id + '","result":' + jstr + '}';
                    alert("JSON:" + jstr);

                    requestAPI(server + "requester.php", passenger_json, "store"); //儲存乘客路徑 => 183行
                } else {
                    alert("無符合條件之重疊路徑");
                }
            }
        }
    }

    var disMatCal = new google.maps.DistanceMatrixService();
    disMatCal.getDistanceMatrix({
        origins: ori,
        destinations: des,
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: true,
        avoidTolls: true
    }, success);
}

function Compare() {
    pathJSON2 = JSON.parse(decodeURIComponent(pathStr));
    if (pathJSON2.length == 0) //代表沒有符合的司機
        alert("無司機符合篩選結果");

    var p = JSON.parse(passenger_path); //乘客路徑
    var p1 = ConvertToGoogleLatLng(JSON.parse(passenger_path)); //乘客路徑(google 物件)

    count = 0;
    total = 0;
    res_num = 0;
    finalres = [];
    finalid = [];
    indexid = [];
    offarr = []
    pers = [];

    for (var i = 0; i < pathJSON2.length; i++) {
        var p2 = ConvertToGoogleLatLng(JSON.parse(pathJSON2[i])); //司機路徑(google 物件)
        oidd = PathCompare(p1, p2, true); //比對路徑

        if (oidd != null) {
            //轉換成資料庫格式
            var oidToDB = [];
            for (var ii = 0; ii < oidd.length; ii++) {
                oidToDB.push([]);
                for (var j = 0; j < oidd[ii].length; j++) {
                    oidToDB[ii].push({
                        'at': oidd[ii][j].lat(),
                        'ng': oidd[ii][j].lng()
                    });
                }
            }
            finalres.push(oidToDB[0]); //加入結果

            var carpool_d = CarpoolCalDistance(oidToDB[0]); //計算共乘距離
            var endoff = [];
            var str_index = false;
            for (var k = 0; k < p1.length; k++) {
                if (str_index)
                    endoff.push(p[k]);
                if (p1[k] == oidd[0][oidd[0].length - 1])
                    str_index = true;
            }
            var endoff_d = CarpoolCalDistance(endoff); //計算下車點與乘客終點的距離
            var d2p = [];
            d2p.push(dnow[i]);
            d2p.push(p[0]);
            var d2p_d = CarpoolCalDistance(d2p); //計算司機與乘客目前距離

            var state = true;
            var per = carpool_d / totalL * 100;
            //因為carpool_d是我們自己算的可能會超出google算出的距離
            if (per > 100)
                per = 100;

            //共乘比率篩選
            if (per < parseInt(percentage)) {
                finalres.shift();
                state = false;
                alert("共乘比例低於門檻!" + percentage + "\n共乘比例: " + (new Number(per)).toFixed(2));
            } //安全區間 100(m)
            else if (d2p_d <= 100) {
                finalres.shift();
                state = false;
                alert("不符安全區間(100 m)!\n乘客司機距離: " + (new Number(d2p_d)).toFixed(0));
            }

            if (state) {
                var dnowg = ConvertToGoogleLatLng(dnow);

                ori_2 = [];
                des_2 = [];
                ori_2.push(p1[0]);
                ori_2.push(dnowg[i]);
                des_2.push(oidd[0][0]); //計算乘客起點到上車點的距離
                des_2.push(oidd[0][0]); //計算司機到上車點距離
                oris.push(ori_2);
                dess.push(des_2);
                offarr.push(endoff_d); //記錄下車點與乘客終點的距離
                pers.push(per); //記錄共乘距離百分比

                var temp = '{"id":"' + did[i] + '"}'; //get_wait json

                finalid.push(temp);
                indexid.push(i);
            } else {
                total++;
            }
        } else {
            count++;
        }
    }

    if (count + total == pathJSON2.length && total == 0) {
        alert("無重疊路徑");
    } else if (count + total == pathJSON2.length && total != 0) {
        alert("無符合條件之重疊路徑");
    } else {
        for (var k = 0; k < indexid.length; k++) {
            requestAPI(server + "get_wait.php", finalid[k], indexid[k]); //取得司機等待時間 => 134行
        }
    }
}

function nextStep(pathJSON, PathLength) {
    passenger_path = "";
    passenger_path = pathJSON;
    totaL = PathLength;
    count = 0;
    json = JSON.stringify(json);
    pathTemp = JSON.parse(pathJSON);
    totalL = PathLength;

    //passenger json
    passenger_json = file.substring(0, file.length - 1) + ',"path":' + pathJSON + ',"start":' + '{"latitude":"' + (new Number(StartPoint.lat())).toFixed(14) + '","longitude":"' + (new Number(StartPoint.lng())).toFixed(14) + '"}' + ',"end":' + '{"latitude":"' + (new Number(pathTemp[pathTemp.length - 1].at)).toFixed(14) + '","longitude":"' + (new Number(pathTemp[pathTemp.length - 1].ng)).toFixed(14) + '"}}';

    //driver json
    json = json.substring(0, json.length - 1) + ',"path":' + pathJSON + '}';

    if (role == "driver") {
        var url = "";
        url = server + 'reciever.php?data=' + json;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                window.location = local + 'trace.html?data={"role":"driver","id":"' + id + '"}';
            }
        }
        xmlhttp.send();
    } else if (role == "passenger") {
        requestAPI(server + "filter.php", file, "path"); //取得評價篩選後的司機路徑 => 88行
    }
}

// match -========================================================================= END


//functions for work==============================================================
//
//
//=================================== DIVIDE =====================================
//
//
//functions for work==============================================================
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


function DetectLocation(id, second, seton) {
    var GetCurrentPos = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                    updateLocation(id, position.coords.latitude, position.coords.longitude);
                    if (StartPoint) {
                        if (StartPoint.lat() != position.coords.latitude || StartPoint.lng() != position.coords.longitude) {
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

    GetCurrentPos();
    if (seton) {
        thisid = setInterval(GetCurrentPos, second * 1000);
    } else {
        clearInterval(thisid);
    }
}
