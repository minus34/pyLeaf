//var restUrl = "http://127.0.0.1:81/hex";
var restUrl = "../hex";
var maxStat = -999999999.0;
var minStat = 999999999.0;
var bdyLayer = null;
var map = null;
var geojsonLayer = null;
var startZoom = 12;
var bdyType = "";

//var colours = ['rgb(255,255,204)','rgb(217,240,163)','rgb(173,221,142)','rgb(120,198,121)','rgb(65,171,93)','rgb(35,132,67)','rgb(0,90,50)'];
var colours = ['rgb(237,248,251)','rgb(204,236,230)','rgb(153,216,201)','rgb(102,194,164)','rgb(65,174,118)','rgb(35,139,69)','rgb(0,88,36)'];
//var colours = ['rgb(215,48,39)','rgb(252,141,89)','rgb(254,224,139)','rgb(255,255,191)','rgb(217,239,139)','rgb(145,207,96)','rgb(26,152,80)'];

//Code from http://forum.jquery.com/topic/getting-value-from-a-querystring
// ***this goes on the global scope
// get querystring as an array split on "&"
var querystring = location.search.replace('?', '').split('&');

// declare object
var queryObj = {};

// loop through each name-value pair and populate object
for (var i = 0; i < querystring.length; i++) {
    // get name and value
    var name = querystring[i].split('=')[0];
    var value = querystring[i].split('=')[1];
    // populate object
    queryObj[name] = value;
}


//if (queryObj["zoom"] == undefined) {
//  startZoom = 12;
//} else {
//  startZoom = parseInt(queryObj["zoom"]);
//}

////Get table name to display
//bdyType = queryObj["bdy"];
//if (bdyType == undefined) bdyType = "hex";


function init() {
    //Add a new property for defining each bdy's appearance
    //L.GeoJSON.prototype.colourStat = null;

    //Initialize the map on the "map" div
    map = new L.Map('map');

    //load CartoDB basemap tiles
     var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
             attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
             subdomains: 'abcd',
             minZoom: 0,
             maxZoom: 12
     }).addTo(map);

//    var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
//            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
//            subdomains: 'abcd',
//            minZoom: 0,
//            maxZoom: 17
//    }).addTo(map);
    
    
//    //Add a WMS Layer from Geoserver
//    var cloudmade = new L.TileLayer.WMS("http://localhost:8080/geoserver/Test/wms", {
//        layers: 'Test:lga_2011_aust',
//        format: 'image/png',
//        transparent: false
//    });


    //Set the view to a given center and zoom
    map.setView(new L.LatLng(-33.85, 151.15), startZoom);

    //Acknowledge the ABS Census and ATO Tax Data
    map.attributionControl.addAttribution('2011 Census data © <a href="http://www.abs.gov.au/websitedbs/D3310114.nsf/Home/%C2%A9+Copyright">ABS</a>');

    //Get a new set of boundaries when map panned or zoomed
    //TO DO: Handle map movement due to popup
    map.on('moveend', function (e) {
        getBoundaries();
    });

    // map.on('zoomstart', function (e) {
        // try {
            // geojsonLayer.clearLayers();
        // }
        // catch(err) {
            // //dummy
        // }
    // });  
    
    map.on('zoomend', function (e) {
        map.closePopup();
        //getBoundaries();
    });

    //Get the first set of boundaries
    getBoundaries();
}

//// control that shows state info on hover
//var info = L.control();

//info.onAdd = function (map) {
//    this._div = L.DomUtil.create('div', 'info');
//    this.update();
//    return this._div;
//};

//info.update = function (props) {
//    this._div.innerHTML = '<h4>Tax / Income Ratio</h4>' + (props ?
//        '<b>' + props.name + '</b><br />' + props.stat + ' %'
//        : 'Hover over a postcode');
//};

//info.addTo(map);

// get color depending on population density value
function getColor(d) {

     // //Convert value for the zoom level
    // var factor;
    
    // if (zoomLevel < startZoom) {
      // factor = Math.pow(4, (startZoom - zoomLevel)) / 2;
    // } else {
      // //min level of hexes
      // factor = "1";
    // }

    // d = d / factor;

    //d *= 100; //Convert to percentages

  //Colorbrewer2.org Theme
  return d > 10000  ? colours[6]:
           d > 5000 ? colours[5]:
           d > 2500 ? colours[4]:
           d > 1000 ? colours[3]:
           d > 500  ? colours[2]:
           d > 250  ? colours[1]:
           d > 100  ? colours[0]:
                      colours[0];
    
  // //Oranges
  // return d > 7 ? '#800026':
         // d > 6 ? '#BD0026':
         // d > 5 ? '#E31A1C':
         // d > 4 ? '#FC4E2A':
         // d > 3 ? '#FD8D3C':
         // d > 2 ? '#FEB24C':
         // d > 1 ? '#FED976':
                    // '#FFEDA0';

  //Blue to red - looks dumb
  // return d > 7 ? '#FF0000':
           // d > 6 ? '#FFA500':
           // d > 5 ? '#FFA500':
           // d > 4 ? '#FFFF00':
           // d > 3 ? '#FFFF00':
           // d > 2 ? '#00FF00':
           // d > 1 ? '#0000FF':
                      // '#0000FF';                      
                      
  //Greens
  // return d > 7 ? '#00FF00':
           // d > 6 ? '#00DD00':
           // d > 5 ? '#00BB00':
           // d > 4 ? '#009900':
           // d > 3 ? '#007700':
           // d > 2 ? '#005500':
           // d > 1 ? '#003300':
                      // '#003300';

  // //Blues
  // return d > 7 ? '#0000FF':
           // d > 6 ? '#0000DD':
           // d > 5 ? '#0000BB':
           // d > 4 ? '#000099':
           // d > 3 ? '#000077':
           // d > 2 ? '#000055':
           // d > 1 ? '#000033':
                      // '#000033';                      

  // //Reds
  // return d > 7 ? '#FF0000':
           // d > 6 ? '#DD0000':
           // d > 5 ? '#BB0000':
           // d > 4 ? '#990000':
           // d > 3 ? '#770000':
           // d > 2 ? '#550000':
           // d > 1 ? '#330000':
                      // '#330000';
                      
                      }

function style(feature) {
    //TEST MAP THEME ONLY - ARBITRARY VALUES...
    //colVal = feature.id.substring(4, 6)
    colVal = feature.properties.count;

    return {
        weight: 1,
        opacity: 0.4,
        color: "#AAA",
        //dashArray: '3',
        fillOpacity: 0.5,
        fillColor: getColor(colVal)
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#0D0',
        //dashArray: '',
        fillOpacity: 0.9
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    //info.update(layer.feature.properties);
}


function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    //info.update();
}


function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}


function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
    
    layer.bindPopup(feature.properties.count + " PIF");
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

    //Get area (km2) to display
//    var areakm2 = getArea(zoomLevel);

    // if (zoomLevel < startZoom) {
      // areakm2 = Math.pow(2, (startZoom - zoomLevel)).toString();
    // } else {
      // //min level of hexes
      // areakm2 = "0_5";
    // }
    console.log(zoomLevel);


    //Get the table/view name for the query
    var tableName = 'grid_' + getWidth(zoomLevel) + '_counts';

    console.log(tableName);

//    if (bdyType == 'hex') {
//      tableName = "vw_iag_pif_hex_grid_" + areakm2;
//    } else if (bdyType == 'postcode'){
//      tableName = "vw_iag_pif_postcode";
//    } else {
//      tableName = "vw_iag_pif_hex_grid_" + areakm2; //default
//    }


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
    ua.push("&t=");
    ua.push(tableName);
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

function getWidth(zoomLevel){

  var minzoom = 13;

  if (zoomLevel > minzoom) {
    return "0_5"
  } else if (zoomLevel == minzoom) {
    return "1"
  } else {
    return Math.pow(2, (minzoom - zoomLevel) - 1).toString()
  }
}

