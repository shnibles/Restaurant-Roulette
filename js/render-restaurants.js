// render-restaurants.js
// Group 4 - INFO 343 A
// Restaurant Roulette
//
// ...

/** testing code to see results pool
// called when a placeSearch function is completed
// restaurants is a list of results -- see this for
// a more detailed example (specifically "results" list):
// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522%2C151.1957362&radius=500&types=food&name=harbour&sensor=false&key=AIzaSyBY55ORyqjG8LaN8_h3KIUQ6QR7WbmRz4A
function renderRestaurants(restaurants) {
	var restaurantsElem = $('.restaurants'); // div container
	
	// clear restaurantsElem's inner HTML
	restaurantsElem.html('<li class="restaurant template"></li>');
	
	// for each restaurant, add it's name to a list
	for(var i = 0; i < restaurants.length; i++) {
		var restaurant = restaurants[i];
		
		var newElem = $('.restaurant.template').clone();
		newElem.html('<strong>' + restaurant.name + '</strong>');
		newElem.removeClass('template');
		
		newElem.appendTo(restaurantsElem);
	}
}
*/

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// callback when Details query comes back with status == OK
function renderDetailedRestaurant(restaurant) {

	$(".name").html(restaurant.name);
	$(".address").html(restaurant.formatted_address);
	$(".phone").html(restaurant.formatted_phone_number);
	$(".rating").html(restaurant.rating);
	$(".price").html(restaurant.price_level);
	//random index for displaying a review
	var rand = getRandomInt(0, restaurant.reviews.length-1);
	$(".review").html(restaurant.reviews[rand].text);
	$(".reviewrat").html(restaurant.reviews[rand].rating);
	$(".foundres").html(restaurants.length);

	$(".randres").removeClass("template");
}