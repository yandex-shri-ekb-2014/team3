/**
 * m_forecast-hours
 */
app.directive('forecasthours', function() {
  return {
    link: function (scope, element, attrs) {
        var data = scope.locality.forecast[0].hours,
            temperatures = [];

        for (var i = data.length; i--;) {
            temperatures.unshift(data[i].temp);
        }

        // ***** Графики
        setTimeout(function() {
            // Ставим правильные высоты исходя из массива температур на сутки
            (function (temperatures) {
                if (typeof element[0].querySelector('.forecast-hours') != 'undefined') {

                    var max = temperatures[0],
                        min = temperatures[0],
                        maxHeight = parseInt(window.getComputedStyle(element[0].querySelector('.forecast-hours')).height) - 10,
                        step = 0,
                        insertedHTML = '';

                    for (var i = 0; i < temperatures.length; i++) {
                        if (temperatures[i] > max)
                            max = temperatures[i];
                        if (temperatures[i] < min)
                            min = temperatures[i];
                    }

                    step = maxHeight / (Math.max(Math.abs(min), Math.abs(max))*2);
                    console.log(step);

                    for (var i = 0; i < temperatures.length; i++) {
                        insertedHTML +=
                            '<div class="forecast-hours__row" style="height: ' +
                                Math.round(maxHeight/2 + step * temperatures[i] + 5) +
                                'px; margin-top: '+ Math.round(maxHeight/2 - step * temperatures[i]) +'px">' +
                                '<span class="legend__item-temperature">' + ( (temperatures[i] > 0 ? '+' +
                                temperatures[i] : temperatures[i]) ) + '</span>' +
                                '</div>';
                    }
                    element[0].querySelector('.forecast-hours').innerHTML = insertedHTML;
                }
            })(temperatures);

            // Отрисовываем график на канвас
            (function (temperatures) {
                if (typeof element[0].querySelector('.forecast-canvas') != 'undefined') {

                    // Параметры
                    var canvas = element[0].querySelector('.forecast-canvas'),
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
                            //MAX_HEIGHT / 2 - temperatures[i] * step - 5
                        );

                        // Отрисовываем линию
                        ctx.lineTo(
                            (MAX_WIDTH / 24) * i + 20,
                            MAX_HEIGHT / 2 - step * temperatures[i] - max * step
                            //    MAX_HEIGHT / 2 - temperatures[i] * step
                        );
                        ctx.strokeStyle = gradient;
                        ctx.stroke();
                    }
                    ctx.lineTo(MAX_WIDTH, MAX_HEIGHT / 2);
                    ctx.stroke();
                }
            })(temperatures);
        }, 1);
    },
    scope: true,
    templateUrl: 'm_forecast-hours/forecast-hours.html',
    restrict: 'E'
  }
});