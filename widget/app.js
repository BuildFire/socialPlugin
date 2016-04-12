'use strict';

(function (angular, buildfire) {
    angular.module('socialPluginWidget', ['ngRoute', 'infinite-scroll', 'ngAnimate', 'socialModals', 'ngFileUpload', 'socialPluginFilters'])
        .config(['$routeProvider', '$compileProvider', '$httpProvider', function ($routeProvider, $compileProvider, $httpProvider) {

            /**
             * To make href urls safe on mobile
             */
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);


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
                        if (config.url.indexOf('threadLikes') == -1 && config.url.indexOf('thread/add') == -1 && config.url.indexOf('Image/upload') == -1) {
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
                    $location.path('/');
                    $rootScope.$digest();
                }
                else
                    Buildfire.navigation._goBackOne();
            }
        }])
        .directive('handlePhoneSubmit', function () {
            return function (scope, element, attr) {
                var textFields = $(element).children('textarea[name="text"]');
                console.log("---------------------------------->",textFields);
                $(element).submit(function() {
                    console.log('form was submitted');
                    textFields.blur();
                });
            };
        })
        .filter('getUserImage', ['Buildfire', function (Buildfire) {
            return function (usersData, userId) {
                var userImageUrl = '';
                usersData.some(function (userData) {
                    if (userData.userObject._id == userId) {
                        userImageUrl = userData.userObject.imageUrl ? Buildfire.imageLib.cropImage(userData.userObject.imageUrl, {width:40,height:40}) : '';
                        return true;
                    }
                });
                return userImageUrl;
            }
        }])
        .directive("loadImage", [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.attr("src", "../../../styles/media/holder-" + attrs.loadImage + ".gif");

                    var elem = $("<img>");

                    elem[0].onload = function () {
                        element.attr("src", attrs.finalSrc);
                        elem.remove();
                    };
                    elem.attr("src", attrs.finalSrc);
                }
            };
        }]);
})(window.angular, window.buildfire);