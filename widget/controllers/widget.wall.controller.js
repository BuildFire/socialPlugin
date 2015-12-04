'use strict';

(function (angular) {
        angular.module('socialPluginWidget')
            .controller('WidgetWallCtrl', ['$scope','SocialDataStore','Modals', 'Buildfire', function($scope, SocialDataStore, Modals, Buildfire) {
                var WidgetWall = this;
                var usersData = [];
                var userIds = [];
                WidgetWall.userDetails={};
                WidgetWall.height=window.innerHeight;
                WidgetWall.noMore=false;
                WidgetWall.postText = '';
                WidgetWall.picFile = '';
                WidgetWall.posts = [];
                WidgetWall.createPost = function () {
                    console.log('inside create post method>>>>>',WidgetWall.postText, WidgetWall.picFile);
                    if(WidgetWall.picFile) {                // image post
                        var success = function (response) {
                            console.log('response inside controller for image upload is: ', response);
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
                function finalPostCreation () {
                    var postData = {};
                    postData.text = WidgetWall.postText;
                    postData.title = '';
                    postData.imageUrl = null;
                    var success = function (response) {
                        console.info('Post creation response is: ', response.data);
                        WidgetWall.postText = '';
                        if(response.data.error) {
                            console.error('Error while creating post ', response.data.error);
                        } else if(response.data.result) {
                            console.info('Post created successfully', response.data.result);
                            WidgetWall.posts.push(response.data.result);
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
                            });
                            var successCallback = function (response) {
                                console.info('Users fetching response is: ', response.data.result);
                                if(response.data.error) {
                                    console.error('Error while creating post ', response.data.error);
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
                    SocialDataStore.addThreadLike(post, type).then(function (res) {
                        console.log('thread gets liked', res);
                        post.likesCount++;
                        if (!$scope.$$phase)$scope.$digest();
                    }, function (err) {
                        console.log('error while liking thread', err);
                    });
                };
                WidgetWall.seeMore=function(post){
                    post.seeMore=true;
                    post.limit=10000000;
                    if (!$scope.$$phase)$scope.$digest();
                };
            }])
})(window.angular);