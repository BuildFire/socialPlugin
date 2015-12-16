(function (angular, buildfire) {
    'use strict';
    if (!buildfire) {
        throw ("buildfire not found");
    }
    angular
        .module('socialModals', ['ui.bootstrap'])
        .factory('Modals', ['$modal', '$q', function ($modal, $q) {
            return {
                showMoreOptionsModal: function (info, callback) {
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
        .controller('MoreOptionsModalPopupCtrl', ['$scope', '$modalInstance', 'Info','$rootScope','SocialDataStore','Buildfire', function ($scope, $modalInstance, Info,$rootScope,SocialDataStore,Buildfire) {
            console.log('MoreOptionsModalPopup Controller called-----');
            var MoreOptionsPopup=this;
            MoreOptionsPopup.option='';
            MoreOptionsPopup.options=['Report Post'];

            $scope.postId=Info;

            $scope.ok = function (option) {
                $modalInstance.close(option);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('no');
            };

            $scope.block = function () {
                console.log('block called');

            };

            $scope.deletePost=function(postId){
                var deletePostPromise=SocialDataStore.deletePost(postId);
                deletePostPromise.then(function(response){
                    var event={};
                    event.name="POST_DELETED";
                    Buildfire.messaging.onReceivedMessage(event);
                    $modalInstance.dismiss('no');
                    console.log(response);
                },function(err){
                    $modalInstance.dismiss('no');
                    console.log(err);
                })

            }
        }])
})(window.angular, window.buildfire);
