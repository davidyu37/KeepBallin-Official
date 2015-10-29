'use strict';

angular.module('keepballin')
  .controller('AddEventsCtrl', ['$scope', 'thisCourt', '$timeout', function ($scope, thisCourt, $timeout) {
  	// console.log(thisCourt);
  	$scope.tooLong = false; //true when user choose more than five types
  	$scope.eventName = '';
  	$scope.eventType = [];

   	
   	$scope.createEvent = function(event) {
   		console.log('click', event);
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


  }]);