'use strict';

(function (angular) {
    angular.module('socialPluginWidget')
        .controller('ThreadCtrl', ['$scope', '$routeParams', 'SocialDataStore', function ($scope, $routeParams, SocialDataStore) {
            var Thread = this;
            console.log('$routeParams--------------------------------', $routeParams);
            if ($routeParams.threadId) {
                SocialDataStore.getThreadByUniqueLink($routeParams.threadId).then(
                    function (data) {
                        if (data && data.data && data.data.result) {
                            Thread.post = data.data.result;
                            SocialDataStore.getCommentsOfAPost({threadId: Thread.post._id}).then(
                                function (data) {
                                    console.log('Success get Comments---------', data);
                                    if (data && data.data && data.data.result)
                                        Thread.comments = data.data.result;
                                },
                                function (err) {
                                    console.log('Error get Comments----------', err);
                                }
                            );
                        }
                        console.log('Success------------------------get Post', data);
                    },
                    function (err) {
                        console.log('Error----------Get Post', err);
                    }
                );
            }
            Thread.addComment = function () {
                SocialDataStore.addComment({threadId: Thread.post._id, comment: Thread.comment}).then(
                    function (data) {
                        console.log('Add Comment Successsss------------------', data);
                    },
                    function (err) {
                        console.log('Add Comment Error------------------', err);
                    }
                );
            };
            Thread.loadMoreComments = function () {
                SocialDataStore.getCommentsOfAPost({
                    threadId: Thread.post._id,
                    lastCommentId: Thread.comments[Thread.comments.length - 1]._id
                }).then(
                    function (data) {
                        console.log('Success get Load more Comments---------', data);
                        if (data && data.data && data.data.result){
                            Thread.comments=Thread.comments.concat(data.data.result);
                            if (!$scope.$$phase)$scope.$digest();
                            console.log('After Update comments---------------------',Thread.comments);
                        }
                    },
                    function (err) {
                        console.log('Error get Load More Comments----------', err);
                    }
                );
            };
            console.log('Thread controller is loaded');
        }])
})(window.angular);