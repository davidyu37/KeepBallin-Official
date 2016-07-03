'use strict';

angular.module('keepballin') 
	.factory('Geolocate', function() {

		return function(scope, map, errorcb, successcb) {

			scope.locating = true;
			//clear the last marker from scope
			scope.personMarker.setMap(null);
      	
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
			    scope.personMarker = new google.maps.Marker({
			      map: map,
			      position: pos,
			      animation: google.maps.Animation.DROP,
			      icon: image
			    });

			    //set center of map to user's position and zoom to 14
			    map.setCenter(pos);
			    map.setZoom(15);

			    var infoWindow = new google.maps.InfoWindow();
			    var me = '<div id="here"><h1>你在這</h1><div class="infoWindowContent">';
			    // me += '<button class="btn btn-primary" ng-click="addLocation()">建立球場</button></div></div>';
		    
		    	infoWindow.setContent(me);
              	infoWindow.open(map, scope.personMarker);
	            
			    successcb(pos);
			    

			  }, function() {
			    errorcb(handleNoGeolocation(true, map));
			  });
			} else {
			  // Browser doesn't support Geolocation
			  errorcb(handleNoGeolocation(false, map));
			}
		};
		//callback function that handles the errors
		function handleNoGeolocation(errorFlag) {
			var content = '';
		  if (errorFlag) {
		    content = '請解除瀏覽器封鎖';
		  } else {
		    content = '不好意思，您的瀏覽器不支援定位服務';
		  }

		  return content;
		  
		}

	});
