'use strict';

(function (angular, buildfire) {
    angular.module('socialPluginWidget', ['ngRoute', 'infinite-scroll', 'ngAnimate','socialModals', 'ngFileUpload', 'socialPluginFilters'])
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
                    template: '<div></div>'
                })
                .when('/thread/:threadId', {
                    templateUrl: 'templates/thread.html',
                    controllerAs: 'Thread',
                    controller: 'ThreadCtrl'
                })
                .otherwise('/');
        }])
        .run(['$location', '$rootScope','Location','Buildfire', function ( $location, $rootScope,Location,Buildfire) {
            Buildfire.navigation.onBackButtonClick = function () {
                var path = $location.path();
                if (path.indexOf('/thread') == 0) {
                    $rootScope.showThread = true;
                    $rootScope.$digest();
                }
                else
                    Buildfire.navigation.navigateHome();
            }
        }]);
})(window.angular, window.buildfire);