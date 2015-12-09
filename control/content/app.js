'use strict';

(function (angular) {
    angular.module('socialPluginContent', ['ngRoute', 'infinite-scroll', 'socialModals', 'socialPluginFilters'])
        //injected ngRoute for routing
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'templates/home.html',
                    controllerAs: 'ContentHome',
                    controller: 'ContentHomeCtrl'
                })
                .otherwise('/');
        }])
})(window.angular);
