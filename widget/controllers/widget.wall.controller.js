'use strict';

(function (angular) {
    angular.module('socialPluginWidget')
        .controller('WidgetWallCtrl', ['$scope','SocialDataStore','Modals', function($scope, SocialDataStore,Modals) {
            var WidgetWall = this;
            var usersData = [];
            var userIds = [];
            WidgetWall.postText = '';
            WidgetWall.posts = [];
            WidgetWall.createPost = function () {
                console.log('inside create post method>>>>>',WidgetWall.postText);
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
            };
            var init = function () {
                var success = function (response) {
                        console.info('inside success of get posts and result is: ', response);
                        WidgetWall.posts = response.data.result;
                        response.data.result.forEach(function(postData) {
                            if(userIds.indexOf(postData.userId.toString()) == -1)
                            userIds.push(postData.userId.toString());
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
                            console.log('Error while fetching users details ', err);
                        };
                        SocialDataStore.getUsers(userIds).then(successCallback, errorCallback);
                    }
                    , error = function (err) {
                        console.error('Error while getting data', err);
                    };
                SocialDataStore.getPosts().then(success, error);
            };
            init();
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
        }])
})(window.angular);