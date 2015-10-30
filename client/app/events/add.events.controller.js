'use strict';

angular.module('keepballin')
  .controller('AddEventsCtrl', ['$scope', 'thisCourt', '$timeout', 'Event', '$state', function ($scope, thisCourt, $timeout, Event, $state) {

  	thisCourt.$promise.then(function(court) {
	  	$scope.thisCourt = court;
  	});

  	$scope.tooLong = false; //true when user choose more than five types
  	$scope.eventName = '';
  	$scope.eventType = [];
  	$scope.begin = new Date();//default date begin today
  	$scope.today = new Date();//min date for date picker
  	$scope.end = $scope.begin; //default end to begin
  	$scope.eventInfo = '';//event info

  	$scope.sending = false;
  	$scope.submitted = false;
   	
   	$scope.createEvent = function(event) {
   		$scope.submitted = true;
   		
   		if(event.$valid && $scope.eventType[0]) {
   			$scope.sending = true;

	   		//Process the types to new array with only string
	   		var newArr = [];
	   		for(var i=0; i < $scope.eventType.length; i++) {
	   			newArr.push($scope.eventType[i].type);
	   		}

	   		//Information to be sent to backend
	   		//eventName, eventType, begin, end, info, courtID
	   		var data = {
	   			name: $scope.eventName,
	   			type: newArr,
	   			begin: $scope.begin,
	   			end: $scope.end,
	   			court: $scope.thisCourt._id,
	   			location: $scope.thisCourt.address,
	   			info: $scope.eventInfo
	   		};
        console.log(data);
	   		var saved = Event.save(data);	
   			saved.$promise.then(function(d) {
   				console.log(d);

   				$scope.sending = false;
   				$scope.eventName = '';
   				$scope.eventType = [];
   				$scope.begin = new Date();
   				$scope.end = $scope.begin;
   				$scope.eventInfo = '';
   				$state.go('thisevent', {event: d._id});
   			})
   		}
   	};

   	//types of event
   	$scope.typeOptions = [
   		{type: "輕鬆打", disable: false},
		{type: "練球", disable: false},
		{type: "練體能", disable: false},
		{type: "正式全場", disable: false},
		{type: "正式鬥牛", disable: false},
		{type: "錦標賽", disable: false},
		{type: "企業贊助", disable: false},
		{type: "選秀", disable: false},
		{type: "上班族", disable: false},
		{type: "打健康", disable: false},
		{type: "學生", disable: false},
		{type: "親子",  disable: false}
   	]
   	//add one type to eventType array, disable that type
   	$scope.addType = function() {
   		if($scope.type) {
   			if($scope.eventType.length >= 5) {
   				$scope.tooLong = true;
   				$timeout(function() {
   					$scope.tooLong = false;
   				}, 3000);
   			} else {
		   		$scope.eventType.push($scope.type);
		   		for(var i=0; i < $scope.typeOptions.length; i++) {
		   			if($scope.typeOptions[i].type === $scope.type.type) {
		   				$scope.typeOptions[i].disable = true;
		   			}
		   		}
		   		$scope.type = '';
   				
   			}
   		}	
   	};
   	//reverse of addType
   	$scope.remove = function(index, type) {
   		for(var i=0; i < $scope.typeOptions.length; i++) {
   			if($scope.typeOptions[i].type === type.type) {
   				$scope.typeOptions[i].disable = false;
   			}
   		}
   		$scope.eventType.splice(index, 1);
   	};

   	// $scope.getClass = function(date, mode) {
   	// 	console.log(date);
   	// 	console.log(mode);
   	// }

   	//Open datepicker
   	$scope.openCal1 = function(e) {
		e.preventDefault();
		e.stopPropagation();
		$scope.opened1 = true;
   	};
   	$scope.openCal2 = function(e) {
		e.preventDefault();
		e.stopPropagation();
		$scope.opened2 = true;
   	};


  }]);