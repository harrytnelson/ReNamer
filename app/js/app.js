var ReNamerApp = angular.module('ReNamerApp', ['ngRoute','filesControllers','filesFilters']);
ReNamerApp.config(
  [ '$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/files',
          { templateUrl: 'app/partials/files.html',
            controller: 'filesCtrl'})
        .when('/getTitle/:show/:season/:episode',
          { templateUrl: 'app/partials/getTitle.html',
            controller: 'getTitleCtrl'})
        .otherwise({redirectTo: '/files'});
}]);

