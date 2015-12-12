'use strict';

angular.module('keepballin') 
	.factory('AddMarker', ['$q', 'socket', 'Court', function($q, socket, Court) {
		return {
			addMode: function(state, scope, map, cb) {
				if(state) {
					map.setOptions({ draggableCursor: 'crosshair' });

					var court = new Court();

		    		google.maps.event.addListener(map, 'click', function(event) {
		   				console.log('Lat:', event.latLng.lat());
		   				console.log('Long', event.latLng.lng());
		   				
						var lat = event.latLng.lat();
						var long = event.latLng.lng();

						var address = coordinatesToAddress(lat, long);
						address.then(function(result){
							var addressFormatted = result.formatted_address;
							var indexTW = addressFormatted.indexOf('台灣');
							var city = addressFormatted.slice((indexTW + 2), (indexTW + 5));
							var district = addressFormatted.slice((indexTW + 5), (indexTW + 8));

							//If the road is unnamed, don't record the city and district automatically
							if(addressFormatted.slice(0, 12) === 'Unnamed Road') {
								court = {lat: lat, long: long, address: addressFormatted};
							} else {
								court = {lat: lat, long: long, address: addressFormatted, district: district, city: city};
							}
							Court.save(court, function(u) {
								cb(u);
							});
						});
						
					});
					
		    	} else {
		    		google.maps.event.clearListeners(map, 'click');
		    		map.setOptions({ draggableCursor: 'url(http://maps.google.com/mapfiles/openhand.cur), move' });
		    	}


		    	 
			},
			//Second method: add a court right away according to position
			addOne: function(pos, cb) {

				var court = new Court();

				var lat = pos.lat();
				var long = pos.lng();

				var address = coordinatesToAddress(lat, long);
				address.then(function(result){
					var district = result.address_components[3].long_name;
					var city = result.address_components[4].long_name;
					court = {lat: lat, long: long, address: result.formatted_address, district: district, city: city};
					Court.save(court, function(u) {
						cb(u);
					});
				});
			}

		}

		function coordinatesToAddress(lat, lng) {

    		var deferred = $q.defer();

    		var geocoder = new google.maps.Geocoder();

		    var latlng = new google.maps.LatLng(lat, lng);

		    geocoder.geocode({'latLng': latlng}, function(results, status) {
		        if(status === google.maps.GeocoderStatus.OK) {
		            if(results[0]) {
		                
		                deferred.resolve(results[0]);

		            } else {
		            	deferred.reject(console.log('沒住址'));
		            }
		        } else {
		        	console.log('error');
		        }
		    });
		    return deferred.promise;
		}
	}]);