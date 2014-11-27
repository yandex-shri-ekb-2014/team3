/**
 * m_direct
 */
var app_direct = angular.module('direct', []);

app_direct.directive('direct', function() {
  return {
    templateUrl: 'm_direct/direct.html',
    restrict: 'E'
  }
});