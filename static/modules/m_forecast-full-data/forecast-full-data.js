/**
 * m_forecast-full-data
 */
app
    .directive('forecastfulldata', function () {
        return {
            templateUrl: 'm_forecast-full-data/forecast-full-data.html',
            restrict: 'E'
        }
    })
    .directive('forecastdayfull', function () {
        return {
            templateUrl: 'm_forecast-full-data/forecast-day-full.html',
            restrict: 'E',
            scope: { day: '=' , locality: '='},
            replace: true
        }
    });