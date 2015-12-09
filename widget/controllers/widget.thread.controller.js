'use strict';

(function (angular) {
    angular.module('socialPluginWidget')
        .controller('ThreadCtrl', ['$scope', '$routeParams', 'SocialDataStore', 'Modals','$rootScope','Buildfire', function ($scope, $routeParams, SocialDataStore, Modals,$rootScope,Buildfire) {
            console.log('Thread controller is loaded');
            console.log('$routeParams--------------------------------', $routeParams);
            var Thread = this;
            var userIds = [];
            var usersData = [];
            if ($routeParams.threadId) {
                SocialDataStore.getThreadByUniqueLink($routeParams.threadId).then(
                    function (data) {
                        if (data && data.data && data.data.result) {
                            var uniqueIdsArray = [];
                            $rootScope.showThread=false;
                            Thread.post = data.data.result;
                            uniqueIdsArray.push(Thread.post.uniqueLink);
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
                            SocialDataStore.getThreadLikes(uniqueIdsArray).then(function (response) {
                                console.info('get thread likes response is: ', response.data.result);
                                if(response.data.error) {
                                    console.error('Error while getting likes of thread by logged in user ', response.data.error);
                                } else if(response.data.result) {
                                    console.info('Thread likes fetched successfully', response.data.result);
                                    Thread.post.isUserLikeActive = response.data.result[0].isUserLikeActive;
                                }
                            }, function (err) {
                                console.log('Error while fetching thread likes ', err);
                            });
                        }
                        console.log('Success------------------------get Post', data);
                    },
                    function (err) {
                        console.log('Error----------Get Post', err);
                    }
                );
            }
            /**
             * Thread.addComment method checks whether image is present or not in comment.
             */
            Thread.addComment = function () {
                if(Thread.picFile) {                // image post
                    var success = function (response) {
                        console.log('response inside controller for image upload is: ', response);
                        addComment(response.data.result);
                    };
                    var error = function (err) {
                        console.log('Error is : ', err);
                        Thread.picFile = '';
                        Thread.comment = '';
                    };
                    SocialDataStore.uploadImage(Thread.picFile).then(success, error);
                }
                else if(Thread.comment) {
                    addComment();
                }
            };
            /**
             * loadMoreComments methods is loads the more comments of a post.
             */
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
            /**
             * getUserName method is used to get the username on the basis of userId.
             * @param userId
             * @returns {string}
             */
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
            /**
             * getUserImage is used to get userImage on the basis of userId.
             * @param userId
             * @returns {string}
             */
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
            /**
             * showMoreOptions method shows the more Option popup.
             */
            Thread.showMoreOptions=function(){
                Modals.showMoreOptionsModal({}).then(function(data){
                        console.log('Data in Successs------------------data');
                    },
                    function(err){
                        console.log('Error in Error handler--------------------------',err);
                    });
            };
            /**
             * likeThread method is used to like a post.
             * @param post
             * @param type
             */
            Thread.likeThread = function (post, type) {
                var uniqueIdsArray = [];
                uniqueIdsArray.push(post.uniqueLink);
                var success = function (response) {
                    console.log('inside success of getThreadLikes',response);
                    if(response.data && response.data.result && response.data.result.length > 0) {
                        if(response.data.result[0].isUserLikeActive) {
                            SocialDataStore.addThreadLike(post, type).then(function (res) {
                                console.log('thread gets liked', res);
                                post.likesCount++;
                                post.waitAPICompletion = false;
                                post.isUserLikeActive = false;
                                if (!$scope.$$phase)$scope.$digest();
                            }, function (err) {
                                console.log('error while liking thread', err);
                            });
                        } else {
                            SocialDataStore.removeThreadLike(post, type).then(function (res) {
                                console.log('thread like gets removed', res);
                                if(res.data && res.data.result)
                                    post.likesCount--;
                                post.waitAPICompletion = false;
                                post.isUserLikeActive = true;
                                if (!$scope.$$phase)$scope.$digest();
                            }, function (err) {
                                console.log('error while removing like of thread', err);
                            });
                        }
                    }
                };
                var error = function (err) {
                    post.waitAPICompletion = false;
                    console.log('error is : ', err);
                };
                if(!post.waitAPICompletion) {
                    post.waitAPICompletion = true;
                    SocialDataStore.getThreadLikes(uniqueIdsArray).then(success, error);
                }
            };
            /**
             * follow method is used to follow the thread/post.
             */
            Thread.follow=function(){

                SocialDataStore.getUserSettings({threadId:Thread.post._id,userId:Thread.post.userId}).then(function(data){
                    console.log('Get USer Seetings------------------',data);
                },function(err){
                    console.log('Error while getting user Details--------------',err);
                });
            };
            Thread.unFollow=function(){

            };
            /**
             * getDuration method to used to show the time from current.
             * @param timestamp
             * @returns {*}
             */
            Thread.getDuration = function (timestamp) {
                if(timestamp)
                    return moment(timestamp.toString()).fromNow();
            };
            /**
             * addComment method is used to add the comment to a post.
             * @param imageUrl
             */
            function addComment(imageUrl){
                SocialDataStore.addComment({threadId: Thread.post._id, comment: Thread.comment,imageUrl:imageUrl || null}).then(
                    function (data) {
                        console.log('Add Comment Successsss------------------', data);
                        Thread.picFile = '';
                        Thread.comment = '';
                    },
                    function (err) {
                        console.log('Add Comment Error------------------', err);
                        Thread.picFile = '';
                        Thread.comment = '';
                    }
                );
            }
            Buildfire.messaging.onReceivedMessage = function (event) {
                console.log('Widget syn called method in controller Thread called-----', event);
                if(event && event.name=='POST_DELETED' && event._id==Thread.post._id){
                    $rootScope.showThread = true;
                    $rootScope.$digest();
                }
                /*else if(event && event.name=='BAN_USER'){
                    WidgetWall.posts = WidgetWall.posts.filter(function (el) {
                        return el.userId != event._id;
                    });
                    if (!$scope.$$phase)
                        $scope.$digest();
                }*/
            };
        }])
})(window.angular);