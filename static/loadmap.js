var restUrl = "../hex";
var map = null;
var info = null;
var geojsonLayer = null;
var startZoom = 11;


var colours = ['rgb(255,255,204)','rgb(255,237,160)','rgb(254,217,118)','rgb(254,178,76)','rgb(253,141,60)','rgb(252,78,42)','rgb(227,26,28)','rgb(189,0,38)','rgb(128,0,38)']
//var colours = ['rgb(215,48,39)','rgb(252,141,89)','rgb(254,224,144)','rgb(255,255,191)','rgb(224,243,248)','rgb(145,191,219)','rgb(69,117,180)'];
//var colours = ['rgb(255,255,204)','rgb(217,240,163)','rgb(173,221,142)','rgb(120,198,121)','rgb(65,171,93)','rgb(35,132,67)','rgb(0,90,50)'];
//var colours = ['rgb(237,248,251)','rgb(204,236,230)','rgb(153,216,201)','rgb(102,194,164)','rgb(65,174,118)','rgb(35,139,69)','rgb(0,88,36)'];
//var colours = ['rgb(215,48,39)','rgb(252,141,89)','rgb(254,224,139)','rgb(255,255,191)','rgb(217,239,139)','rgb(145,207,96)','rgb(26,152,80)'];

//Code from http://forum.jquery.com/topic/getting-value-from-a-querystring
// ***this goes on the global scope
// get querystring as an array split on "&"
//var querystring = location.search.replace('?', '').split('&');
//
//// declare object
//var queryObj = {};
//
//// loop through each name-value pair and populate object
//for (var i = 0; i < querystring.length; i++) {
//    // get name and value
//    var name = querystring[i].split('=')[0];
//    var value = querystring[i].split('=')[1];
//    // populate object
//    queryObj[name] = value;
//}


//if (queryObj["zoom"] == undefined) {
//  startZoom = 12;
//} else {
//  startZoom = parseInt(queryObj["zoom"]);
//}

////Get table name to display
//bdyType = queryObj["bdy"];
//if (bdyType == undefined) bdyType = "hex";


function init() {
    //Initialize the map on the "map" div
    map = new L.Map('map');

    //load CartoDB basemap tiles
//     var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
//             attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
//             subdomains: 'abcd',
//             minZoom: 0,
//             maxZoom: 12
//     }).addTo(map);

    var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 12
    }).addTo(map);

    //Set the view to a given center and zoom
    map.setView(new L.LatLng(-33.85, 151.15), startZoom);

    //Acknowledge the ABS Census and ATO Tax Data
    map.attributionControl.addAttribution('2011 Census data © <a href="http://www.abs.gov.au/websitedbs/D3310114.nsf/Home/%C2%A9+Copyright">ABS</a>');

    // control that shows hex info on hover
    info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>Population</h4>' + (props ? '<b>' + props.cnt.toLocaleString(['en-AU']) + '</b>' : 'pick a hex');
    };

    info.addTo(map);

    //Get a new set of boundaries when map panned or zoomed
    //TO DO: Handle map movement due to popup
    map.on('moveend', function (e) {
        getBoundaries();
    });

//    map.on('zoomstart', function (e) {
//        try {
//            geojsonLayer.clearLayers();
//        }
//        catch(err) {
//            //dummy
//        }
//    });
    
    map.on('zoomend', function (e) {
        map.closePopup();
        //getBoundaries();
    });

    //Get the first set of boundaries
    getBoundaries();
}



function style(feature) {

    var renderVal = feature.properties.op;

    return {
        weight: 1,
        opacity: renderVal * 0.1,
        color: getColor(renderVal),
        fillOpacity: renderVal,
        fillColor: getColor(renderVal)
    };
}

// get color depending on population density value
function getColor(d) {

  return d > 0.9 ? colours[9]:
         d > 0.8 ? colours[8]:
         d > 0.7 ? colours[7]:
         d > 0.6 ? colours[6]:
         d > 0.5 ? colours[5]:
         d > 0.4 ? colours[4]:
         d > 0.3 ? colours[3]:
         d > 0.2 ? colours[2]:
         d > 0.1 ? colours[1]:
                   colours[0];
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#300',
        opacity: 0.8
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
        //click: zoomToFeature
    });
    
    //layer.bindPopup(feature.properties.count + " PIF");
}

//var legend = L.control({ position: 'bottomright' });

//legend.onAdd = function (map) {

//    var div = L.DomUtil.create('div', 'info legend'),
//        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
//        labels = [],
//        from, to;

//    for (var i = 0; i < grades.length; i++) {
//        from = grades[i];
//        to = grades[i + 1];

//        labels.push(
//            '<i style="background:' + getColor(from + 1) + '"></i> ' +
//            from + (to ? '&ndash;' + to : '+'));
//    }

//    div.innerHTML = labels.join('<br>');
//    return div;
//};

//legend.addTo(map);

function getBoundaries() {

    //Get map extents
    var bb = map.getBounds();
    var sw = bb.getSouthWest();
    var ne = bb.getNorthEast();

    //Get zoom level
    zoomLevel = map.getZoom();
    console.log(zoomLevel);

    //Build URL with querystring - selects census bdy attributes, stats and the census boundary geometries as minimised GeoJSON objects
    var ua = [];
    ua.push(restUrl);
    ua.push("?ml=");
    ua.push(sw.lng.toString());
    ua.push("&mb=");
    ua.push(sw.lat.toString());
    ua.push("&mr=");
    ua.push(ne.lng.toString());
    ua.push("&mt=");
    ua.push(ne.lat.toString());
    ua.push("&z=");
    ua.push(zoomLevel.toString());
    var reqStr = ua.join('');

    //Fire off AJAX request
    $.getJSON(reqStr, loadBdysNew);
}

function loadBdysNew(json) {
    if (json != null) {
        try {
            geojsonLayer.clearLayers();
        }
        catch(err) {
            //dummy
        }

        geojsonLayer = L.geoJson(json, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    }
}
