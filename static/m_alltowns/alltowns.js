/**
 * m_alltowns
 */

var appAlltowns = angular.module('alltowns', []);

appAlltowns.directive('alltowns', function () {
    return {
        templateUrl: 'm_alltowns/alltowns.html',
        restrict: 'E'
    }
});