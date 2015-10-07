'use strict';

angular.module('keepballin') 
	.factory('Geolocate', function() {

		return function(scope, map) {
			//clear the last marker from scope
			scope.userLocation.setMap(null);
      	
			//check if browser supports geolocation
			//.getCurrentPosition() takes two functions as parameter: one shows position, one show error
			if(navigator.geolocation) {
			  navigator.geolocation.getCurrentPosition(function(position) {
			  	var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
			    var image = {
				  url: iconBase + 'man.png',
				  size: new google.maps.Size(50, 70),
				  origin: new google.maps.Point(0, 0),
				  anchor: new google.maps.Point(17, 34),
				  scaledSize: new google.maps.Size(50, 50)
				};
			    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			    //create a new marker at the position of the user, important to not use var, so it can be cleared if we run getLocation again.
			    scope.userLocation = new google.maps.Marker({
			      map: map,
			      position: pos,
			      animation: google.maps.Animation.DROP,
			      icon: image
			    });
			    //set center of map to user's position and zoom to 14
			    map.setCenter(pos);
			    map.setZoom(18);

			    var infoWindow = new google.maps.InfoWindow();

			    google.maps.event.addListener(scope.userLocation, 'click', function() {
			    	infoWindow.setContent('你在這');
	              	infoWindow.open(map, scope.userLocation);
	              	map.panTo(pos);
			    });
			  }, function() {
			    handleNoGeolocation(true, map);
			  });
			} else {
			  // Browser doesn't support Geolocation
			  handleNoGeolocation(false, map);
			}
		};
		//callback function that handles the errors
		function handleNoGeolocation(errorFlag, map) {
			var content = '';
		  if (errorFlag) {
		    content = 'Error: The Geolocation service failed.';
		  } else {
		    content = 'Error: Your browser doesn\'t support geolocation.';
		  }
		  var pos = new google.maps.LatLng(25.033259, 121.543565);
		  //when there's errorFlag, it displays the error message in a new infowindow
		  var options = {
		    map: map,
		    position: pos,
		    content: content
		  };

		  var infowindow = new google.maps.InfoWindow(options);
		  infowindow.open(map, pos);
		  map.setCenter(pos);
		}

	});
