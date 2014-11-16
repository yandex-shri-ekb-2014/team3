// Открываем нужный график
(function() {
    var chartButtons = document.querySelectorAll('[data-class]'),
        callback = function (value, index, ar) {
            value.addEventListener('click', function(e) {

                var charts = document.querySelectorAll('.chart');

                map(charts , function(value, index, ar) {
                    value.classList.add('hidden');
                });

                document.querySelector(this.getAttribute("data-class")).classList.remove('hidden');

                document.querySelector('.forecast-shortly__menu-right .menu__item-active').classList.remove('menu__item-active');
                this.classList.add('menu__item-active');

                e.preventDefault();
            }, false);
        };

    map(chartButtons, callback);
})();

// ***** Графики

// Устанавливаем высоты почасовки
var temperatures = [7, 4, 2, 0 -2, -5, 0, 4, 2, -2, -5, -7, -3, 0, 2, 2, 5, 7, 4, 0, -1, -3, -4, -6, 4];

// Ставим правильные высоты исходя из массива температур на сутки
(function (temperatures) {
    if (typeof document.getElementsByClassName('forecast-hours')[0] != 'undefined') {

        var max = temperatures[0],
            min = temperatures[0],
            maxHeight = document.getElementsByClassName('forecast-hours')[0].clientHeight,
            step = 0,
            insertedHTML = '';

        for(var i = 0; i < temperatures.length; i++) {
            if (temperatures[i] > max)
                max = temperatures[i];
            if (temperatures[i] < min)
                min = temperatures[i];
        }

        step = (maxHeight - 10) / (Math.abs(min) + Math.abs(max));

        for(var i = 0; i < temperatures.length; i++) {
            insertedHTML +=
                '<div class="forecast-hours__row" style="height: ' + Math.round(Math.abs(maxHeight / 2) + step * temperatures[i]) + 'px">'+
                    '<span class="legend__item-temperature">' + ( (temperatures[i] > 0 ? '+' + temperatures[i] : temperatures[i]) ) + '</span>'+
                    '</div>';
        }
        document.getElementsByClassName('forecast-hours')[0].innerHTML = insertedHTML;
    }
})(temperatures);

// Отрисовываем график на канвас
(function (temperatures) {
    if (typeof document.getElementsByClassName('forecast-canvas')[0] != 'undefined') {

        // Параметры
        var canvas = document.getElementsByClassName('forecast-canvas')[0],
            ctx = canvas.getContext('2d'),

            max = temperatures[0],
            min = temperatures[0],
            step = 0,
            gradient,

            MAX_WIDTH = 960,
            MAX_HEIGHT = 190;

        // Определяем максимальное и минимальное значение + шаг для градуса
        for(var i = 0; i < temperatures.length; i++) {
            if (temperatures[i] > max)
                max = temperatures[i];
            if (temperatures[i] < min)
                min = temperatures[i];
        }
        step = (MAX_HEIGHT - 40) / (Math.abs(min) + Math.abs(max));

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
        for(var i = 0; i < temperatures.length; i++) {

            // Отрисовываем текст
            ctx.strokeStyle = '#000';
            ctx.strokeText(
                (temperatures[i] > 0 ? '+' + temperatures[i] : temperatures[i]),
                MAX_WIDTH / 24 * i + 20,
                MAX_HEIGHT / 2 - temperatures[i] * step - 5
            );

            // Отрисовываем линию
            ctx.lineTo(
                (MAX_WIDTH / 24) * i + 20,
                MAX_HEIGHT / 2 - temperatures[i] * step );
            ctx.strokeStyle = gradient;
            ctx.stroke();
        }
        ctx.lineTo(MAX_WIDTH, MAX_HEIGHT / 2);
        ctx.stroke();
    }
})(temperatures);