var appDropdown = angular.module('dropdown', []);

appDropdown
    .directive('dropdown', function ($rootScope) {
        return {
            scope: {towns:'=',  geocode: '=' , onAllCitiesClick: '='},
            controller: ['$scope', function($scope) {
                
                $scope.flag = false;

            }],
            link: function ($scope, element) {

                element.bind('click', function (e) {

                    $scope.flag = !$scope.flag;
                    $scope.$apply();
                });
            },
            templateUrl:   'm_dropdown/dropdown.html',
            replace: false,
            restrict: 'E'
        }
    });
