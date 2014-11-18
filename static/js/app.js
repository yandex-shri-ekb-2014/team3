(function(){
    'use strict';

    var app = angular.module('weather', []);

    /**
     * Главный контроллер всего приложения
     */
    app.controller('weatherController', function($scope, $http) {

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
                navigator.geolocation.getCurrentPosition( function(data) {
                    $scope.geolocation = {
                        lat: data.coords.latitude,
                        lng: data.coords.longitude
                    };

                    console.log('We\'ve got geolocation of the user: (' + $scope.geolocation.lat + ', ' + $scope.geolocation.lng + ')');
                });
            } else {
                /*
                    @todo: fallback в случае того, что не получили геолокацию
                 */
            }
        };
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
