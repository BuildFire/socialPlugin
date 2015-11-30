(function (angular, buildfire) {
    'use strict';
    if (!buildfire) {
        throw ("buildfire not found");
    }
    angular
        .module('socialModals', ['ui.bootstrap'])
        .factory('Modals', ['$modal', '$q', function ($modal, $q) {
            return {
                showMoreOptionsModal: function (info) {
                    var moreOptionsPopupDeferred = $q.defer();
                    var showMoreOptionModal = $modal
                        .open({
                            templateUrl: 'templates/modals/more-options-modal.html',
                            controller: 'MoreOptionsModalPopupCtrl',
                            controllerAs: 'MoreOptionsPopup',
                            size: 'sm',
                            resolve: {
                                Info: function () {
                                    return info;
                                }
                            }
                        });
                    showMoreOptionModal.result.then(function (imageInfo) {
                        moreOptionsPopupDeferred.resolve(imageInfo);
                    }, function (err) {
                        //do something on cancel
                        moreOptionsPopupDeferred.reject(err);
                    });
                    return moreOptionsPopupDeferred.promise;
                }
            };
        }])
        .controller('MoreOptionsModalPopupCtrl', ['$scope', '$modalInstance', 'Info', function ($scope, $modalInstance, Info) {
            console.log('MoreOptionsModalPopup Controller called-----');
            var MoreOptionsPopup=this;
            MoreOptionsPopup.option='';
            MoreOptionsPopup.options=['Report','Block'];
            $scope.ok = function () {
                $modalInstance.close(MoreOptionsPopup.option);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('no');
            };
        }])
})(window.angular, window.buildfire);
