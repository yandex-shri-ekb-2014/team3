(function(){
    'use strict';

    var app = angular.module('weather', []).config(function($httpProvider){
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        });

    app.directive('openselect', function () {

        return {
            restrict: 'E',
            scope: {
                b: '@'
            },
            transclude: true,
            template: '<div openselect="openselect" class="options__towns"><a href="#" class="towns__title">Другой город</a>'+
                '<ul ng-show="b" class="towns__list">'+
                    '<li class="towns-item">Последние города</li>'+
                    '<li ng-repeat="town in factualTemp" class="towns-item"><a ng-class="{&quot;towns-item__link-active&quot; : town.geoid == geocode.geoid}" ng-href="#{{town.geoid}}" ng-click="onTownChange(town.geoid, town.name)" class="towns-item__link">{{town.name}} ({{town.temp}})</a></li>'+
                    '<li class="towns-item-all"><a ng-href="#" ng-click="onAllCitiesClick()" class="towns-item__link-all">Все города</a></li>'+
                '</ul>'+
            '</div>',
            link: function(scope, element, attrs) {
                scope.b = true;

                element.bind("click" , function(e){
                    scope.b = !scope.b;
                    scope.$apply();

                    e.preventDefault();
                });
            }
        }
    });

    /**
     * Главный контроллер всего приложения
     */
    app.controller('weatherController', function($scope, $http, $log) {
        // Для кеширования блоков отображения
        $scope.blocks = [];
        $scope.Math = Math;

        // Запихиваем текущий урл в историю
        var locationPath = window.location.pathname;
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

        // Если у нас нет значения или они устарели, то получаем новые
        checkLocalStorageData('actualCity', 60000, $scope, 'geocode', saveLocation);
        checkLocalStorageData('locality', 900000, $scope, 'locality', localities);

        // Инициализируем графики, если мы на странице почасовки
        if (locationPath == '/hours' && $scope.locality) {
            initGraphs($scope.locality.forecast[0].hours);
        }

        // Обновляем данные для отображения каждые 15 минут
        setInterval(function() { localities($scope.geocode.geoid); }, 900000);


        console.log('WeatherController was inited.');


        // *************** Обработчики кликов

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
        $scope.onTownChange = function(geoid, name, needClose) {
            // Если мы пришли с развёрнутого списка, то скрываем список всех городов
            if (needClose) {
                document.getElementsByClassName('alltowns')[0].classList.add('hidden');
            }

            localities(geoid);
            $scope.geocode.geoid = geoid;
            $scope.geocode.name = name;

            pushFactualId(geoid);

            // сохраняем в localStorage
            saveToLocalStorage('actualCity', $scope.geocode);
            // скрываем выпадающий список последних городов
            document.getElementsByClassName('towns__list')[0].classList.add('hidden');
        };

        $scope.onAllCitiesClick = function(countryId) {
            // Если данных о городах, нет в скоупе, то получаем их. Если есть, то просто показываем.
            if (!$scope.allTownsList) {
                $http.get('http://ekb.shri14.ru/api/localities/' + (countryId ? countryId : 225 ) + '/cities')
                    .success(function(data) {

                        function NoCaseSort(x, y) {
                            if (x.name.toLocaleUpperCase() < y.name.toLocaleUpperCase())
                                return -1;
                            else if (x.name.toLocaleUpperCase() > y.name.toLocaleUpperCase())
                                return 1;
                            else
                                return 0;
                        }

                        data = data.sort(NoCaseSort);

                        console.log(data);

                        $scope.allTownsList = data;
                        document.getElementsByClassName('alltowns')[0].classList.remove('hidden');
                    });
            } else {
                document.getElementsByClassName('alltowns')[0].classList.remove('hidden');
            }
        };


        // *************** Функции-хелперы

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
                if (typeof localStorage['locality'] != 'undefined') {
                    $scope.locality = JSON.parse(localStorage['locality']).data;
                    $log.log('Locality upped form localStorage.');
                }
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

                    $scope.geocode = data;

                    // сохраняем в localstorage
                    saveToLocalStorage('actualCity', data);

                    // получаем данные locality и сохраняем в localStorage
                    checkLocalStorageData('locality', 900000, $scope, 'locality', localities);
                    if (locationPath == '/hours' && $scope.locality) {
                        initGraphs($scope.locality.forecast[0].hours);
                    }

                    // добавляем id города в просмторенные города
                    pushFactualId(data.geoid);

                    $log.log(data);
                });
        }

        /**
         * Localities from Yandex API
         * @param geoid
         */
        function localities(geoid) {

            if (!$scope.geocode && !geoid) return;
            geoid = geoid ? geoid : $scope.geocode.geoid;

            $http.get('http://ekb.shri14.ru/api/localities/' + geoid)
                .success(function(data) {
                    for (var i = data.forecast.length; i--;) {
                        var date = new Date(data.forecast[i].date);
                        data.forecast[i].weekDay = date.getDay();
                        data.forecast[i].day = date.getDate();
                        data.forecast[i].month = date.getMonth();
                    }
                    data.months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                    data.days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
                    data.parts = ['утром', 'днём', 'вечером', 'ночью'];

                    saveToLocalStorage('locality', data);
                    $scope.locality = data;
                    initGraphs(data.forecast[0].hours);

                    $log.log(data, $scope.locality);

                    $log.log('Locality updated.');
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
            var cachedIds = JSON.parse(localStorage["factualIds"]).geoids.slice(0,2);

            if (localStorage["factualIds"]) {
                if (cachedIds.indexOf(geoid) == -1) {
                    cachedIds.unshift(geoid);

                    localStorage["factualIds"] = JSON.stringify({
                        'geoids': cachedIds
                    });
                } else {
                    if (cachedIds.length > 1) {
                        var ind = cachedIds.indexOf(geoid);
                        cachedIds.unshift(cachedIds.splice(ind, 1)[0]);

                        localStorage["factualIds"] = JSON.stringify({
                            'geoids': cachedIds
                        });
                    }
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


    	// *************** Обработчики кликов

    	/**
    	 * Обработка клика по выбору блока погоды
    	 */
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
                        initGraphs($scope.locality.forecast[0].hours);
                    });
                    break;
            }
        };

        // *************** Функции-хелперы

        /**
         * Получаем блок для отображения по адресу ajaxUrl, сохряняем в историю и выполняем коллбэк
         * @param ajaxUrl
         * @param historyUrl
         * @param callback
         */
        function ajaxGet(ajaxUrl, historyUrl, callback) {
            document.querySelector('.forecast .spinner__wrap').classList.toggle('hidden');

            if ($scope.blocks[$scope.weatherType]) {
                setNewBlock($scope.blocks[$scope.weatherType], historyUrl, callback, true);
            } else {

                $http.get(ajaxUrl).
                    success(function(data, status, headers, config) {
                        setNewBlock(data, historyUrl, callback);
                    }).
                    error(function(data, status, headers, config) {
                        $log.log(data);
                    });
            }
        }

        /**
         * Обработка вставляем блок в страницу и компилируем $scope
         * @param data
         * @param historyUrl
         * @param callback
         * @param isCached
         */
        function setNewBlock(data, historyUrl, callback, isCached) {
            document.querySelector('.forecast__data').innerHTML = data;
            $compile(document.querySelector('.forecast__data'))($scope);

            if (!isCached) {
                $scope.blocks[$scope.weatherType] = data;
            }

            window.history.pushState('', '', historyUrl);
            document.querySelector('.forecast .spinner__wrap').classList.toggle('hidden');

            if (typeof callback == 'function') callback();
        }
    });


	// *************** Общие функции

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
	        var object = JSON.parse(localStorage[key]),
	            dateString = object.timestamp,
	            now = new Date().getTime();

	        if (now - dateString > period) {
	            if (callback && typeof callback == 'function') callback();

	            console.log('Location was updated: ' + dateString + ', ' + now);
	        }

	        scope[scopekey] = object.data;
	    }
	}
})();