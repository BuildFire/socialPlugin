'use strict';

(function (angular) {
    angular.module('socialPluginContent', ['ngRoute', 'infinite-scroll', 'socialModals'])
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
        .run([ 'Buildfire', function (Buildfire) {
            Buildfire.messaging.onReceivedMessage = function (event) {
                console.log('Content syn called method called-----', event);
            };
        }])
})(window.angular);
