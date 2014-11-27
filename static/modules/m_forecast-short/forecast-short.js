/**
 * m_forecast-short
 */
var app = angular.module('forecastshort', []);

app
    .directive('forecastshort', function() {
        return {
            templateUrl: 'm_forecast-short/forecast-short.html',
            restrict: 'E'
        }
    });