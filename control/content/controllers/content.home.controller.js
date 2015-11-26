'use strict';

(function (angular) {
    angular
        .module('socialPluginContent')
        .controller('ContentHomeCtrl', ['$scope', 'SocialDataStore', function ($scope, SocialDataStore) {
            console.log('Buildfire content--------------------------------------------- controller loaded');
            var ContentHome = this;
            var usersData = [];
            var userIds = [];
            ContentHome.postText = '';
            ContentHome.posts = [];
            var init = function () {
                var success = function (response) {
                        console.info('inside success of get posts and result inside content section is: ', response);
                        ContentHome.posts = response.data.result;
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
                        console.error('Error while getting data inside content section is: ', err);
                    };
                SocialDataStore.getPosts().then(success, error);
            };
            init();
            ContentHome.getUserName = function (userId) {
                var userName = '';
                usersData.some(function(userData) {
                    if(userData.userObject._id == userId) {
                        userName = userData.userObject.displayName || '';
                        return true;
                    }
                });
                return userName;
            };
            ContentHome.getUserImage = function (userId) {
                var userImageUrl = '';
                usersData.some(function(userData) {
                    if(userData.userObject._id == userId) {
                        userImageUrl = userData.userObject.imageUrl || '';
                        return true;
                    }
                });
                return userImageUrl;
            };
        }]);
})(window.angular);

