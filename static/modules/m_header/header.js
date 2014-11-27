/**
 * m_header
 */
var app = angular.module('header', []);

app.directive('headermain', function () {
    return {
        templateUrl: 'm_header/header.html',
        restrict: 'E'
    }
});