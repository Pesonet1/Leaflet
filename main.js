function init() {
  
  //Kaikki webbikartassa käytettävät globaalit muuttujat
  document.getElementById("none").checked = true;
  var information = document.getElementById('information');
  var removeButton = document.getElementById('remove');
  var resetButton = document.getElementById('reset');
  
  var legend = L.control({position: 'bottomleft'});
  
  //Aineistot ovat esiladattuja nopeamman toimivuuden takaamiseksi
  var all = "https://pesonet1.github.io/Leaflet/all.json"
  var paavo_wfs = "https://pesonet1.github.io/Leaflet/paavo.json"
  
  //Geojson-objektit lisataan omiin layergrouppeihin
  var kaikki = new L.LayerGroup();
  var ulkoilu_taso = new L.LayerGroup();
  var kartano_taso = new L.LayerGroup();
  var kesasiirtola_taso = new L.LayerGroup();
  var viljelyalueet_taso = new L.LayerGroup();
  var koirat_taso = new L.LayerGroup();
  var leikkipaikat_taso = new L.LayerGroup();
  var luonnonsuojelu_taso = new L.LayerGroup();
  var uimavene_taso = new L.LayerGroup();
  var hauta_taso = new L.LayerGroup();
  var muut_taso = new L.LayerGroup();
  
  //Muuttujat filterointiin
  var filter1, filter2, filter3, fillcolor1, fillcolor2, fillcolor3;
  var radius;
  var taso;
  
  
  var southWest = L.latLng(60.083745, 24.760265);
  var northEast = L.latLng(60.317492, 25.368633);
  var bounds = L.latLngBounds(southWest, northEast);
  
  var map = L.map('map', {
    maxBounds: bounds,
    maxZoom: 18,
    minZoom: 11
  });
  
  //Fit to bounds
  map.fitBounds(bounds);
  	
  //Scale
  L.control.scale({
  	position: 'bottomleft',
  	updateWhenIdle: true,
  	maxWidth: 200
  }).addTo(map);
  
  //MapBox-light taustakartta
  basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGVzb25ldDEiLCJhIjoiY2lqNXJua2k5MDAwaDI3bTNmaGZqc2ZuaSJ9.nmLkOlsQKzwMir9DfmCNPg', {
    maxZoom: 18,
    id: 'mapbox.light'
  }).addTo(map);


  
  //Taman funktion avulla uusi karttataso voidaan kutsua kayttaen haluttua filteria ja tason varia
  function update_layer() {
    var viheralueet_layer = $.ajax({
      url: all,
      type: 'GET',
      success: function(response) {
        var viheralueet = L.geoJson(response, {
          style: function (feature) {
            var fillColor, 
            kaytto = feature.properties.kayttotarkoitus;
            
            if ( kaytto.indexOf(filter1) > -1 ) fillColor = fillcolor1;
            else if ( kaytto.indexOf(filter2) > -1 ) fillColor = fillcolor2;
            else if ( kaytto.indexOf(filter3) > -1 ) fillColor = fillcolor3;
          
            return {
      	      color: "black", 
      	      weight: 1, 
      	      fillColor: fillColor, 
      	      fillOpacity: 0.8 
            };
          },
          filter: function(feature, layer) {
            return (feature.properties.kayttotarkoitus == filter1) ||
            	   (feature.properties.kayttotarkoitus == filter2) || 
            	   (feature.properties.kayttotarkoitus == filter3);
            	   
          },
          onEachFeature: onEachFeature_viheralueet
            
        })
        
        taso.addLayer(viheralueet);
      }
    });
  }
 
 
  
  //Funktio kaikkien viheralueiden hakemiselle, myös varit ovat ennalta maaritelty
  function update_all() {
    var viheralueet = $.ajax({ 
      url: all,
      type: 'GET',
      success : function (response) {
        viheralueet = L.geoJson(response, {
          style: function (feature) {
            var fillColor, 
            kaytto = feature.properties.kayttotarkoitus;
      
            if ( kaytto.indexOf("semakaavoitettu") > -1) fillColor = "#336666";
            else if ( kaytto.indexOf("Yleiskaavan viheralue") > -1 ) fillColor = "#336666";
            else if ( kaytto == "Ulkoilumetsä" ) fillColor = "#669966";
            else if ( kaytto == "Kesämaja-alue" || kaytto == "Siirtolapuutarha") fillColor = "#666699";
            else if ( kaytto == "Viljelypalsta" || kaytto == "Viljelypalsta-alue") fillColor = "#003366";            
            else if ( kaytto == "Koira-aitaus" ) fillColor = "#666633";
            else if ( kaytto == "Leikkipaikka" || kaytto == "Leikkipuisto" ) fillColor = "#663399";
            else if ( kaytto == "Uimaranta-alue" || kaytto == "Venesatama / Venevalkama" ) fillColor = "#66cccc";
            else if ( kaytto == "Kartano- ja huvila-alue" ) fillColor = "#996699";
            else if ( kaytto == "Luonnonsuojelualue" ) fillColor = "#336699";
            else if ( kaytto.indexOf("luonnonsuojelualue") > -1 ) fillColor = "#336699";
            else if ( kaytto.indexOf("Haudat") > -1 ) fillColor = "#666666";
            else if ( kaytto == "Muut viheralueet" ) fillColor = "#336666";
            else fillColor = "#336666";  // no data

            return {
      	      color: "black", 
      	      weight: 1, 
      	      fillColor: fillColor, 
      	      fillOpacity: 0.8 
            };
                    	
          },
          onEachFeature: onEachFeature_viheralueet
        
        }).addTo(kaikki);
      }
    });
    
    kaikki.addTo(map);
  }
 
  
  
  //Taman tarkoituksena on mahdollistaa popupin ja muiden funktioiden toimimisen viheralueet-tasoilla
  function onEachFeature_viheralueet(feature, layer) {
  	
    popupOptions = {maxWidth: 200, closeOnClick: true};
    content = "<b>Viheralueen tunnus: </b> " + feature.properties.viheralue_id +
        "<br><b>Nimi: </b> " + feature.properties.puiston_nimi +
        "<br><b>Käyttötarkoitus: </b> " + feature.properties.kayttotarkoitus +
        "<br><b>Käyttötarkoitus id: </b> " + feature.properties.kayttotarkoitus_id +
        "<br><b>Pinta-ala: </b> " + Math.round(feature.properties.pinta_ala) + " m2";

    layer.bindPopup(content, popupOptions);
    
    layer.on({
      mousemove: mousemove,
      mouseout: mouseout, 
      click: addBuffer
    });
  }



  //Paavo-aineisto
  var paavo_layer = $.ajax({ 
    url: paavo_wfs,
    datatype:"json",
    jsonCallback: 'getJson',
    success : function (response) {
      paavo = L.geoJson(response, {
        style: function (feature) {
          var fillColor, 
          vaki = feature.properties.he_vakiy,
          ala = feature.properties.pinta_ala / 1000000,
          astiheys = vaki / ala;
                      
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
            
          layer.on('click', function() {
            information.innerHTML = '';
            information.innerHTML = ("<b>Alueen nimi: </b> " + feature.properties.nimi +
            "<br><b>Pinta-ala: </b> " + Math.round(feature.properties.pinta_ala) + " m2" +
            "<br><b>Asukasmäärä: </b> " + feature.properties.he_vakiy +
            "<br><b>Asukastiheys: </b> " + Math.round(feature.properties.he_vakiy / (feature.properties.pinta_ala / 1000000)) + " as/k-m2" +
            "<br><b>Asuntojen määrä: </b> " + feature.properties.ra_asunn +
            "<br><b>Asumisväljyys: </b> " + Math.round(feature.properties.te_as_valj));
          });
        
          layer.on({
            click: panToFeature
          });    
                      
        }
      }).addTo(map);
    }
  }); 
  
  
  
  //Tyhjentaa containerin, kun klikataan muuta kuin kuin kohdetta
  map.on('click', function(e) {
  	information.innerHTML = '<em>' + 'Valitse kaupunginalue' + '</em>';
  });
  
  
  //Siirrytaan kohteen ylapuolelle, kun ollaan sopivalla zoom-tasolla
  function panToFeature(e) {
    zoomlevel = map.getZoom();
    if (zoomlevel > 12) {
      map.panInsideBounds(e.target.getBounds());
    }
  }

  //Korostaa kohteen
  function mousemove(e) {
    var layer = e.target;
	
    layer.setStyle({
      weight: 3,
      opacity: 0.3,
      fillOpacity: 0.9
    });
	
    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }
  }


  //"Palauttaa" korostetun tyylin takaisin
  function mouseout(e) {
    var layer = e.target;
    layer.setStyle({
      weight: 1,
      fillOpacity: 0.8
    });
  }


    
  //Funktio bufferin luonnista, joka luodaan viheralueetta klikatessa
  function addBuffer(e) {
    var layer = e.target;
    
    if (radius != null) {
      layer.closePopup();
      
      var layer_geojson = layer.toGeoJSON();
      var buffered = turf.buffer(layer_geojson, radius, 'miles');
      var buffer_layer = L.geoJson(buffered).addTo(map);
      
      buffer_layer.setStyle({
      	color: "red",
        weight: 2,
        fillColor: "orange",
        opacity: 1,
        fillOpacity: 0.5
      });
      
    }
  
    //Bufferin poisto-nappia varten tarvitaan sille oma eventlistener
    removeButton.addEventListener('click',function(event) {
      buffer_layer.clearLayers();
    });
  }
  
  
  //Legendan varitys
  function getColor(d) {
    return d > 12000  ? "#a63603" :
    	   d > 10000  ? "#d94801" :
    	   d > 8000   ? "#f16913" :
	   d > 6000   ? "#fd8d3c" :
           d > 4000   ? "#fdae6b" :
	   d > 2000   ? "#fdd0a2" :
	   d > 1000   ? "#fee6ce" :
	   d > 0      ? "#fff5eb" :
	                "#ffffff";
  }

  //Legendan lisaamista varten funktio
  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1000, 2000, 4000, 6000, 8000, 10000, 12000],
        labels = [];
    
    div.innerHTML = "<b>" + "Väestötiheys" + "</b>" + "<br>";
        
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  
  legend.addTo(map);
	
  
  //None arvo on ensisijaisesti valittuna "bufferikokona"
  none.addEventListener('change', function() {
    radius = null;
  });
  	
  //Bufferikoon 150m eventlisteneri
  box_150.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      radius = 150 * 0.000621371192;
    } else {
      radius = null;
    }
  });
 
  //Bufferikoon 300m eventlisteneri
  box_300.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      radius = 300 * 0.000621371192;
    } else {
      radius = null;
    }
  });


  //Asetetaan taso päälle vakiona
  document.getElementById("karttataso").checked = true;
  update_all();
  
  //Kaikkien viheralueiden eventlistener
  karttataso.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      update_all();
    } else {
      kaikki.clearLayers();
    }
  });
  
  
  //Nollaa tasot ja checkboxit
  resetButton.addEventListener('click',function(event) {
      ulkoilu_taso.clearLayers();
      document.getElementById("ulkoilumetsa").checked = false
      kartano_taso.clearLayers();
      document.getElementById("kartano").checked = false
      kesasiirtola_taso.clearLayers();
      document.getElementById("kesamajasiirtola").checked = false
      viljelyalueet_taso.clearLayers();
      document.getElementById("viljelypalsta_alueet").checked = false
      koirat_taso.clearLayers();
      document.getElementById("koira").checked = false
      leikkipaikat_taso.clearLayers();
      document.getElementById("leikkipaikat").checked = false
      luonnonsuojelu_taso.clearLayers();
      document.getElementById("luonto").checked = false
      uimavene_taso.clearLayers();
      document.getElementById("uimaranta_venesatama").checked = false
      hauta_taso.clearLayers();
      document.getElementById("haudat").checked = false
      muut_taso.clearLayers();
      document.getElementById("muut").checked = false
    });
  
  
  //Loput eventlistenerit eri tasoille
  ulkoilumetsa.addEventListener('change', function() {
    var checked = this.checked;
    taso = ulkoilu_taso
    if (checked) {
      filter1 = "Ulkoilumetsä"
      fillcolor1 = "#669966"
      
      update_layer();
      ulkoilu_taso.addTo(map);
    } else {
      filter1 = null;
      ulkoilu_taso.clearLayers();
    }
  });

  kartano.addEventListener('change', function() {
    var checked = this.checked;
    taso = kartano_taso
    if (checked) {
      filter1 = "Kartano- ja huvila-alue"
      fillcolor1 = "#996699"
 
      update_layer();
      kartano_taso.addTo(map);
    } else {
      filter1 = null;
      kartano_taso.clearLayers();
    }
  });
  
  kesamajasiirtola.addEventListener('change', function() {
    var checked = this.checked;
    taso = kesasiirtola_taso
    if (checked) {
      filter1 = "Kesämaja-alue"
      fillcolor1 = "#666699"
      
      filter2 = "Siirtolapuutarha"
      fillcolor2 = "#666699"
      
      update_layer();
      kesasiirtola_taso.addTo(map);
    } else {
      filter1 = null;
      filter2 = null;
      kesasiirtola_taso.clearLayers();
    }
  });
  
  viljelypalsta_alueet.addEventListener('change', function() {
    var checked = this.checked;
    taso = viljelyalueet_taso
    if (checked) {
      filter1 = "Viljelypalsta"
      fillcolor1 = "#003366"
      
      filter2 = "Viljelypalsta-alue"
      fillcolor2 = "#003366"
      
      update_layer();
      viljelyalueet_taso.addTo(map);
    } else {
      filter1 = null;
      filter2 = null;
      viljelyalueet_taso.clearLayers();
    }
  });

  koira.addEventListener('change', function() {
    var checked = this.checked;
    taso = koirat_taso
    if (checked) {
      filter1 = "Koira-aitaus"
      fillcolor1 = "#666633"
      
      update_layer();
      koirat_taso.addTo(map);
    } else {
      filter1 = null;
      koirat_taso.clearLayers();
    }
  });
  
  leikkipaikat.addEventListener('change', function() {
    var checked = this.checked;
    taso = leikkipaikat_taso
    if (checked) {
      filter1 = "Leikkipaikka"
      fillcolor1 = "#663399"
      
      filter2 = "Leikkipuisto"
      fillcolor2 = "#663399"
      
      update_layer();
      leikkipaikat_taso.addTo(map);
    } else {
      filter1 = null;
      filter2 = null;
      leikkipaikat_taso.clearLayers();
    }
  });

  luonto.addEventListener('change', function() {
    var checked = this.checked;
    taso = luonnonsuojelu_taso
    if (checked) {
      filter1 = "Luonnonsuojelualue"
      fillcolor1 = "#336699"
      
      update_layer();
      luonnonsuojelu_taso.addTo(map);
    } else {
      filter1 = null;
      luonnonsuojelu_taso.clearLayers();
    }
  });
 
  uimaranta_venesatama.addEventListener('change', function() {
    var checked = this.checked;
    taso = uimavene_taso
    if (checked) {
      filter1 = "Uimaranta-alue"
      fillcolor1 = "#66cccc"
      
      filter2 = "Venesatama / Venevalkama"
      fillcolor2 = "#66cccc"
      
      update_layer();
      uimavene_taso.addTo(map);
    } else {
      filter1 = null;
      filter2 = null;
      uimavene_taso.clearLayers();
    }
  });
  
  haudat.addEventListener('change', function() {
    var checked = this.checked;
    taso = hauta_taso
    if (checked) {
      filter1 = "Haudat (hautausmaat)"
      fillcolor1 = "#666666"
      
      update_layer();
      hauta_taso.addTo(map);
    } else {
      filter1 = null;
      hauta_taso.clearLayers();
    }
  });
  
  muut_viheralueet.addEventListener('change', function() {
    var checked = this.checked;
    taso = muut_taso
    if (checked) {
      filter1 = "semakaavoitettu"
      fillcolor1 = "#336666"
      
      filter2 = "Yleiskaavan viheralue"
      fillcolor2 = "#336666"
      
      filter3 = "Muut viheralueet"
      fillcolor3 = "#336666"
      
      update_layer();
      muut_taso.addTo(map);
    } else {
      filter1 = null;
      filter2 = null;
      filter3 = null;
      muut_taso.clearLayers();
    }
  });
	
}
