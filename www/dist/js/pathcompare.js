function PathCompare(p1, p2, directive) {
    function COMP(a, b) {
        return (a.A == b.A && a.F == b.F) ? true : false;
    };

    var OverlapBox = {
        'top': null,
        'low': null,
        'left': null,
        'right': null
    };

    //find bound
    var fb_lats = [];
    var fb_lngs = [];
    for (var i = 0; i < p1.length; i++)
        if (!fb_lats[0]) {
            fb_lats.push([p1[i].A]);
            fb_lngs.push([p1[i].F]);
        } else {
            fb_lats[0].push(p1[i].A);
            fb_lngs[0].push([p1[i].F]);
        }
    for (var i = 0; i < p2.length; i++)
        if (!fb_lats[1]) {
            fb_lats.push([p2[i].A]);
            fb_lngs.push([p2[i].F]);
        } else {
            fb_lats[1].push(p2[i].A);
            fb_lngs[1].push([p2[i].F]);
        }
    var fb_rect = [];
    for (var i = 0; i < 2; i++)
        fb_rect.push([
            Math.max.apply(null, fb_lats[i]),
            Math.min.apply(null, fb_lats[i]),
            Math.min.apply(null, fb_lngs[i]),
            Math.max.apply(null, fb_lngs[i])
        ]);
    if (!(fb_rect[0][3] < fb_rect[1][2] || fb_rect[0][2] > fb_rect[1][3] || fb_rect[0][0] < fb_rect[1][1] || fb_rect[0][1] > fb_rect[1][0])) {
        var v = [fb_rect[0][0], fb_rect[0][1], fb_rect[1][0], fb_rect[1][1]].sort();
        var h = [fb_rect[0][3], fb_rect[0][2], fb_rect[1][3], fb_rect[1][2]].sort();
        OverlapBox.top = v[2];
        OverlapBox.low = v[1];
        OverlapBox.right = h[2];
        OverlapBox.left = h[1];

        //shrink dots
        var p = [p1, p2];
        var PathsRedots = [];
        for (var i = 0; i < 2; i++) {
            PathsRedots.push([]);
            for (var j = 0; j < p[i].length; j++) {
                var sd_B_lat = (OverlapBox.low <= p[i][j].A) && (p[i][j].A <= OverlapBox.top);
                var sd_B_ng = (OverlapBox.left <= p[i][j].F) && (p[i][j].F <= OverlapBox.right);

                if (sd_B_lat && sd_B_ng)
                    PathsRedots[i].push(j);
            }
        }

        //compare result
        var cr_arr = [];
        var cr_arrn = 0;
        var cr_arrtn = 0;
        var directArr = [];
        for (var z = 0; z < PathsRedots[0].length; z++) { //path 1 :passenger
            for (var x = 0; x < PathsRedots[1].length; x++) {
                if (COMP(p[0][PathsRedots[0][z]], p[1][PathsRedots[1][x]])) {
                    if (!cr_arr[0]) {
                        cr_arr.push([z]);
                        directArr.push([x]);
                    } else {
                        var absv = Math.abs(cr_arr[cr_arrn][cr_arrtn] - z);
                        if (absv == 1) {
                            cr_arr[cr_arrn][++cr_arrtn] = z; //push path 1 : passenger dots
                            directArr[cr_arrn][cr_arrtn] = x;
                        } else {
                            cr_arrtn = 0;
                            cr_arrn++;
                            cr_arr.push([z]);
                            directArr.push([x]);
                        }
                    }
                }
            }
        }

        //output intersection
        var oid = [];
        for (var i = 0; i < cr_arr.length; i++) {
            if (cr_arr[i].length > 1) {
                var path1direct = (cr_arr[i][1] - cr_arr[i][0]) > 0;
                var path2direct = (directArr[i][1] - directArr[i][0]) > 0;

                if (directive) {
                    if (path1direct ? path2direct : !path2direct) {
                        oid.push([]);
                        for (var j = 0; j < cr_arr[i].length; j++) {
                            oid[i].push(p[0][PathsRedots[0][cr_arr[i][j]]]); //push passenger dots
                        }
                    }
                } else {
                    oid.push([]);
                    for (var j = 0; j < cr_arr[i].length; j++) {
                        oid[i].push(p[0][PathsRedots[0][cr_arr[i][j]]]); //push passenger dots
                    }
                }
            }
        }
        if (oid.length == 0)
            return null;
        return oid;
    } else {
        return null;
    }
}

function ConvertToGoogleLatLng(list) {
    var temp = [];
    for (var i = 0; i < list.length; i++)
        temp.push(new google.maps.LatLng(list[i].A, list[i].F));
    return temp;
}
