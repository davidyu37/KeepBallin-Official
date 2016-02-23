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
  'angular-google-adsense',
  'timer'
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
    });
   
    $translateProvider.preferredLanguage('zh-tw');

    // Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy('escapeParameters');
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
        console.log('response err', response);
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
