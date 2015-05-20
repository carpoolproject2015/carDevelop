$(document).ready(function() {
	url = window.location.toString();
	initialize();
});

			var url = window.location.toString();
			var id = "";
			var role = "";
			var json = "";
			var file = "";
			var pathStr = "";
			var driver_fid ="";
			var wait_time="";
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
			var per = 0;
			var totalL = 0;
			var passenger_path = "";
			var passenger_json = "";
			var normal_onoff = "";
			var count = 0;
			var ori_2 = [];
			var des_2 = [];
			var oris = [];
			var dess = [];
			
			var server = "http://52.68.75.40/ruei/www/api/";
			var local = "file:///android_asset/www/";
			
			initialize();
			function initialize()
			{
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
				
				DetectLocation(id, 10, true);	
				
				setURL();
			}
			function setURL()
			{
				document.getElementById("logo").href = 'http://noname0930.no-ip.org/carpool/index.html?data=' + '{"id":"' + id + '"}';
			}
			function pauseTime(millis) 
			{
				var date = new Date();
				var curDate = null;

				do { curDate = new Date(); } 
				while(curDate-date < millis);
			}	
			function requestAPI(url, data, gid)//傳資料給php
			{
				url += '?data=' + data;
				//console.log(url);
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open("GET", url, true);
				xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xmlhttp.onreadystatechange = function()
				{
					if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
					{
						if(gid == "path"){
							pathStr = xmlhttp.responseText;		//php回傳的路徑資料 --- json格式
							requestAPI(server + "filter2.php",file,"other");
							console.log("pathStr");
							
						}else if(gid == "other"){
						
							driver_fid = xmlhttp.responseText;	//回傳司機fid
							did = [];
							while(driver_fid.match(',') != null){
								var tt = driver_fid.substring(driver_fid.indexOf('\"')+1,driver_fid.indexOf(',')-1);
								did.push(tt);
								driver_fid = driver_fid.substring(driver_fid.indexOf(',')+1,driver_fid.lastIndexOf(']')+1);
							}
							did.push(driver_fid.substring(driver_fid.indexOf('\"')+1,driver_fid.lastIndexOf('\"')));
							console.log("did:"+ did);
							var getnow = '{"ids":[';
							for(var i = 0; i < did.length; i++){
								if(i != did.length - 1)
									getnow += '{"id":"' + did[i] + '"},';
								else
									getnow += '{"id":"' + did[i] + '"}]}';
							}
							console.log("getnow:" + getnow);
							requestAPI(server + "get_driver_now.php",getnow,"drivernow");
							
							
						}else if(gid == "drivernow"){
							var now = xmlhttp.responseText;
							now = JSON.parse(now);
							
							for(var i = 0; i < now.length ; i++){
								var nnow = JSON.parse(now[i]);
								console.log(nnow["latitude"] + ',' + nnow["longitude"]);
								dnow.push(new google.maps.LatLng(nnow["latitude"],nnow["longitude"]));
							}
							console.log("dnow:" + dnow);
							nextStep1();
							
						}else if(gid == "store"){
							console.log(finalres);
							var set_carpool = '{"id":"' + id + '","carpool":' + JSON.stringify(finalres[0]) + '}'; 
							console.log(set_carpool);
							requestAPI(server + "set_carpool.php",set_carpool,"update");
							
						}else if(gid == "update"){
							
							window.location = 'file:///android_asset/www/trace.html?data=' + jstr;
							
						}else {
							wait_time = xmlhttp.responseText;
							console.log("wait_time:" + wait_time);
							//console.log("data: " + data);
							//tempGid.push(parseInt(gid));
							
							if(oris.length == pathJSON2.length - count){
								for(var i = 0; i < oris.length; i++){
									CalDistance(oris[i], dess[i], indexid[i]);
									console.log(finalid[i]);
									//console.log("oris: " + oris[i]);
									//console.log("dess: " + dess[i]);
								}
							}
						}
					}

				}
				xmlhttp.send();
			}
			function CalDistance(ori, des, index) {
				var success = function(response, status) {
					if (status == google.maps.DistanceMatrixStatus.OK) {
						total++;
						console.log(total);
							
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
						console.log("dis_2:" + dis_2[0][0] + "|" + dis_2[1][1] +"|"+ dis_2[2][2] +"|"+ dis_2[3][3] + "|" + dis_2[4][4]);
						console.log("time_2:" + time_2[0][0] + "|" + time_2[1][1] +"|"+ time_2[2][2] +"|"+ time_2[3][3] + "|" + time_2[4][4]);
						
						var finalwait = 0;
						if(time_2[3][3] > time_2[1][1]){
							finalwait = time_2[3][3];
						}else{
							finalwait = time_2[1][1];
						}
						
						normal_onoff = '","on_d":"' + dis_2[1][1] + '","off_d":"' + dis_2[2][2] + '","wait":"' + finalwait;
						
						console.log("normal_onoff:" + normal_onoff );
						per = (dis_2[0][0] / totalL * 100);
						
						console.log(per);
						console.log(percentage);
						
						var tell = true;
						var dd = parseInt(distance);
						//共乘比率篩選
						if(per < percentage){
							//delete finalres[total - 1];
							finalres.shift();
							tell = false;
							console.log("tell-1");
						}//起點到上車點距離篩選
						else if(dis_2[1][1] > dd){		
							//delete finalres[total - 1];
							finalres.shift();
							tell = false;
							console.log("tell0");
						}//安全區間	
						else if(dis_2[4][4] <= 100){
							//delete finalres[total - 1];
							finalres.shift();
							tell = false;
						}//乘客願意等待時間與司機願意等待時間篩選
						else if(finalwait > wait_time * 60){
							//delete finalres[total - 1];
							finalres.shift();
							tell = false;
							console.log("tell1");
						}else if(finalwait > waiting * 60){
							//delete finalres[total - 1];
							finalres.shift();
							tell = false;
							console.log("tell2");
						}/*else{
							finalid.push(did[parseInt(index)]);
						}*/
						console.log('d:' + dis_2[1][1] + ',per:' + per + ',time:' + finalwait);
						console.log('wait_time:' + wait_time + ',' + 'waiting:' + waiting);
						console.log("tell:" + tell);
						
						//將路徑加入查詢結果
						if(tell && res_num != 0){//#########修改
							res_num++;	
									
							/*for(var i = 0; i < finalres.length; i++){
								var fr_temp = [];
								for(var j = 0; j < finalres[i].length;j++){
									fr_temp.push(new google.maps.LatLng(finalres[i][j].at,finalres[i][j].ng));
								}
								finalres[i] = fr_temp;
							}*/
					
							//console.log("finalres: " + finalres);
		
							//if(jstr != ""){
								//jstr = jstr + ',{"did":"' + did[parseInt(index)] + '","percentage":"' + per + normal_onoff + '"}';
							//}else{
								jstr = '"did":"' + did[parseInt(index)] + '"';
							//}
							
							console.log(jstr);
						}
						
						console.log(res_num + ", count:" + count);
						console.log(pathJSON2.length + "," + total);
						//符合的路徑數 + 不符合的路徑數 = 全部路徑數
						if((total + count) == pathJSON2.length){
							if(res_num != 0){
								//jstr += "";
								jstr = '{"id":"' + id + '",' + jstr + '}';
								alert("JSON:" + jstr);
								console.log("JSON:" + jstr);
								console.log('passenger_json:' + passenger_json);
								requestAPI(server + "requester.php",passenger_json,"store");	
							}
							else{
								alert("無符合條件之重疊路徑");
							}
						}
						
					}else{
						total++;
						console.log(total);
						console.log("Failed!!!");
						
						finalres.shift();
						
						if((total + count) == pathJSON2.length){
							if(res_num != 0){
								jstr += "]";
								jstr = '{"id":"' + id + '","result":' + jstr + '}';
								alert("JSON:" + jstr);
								console.log("JSON:" + jstr);
								console.log('passenger_json:' + passenger_json);
								requestAPI(server + "requester.php",passenger_json,"store");	
							}
							else{
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
			function nextStep1(){//比對路徑
				pathJSON2 = JSON.parse(decodeURIComponent(pathStr));//解碼JSON
				console.log(pathJSON);//司機與乘客路徑陣列
				
				if(pathJSON2.length == 0) //代表沒有符合的司機
					alert("無司機符合篩選結果");//直接跳至無司機符合篩選結果
				
				var p1 = ConvertToGoogleLatLng(JSON.parse(passenger_path));//乘客路徑pathJSON2[pathJSON2.length-1]
				
				count = 0;
				console.log("pathJSON2.length:" + pathJSON2.length);
				for(var i=0;i < pathJSON2.length ;i++){
					
					var p2 = ConvertToGoogleLatLng(JSON.parse(pathJSON2[i]));//司機路徑
					console.log(p1);
					console.log(p2);
					oidd = PathCompare(p1, p2, true);
					console.log("oidd:" + oidd);
					
					if(oidd != null){
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

						finalres.push(oidToDB[0]);

						//finalres.push(oidd[0]);	//儲存共乘路徑

						ori_2 = [];
						des_2 = [];
						
						ori_2.push(oidd[0][0]);
						ori_2.push(p1[0]);
						ori_2.push(p1[p1.length - 1]);
						ori_2.push(dnow[i]);
						ori_2.push(dnow[i]);
						
						des_2.push(oidd[0][oidd[0].length - 1]);//計算共乘距離				
						des_2.push(oidd[0][0]);//計算乘客起點到上車點的距離
						des_2.push(oidd[0][oidd[0].length - 1]);//計算下車點與乘客終點的距離
						des_2.push(oidd[0][0]);//計算司機到上車點距離
						des_2.push(p1[0]);//計算司機與乘客目前距離
						
						oris.push(ori_2);
						dess.push(des_2);
						
						var temp = '{"id":"' + did[i] +'"}';
						console.log("temp:" + temp);
						finalid.push(temp);
						indexid.push(i);
		
					}else{
						count++;
					}
					
				}
				console.log(count);
				
				if(count == pathJSON2.length){
					alert("無符合條件之重疊路徑");
				}else{
					requestAPI(server + "get_wait.php",finalid[0],indexid[0]);
				}
				
				
				
			}
			function nextStep(pathJSON, PathLength)
			{
				passenger_path = "";
				passenger_path = pathJSON;
				totaL = PathLength;
				count = 0;
				//var jj = json + "";
				json = JSON.stringify(json);
				console.log("json " + json);
				//var pathTemp = ConvertToGoogleLatLng(JSON.parse(pathJSON));
				pathTemp = JSON.parse(pathJSON);
				totalL = PathLength;
				//乘客路徑JSON
				console.log("Path json: " + pathJSON);
				passenger_json = file.substring(0, file.length - 1) + ',"path":' + pathJSON 
				+ ',"start":' + '{"latitude":"' + (new Number(StartPoint.lat())).toFixed(14) + '","longitude":"' + (new Number(StartPoint.lng())).toFixed(14) + '"}' 
				+ ',"end":' + '{"latitude":"' + (new Number(pathTemp[pathTemp.length - 1].at)).toFixed(14) + '","longitude":"' + (new Number(pathTemp[pathTemp.length - 1].ng)).toFixed(14) + '"}}';

				
				json = json.substring(0, json.length - 1) + ',"path":' + pathJSON + '}';
				
				console.log("role: " + role);
				console.log("driver_json: " + json);
				
				if(role == "driver")
				{
					var url = "";
					url = server + 'reciever.php?data=' + json;
					
					var xmlhttp = new XMLHttpRequest();
					xmlhttp.open("GET", url, true);
					xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");		
					xmlhttp.onreadystatechange = function() 
					{
						if(xmlhttp.readyState == 4 && xmlhttp.status == 200) 
						{		
							alert("trace_json: " + '{"role":"driver","id":"' + id + '"}');
							window.location = local + 'trace.html?data={"role":"driver","id":"' + id + '"}';
						}
					}
					xmlhttp.send();	
				}
				else if(role == "passenger")
				{					
				
					console.log("passenger_json:" + passenger_json);
					console.log("file:" + file);
					requestAPI(server + "filter.php",file,"path");

				}			
				
			}