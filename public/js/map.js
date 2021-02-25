"use strict";

L.Map.addInitHook(function() {

	// Geolocation map search
	this.addControl(
		new GeoSearch.SearchControl({
			provider: new GeoSearch.OpenStreetMapProvider(),
			style: "bar",
			autoClose: true,
			keepResult: true
		})
	);


	// Zoom control
	this.addControl(
		L.control.zoom({
			position: "topright"
		})
	);


	// Directions
	this.addControl(
		L.Routing.control({
			geocoder: L.Control.Geocoder.nominatim(),
			//waypoints: [],
			//addWaypoints: false,
			routeWhileDragging: false,
			showAlternatives: true,
			collapsible: true,
			show: false,
			position: "topright"
		})
	);


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

		panorama.H.then(() => {
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


	// Curcor coordinates
	this.addControl(
		L.control.coordinates({
			position: "bottomleft",
			decimals: 4,
			decimalSeperator: ".",
			labelTemplateLat: "Lat: {y}",
			labelTemplateLng: "Lon: {x}",
			enableUserInput: false,
			useLatLngOrder: true
		})
	);


	// Distance scale
	this.addControl(
		L.control.scale({
			position: "bottomleft",
			metric: true,
			imperial: false
		})
	);















	this.basemaps = [];

	this.basemaps.push(L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
		{
			id: uuid(),
			name: "StreetMap",
			attribution: `
				&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OSM</a>
				&copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a> |
				&copy; <a href=\"https://github.com/NapkinGIS/Napkin-Maps/blob/master/LICENCE\" target=\"_blank\">Napkin</a>
			`,
			subdomains: "abcd"
		}));

	this.basemaps.push(L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
		{
			id: uuid(),
			name: "Satellite",
			attribution: `
				&copy; <a href=\"https://www.esri.com/en-us/legal/terms/full-master-agreement\" target=\"_blank\">ESRI</a> |
				&copy; <a href=\"https://github.com/NapkinGIS/Napkin-Maps/blob/master/LICENCE\" target=\"_blank\">Napkin</a>
			`
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
