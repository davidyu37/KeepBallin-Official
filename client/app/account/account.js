'use strict';

var app = angular.module('keepballin');

app.config(function ($stateProvider) {
  $stateProvider
    .state('login', {
      url: '/login'
    })
    .state('signup', {
      url: '/signup' 
    })
    .state('settings', {
      url: '/settings',
      views: {
        '': {
          templateUrl: 'app/account/settings/settings.html',
          controller: 'SettingsCtrl',
          authenticate: true
        },
        'teamsignup@settings': {
          templateUrl: 'app/team/temp/team.signup.html',
          authenticate: true
        }
      }
    })
    .state('settings.info', {
      url: '/teaminfo',
      templateUrl: 'app/team/temp/team.info.html',
      authenticate: true
    })
    .state('settings.member', {
      url: '/teammember',
      templateUrl: 'app/team/temp/team.member.html',
      authenticate: true
      
    })
    .state('settings.represent', {
      url: '/teamrepresent',
      templateUrl: 'app/team/temp/team.represent.html',
      authenticate: true
    });
});

/**
 * Use a run block to ensure the modal will open from anywhere in the app.
 **/
app.run(function ($rootScope, $modal) {
  /**
   * Listen to the `$stateChangeStart` event
   */
  $rootScope.$on('$stateChangeStart', function (event, toState) {
    //Define available modal state
    var login = toState.name === 'login';
    var signup = toState.name === 'signup';
    var condition = login || signup;
   
    //If it's not a defined state, return listener to allow other states to function normally
    if(!condition) {return;}
    if(login) {
      $modal.open({
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
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
}); //app.run ends