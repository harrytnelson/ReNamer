
var filesControllers = angular.module('filesControllers',[]);

filesControllers
  .controller('filesCtrl', 
    [ '$scope','$http',
      function ($scope,$http) {
        $http
          .get('api/files')
          .success(function(data){$scope.files=data;});
    $scope.orderProp='file';
  }]);

filesControllers
  .controller('getTitleCtrl',
    [ '$scope','$http','$routeParams',
      function ($scope,$http,$routeParams) {
        $http
          .get('api/getTitle?show='+$routeParams.show+'&season='+$routeParams.season+'&episode='+$routeParams.episode)
          .success(function(data){$scope.data=data;});
  }]);
