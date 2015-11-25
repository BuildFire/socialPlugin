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
                    if(response.data.error) {
                        console.error('Error while creating post ', response.data.error);
                    } else if(response.data.result) {
                        console.info('Post created successfully', response.data.result);
                    }
                };
                var error = function (err) {
                    console.log('Error while creating post ', err);
                };
                console.log('post data inside controller is: ',postData);
                SocialDataStore.createPost(postData).then(success, error);
            };
            var init = function () {
                var success = function (response) {
                        console.info('inside success of get posts and result is: ', response);
                        WidgetWall.posts = response.data.result;
//                        WidgetSingle.data = result.data;
                        /*if (!WidgetSingle.data.design)
                            WidgetSingle.data.design = {};
                        if (!WidgetSingle.data.content)
                            WidgetSingle.data.content = {};
                        if (!WidgetSingle.data.design.itemListLayout) {
                            WidgetSingle.data.design.itemListLayout = LAYOUTS.listLayouts[0].name;
                        }
                        currentItemListLayout = WidgetSingle.data.design.itemListLayout;
                        currentPlayListID = WidgetSingle.data.content.playListID;*/
                    }
                    , error = function (err) {
                        console.error('Error while getting data', err);
                    };
                SocialDataStore.getPosts().then(success, error);
            }
            init();
        }])
})(window.angular);