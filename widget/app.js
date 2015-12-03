'use strict';

(function (angular, buildfire) {
    angular.module('socialPluginWidget', ['ngRoute', 'infinite-scroll', 'ngAnimate','socialModals', 'ngFileUpload'])
        .config(['$routeProvider', '$compileProvider', function ($routeProvider, $compileProvider) {

            /**
             * To make href urls safe on mobile
             */
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);


            /**
             *To disable pull down to refresh functionality
             * */

//            buildfire.datastore.disableRefresh();

            $routeProvider
                .when('/', {
                    templateUrl: 'templates/wall.html',
                    controllerAs: 'WidgetWall',
                    controller: 'WidgetWallCtrl'
                })
                .when('/thread/:threadId', {
                    templateUrl: 'templates/thread.html',
                    controllerAs: 'Thread',
                    controller: 'ThreadCtrl'
                })
                .otherwise('/');
        }])
        .run(['$location', '$rootScope','Location', function ( $location, $rootScope,Location) {
            buildfire.navigation.onBackButtonClick = function () {
                var path = $location.path();
                if (path.indexOf('/thread') == 0) {
                    Location.goToHome();
                }
                else
                    buildfire.navigation.navigateHome();
            }
        }]);
})(window.angular, window.buildfire);