'use strict';

(function (angular) {
    angular.module('socialPluginWidget')
        .controller('WidgetWallCtrl', ['$scope','SocialDataStore', function($scope, SocialDataStore) {
            var WidgetWall = this;
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
                        $scope.$digest();
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
                    }
                    , error = function (err) {
                        console.error('Error while getting data', err);
                    };
                SocialDataStore.getPosts().then(success, error);
            }
            init();
        }])
})(window.angular);