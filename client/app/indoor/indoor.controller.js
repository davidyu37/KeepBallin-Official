'use strict';

angular.module('keepballin')
  .controller('IndoorCtrl', ['$scope', 'Indoor', function ($scope, Indoor) {
    Indoor.queryPublic(function(data) {
    	//Filter out courts that's not public or approved
    	$scope.courts = data;
    });
  }]);
