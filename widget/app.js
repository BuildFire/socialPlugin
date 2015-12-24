'use strict';

(function (angular, buildfire) {
    angular.module('socialPluginWidget', ['ngRoute', 'infinite-scroll', 'ngAnimate','socialModals', 'ngFileUpload', 'socialPluginFilters'])
        .config(['$routeProvider', '$compileProvider', '$httpProvider', function ($routeProvider, $compileProvider, $httpProvider) {

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

            var interceptor = ['$q', function ($q) {
                var counter = 0;
                return {

                    request: function (config) {
                        console.log('config-------------------------',config,config.url.indexOf('threadLikes'));
                        if(config.url.indexOf('threadLikes') == -1) {
                            buildfire.spinner.show();
                            counter++;
                        }
                        return config;
                    },
                    response: function (response) {
                        console.log('Counter----------------------------------',counter, 'rseponse--------------------',response);
                        counter = counter > 0 ? counter-- : 0;
                        if (counter === 0) {
                            buildfire.spinner.hide();
                        }
                        return response;
                    },
                    responseError: function (rejection) {
                        console.log('Counter----------------------------------',counter,'error------------------',rejection);
                        counter--;
                        if (counter === 0) {
                            buildfire.spinner.hide();
                        }

                        return $q.reject(rejection);
                    }
                };
            }];

            $httpProvider.interceptors.push(interceptor);
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