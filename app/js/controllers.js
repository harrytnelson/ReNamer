
var filesControllers = angular.module('rnrFilesControllers',[]);

filesControllers
  .controller('rnrFilesCtrl', 
    [ '$scope','$http',
      function ($scope,$http) {
        $http
          .get('api/files')
          .success(function(data){$scope.files=data;});
        $scope.orderProp = 'file';
        //$scope.getTitle = function($scope){
        //    var url = 'api/getTitle?show='+$scope.file.show+'&season='+$scope.file.season+'&episode='+$scope.file.episode;
        //    //console.log('url : ' + url);
        //    $http
        //      .get(url)
        //      .success(function(data){$scope.file.title=data.title;});
        //};
        $scope.showAll = false;
        $scope.buildFileName = function($scope){
          if ( $scope.type != "video" )
            return $scope.file
          return "%s - S%02dE%02d - %s%s".sprintf($scope.show,$scope.season,$scope.episode,$scope.title,$scope.extension);
        };
  }])
  .controller('rnrGetTitleCtrl',
    [ '$scope','$http',
      function ($scope,$http) {
        var url = 'api/getTitle?show='+$scope.file.show+'&season='+$scope.file.season+'&episode='+$scope.file.episode;
        //console.log('url : ' + url);

        $http
          .get(url)
          .success(function(data){$scope.file.title=data.title;});
  }])
  .filter("videos",function() {
    return function(files,showAll){
      var result = [];
      angular.forEach(files, function(file){
        if (file.type == "video" || showAll == true )
          result.push(file);
      });
      return result;
    };
  })
  //.directive("rnrGetTitle",
  //  [ '$http',
  //    function($http){
  //      function link(scope, element, attrs) {
  //        var show, season, episode;
  //        function update() {
  //          $http
  //            .get('api/getTitle?show='+show
  //                             +'&season='+season
  //                             +'&episode='+episode)
  //            .success(function(data){scope.title=data.title;})
  //            .error(function(){scope.title='';});
  //        };

  //        scope.$watch(attrs.rnrGetTitle,
  //          function(value) {
  //            show = value.show;
  //            season = value.season;
  //            episode = value.episode;
  //            update();
  //        });
  //      }

  //      return {
  //        transclude: true,
  //        link: link
  //      };
  //}])

  ;
