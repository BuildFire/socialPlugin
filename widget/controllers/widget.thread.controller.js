'use strict';

(function (angular) {
    angular.module('socialPluginWidget')
        .controller('ThreadCtrl', ['$scope', '$routeParams', 'SocialDataStore', 'Modals', '$rootScope', 'Buildfire', 'EVENTS', 'THREAD_STATUS', 'FILE_UPLOAD', 'SocialItems', '$q', '$timeout', 'Location','Util', function ($scope, $routeParams, SocialDataStore, Modals, $rootScope, Buildfire, EVENTS, THREAD_STATUS, FILE_UPLOAD, SocialItems, $q, $timeout, Location,util) {
            var Thread = this;
            var userIds = [];
            Thread.usersData = [];
            var uniqueLinksOfComments = [];
            Thread.comments = [];
            Thread.userDetails = {};
            Thread.height = window.innerHeight;
            Thread.buildfire = Buildfire;
            Thread.SocialItems = SocialItems.getInstance();
            Thread.SocialItems.comments = [];
            Thread.imageSelected = false;
            Thread.imageName = '';
            Thread.post = {};
            Thread.showImageLoader = true;
            Thread.modalPopupThreadId;
            Thread.util=util;
            var _receivePushNotification;
            Thread.getFollowingStatus = function () {
                return (typeof _receivePushNotification !== 'undefined') ? (_receivePushNotification ? THREAD_STATUS.FOLLOWING : THREAD_STATUS.FOLLOW) : '';
            };

            var getUserData = function (userId) {
                if(userId){
                    if (userIds.indexOf(userId.toString()) == -1) {
                        userIds.push(userId.toString());
                    }
                    var successCallback = function (response) {
                        if (response.data.error) {
                            console.error('Error while fetching users ', response.data.error);
                        } else if (response.data.result) {
                            console.info('Users fetched successfully', response.data.result);
                            Thread.usersData = response.data.result;
                            if (!$scope.$$phase) $scope.$digest();
                        }
                    };
                    var errorCallback = function (err) {
                        console.log('Error while fetching users details ', err);

                        if (!$scope.$$phase) $scope.$digest();
                    };
                    SocialDataStore.getUsers(userIds, Thread.userDetails.userToken).then(successCallback, errorCallback);
                }
            };


            Thread.getComments = function (postId, lastCommentId) {
                SocialDataStore.getCommentsOfAPost({
                    threadId: postId,
                    lastCommentId: lastCommentId,
                    userToken: Thread.userDetails.userToken,
                    appId: Thread.SocialItems.socialAppId
                }).then(
                    function (data) {
                        var newUniqueLinksOfComments = [], newUserIds = [];
                        console.log('Success get Comments---------', data);
                        if (data && data.data && data.data.result){
                            if(lastCommentId == null){
                                if(Thread.SocialItems.comments.length == 1){
                                    var _lastCommentIdAdded = Thread.SocialItems.comments[Thread.SocialItems.comments.length - 1]._id;
                                    for(var i=0;i<data.data.result.length ; i++){
                                        if(_lastCommentIdAdded ==data.data.result[i]._id)
                                        {
                                            Thread.SocialItems.comments[Thread.SocialItems.comments.length - 1] =data.data.result[i];
                                        }
                                    }
                                }else
                                    Thread.SocialItems.comments = Thread.SocialItems.comments.concat(data.data.result);
                            }else{
                                var _lastCommentIdAdded = Thread.SocialItems.comments[Thread.SocialItems.comments.length - 1]._id;
                                for(var i=0;i<data.data.result.length ; i++){
                                    if(_lastCommentIdAdded ==data.data.result[i]._id)
                                    {
                                        Thread.SocialItems.comments[Thread.SocialItems.comments.length - 1] =data.data.result[i];
                                    }
                                }
                            }
                        }

                        Thread.SocialItems.comments.forEach(function (commentData) {
                            if (uniqueLinksOfComments.indexOf(commentData.threadId + "cmt" + commentData._id) == -1) {
                                uniqueLinksOfComments.push(commentData.threadId + "cmt" + commentData._id);
                                newUniqueLinksOfComments.push(commentData.threadId + "cmt" + commentData._id);
                            }
                            if (userIds.indexOf(commentData.userId) == -1) {
                                userIds.push(commentData.userId);
                                newUserIds.push(commentData.userId);
                            }
                        });
                        if (userIds.indexOf(Thread.post.userId) == -1) {
                            userIds.push(Thread.post.userId);
                            newUserIds.push(Thread.post.userId);
                        }
                        console.log('newUserIds :::::::::::::::::::', newUserIds, userIds);
                        console.log('newUniqueLinksOfComments :::::::::::::::::::', newUniqueLinksOfComments, uniqueLinksOfComments);
                        getCommentsLikeAndUpdate(newUniqueLinksOfComments);
                        if (newUserIds && newUserIds.length > 0) {
                            SocialDataStore.getUsers(newUserIds, Thread.userDetails.userToken).then(function (response) {
                                console.info('Users fetching for comments and response is: ', response.data.result);
                                if (response.data.error) {
                                    console.error('Error while fetching users for comments ', response.data.error);
                                } else if (response.data.result) {
                                    console.info('Users fetched successfully for comments ', response.data.result);
                                    Thread.usersData = Thread.usersData.concat(response.data.result);
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
            };

            var checkAuthenticatedUser = function (callFromInit) {
                var deferred = $q.defer();
                Buildfire.auth.getCurrentUser(function (err, userData) {
                    console.info('Current Logged In user details are -----------------', userData);
                    if (userData) {
                        Buildfire.getContext(function (err, context) {
                            if (err) {
                                console.error('error while getting buildfire context is::::::', err);
                                return deferred.reject(err);
                            } else {
                                Thread.userDetails.userId = userData._id;
                                Thread.userDetails.userToken = userData.userToken;
                                Thread.userDetails.userTags = userData.tags;
                                Buildfire.datastore.get('Social', function (err, SocialData) {
                                    if (err) {
                                        console.error('Side Thread Get Social settings', err);
                                    } else {
                                        Thread.SocialItems.appSettings = SocialData && SocialData.data && SocialData.data.appSettings;
                                        deferred.resolve();
                                        SocialDataStore.getUserSettings({
                                            threadId: Thread.post._id,
                                            userId: Thread.userDetails.userId,
                                            userToken: Thread.userDetails.userToken,
                                            appId: Thread.SocialItems.socialAppId
                                        }).then(function (response) {
                                            console.log('inside getUser settings :::::::::::::', response);
                                            if (response && response.data && response.data.result) {
                                                console.log('getUserSettings response is: ', response);
                                                _receivePushNotification = response.data.result.receivePushNotification;
                                                Thread.userDetails.settingsId = response.data.result._id;
                                                //                                                if (!$scope.$$phase)$scope.$digest();
                                            } else if (response && response.data && response.data.error) {
                                                console.log('response error is: ', response.data.error);
                                            }
                                        }, function (err) {
                                            console.log('Error while logging in user is: ', err);
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else if (err) {
                        return deferred.reject(err);
                    } else {
                        if (!callFromInit) {
                            Buildfire.auth.login(null, function (err, data) {
                                console.log('----------================', err, data);
                                if (err) {
                                    return deferred.reject(err);
                                }
                            });
                        }
                    }
                });
                return deferred.promise;
            };
            Thread.init = function () {
                Thread.SocialItems.comments = [];
                Thread.SocialItems.newCommentsAvailable = false;
                if ($routeParams.threadId) {
                    var posts = Thread.SocialItems.items.filter(function (el) {
                        return el.uniqueLink == $routeParams.threadId;
                    });
                    console.log(posts);
                    Thread.post = posts[0] || {};

                    Thread.getComments(Thread.post._id, null);

                    console.log('Single post----------------------------------------------------------', Thread.post);
                    var uniqueIdsArray = [];
                    Buildfire.history.push('Post', {post: Thread.post});
                    $rootScope.showThread = false;
                    //Thread.post = data.data.result;
                    Thread.showMore = Thread.post.commentsCount > 10;
                    uniqueIdsArray.push(Thread.post.uniqueLink);
//                    userIds.push(Thread.post.userId);

                    var checkUserPromise = checkAuthenticatedUser(true);

                    checkUserPromise.then(function () {
                        getUserData(Thread.userDetails.userId);
                        SocialDataStore.getThreadLikes(uniqueIdsArray, Thread.SocialItems.socialAppId, Thread.userDetails.userId).then(function (response) {
                            console.info('get thread likes response is: ', response.data.result);
                            if (response.data.error) {
                                console.error('Error while getting likes of thread by logged in user ', response.data.error);
                            } else if (response.data.result && response.data.result.length) {
                                console.info('Thread likes fetched successfully', response.data.result);
                                Thread.post.isUserLikeActive = response.data.result[0].isUserLikeActive;
                            }
                        }, function (err) {
                            console.log('Error while fetching thread likes ', err);
                        });
                    }, function (err) {
                        console.log('error is ------', err);
                    });
                }
            };
            Thread.init();

            /**
             * Thread.addComment method checks whether image is present or not in comment.
             */
            Thread.addComment = function () {

                var checkUserPromise = checkAuthenticatedUser(false);
                checkUserPromise.then(function () {
                    if (Thread.picFile && !Thread.waitAPICompletion) {                // image post
                        if (getImageSizeInMB(Thread.picFile.size) <= FILE_UPLOAD.MAX_SIZE) {
                            Thread.waitAPICompletion = true;
                            var success = function (response) {
                                console.log('response inside controller for image upload is: ', response);
                                Thread.imageName = Thread.imageName + ' - 100%';
                                addComment(response.data.result);
                            };
                            var error = function (err) {
                                console.log('Error is : ', err);
                                Thread.picFile = '';
                                Thread.comment = '';
                            };
                            SocialDataStore.uploadImage(Thread.picFile, Thread.userDetails.userToken, Thread.SocialItems.socialAppId).then(success, error);
                        }
                    }
                    else if (Thread.comment && !Thread.waitAPICompletion) {
                        Thread.waitAPICompletion = true;
                        addComment();
                    }
                }, function (err) {
                    console.log('error is::::', err);
                });


            };

            var getImageSizeInMB = function (size) {
                return (size / (1024 * 1024));       // return size in MB
            };

            /**
             * loadMoreComments methods is loads the more comments of a post.
             */
            Thread.loadMoreComments = function () {
                if (Thread.SocialItems.comments&& Thread.SocialItems.comments.length < Thread.post.commentsCount) {
                    SocialDataStore.getCommentsOfAPost({
                        threadId: Thread.post._id,
                        lastCommentId: Thread.SocialItems.comments[Thread.SocialItems.comments.length - 1]._id,
                        userToken: Thread.userDetails.userToken,
                        appId: Thread.SocialItems.socialAppId
                    }).then(
                        function (data) {
                            console.log('Success get Load more Comments---------', data);
                            if (data && data.data && data.data.result) {
                                Thread.SocialItems.comments= Thread.SocialItems.comments.concat(data.data.result);
                                Thread.showMore = Thread.SocialItems.comments.length < Thread.post.commentsCount;
                                if (!$scope.$$phase) $scope.$digest();
                                console.log('After Update comments---------------------', Thread.SocialItems.comments);
                            }
                        },
                        function (err) {
                            console.log('Error get Load More Comments----------', err);
                        }
                    );
                } else {
                    Thread.showMore = false;
                }
            };
            /**
             * getUserName method is used to get the username on the basis of userId.
             * @param userId
             * @returns {string}
             */
            Thread.getUserName = function (userId) {
                var userName = '';
                Thread.usersData.some(function (userData) {
                    if (userData && userData.userObject && userData.userObject._id == userId) {
                        userName = userData.userObject.displayName || 'No Name';
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
                Thread.usersData.some(function (userData) {
                    if (userData && userData.userObject && userData.userObject._id == userId) {
                        userImageUrl = userData.userObject.imageUrl || '';
                        return true;
                    }
                });
                return userImageUrl;
            };
            /**
             * showMoreOptions method shows the more Option popup.
             */
            Thread.showMoreOptions = function () {
                Thread.modalPopupThreadId = Thread.post._id;
                var checkUserPromise = checkAuthenticatedUser(false);
                checkUserPromise.then(function () {
                    Modals.showMoreOptionsModal({postId: Thread.post._id}).then(function (data) {
                            console.log('Data in Successs------------------data');
                        },
                        function (err) {
                            console.log('Error in Error handler--------------------------', err);
                        });
                }, function (err) {
                    console.log('Error is--------------------------', err);
                });

            };

            /**
             * showMoreOptions method shows the more Option popup.
             */
            Thread.showMoreOptionsComment = function (commentId) {
                Thread.modalPopupThreadId = commentId;
                var checkUserPromise = checkAuthenticatedUser(false);
                checkUserPromise.then(function () {
                    Modals.showMoreOptionsCommentModal({'commentId': commentId}).then(function (data) {
                            console.log('Data in Successs------------------data');
                        },
                        function (err) {
                            console.log('Error in Error handler--------------------------', err);
                        });
                }, function (err) {
                    console.log('Error is--------------------------', err);
                });

            };
            /**
             * likeThread method is used to like a post.
             * @param post
             * @param type
             */
            Thread.likeThread = function (post, type) {
                var checkUserPromise = checkAuthenticatedUser(false);
                checkUserPromise.then(function () {
                    var uniqueIdsArray = [];
                    uniqueIdsArray.push(post.uniqueLink);
                    if(post.isUserLikeActive){
                        post.likesCount++;
                        post.isUserLikeActive = false;
                    }else{
                        post.likesCount--;
                        post.isUserLikeActive = true;
                    }
                    var success = function (response) {
                        console.log('inside success of getThreadLikes', response);
                        if (response.data && response.data.result && response.data.result.length > 0) {
                            if (response.data.result[0].isUserLikeActive) {
                                SocialDataStore.addThreadLike(post, type, Thread.SocialItems.socialAppId, Thread.userDetails.userToken).then(function (res) {
                                    console.log('thread gets liked', res);
                                    Buildfire.messaging.sendMessageToControl({
                                        'name': EVENTS.POST_LIKED,
                                        '_id': Thread.post._id
                                    });
                                    post.waitAPICompletion = false;
                                    $rootScope.$broadcast(EVENTS.POST_LIKED, post);
                                    if (!$scope.$$phase) $scope.$digest();
                                }, function (err) {
                                    post.likesCount--;
                                    post.isUserLikeActive = true;
                                    console.log('error while liking thread', err);
                                });
                            } else {
                                SocialDataStore.removeThreadLike(post, type, Thread.SocialItems.socialAppId, Thread.userDetails.userToken).then(function (res) {
                                    console.log('thread like gets removed', res);
                                    if (res.data && res.data.result)
                                        Buildfire.messaging.sendMessageToControl({
                                            'name': EVENTS.POST_UNLIKED,
                                            '_id': Thread.post._id
                                        });
                                    post.waitAPICompletion = false;
                                    $rootScope.$broadcast(EVENTS.POST_UNLIKED, post);
                                    if (!$scope.$$phase) $scope.$digest();
                                }, function (err) {
                                    post.likesCount++;
                                    post.isUserLikeActive = false;
                                    console.log('error while removing like of thread', err);
                                });
                            }
                        }
                    };
                    var error = function (err) {
                        post.waitAPICompletion = false;
                        console.log('error is : ', err);
                        if(post.isUserLikeActive){
                            post.likesCount--;
                            post.isUserLikeActive = true;
                        }else{
                            post.likesCount++;
                            post.isUserLikeActive = false;
                        }
                    };
                    if (!post.waitAPICompletion) {
                        post.waitAPICompletion = true;
                        SocialDataStore.getThreadLikes(uniqueIdsArray, Thread.SocialItems.socialAppId, Thread.userDetails.userId).then(success, error);
                    }
                }, function (err) {
                    console.log('Error is:::::::', err);
                });

            };
            /**
             * follow method is used to follow the thread/post.
             */
            Thread.followUnfollow = function (isFollow) {
                var followNotification = false;
                if (isFollow == THREAD_STATUS.FOLLOWING) {
                    followNotification = false;
                } else if (isFollow == THREAD_STATUS.FOLLOW) {
                    followNotification = true;
                }
                SocialDataStore.saveUserSettings({
                    threadId: Thread.post._id,
                    userId: Thread.userDetails.userId,
                    userToken: Thread.userDetails.userToken,
                    settingsId: Thread.userDetails.settingsId,
                    receivePushNotification: followNotification,
                    appId: Thread.SocialItems.socialAppId
                }).then(function (data) {
                    console.log('Get User Settings------------------', data);
                    if (data && data.data && data.data.result) {
                        _receivePushNotification = data.data.result.receivePushNotification;
                    }
                }, function (err) {
                    console.log('Error while getting user Details--------------', err);
                });
            };
            /**
             * getDuration method to used to show the time from current.
             * @param timestamp
             * @returns {*}
             */
            Thread.getDuration = function (timestamp) {
                if (timestamp)
                    return moment(timestamp.toString()).fromNow();
            };

            Thread.likeComment = function (comment, type) {
                if (comment.isUserLikeActive && !comment.waitAPICompletion) {
                    comment.isUserLikeActive = false;
                    if (comment.likesCount)
                        comment.likesCount++;
                    else
                        comment.likesCount = 1;

                    comment.waitAPICompletion = true;
                    var uniqueIdsArray = [];
                    uniqueIdsArray.push(comment.threadId + "cmt" + comment._id);
                    SocialDataStore.getThreadByUniqueLink(comment.threadId + "cmt" + comment._id, Thread.SocialItems.socialAppId, Thread.userDetails.userToken).then(
                        function (data) {
                            console.log('Datat in Get CommentBy uniqueLink-----------------', data);
                            data.data.result.threadId = comment.threadId;
                            SocialDataStore.addThreadLike(data.data.result, type, Thread.SocialItems.socialAppId, Thread.userDetails.userToken).then(function (res) {
                                console.log('thread gets liked in thread page', res);
                                comment.waitAPICompletion = false;
                                $rootScope.$broadcast(EVENTS.COMMENT_LIKED);
                                if (!$scope.$$phase) $scope.$digest();
                                Buildfire.messaging.sendMessageToControl({
                                    'name': EVENTS.COMMENT_LIKED,
                                    'postId': comment.threadId,
                                    '_id': comment._id
                                });
                            }, function (err) {
                                if (comment.likesCount)
                                    comment.likesCount--;

                                comment.waitAPICompletion = false;
                                console.log('error while liking comment', err);
                            });
                        },
                        function (err) {
                            if (comment.likesCount)
                                comment.likesCount--;
                            comment.waitAPICompletion = false;
                            console.log('Get comment like ----------------error', err);
                        }
                    );
                }
                else if (!comment.waitAPICompletion) {
                    comment.isUserLikeActive = true;
                    comment.likesCount--;
                    comment.waitAPICompletion = true;
                    SocialDataStore.getThreadByUniqueLink(comment.threadId + "cmt" + comment._id, Thread.SocialItems.socialAppId, Thread.userDetails.userToken).then(
                        function (data) {
                            console.log('Datat in Get CommentBy uniqueLink-----------------', data);
                            data.data.result.threadId = comment.threadId;
                            SocialDataStore.removeThreadLike(data.data.result, type, Thread.SocialItems.socialAppId, Thread.userDetails.userToken).then(function (res) {
                                console.log('Response--------------------------remove like--------', res);
                                comment.waitAPICompletion = false;
                                $rootScope.$broadcast(EVENTS.COMMENT_UNLIKED);
                                if (!$scope.$$phase) $scope.$digest();
                                Buildfire.messaging.sendMessageToControl({
                                    'name': EVENTS.COMMENT_UNLIKED,
                                    'postId': comment.threadId,
                                    '_id': comment._id
                                });
                            }, function (err) {
                                comment.likesCount++;
                                comment.waitAPICompletion = false;
                                console.error('error while removing like of thread', err);
                            });
                        },
                        function (err) {
                            comment.likesCount++;
                            comment.waitAPICompletion = false;
                            console.log('Get comment like ----------------error', err);
                        }
                    );
                }
            };

            $rootScope.$on("Delete-Comment", function (event, comment) {
                Thread.deleteComment(comment.commentId);
            });

            Thread.deleteComment = function (commentId) {
                SocialDataStore.deleteComment(commentId, Thread.post._id, Thread.SocialItems.socialAppId, Thread.userDetails.userToken).then(
                    function (data) {
                        Buildfire.messaging.sendMessageToControl({
                            name: EVENTS.COMMENT_DELETED,
                            _id: commentId,
                            postId: Thread.post._id
                        });
                        Thread.post.commentsCount--;
                        Thread.SocialItems.comments= Thread.SocialItems.comments.filter(function (el) {
                            return el._id != commentId;
                        });
                        if (!$scope.$$phase)
                            $scope.$digest();
                        console.log('Comment deleted=============================success----------data', data);
                    },
                    function (err) {
                        console.log('Comment deleted=============================Error----------err', err);
                    }
                );
            };
            /**
             * addComment method is used to add the comment to a post.
             * @param imageUrl
             */
            var addComment = function (imageUrl) {
                var lastCommentId = null;
                if(Thread.SocialItems.comments.length > 0)
                  lastCommentId = Thread.SocialItems.comments[Thread.SocialItems.comments.length-1]._id;

                Thread.closeCommentSection();
                var commentData = {
                    threadId: Thread.post._id,
                    comment: Thread.comment ? Thread.comment.replace(/[#&%+!@^*()-]/g, function (match) {
                        return encodeURIComponent(match)
                    }) : '',
                    userToken: Thread.userDetails.userToken,
                    imageUrl: imageUrl || null,
                    userId:Thread.userDetails.userId,
                    appId: Thread.SocialItems.socialAppId
                };
                Thread.SocialItems.comments.push(commentData);
                SocialDataStore.addComment(commentData).then(
                    function (data) {
                        console.log('Add Comment Successsss------------------', data);
                        Thread.picFile = '';
                        Thread.comment = '';
                        Thread.waitAPICompletion = false;
                        Thread.post.commentsCount++;
                        Thread.imageSelected = false;
                        Thread.imageName = '';
                        commentData._id =data.data.result;
                        $rootScope.$broadcast(EVENTS.COMMENT_ADDED);
                        Buildfire.messaging.sendMessageToControl({
                            'name': EVENTS.COMMENT_ADDED,
                            '_id': Thread.post._id,
                            'userId': Thread.userDetails.userId
                        });
                        if (Thread.SocialItems.comments.length) {
                            Thread.getComments(Thread.post._id, lastCommentId);
                        }
                        else {
                            Thread.getComments(Thread.post._id, null);
                        }
                    },
                    function (err) {
                        console.log('Add Comment Error------------------', err);
                        Thread.picFile = '';
                        Thread.comment = '';
                        Thread.waitAPICompletion = false;
                    }
                );


            };
            var getCommentsLikeAndUpdate = function (uniqueLinksOfComments) {
                SocialDataStore.getThreadLikes(uniqueLinksOfComments, Thread.SocialItems.socialAppId, Thread.userDetails.userId).then(function (data) {
                        console.log('Response of a post comments like-----------------', data);
                        if (data && data.data && data.data.result && data.data.result.length) {
                            console.log('In If------------------', data.data.result);
                            Thread.SocialItems.comments.forEach(function (comment) {
                                data.data.result.forEach(function (uniqueLinkData) {
                                    if (uniqueLinkData.uniqueLink == (comment.threadId + "cmt" + comment._id)) {
                                        comment.likesCount = uniqueLinkData.likesCount;
                                        comment.isUserLikeActive = uniqueLinkData.isUserLikeActive;
                                        console.log('Updated comments data------------------', comment);
                                    }
                                });
                                if (typeof comment.isUserLikeActive == 'undefined') {
                                    comment.isUserLikeActive = true;
                                }
                            });
                        } else if (data && data.data && data.data.result == null && Thread.SocialItems.comments&& Thread.SocialItems.comments.length > 0) {
                            Thread.SocialItems.comments.forEach(function (comment) {
                                comment.isUserLikeActive = true;
                            });
                        }
                        /*data.data.result.forEach(function (uniqueLinkData) {
                         Thread.SocialItems.comments.some(function(comment){
                         if(uniqueLinkData.uniqueLink==(comment.threadId+"cmt"+comment._id)){
                         comment.likesCount=uniqueLinkData.likesCount;
                         comment.isUserLikeActive=uniqueLinkData.isUserLikeActive;
                         console.log('Updated comments data------------------',comment);
                         return true;
                         }
                         });
                         });*/
                    },
                    function (err) {
                        console.log('Response error of comment likes ------------', err);
                    });
            };

            Thread.openCommentSection = function () {
                Thread.goFullScreen = true;
                Buildfire.history.push('Comment Section',{fullScreenMode : true});
            };
            Thread.closeCommentSection = function () {
                Thread.goFullScreen = false;
                Buildfire.history.pop();
            };
            Buildfire.history.onPop(function (breadcrumb) {
                Thread.goFullScreen = false;
                if (!$scope.$$phase) $scope.$digest();
            },true);

            Thread.uploadImage = function (file) {
                console.log('inside select image method', file);
                var fileSize;
                if (file) {
                    fileSize = getImageSizeInMB(file.size);      // get image size in MB
                    Thread.imageSelected = true;
                    if (fileSize > FILE_UPLOAD.MAX_SIZE) {
                        Thread.imageName = file.name + ' - ' + FILE_UPLOAD.SIZE_EXCEED;
                        Thread.showImageLoader = false;
                    } else {
                        Thread.imageName = file.name;
                        Thread.showImageLoader = true;
                    }
                }

            };

            Thread.cancelImageSelect = function () {
                Thread.imageName = Thread.imageName.replace(' - ' + FILE_UPLOAD.SIZE_EXCEED, '') + ' - ' + FILE_UPLOAD.CANCELLED;
                $timeout(function () {
                    Thread.imageSelected = false;
                    Thread.imageName = '';
                    Thread.picFile = '';
                    Thread.showImageLoader = true;
                    if (!$scope.$$phase)
                        $scope.$digest();
                }, 500);
            };

            Thread.deletePost = function (postId) {
                var success = function (response) {
                    console.log('inside success of delete post', response);
                    if (response.data.result) {
                        Buildfire.messaging.sendMessageToControl({'name': EVENTS.POST_DELETED, '_id': postId});
                        console.log('post successfully deleted');
                        Thread.SocialItems.items = Thread.SocialItems.items.filter(function (el) {
                            return el._id != postId;
                        });
                        if (!$scope.$$phase)
                            $scope.$digest();
                    }
                };
                // Called when getting error from SocialDataStore.deletePost method
                var error = function (err) {
                    console.log('Error while deleting post ', err);
                };
                console.log('Post id appid usertoken-- in delete ---------------', postId, Thread.SocialItems.socialAppId, Thread.SocialItems.userDetails.userToken);
                // Deleting post having id as postId
                SocialDataStore.deletePost(postId, Thread.SocialItems.socialAppId, Thread.SocialItems.userDetails.userToken).then(success, error);
            };

            Buildfire.messaging.onReceivedMessage = function (event) {
                console.log('Widget syn called method in controller Thread called-----', event);
                if (event) {
                    switch (event.name) {
                        case EVENTS.POST_DELETED :
                            Thread.deletePost(event._id);
                            Thread.SocialItems.items = Thread.SocialItems.items.filter(function (el) {
                                return el._id != event._id;
                            });
                            if (event._id == Thread.modalPopupThreadId) {
                                Buildfire.history.pop();
                                Modals.close('Post already deleted');
                            }
                            if (!$scope.$$phase)
                                $scope.$digest();
                            //$rootScope.$digest();
                            break;
                        case EVENTS.BAN_USER :
                            Thread.SocialItems.items = Thread.SocialItems.items.filter(function (el) {
                                return el.userId != event._id;
                            });
                            Modals.close('User already banned');
                            if (!$scope.$$phase)
                                $scope.$digest();
                            break;
                        case EVENTS.COMMENT_DELETED:
                            console.log('Comment Deleted in thread controlled event called-----------', event);
                            if (event.postId == Thread.post._id) {
                                Thread.post.commentsCount--;
                                Thread.SocialItems.comments = Thread.SocialItems.comments.filter(function (el) {
                                    return el._id != event._id;
                                });
                                if (!$scope.$$phase)
                                    $scope.$digest();
                            }
                            if (Thread.modalPopupThreadId == event._id)
                                Modals.close('Comment already deleted');
                            break;
//                        case EVENTS.APP_RESET:
                        /*$rootScope.showThread = true;
                         Location.goToHome();*/
                        default :
                            break;
                    }
                }
            };
            // On Login
            Buildfire.datastore.onUpdate(function (response) {
                console.log('----------- on Update Side Thread ----', response);
                Thread.init();
            });

            Buildfire.auth.onLogin(function (user) {
                console.log('New user loggedIN from Widget Thread Page', user);
                if (user && user._id) {
                    Thread.userDetails.userToken = user.userToken;
                    Thread.userDetails.userId = user._id;
                    getUserData(user._id);
                    $scope.$digest();
                }
            });
            // On Logout
            Buildfire.auth.onLogout(function () {
                console.log('User loggedOut from Widget Thread page');
                Thread.userDetails.userToken = null;
                Thread.userDetails.userId = null;
                $scope.$digest();
            });


            /**
             * Implementation of pull down to refresh
             */
            var onRefresh = Buildfire.datastore.onRefresh(function () {
                Location.go('#/thread/' + $routeParams.threadId);
            });

            /**
             * Unbind the onRefresh
             */
            $scope.$on('$destroy', function () {
                onRefresh.clear();
                Buildfire.datastore.onRefresh(function () {
                    Location.goToHome();
                });
            });

        }])
})(window.angular);