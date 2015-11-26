'use strict';

angular.module('keepballin')
  .controller('IndividualTeam', ['$scope','$timeout' ,'Auth', 'User', 'Team', '$state', 'thisTeam', '$modal', 'socket', 'SweetAlert', '$animate', 'Court', 'Download', function ($scope, $timeout, Auth, User, Team, $state, thisTeam, $modal, socket, SweetAlert, $animate, Court, Download) {
  	//async grab data
    thisTeam.$promise.then(function(d) {
  		$scope.team = d;
      
      if(d.owner === Auth.getCurrentUser()._id) {
        $scope.isOwner = true;
      } 
      //socket.io instant updates   
      socket.socket.on('team:save', function(item) {
        $scope.team = item;
      });
      $scope.$on('$destroy', function () {
        socket.socket.removeAllListeners('team:save');      
      });
      
      //For edit page
      $scope.editFounded = new Date($scope.team.founded);
      //If the user is the contact person, me value is true so the checkbox is checked initially
      if(Auth.getCurrentUser()._id === $scope.team.contactperson.account) {
        $scope.me = true;
        $scope.disableContactInput = true;
      }
  	});

    var courts = Court.query().$promise;

    courts.then(function(d) {
        $scope.courts = d;
    });

    var users = User.query().$promise;

    users.then(function(d) {
        $scope.users = d;
    });

    $scope.User = Auth.getCurrentUser();

    $scope.$on('teamPicUploaded', function() {
      var team = Team.get({id: $scope.team._id}).$promise;
      team.then(function(d) {
        $scope.team = d;
      });
    });

    
    //Upload picture stuff starts ---------------------------------
    $scope.uploadmode = function() {
      $scope.upload = !($scope.upload);
    };

    //Edit mode stuff starts here--------------------
    //Delay the animation, so the edit/upload page doesn't popup in the beginning
    $animate.enabled(false);
      $timeout(function () {
          $animate.enabled(true);
      }, 1000);
    //Calendar popup

    $scope.opened = false;

    $scope.open = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    //Prevent the edit page from closing when clicking one the form
    $scope.stopPropagate = function(event) {
      event.stopPropagation();
    };

    $scope.editmode = function() {
      $scope.edit = !($scope.edit); 
    };

    $scope.exitEdit = function() {
      $scope.edit = !($scope.edit);
    };

    $scope.changeToMe = function(me, type) {
        switch (type) {
          case 'contact': 
            if(me === true) {
              $scope.team.contactperson.name = $scope.User.name;
              $scope.disableContactInput = true;
              $scope.team.contactperson.account = $scope.User._id;
              $scope.team.contactperson.email = $scope.User.email;
              $scope.selectedUser = $scope.User;
              $scope.team.contactperson.confirmed = true;
            } else {
              $scope.team.contactperson = {};
              $scope.disableContactInput = false;
              $scope.selectedUser = {};
            }
            break;
          case 'member':
            if(me === true) {
              $scope.person = '';
              $scope.person = $scope.User.name;
              $scope.disablePersonInput = true;
              $scope.memberIsMe = true;
              $scope.chosenMember = $scope.User;
            } else {
              $scope.person = '';
              $scope.disablePersonInput = false;
              $scope.memberIsMe = false;
              $scope.chosenMember = {};
            }
            break;
          default: 
            return;

        }
        
    };
    //Edit the info of the member
    $scope.editPerson = function(index) {
      //Open editing box only for that member
      //ng-show based on the index provided here
      $scope.memberIndex = index;
      $scope.editing = true;
      $scope.name = $scope.team.members[index].name;
      $scope.positionForEdit = $scope.team.members[index].position;
    };
    //Exit editing
    $scope.exitEditPerson = function(index, name, pos) {
      $scope.team.members[index].name = name;
      $scope.team.members[index].position = pos;
      $scope.editing = false;
    };
    //ng show and hide function
    $scope.editNow = function(index) {
      if(index === $scope.memberIndex && $scope.editing) {
        return true;
      } else {
        return false;
      }
    };

    $scope.positions = [
      'PG-控球後衛',
      'SG-得分後衛',
      'SF-小前鋒',
      'PF-大前鋒',
      'C-中鋒',
      '教練',
      '隊長',
      '球隊經理'
    ];

    var memberExist = function(name, pos) {
      var members = $scope.team.members;
      for(var i=0; i < members.length; i++) {
        if(members[i].name === name && members[i].position === pos) {
          return true;
        } 
      }
      return false;
    };

    //Add member to members and send with form data    
    $scope.addMember = function(name, pos) {
        if(name) {
            if(memberExist(name, pos)) {
              SweetAlert.swal('已有'+ pos + '姓名為' + name, '無法重複', 
                  'warning');
              return;
            }
            var person = {};
            if($scope.memberIsMe) {
              person = {
                name: name,
                position: pos,
                account: $scope.User._id,
                confirmed: true
              };
            } else if($scope.chosenMember) {
              if(name === $scope.chosenMember.name) {
                person = {
                  name: name,
                  position: pos,
                  account: $scope.chosenMember._id,
                  confirmed: true
                };
              } else {
                person = {
                  name: name,
                  position: pos
                };  
              }
            } else {
              person = {
                name: name,
                position: pos
              };   
            }

            $scope.team.members.push(person);

        } else {
            return;
        }   
    };

    $scope.removeMember = function(index) {
        var member = $scope.team.members[index];
        //If member is already confirmed, check if user really want to restart the confirmation process
        if(member.confirmed) {
          SweetAlert.swal({   
          title: member.name + ' 已經確認身份，確定要強制開除？',   
          text: '開除後需要重新確認身份',   
          type: 'warning',   
          showCancelButton: true,   
          confirmButtonColor: '#DD6B55',   
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          showLoaderOnConfirm: true,   
          closeOnConfirm: false }, function(confirmed){
            if(confirmed) {
              $scope.team.members.splice(index, 1);
                SweetAlert.swal('已開除'+ member.name, '儲存以後就回不去囉',  
                  'success');
              
            } else {
              return;
            }
          });       
        } else {
          $scope.team.members.splice(index, 1);
        }
    };

    //When user select a existing court
    $scope.selected = function($item) {
        $scope.selectedCourt = $item;
        $scope.team.location.court = $item._id;
    };
    //When user select an existing user for contactperson
    $scope.selectPerson = function(item) {
      $scope.team.contactperson.account = item._id;
      $scope.selectedUser = item;
    };
    //When user select an existing user for the member
    $scope.selectMember = function(item) {
      $scope.chosenMember = item;
      $scope.person = item.name;
    };

    //Check if current location value match an existing court's name or address, if not remove the court id
    var locationMatch = function(current, selected) {   
        if(selected) {
            if(current === selected.court || current === selected.address) {
                return;
            } else {
                if($scope.team.location.court) {
                    delete $scope.team.location.court;
                }
            }
        } else {
            return;
        }
    };
    //Check if contact match the selected person
    var contactMatch = function(current, selected) { 
        if(selected) {
            if(current === selected.name) {
                return;
            } else {
                if($scope.team.contactperson.account) {
                    delete $scope.team.contactperson.account;
                }
            }
        } else {
            return;
        }
    };

    $scope.submitEdit = function(form) {
      if(form.$valid) {
        if($scope.team.location) {
          console.log('it got location');
          locationMatch($scope.team.location.name, $scope.selectedCourt);
        }
        if($scope.team.contactperson) {
          contactMatch($scope.team.contactperson.name, $scope.selectedUser);
        }
        var update = Team.update({id: $scope.team._id}, $scope.team).$promise;
        update.then(function(d) {
          $scope.edit = false;
        });
      }
    };
    //delete team
    $scope.deleteTeam = function() {
      //warn the user, if confirmed, delete the team and take them to team page, else stay here
      SweetAlert.swal({   
          title: '確定要刪除個隊伍嗎?',   
          text: '刪除以後就無法復原',   
          type: 'warning',   
          showCancelButton: true,   
          confirmButtonColor: '#DD6B55',   
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          showLoaderOnConfirm: true,   
          closeOnConfirm: false }, function(confirmed){
            if(confirmed) {
              var item = Team.remove({id: $scope.team._id}).$promise;
              item.then(function(d) {
                SweetAlert.swal('已刪除', '',  
                  'success');
              });
              $state.go('team');
            } else {
              return;
            }
          }); 
    };


    //Edit mode stuff ends-----------------------


    //loop through the pictures to provide variety
  	$scope.picPlaceholder = function(index) {
  		var pics = [
  			'/assets/images/bballplayer1.png',
  			'/assets/images/bballplayer2.jpg',
  			'/assets/images/bballplayer3.png',
  			'/assets/images/bballplayer4.svg',
  			'/assets/images/bballplayer5.jpg'
  		];
  		var newIndex = index % pics.length;
  		return pics[newIndex];
  	};


    //Open modal to invite the team to play bball
    $scope.invite = function() {
      $modal.open({
        templateUrl: 'app/team/temp/invite.html',
        controller: 'InviteCtrl',
        size: 'lg',
        scope: $scope
      });
    };

    //Display contact info for users
    $scope.displayInfo = function() {
      if(Auth.isLoggedIn()) {
        $scope.show = true;
      } else {
        $state.go('login');
      }
    };

    //User send request to wait for creator's confirmation
    $scope.isMe = function(index) {
      var member = $scope.team.members[index];
      var newInfo = {
        account: $scope.User._id
      };

      Team.update({id: $scope.team._id, memberId: member._id}, newInfo);
    };

    //Owner confirms the id of the user
    $scope.confirmId = function(index) {

      var member = $scope.team.members[index];
      
      var pic;
      if (member.account.avatar) {
        pic = member.account.avatar.url;
      } else {
        pic = '/assets/images/profile/profile.jpg';
      }
      SweetAlert.swal({   
          title: member.name + ' = ' + member.account.name + '?',   
          text: '同一個人嗎？',   
          type: 'info',
          imageUrl: pic,   
          showCancelButton: true,   
          confirmButtonColor: '#DD6B55',   
          confirmButtonText: '對',
          cancelButtonText: '不對',
          showLoaderOnConfirm: true,   
          closeOnConfirm: false,
          closeOnCancel: false }, function(confirmed){
            if(confirmed) {
              var newInfo = {
                confirmed: true
              };
              var update = Team.update({id: $scope.team._id, memberId: member._id}, newInfo).$promise;
              update.then(function() {
                SweetAlert.swal('身份確認', '',  
                  'success');
              });
            } else {
              var newInfo = {
                account: null
              };
              var update = Team.update({id: $scope.team._id, memberId: member._id}, newInfo).$promise;
              update.then(function() {
                SweetAlert.swal('等待確認', '', 
                  'error');
              });
            }
          });
    };

    $scope.openGallery = function() {
      
      $modal.open({
        animation: true,
        templateUrl: 'app/team/temp/team.pics.html',
        scope: $scope,
        size: 'lg',
        controller: 'GalleryCtrl'
      }); 
    };

    //Delete picture
        $scope.removePic = function(pic) {
          SweetAlert.swal({   
          title: '你確定要刪除?',   
          text: '按下確定後，就無法走回頭路囉',   
          type: 'warning',   
          showCancelButton: true,   
          confirmButtonColor: '#DD6B55',   
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          showLoaderOnConfirm: true,   
          closeOnConfirm: false }, function(confirmed){
            if(confirmed) {
              Download.delete({ id: pic._id }, function(){
                
              var getAgain = Team.get({id: $scope.team._id}).$promise;
                getAgain.then(function(data) {
                  $scope.team = data;
                  SweetAlert.swal('已刪除!', 
                  '乾淨溜溜', 
                  'success');
                });
                  });   
              
            } else {
              return;
            }
          });    
        };//removePic func ends

  }]);//IndividualTeam ends