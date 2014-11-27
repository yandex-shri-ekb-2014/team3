/**
 * m_direct
 */
var app = angular.module('direct', []);

app.directive('direct', function() {
  return {
    templateUrl: 'm_direct/direct.html',
    restrict: 'E'
  }
});