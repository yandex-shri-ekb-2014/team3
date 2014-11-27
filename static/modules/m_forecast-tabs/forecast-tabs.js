/**
 * m_forecast-menu
 */
var app = angular.module('tabs', []);

app
    .directive('tabs', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            controller: function ($scope, $element, $attrs) {
                var panes = $scope.panes = [];
                $scope.classes = $attrs['class'].split(' ')[0];

                $scope.select = function (pane) {
                    angular.forEach(panes, function (pane) {
                        pane.selected = false;
                    });
                    pane.selected = true;
                }

                this.addPane = function (pane) {
                    if (panes.length == 0) $scope.select(pane);
                    panes.push(pane);
                }
            },
            templateUrl: 'm_forecast-tabs/forecast-tabs.html',
            replace: true
        };
    })
    .directive('pane', function () {
        return {
            require: '^tabs',
            restrict: 'E',
            transclude: true,
            scope: {title: '@'},
            link: function (scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
            },
            template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
            '</div>',
            replace: true
        };
    });

