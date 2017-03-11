'use strict';

(function (angular) {
    angular.module('socialPluginWidget')
        .controller('WidgetWallCtrl', ['$scope', 'SocialDataStore', 'Modals', 'Buildfire', '$rootScope', 'Location', 'EVENTS', 'GROUP_STATUS', 'MORE_MENU_POPUP', 'FILE_UPLOAD', '$modal', 'SocialItems', '$q', '$anchorScroll', '$location', '$timeout','Util', function ($scope, SocialDataStore, Modals, Buildfire, $rootScope, Location, EVENTS, GROUP_STATUS, MORE_MENU_POPUP, FILE_UPLOAD, $modal, SocialItems, $q, $anchorScroll, $location, $timeout,util) {
            var WidgetWall = this;
            WidgetWall.usersData = [];
            var userIds = [];
            var postsUniqueIds = [];
            var getLikesData = [];
            //            var _receivePushNotification;
            WidgetWall.buildfire = Buildfire;
            WidgetWall.getFollowingStatus = function () {
                return (typeof WidgetWall.SocialItems._receivePushNotification !== 'undefined') ? (WidgetWall.SocialItems._receivePushNotification ? GROUP_STATUS.FOLLOWING : GROUP_STATUS.FOLLOW) : GROUP_STATUS.FOLLOW;
            };
            WidgetWall.userDetails = {};
            WidgetWall.height = window.innerHeight;
            WidgetWall.noMore = false;
            WidgetWall.postText = '';
            WidgetWall.picFile = '';
            WidgetWall.imageSelected = false;
            WidgetWall.imageName = '';
            WidgetWall.showImageLoader = true;
            WidgetWall.modalPopupThreadId;
            $rootScope.showThread = true;
            WidgetWall.createThreadPermission = false;
            WidgetWall.util = util;
            WidgetWall.SocialItems = SocialItems.getInstance();
            var masterItems = WidgetWall.SocialItems && WidgetWall.SocialItems.items && WidgetWall.SocialItems.items.slice(0, WidgetWall.SocialItems.items.length);
            console.log('SocialItems------------------Wall Controller-------------------- this---------------333333333333----', WidgetWall.SocialItems);
            WidgetWall.showHideCommentBox = function () {
                if (WidgetWall.SocialItems &&
                    WidgetWall.SocialItems.appSettings &&
                    WidgetWall.SocialItems.appSettings.allowMainThreadTags &&
                    WidgetWall.SocialItems.appSettings.mainThreadUserTags &&
                    WidgetWall.SocialItems.appSettings.mainThreadUserTags.length > 0
                ) {
                    var _userTagsObj = WidgetWall.SocialItems.userDetails.userTags;
                    var _userTags = [];
                    if (_userTagsObj) {
                        _userTags = _userTagsObj[Object.keys(_userTagsObj)[0]];
                    }

                    if (_userTags) {
                        var _hasPermission = false;
                        for (var i = 0; i < WidgetWall.SocialItems.appSettings.mainThreadUserTags.length; i++) {
                            var _mainThreadTag = WidgetWall.SocialItems.appSettings.mainThreadUserTags[i].text;
                            for (var x = 0; x < _userTags.length; x++) {
                                if (_mainThreadTag.toLowerCase() == _userTags[x].tagName.toLowerCase()) {
                                    _hasPermission = true;
                                    break;
                                }
                            }
                        }
                        WidgetWall.createThreadPermission = _hasPermission;
                    } else {
                        WidgetWall.createThreadPermission = false;
                    }
                } else {
                    WidgetWall.createThreadPermission = true;
                }
            };

            var getUserData = function (userId) {
                if (userIds.indexOf(userId.toString()) == -1) {
                    userIds.push(userId.toString());
                }
                var successCallback = function (response) {

                    if (response.data.error) {
                        console.error('Error while fetching users ', response.data.error);
                    } else if (response.data.result) {
                        console.info('Users fetched successfully', response.data.result);
                        WidgetWall.usersData = response.data.result;
                    }
                };
                var errorCallback = function (err) {
                    console.log('Error while fetching users details ', err);

                    if (!$scope.$$phase) $scope.$digest();
                };
                SocialDataStore.getUsers(userIds, WidgetWall.SocialItems.userDetails.userToken).then(successCallback, errorCallback);
            }

            WidgetWall.init = function () {
                WidgetWall.SocialItems.init();
                WidgetWall.SocialItems.posts();
                WidgetWall.SocialItems.loggedInUserDetails(function (err, data) {
                    if (err) {

                    } else {
                        //check if user logged in
                        if (WidgetWall.SocialItems.userDetails.userId != null) {
                            getUserData(WidgetWall.SocialItems.userDetails.userId);
                            //check user if has permission to create thread
                            WidgetWall.showHideCommentBox();
                        }
                    }
                });
            };

            WidgetWall.init();

            WidgetWall.createPost = function ($event) {
                var checkuserAuthPromise = checkUserIsAuthenticated();
                checkuserAuthPromise.then(function (response) {
                    $rootScope.postBusy = true;
                    if (!$rootScope.$$phase) $rootScope.$digest();
                    WidgetWall.closePostSection();

                    if (WidgetWall.picFile && !WidgetWall.waitAPICompletion) {                // image post
                        if (getImageSizeInMB(WidgetWall.picFile.size) <= FILE_UPLOAD.MAX_SIZE) {
                            WidgetWall.waitAPICompletion = true;
                            var success = function (response) {
                                WidgetWall.imageName = WidgetWall.imageName + ' - 100%';
                                finalPostCreation(response.data.result);
                            };
                            var error = function (err) {
                                console.log('Error is : ', err);
                            };
                            console.error('>>>>>>>>>>>>>>>>>>>>>', WidgetWall.picFile);
                            SocialDataStore.uploadImage(WidgetWall.picFile, WidgetWall.SocialItems.userDetails.userToken, WidgetWall.SocialItems.socialAppId).then(success, error);
                        }
                    } else if (WidgetWall.postText && !WidgetWall.waitAPICompletion) {                        // text post
                        WidgetWall.waitAPICompletion = true;
                        finalPostCreation();
                    }

                }, function (err) {
                    console.log('error is ------', err);
                });

            };
            WidgetWall.openPostSection = function () {
                WidgetWall.goFullScreen = true;
                Buildfire.history.push('Post Section',{fullScreenMode : true});
            };
            WidgetWall.closePostSection = function () {
                WidgetWall.goFullScreen = false;
                Buildfire.history.pop();
            };
            Buildfire.history.onPop(function (breadcrumb) {
                WidgetWall.goFullScreen = false;
                if (!$scope.$$phase) $scope.$digest();
            },true);

            var getImageSizeInMB = function (size) {
                return (size / (1024 * 1024));       // return size in MB
            };


            var checkUserIsAuthenticated = function () {
                var deferredObject = $q.defer();
                Buildfire.auth.getCurrentUser(function (err, userData) {
                    console.info('Current Logged In user details are -----------------', userData);
                    if (userData) {
                        WidgetWall.SocialItems.userDetails.userToken = userData.userToken;
                        WidgetWall.SocialItems.userDetails.userId = userData._id;
                        deferredObject.resolve(userData);
                        SocialDataStore.getUserSettings({
                            threadId: WidgetWall.SocialItems.parentThreadId,
                            userId: WidgetWall.SocialItems.userDetails.userId,
                            userToken: WidgetWall.SocialItems.userDetails.userToken,
                            appId: WidgetWall.SocialItems.socialAppId
                        }).then(function (response) {
                            console.log('inside getUser settings :::::::::::::', response);
                            if (response && response.data && response.data.result) {
                                console.log('getUserSettings response is: ', response);
                                WidgetWall.SocialItems._receivePushNotification = response.data.result.receivePushNotification;
                                WidgetWall.SocialItems.userDetails.settingsId = response.data.result._id;
                            } else if (response && response.data && response.data.error) {
                                console.log('response error is: ', response.data.error);
                            }

                        }, function (err) {
                            console.log('Error while logging in user is: ', err);
                        });
                    }
                    else if (err) {
                        return deferredObject.reject(err);
                    } else {
                        if (err) {
                            return deferredObject.reject(err);
                        } else {
                            Buildfire.auth.login(null, function (err, user) {
                                console.log('Login called---------------------------------', user, err);
                                if (err) {
                                    return deferredObject.reject(err);
                                }
                            });
                        }
                    }
                });
                return deferredObject.promise;
            };

            function finalPostCreation(imageUrl) {
                var postData = {};
                postData.text = WidgetWall.postText ? WidgetWall.postText.replace(/[#&%+!@^*()-]/g, function (match) {
                    return encodeURIComponent(match)
                }) : '';
                postData.title = '';
                postData.imageUrl = imageUrl || null;
                postData.userToken = WidgetWall.SocialItems.userDetails.userToken;
                postData.appId = WidgetWall.SocialItems.socialAppId;
                postData.parentThreadId = WidgetWall.SocialItems.parentThreadId;
                postData.userId = WidgetWall.SocialItems.userDetails.userId;
                WidgetWall.SocialItems.items.unshift(postData);
                var success = function (response) {
                    WidgetWall.postText = '';
                    WidgetWall.picFile = '';
                    if (response.data.error) {
                        console.error('Error while creating post ', response.data.error);
                        WidgetWall.waitAPICompletion = false;
                        var _postIndex = WidgetWall.SocialItems.items.indexOf(postData);
                        WidgetWall.SocialItems.items.splice(_postIndex,1);
                    } else if (response.data.result) {
                        Buildfire.messaging.sendMessageToControl({
                            name: EVENTS.POST_CREATED,
                            status: 'Success',
                            post: response.data.result
                        });
                        WidgetWall.imageName = '';
                        WidgetWall.imageSelected = false;
                        postData.uniqueLink = response.data.result.uniqueLink;
                        getUsersAndLikes(function (err,result) {
                            angular.extend(postData, response.data.result);
                        });

                        if (!$scope.$$phase) $scope.$digest();
                        $rootScope.postBusy = false;
                        if (userIds.indexOf(response.data.result.userId.toString()) == -1) {
                            userIds.push(response.data.result.userId.toString());
                        }

                        /**
                         *  Follow Thread when post gets created
                         */
                        SocialDataStore.saveUserSettings({
                            threadId: response.data.result._id,
                            userId: WidgetWall.SocialItems.userDetails.userId,
                            userToken: WidgetWall.SocialItems.userDetails.userToken,
                            settingsId: WidgetWall.SocialItems.userDetails.settingsId,
                            appId: WidgetWall.SocialItems.socialAppId,
                            receivePushNotification: true
                        }).then(function (data) {
                            console.log('Success : User now follows its newly created post', data);
                        }, function (err) {
                            console.error('Error while getting user Details--------------', err);
                        });


                        var successCallback = function (response) {
                            if (response.data.error) {
                                console.error('Error while fetching users ', response.data.error);
                            } else if (response.data.result) {
                                console.info('Users fetched successfully', response.data.result);
                                WidgetWall.usersData = response.data.result;
                                WidgetWall.waitAPICompletion = false;
                                // the element you wish to scroll to.
                                $location.hash('top');

                                // call $anchorScroll()
                                $anchorScroll();
                                Buildfire.navigation.scrollTop();
                            }
                        };
                        var errorCallback = function (err) {
                            console.log('Error while fetching users details ', err);
                            WidgetWall.postText = '';
                            WidgetWall.picFile = '';
                            WidgetWall.waitAPICompletion = false;
                            if (!$scope.$$phase) $scope.$digest();
                        };
                        SocialDataStore.getUsers(userIds, WidgetWall.SocialItems.userDetails.userToken).then(successCallback, errorCallback);
                        if (WidgetWall.getFollowingStatus() != GROUP_STATUS.FOLLOWING)
                            WidgetWall.followUnfollow(GROUP_STATUS.FOLLOW);
                    }
                };
                var error = function (err) {
                    var _postIndex = WidgetWall.SocialItems.items.indexOf(postData);
                    WidgetWall.SocialItems.items.splice(_postIndex,1);
                    $rootScope.postBusy = false;
                    console.log('Error while creating post ', err);
                    WidgetWall.postText = '';
                    WidgetWall.picFile = '';
                    WidgetWall.waitAPICompletion = false;
                    if (err.status == 0) {
                        console.log('------------->INTERNET CONNECTION PROBLEM')
                        $modal
                            .open({
                                template: [
                                    '<div class="padded clearfix">',
                                    '<div class="content text-center">',
                                    '<p>No internet connection was found. please try again later</p>',
                                    '<a class="margin-zero"  ng-click="ok(option)">OK</a>',
                                    '</div>',
                                    '</div></div>'
                                ].join(''),
                                controller: 'MoreOptionsModalPopupCtrl',
                                controllerAs: 'MoreOptionsPopup',
                                size: 'sm',
                                resolve: {
                                    Info: function () {
                                        return {};
                                    }
                                }
                            });

                    }
                    if (!$scope.$$phase) $scope.$digest();

                };
                SocialDataStore.createPost(postData).then(success, error);
            }

            WidgetWall.getUserName = function (userId) {
                var userName = '';
                WidgetWall.usersData.some(function (userData) {
                    if (userData.userObject._id == userId) {
                        userName = userData.userObject.displayName || 'No Name';
                        return true;
                    }
                });
                return userName;
            };
            WidgetWall.getUserImage = function (userId) {
                var userImageUrl = '';
                WidgetWall.usersData.some(function (userData) {
                    if (userData.userObject._id == userId) {
                        userImageUrl = userData.userObject.imageUrl || '';
                        return true;
                    }
                });
                return userImageUrl;
            };
            WidgetWall.showMoreOptions = function (post) {
                WidgetWall.modalPopupThreadId = post._id;
                var checkuserAuthPromise = checkUserIsAuthenticated();
                checkuserAuthPromise.then(function (response) {
                    console.log("Post id ------------->", post._id);
                    Modals.showMoreOptionsModal({
                        'postId': post._id,
                        'userId': post.userId,
                        'socialItemUserId': WidgetWall.SocialItems.userDetails.userId
                    })
                        .then(function (data) {
                                console.log('Data in Success------------------data :????????????????????????????????????', data);

                                switch (data) {

                                    case MORE_MENU_POPUP.REPORT:

                                        var reportPostPromise = SocialDataStore.reportPost(post._id, WidgetWall.SocialItems.appId, WidgetWall.SocialItems.userDetails.userToken);
                                        reportPostPromise.then(function (response) {
                                            for (var index in WidgetWall.SocialItems.items)
                                                if (WidgetWall.SocialItems.items[index]._id == post._id) {
                                                    WidgetWall.SocialItems.items.splice(index, 1);
                                                    break;
                                                }
                                            $modal
                                                .open({
                                                    templateUrl: 'templates/modals/report-generated-modal.html',
                                                    controller: 'MoreOptionsModalPopupCtrl',
                                                    controllerAs: 'MoreOptionsPopup',
                                                    size: 'sm',
                                                    resolve: {
                                                        Info: function () {
                                                            return post._id;
                                                        }
                                                    }
                                                });

                                        }, function () {

                                        });

                                        break;
                                    case MORE_MENU_POPUP.BLOCK:

                                        $modal
                                            .open({
                                                templateUrl: 'templates/modals/delete-post-modal.html',
                                                controller: 'MoreOptionsModalPopupCtrl',
                                                controllerAs: 'MoreOptionsPopup',
                                                size: 'sm',
                                                resolve: {
                                                    Info: function () {
                                                        return post._id;
                                                    }
                                                }
                                            });
                                        break;
                                    default :
                                }

                            },
                            function (err) {
                                console.log('Error in Error handler--------------------------', err);
                            });
                }, function (err) {
                    console.log('Error is ::::::', err);
                });


            };
            WidgetWall.likeThread = function (post, type) {
                console.log('inside Like a thread---------------------------');
                var checkuserAuthPromise = checkUserIsAuthenticated();
                checkuserAuthPromise.then(function () {
                    console.log('Promise Resolved-------------------------------------and userDetails are---');
                    var uniqueIdsArray = [];
                    uniqueIdsArray.push(post.uniqueLink);
                    if(WidgetWall.isUserLikeActive(post._id)){
                        //add like
                        WidgetWall.updateLikesData(post._id, false);
                        post.likesCount++;
                    }else{
                        //remove like
                        WidgetWall.updateLikesData(post._id, true);
                        post.likesCount--;
                    }
                    var success = function (response) {
                        console.log('Get thread likes success-------------------', response);
                        if (response.data && response.data.result && response.data.result.length > 0) {
                            console.log('First if in like post-----------------------', response.data.result);
                            if (response.data.result[0].isUserLikeActive) {
                                SocialDataStore.addThreadLike(post, type, WidgetWall.SocialItems.socialAppId, WidgetWall.SocialItems.userDetails.userToken).then(function (res) {
                                    console.log('thread gets liked------------', res);
                                    Buildfire.messaging.sendMessageToControl({
                                        'name': EVENTS.POST_LIKED,
                                        '_id': post._id
                                    });
                                    //post.likesCount++;
                                    post.waitAPICompletion = false;
                                    //WidgetWall.updateLikesData(post._id, false);
                                    if (WidgetWall.getFollowingStatus() != GROUP_STATUS.FOLLOWING)
                                        WidgetWall.followUnfollow(GROUP_STATUS.FOLLOW);
                                    if (!$scope.$$phase) $scope.$digest();
                                }, function (err) {
                                    //undo add like
                                    WidgetWall.updateLikesData(post._id, true);
                                    post.likesCount--;
                                    console.error('error while liking thread', err);
                                });
                            } else {
                                if (response.data.result[0].likesCount)
                                    SocialDataStore.removeThreadLike(post, type, WidgetWall.SocialItems.socialAppId, WidgetWall.SocialItems.userDetails.userToken).then(function (res) {
                                        if (res.data && res.data.result)
                                            Buildfire.messaging.sendMessageToControl({
                                                'name': EVENTS.POST_UNLIKED,
                                                '_id': post._id
                                            });
                                        //post.likesCount--;
                                        post.waitAPICompletion = false;
                                        if (WidgetWall.getFollowingStatus() != GROUP_STATUS.FOLLOWING)
                                            WidgetWall.followUnfollow(GROUP_STATUS.FOLLOW);
                                        //WidgetWall.updateLikesData(post._id, true);
                                        if (!$scope.$$phase) $scope.$digest();
                                    }, function (err) {
                                        //undo remove like
                                        WidgetWall.updateLikesData(post._id, false);
                                        post.likesCount++;
                                        console.error('error while removing like of thread', err);
                                    });
                            }
                        }
                    };
                    var error = function (err) {
                        post.waitAPICompletion = false;
                        console.error('error is : ', err);
                        if(WidgetWall.isUserLikeActive(post._id)){
                            //undo add like
                            WidgetWall.updateLikesData(post._id, true);
                            post.likesCount--;
                        }else{
                            //undo remove like
                            WidgetWall.updateLikesData(post._id, false);
                            post.likesCount++;
                        }
                    };
                    if (!post.waitAPICompletion) {
                        post.waitAPICompletion = true;
                        SocialDataStore.getThreadLikes(uniqueIdsArray, WidgetWall.SocialItems.socialAppId, WidgetWall.SocialItems.userDetails.userId).then(success, error);
                    }
                }, function (err) {
                    console.log('Error is ::::::::::', err);
                });


            };
            WidgetWall.seeMore = function (post) {
                post.seeMore = true;
                post.limit = 10000000;
                if (!$scope.$$phase) $scope.$digest();
            };
            WidgetWall.getDuration = function (timestamp) {
                if(timestamp)
                    return moment(timestamp.toString()).fromNow();
            };

            WidgetWall.goInToThread = function (threadId) {

                if (threadId)
                    Location.go('#/thread/' + threadId);
            };
            WidgetWall.isUserLikeActive = function (postId) {

                var isUserLikeActive = true;
                getLikesData.some(function (likeData) {
                    if (likeData._id == postId) {
                        isUserLikeActive = likeData.isUserLikeActive;
                        return true;
                    }
                });
                return isUserLikeActive;
            };
            WidgetWall.updateLikesData = function (postId, status) {
                getLikesData.some(function (likeData) {
                    if (likeData._id == postId) {
                        likeData.isUserLikeActive = status;
                        return true;
                    }
                })
            };
            WidgetWall.deletePost = function (postId) {
                var success = function (response) {
                    console.log('inside success of delete post', response);
                    if (response.data.result) {
                        Buildfire.messaging.sendMessageToControl({'name': EVENTS.POST_DELETED, '_id': postId});
                        console.log('post successfully deleted');
                        WidgetWall.SocialItems.items = WidgetWall.SocialItems.items.filter(function (el) {
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
                console.log('Post id appid usertoken-- in delete ---------------', postId, WidgetWall.SocialItems.socialAppId, WidgetWall.SocialItems.userDetails.userToken);
                // Deleting post having id as postId
                SocialDataStore.deletePost(postId, WidgetWall.SocialItems.socialAppId, WidgetWall.SocialItems.userDetails.userToken).then(success, error);
            };

            WidgetWall.followUnfollow = function (isFollow) {
                if (WidgetWall.SocialItems.userDetails.userToken && WidgetWall.SocialItems.userDetails.userId) {
                    updateFollowUnfollow(isFollow);
                } else {
                    Buildfire.auth.login(null, function (err, user) {
                        console.log('Login called---------------------------------', user, err);
                        if (err) {
                            console.log('Error while logging in---------', err);
                        } else {
                            updateFollowUnfollow(isFollow);
                        }
                    });
                }
            };

            var updateFollowUnfollow = function (isFollow) {
                var followNotification = false;
                if (isFollow == GROUP_STATUS.FOLLOWING) {
                    followNotification = false;
                } else if (isFollow == GROUP_STATUS.FOLLOW) {
                    followNotification = true;
                }
                SocialDataStore.saveUserSettings({
                    threadId: WidgetWall.SocialItems.parentThreadId,
                    userId: WidgetWall.SocialItems.userDetails.userId,
                    userToken: WidgetWall.SocialItems.userDetails.userToken,
                    settingsId: WidgetWall.SocialItems.userDetails.settingsId,
                    appId: WidgetWall.SocialItems.socialAppId,
                    receivePushNotification: followNotification
                }).then(function (data) {
                    console.log('Get User Settings------------------', data);
                    if (data && data.data && data.data.result) {
                        WidgetWall.SocialItems._receivePushNotification = data.data.result.receivePushNotification;
                    }
                }, function (err) {
                    console.log('Error while getting user Details--------------', err);
                });
            };

            Buildfire.messaging.onReceivedMessage = function (event) {
                console.log('Event in wall cotroller------------------------', event);
                if (event) {
                    switch (event.name) {
                        case EVENTS.POST_DELETED :
                            WidgetWall.deletePost(event._id);
                            if (WidgetWall.modalPopupThreadId == event._id)
                                Modals.close('Post already deleted');
                            if (!$scope.$$phase)
                                $scope.$digest();
                            break;
                        case EVENTS.BAN_USER :
                            WidgetWall.SocialItems.items = WidgetWall.SocialItems.items.filter(function (el) {
                                return el.userId != event._id;
                            });
                            Modals.close('User already banned');
                            if (!$scope.$$phase)
                                $scope.$digest();
                            break;
                        case EVENTS.COMMENT_DELETED:
                            console.log('Comment Deleted in Wall controlled evenet called-----------', event);
                            WidgetWall.SocialItems.items.some(function (el) {
                                if (el._id == event.postId) {
                                    el.commentsCount--;
                                    return true;
                                }
                            });
                            if (WidgetWall.modalPopupThreadId == event.postId)
                                Modals.close('Comment already deleted');
                            if (!$scope.$$phase)
                                $scope.$digest();
                            break;
                        default :
                            break;
                    }
                }
            };
            function getUsersAndLikes(callback) {
                var count = 0;
                var postIdsChunkArray = [], newUserIds = [], newPostsUniqueIds = [], chunk = 10;
//                getLikesData = [];
                WidgetWall.SocialItems.items.forEach(function (postData) {
                    count++;
                    if (userIds.indexOf(postData.userId.toString()) == -1) {
                        userIds.push(postData.userId.toString());
                        newUserIds.push(postData.userId.toString());
                    }
                    if(postData.uniqueLink){
                        if (postsUniqueIds.indexOf(postData.uniqueLink.toString()) == -1) {
                            postsUniqueIds.push(postData.uniqueLink);
                            newPostsUniqueIds.push(postData.uniqueLink);
                        }
                    }
                });
                var successCallback = function (response) {
                    if (response.data.error) {
                        console.error('Error while fetching users ', response.data.error);
                    } else if (response.data.result) {
                        console.log('Users data--------------------', response);
                        WidgetWall.usersData = WidgetWall.usersData.concat(response.data.result);
                    }
                };
                var errorCallback = function (err) {
                    console.error('Error while fetching users details ', err);
                };
                if (newUserIds && newUserIds.length)
                    SocialDataStore.getUsers(newUserIds).then(successCallback, errorCallback);
                console.log('newPostsUniqueIds is:::::::::', newPostsUniqueIds);
                SocialDataStore.getThreadLikes(newPostsUniqueIds, WidgetWall.SocialItems.socialAppId, WidgetWall.SocialItems.userDetails.userId).then(function (response) {
                    if (response.data.error) {
                        console.error('Error while getting likes of thread by logged in user ', response.data.error);
                    } else if (response.data.result) {
                        getLikesData = getLikesData.concat(response.data.result);
                        console.log('getLikesData is::::::::::::::::::::::::::::', getLikesData);
                    }
                    if(callback)
                        callback(null);

                }, function (err) {
                    if(callback)
                        callback(err);
                    console.error('Error while fetching thread likes ', err);
                });
                /*SocialDataStore.getThreadLikes(postsUniqueIds, WidgetWall.SocialItems.socialAppId, WidgetWall.SocialItems.userDetails.userId).then(function (response) {
                 postsUniqueIds = [];
                 if (response.data.error) {
                 console.error('Error while getting likes of thread by logged in user ', response.data.error);
                 } else if (response.data.result) {
                 getLikesData = response.data.result;
                 }
                 }, function (err) {
                 console.error('Error while fetching thread likes ', err);
                 });*/
            }

            WidgetWall.uploadImage = function (file) {
                console.log('inside select image method', file);
                var fileSize;
                if (file) {
                    fileSize = getImageSizeInMB(file.size);      // get image size in MB
                    WidgetWall.imageSelected = true;
                    if (fileSize > FILE_UPLOAD.MAX_SIZE) {
                        WidgetWall.imageName = file.name + ' - ' + FILE_UPLOAD.SIZE_EXCEED;
                        WidgetWall.showImageLoader = false;
                    } else {
                        WidgetWall.imageName = file.name;
                        WidgetWall.showImageLoader = true;
                    }
                }
            };

            WidgetWall.cancelImageSelect = function () {
                WidgetWall.imageName = WidgetWall.imageName.replace(' - ' + FILE_UPLOAD.SIZE_EXCEED, '') + ' - ' + FILE_UPLOAD.CANCELLED;
                $timeout(function () {
                    WidgetWall.imageSelected = false;
                    WidgetWall.imageName = '';
                    WidgetWall.picFile = '';
                    WidgetWall.showImageLoader = true;
                    if (!$scope.$$phase)
                        $scope.$digest();
                }, 500);
            };

            $scope.$watch(function () {
                return WidgetWall.SocialItems.items;
            }, function () {
                if (masterItems && WidgetWall.SocialItems.items && masterItems.length != WidgetWall.SocialItems.items.length) {
                    console.log('Before New Items loaded----------------------------', WidgetWall.SocialItems.items);
                    console.log('before master items-------------------------------in widget--', masterItems, 'social Items-----------------', WidgetWall.SocialItems.items);
                    masterItems = WidgetWall.SocialItems && WidgetWall.SocialItems.items && WidgetWall.SocialItems.items.slice(0, WidgetWall.SocialItems.items.length);
                    getUsersAndLikes();
                    console.log('After New Items loaded----------------------------', WidgetWall.SocialItems.items);
                    console.log('After master items-------------------------------in widget--', masterItems, 'social Items-----------------', WidgetWall.SocialItems.items);

                }
            }, true);
            $rootScope.$on(EVENTS.COMMENT_ADDED, function () {
                console.log('inside comment added event listener:::::::::::');
                if (WidgetWall.getFollowingStatus() != GROUP_STATUS.FOLLOWING)
                    WidgetWall.followUnfollow(GROUP_STATUS.FOLLOW);
            });
            $rootScope.$on(EVENTS.COMMENT_LIKED, function () {
                console.log('inside comment liked event listener:::::::::::');
                if (WidgetWall.getFollowingStatus() != GROUP_STATUS.FOLLOWING)
                    WidgetWall.followUnfollow(GROUP_STATUS.FOLLOW);
            });
            $rootScope.$on(EVENTS.COMMENT_UNLIKED, function () {
                console.log('inside comment unliked event listener:::::::::::');
                if (WidgetWall.getFollowingStatus() != GROUP_STATUS.FOLLOWING)
                    WidgetWall.followUnfollow(GROUP_STATUS.FOLLOW);
            });
            $rootScope.$on(EVENTS.POST_LIKED, function (e, post) {
                console.log('inside post liked event listener:::::::::::');
                if (WidgetWall.getFollowingStatus() != GROUP_STATUS.FOLLOWING)
                    WidgetWall.followUnfollow(GROUP_STATUS.FOLLOW);
                WidgetWall.updateLikesData(post._id, false);
            });
            $rootScope.$on(EVENTS.POST_UNLIKED, function (e, post) {
                console.log('inside post unliked event listener:::::::::::', e, '--------------------------post------', post);
                if (WidgetWall.getFollowingStatus() != GROUP_STATUS.FOLLOWING)
                    WidgetWall.followUnfollow(GROUP_STATUS.FOLLOW);
                WidgetWall.updateLikesData(post._id, true);
            });
            Buildfire.datastore.onUpdate(function (response) {
                console.log('----------- on Update Main Thread ----', response);
                WidgetWall.SocialItems.parentThreadId = response && response.data.parentThreadId;
                WidgetWall.SocialItems.socialAppId = response && response.data.socialAppId;
                WidgetWall.init();
            });
            // On Login
            Buildfire.auth.onLogin(function (user) {
                console.log('New user loggedIN from Widget Wall Page', user);
                if (user && user._id) {
                    WidgetWall.SocialItems.userDetails.userToken = user.userToken;
                    WidgetWall.SocialItems.userDetails.userId = user._id;
                    getUserData(user._id);
                    //check user if has permission to create thread
                    WidgetWall.showHideCommentBox();
                    $scope.$digest();
                }
            });
            // On Logout
            Buildfire.auth.onLogout(function () {
                console.log('User loggedOut from Widget Wall Page');
                WidgetWall.SocialItems.userDetails.userToken = null;
                WidgetWall.SocialItems.userDetails.userId = null;
                $scope.$digest();
            });

            /**
             * Implementation of pull down to refresh
             */
            var onRefresh = Buildfire.datastore.onRefresh(function () {
                Location.goToHome();
            });

        }])
})(window.angular);