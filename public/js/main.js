"use strict";

window.addEventListener("load", function() {
	//feather.replace();


	let map = new L.Map("map", {
		center: [64, 14],
		zoomControl: false,
		zoom: 5,
		maxZoom: 18
		//crs: "EPSG3857"
	});


	let layers = [ L.markerClusterGroup() ];

	$.ajax({
		type: "GET",
		url: "https://nvdbapiles-v3.atlas.vegvesen.no/vegobjekter/45.json", //?inkluder=egenskaper,metadata,lokasjon,geometri&srid=wgs84
		data: {
			"inkluder": "egenskaper,metadata,lokasjon,geometri",
			"srid": "wgs84"
		},
		dataType: "json",
		success: function(result, status, xhr) {
			console.log(status);

			loadData(result);
		},
		error: function(xhr, status, error) {
			console.error(status);
			console.error(error);

			loadData(_DATA);
		}
	});

	function loadData(data) {
		for(let b of data.objekter) {
			let latlng = getGeom(b.geometri.wkt);

			let f = {};
			for(let e of b.egenskaper) {
				if(e.verdi) { f[e.navn] = e.verdi; }
			}

			let cont = ``;
			cont += `<b>Navn bomstasjon</b> : ${f['Navn bomstasjon']} <br />`;
			cont += `<b>Bomstasjonstype</b> : ${f['Bomstasjonstype']} <br />`;
			if(f['Rushtid morgen, fra']) {
				cont += `<b>Rushtid morgen</b> : ${f['Rushtid morgen, fra']} – ${f['Rushtid morgen, til']} <br />`;
				cont += `<b>Rushtid ettermiddag</b> : ${f['Rushtid ettermiddag, fra']} – ${f['Rushtid ettermiddag, til']} <br />`;
			}
			cont += `<br />`;
			cont += `<b>Takst liten bil</b> : kr${f['Takst liten bil']} ${
				f['Rushtidstakst liten bil'] ? `( kr${f['Rushtidstakst liten bil']} rushtid )` : ''
			} <br />`;
			cont += `<b>Takst stor bil</b> : kr${f['Takst stor bil']} ${
				f['Rushtidstakst stor bil'] ? `( kr${f['Rushtidstakst stor bil']} rushtid )` : ''
			}`;

			layers[0].addLayer( L.marker(latlng).bindPopup(cont) );
		}

		map.addLayer( layers[0] );
	}

	function getGeom(str) {
		let res = str;

		res = res.split('(')[1].split(')')[0].split(' ');
		res = [ parseFloat( res[0] ), parseFloat( res[1] ) ]

		return res;
	}

});
