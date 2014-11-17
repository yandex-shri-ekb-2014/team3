(function(){
    'use strict';

    var app = angular.module('weather', []);

    app.controller('weatherController', function($scope) {
        $scope.temperatures =  [7, 4, 2, 0 -2, -5, 0, 4, 2, -2, -5, -7, -3, 0, 2, 2, 5, 7, 4, 0, -1, -3, -4, -6, 4];

        initGraphs($scope.temperatures);

        console.log('WeatherController was inited.');
        window.history.pushState('init', 'Страница входа', window.location.pathname);
    });

    app.controller("buttonsController", ['$scope', '$http', '$log', function($scope, $http, $log) {
        $log.log('buttonsController inited.');

        $scope.weatherType = 1;

        $scope.forecastClick = function($event, id){
            $event.preventDefault();

            $scope.weatherType = id;

            switch(id) {
                case 1:
                    $http.get('/b-short').
                        success(function(data, status, headers, config) {
                            document.querySelector('.forecast__data').innerHTML = data;
                            window.history.pushState('short', 'Страница кратко', '/');
                        }).
                        error(function(data, status, headers, config) {
                            $log.log(data);
                        });
                    break;

                case 2:
                    $http.get('/b-full').
                        success(function(data, status, headers, config) {
                            document.querySelector('.forecast__data').innerHTML = data;
                            window.history.pushState('full', 'Страница с полным видом', '/full');
                        }).
                        error(function(data, status, headers, config) {
                            $log.log(data);
                        });
                    break;

                case 3:
                    $http.get('/b-hours').
                        success(function(data, status, headers, config) {
                            document.querySelector('.forecast__data').innerHTML = data;
                            window.history.pushState('hours', 'Страница наглядно', '/hours');

                            initGraphs($scope.temperatures);
                        }).
                        error(function(data, status, headers, config) {
                            $log.log(data);
                        });
                    break;
            }
        };

    }]);
})();
