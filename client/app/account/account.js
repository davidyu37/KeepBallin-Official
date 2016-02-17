'use strict';

var app = angular.module('keepballin');

app.config(function ($stateProvider) {
  $stateProvider
    .state('settings', {
      url: '/settings',
      views: {
        '': {
          templateUrl: 'app/account/settings/settings.html',
          controller: 'SettingsCtrl',
          authenticate: true
        }
      }
    });
});

//when it's desktop
if(screen.width > 480) {
  app.config(function ($stateProvider) {
  $stateProvider
    .state('login', {
      url: '/login/:roomId'
    })
    .state('signup', {
      url: '/signup' 
    });
  });
}
//when it's mobile
if(screen.width < 480) {
  app.config(function ($stateProvider) {
  $stateProvider
    .state('login', {
      url: '/login/:roomId',
      templateUrl: 'app/account/login/login.html',
      controller: 'LoginMobileCtrl',
      resolve: {
        roomId: ['$stateParams', function($stateParams) {
          var roomId = $stateParams.roomId;
          return roomId;
        }]
      }
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'app/account/signup/signup.html',
      controller: 'SignupMobileCtrl' 
    });
  });
}


/**
 * Use a run block to ensure the uibModal will open from anywhere in the app.
 **/
app.run(function ($rootScope, $modal) {
  /**
   * Listen to the `$stateChangeStart` event
   */
  if(screen.width > 480) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      //Define available modal state
      var login = toState.name === 'login';
      var signup = toState.name === 'signup';
      var condition = login || signup;
     
      //If it's not a defined state, return listener to allow other states to function normally
      if(!condition) {return;}
      if(login) {
        $modal.open({
          templateUrl: 'app/account/login/login.html',
          controller: 'LoginCtrl',
          resolve: {
            roomId: function() {
              var roomId = toParams;
              return roomId;
            }
          }
        });   
      }
      if(signup) {
        $modal.open({
          templateUrl: 'app/account/signup/signup.html',
          controller: 'SignupCtrl'
        });   
      }
      
      /**
       * Prevent the transition to the dummy state, stay where you are
       */
      event.preventDefault();
    });

  }
}); //app.run ends