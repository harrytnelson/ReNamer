
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

////function AlertDemoCtrl($scope) {
////  $scope.alerts = [
////    //{ type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
////    //{ type: 'success', msg: 'Well done! You successfully read this important alert message.' }
////  ];
////
////  $scope.addAlert = function(msg,type) {
////    $scope.alerts.push({msg: msg, type:type});
////  };
////
////  $scope.closeAlert = function(index) {
////    $scope.alerts.splice(index, 1);
////  };
////
////};
////
////var ModalDemoCtrl = function ($scope, $modal) {
////
////  $scope.open = function (size, message) {
////
////    var modalInstance = $modal.open({
////      templateUrl: 'myModalContent.html',
////      controller: ModalInstanceCtrl,
////      size: size
////    });
////  };
////};
////
////// Please note that $modalInstance represents a modal window (instance) dependency.
////// It is not the same as the $modal service used above.
////
////var ModalInstanceCtrl = function ($scope, $modalInstance) {
////
////  $scope.ok = function () {
////    $modalInstance.close();
////  };
////
////  $scope.cancel = function () {
////    $modalInstance.dismiss();
////  };
////};

