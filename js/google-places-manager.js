// google-places-manager.js
// Cam Scotland
// Restaurant Roulette Reskin
//
// Randomly select a restaurant based on parameters 
// like location, price, rating, etc. using Google's
// Places API (specifically Places Searches)
// https://developers.google.com/places/documentation/
//
// I decided to reskin this for fun after working on it
// with a team. Group 4, INFO 343A. 

// Cam's Google API key (with Places allowed)
var key = 'AIzaSyBY55ORyqjG8LaN8_h3KIUQ6QR7WbmRz4A';


var infoWindow;
var service;
var map;
var placemarkers = [];
var marker;
var inputText;


// on load set up the map, inputs, autocomplete, 
// infoWindow, marker, and listeners.
$(function() {

	// Some starting locations of various cities
	// to randomly select as default map center
	var startingLocations = [
		[-33.8674869, 151.2069902], 		// Sydney
		[55.953252, -3.188267], 			// Edinburgh
		[47.6062095, -122.3320708], 		// Seattle
		[40.7143528, -74.00597309999999], 	// New York
		[48.856614, 2.3522219],				// Paris
		[30.0444196, 31.2357116] 			// Cairo
	];

	// try to get the starting location, but if 
	// they don't allow it (or can't), use UW as
	// the default.

	// set up the map at the determined location
	var map = setupMap();

	// center the map either on the location of
	// this device (if possible && allowed), or
	// or one of the lovely random starting locs
	setMapCenter(map, startingLocations);

	// PlacesService object
	service = new google.maps.places.PlacesService(map);

	// set up info window (info popups on mapmarkers)
	infoWindow = new google.maps.InfoWindow();

	// add autocomplete functionality to location
	// input textbox using Google's autocomplete. 
	var input = $('.location')[0];
	var autocomplete = new google.maps.places.Autocomplete(input);
	

	// make a map marker for the map
	marker = new google.maps.Marker({
		map: map
	});

	google.maps.event.addListener(autocomplete, 'place_changed', function() {

		inputText = $('.location').val().trim();

		var place = autocomplete.getPlace();
		if (!place.geometry) {
			return; // if there's no lat/lng, we're lost!
		}

		map.setCenter(place.geometry.location);
	});
	
	// add click listener to SPIN button
	$('.spin').click(function(){
		$('.spin').removeClass("spinEffect");
		setTimeout(function(){$('.spin').addClass("spinEffect")},0);
		if ($(".location").val().trim() == "") {
			alert("Please enter a location");
			return false;
		} 
		if(!inputText || $('.location').val().trim() != inputText) {
			inputText = $('.location').val().trim();
			locationSearch(inputText);
		} else {
			getRestaurantData(map, map.getCenter());
		}
	});

	
}); // doc ready


// Creates and displays a new Google Map object
// in the HTML element with class="map-container".
// Returns that map object.
function setupMap() {
	var myStyles = [
		{
			featureType: "poi",
			elementType: "labels",
			stylers: [
				{ visibility: "off" }
			]
		}
	];

	map = new google.maps.Map($('.map-container')[0], {
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		zoom: 15, // at 15 we can see city names
		styles: myStyles
	});

	return map;
}


// Asks user for current location, but if that's
// not possible or allowed, then a randomly 
// selected location from a small pool is used.
// Google Map object is then centered on that
// location.
function setMapCenter(map, startingLocations) {
	var options = {
		enableHighAccuracy: true,
		timeout: 1000,
		maximumAge: 0
	}

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(place) {
			map.setCenter(new google.maps.LatLng(place.coords.latitude, 
				place.coords.longitude));
			console.log('Map centered on ' + map.getCenter());
		}, function() {
			var randInt = Math.floor(Math.random() * startingLocations.length);
			var location = startingLocations[randInt];
			map.setCenter(new google.maps.LatLng(location[0], 
				location[1]));
			console.log('Map centered on ' + map.getCenter());
		}, options);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}


// Make a Google Map Marker and add it to the
// Map object. Add some relevant information.
function createMarker(latlng, map, icon, content, center,action) {
	var marker = new google.maps.Marker({
		map: map,
		position: latlng,
		content:content,
	});
    if (icon) {
		marker.setIcon(({
			url: icon,
			scaledSize: new google.maps.Size(32, 32)
		}));
	}   
    if (center) {
		map.setCenter(latlng);
	}

	// Add click listener to show some
	// popup information
	// TODO: pictures, rating, directions button,
	// 		 hours, etc? 
	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent(this.content);
		infoWindow.open(map, this);
	});
        
	if (action) {
		action.fnc(map,action.args);
	}
	return marker;
}

// search for places using PlacesService with
// the Google Map object. We can specify params
// like types (ie. restaurant), radius, opennow, 
// etc.
function placeSearch(map, request) {
	

	// Now pass the parameters in the request
	// array to the service, and if it returns
	// an OK result, make some markers
	service.search(request, function(results,status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			placemarkers = clearMarkers(placemarkers);

			var bounds = new google.maps.LatLngBounds();
			for (var i = 0; i < results.length; ++i) { 
				placemarkers.push(createMarker(results[i].geometry.location,
					map,
					//results[i].icon,
					//'http://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
					'img/map-marker.png',
					results[i].name,
					false,
					{
						fnc:function() 
						{
							infoWindow.open();
						}
					})
				);
			}

			map.setZoom(15);

			infoWindow.open(map, marker);

		} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
			alert("There were no matching results found. \nPlease expand your query parameters and try again.");
		}
	});     
}


// if the user doesn't select an autocomplete
// location, conduct a textSearch query to
// Google and use the first available lat/lng.
function locationSearch(locationText) {
	var request = {
		query: locationText
	};

	service.textSearch(request, function(results, status) {
		if(status == google.maps.places.PlacesServiceStatus.OK) {
			var location = results[0].geometry.location

			map.setCenter(location);

			marker.setIcon(({
				url: 'http://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png',
				scaledSize: new google.maps.Size(48, 48)
			}));
			marker.setPosition(location);
			marker.setVisible(true);

			getRestaurantData(map, marker.getPosition());

			infoWindow.setContent(results[0].name);
			infoWindow.open(map, marker);

			return true;
		} else {
			alert('Location not found');

			return false;
		}
	});
}


// clears the map markers by rendering
// them invisible and pushing them out
// of the list (placemarkers)
function clearMarkers(placemarkers) {
	for(var i = 0; i < placemarkers.length; i++) {
		placemarkers[i].setVisible(false);
	}
	return []; // placemarkers is returned as empty list
}

// Gather query parameters from html and pass it 
// to the placeSearch function as a request
function getRestaurantData(map, markerPosition) {

	var request = {
		location: markerPosition,
		radius: 1000,	// meters
		minPriceLevel: 0,
		maxPriceLevel: 4,
		openNow: true,
		types: ['restaurant']
	};

	placeSearch(map, request);
}