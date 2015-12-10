'use strict';

(function (angular) {
        angular.module('socialPluginWidget')
            .controller('WidgetWallCtrl', ['$scope','SocialDataStore','Modals', 'Buildfire','$rootScope','Location', function($scope, SocialDataStore, Modals, Buildfire,$rootScope,Location) {
                var WidgetWall = this;
                var usersData = [];
                var userIds = [];
                var postsUniqueIds = [];
                var getLikesData = [];
                WidgetWall.userDetails={};
                WidgetWall.height=window.innerHeight;
                WidgetWall.noMore=false;
                WidgetWall.postText = '';
                WidgetWall.picFile = '';
                WidgetWall.posts = [];
                $rootScope.showThread=true;
                WidgetWall.createPost = function () {
                    if(WidgetWall.picFile && !WidgetWall.waitAPICompletion) {                // image post
                        WidgetWall.waitAPICompletion = true;
                        var success = function (response) {
                            finalPostCreation(response.data.result);
                        };
                        var error = function (err) {
                            console.log('Error is : ', err);
                        };
                        SocialDataStore.uploadImage(WidgetWall.picFile).then(success, error);
                    } else if(WidgetWall.postText && !WidgetWall.waitAPICompletion) {                        // text post
                            WidgetWall.waitAPICompletion = true;
                            finalPostCreation();
                    }
                };
                var init = function () {
                    Buildfire.auth.getCurrentUser(function(err,userData){
                        console.info('Current Logged In user details are -----------------',userData);
                        var context=Buildfire.context;
                        if(userData){
                            WidgetWall.userDetails.appId=context.appId;
                            WidgetWall.userDetails.parentThreadId=context.appId+context.instanceId;
                            WidgetWall.userDetails.userToken=userData.userToken;
                        }
                        else{
                            Buildfire.auth.login();
                        }
                    });
                };
                init();
                function finalPostCreation (imageUrl) {
                    var postData = {};
                    postData.text = WidgetWall.postText;
                    postData.title = '';
                    postData.imageUrl = imageUrl || null;
                    var success = function (response) {
                        WidgetWall.postText = '';
                        WidgetWall.picFile = '';
                        if(response.data.error) {
                            console.error('Error while creating post ', response.data.error);
                        } else if(response.data.result) {
                            Buildfire.messaging.sendMessageToControl({name:'POST_CREATED',status:'Success',post:response.data.result});
                            WidgetWall.posts.unshift(response.data.result);
                            if(userIds.indexOf(response.data.result.userId.toString()) == -1) {
                                userIds.push(response.data.result.userId.toString());
                            }
                            var successCallback = function (response) {
                                if(response.data.error) {
                                    console.error('Error while fetching users ', response.data.error);
                                } else if(response.data.result) {
                                    console.info('Users fetched successfully', response.data.result);
                                    usersData = response.data.result;
                                    WidgetWall.waitAPICompletion = false;
                                }
                            };
                            var errorCallback = function (err) {
                                console.log('Error while fetching users details ', err);
                                WidgetWall.postText = '';
                                WidgetWall.picFile = '';
                                WidgetWall.waitAPICompletion = false;
                                if (!$scope.$$phase)$scope.$digest();
                            };
                            SocialDataStore.getUsers(userIds).then(successCallback, errorCallback);
                        }
                    };
                    var error = function (err) {
                        console.log('Error while creating post ', err);
                        WidgetWall.postText = '';
                        WidgetWall.picFile = '';
                        WidgetWall.waitAPICompletion = false;
                        if (!$scope.$$phase)$scope.$digest();
                    };
                    SocialDataStore.createPost(postData).then(success, error);
                }
                WidgetWall.getPosts = function () {
                    WidgetWall.noMore=true;
                    var lastThreadId;
                    var success = function (response) {
                            //WidgetWall.posts = response.data.result;
                            if (response && response.data && response.data.result && response.data.result.length < 10) {
                                WidgetWall.noMore = true;
                            } else {
                                WidgetWall.noMore = false;
                            }
                            response.data.result.forEach(function (postData) {
                                if (userIds.indexOf(postData.userId.toString()) == -1)
                                    userIds.push(postData.userId.toString());
                                WidgetWall.posts.push(postData);
                                postsUniqueIds.push(postData.uniqueLink);
                            });
                            var successCallback = function (response) {
                                if(response.data.error) {
                                    console.error('Error while fetching users ', response.data.error);
                                } else if(response.data.result) {
                                    usersData = response.data.result;
                                }
                            };
                            var errorCallback = function (err) {
                                WidgetWall.noMore=false;
                                console.error('Error while fetching users details ', err);
                            };
                            SocialDataStore.getUsers(userIds).then(successCallback, errorCallback);
                            SocialDataStore.getThreadLikes(postsUniqueIds).then(function (response) {
                                if(response.data.error) {
                                    console.error('Error while getting likes of thread by logged in user ', response.data.error);
                                } else if(response.data.result) {
                                    getLikesData = response.data.result;
                                }
                            }, function (err) {
                                console.error('Error while fetching thread likes ', err);
                            });
                        }
                        , error = function (err) {
                            console.error('Error while getting data', err);
                        };
                    if (WidgetWall.posts.length)
                        lastThreadId = WidgetWall.posts[WidgetWall.posts.length - 1]._id;
                    else
                        lastThreadId = null;
                    SocialDataStore.getPosts({lastThreadId: lastThreadId}).then(success, error);
                };
                WidgetWall.getUserName = function (userId) {
                    var userName = '';
                    usersData.some(function(userData) {
                        if(userData.userObject._id == userId) {
                            userName = userData.userObject.displayName || '';
                            return true;
                        }
                    });
                    return userName;
                };
                WidgetWall.getUserImage = function (userId) {
                    var userImageUrl = '';
                    usersData.some(function(userData) {
                        if(userData.userObject._id == userId) {
                            userImageUrl = userData.userObject.imageUrl || '';
                            return true;
                        }
                    });
                    return userImageUrl;
                };
                WidgetWall.showMoreOptions=function(){
                    Modals.showMoreOptionsModal({}).then(function(data){
                        },
                        function(err){
                            // Do something when user cancel the popup
                        });
                };
                WidgetWall.likeThread = function (post, type) {
                    var uniqueIdsArray = [];
                    uniqueIdsArray.push(post.uniqueLink);
                    var success = function (response) {
                        if(response.data && response.data.result && response.data.result.length > 0) {
                            if(response.data.result[0].isUserLikeActive) {
                                SocialDataStore.addThreadLike(post, type).then(function (res) {
                                    console.log('thread gets liked', res);
                                    post.likesCount++;
                                    post.waitAPICompletion = false;
                                    WidgetWall.updateLikesData(post._id, false);
                                    if (!$scope.$$phase)$scope.$digest();
                                }, function (err) {
                                    console.error('error while liking thread', err);
                                });
                            } else {
                                SocialDataStore.removeThreadLike(post, type).then(function (res) {
                                    if(res.data && res.data.result)
                                        post.likesCount--;
                                    post.waitAPICompletion = false;
                                    WidgetWall.updateLikesData(post._id, true);
                                    if (!$scope.$$phase)$scope.$digest();
                                }, function (err) {
                                    console.error('error while removing like of thread', err);
                                });
                            }
                        }
                    };
                    var error = function (err) {
                        post.waitAPICompletion = false;
                        console.error('error is : ', err);
                    };
                    if(!post.waitAPICompletion) {
                        post.waitAPICompletion = true;
                        SocialDataStore.getThreadLikes(uniqueIdsArray).then(success, error);
                    }

                };
                WidgetWall.seeMore=function(post){
                    post.seeMore=true;
                    post.limit=10000000;
                    if (!$scope.$$phase)$scope.$digest();
                };
                WidgetWall.getDuration = function (timestamp) {
                    return moment(timestamp.toString()).fromNow();
                };

                WidgetWall.goInToThread=function(threadId){
                    if(threadId)
                    Location.go('#/thread/'+threadId);
                };
                WidgetWall.isLikedByLoggedInUser = function (postId) {
                    var isUserLikeActive = true;
                    getLikesData.some(function(likeData) {
                        if(likeData._id == postId) {
                            isUserLikeActive = likeData.isUserLikeActive;
                            return true;
                        }
                    });
                    return isUserLikeActive;
                };
                WidgetWall.updateLikesData = function (postId, status) {
                    getLikesData.some(function (likeData) {
                        if(likeData._id == postId) {
                            likeData.isUserLikeActive = status;
                            return true;
                        }
                    })
                };
                Buildfire.messaging.onReceivedMessage = function (event) {
                    if(event && event.name=='POST_DELETED'){
                        WidgetWall.posts = WidgetWall.posts.filter(function (el) {
                            return el._id != event._id;
                        });
                        if (!$scope.$$phase)
                            $scope.$digest();
                    }
                    else if(event && event.name=='BAN_USER'){
                        WidgetWall.posts = WidgetWall.posts.filter(function (el) {
                            return el.userId != event._id;
                        });
                        if (!$scope.$$phase)
                            $scope.$digest();
                    }
                    else if(event && event.name=="COMMENT_DELETED"){
                        WidgetWall.posts.some(function (el) {
                            if(el._id==event.postId){
                                el.commentsCount--;
                                return true;
                            }
                        });
                        if (!$scope.$$phase)
                            $scope.$digest();
                    }
                };
            }])
})(window.angular);