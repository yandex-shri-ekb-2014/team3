var app = angular.module('weather',
    [
    'templates', 'alltowns', 'direct', 'dropdown',
    'forecastfull', 'forecasthours', 'forecastmain',
    'forecastshort', 'tabs', 'header', 'services'
    ]
    ).config(function ($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});


/**
 * Главный контроллер всего приложения
 */
app.controller('weatherController',
    ['$rootScope', '$scope', '$http', '$log', '$location', function ($scope, $rootScope, $http, $log, $location) {
    // Для кеширования блоков отображения
    $scope.blocks = [];
    $scope.Math = Math;
    $scope.isTownSpinnerShow = false;

    // Аля роуты
    $scope.$watch(function () { return $location.search().geoid; }, function (geoid) {
        document.getElementsByClassName('alltowns')[0].classList.add('hidden');
        localities(geoid);
        // pushFactualId(geoid);
    });

    $scope.saveFactualTemp = function (ids) {
        $http.get('http://ekb.shri14.ru/api/factual?ids=' + ids)
            .success(function (data) {
                $scope.factualTemp = data;
            });
    };
    try {
        var ids = JSON.parse(localStorage.factualIds).geoids;
        $scope.saveFactualTemp(ids.toString());
    } catch (e) {
        console.log("empty localStorage.factualIds");
    }


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

        checkSpinner($scope, 1);

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

        $scope.isTownSpinnerShow = true;

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
                data.colors = {
                    '-60': '#519fdd',
                    '-58': '#56a2dd',
                    '-56': '#5ba5de',
                    '-54': '#60a7de',
                    '-52': '#66aadf',
                    '-50': '#6bade0',
                    '-48': '#70afe0',
                    '-46': '#76b2e1',
                    '-44': '#7bb5e2',
                    '-42': '#80b7e2',
                    '-40': '#86bae3',
                    '-38': '#8bbde3',
                    '-36': '#90bfe4',
                    '-34': '#95c2e5',
                    '-32': '#9bc5e5',
                    '-30': '#a0c7e6',
                    '-28': '#a0c7e6',
                    '-26': '#abcde7',
                    '-24': '#b0cfe8',
                    '-22': '#b5d2e9',
                    '-20': '#bbd5e9',
                    '-18': '#c0d7ea',
                    '-16': '#c5daea',
                    '-14': '#caddeb',
                    '-12': '#d0dfec',
                    '-10': '#d5e2ec',
                    '-8': '#dae5ed',
                    '-6': '#e0e7ee',
                    '-4': '#e5eaee',
                    '-2': '#eaedef',
                    '0': '#f0eff0',
                    '+2': '#f0f0ec',
                    '+4': '#f1f0e9',
                    '+6': '#f2f0e6',
                    '+8': '#f3f1e3',
                    '+10': '#f4f1e0',
                    '+12': '#f5f2dc',
                    '+14': '#f5f2d9',
                    '+16': '#f6f3d6',
                    '+18': '#f7f3d3',
                    '+20': '#f8f4d0',
                    '+22': '#f8f1c8',
                    '+24': '#f9eec0',
                    '+26': '#f9ebb9',
                    '+28': '#f9e8b1',
                    '+30': '#fae5aa',
                    '+32': '#fae3a3',
                    '+34': '#fae09c',
                    '+36': '#fbde96',
                    '+38': '#fbdb8f',
                    '+40': '#fbd988',
                    '+42': '#fcd682',
                    '+44': '#fcd47b',
                    '+46': '#fcd174',
                    '+48': '#fdcf6e',
                    '+50': '#fdcc67',
                    '+52': '#fdca60',
                    '+54': '#fec759',
                    '+56': '#fec553',
                    '+58': '#fec24c',
                    '+60': '#ffc045'
                };

                // Температуры раскладывае в array
                data.temperatures = [];
                var d = data.forecast[0].hours;

                for (var i = d.length; i--;) {
                    data.temperatures.unshift(d[i].temp);
                }

                saveToLocalStorage('locality', data);
                $rootScope.locality = data;

                $rootScope.locality = data;
                $scope.locality = data;

                checkSpinner($scope, 1);

                $scope.geocode.geoid = geoid;
                $scope.geocode.name = name;
                saveToLocalStorage('actualCity', $scope.geocode);

                $scope.isTownSpinnerShow = false;
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
                // if (cachedIds.length > 1) {
                //     var ind = cachedIds.indexOf(geoid);

                //     cachedIds.unshift(cachedIds.splice(ind, 1)[0]);

                //     localStorage.factualIds = JSON.stringify({
                //         'geoids': cachedIds
                //     });
                // }
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
