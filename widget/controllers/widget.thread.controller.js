'use strict';

(function (angular) {
    angular.module('socialPluginWidget')
        .controller('ThreadCtrl', ['$scope', '$routeParams', 'SocialDataStore', function ($scope, $routeParams, SocialDataStore) {
            var Thread = this;
            var userIds = [];
            var usersData = [];
            console.log('$routeParams--------------------------------', $routeParams);
            if ($routeParams.threadId) {
                SocialDataStore.getThreadByUniqueLink($routeParams.threadId).then(
                    function (data) {
                        if (data && data.data && data.data.result) {
                            Thread.post = data.data.result;
                            userIds.push(Thread.post.userId);
                            SocialDataStore.getCommentsOfAPost({threadId: Thread.post._id}).then(
                                function (data) {
                                    console.log('Success get Comments---------', data);
                                    if(data && data.data && data.data.result)
                                    Thread.comments=data.data.result;
                                    Thread.comments.forEach(function(commentData) {
                                        if(userIds.indexOf(commentData.userId) == -1) {
                                            userIds.push(commentData.userId);
                                        }
                                    });
                                    if(userIds && userIds.length > 0) {
                                        SocialDataStore.getUsers(userIds).then(function (response) {
                                            console.info('Users fetching for comments and response is: ', response.data.result);
                                            if(response.data.error) {
                                                console.error('Error while fetching users for comments ', response.data.error);
                                            } else if(response.data.result) {
                                                console.info('Users fetched successfully for comments ', response.data.result);
                                                usersData = response.data.result;
                                            }
                                        }, function (err) {
                                            console.log('Error while fetching users of comments inside thread page: ', err);
                                        });
                                    }
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
            Thread.getUserName = function (userId) {
                var userName = '';
                usersData.some(function(userData) {
                    if(userData.userObject._id == userId) {
                        userName = userData.userObject.displayName || '';
                        return true;
                    }
                });
                return userName;
            };
            Thread.getUserImage = function (userId) {
                var userImageUrl = '';
                usersData.some(function(userData) {
                    if(userData.userObject._id == userId) {
                        userImageUrl = userData.userObject.imageUrl || '';
                        return true;
                    }
                });
                return userImageUrl;
            };
            Thread.likeThread = function (post, type) {
                SocialDataStore.addThreadLike(post, type).then(function (res) {
                    console.log('thread gets liked', res);
                    post.likesCount++;
                    if (!$scope.$$phase)$scope.$digest();
                }, function (err) {
                    console.log('error while liking thread', err);
                });
            };
        }])
})(window.angular);