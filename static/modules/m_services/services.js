/**
 * m_services
 */
var app_services = angular.module('services', []);

app_services.directive('services', function () {
    return {
        templateUrl: 'm_services/services.html',
        restrict: 'E'
    }
});