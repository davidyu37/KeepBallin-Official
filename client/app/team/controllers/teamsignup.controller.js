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

 		if(!($scope.sameName) && form.$valid && state === 'member') {
 			$state.go('teamsignup.member');
            $scope.memberState = true;
            $scope.representState = false;
            $scope.infoState = false;
 		}
        if(!($scope.sameName) && form.$valid && state === 'represent') {
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

    $scope.sameName = false;
    //Team name checking
    $scope.checkName = function(name) {
        if(name) {
          var check = Team.nameExist({name: name}).$promise;
          check.then(function(d) {
            $scope.sameName = d.exist;
            
          });    
        }
    };

    //Set sameName to false if it's set to true
    $scope.clearError = function() {
        if($scope.sameName === true) {
            $scope.sameName = false;
        } else {
            return;
        }
    }; 

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

    $scope.districts = [
        '北部',
        '中部',
        '南部',
        '東部',
        '外島'
    ];

    $scope.getCities = function(district) {
        switch(district) {
            case '北部':
                $scope.cities = [
                    '台北市',
                    '新北市',
                    '基隆市',
                    '桃園縣',
                    '新竹縣',
                    '新竹市',
                    '宜蘭縣'
                ];
                break;
            case '中部':
                $scope.cities = [
                    '台中市',
                    '台中縣',
                    '苗栗縣',
                    '彰化縣',
                    '雲林縣',
                    '南投縣'
                ];
                break;
            case '南部':
                $scope.cities = [
                    '嘉義市',
                    '嘉義縣',
                    '台南市',
                    '台南縣',
                    '高雄市',
                    '高雄縣',
                    '屏東縣'
                ];
                break;
            case '東部':
                $scope.cities = [
                    '花蓮市',
                    '花蓮縣',
                    '台東縣',
                    '台東市'
                ];
                break;
            case '外島':
                $scope.cities = [
                    '金門',
                    '小金門',
                    '澎湖',
                    '馬祖',
                    '蘭嶼',
                    '琉球',
                    '綠島',
                    '外傘頂洲',
                    '太平島'
                ];
                break;
            default:
                $scope.cities = [];
                return;

        }

    };

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
	            
	        }).success(function (data) {
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
    $scope.formData.membersID = [];

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
                  $scope.formData.membersID.push($scope.chosenMember._id);
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

        if($scope.formData.members[index].account) {
            $scope.formData.membersID.forEach(function(e, i) {
                //Delete the member ID that matches the account id
                if(e === $scope.formData.members[index].account) {
                    $scope.formData.membersID.splice(i, 1);
                }
            });
        }
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