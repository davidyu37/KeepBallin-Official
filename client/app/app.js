'use strict';

angular.module('keepballin', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'ngFileUpload',
  'bootstrapLightbox',
  'infinite-scroll',
  'oitozero.ngSweetAlert',
  'relativeDate',
  'mobile-angular-ui.gestures',
  'mobile-angular-ui.core',
  'ezfb',
  'ui.calendar',
  'angularMoment',
  'angular.filter',
  'pascalprecht.translate',
  'duScroll',
  'angular-google-adsense'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true).hashPrefix('!');
    $httpProvider.interceptors.push('authInterceptor');
  })
  //Translation stuff
  .config(['$translateProvider', function ($translateProvider) {
    $translateProvider.translations('zh-tw', {
      just_now:  '剛剛',
      seconds_ago: '{{time}} 秒前',
      a_minute_ago:  '一分鐘前',
      minutes_ago: '{{time}} 分鐘前',
      an_hour_ago: '一小時前',
      hours_ago: '{{time}} 小時前',
      a_day_ago: '昨天',
      days_ago:  '{{time}} 天前',
      a_week_ago:  '上禮拜',
      weeks_ago: '{{time}} 週前',
      a_month_ago: '上個月',
      months_ago:  '{{time}} 個月前',
      a_year_ago: '一年前'
      // years_ago {{time}} years ago
      // over_a_year_ago over a year ago
      // seconds_from_now  {{time}} seconds from now
      // a_minute_from_now a minute from now
      // minutes_from_now  {{time}} minutes from now
      // an_hour_from_now  an hour from now
      // hours_from_now  {{time}} hours from now
      // a_day_from_now  tomorrow
      // days_from_now {{time}} days from now
      // a_week_from_now a week from now
      // weeks_from_now  {{time}} weeks from now
      // a_month_from_now  a month from now
      // months_from_now {{time}} months from now
      // a_year_from_now a year from now
      // years_from_now  {{time}} years from now
      // over_a_year_from_now  over a year from now
    });
   
    $translateProvider.translations('de', {
      'TITLE': 'Hallo',
      'FOO': 'Dies ist ein Absatz'
    });
   
    $translateProvider.preferredLanguage('zh-tw');
  }])
  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          event.preventDefault();
          $location.path('/login');
        }
      });
    });
  });
