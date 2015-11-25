'use strict';

(function (angular) {
    angular
        .module('socialPluginContent')
        .controller('ContentHomeCtrl', ['$scope', 'SocialDataStore', function ($scope, SocialDataStore) {
            console.log('Buildfire content--------------------------------------------- controller loaded');
            var ContentHome = this;
            ContentHome.postText = '';
            ContentHome.posts = [];
            var init = function () {
                var success = function (response) {
                        console.info('inside success of get posts and result inside content section is: ', response);
                        ContentHome.posts = response.data.result;
                    }
                    , error = function (err) {
                        console.error('Error while getting data inside content section is: ', err);
                    };
                SocialDataStore.getPosts().then(success, error);
            }
            init();
        }]);
})(window.angular);

