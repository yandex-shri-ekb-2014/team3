var app = angular.module('weather',
    [
    'templates', 'alltowns', 'direct',
    'forecastfull', 'forecasthours', 'forecastmain',
    'forecastshort', 'tabs', 'header', 'services'
    ]
    ).config(function ($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

app.directive('dropdown', function ($rootScope) {
    return {
        controller: ['$rootScope', '$http', function ($rootScope, $http) {
            $rootScope.saveFactualTemp = function (ids) {
                $http.get('http://ekb.shri14.ru/api/factual?ids=' + ids)
                    .success(function (data) {
                        $rootScope.factualTemp = data;
                    });
            }
        }],
        link: function ($rootScope, element) {
            element.bind('click', function (e) {
                e.preventDefault();

                if (localStorage.factualIds) {
                    var ids = JSON.parse(localStorage.factualIds).geoids;
                    $rootScope.saveFactualTemp(ids.toString());
                }

                $rootScope.flag = !~~$rootScope.flag;
                $rootScope.$apply();
            });
        },
        template:   '<div class="options__towns">' +
            '<a href="#" class="towns__title">Другой город</a>' +
            '<ul ng-show="flag" class="towns__list">' +
            '<li class="towns-item">Последние города</li>' +
            '<li ng-repeat="town in factualTemp" class="towns-item">' +
            '<a ng-class="{\'towns-item__link-active\' : town.geoid == geocode.geoid}" ' +
            'ng-href="#{{town.geoid}}" ng-click="onTownChange(town.geoid, town.name)" class="towns-item__link">' +
            '{{town.name}} ({{town.temp}})</a>' +
            '</li>' +
            '<li class="towns-item-all">' +
            '<a ng-href="#" ng-click="onAllCitiesClick()" class="towns-item__link-all">Все города</a>' +
            '</li>' +
            '</ul>' +
            '</div>',
        replace: true,
        restrict: 'A'
    }
});

/**
 * Главный контроллер всего приложения
 */
app.controller('weatherController',
    ['$rootScope', '$scope', '$http', '$log', function ($scope, $rootScope, $http, $log) {
    // Для кеширования блоков отображения
    $scope.blocks = [];
    $scope.Math = Math;

    // Если у нас нет значения или они устарели, то получаем новые
    checkLocalStorageData('actualCity', 60000, $scope, 'geocode', saveLocation);
    checkLocalStorageData('locality', 900000, $scope, 'locality', localities);

    // Обновляем данные для отображения каждые 15 минут
    setInterval(function () { localities($scope.geocode.geoid); }, 900000);

    console.log('WeatherController was inited.');


    // *************** Обработчики кликов

    /**
    * Обработка клика на городе из списка 3 последних
    */
    $scope.onTownChange = function (geoid, name, needClose) {
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
    };

    $scope.onAllCitiesClick = function (countryId) {
        // Если данных о городах, нет в скоупе, то получаем их. Если есть, то просто показываем.
        if (!$scope.allTownsList) {
            $http.get('http://ekb.shri14.ru/api/localities/' + (countryId ? countryId : 225 ) + '/cities')
                .success(function (data) {

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
    * Получаем координаты пользователя при первой загрузке
    */
    function saveLocation () {
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
    function successLocation (data) {
        geocode({
            lat: data.coords.latitude,
            lng: data.coords.longitude
        });
    }

    /**
    * Ставим дефолтные значение
    */
    function errorLocation (err) {

        // Если есть данные в localstorage, то вставяем, если нет, то получаем дефолтные
        if (typeof localStorage.actualCity != 'undefined') {
            $scope.geocode = JSON.parse(localStorage.actualCity).data;
            if (typeof localStorage.locality != 'undefined') {
                $scope.locality = JSON.parse(localStorage.locality).data;
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
    function geocode (geolocation) {
        $http.get('http://ekb.shri14.ru/api/geocode?coords=' + geolocation.lng + ',' + geolocation.lat)
            .success(function (data) {
                $scope.geocode = data;

                // сохраняем в localstorage
                saveToLocalStorage('actualCity', data);

                // получаем данные locality и сохраняем в localStorage
                checkLocalStorageData('locality', 900000, $scope, 'locality', localities);

                // добавляем id города в просмторенные города
                pushFactualId(data.geoid);

                checkSpinner($scope, 1);

                $log.log(data);
            });
    }

    /**
    * Localities from Yandex API
    * @param geoid
    */
    function localities (geoid) {

        if (!$scope.geocode && !geoid) return;
        geoid = geoid ? geoid : $scope.geocode.geoid;

        $http.get('http://ekb.shri14.ru/api/localities/' + geoid)
            .success(function (data) {
                for (var i = data.forecast.length; i--;) {
                    var date = new Date(data.forecast[i].date);

                    data.forecast[i].weekDay = date.getDay();
                    data.forecast[i].day = date.getDate();
                    data.forecast[i].month = date.getMonth();
                }

                data.months = [
                    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
                ];
                data.days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
                data.parts = ['утром', 'днём', 'вечером', 'ночью'];

                // Температуры раскладывае в array
                data.temperatures = [];
                var d = data.forecast[0].hours;

                for (var i = d.length; i--;) {
                    data.temperatures.unshift(d[i].temp);
                }

                saveToLocalStorage('locality', data);

                $scope.locality = data;
                checkSpinner($scope, 1);

                $rootScope.locality = data;
                $log.log('Locality updated.');
            });
    }

    /**
    * Сохраняем данные в localStorage
    * @param key
    * @param data
    */
    function saveToLocalStorage (key, data) {
        localStorage[key] = JSON.stringify({
            'data': data,
            'timestamp': new Date().getTime()
        });
    }

    /**
    * Сохраняем geoid в localStorage
    * @param geoid
    */
    function pushFactualId (geoid) {
        var cachedIds = localStorage.factualIds ? JSON.parse(localStorage.factualIds).geoids.slice(0,2) : [];

        if (localStorage.factualIds) {
            if (cachedIds.indexOf(geoid) == -1) {
                cachedIds.unshift(geoid);

                localStorage.factualIds = JSON.stringify({
                    'geoids': cachedIds
                });
            } else {
                if (cachedIds.length > 1) {
                    var ind = cachedIds.indexOf(geoid);

                    cachedIds.unshift(cachedIds.splice(ind, 1)[0]);

                    localStorage.factualIds = JSON.stringify({
                        'geoids': cachedIds
                    });
                }
            }
        } else {
            localStorage.factualIds = JSON.stringify({
                'geoids': [geoid]
            });
        }
    }
}]);

// *************** Общие функции

/**
 * Проверяем данные в localStorage на старость и обновляем, если устарели
 * @param key
 * @param period
 * @param scope
 * @param scopekey
 * @param callback
 */
function checkLocalStorageData (key, period, scope, scopekey, callback) {
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
        checkSpinner(scope, 1);
    }
}

/**
 * Мэп и всё такое
 * @param nodeList
 * @param callback
 */
function map(nodeList, callback) {
    var inputList = Array.prototype.slice.call(nodeList);
    inputList.forEach(callback);
}

/**
 * Проверяем количество обработанных запросов данных
 * @param $scope
 */
function checkSpinner ($scope) {
    $scope.spinner = ~~$scope.spinner + 1;

    if ($scope.spinner > 1) {
        setTimeout(function () { // чтобы мы не видели как подгружаются картинки
            document.getElementsByClassName('overflow')[0].style.display = 'none';
        }, 500);
    }
}
