//CORS:n aktivointi, mahdollistaa pyyntöjen tekemisen verkkopiirin ulkopuolelta (domain)
(function() {
  var cors_api_host = 'cors-anywhere.herokuapp.com';
  var cors_api_url = 'https://' + cors_api_host + '/';
  var slice = [].slice;
  var origin = window.location.protocol + '//' + window.location.host;
  var open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    var args = slice.call(arguments);
    var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
    if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
      targetOrigin[1] !== cors_api_host) {
      args[1] = cors_api_url + args[1];
    }
    return open.apply(this, args);
  };
})();


function change_layer() {
  var valinta = document.getElementById('taso_filter');
  var valinta_arvo = valinta.value;
    
  if (valinta_arvo == 'testi1') {
    alert('testiääääää!');
  }
  else if (valinta_arvo == 'testi2') {
    tasot.addTo(map);
  }
}
  
  
  
function init() {
    	
  //BASEMAP
  var map = L.map('map', {
    center: new L.LatLng(60.1708, 24.9375),
    zoom: 13,
    minZoom: 11,
    maxZoom: 18,
  });
  	
  //Scale
  L.control.scale().addTo(map);
  	
  	
  //WFS-tasot lisataan tasot grouppiin
  var tasot = new L.LayerGroup();
  
  
  var basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGVzb25ldDEiLCJhIjoiY2lqNXJua2k5MDAwaDI3bTNmaGZqc2ZuaSJ9.nmLkOlsQKzwMir9DfmCNPg', {
    maxZoom: 18,
    /*attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',*/
    id: 'mapbox.light'
  }).addTo(map);
	
  	
  	
  //WFS-tasot
  var viheralueet_wfs = "http://geoserver.hel.fi/geoserver/hkr/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hkr:ylre_viheralue&srsName=EPSG:4326&format=json&outputFormat=json&format_options=callback:getJson"
  //var paavo_kartta = "http://geoserv.stat.fi:8080/geoserver/postialue/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=postialue:pno_tilasto_2015&filter=%3CPropertyIsEqualTo%3E%3CPropertyName%3Ekunta%3C/PropertyName%3E%3CLiteral%3E091%3C/Literal%3E%3C/PropertyIsEqualTo%3E&maxFeatures=1000&srsName=EPSG:4326&format=json&outputFormat=json&format_options=callback:getJson";
  
  //Viheralueet WFS
  var viheralueet_layer = $.ajax({ 
    url: viheralueet_wfs,
    datatype:"json",
    jsonCallback: 'getJson',
    success : function (response) {
      viheralueet = L.geoJson(response, {
        style: function (feature) {
          var fillColor, 
          kaytto = feature.properties.kayttotarkoitus;
      
          if ( kaytto.indexOf("semakaavoitettu") > -1) fillColor = "#336666";
          else if ( kaytto == "Yleiskaavan viheralue" ) fillColor = "#336666";
          else if ( kaytto == "Ulkoilumetsä" ) fillColor = "#336666";
          else if ( kaytto == "Kartano- ja huvila-alue" ) fillColor = "#996699";
          else if ( kaytto == "Kesämaja-alue" || kaytto == "Siirtolapuutarha" || kaytto == "Viljelypalsta" || kaytto == "Viljelypalsta-alue") fillColor = "#666699";
          else if ( kaytto == "Koira-aitaus" ) fillColor = "#666699";
          else if ( kaytto == "Leikkipaikka" || kaytto == "Leikkipuisto" ) fillColor = "#666699";
          else if ( kaytto == "Luonnonsuojelualue" ) fillColor = "#336666";
          else if ( kaytto.indexOf("luonnonsuojelualue") > -1 ) fillColor = "#336666";
          else if ( kaytto == "Uimaranta-alue" || kaytto == "Venesatama / Venevalkama" ) fillColor = "#336699";
          else if ( kaytto.indexOf("Haudat") > -1 ) fillColor = "#666666";
          else if ( kaytto == "Muut viheralueet" ) fillColor = "#fff";
      
          //else if ( kaytto == "Yleiskaavan viheralue" ) fillColor = "#ff0000";
          else fillColor = "#999";  // no data
		      
          //Muu toimiluokka
          //Yleiskaavan viheralue / luonnonsuojelualue
          //Yleiskaavan viheralue / kesämaja-alue
          //Yleiskaavan viheralue / kartanoalue
          //Yleiskaavan viheralue / leikkipuisto
          //Yleiskaavan viheralue
          //Yleiskaavan viheralue / erityiskohteet
          //Yleiskaavan viheralue / koira-aitaus
          //Ulkoilumetsä
          //Tontti (rakentamattomat / sopimus)
          //Erityiskohteet, asemakaavoitettu viheralue
          //Viljelypalsta-alue
          //Haudat (hautausmaat)
          //Suojaviheralue
          //Katualue
          //Rata-alue
          //Saari (saaret ilman siltayhteyttä)
      
          return {
      	    color: "black", 
      	    weight: 1, 
      	    fillColor: fillColor, 
      	    fillOpacity: 0.8 
          };
                    	
          },
          onEachFeature: function (feature, layer) {
            popupOptions = {maxWidth: 200};
            layer.bindPopup("<b>Viheralueen tunnus: </b> " + feature.properties.viheralue_id +
              "<br><b>Nimi: </b> " + feature.properties.puiston_nimi +
              "<br><b>Käyttötarkoitus: </b> " + feature.properties.kayttotarkoitus +
              "<br><b>Käyttötarkoitus id: </b> " + feature.properties.kayttotarkoitus_id +
              "<br><b>Pinta-ala: </b> " + feature.properties.pinta_ala
              ,popupOptions);
      
          //Mahdollistaa kohteen korostuksen ja kohdetta klikkaamalla siihen kohdistuksen  
          layer.on({
      	    mousemove: mousemove,
            mouseout: mouseout, 
            click: addBuffer
          });
        }
      }).addTo(tasot);//.addTo(map);
    }
  	
  }); 
  
  /*
  //Paavo WFS
  var paavo_layer = $.ajax({ 
    url: paavo_kartta,
    datatype:"json",
    jsonCallback: 'getJson',
    success : function (response) {
      paavo = L.geoJson(response, {
        style: function (feature) {
          var fillColor, 
          vaki = feature.properties.he_vakiy,
          ala = feature.properties.pinta_ala / 1000000,
          astiheys = vaki / ala;
                      
          //if ( vaki > 22000) fillColor =
          if ( astiheys > 12000) fillColor = "#a63603";
          else if ( astiheys > 10000) fillColor = "#d94801";
          else if ( astiheys > 8000 ) fillColor = "#f16913";
          else if ( astiheys > 6000 ) fillColor = "#fd8d3c";
          else if ( astiheys > 4000 ) fillColor = "#fdae6b";
          else if ( astiheys > 2000 ) fillColor = "#fdd0a2";
          else if ( astiheys > 1000 ) fillColor = "#fee6ce";
          else if ( astiheys > 0 ) fillColor = "#fff5eb";
          else fillColor = "#ffffff";  // no data
      
          return {
      	    color: "#fff",
      	    weight: 2,
      	    fillColor: fillColor,
      	    fillOpacity: 0.5 
          };
		      
          },
          onEachFeature: function (feature, layer) {
            popupOptions = {maxWidth: 200};
            layer.bindPopup("<b>Alueen nimi: </b> " + feature.properties.nimi + 
              "<br><b>Pinta-ala: </b> " + feature.properties.pinta_ala + " m2" +
              "<br><b>Asukasmäärä: </b> " + feature.properties.he_vakiy +
              "<br><b>Asukastiheys: </b> " + feature.properties.he_vakiy / (feature.properties.pinta_ala / 1000000) + " as/k-m2" +
              "<br><b>Asuntojen määrä: </b> " + feature.properties.ra_asunn +
              "<br><b>Asumisväljyys: </b> " + feature.properties.te_as_valj
              ,popupOptions);
        
          //Mahdollistaa kohteen korostuksen ja kohdetta klikkaamalla siihen kohdistuksen  
          layer.on({
            //mousemove: mousemove,
            //mouseout: mouseout, 
            click: zoomToFeature
          });    
                        
        }
      }).addTo(tasot);//.addTo(map);
    }
  }); 
  */


	
  //Tasojen funktioita: kohteeseen zoomaus ja kohteen korostus
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function mousemove(e) {
    var layer = e.target;
	
    //Korostaa kohteen, jonka paalla hiiri on 
    layer.setStyle({
      weight: 3,
      opacity: 0.3,
      illOpacity: 0.9
    });
	
    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }
  }

  function mouseout(e) {
    viheralueet.resetStyle(e.target);
  }

  //Funktio bufferin luonnista, joka luodaan viheralueetta klikatessa
  var radius = null;
  function addBuffer(e) {
		
    if (radius != null) {
      var layer = e.target;
      var layer_geojson = layer.toGeoJSON();
      var buffered = turf.buffer(layer_geojson, radius, 'miles');
    
      buffered.properties = {
        "fill": "#a63603",
        "stroke": "#a63603",
        "stroke-width": 2
      };
    
      var buffer_layer = L.geoJson(buffered).addTo(map);
    }
  
    var removeButton = document.getElementById('remove');
    removeButton.addEventListener('click',function(event) {
      buffer_layer.clearLayers();
    });
  }
	
	
	
  //Bufferikoon ja layerin valittavaksi tarvittavat eventlistenerit
  box_150.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      radius = 150 * 0.000621371192
    } else {
      radius = null
    }
  });
	
  box_300.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      radius = 300 * 0.000621371192
    } else {
      radius = null
    }
  });
  

  
  
  L.geoJson(viheralueet_layer, {
    filter: function(feature, layer) {
        return feature.properties.kayttotarkoitus == "Leikkipaikka";
    }//,
    //onEachFeature: onEachFeature
  }).addTo(map);
  
  
  
	
  karttatasot.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      tasot.addTo(map);
      //taso.addTo(map);
    } else {
      map.removeLayer(tasot);
      //tasot.clearLayers();
    }
  });
	
	
  //Tama scripti hoitaa sen, etta yksi laatikoista voi vain olla kerrallaan valittuna
  $("input:checkbox").on('click', function() {
    var $box = $(this);
    if ($box.is(":checked")) {
      var group = "input:checkbox[name='" + $box.attr("name") + "']";
      $(group).prop("checked", false);
      $box.prop("checked", true);
    } else {
      $box.prop("checked", false);
    }
  });


	
	
	//Legendan koodia...
	/*
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {
	
	    var div = L.DomUtil.create('div', 'info legend'),
	        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
	        labels = [];
	
	    // loop through our density intervals and generate a label with a colored square for each interval
	    for (var i = 0; i < grades.length; i++) {
	        div.innerHTML +=
	            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
	            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	    }
	
	    return div;
	};
	
	legend.addTo(map);
	*/
	
}
