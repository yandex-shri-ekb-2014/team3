/**
 * m_header
 */
var appHeader = angular.module('header', []);

appHeader.directive('headermain', function () {
    return {
        templateUrl: 'm_header/header.html',
        restrict: 'E'
    }
});