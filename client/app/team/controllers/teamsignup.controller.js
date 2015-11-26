'use strict';

angular.module('keepballin')
  .controller('TeamSignUpCtrl', ['$scope', '$timeout' ,'Auth', 'User', 'Team', 'Upload', '$state', 'Court', 'SweetAlert', function ($scope, $timeout, Auth, User, Team, Upload, $state, Court, SweetAlert) {
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
 			$state.go('teamsignup.member');
            $scope.memberState = true;
            $scope.representState = false;
            $scope.infoState = false;
 		}
        if(form.$valid && state === 'represent') {
            $state.go('teamsignup.represent');
            $scope.memberState = false;
            $scope.representState = true;
            $scope.infoState = false;
        }  
 	};
    // we will store all of our form data in this object
    $scope.formData = {};
    $scope.formData.contactperson = {};

    $scope.User = Auth.getCurrentUser();

    var users = User.query().$promise;

    users.then(function(d) {
        $scope.users = d;
    });

    $scope.selectPerson = function(item) {
      $scope.formData.contactperson.account = item._id;
      $scope.selectedUser = item;
    };

    $scope.selectMember = function(item) {
      $scope.chosenMember = item;
    };


    $scope.changeToMe = function(me) {
        if(me === true) {
 			$scope.formData.contactperson.name = $scope.User.name;
 			$scope.disableContactInput = true;
            $scope.selectedUser = $scope.User;
            $scope.formData.contactperson.account = $scope.User._id;
            $scope.formData.contactperson.email = $scope.User.email;
            $scope.formData.contactperson.confirmed = true;
 		} else {
 			$scope.formData.contactperson = {};
 			$scope.disableContactInput = false;
            $scope.selectedUser = {};
 		}
 	};
    //Change phone number display to public
    $scope.givePermission = function(yes) {
        if(yes === true) {
            $scope.formData.contactperson.show = true;
        } else {
            $scope.formData.contactperson.show = false;
        }
    };


 	//Open datepicker
   	$scope.open = function(e) {
		e.preventDefault();
		e.stopPropagation();
		$scope.opened = true;
   	};
    
    // $scope.availablePeople = User.searchParams();
    
    $scope.preview = '';
    $scope.load = false;

    $scope.formData.founded = new Date();

    // function to process the form
    $scope.processForm = function() {
        
        if($scope.formData.location || $scope.selectedCourt) {
            locationMatch($scope.formData.location.name, $scope.selectedCourt);
        }
        if($scope.formData.contactperson) {
          contactMatch($scope.formData.contactperson.name, $scope.selectedUser);
        }
        $scope.sending = true;
        var saved = Team.save($scope.formData).$promise;
        saved.then(function(d) {
            $scope.sending = false;
            $scope.formData = {};
            
            $state.go('thisteam', {team: d._id});   
        });
    };

    //Check if contact match the selected person
    var contactMatch = function(current, selected) { 
        if(selected) {
            if(current === selected.name) {
                return;
            } else {
                if($scope.formData.contactperson.account) {
                    delete $scope.formData.contactperson.account;
                }
            }
        } else {
            return;
        }
    };

    //Check if current location value match an existing court's name or address, if not remove the court id
    var locationMatch = function(current, selected) {
        
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

    var memberExist = function(name, pos) {
      var members = $scope.formData.members;
      for(var i=0; i < members.length; i++) {
        if(members[i].name === name && members[i].position === pos) {
          return true;
        } 
      }
      return false;
    };

	//Add member to members and send with form data    
    $scope.addMember = function(member, pos) {
        var person = {};
        if(member) {
            if(memberExist(member, pos)) {
              SweetAlert.swal('已有'+ pos + '姓名為' + member, '無法重複', 
                  'warning');
              return;
            }
            if($scope.chosenMember) {
                if(member === $scope.chosenMember.name) {
                  person = {
                    name: member,
                    position: pos,
                    account: $scope.chosenMember._id,
                    confirmed: true
                  };
                } else {
                    person = {
                        name: member,
                        position: pos
                    };       
                }
            } else {
                person = {
                    name: member,
                    position: pos
                };
            }

            $scope.formData.members.push(person);
        } else {
            return;
        }   
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