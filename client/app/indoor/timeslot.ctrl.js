'use strict';

angular.module('keepballin')
  .controller('TimeslotCtrl', ['$scope', '$modalInstance', 'theEvent', function ($scope, $modalInstance, theEvent) {
    
    $scope.event = theEvent;
    console.log($scope.event.timeForConfirmation);
    $scope.startDate = moment(theEvent.start).format('M/DD');
    $scope.start = moment(theEvent.start).format('h:mm a');
    $scope.end = moment(theEvent.end).format('h:mm a');

  }]);
