'use strict';

angular.module('keepballin')
	.controller('ShareCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
		//Change text of fb share to chinese
    	$timeout(function(){
	    	var fbBtn = document.getElementsByClassName('pluginButtonLabel');
	    	
	    	for(var i=0; i < fbBtn.length; i ++) {
		    	fbBtn[i].innerHTML = '分享';
	    	}
    	});
	}]);