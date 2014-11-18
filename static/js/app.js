(function(){
    'use strict';

    var app = angular.module('weather', []);

    /**
     * Главный контроллер всего приложения
     */
    app.controller('weatherController', function($scope) {

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

        getLocation();

        console.log('WeatherController was inited.');

        /**
         * Получаем координаты пользователя при первой загрузке
         */
        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    successLocation,
                    errorLocation,
                    { maximumAge:60000, timeout:500, enableHighAccuracy:true }
                );
            }
        }

        /**
         * Устанавливаем полученные значения
         * @param data
         */
        function successLocation(data) {
            $scope.geolocation = {
                lat: data.coords.latitude,
                lng: data.coords.longitude
            };

            console.log($scope.geolocation);
        }

        /**
         * Ставим дефолтные значение
         */
        function errorLocation(err) {
            // Хотел использовать jsapi от google, если браузер не поддерживает, но инструмент пока разрабатывается и всегда возвращает null.
            // По-умолчанию возвращаем координаты Екб
            $scope.geolocation = {
                lat: 56.814778499999996,
                lng: 60.55392949999999
            };

            console.log('ERROR(' + err.code + '): ' + err.message);
            console.log($scope.geolocation);
        }
    });

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

                    if (typeof callback !== 'undefined') callback();
                }).
                error(function(data, status, headers, config) {
                    $log.log(data);
                });
        }

    }]);
})();
