(function (angular, buildfire) {
    'use strict';
    if (!buildfire) {
        throw ("buildfire not found");
    }
    angular
        .module('socialModals', ['ui.bootstrap'])
        .factory('Modals', ['$modal', '$q', '$modalStack', function ($modal, $q, $modalStack) {
            return {
                removePopupModal: function (info) {
                    var removePopupDeferred = $q.defer();
                    var removePopupModal = $modal
                        .open({
                            templateUrl: 'templates/modals/rm-post-modal.html',
                            controller: 'RemovePopupCtrl',
                            controllerAs: 'RemovePopup',
                            size: 'sm',
                            resolve: {
                                Info: function () {
                                    return info;
                                }
                            }
                        });
                    removePopupModal.result.then(function (imageInfo) {
                        removePopupDeferred.resolve(imageInfo);
                    }, function (err) {
                        //do something on cancel
                        removePopupDeferred.reject(err);
                    });
                    return removePopupDeferred.promise;
                },
                banPopupModal: function (info) {
                    var banPopupDeferred = $q.defer();
                    var banPopupModal = $modal
                        .open({
                            templateUrl: 'templates/modals/ban-user-modal.html',
                            controller: 'BanPopupCtrl',
                            controllerAs: 'BanPopup',
                            size: 'sm',
                            resolve: {
                                Info: function () {
                                    return info;
                                }
                            }
                        });
                    banPopupModal.result.then(function (imageInfo) {
                        banPopupDeferred.resolve(imageInfo);
                    }, function (err) {
                        //do something on cancel
                        banPopupDeferred.reject(err);
                    });
                    return banPopupDeferred.promise;
                },
                resetAppPopupModal: function (info) {
                    var resetAppPopupDeferred = $q.defer();
                    var resetAppPopupModal = $modal
                        .open({
                            templateUrl: 'templates/modals/reset-app-modal.html',
                            controller: 'ResetAppPopupCtrl',
                            controllerAs: 'ResetAppPopup',
                            size: 'sm',
                            resolve: {
                                Info: function () {
                                    return info;
                                }
                            }
                        });
                    resetAppPopupModal.result.then(function (imageInfo) {
                        resetAppPopupDeferred.resolve(imageInfo);
                    }, function (err) {
                        //do something on cancel
                        resetAppPopupDeferred.reject(err);
                    });
                    return resetAppPopupDeferred.promise;
                },
                close: function(reason) {
                    $modalStack.dismissAll(reason);
                }
            };
        }])
        .controller('RemovePopupCtrl', ['$scope', '$modalInstance', 'Info', function ($scope, $modalInstance, Info) {
            console.log('RemovePopup Controller called-----');
            $scope.value=Info.name;
            $scope.ok = function () {
                $modalInstance.close('yes');
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('no');
            };
        }])
        .controller('BanPopupCtrl', ['$scope', '$modalInstance', 'Info', function ($scope, $modalInstance, Info) {
            console.log('Ban Popup Controller called-----');
            $scope.ok = function () {
                $modalInstance.close('yes');
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('no');
            };
        }])
        .controller('ResetAppPopupCtrl', ['$scope', '$modalInstance', 'Info', function ($scope, $modalInstance, Info) {
            console.log('ResetApp Popup Controller called-----');
            $scope.ok = function () {
                $modalInstance.close('yes');
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('no');
            };
        }])
})(window.angular, window.buildfire);
