/**
 * m_forecast-full
 */
var appForecastfull = angular.module('forecastfull', []);

appForecastfull
    .directive('forecastfull', function () {
        return {
            templateUrl: 'm_forecast-full/forecast-full.html',
            restrict: 'E'
        }
    })
    .directive('forecastdayfull', function (/*$rootScope*/) {
        return {
            templateUrl: 'm_forecast-full/forecast-day-full.html',
            restrict: 'E',
            scope: { day: '=' , locality: '=' },
            replace: true
        }
    });