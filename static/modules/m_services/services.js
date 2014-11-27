/**
 * m_services
 */
var appServices = angular.module('services', []);

appServices.directive('services', function () {
    return {
        templateUrl: 'm_services/services.html',
        restrict: 'E'
    }
});