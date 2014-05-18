angular.module('filesFilters', []).filter('videos', function() {
  return function(input) {
    return input.type=="video";// ? '\u2713' : '\u2718';
  };
});

