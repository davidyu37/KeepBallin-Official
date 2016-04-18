'use strict';

angular.module('keepballin')
  .controller('IndividualIndoor', ['$scope', 'Indoor', 'thisIndoor', '$modal', '$timeout', function ($scope, Indoor, thisIndoor, $modal, $timeout) {

    $scope.currentcourt = thisIndoor;


    //Open modal to reserve
    $scope.reserve = function() {
    	$modal.open({
    		templateUrl: 'app/indoor/temp/reserve.court.html',
			scope: $scope,
			size: 'lg',
			controller: 'ReserveCtrl'
    	});
    };

    //Initial map
    var mapOptions = {
        center: new google.maps.LatLng($scope.currentcourt.lat, $scope.currentcourt.long),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        scrollwheel: false,
        panControl: true,
        panControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
            style: google.maps.MapTypeControlStyle.DEFAULT
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
            style: google.maps.ZoomControlStyle.DEFAULT
        }
    };



    //Place marker of the court
    $timeout(function() {
        $scope.map = new google.maps.Map(document.getElementById('indoorMap'), mapOptions);
        $scope.marker = new google.maps.Marker({
            map: $scope.map,
            position: {lat: $scope.currentcourt.lat, lng: $scope.currentcourt.long}
        });
    });

  }]);
