var ReNamerApp = angular.module('ReNamerApp', ['ngRoute','rnrFilesControllers']);
ReNamerApp.config(
  [ '$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/files',
          { templateUrl: 'app/partials/files.html',
            controller: 'rnrFilesCtrl'})
        .otherwise({redirectTo: '/files'});
}]);

