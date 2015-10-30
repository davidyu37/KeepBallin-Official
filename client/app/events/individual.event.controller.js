'use strict';

angular.module('keepballin')
  .controller('IndividualEvent', ['$scope', 'thisEvent', 'Auth', '$state', 'Event', 'socket', function ($scope, thisEvent, Auth, $state, Event, socket) {
  	thisEvent.$promise.then(function(data) {
  		$scope.event = data;

	  	//Show google map for the event
	  	$scope.eventMap = new google.maps.Map(document.getElementById('eventMap'), {
	  		//map options
	  		center: new google.maps.LatLng(data.court.lat, data.court.long),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true,
			scrollwheel: false
	  	});

	  	//custom marker image
	  	var image = {
			url: '../assets/images/basket.png',
			size: new google.maps.Size(35, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(17, 60),
			scaledSize: new google.maps.Size(35, 60)
		};

		//create marker
	  	var marker = new google.maps.Marker({
            map: $scope.eventMap,
            position: new google.maps.LatLng(data.court.lat, data.court.long),
            title: data.court.court,
            icon: image, 
            animation: google.maps.Animation.DROP
        });
	  	//Check if user already participating
	  	for(var i=0; i < $scope.event.participants.length; i++) {
			if($scope.event.participants[i]._id === Auth.getCurrentUser()._id) {
				$scope.showMinus = true;
			} else {
				$scope.showMinus = false;
			}
		}
  	});

	socket.socket.on('event:save', function(item) {
		$scope.event = item;
	});

  	//Join as a participant if user is logged in
  	$scope.join = function() {

  		if(Auth.isLoggedIn()) {
  			for(var i=0; i < $scope.event.participants.length; i++) {
  				if($scope.event.participants[i]._id === Auth.getCurrentUser()._id) {
  					return;
  				}
  			}

  			var newArr = [];
  			//Get id of the current participants
  			for(var i=0; i < $scope.event.participants.length; i++) {
	  			//Put them in a new array
  				newArr.push($scope.event.participants[i]._id);
  			}
  			//push the current user id to the new array
  			newArr.push(Auth.getCurrentUser()._id);

  			//Update event model
  			Event.update({id: $scope.event._id}, {participants: newArr}, function() {
  				console.log('joined');
  			});
  		} else {
  			$state.go('login');
  		}
  	};

  	//User leaves the event
  	$scope.leave = function() {
  		//create an empty array
  		var emptyArr = [];
  		
  		//Loop through the current participants
  		for(var i=0; i < $scope.event.participants.length; i++) {
	  		//If the current participant has the same id as the user now
			if($scope.event.participants[i]._id === Auth.getCurrentUser()._id) {
		  		//Don't push its id to the new array
				continue;
			}
			emptyArr.push($scope.event.participants[i]._id);
		}
		console.log(emptyArr);
  // 		Event.update({id: $scope.event._id}, {participants: emptyArr}, function() {
		// 	console.log('left');
		// });
  


  	};
 
  }]);