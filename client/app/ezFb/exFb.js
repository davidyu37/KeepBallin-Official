'use strict';

angular.module('keepballin')
.config(function (ezfbProvider) {
  ezfbProvider.setLocale('zh_TW');
});
angular.module('keepballin')
.run(function (ezfb, FB) {
	var fb = FB.get().$promise;
	fb.then(function(data) {
		ezfb.init({
			appId: data.clientID,
			version: 'v2.5'
		});
	});
});