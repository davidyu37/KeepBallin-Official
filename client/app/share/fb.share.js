'use strict';

angular.module('keepballin').run(function($FB, FB){
	var fb = FB.get().$promise;
	fb.then(function(data) {
		$FB.init(data.clientID);
	});
});