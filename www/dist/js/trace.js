$(document).ready(function() {
    resizeScreen();
    initialize();

    document.addEventListener("deviceready", onDeviceReady, false);
});

//global variables
var map;
var DELTANUMBER = 5; //ERROR NUMBER IN 5 METER

var id = "";
var json = "";
var role = "";
var trace = "";
var tid = "";
var pid = null;
var did = null;
var server = "http://noname0930.no-ip.org/carpool/api/";
var local = "file:///android_asset/www/";

function initialize() {
    //set map options
    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(23.00106, 120.20875)
    };
    //set map
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var url = window.location.toString();
    var str = url.substring(url.indexOf("{"), url.length);

    json = JSON.parse(decodeURIComponent(str));
    id = json.id;
    role = json.role;

    executeAsync(function(id) {
        DetectLocation(id, 20, true);
    });
    // ******************************************************************************************** DETECT CURRENT POSITION TIME SET POSITION

    // driver: {"role":"driver","id":"678671252207481", "pid": ["pid": "1046779538684826"]}
    // return name, path
    // passenger: {"role":"passenger","id":"1046779538684826","did":"678671252207481"}
    // return name, start, end, carpoolpath

    var strPassenger = null;
    var strDriver = null;
    var strLocation = null;
    var type = null;

    if (role == "driver") {
        strDriver = '{"array":[{"id":"' + id + '"}]}';
        if (json.hasOwnProperty('pid')) {
            var tmppids = json.pid;
            strPassenger = '{"array":[';
            strLocation = '{"role":"passenger","array":[';
            for (var i = 0; i < tmppids.length; i++) {
                if (i == tmppids.length - 1) {
                    strPassenger += '{"id":"' + tmppids[i] + '"}';
                    strLocation += '{"id":"' + tmppids[i] + '"}';
                } else {
                    strPassenger += '{"id":"' + tmppids[i] + '"},';
                    strLocation += '{"id":"' + tmppids[i] + '"},';
                }
            }
            strPassenger += ']}';
            strLocation += ']}';
        }
        type = 1;
    } else if (role == "passenger") {
        did = json.did;
        strLocation = '{"role":"driver","array":[{"id":"' + did + '"}]}';
        strDriver = '{"array":[{"id":"' + did + '"}]}';
        strPassenger = '{"array":[{"id":"' + id + '"}]}';
        type = 2;
    }

    // get others' location from database with "second"
    if (strLocation) {
        executeAsync(function() {
            GetOthersLocation(strLocation, 20, true);
        });
    }

    ReceiverDataTake(strDriver, strPassenger, type);

    json = decodeURIComponent(str);
}

function setURL() {
    document.getElementById("wall").href = local + 'wall.html?data={"id":"' + id + '"}';
    document.getElementById("friendlist").href = local + 'friendlist.html?data=' + '{"id":"' + id + '"}';
    document.getElementById("about").href = local + 'about.html?data={"id":"' + id + '"}';
    document.getElementById("setting").href = local + 'setting.html?data=' + '{"id":"' + id + '"}';
    document.getElementById("logo").href = local + 'index.html?data=' + '{"id":"' + id + '"}';
}

function confirmCarpool() {
    var data = json.substring(0, json.length - 1) + ',"tid":"' + tid + '","mode":"4"}';
    var xmlhttp = new XMLHttpRequest();
    url = server + 'gcm_server.php?data=' + data;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var temp = "";
            if (!trace) {
                alert("null");
                trace = '"trace":[{"pid":"' + tid + '"}]';
                temp = json.substring(0, json.length - 1) + ',"trace":[{"pid":"' + tid + '"}]}';
            } else {
                alert("not null");
                temp = json.substring(0, json.length - 2) + ',{"pid":"' + tid + '"}]}';
            }
            alert("TEMP " + temp);
            window.location = local + "trace.html?data=" + temp;
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function cancelCarpool() {
    window.location = local + 'initialize.html?data={"id":"' + id + '"}';
}

//get another current position
function LocationDataTake(data) {
    var url = server + 'get_location.php?data=' + data;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var JsonPositions = JSON.parse(xmlhttp.responseText);
            GOL_FROMDATABASE = [];
            for (var i = 0; i < JsonPositions.length; i++)
                GOL_FROMDATABASE.push(new google.maps.LatLng(JsonPositions[i].latitude, JsonPositions[i].longitude));
        }
    }
    xmlhttp.send();
}

//get driver data name and path
function ReceiverDataTake(DriverDataBase, PassengerDataBase, type) {
    var url = server + 'get_receiver.php?data=' + DriverDataBase;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var DriverJson = JSON.parse(xmlhttp.responseText);
            if (PassengerDataBase) {
                TracekerDataTake(DriverJson, PassengerDataBase, type);
            } else {
                TrackingInput(DriverJson, null, type);
            }
        }
    }
    xmlhttp.send();
}

//get passenger data name start and end and carpool
function TracekerDataTake(DriverJson, PassengerDataBase, type) {
    var url = server + 'get_tracker.php?data=' + PassengerDataBase;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var PassengerJson = JSON.parse(xmlhttp.responseText);
            TrackingInput(DriverJson, PassengerJson, type);
        }
    }
    xmlhttp.send();
}

function TrackingInput(JsonDriver, JsonPassenger, user) {
    var ObjectDriver = null;
    var ObjectPassenger = null;

    //driver
    ObjectDriver = {
        'name': JsonDriver[0].name,
        'path': ConvertToGoogleLatLng(JsonDriver[0].path)
    };

    var tmpPassList = [];
    if (JsonPassenger) {
        for (var i = 0; i < JsonPassenger.length; i++)
            tmpPassList.push({
                'name': JsonPassenger[i].name,
                'startpoint': new google.maps.LatLng(JsonPassenger[i].start.latitude, JsonPassenger[i].start.longitude),
                'endpoint': new google.maps.LatLng(JsonPassenger[i].end.latitude, JsonPassenger[i].end.longitude),
                'carpoolpath': ConvertToGoogleLatLng(JsonPassenger[i].carpoolpath[0])
            });
        ObjectPassenger = tmpPassList;
    }

    setTimeout(function(ObjectDriver, ObjectPassenger, user) {
        Tracking(ObjectDriver, ObjectPassenger, user);
    }, 5000, ObjectDriver, ObjectPassenger, user);
}

var GOL_SELFPOS = null;
var GOL_FROMDATABASE = null;
var DRIVERINTERVALID = null;
var PASSENGERINTERVALID = null;

function Tracking(DriverData, PassengerData, user) {
    //driver
    var driver;
    driver = new Driver(DriverData.name, DriverData.path);
    driver.Initialize();

    //passengers
    var passenger = [];
    if (PassengerData) {
        for (var i = 0; i < PassengerData.length; i++) {
            passenger.push(new Passenger(
                PassengerData[i].name,
                PassengerData[i].startpoint,
                PassengerData[i].endpoint,
                PassengerData[i].carpoolpath[0],
                PassengerData[i].carpoolpath[PassengerData[i].carpoolpath.length - 1],
                PassengerData[i].carpoolpath
            ));
            passenger[i].Initialize();
            driver.AddPassenger(passenger[i]);
        }
    }

    //driver parameter
    var DriverCurPos = null;
    var DriverOldCurPos = null;
    var DriverEndPoint = DriverData.path[DriverData.path.length - 1];

    //passenger paremeter
    var PassengerCurPos = null;
    var PassengerOldCurPos = null;
    var PassengerGetoffPoint = null;

    if (GOL_SELFPOS || GOL_FROMDATABASE) {
        if (user == 1) {
            DriverCurPos = GOL_SELFPOS;
            PassengerCurPos = GOL_FROMDATABASE;
        } else {
            DriverCurPos = GOL_FROMDATABASE[0];
            PassengerCurPos = [GOL_SELFPOS];
        }

        DriverOldCurPos = DriverCurPos;
        PassengerOldCurPos = PassengerCurPos

        if (DriverCurPos) {
            driver.SetCurrentPos(DriverCurPos);
            driver.Update(true);
        }
        if (PassengerCurPos) {
            if (PassengerCurPos[0]) {
                for (var i = 0; i < PassengerCurPos.length; i++) {
                    passenger[i].SetCurrentPos(PassengerCurPos[i]);
                    passenger[i].Update(true);
                }
            }
        }
    }

    DRIVERINTERVALID = setInterval(function() {
        if (GOL_SELFPOS || GOL_FROMDATABASE) {
            if (user == 1)
                DriverCurPos = GOL_SELFPOS;
            else
                DriverCurPos = GOL_FROMDATABASE[0];

            if (DriverCurPos) {
                //driver arrived end point
                executeAsync(function() {
                    var DisToEnd = getDistance(DriverEndPoint.lat(), DriverEndPoint.lng(), DriverCurPos.lat(), DriverCurPos.lng());
                    // ============================================================================================= END PROCESS Driver has been at endpoint , and get off
                    if (DisToEnd <= DELTANUMBER) {

                        driver.Update(false);
                        clearInterval(DRIVERINTERVALID);
                    }
                    // ============================================================================================= END PROCESS Driver has been at endpoint , and get off
                });

                if (DriverOldCurPos) {
                    // if old point != current point
                    if (DriverCurPos.lat() != DriverOldCurPos.lat() || DriverCurPos.lng() != DriverOldCurPos.lng()) {
                        DriverOldCurPos = DriverCurPos;
                        driver.SetCurrentPos(DriverCurPos);
                        driver.Update(true);
                    }
                } else {
                    // if above Driver old point not get
                    // exec once
                    DriverOldCurPos = DriverCurPos;
                    driver.SetCurrentPos(DriverCurPos);
                    driver.Update(true);
                }
            }
        }
    }, 15000);
    // ******************************************************************************************** TRACK TIME SET POSITION

    PASSENGERINTERVALID = setInterval(function() {
        if (GOL_SELFPOS || GOL_FROMDATABASE) {
            if (user == 1)
                PassengerCurPos = GOL_FROMDATABASE;
            else
                PassengerCurPos = [GOL_SELFPOS];

            for (var i = 0; i < passenger.length; i++) {
                if (!DriverCurPos || !PassengerCurPos[i])
                    continue;
                // following is points needed
                // passenger get in car point
                var PointPgincp = passenger[i].GetGetPoint();
                // passenger get out off car point
                var PointPgoocp = passenger[i].GetDownPoint();
                // this passenger current point
                var PointPcp = PassengerCurPos[i];
                // Driver current point
                var PointDcp = DriverCurPos;

                // following is four distance
                // passenger to driver current point distance
                var DisPcp2dcp;
                // cal passenger current point to passenger get in car point
                var DisPcp2pgicp;
                // cal passenger current point to his get out off car point
                var DisPcp2pgoocp;
                // cal driver current point to passenger get out off car point
                var DisDcp2pgoocp;

                if (PassengerCurPos) {
                    if (PassengerCurPos[0]) {
                        // judge passenger whether get in car
                        // cal passenger to driver current point distance
                        // cal passenger current point to passenger get in car point
                        executeAsync(function() {
                            //DISTANCE
                            DisPcp2dcp = getDistance(PointPcp.lat(), PointPcp.lng(), PointDcp.lat(), PointDcp.lng());
                            DisPcp2pgicp = getDistance(PointPcp.lat(), PointPcp.lng(), PointPgincp.lat(), PointPgincp.lng());
                            // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv END PROCESS
                            //GET IN CAR
                            if (DisPcp2pgicp <= DELTANUMBER && DisPcp2dcp <= DELTANUMBER) {
                                passenger[i].Getin(driver);
                                passenger[i].Update(false);
                                clearInterval(PassInterval);
                            }
                            // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ END PROCESS
                        });

                        // judge passenger whether get off car
                        // cal passenger current point to his get out off car point
                        // cal driver current point to passenger get out off car point
                        executeAsync(function() {
                            DisPcp2pgoocp = getDistance(PointPcp.lat(), PointPcp.lng(), PointPgoocp.lat(), PointPgoocp.lng());
                            DisDcp2pgoocp = getDistance(PointDcp.lat(), PointDcp.lng(), PointPgoocp.lat(), PointPgoocp.lng());
                            // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv END PROCESS
                            //GET OUT OF CAR
                            if (DisPcp2pgoocp <= DELTANUMBER && DisDcp2pgoocp <= DELTANUMBER)
                                passenger[i].Getoutof(driver);
                            // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ END PROCESS
                        });
                    }
                }
            }

            if (PassengerCurPos) {
                if (PassengerCurPos[0]) {
                    if (PassengerOldCurPos) {
                        if (PassengerOldCurPos[0]) {
                            for (var i = 0; i < PassengerCurPos.length; i++) {
                                if (PassengerCurPos[i].lat() != PassengerOldCurPos[i].lat() || PassengerCurPos[i].lng() != PassengerOldCurPos[i].lng()) {
                                    PassengerOldCurPos[i] = PassengerCurPos[i];
                                    passenger[i].SetCurrentPos(PassengerCurPos[i]);
                                    passenger[i].Update(true);
                                }
                            }
                        } else {
                            for (var i = 0; i < PassengerCurPos.length; i++) {
                                PassengerOldCurPos[i] = PassengerCurPos[i];
                                passenger[i].SetCurrentPos(PassengerCurPos[i]);
                                passenger[i].Update(true);
                            }
                        }
                    } else {
                        PassengerOldCurPos = PassengerCurPos;
                    }
                }
            }
        }
    }, 15000);
    // ******************************************************************************************** TRACK TIME SET POSITION
}

/*
 *  Class for Passenger
 */
var Passenger = function(_name, _startp, _endp, _getp, _downp, _path) {
    // private
    var CurrentPosMarker = null;
    var CurrInfoWindow = null;
    var EndPointMarker = null;
    var GetPointMarker = null;
    var DownPointMarker = null;
    var PathPolyline = null;
    var ArrivalTime = null;
    var ArrivalDis = null;
    var CurrentPos = null;
    var Name = _name;

    var StartPointMarker = null;

    //privilege properties
    this.ID = null;
    this.StartPoint = _startp;
    this.EndPoint = _endp;
    this.GetPoint = _getp;
    this.DownPoint = _downp;
    this.Path = _path;

    //privilege method
    //set and get private properties
    this.SetPathPolyline = function(s_polyline) {
        PathPolyline = s_polyline;
    };
    this.GetPathPolyline = function() {
        return PathPolyline;
    };
    this.SetCurrInfoWindow = function(s_CurrInfoWindow) {
        CurrInfoWindow = s_CurrInfoWindow;
    };
    this.GetCurrInfoWindow = function() {
        return CurrInfoWindow;
    };
    this.SetGetPointMarker = function(s_GetPointMarker) {
        GetPointMarker = s_GetPointMarker;
    };
    this.GetGetPointMarker = function() {
        return GetPointMarker;
    };
    this.SetDownPointMarker = function(s_DownPointMarker) {
        DownPointMarker = s_DownPointMarker;
    };
    this.GetDownPointMarker = function() {
        return DownPointMarker;
    };
    this.SetEndPointMarker = function(s_EndPointMarker) {
        EndPointMarker = s_EndPointMarker;
    };
    this.GetEndPointMarker = function() {
        return EndPointMarker;
    };
    this.SetCurrentPosMarker = function(s_CurrentPosMarker) {
        CurrentPosMarker = s_CurrentPosMarker;
    };
    this.GetCurrentPosMarker = function() {
        return CurrentPosMarker;
    };
    this.SetCurrentPos = function(s_CurrentPos) {
        CurrentPos = s_CurrentPos;
    };
    this.GetCurrentPos = function() {
        return CurrentPos;
    };
    this.GetName = function() {
        return Name;
    };

    this.SetCurrentPosMarker = function(response, status, type) {
        if (!type) {
            if (CurrentPosMarker != null)
                CurrentPosMarker.setMap(null);
            if (CurrInfoWindow != null)
                CurrInfoWindow.setMap(null);
            return false;
        }
        if (status == google.maps.DistanceMatrixStatus.OK) {
            ArrivalDis = response.rows[0].elements[0].distance.text;
            ArrivalTime = response.rows[0].elements[0].duration.text;

            //setMarker
            if (CurrentPosMarker != null)
                CurrentPosMarker.setMap(null);

            if (CurrInfoWindow != null)
                CurrInfoWindow.setMap(null);

            CurrentPosMarker = new google.maps.Marker({
                position: CurrentPos,
                map: map,
                icon: "img/path_dot_4.png",
                title: CurrentPos.lat() + ", " + CurrentPos.lng()
            });

            CurrInfoWindow = new google.maps.InfoWindow();
            CurrInfoWindow.setOptions({
                content: '<div>' + Name + ' 距離上車點<br> ' + ArrivalDis + '/ ' + ArrivalTime + '</div>',
                position: CurrentPos,
                zIndex: 999
            });
            CurrInfoWindow.open(map);
        }
    };
};

Passenger.prototype = {
    //initial
    'Initialize': function() {
        //display carpool path in google polyline
        var randColor = "#" + (randInt(50, 200)).toString(16) + (randInt(50, 200)).toString(16) + (randInt(50, 200)).toString(16);
        var thisPath = this.GetPath();
        this.SetPathPolyline(new google.maps.Polyline({
            path: thisPath,
            geodesic: true,
            strokeColor: randColor,
            strokeOpacity: 1.0,
            strokeWeight: 8,
            zIndex: 999
        }));
        this.GetPathPolyline().setMap(map);

        //display user get car point
        var thisGetPoint = this.GetGetPoint();
        this.SetGetPointMarker(new google.maps.Marker({
            position: thisGetPoint,
            map: map,
            icon: "img/path_dot_0.png",
            title: thisGetPoint.lat() + ", " + thisGetPoint.lng()
        }));

        //display user down car point
        var thisDownPoint = this.GetDownPoint();
        this.SetDownPointMarker(new google.maps.Marker({
            position: thisDownPoint,
            map: map,
            icon: "img/path_dot_0.png",
            title: thisDownPoint.lat() + ", " + thisDownPoint.lng()
        }));

        //display user End point
        var thisEndPoint = this.GetEndPoint();
        this.SetEndPointMarker(new google.maps.Marker({
            position: thisEndPoint,
            map: map,
            icon: "img/path_dot_0.png",
            title: thisEndPoint.lat() + ", " + thisEndPoint.lng()
        }));
    },

    //set function
    'SetID': function(s_ID) {
        this.ID = s_ID;
    },
    'SetStartPoint': function(s_startp) {
        this.StartPoint = s_startp;
    },
    'SetEndPoint': function(s_endp) {
        this.EndPoint = s_endp;
    },
    'SetGetPoint': function(s_getp) {
        this.GetPoint = s_getp;
    },
    'SetDownPoint': function(s_downp) {
        this.DownPoint = s_downp;
    },
    'SetPath': function(s_path) {
        this.Path = s_path;
    },
    'SetCurrentPos': function(s_curPos) {
        this.SetCurrentPos(s_curPos);
    },

    //get function
    'GetID': function() {
        return this.ID;
    },
    'GetStartPoint': function() {
        return this.StartPoint;
    },
    'GetEndPoint': function() {
        return this.EndPoint;
    },
    'GetGetPoint': function() {
        return this.GetPoint;
    },
    'GetDownPoint': function() {
        return this.DownPoint;
    },
    'GetPath': function() {
        return this.Path;
    },
    'GetCurrentPos': function() {
        return this.GetCurrentPos();
    },
    'GetName': function() {
        return this.GetName();
    },
    'Update': function(Type) {
        if (Type) {
            this.CalDisTime([this.GetCurrentPos()], [this.GetGetPoint()], this.SetCurrentPosMarker);
        } else {
            this.SetCurrentPosMarker(null, null, false);
        }
    },
    'CalDisTime': function(ori, des, callback) {
        var disMatCal = new google.maps.DistanceMatrixService();
        disMatCal.getDistanceMatrix({
            origins: ori,
            destinations: des,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: true,
            avoidTolls: true
        }, function(response, status) {
            callback(response, status, true);
        });
    },
    'RemovedDriver': function() {
        var a1 = this.GetPathPolyline();
        var a2 = this.GetGetPointMarker();
        var a3 = this.GetDownPointMarker();
        var a4 = this.GetEndPointMarker();
        var a5 = this.GetCurrentPosMarker();
        var a6 = this.GetCurrInfoWindow();
        if (a1 != null)
            a1.setMap(null);
        if (a2 != null)
            a2.setMap(null);
        if (a3 != null)
            a3.setMap(null);
        if (a4 != null)
            a4.setMap(null);
        if (a5 != null)
            a5.setMap(null);
        if (a6 != null)
            a6.close();
    },
    'Getin': function(_driver) {
        this.Status = 1;
        var _driverInfoWindow = _driver.GetPassInfoWindowList();
        var _passengerID = this.GetID();
        if (_driverInfoWindow[_passengerID] != null)
            _driverInfoWindow[_passengerID][0].setMap(null);
        _driver.DelOrderPoint(this.GetGetPoint());
    },
    'Getoutof': function(_driver) {
        this.Status = 0;
        var _driverInfoWindow = _driver.GetPassInfoWindowList();
        var _passengerID = this.GetID();
        if (_driverInfoWindow[_passengerID] != null)
            _driverInfoWindow[_passengerID][1].setMap(null);
        _driver.RemovePassenger(this);
    }
};

/*
 *  Class for Driver
 */
var Driver = function(_name, _path) {
    // private
    var CurrentPosMarker = null;
    var CurrInfoWindow = null;
    var PassInfoWindow = [];
    var PathPolyline = null;

    var CurrentPos = null;
    var Name = _name;
    var PassList = [];

    var CurrentType = 0; // current passenger point type 1 is get car 2 is down car

    //privilege
    this.Path = _path;

    //Process Data
    var OrderPoint = [];

    this.FillOrderPoint = function(_passengerId) {
        OrderPoint.push({
            'id': _passengerId,
            'type': 1,
            'pos': PassList[_passengerId].GetGetPoint()
        });
        OrderPoint.push({
            'id': _passengerId,
            'type': 2,
            'pos': PassList[_passengerId].GetDownPoint()
        });
    };
    this.RemoveOrderPoint = function(_pos) {
        for (var i = 0; i < OrderPoint.length; i++)
            if (OrderPoint[i])
                if ((OrderPoint[i].pos.lat() == _pos.lat()) && (OrderPoint[i].pos.lng() == _pos.lng())) {
                    OrderPoint[i] = null;
                    break;
                }
    };
    this.DeOrderPoint = function(_passengerId) {
        for (var i = 0; i < OrderPoint.length; i++)
            if (OrderPoint[i])
                if (OrderPoint[i].id == _passengerId)
                    OrderPoint[i] = null;
    };

    //privilege properties
    this.SetCurrentPos = function(s_currentpos) {
        CurrentPos = s_currentpos;
    };
    this.GetCurrentPos = function() {
        return CurrentPos;
    };
    this.SetPassList = function(s_PassList) {
        s_PassList.SetID(PassList.length);
        PassList.push(s_PassList);
    };
    this.GetPassList = function() {
        return PassList;
    };
    this.SetPathPolyline = function(s_PathPolyline) {
        PathPolyline = s_PathPolyline;
    };
    this.GetPathPolyline = function() {
        return PathPolyline;
    };
    this.GetOrderPoint = function() {
        return OrderPoint;
    };
    this.GetPassInfoWindowList = function() {
        return PassInfoWindow;
    };
    this.SetPassInfoWindow = function(_passengerId) {
        var tempName = PassList[_passengerId].GetName();
        var tempGetPoint = PassList[_passengerId].GetGetPoint();
        var tempDownPoint = PassList[_passengerId].GetDownPoint();

        PassInfoWindow.push([]);
        //Get Point
        PassInfoWindow[_passengerId].push(new google.maps.InfoWindow());
        PassInfoWindow[_passengerId][0].setOptions({
            content: '<div>乘客: ' + tempName + ' 的上車點</div>',
            position: tempGetPoint,
            zIndex: 999
        });
        PassInfoWindow[_passengerId][0].open(map);

        //Down Point
        PassInfoWindow[_passengerId].push(new google.maps.InfoWindow());
        PassInfoWindow[_passengerId][1].setOptions({
            content: '<div>乘客: ' + tempName + ' 的下車點</div>',
            position: tempDownPoint,
            zIndex: 999
        });
        PassInfoWindow[_passengerId][1].open(map);
    };
    this.RemovePassInfoWindow = function(_passenger) {
        var thisID = _passenger.GetID();
        if (PassInfoWindow[thisID])
            if (PassInfoWindow[thisID][0])
                PassInfoWindow[thisID][0].setMap(null);
        if (PassInfoWindow[thisID])
            if (PassInfoWindow[thisID][1])
                PassInfoWindow[thisID][1].setMap(null);
        PassInfoWindow[thisID] = null;
    };
    this.SetCurrentPosMarker = function(response, status, des, type) {
        if (!type) {
            if (CurrentPosMarker != null)
                CurrentPosMarker.setMap(null);
            if (CurrInfoWindow != null)
                CurrInfoWindow.setMap(null);
            return false;
        }

        if (status == google.maps.DistanceMatrixStatus.OK) {
            var Lists = response.rows[0].elements;
            var DistanceList = [];

            // push all distance to distance list
            for (var i = 0; i < Lists.length; i++)
                DistanceList.push(Lists[i].distance.value);

            // find the min distance point in array and its index
            var MinIndex = 0;
            var minIndexLoopMin = DistanceList[0];
            for (var i = 1; i < DistanceList.length; i++) {
                if (DistanceList[i] < minIndexLoopMin) {
                    MinIndex = i;
                    minIndexLoopMin = DistanceList[i];
                }
            }

            // get the target point which we want display on screen
            var TargetPoint = null;
            for (var i = 0; i < OrderPoint.length; i++) {
                if (OrderPoint[i] != null) {
                    if ((OrderPoint[i].pos.lat() == des[MinIndex].lat()) && (OrderPoint[i].pos.lat() == des[MinIndex].lat())) {
                        TargetPoint = OrderPoint[i];
                        break;
                    }
                }
            }

            var TypeName = "";
            var PassName;
            var TTStext;
            // use target point to get nearest point whose passenger name
            if (TargetPoint) {
                PassName = PassList[TargetPoint.id].GetName();
                if (TargetPoint.type == 1) {
                    if (CurrentType != 1)
                        CurrentType = 1;
                    TypeName = "上車點";
                } else if (TargetPoint.type == 2) {
                    if (CurrentType != 2)
                        CurrentType = 2;
                    TypeName = "下車點";
                }
            }
            ArrivalDis = Lists[MinIndex].distance.text;
            ArrivalTime = Lists[MinIndex].duration.text;

            //setMarker
            if (CurrentPosMarker != null)
                CurrentPosMarker.setMap(null);

            if (CurrInfoWindow != null)
                CurrInfoWindow.setMap(null);

            // ===================================================================================================== TTS TEXT INPUT

            var infocontent;

            if (TargetPoint) {
                infocontent = '<div>距離乘客: ' + PassName + ' 的' + TypeName + '<br> ' + ArrivalDis + '/ ' + ArrivalTime + '</div>';
                TTStext = '距離乘客' + PassName + '的' + TypeName + '還需' + ArrivalDis + '，約' + ArrivalTime + '鐘';
            } else {
                infocontent = '<div>距離終點 ' + ArrivalDis + '/ ' + ArrivalTime + '</div>';
                TTStext = '距離終點還需' + ArrivalDis + '約' + ArrivalTime + '鐘';
            }

            //TTS process
            executeAsync(function() {
                speak(TTStext);
            });

            CurrentPosMarker = new google.maps.Marker({
                position: CurrentPos,
                map: map,
                icon: "img/path_dot_3.png",
                title: CurrentPos.lat() + ", " + CurrentPos.lng()
            });

            CurrInfoWindow = new google.maps.InfoWindow();
            CurrInfoWindow.setOptions({
                content: infocontent,
                position: CurrentPos,
                zIndex: 999
            });
            CurrInfoWindow.open(map);
        }
    };
};

Driver.prototype = {
    //initial
    'Initialize': function() {
        //display carpool path in google polyline
        var p = this.GetPath();
        var thisPolyline = new google.maps.Polyline({
            path: p,
            geodesic: true,
            strokeColor: '#000',
            strokeOpacity: 0.7,
            strokeWeight: 8
        });
        thisPolyline.setMap(map);
        this.SetPathPolyline(thisPolyline); //save

        //set driver path start point and end point
        function SetMarkerForSE(latlng, type) {
            var marker = null;
            switch (type) {
                case 1:
                    marker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        icon: "img/start_pin.png",
                        title: latlng.lat() + ", " + latlng.lng()
                    });
                    break;
                case 2:
                    marker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        icon: "img/end_pin.png",
                        title: latlng.lat() + ", " + latlng.lng()
                    });
                    break;
            }
        };
        var points = [p[0], p[p.length - 1]];
        for (var i = 0; i < 2; i++)
            SetMarkerForSE(points[i], (i + 1));
    },

    //set function
    'SetPassList': function(s_passenger) {
        this.SetPassList(s_passenger);
    },
    'SetCurrentPos': function(s_currPos) { //=== 985
        this.SetCurrentPos(s_currPos);
    },
    'SetPath': function(s_Path) {
        this.Path = s_Path;
    },

    // get function
    'GetPassList': function() {
        return this.GetPassList();
    },
    'GetCurrentPos': function() {
        return this.GetCurrentPos();
    },
    'GetPath': function() {
        return this.Path;
    },
    'GetPassInfoWindowList': function() {
        return PassInfoWindow;
    },
    'AddPassenger': function(_passenger) {
        this.SetPassList(_passenger);
        this.SetPassInfoWindow(this.GetPassList().length - 1);
        this.FillOrderPoint(this.GetPassList().length - 1);
    },
    'RemovePassenger': function(_passenger) {
        _passenger.RemovedDriver();
        this.DeOrderPoint(_passenger.GetID());
        this.RemovePassInfoWindow(_passenger);
    },
    'Update': function(Type) {
        if (Type) {
            var path = this.GetPath();
            var Endpoint = path[path.length - 1];
            var nowPos = this.GetCurrentPos();
            var tempDes = [];
            var tempOrderPoint = this.GetOrderPoint();
            for (var i = 0; i < tempOrderPoint.length; i++)
                if (tempOrderPoint[i])
                    tempDes.push(tempOrderPoint[i].pos);
            tempDes.push(Endpoint);
            this.CalDisTime([nowPos], tempDes, this.SetCurrentPosMarker);
        } else {
            this.SetCurrentPosMarker(null, null, null, false);
        }
    },
    'CalDisTime': function(ori, des, callback) {
        var disMatCal = new google.maps.DistanceMatrixService();
        disMatCal.getDistanceMatrix({
            origins: ori,
            destinations: des,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: true,
            avoidTolls: true
        }, function(response, status) {
            callback(response, status, des, true);
        });
    },
    'DelOrderPoint': function(_pos) {
        this.RemoveOrderPoint(_pos);
    }
};

var getDistance = function(p1lat, p1lng, p2lat, p2lng) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = (p2lat - p1lat) * Math.PI / 180;
    var dLong = (p2lng - p1lng) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((p1lat * Math.PI / 180)) * Math.cos((p2lat * Math.PI / 180)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
};

function executeAsync(func) {
    setTimeout(func, 0);
}

function ConvertToGoogleLatLng(list) {
    var temp = [];
    for (var i = 0; i < list.length; i++)
        temp.push(new google.maps.LatLng(list[i].at, list[i].ng));
    return temp;
}

function DetectLocation(id, second, seton) {
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
    executeAsync(GetCurrentPos);
    var thisid = null;
    if (seton) {
        thisid = setInterval(GetCurrentPos, second * 1000);
    } else {
        clearInterval(thisid);
    }
}

function GetOthersLocation(data, second, seton) {
    executeAsync(function() {
        LocationDataTake(data);
    });
    var thisid = null;
    if (seton) {
        thisid = setInterval(function() {
            LocationDataTake(data);
        }, second * 1000);
    } else {
        clearInterval(thisid);
    }
}

function updateLocation(id, latitude, longitude) {
    var data = '{"id":"' + id + '","curpoint":[{"latitude":"' + latitude + '","longitude":"' + longitude + '"}]}';
    var url = server + 'update_location.php?data=' + data;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var pos = JSON.parse(xmlhttp.responseText);
            GOL_SELFPOS = new google.maps.LatLng(pos.latitude, pos.longitude);
            map.setCenter(GOL_SELFPOS);
        }
    }
    xmlhttp.send();
}

function resizeScreen() {
    //set map block height and width
    var docHight = $(document).height();
    var mapblockH = docHight - 70;

    $('#map-block').css('height', mapblockH + 'px');
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// PhoneGap is loaded and it is now safe to make calls PhoneGap methods

function onDeviceReady() {
    navigator.tts.startup(startupWin, fail);
}

function startupWin(result) {
    navigator.tts.setLanguage("zh-TW", win, fail);
}

function win(result) {
    console.log(result);
}

function fail(result) {
    console.log("Error = " + result);
}

function speak(tts) {
    navigator.tts.speak(tts);
}
