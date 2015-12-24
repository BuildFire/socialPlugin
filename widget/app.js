'use strict';

(function (angular, buildfire) {
    angular.module('socialPluginWidget', ['ngRoute', 'infinite-scroll', 'ngAnimate', 'socialModals', 'ngFileUpload', 'socialPluginFilters'])
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

                function increaseCounter() {
                    counter = counter + 1;
                }

                function decreaseCounter() {
                    counter = Math.max(counter - 1, 0);
                }

                function toggleSpinner() {
                    if (counter > 0)
                        buildfire.spinner.show();
                    else {
                        buildfire.spinner.hide();
                    }
                }

                return {

                    request: function (config) {
                        console.log('config-------------------------', config, config.url.indexOf('threadLikes'));
                        if (config.url.indexOf('threadLikes') == -1) {
                            increaseCounter();
                            toggleSpinner();
                        }
                        return config;
                    },
                    response: function (response) {
                        console.log('Counter----------------------------------', counter, 'rseponse--------------------', response);
                        decreaseCounter();
                        toggleSpinner();
                        return response;
                    },
                    responseError: function (rejection) {
                        console.log('Counter----------------------------------', counter, 'error------------------', rejection);
                        decreaseCounter();
                        toggleSpinner();
                        return $q.reject(rejection);
                    }
                };
            }];

            $httpProvider.interceptors.push(interceptor);
        }])
        .run(['$location', '$rootScope', 'Location', 'Buildfire', function ($location, $rootScope, Location, Buildfire) {
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