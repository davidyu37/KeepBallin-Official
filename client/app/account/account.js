'use strict';

var app = angular.module('keepballin');

app.config(function ($stateProvider) {
  $stateProvider
    .state('settings', {
      url: '/settings/:choice',
      resolve: {
        choice: ['$stateParams', function($stateParams) {
          return $stateParams.choice;
        }]
      },
      templateUrl: 'app/account/settings/settings.html',
      authenticate: true,
      controller: 'SettingsCtrl'
    })
    .state('reset', {
      url: '/reset/:token',
      templateUrl: 'app/account/reset.html',
      resolve: {
        tokenUser: ['$stateParams', 'User', '$q', function($stateParams, User, $q) {
          var deferred = $q.defer();
          User.checkToken({token: $stateParams.token}, function(data) {
            deferred.resolve(data);
          });
          return deferred.promise;
        }],
        token: ['$stateParams', function($stateParams) {
          return $stateParams.token;
        }]
      },
      controller: 'ResetCtrl'
    })
    .state('confirm', {
      url: '/confirm/:token',
      templateUrl: 'app/account/confirm.html',
      resolve: {
        tokenUser: ['$stateParams', 'User', '$q', function($stateParams, User, $q) {
          var deferred = $q.defer();
          User.confirmEmail({token: $stateParams.token}, function(data) {
            deferred.resolve(data);
          });
          return deferred.promise;
        }],
        token: ['$stateParams', function($stateParams) {
          return $stateParams.token;
        }]
      },
      controller: 'ConfirmCtrl'
    })
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
      url: '/signup/:roomId',
      templateUrl: 'app/account/signup/signup.html',
      controller: 'SignupMobileCtrl',
      resolve: {
        roomId: ['$stateParams', function($stateParams) {
          var roomId = $stateParams.roomId;
          return roomId;
        }]
      } 
    });
  });
}

var roomNow;

/**
 * Use a run block to ensure the uibModal will open from anywhere in the app.
 **/
app.run(function ($rootScope, $modal) {
  /**
   * Listen to the `$stateChangeStart` event
   */
  if(screen.width > 480) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams,  fromState, fromParams) {
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
              roomNow = toParams;
              var roomId = toParams;
              return roomId;
            }
          }
        });   
      }
      
      if(signup) {
        $modal.open({
          templateUrl: 'app/account/signup/signup.html',
          controller: 'SignupCtrl',
          resolve: {
            roomId: function() {
              var roomId = roomNow;
              return roomId;
            }
          }
        });   
      }
      
      /**
       * Prevent the transition to the dummy state, stay where you are
       */
      event.preventDefault();
    });

  }
}); //app.run ends