'use strict';

(function (angular) {
        angular.module('socialPluginWidget')
            .controller('WidgetWallCtrl', ['$scope','SocialDataStore','Modals', 'Buildfire','$rootScope','Location', function($scope, SocialDataStore, Modals, Buildfire,$rootScope,Location) {
                console.log('WidgetWall controller loaded--------------------------------------------------------------');
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
                    console.log('inside create post method>>>>>',WidgetWall.postText, WidgetWall.picFile);
                    if(WidgetWall.picFile) {                // image post
                        var success = function (response) {
                            console.log('response inside controller for image upload is: ', response);
                            finalPostCreation(response.data.result);
                        };
                        var error = function (err) {
                            console.log('Error is : ', err);
                        };
                        SocialDataStore.uploadImage(WidgetWall.picFile).then(success, error);
                    } else {                        // text post
                        finalPostCreation();
                    }
                };
                var init = function () {
                    Buildfire.auth.getCurrentUser(function(userData){
                        console.log('Datta-----------------',userData);
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
                        console.info('Post creation response is: ', response.data);
                        WidgetWall.postText = '';
                        if(response.data.error) {
                            console.error('Error while creating post ', response.data.error);
                        } else if(response.data.result) {
                            Buildfire.messaging.sendMessageToControl({eventName:'Post Created',status:'Success'});
                            console.info('Post created successfully', response.data.result);
                            WidgetWall.posts.unshift(response.data.result);
                            if(userIds.indexOf(response.data.result.userId.toString()) == -1) {
                                userIds.push(response.data.result.userId.toString());
                            }
                            var successCallback = function (response) {
                                console.info('Users fetching response when added dynamic post is: ', response.data.result);
                                if(response.data.error) {
                                    console.error('Error while fetching users ', response.data.error);
                                } else if(response.data.result) {
                                    console.info('Users fetched successfully', response.data.result);
                                    usersData = response.data.result;
                                }
                            };
                            var errorCallback = function (err) {
                                console.log('Error while fetching users details ', err);
                                $scope.$digest();
                            };
                            SocialDataStore.getUsers(userIds).then(successCallback, errorCallback);
                        }
                    };
                    var error = function (err) {
                        console.log('Error while creating post ', err);
                        WidgetWall.postText = '';
                    };
                    console.log('post data inside controller is: ',postData);
                    SocialDataStore.createPost(postData).then(success, error);
                }
                WidgetWall.getPosts = function () {
                    WidgetWall.noMore=true;
                    var lastThreadId;
                    console.log('Get method called------------------------------');
                    var success = function (response) {
                            console.info('inside success of get posts and result is: ', response);
                            //WidgetWall.posts = response.data.result;
                            if(response && response.data && response.data.result){
                                if(response.data.result.length<10){
                                    WidgetWall.noMore=true;
                                }
                                else{
                                    WidgetWall.noMore=false;
                                }
                            }
                            response.data.result.forEach(function (postData) {
                                if (userIds.indexOf(postData.userId.toString()) == -1)
                                    userIds.push(postData.userId.toString());
                                WidgetWall.posts.push(postData);
                                postsUniqueIds.push(postData.uniqueLink);
                            });
                            var successCallback = function (response) {
                                console.info('Users fetching response is: ', response.data.result);
                                if(response.data.error) {
                                    console.error('Error while fetching users ', response.data.error);
                                } else if(response.data.result) {
                                    console.info('Users fetched successfully', response.data.result);
                                    usersData = response.data.result;
                                }
                            };
                            var errorCallback = function (err) {
                                WidgetWall.noMore=false;
                                console.log('Error while fetching users details ', err);
                            };
                            SocialDataStore.getUsers(userIds).then(successCallback, errorCallback);
                            SocialDataStore.getThreadLikes(postsUniqueIds).then(function (response) {
                                console.info('get thread likes response is: ', response.data.result);
                                if(response.data.error) {
                                    console.error('Error while getting likes of thread by logged in user ', response.data.error);
                                } else if(response.data.result) {
                                    console.info('Thread likes fetched successfully', response.data.result);
                                    getLikesData = response.data.result;
                                }
                            }, function (err) {
                                console.log('Error while fetching thread likes ', err);
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
                            console.log('Data in Successs------------------data');
                        },
                        function(err){
                            console.log('Error in Error handler--------------------------',err);
                        });
                };
                WidgetWall.likeThread = function (post, type) {
                    var uniqueIdsArray = [];
                    uniqueIdsArray.push(post.uniqueLink);
                    var success = function (response) {
                        console.log('inside success of getThreadLikes',response);
                        if(response.data && response.data.result && response.data.result.length > 0) {
                            if(response.data.result[0].isUserLikeActive) {
                                SocialDataStore.addThreadLike(post, type).then(function (res) {
                                    console.log('thread gets liked', res);
                                    post.likesCount++;
                                    WidgetWall.updateLikesData(post._id, false);
                                    if (!$scope.$$phase)$scope.$digest();
                                }, function (err) {
                                    console.log('error while liking thread', err);
                                });
                            } else {
                                SocialDataStore.removeThreadLike(post, type).then(function (res) {
                                    console.log('thread like gets removed', res);
                                    if(res.data && res.data.result)
                                        post.likesCount--;
                                    WidgetWall.updateLikesData(post._id, true);
                                    if (!$scope.$$phase)$scope.$digest();
                                }, function (err) {
                                    console.log('error while removing like of thread', err);
                                });
                            }
                        }
                    };
                    var error = function (err) {
                        console.log('error is : ', err);
                    };
                    SocialDataStore.getThreadLikes(uniqueIdsArray).then(success, error);

                };
                WidgetWall.seeMore=function(post){
                    post.seeMore=true;
                    post.limit=10000000;
                    if (!$scope.$$phase)$scope.$digest();
                };
                WidgetWall.getDuration = function (timestamp) {
                    console.log('post created wall : ',moment(timestamp.toString()).fromNow());
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
            }])
})(window.angular);