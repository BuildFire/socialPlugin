'use strict';

(function (angular) {
    angular.module('socialPluginWidget')
        .controller('ThreadCtrl', ['$scope','$routeParams','SocialDataStore', function($scope,$routeParams,SocialDataStore) {
            var Thread=this;
            console.log('$routeParams--------------------------------',$routeParams);
            if($routeParams.threadId){
                SocialDataStore.getThreadByUniqueLink($routeParams.threadId).then(
                    function(data){
                        if(data && data.data && data.data.result)
                        Thread.post=data.data.result;
                        console.log('Success------------------------get Post',data);
                    },
                    function(err){
                        console.log('Error----------Get Post',err);
                    }
                );
            }
            console.log('Thread controller is loaded');
        }])
})(window.angular);