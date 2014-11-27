/**
 * m_header
 */
var app_header = angular.module('header', []);

app_header.directive('headermain', function () {
    return {
        templateUrl: 'm_header/header.html',
        restrict: 'E'
    }
});