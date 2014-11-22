(function(){
    'use strict';

    var app = angular.module('weather', []).config(function($httpProvider){
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        });

    /**
     * Главный контроллер всего приложения
     */
    app.controller('weatherController', ['$scope', '$http', '$log', function($scope, $http, $log) {

        var locationPath = window.location.pathname;

            // Определяем данные для графиков и рисуем их
        $scope.temperatures =  [7, 4, 2, 0 -2, -5, 0, 4, 2, -2, -5, -7, -3, 0, 2, 2, 5, 7, 4, 0, -1, -3, -4, -6, 4];
        initGraphs($scope.temperatures);

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
        if (typeof localStorage["actualCity"] == 'undefined') {
            saveLocation();
        } else {
            var object = JSON.parse(localStorage["actualCity"]),
                dateString = object.timestamp,
                now = new Date().getTime();

            if (now - dateString > 1000 * 60) { // кэшируем на минуту
                saveLocation();

                console.log('Location was updated: ' + dateString + ', ' + now);
            }
        }

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
                    lat: 56.814778499999996,
                    lng: 60.55392949999999
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
                    localStorage["actualCity"] = JSON.stringify({
                        'data': data,
                        'timestamp': new Date().getTime()
                    });

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
                    $log.log(data);
                });
        }

        /**
         * Factual from Yandex API
         * @param ids
         */
        function factual(ids) {
            $http.get('http://ekb.shri14.ru/api/factual?ids=' + ids)
                .success(function(data) {
                    $log.log(data);
                });
        }
    }]);

    /**
     * Контроллер для обработки кнопок типа прогноза
     */
    app.controller("buttonsController", ['$scope', '$http', '$log', function($scope, $http, $log) {
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
                        initGraphs($scope.temperatures);
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
                    window.history.pushState('', '', historyUrl);
                    document.querySelector('.forecast .spinner__wrap').classList.toggle('hidden');

                    if (typeof callback != 'function') callback();
                }).
                error(function(data, status, headers, config) {
                    $log.log(data);
                });
        }

    }]);
})();
