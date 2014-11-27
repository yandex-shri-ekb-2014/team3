/**
 * m_alltowns
 */

var app_alltowns = angular.module('alltowns', []);

app_alltowns.directive('alltowns', function() {
  return {
    templateUrl: 'm_alltowns/alltowns.html',
    restrict: 'E'
  }
});