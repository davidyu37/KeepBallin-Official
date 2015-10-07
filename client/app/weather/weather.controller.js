// 'use strict';

// angular.module('keepballin')
// 	.controller('weatherController',['$scope', '$http', '$interval', '$filter', function($scope, $http, $interval, $filter	){
// 		//Main data json for current weather
// 		$scope.now = [];
// 		//Gets weatherID
// 		$scope.weatherID = [];
// 		//Icon source
// 		$scope.icon = {};
// 		//Array of future weather data
// 		$scope.future = [];
// 		//User selected weather info to display
// 		$scope.futureDisplay = {};
// 		//Weather template
// 		$scope.weatherTime = {};
// 		//Initialize weather template as now
// 		$scope.weatherTime.temp = 'app/main/temp/nowWeather.html';
// 		//All the interval starts from here, *Needs to be destroyed after the scope is destroyed*
// 		$scope.futureLoop = null; //For the future clock
// 		$scope.nowLoop = $interval(function() {
// 			$scope.time = getTimeNow();
// 		}, 1000); //For the current clock
// 		$scope.nowDataUpdate = $interval(function() { getNowData(dataToIcon) }, 600000);
// 		$scope.futureDataUpdate = $interval(function() { getFutureData() }, 600000);
		
// 		//Grab the data as it launch
// 		getNowData(dataToIcon);
// 		getFutureData();

// 		$scope.nowFutureToggle = function(){
// 			var $btn = $("#weatherTimeBtn");
// 			if($btn.hasClass('now')) {
// 				$btn.removeClass('now').addClass('future').text('未來');
// 				temp = "futureWeather";
				
// 			} else if ($btn.hasClass('future')) {
// 				$btn.removeClass('future').addClass('now').text('現在');
// 				temp = "nowWeather";
// 			}
// 			//Sets the template name
// 			$scope.weatherTime.temp = 'app/main/temp/' + temp + '.html';
// 		};

// 		$scope.showFutureWeather = function(value) {
// 			//Check if the object contains value
// 			if (value == null) {
// 				return
// 			}
// 			if (angular.isDefined($scope.futureLoop)) {
// 				$interval.cancel($scope.futureLoop);
// 			}
// 			var now, future, difference, temp, id, iconName, description;
// 			//Get time difference from now
// 			now = moment(getTimeNow()).unix();
// 			future = value.dt;
// 			difference = calTimeDifference(now, future);	
// 			$scope.futureDisplay.diff = difference;
// 			//Continuously getting the time differences
// 			$scope.futureLoop = $interval(function(){
// 				now = moment(getTimeNow()).unix();
// 				future = value.dt;
// 				difference = calTimeDifference(now, future);	
// 				$scope.futureDisplay.diff = difference;
// 			}, 1000);
			
// 			//Get the temperature
// 			temp = value.main.temp;
// 			$scope.futureDisplay.temp = temp;
// 			//Get the weather ID
// 			id = value.weather[0].id;
// 			iconName = dataToIcon(id);
// 			$scope.icon.whereFuture = 'app/main/temp/weatherIconSVG/' + iconName + '.html';
// 			//Get weather description
// 			description = value.weather[0].description;
// 			$scope.futureDisplay.description = description;
// 		};//showFutureWeather ends here 

// 		function getNowData(callback) {
// 			$http.jsonp('http://api.openweathermap.org/data/2.5/weather?q=taipei,tw&units=metric&lang=zh_tw&callback=JSON_CALLBACK').
// 			success(function(data, status, headers, config) {
// 		    	$scope.now = data;
// 		    	$scope.weatherID = data.weather[0].id;
// 		    	var iconName = callback($scope.weatherID);
// 		    	$scope.icon.whereNow = 'app/main/temp/weatherIconSVG/' + iconName + '.html';
// 		  	}).
// 	  		error(function(data, status, headers, config) {
// 		    	console.log(data);
// 		  	});
// 		};

// 		function getFutureData(callback) {
// 			$http.jsonp('http://api.openweathermap.org/data/2.5/forecast?q=taipei,tw&units=metric&lang=zh_tw&callback=JSON_CALLBACK').
// 			success(function(data, status, headers) {
// 		    	//Get timestamp of every list item
// 		    	var dataList = data.list;
// 		    	$scope.future = dataList;
// 		    	//initialize the future display
// 		    	$scope.showFutureWeather(dataList[0]);

// 		  	}).
// 	  		error(function(data, status, headers, config) {
// 		    	console.log(data);
// 		  	});
// 		}; //Get future data ends here

// 		//calculate the time difference using unix timestamp, which's in seconds
// 		function calTimeDifference(now, future) {
// 			var result = {};
// 			var delta = future - now;
// 			if (delta > 86400) {
// 				var days = Math.floor(delta / 86400);
// 				days = addPadding(days);
// 				result.day = days;
// 				delta -= (days * 86400);	
// 			} else {
// 				result.day = "00";
// 			}
// 			if (delta > 3600) {
// 				var hours = Math.floor(delta / 3600) % 24;
// 				hours = addPadding(hours);
// 				result.hour = hours;
// 				delta -= (hours * 3600);	
// 			} else {
// 				result.hour = "00";
// 			}
// 			var minutes = Math.floor(delta / 60) % 60;
// 			minutes = addPadding(minutes);
// 			result.minute = minutes;
// 			delta -= minutes * 60;
// 			var seconds = delta % 60;
// 			seconds = addPadding(seconds);
// 			result.second = seconds;

// 			return result;
// 		}; //calTimeDifference ends here

// 		//Process the number to get number with padding
// 		function addPadding(number) {
// 			//turn number to string
// 			var s = number.toString();
// 			if (s.length < 2) {
// 				s = "0" + s;
// 				return s
// 			} else {
// 				return s
// 			}
// 		}; //addPadding ends here

// 		function dataToIcon(ID) {
// 			console.log("The ID is " + ID);
// 			var iconName;
// 			iconName = "sun";
// 			//Logic thats matches the ID number to the icon
// 			if(ID >= 200 && ID < 300) {
// 				iconName = "cloudLightning";
// 			} else if (ID >= 300 && ID < 400) {
// 				iconName = "cloudDrizzle";
// 			} else if (ID >= 500 && ID < 600) {
// 				iconName = "cloudRain";
// 			} else if (ID == 800) {
// 				iconName = "sun";
// 			} else if (ID == 801 || ID == 802) {
// 				iconName = "cloudSun";
// 			} else if (ID == 803 || ID == 804) {
// 				iconName = "cloud";
// 			} else if (ID == 905) {
// 				iconName = "wind";
// 			} else {
// 				console.log("What's this weather?");
// 			}
// 			return iconName;
// 		};

// 		function getTimeNow() {
// 			var d = new Date();
// 			return d
// 		};

// 		//Cancel all interval when leaving this controller
// 		$scope.$on('$destroy', function(){
// 			$interval.cancel($scope.futureLoop);
// 			$interval.cancel($scope.nowLoop);
// 			$interval.cancel($scope.nowDataUpdate);
// 			$interval.cancel($scope.futureDataUpdate);
// 		});//destroy ends here

// 	}]); //weather controller ends here