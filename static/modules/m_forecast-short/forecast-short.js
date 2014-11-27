/**
 * m_forecast-short
 */
var appForecastshort = angular.module('forecastshort', []);

appForecastshort
    .directive('forecastshort', function () {
        return {
            templateUrl: 'm_forecast-short/forecast-short.html',
            restrict: 'E'
        }
    });