/**
 * m_forecast-full
 */
var app_forecastfull = angular.module('forecastfull', []);

app_forecastfull
    .directive('forecastfull', function() {
        return {
            templateUrl: 'm_forecast-full/forecast-full.html',
            restrict: 'E'
        }
    })
    .directive('forecastdayfull', function () {
        return {
            templateUrl: 'm_forecast-full/forecast-day-full.html',
            restrict: 'E',
            scope: { day: '=' , locality: '='},
            replace: true
        }
    });