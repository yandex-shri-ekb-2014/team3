(function(){
    'use strict';

    var app = angular.module('weather', []).config(function($httpProvider){
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        });

    /**
     * Главный контроллер всего приложения
     */
    app.controller('weatherController', function($scope, $http, $log) {

        var locationPath = window.location.pathname;

        // Определяем данные для графиков и рисуем их
//        $scope.temperatures =  [7, 4, 2, 0 -2, -5, 0, 4, 2, -2, -5, -7, -3, 0, 2, 2, 5, 7, 4, 0, -1, -3, -4, -6, 4];
//        initGraphs($scope.temperatures);

        // Запихиваем текущий урл в историю
        window.history.pushState('init', 'Страница входа', locationPath);

        // Выставляем текущую вкладку в weatherType
        switch(locationPath) {
            case '/hours':
                $scope.weatherType = 3;
                break;
            case '/full':
                $scope.weatherType = 2;
                break;
            default:
                $scope.weatherType = 1;
        }

        // Если у нас нет значения координт или они устарели, то получаем новые
        checkLocalStorageData('actualCities', 60000, $scope, 'geocode', saveLocation);

        console.log('WeatherController was inited.');

        /**
         * Получаем координаты пользователя при первой загрузке
         */
        function saveLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    successLocation,
                    errorLocation,
                    { maximumAge: 60000, timeout: 1500, enableHighAccuracy: true }
                );
            } else {
                errorLocation({ code: 1, message: 'Browser don\'t support geolocation' });
            }
        }

        /**
         * Устанавливаем полученные значения
         * @param data
         */
        function successLocation(data) {
            geocode({
                lat: data.coords.latitude,
                lng: data.coords.longitude
            });
        }

        /**
         * Ставим дефолтные значение
         */
        function errorLocation(err) {

            // Если есть данные в localstorage, то вставяем, если нет, то получаем дефолтные
            if (typeof localStorage['actualCity'] != 'undefined') {
                $scope.geocode = JSON.parse(localStorage['actualCity']).data;
            } else {
                // По-умолчанию возвращаем координаты Екб
                geocode({
                    lat: 56.837992,
                    lng: 60.597223
                });
            }

            console.log('ERROR(' + err.code + '): ' + err.message);
            console.log($scope.geocode);
        }

        /**
         * Geocode from Yandex API
         * @param geolocation
         */
        function geocode(geolocation) {
            $http.get('http://ekb.shri14.ru/api/geocode?coords=' + geolocation.lng + ',' + geolocation.lat)
                .success(function(data) {

                    // сохраняем в localstorage
                    saveToLocalStorage('actualCity', data);

                    // получаем данные locality и сохраняем в localStorage
                    localities(data.geoid);

                    // добавляем id города в просмторенные города
                    pushFactualId(data.geoid);

                    $scope.geocode = data;

                    $log.log(data);
                });
        }

        /**
         * Localities from Yandex API
         * @param geoid
         */
        function localities(geoid) {
            $http.get('http://ekb.shri14.ru/api/localities/' + geoid)
                .success(function(data) {
                    saveToLocalStorage('locality', data);

                    for (var i = data.forecast.length; i--;) {
                        var date = new Date(data.forecast[i].date);
                        data.forecast[i].weekDay = date.getDay();
                        data.forecast[i].day = date.getDate();
                        data.forecast[i].month = date.getMonth();
                    }
                    $scope.months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                    $scope.days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
                    $scope.parts = ['утром', 'днём', 'вечером', 'ночью'];
                    $scope.locality = data;
                    initGraphs(data);

                    $log.log(data, $scope.locality);
                });
        }

        /**
         * Сохраняем данные в localStorage
         * @param key
         * @param data
         */
        function saveToLocalStorage(key, data) {
            localStorage[key] = JSON.stringify({
                'data': data,
                'timestamp': new Date().getTime()
            });
        }

        /**
         * Сохраняем geoid в localStorage
         * @param geoid
         */
        function pushFactualId(geoid) {
            if (localStorage["factualIds"]) {
                var cachedIds = JSON.parse(localStorage["factualIds"]).geoids.slice(0,2);

                if (cachedIds.indexOf(geoid) == -1) {
                    cachedIds.unshift(geoid);

                    localStorage["factualIds"] = JSON.stringify({
                        'geoids': cachedIds
                    });
                }
            } else {
                localStorage["factualIds"] = JSON.stringify({
                    'geoids': [geoid]
                });
            }
        }
    });

    /**
     * Контроллер для обработки кнопок типа прогноза
     */
    app.controller('buttonsController', function($scope, $http, $log, $compile) {
        $log.log('buttonsController inited.');

        $scope.forecastClick = function($event, id){
            $event.preventDefault();

            // Устанавливаем текущую вкладку
            $scope.weatherType = id;

            // Получаем необходимый блок для отображения
            switch(id) {
                case 1:
                    ajaxGet('/b-short', '/');
                    break;
                case 2:
                    ajaxGet('/b-full', '/full');
                    break;
                case 3:
                    ajaxGet('/b-hours', '/hours', function() {
                        initGraphs($scope.locality);
                    });
                    break;
            }
        };

        /**
         * Получаем блок для отображения по адресу ajaxUrl, сохряняем в историю и выполняем коллбэк
         * @param ajaxUrl
         * @param historyUrl
         * @param callback
         */
        function ajaxGet(ajaxUrl, historyUrl, callback) {
            document.querySelector('.forecast .spinner__wrap').classList.toggle('hidden');
            $http.get(ajaxUrl).
                success(function(data, status, headers, config) {
                    document.querySelector('.forecast__data').innerHTML = data;
                    $compile(document.querySelector('.forecast__data'))($scope);
                    window.history.pushState('', '', historyUrl);
                    document.querySelector('.forecast .spinner__wrap').classList.toggle('hidden');

                    if (typeof callback == 'function') callback();
                }).
                error(function(data, status, headers, config) {
                    $log.log(data);
                });
        }

    });

    /**
     * Контроллер для обработи выпадайки "Другие города"
     */
    app.controller("otherTownsController", function($scope, $http) {

        /**
         * Обрабатываем клик на выпадайку других городов
         */
        $scope.onOtherTownsClick = function() {

            if (localStorage["factualIds"]) {
                var ids = JSON.parse(localStorage["factualIds"]).geoids;
                saveFactualTemp(ids.toString());
            }
        };

        /**
         * Обработка клика на городе из списка 3 последних
         */
        $scope.onTownChange = function() {
          // @todo: сделать обработчик, который получает данные выбранного города и всё такое
        };

        /**
         * Получаем фактическую температуру и вставлем данные в скоуп
         * @param ids
         */
        function saveFactualTemp(ids) {
            $http.get('http://ekb.shri14.ru/api/factual?ids=' + ids)
                .success(function(data) {
                    $scope.factualTemp = data;
                });
        }
    });
})();

/**
 * Проверяем данные в localStorage на старость и обновляем, если устарели
 * @param key
 * @param period
 * @param scope
 * @param scopekey
 * @param callback
 */
function checkLocalStorageData(key, period, scope, scopekey, callback) {
    if (typeof localStorage[key] == 'undefined') {
        if (callback && typeof callback == 'function') callback();
    } else {
        var object = JSON.parse(localStorage["actualCities"]),
            dateString = object.timestamp,
            now = new Date().getTime();

        if (now - dateString > period) { // кэшируем на минуту
            if (callback && typeof callback == 'function') callback();

            console.log('Location was updated: ' + dateString + ', ' + now);
        }

        scope[scopekey] = object.data;
    }
}
