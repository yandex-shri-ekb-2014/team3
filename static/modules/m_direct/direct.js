/**
 * m_direct
 */
var appDirect = angular.module('direct', []);

appDirect.directive('direct', function () {
    return {
        templateUrl: 'm_direct/direct.html',
        restrict: 'E'
    }
});