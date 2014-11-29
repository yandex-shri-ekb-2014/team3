/**
 * m_forecast-hours
 */
var appForecasthours = angular.module('forecasthours', []);

appForecasthours.directive('forecasthours', function ($rootScope) {
    return {
        link: function (scope, element, attrs) {
            // ***** Графики
            function paintGraphics() {
                if (typeof element[0].querySelector('.forecast-canvas') != 'undefined') {

                    // Параметры
                    var temperatures = $rootScope.locality.temperatures,
                        canvas = element[0].querySelector('.forecast-canvas'),
                        ctx = canvas.getContext('2d'),

                        max = temperatures[0],
                        min = temperatures[0],
                        step = 0,
                        gradient,

                        MAX_WIDTH = 960,
                        MAX_HEIGHT = 190;

                    // Определяем максимальное и минимальное значение + шаг для градуса
                    for (var i = 0; i < temperatures.length; i++) {
                        if (temperatures[i] > max)
                            max = temperatures[i];
                        if (temperatures[i] < min)
                            min = temperatures[i];
                    }
                    step = (MAX_HEIGHT / 2 - 40) / (Math.abs(min) + Math.abs(max));

                    // Устанавливаем размеры канваса
                    canvas.width  = MAX_WIDTH;
                    canvas.height = MAX_HEIGHT;

                    // Инициализируем канвас
                    ctx.moveTo(0, MAX_HEIGHT / 2);
                    ctx.lineTo(MAX_WIDTH, MAX_HEIGHT / 2);
                    ctx.stroke();

                    // Делаем градиент и устанавливаем его в стиль
                    gradient = ctx.createLinearGradient(0, 0, 0, MAX_HEIGHT);
                    gradient.addColorStop("0", "red");
                    gradient.addColorStop("0.5", "#f2f2f2");
                    gradient.addColorStop("1.0", "blue");

                    // Устанавливаем стили шрифта
                    ctx.font = "normal normal 300 12px Arial";
                    ctx.textAlign = "start";
                    ctx.textAlign = "center";

                    // Отрисовываем линии
                    ctx.moveTo(0, MAX_HEIGHT / 2);
                    for (var i = 0; i < temperatures.length; i++) {

                        // Отрисовываем текст
                        ctx.strokeStyle = '#000';
                        ctx.strokeText(
                            (temperatures[i] > 0 ? '+' + temperatures[i] : temperatures[i]),
                            MAX_WIDTH / 24 * i + 20,
                            MAX_HEIGHT / 2 - step * temperatures[i] - max * step - 5
                        );

                        // Отрисовываем линию
                        ctx.lineTo(
                            (MAX_WIDTH / 24) * i + 20,
                            MAX_HEIGHT / 2 - step * temperatures[i] - max * step
                        );
                        ctx.strokeStyle = gradient;
                        ctx.stroke();
                    }
                    ctx.lineTo(MAX_WIDTH, MAX_HEIGHT / 2);
                    ctx.stroke();
                }
            };

            $rootScope.$watch('locality', function() {
                paintGraphics();
            });
        },
        scope: true,
        templateUrl: 'm_forecast-hours/forecast-hours.html',
        restrict: 'E'
    }
})
.directive('histogram', function ($rootScope) {
    return {
        restrict: 'E',
        scope: { temperatures: '=', maxHeight: '=' },
        replace: true,
        link: function (scope,element) {
            function paintHistogram() {
                var temperatures = $rootScope.locality.temperatures,
                max = temperatures[0],
                min = temperatures[0],
                maxHeight = parseInt(window.getComputedStyle(element[0]).height) - 10,
                step = 0;

            for (var i = 0; i < temperatures.length; i++) {
                if (temperatures[i] > max)
                    max = temperatures[i];
                if (temperatures[i] < min)
                    min = temperatures[i];
            }

            step = maxHeight / (Math.max(Math.abs(min), Math.abs(max))*2);
            scope.data= [];

            for (var i = 0; i < temperatures.length; i++)
                scope.data.push({
                    height: Math.round(maxHeight/2 + step * temperatures[i] + 5),
                    margin: Math.round(maxHeight/2 - step * temperatures[i]),
                    temperature: temperatures[i] > 0 ? '+' + temperatures[i] : temperatures[i]
                });
            }

            $rootScope.$watch('locality', function() {
                paintHistogram();
            });
        },
        template: '<div class="chart forecast-hours">' +
            '<div ng-repeat="i in data" class="forecast-hours__row" ' +
            'style="height: {{i.height +\'px\'}}; margin-top: {{i.margin +\'px\'}}">' +
            '<span class="legend__item-temperature">{{i.temperature}}</span>' +
            '</div>' +
            '</div>'
    };
});
