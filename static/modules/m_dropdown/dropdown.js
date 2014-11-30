var appDropdown = angular.module('dropdown', []);

appDropdown
    .directive('dropdown', function () {
        return {
            scope: {towns:'=',  geocode: '=' , onallcitiesclick: '&'},
            controller: ['$scope', function ($scope) {

                $scope.flag = false;

            }],
            link: function ($scope, element) {

                element.bind('click', function () {

                    $scope.flag = !$scope.flag;
                    $scope.$apply();
                });
            },
            templateUrl:   'm_dropdown/dropdown.html',
            replace: false,
            restrict: 'E'
        }
    });
