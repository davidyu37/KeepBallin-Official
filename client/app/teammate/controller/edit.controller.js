'use strict';

angular.module('keepballin')
  .controller('EditInviteCtrl', ['$scope', 'socket', 'invite', '$modalInstance', 'Invite', 'court', 'Court', '$filter', 'SweetAlert', function ($scope, socket, invite, $modalInstance, Invite, court, Court, $filter, SweetAlert) {
  	
  	$scope.invite = invite;
  	$scope.courts = court;

  	//Search and set court id if it exists
    $scope.findCourtId = function() {
      //Search for the court if there's something
      if($scope.invite.location) {
        $scope.invite.court = undefined;
        Court.search({query: $scope.invite.location}, function(data) {
          if(data[0]) {
            $scope.invite.court = data[0]._id;
          }
        });
      } else {
      	$scope.invite.court = undefined;
      }
    };

  	var start = new Date($scope.invite.startTime);
  	var end = new Date($scope.invite.endTime);
  	//Get rid off the milliseconds and seconds for readability.
  	var newStart = new Date(start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes());
  	var newEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate(), end.getHours(), end.getMinutes());
  	//Convert start and end time for input
  	$scope.invite.startTime = newStart;
  	$scope.invite.endTime = newEnd;

  	//Defining today, NOW
    $scope.now = moment();

  	$scope.editInvite = function(edited) {
  		$scope.submitted = true;
  		var startMoment = moment($scope.invite.startTime);
  		var endMoment = moment($scope.invite.endTime);
  		//Update the startDate if user changed the start time
  		$scope.invite.startDate = (startMoment.month() + 1) + '/' + startMoment.date();
  		
  		if(endMoment.unix() > $scope.now.unix()) {
        	if(edited.$valid && !($scope.sending)) {
        		$scope.sending = true;
		  		Invite.update({ id: $scope.invite._id}, $scope.invite, function() {
		  			$scope.sending = false;
		  			$scope.submitted = false;
		  			$modalInstance.close();
		  		});
        	}
        } else {
        	//If the invite end time already passed let them know
        	var endTime = $filter('date')(endMoment._d, 'MM/dd hh:mm a');
	        var nowTime = $filter('date')($scope.now._d, 'MM/dd hh:mm a');
	        SweetAlert.swal({
	          title: '無法建立過去的活動',
	          text: '現在是' + nowTime + '\n已經過 ' + endTime,
	          type: 'warning',
	          confirmButtonColor: '#DD6B55',   
	          confirmButtonText: '好'
	        });
        }
  	};

  }]);//Ctrl ends