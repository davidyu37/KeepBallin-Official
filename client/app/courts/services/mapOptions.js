'use strict';

angular.module('keepballin') 
	.factory('mapOptions', function() {
		return {
			//center is set at 台北科技大學
			center: new google.maps.LatLng(25.043204, 121.537544),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true,
			scrollwheel: false,
		    panControl: true,
		    panControlOptions: {
        		position: google.maps.ControlPosition.LEFT_CENTER
    		},
    		streetViewControl:true,
            streetViewControlOptions: {
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
	});