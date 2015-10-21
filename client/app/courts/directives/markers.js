'use strict';

angular.module('keepballin') 
.directive('marker', ['$window', '$compile', '$q', 'Auth', function($window, $compile, $q, Auth) {
	return {
		restrict: 'A',
		scope: {
			courts: '=courts',
			currentcourt: '=currentcourt',
			map: '=map',
			markernow: '=markernow',
			markers: '=markers',
			infowindow: '=infowindow',
			editmode: '=editmode',
			finishedit: '=finishedit',
			deletemarker: '=deletemarker',
			expanded: '=expanded'

		},
		link: function($scope) {

			//Authentication
			$scope.isLoggedIn = Auth.isLoggedIn();
		    $scope.isAdmin = Auth.isAdmin();
		    $scope.isManager = Auth.isManager();
		    $scope.getCurrentUser = Auth.getCurrentUser();
				
			var infowindow = $scope.infowindow;

			function cleanUpMarkers(oldVal) {
				$scope.markers[oldVal._id].setMap(null);
			}
			
			function createMarker(court) {

				var image = {
				  url: '../assets/images/basket.png',
				  size: new google.maps.Size(35, 60),
				  origin: new google.maps.Point(0, 0),
				  anchor: new google.maps.Point(17, 60),
				  scaledSize: new google.maps.Size(35, 60)
				};

				var marker = new google.maps.Marker({
		            map: $scope.map,
		            position: new google.maps.LatLng(court.lat, court.long),
		            title: court.court,
		            id: court._id,
		            icon: image, 
		            animation: google.maps.Animation.DROP
		        });

		        marker.content = court.desc;
		        $scope.markers[marker.id] = marker;
                
		        google.maps.event.addListener(marker, 'click', function(e) {

			        $scope.markernow = marker;

			        $scope.currentcourt = court;

			        console.log(court);

			        //Open court's detail when user clicks on marker
			        $scope.expanded=true;

			        var infoContent = '<div id=\"infoWin_'+ marker.id + '\"';
			        infoContent += 'ng-include="\'app/courts/temp/info.window.html\'">';
	   				
	              	infowindow.setContent(infoContent);
	              	infowindow.open($scope.map, marker);
	              	//Pan to center if it's desktop
	              	if(screen.width > 480) {
			            $scope.map.panTo({lat: e.latLng.lat(), lng: e.latLng.lng()});
				    }
                  	$scope.$apply(function(){
                   		$compile(document.getElementById('infoWin_' +marker.id))($scope);
                	});
	        	});//Events listener ends here

			}//createMarker fn ends here


			$scope.$watchCollection('courts', function(newVal, oldVal) {
		
				if (newVal && newVal.length) {
					//Clean up the old markers
					for (var j=0; j < oldVal.length; j++) {
						cleanUpMarkers(oldVal[j]);
					}
					$scope.markers = [];
					//convert the new group of courts to marker here
					for(var i=0; i < newVal.length; i ++) {
						createMarker(newVal[i]);
					}
				}
			}, true);
		}

	}; //Return ends
}]);//Marker directive ends here