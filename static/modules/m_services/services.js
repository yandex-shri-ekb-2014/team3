/**
 * m_services
 */
var app = angular.module('services', []);

app.directive('services', function () {
    return {
        templateUrl: 'm_services/services.html',
        restrict: 'E'
    }
});