/**
 * m_forecast-short
 */
var app_forecastshort = angular.module('forecastshort', []);

app_forecastshort
    .directive('forecastshort', function() {
        return {
            templateUrl: 'm_forecast-short/forecast-short.html',
            restrict: 'E'
        }
    });