'use strict';

angular.module('keepballin')
  .controller('IndividualTeam', ['$scope','$timeout' ,'Auth', 'User', 'Team', '$state', 'thisTeam', '$modal', 'socket', 'SweetAlert', '$animate', 'Court', 'Download', 'Event', 'moment', 'uiCalendarConfig', '$compile', function ($scope, $timeout, Auth, User, Team, $state, thisTeam, $modal, socket, SweetAlert, $animate, Court, Download, Event, moment, uiCalendarConfig, $compile) {
  	//async grab data
    thisTeam.$promise.then(function(d) {
  		$scope.team = d;
      if(d.owner._id === Auth.getCurrentUser()._id) {
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
      //Get team's events
      var teamEvent = Event.getByTeam({team: $scope.team._id}).$promise;
      teamEvent.then(function(d) {
        $scope.events = d;
        if(d.length) {
          $scope.eventSources.push($scope.events);
        }

        //socket.io instant updates 
        socket.syncUpdates('event', $scope.events, function(event, item , arr) {
          if(arr.length <= 1) {
            $scope.eventSources = [];
            $scope.eventSources.push($scope.events);
          }
        });
        $scope.$on('$destroy', function () {
              socket.unsyncUpdates('event');
          });  
        
      });
  	});

    $scope.isAdmin = Auth.isAdmin();

    $scope.eventSources = [];

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
              $scope.team.membersID.push($scope.User._id);
            } else if($scope.chosenMember) {
              if(name === $scope.chosenMember.name) {
                person = {
                  name: name,
                  position: pos,
                  account: $scope.chosenMember._id,
                  confirmed: true
                };
                console.log($scope.team.membersID);
                $scope.team.membersID.push($scope.chosenMember._id);
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
              if($scope.team.members[index].account) {
                  $scope.team.membersID.forEach(function(e, i) {
                      //Delete the member ID that matches the account id
                      console.log('account', $scope.team.members[index].account._id);
                      if(e === $scope.team.members[index].account._id || e === $scope.team.members[index].account) {
                          console.log('inside if statement');
                          $scope.team.membersID.splice(i, 1);
                      }
                  });
              }
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
          locationMatch($scope.team.location.name, $scope.selectedCourt);
        }
        if($scope.team.contactperson) {
          contactMatch($scope.team.contactperson.name, $scope.selectedUser);
        }
        console.log('$scope.team', $scope.team);
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

    //Stuff for calendar begins---------------------------------------------

    //toggle add event
    $scope.addEvent = false;

    $scope.toggleAdd = function() {
      $scope.addEvent = !($scope.addEvent);
    };

    var date = new Date();
    
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.today = date;
    $scope.start = date;

    $scope.$watch('start', function(newValue, oldValue) {
      $scope.end = newValue;
    });

    /* alert on eventClick */
    $scope.onDayClick = function( date, jsEvent, view){
        //open day view
        uiCalendarConfig.calendars.eventCal.fullCalendar('gotoDate', date);
        uiCalendarConfig.calendars.eventCal.fullCalendar('changeView', 'agendaDay');

    };
    /* alert on Drop */
    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
      var newStuff = {
        start: event.start,
        end: event.end
      };
      $scope.updating = true;
      var update = Event.update({id: event._id}, newStuff).$promise;
      update.then(function(d) {
        $scope.updating = false;
      });
        
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       var newStuff = {
        start: event.start,
        end: event.end
      };
      $scope.updating = true;
      var update = Event.update({id: event._id}, newStuff).$promise;
      update.then(function(d) {
        $scope.updating = false;
      });
    };

    $scope.onEventClick = function(calEvent, jsEvent, view) {
      $scope.events.forEach(function(element, index, array) {
        if(element._id === calEvent._id) {
          element.active = true;
        } else {
          element.active = false;
        }
      });
    };

    $scope.openEventModal = function(id) {
      $scope.events.forEach(function(e) {
        if(e._id === id) {
          $scope.selectedEvent = e;
        }
      });
      $modal.open({
        templateUrl: 'app/team/temp/event.detail.html',
        controller: 'EventDetailCtrl',
        size: 'lg',
        scope: $scope
      });
    };
    //Render tooltip for calednar
    $scope.eventRender = function( event, element, view ) { 
        element.attr({'tooltip': event.title,
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
    };

    //Logic for owner and member checking

    $scope.checkUser = function() {
      if($scope.team) {
        
        var user = Auth.getCurrentUser()._id;
      
        if($scope.team.owner._id === user) {
          return true;
        }
        if(isMember()) {
          return true;
        } 
        return false; 
      }
    };

    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: $scope.checkUser,
        header:{
          left: 'agendaDay agendaWeek month',
          center: 'title',
          right: 'today prev,next'
        },
        timezone: 'local',
        dayClick: $scope.onDayClick,
        eventClick: $scope.onEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };

    //Open datepicker
    $scope.openCal1 = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.opened1 = true;
    };
    $scope.openCal2 = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.opened2 = true;
    };

    $scope.gotCourt = function(item) {
      $scope.eventCourt = item;
    };

    var isMember = function() {
      if($scope.team) {
        var user = Auth.getCurrentUser();
        var last = false;

        if($scope.team.members[0]) {
            $scope.team.members.forEach(function(e) {
              if(user._id) {
                if(e.account) {
                  if(e.account._id === user._id) {
                    last = true;
                  }
                }
              }
            });
          return last;
        } 
      }
    };

    //Submitting new event
    $scope.submitEvent = function(form) {
      if($scope.eventTitle && form.$valid) { 
        $scope.updating = true;
        var data;
        if($scope.eventCourt) {
          if($scope.eventLocation === $scope.eventCourt.court) {
            data = {
              title: $scope.eventTitle,
              start: $scope.start,
              end: $scope.end,
              court: $scope.eventCourt._id,
              location: $scope.eventLocation,
              team: $scope.team._id,
              allDay: $scope.allDay
            };
          } else {
            data = {
              title: $scope.eventTitle,
              start: $scope.start,
              end: $scope.end,
              location: $scope.eventLocation,
              team: $scope.team._id,
              allDay: $scope.allDay
            };
          }
        } else {
          data = {
            title: $scope.eventTitle,
            start: $scope.start,
            end: $scope.end,
            location: $scope.eventLocation,
            team: $scope.team._id,
            allDay: $scope.allDay
          };
        }

        
        var saved = Event.save(data); 
        saved.$promise.then(function(d) {
          $scope.updating = false;
        });
      }
    };

    

    $scope.removeEvent = function(e) {
      var remove = Event.remove({id: e._id}).$promise;
      remove.then(function(d) {
      });
    };

    //Stuff for calendar ends---------------------------------------------

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
        account: $scope.User._id,
        membersID: $scope.team.membersID
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
              $scope.team.membersID.push(member._id);
              var newInfo = {
                confirmed: true,
                membersID: $scope.team.membersID
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

    $scope.waiting = function(index) {
      SweetAlert.swal({   
        title: '請等待' + $scope.team.owner.name + '確認',
        type: 'info',
        showCancelButton: false,   
        confirmButtonColor: '#DD6B55',   
        confirmButtonText: '好'
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