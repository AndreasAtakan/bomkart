"use strict";

L.Map.addInitHook(function() {

	// Geolocation map search
	this.addControl(
		new GeoSearch.SearchControl({
			provider: new GeoSearch.OpenStreetMapProvider(),
			style: "bar",
			autoClose: true,
			showMarker: false
			//keepResult: true
		})
	);


	// Directions
	let router = L.Routing.control({
		geocoder: L.Control.Geocoder.nominatim(),
		//geocoder: L.Control.Geocoder.google(''),
		//waypoints: [],
		//addWaypoints: false,
		extendToWaypoints: false,
		draggableWaypoints: false,
		routeWhileDragging: false,
		showAlternatives: true,
		collapsible: true,
		show: false,
		position: "topright"
	});

	let _POS = null;
	this.on('geosearch/showlocation', ev => {
		_POS = { lat: ev.location.y, lng: ev.location.x };
		this.locate();
	});
	this.on('locationfound', ev => {
		if(!_POS) return;

		let latlng = ev.latlng;

		router.spliceWaypoints(0, 1, _POS);
		router.spliceWaypoints(router.getWaypoints().length - 1, 1, latlng);

		_POS = null;
	});

	router.on('routeselected', ev => {
		let route = ev.route,
			waypoints = ev.route.waypoints;
		let rect = L.latLngBounds(route.coordinates.map(e => L.latLng(e.lat, e.lng)));

		let line = L.polyline(route.coordinates),
			stasjoner = 0;
			//pris = 0,
			//rushpris = 0;

		for(let latlng of window._DATA) {
			let cont = !rect.contains( L.latLng(latlng[0], latlng[1]) );
			if(cont) continue;

			/*for(let w of waypoints) {
				if(Math.abs(latlng[0] - w.latLng.lat) > 0.5
				&& Math.abs(latlng[1] - w.latLng.lng) > 0.5) {
					cont = true;
					break;
				}
			}
			if(cont) continue;*/

			let p = L.latLng(latlng[0], latlng[1]);
			let nearest = L.GeometryUtil.closest(this, line, p);

			if(p.equals(nearest, 0.001)) {
				stasjoner += 1;
				//pris += pt[1];
				//rushpris += pt[2];
			}
		}

		let color, cont;
		if(stasjoner > 0) {
			color = "red";
			cont = `Obs: Rute inneholder ${ stasjoner } ${ stasjoner > 1 ? "bomstasjoner" : "bomstasjon" }!`;
		}else{
			color = "green";
			cont = "Rute inneholder ikke bomstasjoner.";
		}
		$("p#stasjoner").css("color", color);
		$("p#stasjoner").html(cont);

		//$("span#pris").html(`Ordinær pris: kr ${pris},`);
		//$("span#rushpris").html(`Rushpris: kr ${rushpris}`);
	});
	router.on('routingstart', () => $("body").css("cursor", "progress"));
	router.on('routesfound routingerror', () => $("body").css("cursor", "default"));

	this.addControl( router );


	// Geoposition button (GPS tracking)
	this.addControl(
		L.control.locate({
			position: "topleft",
			icon: "fa fa-crosshairs"
		})
	);


	// Street-View control
	$("#streetviewContainer #back").click(function(ev) {
		$("#streetviewContainer").css("visibility", "hidden");
		$("#streetviewContainer #not_found").css("visibility", "hidden");
	});

	let streetviewEnable = ev => {
		//L.DomEvent.stopPropagation(ev);
		streetviewBtn.state("streetviewStart");

		let latlng = ev.latlng;
		let lat = latlng.lat,
			lng = latlng.lng;

		let panorama = new google.maps.StreetViewPanorama(
			document.querySelector("#streetview"),
			{
				position: { lat: lat, lng: lng },
				addressControlOptions: {
					position: google.maps.ControlPosition.TOP_RIGHT
				},
				linksControl: false,
				panControl: false,
				enableCloseButton: false,
				fullscreenControl: false,
				zoomControl: false
			}
		);

		panorama.o.then(() => {
			setTimeout(() => {

				if(panorama.getStatus() == "ZERO_RESULTS")
					$("#streetviewContainer #not_found").css("visibility", "visible");

				$("#streetviewContainer").css("visibility", "visible");

			}, 500);
		});
	};

	let streetviewBtn = L.easyButton({
		position: "topleft",
		states: [
			{
				stateName: "streetviewStart",
				icon: "fa-male",
				title: "Street-View",
				onClick: control => {
					control.state("streetviewCancel");
					this.once("click", streetviewEnable);

					if(DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
						DeviceOrientationEvent.requestPermission()
						.then(function(permissionState) {
							console.log(permissionState);

							if(permissionState === 'granted') { /**/ }
						});
					}
				}
			},
			{
				stateName: "streetviewCancel",
				icon: "fa-times",
				title: "Cancel street-View",
				onClick: control => {
					this.off("click", streetviewEnable);
					control.state("streetviewStart");
				}
			}
		]
	});
	this.addControl( streetviewBtn );


	// Distance scale
	this.addControl(
		L.control.scale({
			position: "bottomleft",
			metric: true,
			imperial: false
		})
	);


	// Zoom control
	this.addControl(
		L.control.zoom({
			position: "bottomleft"
		})
	);















	this.basemaps = [];

	this.basemaps.push(L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		{
			id: uuid(),
			name: "StreetMap",
			attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OSM</a>",
			subdomains: "abc"
		}));

	this.basemaps.push(L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
		{
			id: uuid(),
			name: "Satellite",
			attribution: "&copy; <a href=\"https://www.esri.com/en-us/legal/terms/full-master-agreement\" target=\"_blank\">ESRI</a>"
		}));

	this.basemaps[0].addTo(this);
















	//this.layers = [];
	//let markercluster = L.markerClusterGroup();
	//this.addLayer(markercluster);











	let underlay = {
		"StreetMap": this.basemaps[0],
		"Satellite": this.basemaps[1]
	}, overlay = {};

	L.control.layers(underlay, overlay, {
		position: "bottomright"
	}).addTo(this);











	// Displays popup on map when user right-clicks
	this.on("contextmenu", ev => {
		//L.DomEvent.stopPropagation(ev);

		let latlng = ev.latlng;
		let lat = latlng.lat,
			lng = latlng.lng;

		console.log(lat, lng);
	});

});




L.Map.include({

	getLayer: function(layerId) {
		//
	},

	exportData: function() {
		//
	},

	importData: function(data) {
		//
	}

});
