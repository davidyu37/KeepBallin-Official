'use strict';

angular.module('keepballin')
  .controller('TeamSignUpCtrl', ['$scope', '$timeout' ,'Auth', 'User', 'Team', 'Upload', '$state', 'Court', function ($scope, $timeout, Auth, User, Team, Upload, $state, Court) {
 	//Check if the required fields are filled before moving to next page
 	$scope.moveTo = function(form, state) {

 		$scope.toMember = true;
        if(state === 'info') {
            $state.go('teamsignup.info');
            $scope.memberState = false;
            $scope.representState = false;
            $scope.infoState = true;
        }

 		if(form.$valid && state === 'member') {
            $scope.formData.contactperson.number = $scope.formData.contact;
 			$state.go('teamsignup.member');
            $scope.memberState = true;
            $scope.representState = false;
             $scope.infoState = false;
 		}
        if(form.$valid && state === 'represent') {
            $scope.formData.contactperson.number = $scope.formData.contact;
            $state.go('teamsignup.represent');
            $scope.memberState = false;
            $scope.representState = true;
            $scope.infoState = false;
        }  
 	};

 	$scope.User = Auth.getCurrentUser();

 	$scope.changeToMe = function(me) {
 		if(me === true) {
            $scope.formData.contactperson = {};
 			$scope.formData.contactperson.name = $scope.User.name;
 			$scope.disableContactInput = true;
            $scope.formData.contactperson.account = $scope.User._id;
            $scope.formData.contactperson.confirmed = true;
 		} else {
 			$scope.formData.contactperson = {};
 			$scope.disableContactInput = false;
 		}
 	}

 	//Open datepicker
   	$scope.open = function(e) {
		e.preventDefault();
		e.stopPropagation();
		$scope.opened = true;
   	};

    // we will store all of our form data in this object
    $scope.formData = {};
    
    // $scope.availablePeople = User.searchParams();
    
    $scope.preview = '';
    $scope.load = false;

    $scope.formData.founded = new Date();

    // function to process the form
    $scope.processForm = function() {

        locationMatch($scope.formData.location.name, $scope.selectedCourt);

        $scope.sending = true;
        var saved = Team.save($scope.formData).$promise;
        saved.then(function(d) {
            $scope.sending = false;
            $scope.formData = {};
            console.log(d._id);
            $state.go('thisteam', {team: d._id});   
        });
    };

    //Check if current location value match an existing court's name or address, if not remove the court id
    var locationMatch = function(current, selected) {
        console.log(selected);
        if(selected) {
            if(current === selected.court || current === selected.address) {
                return;
            } else {
                if($scope.formData.location.court) {
                    delete $scope.formData.location.court;
                }
            }
        } else {
            return;
        }
    };
    
    //Picture user selects
    $scope.picture ='';
    //Upload on select
    $scope.upload = function(file) {
    	if (file && !file.$error) {
	    	$scope.load = true;
	    	Upload.upload({
	            url: 'api/uploads/pictures/teampic',
	            file: file
	        }).progress(function () {
	            
	        }).success(function (data, status, headers, config) {
	            $timeout(function() {
	               
	               $scope.formData.teampic = data._id;
	               $scope.preview = data.url;
	               $scope.load = false;
	            });
	        });	
    	}
    };
    //Empty object for a new member
    $scope.formData.members = [];

    $scope.positions = [
      'PG-控球後衛',
      'SG-得分後衛',
      'SF-小前鋒',
      'PF-大前鋒',
      'C-中鋒'
    ];

	//Add member to members and send with form data    
    $scope.addMember = function(member, pos) {
        var person = {
            name: member,
            position: pos
        };

        $scope.formData.members.push(person);
    };

    $scope.removeMember = function(index) {
        $scope.formData.members.splice(index, 1);
    };

    var courts = Court.query().$promise;

    courts.then(function(d) {
        $scope.courts = d;
    });

    //When user select a existing court
    $scope.selected = function($item) {
        $scope.selectedCourt = $item;
        $scope.formData.location.court = $item._id;
    };

  }]);//TeamSignUpCtrl ends