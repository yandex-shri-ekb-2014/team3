var appDropdown = angular.module('dropdown', []);

appDropdown
    .directive('dropdown', function ($rootScope) {
        return {
            scope: {towns:'=', onTownChange: '&', geocode: '='},
            controller: ['$scope', function($scope) {

                $scope.flag = false;

            }],
            link: function ($scope, element) {

                element.bind('click', function (e) {

                    $scope.flag = !$scope.flag;
                    $scope.$apply();
                });
            },
            templateUrl:   'm_dropdown/forecast-dropdown.html',
            replace: false,
            restrict: 'E'
        }
    });