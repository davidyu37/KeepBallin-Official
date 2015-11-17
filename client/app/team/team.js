'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    
    $stateProvider
		.state('team', {
			url: '/team',
			templateUrl: 'app/team/team.html',
			controller: 'TeamCtrl'
		})
		.state('teamsignup', {
			url: '/teamsignup',
			templateUrl: 'app/team/temp/team.signup.html',
			authenticate: true,
			controller: 'TeamSignUpCtrl'
		})
		.state('teamsignup.info', {
			url: '/teamsignupinfo',
			templateUrl: 'app/team/temp/team.info.html',
			authenticate: true
		})
		.state('teamsignup.member', {
			url: '/teamsignupmember',
			templateUrl: 'app/team/temp/team.member.html',
			authenticate: true

		})
		.state('teamsignup.represent', {
			url: '/teamsignuprepresent',
			templateUrl: 'app/team/temp/team.represent.html',
			authenticate: true
		});

});//config ends
