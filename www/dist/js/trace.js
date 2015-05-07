$(document).ready(function() {
    initialize();

    document.addEventListener("deviceready", onDeviceReady, false);
});

//global variables
var map;
var DELTANUMBER = 5; //ERROR NUMBER IN 2 METER

//http://noname0930.no-ip.org/carpool/trace.html?data={%22role%22:%22driver%22,%20%22id%22:%221046779538684826%22}

var id = "";
var json = "";
var role = "";
var trace = "";
var tid = "";
var server = "http://noname0930.no-ip.org/carpool/api/";
var local = "file:///android_asset/www/";

function initialize() {
    console.log("ABC");

    var url = window.location.toString();
    var str = url.substring(url.indexOf("{"), url.length);

    json = JSON.parse(decodeURIComponent(str));

    id = json.id;
    role = json.role;
    trace = json.trace;

    if (role == "driver") {
        if (trace) {
            console.log("ABC");
            var arrayObj = {
                'array': null
            };
            var tmpList = [];
            for (var i = 0; i < trace.length; i++) {
                tmpList.push({
                    'id': trace[i].pid
                });
            }
            arrayObj.array = tmpList;
            var temp = JSON.stringify(arrayObj);
            TrackDataTake(temp);
            console.log(temp);
            DriverDataTake(temp);
        } else {
            var str = '{"array":[{"id":"' + id + '"}]' + '}';
            console.log(str);
            DriverDataTake(str);
        }
    } else if (role == "passenger") {
        did = trace[0].did;
    }

    DetectLocation(id, 5, true);

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

function TrackDataTake(data) {
    var temp = '{"role":"driver",' + data.substring(1, data.length);
    var url = server + 'get_location.php?data=' + temp;
    console.log("URL " + url);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var data = JSON.parse(xmlhttp.responseText);
            console.log(data);
            GOL_FROMDATABASE = [];
            for (var i = 0; i < data.length; i++)
                GOL_FROMDATABASE.push(new google.maps.LatLng(data[i].latitude, data[i].longitude));
            console.log(GOL_FROMDATABASE);

        }
    }
    xmlhttp.send();
}

function DriverDataTake(data) {
    var url = server + 'get_receiver.php?data=' + data;
    console.log("URL " + url);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var Driver = JSON.parse(xmlhttp.responseText);
            //PathAndLocationDataTake(data);
            TrackingInput(Driver, 1);
        }
    }
    xmlhttp.send();
}

function PathAndLocationDataTake(data) {
    var url = server + 'get_tracker.php?data=' + data;
    console.log("URL " + url);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var Passenger = JSON.parse(xmlhttp.responseText);
            TrackingInput(Passenger, 2);
        }
    }
    xmlhttp.send();
}

function TrackingInput(data, type) {
    console.log(data);
    console.log(type);
    var user = (role == "driver") ? 1 : 2;
    //driver
    if (type == 1) {
        //Tracking(type, user, driverdata, passengerdata) {
        var tmpDriver = {
            'name': data[0].name,
            'path': ConvertToGoogleLatLng(data[0].path)
        };

        Tracking(0, user, tmpDriver, null);
    } else if (type == 2) {
        var tmpPassList = [];
        for (var i = 0; i < data.length; i++)
            tmpPassList.push({
                'name': data[i].name,
                'startpoint': new google.maps.LatLng(data[i].start.latitude, data[i].start.longitude),
                'endpoint': new google.maps.LatLng(data[i].end.latitude, data[i].end.longitude),
                'carpoolpath': ConvertToGoogleLatLng(data[i].carpoolpath[0])
            });
        if (tmpPassList.length == 0)
            tmpPassList = null;
        Tracking(data.length, user, null, tmpPassList);
    }
}

var GOL_SELFPOS = null;
var GOL_FROMDATABASE = null;

function Tracking(type, user, driverdata, passengerdata) {
    //set map options
    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(23.00106, 120.20875)
    };
    // ================================================================  above notice

    //set map
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    console.log(driverdata);
    //User Type =1 is passenger look
    //driver
    var driver;
    if (driverdata) {
        driver = new Driver(driverdata.name, driverdata.path);
        driver.Initialize();
    }

    if (type == 0) {
        var DriverInterval;

        DriverInterval = setInterval(function() {
            var DriverCurPos;
            var DriverOldCurPos;
            if (GOL_SELFPOS) {
                DriverCurPos = GOL_SELFPOS;
                DriverOldCurPos = DriverCurPos;
                console.log(DriverCurPos);
                // ======================================================================================================================================LATER CHECK
                if (user == 2)
                    DriverCurPos = GOL_SELFPOS;
                else
                    DriverCurPos = GOL_FROMDATABASE;
                // ======================================================================================================================================LATER CHECK
                //if (DriverOldCurPos.k != DriverCurPos.k || DriverOldCurPos.lng() != DriverCurPos.lng()) {
                DriverOldCurPos = DriverCurPos;
                driver.SetCurrentPos(DriverCurPos);
                driver.SetCurrentPos(GOL_SELFPOS);
                driver.Update(true);
                //}
            }
        }, 15000);
    } else if (type == 1) {
        var PassengerCurPos = null;
        var DriverCurPos = null;

        var PassengerOldCurPos = null;
        var DriverOldCurPos = null;

        var PassInterval;
        var DriverInterval;

        //passenger1
        var passenger1 = new Passenger(
            passengerdata[0].name,
            passengerdata[0].startpoint,
            passengerdata[0].endpoint,
            passengerdata[0].carpoolpath[0],
            passengerdata[0].carpoolpath[passengerdata[0].carpoolpath.length - 1],
            passengerdata[0].carpoolpath);
        passenger1.Initialize();
        driver.AddPassenger(passenger1);

        // ======================================================================================================================================LATER CHECK
        if (user == 1) { //1 is passenger
            PassengerCurPos = GOL_SELFPOS;
            DriverCurPos = GOL_FROMDATABASE;
        } else if (user == 2) {
            PassengerCurPos = GOL_FROMDATABASE;
            DriverCurPos = GOL_SELFPOS;
        }
        // ======================================================================================================================================LATER CHECK

        PassengerOldCurPos = PassengerCurPos;
        DriverOldCurPos = DriverCurPos;

        passenger1.SetCurrentPos(PassengerCurPos);
        passenger1.Update(true);

        PassInterval = setInterval(function() {
            // ======================================================================================================================================LATER CHECK
            if (user == 1)
                PassengerCurPos = GOL_SELFPOS;
            else
                PassengerCurPos = GOL_FROMDATABASE;

            // ======================================================================================================================================LATER CHECK
            if (PassengerOldCurPos.lat() != PassengerCurPos.lat() || PassengerOldCurPos.lng() != PassengerCurPos.lng()) {
                PassengerOldCurPos = PassengerCurPos;
                passenger1.SetCurrentPos(PassengerCurPos);
                passenger1.Update(true);
            }
        }, 60000);

        var PassGetPos = passenger1.GetGetPoint();
        var PassDownPos = passenger1.GetDownPoint();
        // ======================================================================================================================================LATER CHECK
        var DriverEndPos = driverdata.path[driverdata.path.length - 1];
        // ======================================================================================================================================LATER CHECK

        //distance
        var PassengerToGetPoint;
        var PassengerToDriver;
        var PassengerToDownPoint;
        var DriverToDownPoint;
        var DriverToDEndPoint;

        driver.SetCurrentPos(DriverCurPos);
        driver.Update(true);

        DriverInterval = setInterval(function() {
            // ======================================================================================================================================LATER CHECK
            if (user == 2)
                DriverCurPos = GOL_SELFPOS;
            else
                DriverCurPos = GOL_FROMDATABASE;
            // ======================================================================================================================================LATER CHECK
            if (DriverOldCurPos.lat() != DriverCurPos.lat() || DriverOldCurPos.lng() != DriverCurPos.lng()) {
                DriverOldCurPos = DriverCurPos;
                driver.SetCurrentPos(DriverCurPos);
                driver.Update(true);
            }

            executeAsync(function() {
                //DISTANCE
                PassengerToDriver = getDistance(PassengerCurPos.lat(), PassengerCurPos.lng(), DriverCurPos.lat(), DriverCurPos.lng());
                PassengerToGetPoint = getDistance(PassengerCurPos.lat(), PassengerCurPos.lng(), PassGetPos.lat(), PassGetPos.lng());
                //GET IN CAR
                if (PassengerToGetPoint <= DELTANUMBER && PassengerToDriver <= DELTANUMBER) {
                    passenger1.Getin(driver);
                    passenger1.Update(false);
                    clearInterval(PassInterval);
                }
            });

            executeAsync(function() {
                PassengerToDownPoint = getDistance(PassengerCurPos.lat(), PassengerCurPos.lng(), PassDownPos.lat(), PassDownPos.lng());
                DriverToDownPoint = getDistance(DriverCurPos.lat(), DriverCurPos.lng(), PassDownPos.lat(), PassDownPos.lng());
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv END PROCESS
                //GET OUT OF CAR
                if (PassengerToDownPoint <= DELTANUMBER && DriverToDownPoint <= DELTANUMBER)
                    passenger1.Getoutof(driver);
                // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ END PROCESS
            });

            executeAsync(function() {
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv END PROCESS
                DriverToDEndPoint = getDistance(DriverCurPos.lat(), DriverCurPos.lng(), DriverEndPos.lat(), DriverEndPos.lng());
                if (DriverToDEndPoint <= DELTANUMBER)
                    clearInterval(DriverInterval);
                // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ END PROCESS
            });
        }, 60000);
    } else if (type == 2) { //must driver
        var passengerArray = [];
        var passengerInterval = [];

        var PassengerCurPos = [];
        var DriverCurPos = null;

        var PassengerOldCurPos = [];
        var DriverOldCurPos = null;

        for (var i = 0; i < passengerdata.length; i++) {
            passengerArray.push(new Passenger(
                passengerdata[i].name,
                passengerdata[i].startpoint,
                passengerdata[i].endpoint,
                passengerdata[i].carpoolpath[0],
                passengerdata[i].carpoolpath[passengerdata[i].carpoolpath.length - 1],
                passengerdata[i].carpoolpath));
            passengerArray[i].Initialize();
            driver.AddPassenger(passengerArray[i]);
        }

        // ======================================================================================================================================LATER CHECK
        for (var i = 0; i < GOL_FROMDATABASE.length; i++) {
            PassengerCurPos.push(GOL_FROMDATABASE[i]);
            PassengerOldCurPos.push(GOL_FROMDATABASE[i]);
        }

        DriverCurPos = GOL_SELFPOS;
        DriverOldCurPos = DriverCurPos;
        // ======================================================================================================================================LATER CHECK

        for (var i = 0; i < passengerArray.length; i++) {
            passengerArray[i].SetCurrentPos(PassengerCurPos[i]);
            passengerArray[i].Update(true);

            var tmpIntervalID = setInterval(function() {
                // ======================================================================================================================================LATER CHECK
                PassengerCurPos[i] = GOL_FROMDATABASE[i];
                // ======================================================================================================================================LATER CHECK
                if (PassengerOldCurPos[i].lat() != PassengerCurPos[i].lat() || PassengerOldCurPos[i].lng() != PassengerCurPos[i].lng()) {
                    PassengerOldCurPos[i] = PassengerCurPos[i];
                    passengerArray[i].SetCurrentPos(PassengerCurPos[i]);
                    passengerArray[i].Update(true);
                }
            }, 60000);

            passengerInterval.push(tmpIntervalID);
        }

        driver.SetCurrentPos(DriverCurPos);
        driver.Update(true);

        // ======================================================================================================================================LATER CHECK
        var DriverEndPos = driverdata.path[driverdata.path.length - 1];
        // ======================================================================================================================================LATER CHECK

        //distance
        var PassengerToGetPoint;
        var PassengerToDriver;
        var PassengerToDownPoint;
        var DriverToDownPoint;
        var DriverToDEndPoint;
        var PassGetPos;
        var PassDownPos;

        DriverInterval = setInterval(function() {
            // ======================================================================================================================================LATER CHECK
            DriverCurPos = GOL_SELFPOS;
            // ======================================================================================================================================LATER CHECK

            if (DriverOldCurPos.lat() != DriverCurPos.lat() || DriverOldCurPos.lng() != DriverCurPos.lng()) {
                DriverOldCurPos = DriverCurPos;
                driver.SetCurrentPos(DriverCurPos);
                driver.Update(true);
            }

            for (var i = 0; i < passengerArray.length; i++) {
                PassGetPos = passengerArray[i].GetGetPoint();
                PassDownPos = passengerArray[i].GetDownPoint();

                executeAsync(function() {
                    //DISTANCE
                    PassengerToDriver = getDistance(PassengerCurPos[i].lat(), PassengerCurPos[i].lng(), DriverCurPos.lat(), DriverCurPos.lng());
                    PassengerToGetPoint = getDistance(PassengerCurPos[i].lat(), PassengerCurPos[i].lng(), PassGetPos.lat(), PassGetPos.lng());
                    //GET IN CAR
                    if (PassengerToGetPoint <= DELTANUMBER && PassengerToDriver <= DELTANUMBER) {
                        passengerArray[i].Getin(driver);
                        passengerArray[i].Update(false);
                        clearInterval(PassInterval);
                    }
                });

                executeAsync(function() {
                    PassengerToDownPoint = getDistance(PassengerCurPos[i].lat(), PassengerCurPos[i].lng(), PassDownPos.lat(), PassDownPos.lng());
                    DriverToDownPoint = getDistance(DriverCurPos.lat(), DriverCurPos.lng(), PassDownPos.lat(), PassDownPos.lng());
                    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv END PROCESS
                    //GET OUT OF CAR
                    if (PassengerToDownPoint <= DELTANUMBER && DriverToDownPoint <= DELTANUMBER)
                        passengerArray[i].Getoutof(driver);
                    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ END PROCESS
                });

                executeAsync(function() {
                    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv END PROCESS
                    DriverToDEndPoint = getDistance(DriverCurPos.lat(), DriverCurPos.lng(), DriverEndPos.lat(), DriverEndPos.lng());
                    if (DriverToDEndPoint <= DELTANUMBER)
                        clearInterval(DriverInterval);
                    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ END PROCESS
                });
            }
        }, 60000);
    }
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
        var thisPath = this.GetPath();
        this.SetPathPolyline(new google.maps.Polyline({
            path: thisPath,
            geodesic: true,
            strokeColor: '#FF0',
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
        if (PassList.length < PassNum) {
            s_PassList.SetID(PassList.length);
            PassList.push(s_PassList);
        }
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

            for (var i = 0; i < Lists.length; i++)
                DistanceList.push(Lists[i].distance.value);

            var MinIndex = 0;
            var minIndexLoopMin = DistanceList[0];
            for (var i = 1; i < DistanceList.length; i++) {
                if (DistanceList[i] < minIndexLoopMin) {
                    MinIndex = i;
                    minIndexLoopMin = DistanceList[i];
                }
            }

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
            if (OrderPoint.length == 0) {
                TargetPoint = des[0];
            } else {
                try {
                    PassName = PassList[TargetPoint.id].GetName();
                } catch (e) {
                    console.log('TargetPoint');
                    console.log(TargetPoint);
                    console.log('MinIndex');
                    console.log(MinIndex);
                    console.log('des');
                    console.log(des);
                    console.log('OrderPoint');
                    console.log(OrderPoint);
                }


                if (TargetPoint.type == 1) {
                    if (CurrentType != 1)
                        CurrentType = 1;
                    TypeName = "上車點";
                } else if (TargetPoint.type == 1) {
                    if (CurrentType != 2)
                        CurrentType = 2;
                    TypeName = "下車點";
                }
            }
            ArrivalDis = Lists[MinIndex].distance.text;
            ArrivalTime = Lists[MinIndex].duration.text;

            //TTS process


            //setMarker
            if (CurrentPosMarker != null)
                CurrentPosMarker.setMap(null);

            if (CurrInfoWindow != null)
                CurrInfoWindow.setMap(null);

            // ===================================================================================================== TTS TEXT INPUT

            var infocontent;

            if (OrderPoint.length != 0) {
                infocontent = '<div>距離乘客: ' + PassName + ' 的' + TypeName + '<br> ' + ArrivalDis + '/ ' + ArrivalTime + '</div>';
                TTStext = '距離乘客' + PassName + '的' + TypeName + '還需' + ArrivalDis + '，約' + ArrivalTime + '鐘';
            } else {
                infocontent = '<div>距離終點 ' + ArrivalDis + '/ ' + ArrivalTime + '</div>';
                TTStext = '距離終點還需' + ArrivalDis + '約' + ArrivalTime + '鐘';
            }

            // executeAsync(speak(TTStext));

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
        console.log(s_currPos);
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
            console.log(Endpoint);
            console.log(nowPos);
            console.log(tempOrderPoint);
            console.log(tempDes);
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
            console.log(status);
            console.log(response);
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
    var thisid = null;
    if (seton) {
        thisid = setInterval(GetCurrentPos, second * 1000);
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
        }
    }
    xmlhttp.send();
}

// PhoneGap is loaded and it is now safe to make calls PhoneGap methods
//
// function onDeviceReady() {
//     navigator.tts.startup(startupWin, fail);
// }

// function startupWin(result) {
//     navigator.tts.setLanguage("zh-TW", win, fail);
// }

// function win(result) {
//     console.log(result);
// }

// function fail(result) {
//     console.log("Error = " + result);
// }

// function speak(tts) {
//     navigator.tts.speak(tts);
// }
