'use strict';

(function (angular, buildfire) {
    angular.module('socialPluginContent')
        .provider('Buildfire', [function () {
            var Buildfire = this;
            Buildfire.$get = function () {
                return buildfire
            };
            return Buildfire;
        }])
        .factory("SocialDataStore", ['Buildfire', '$q', 'SERVER_URL', '$http', function (Buildfire, $q, SERVER_URL, $http) {
            return {
                getPosts: function (data) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'thread/findByPage';
                    postDataObject.params = {};
                    postDataObject.params.appId = '551ae57f94ed199c3400002e' || Buildfire.context.appId;
                    postDataObject.params.parentThreadId = '564f676cfbe10b9c240002ff' || Buildfire.context.appId + Buildfire.context.instanceId;
                    postDataObject.params.lastThreadId = data.lastThreadId;
                    postDataObject.userToken = null;
                    var successCallback = function (response) {
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link+'?data='+ JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                getUsers: function (userIdsArray) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'users/getUsers';
                    postDataObject.params = {};
                    postDataObject.params.userIds = userIdsArray || [];
                    postDataObject.userToken = null;
                    var successCallback = function (response) {
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data='+ JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                deletePost: function (postId) {
                    var deferred = $q.defer();
                    var postDeleteObject = {};
                    postDeleteObject.id = '1';
                    postDeleteObject.method = 'thread/delete';
                    postDeleteObject.params = {};
                    postDeleteObject.params.threadId = postId;
                    postDeleteObject.params.appId = '551ae57f94ed199c3400002e' || Buildfire.context.appId;
                    postDeleteObject.params.userToken = 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=' || localStorage.getItem('user') && localStorage.getItem('user').userToken;
                    postDeleteObject.params.secureToken = null;
                    postDeleteObject.userToken = null;
                    var successCallback = function (response) {
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data='+ JSON.stringify(postDeleteObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                getCommentsOfAPost:function(data) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'threadComments/findByPage';
                    postDataObject.params = {};
                    postDataObject.params.appId = '551ae57f94ed199c3400002e' || Buildfire.context.appId;
                    postDataObject.params.threadId = data.threadId;
                    postDataObject.params.lastCommentId = data.lastCommentId || null;
                    postDataObject.userToken = null;
                    var successCallback = function (response) {
                        console.log('get Comment callback recieved--------------', response);
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        console.log('get Comment callback recieved--Error------------', err);
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                banUser: function (userId, threadId) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'users/blockUnblockUser';
                    postDataObject.params = {};
                    postDataObject.params.appId = '551ae57f94ed199c3400002e' || Buildfire.context.appId;
                    postDataObject.params.threadId = threadId;
                    postDataObject.params.userId = userId;
                    postDataObject.params.secureToken = "null";
                    postDataObject.params.block = true;
                    postDataObject.params.removeAllComments = true;
                    postDataObject.userToken = null;
                    var successCallback = function (response) {
                        console.log('get Comment callback recieved--------------', response);
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        console.log('get Comment callback recieved--Error------------', err);
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                deleteComment: function (commentId, threadId) {
                    var deferred = $q.defer();
                    var postDeleteObject = {};
                    postDeleteObject.id = '1';
                    postDeleteObject.method = 'threadComments/delete';
                    postDeleteObject.params = {};
                    postDeleteObject.params.commentId = commentId;
                    postDeleteObject.params.appId = '551ae57f94ed199c3400002e' || Buildfire.context.appId;
                    postDeleteObject.params.threadId = threadId;
                    postDeleteObject.params.userToken = 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=' || localStorage.getItem('user') && localStorage.getItem('user').userToken;
                    postDeleteObject.params.secureToken = null;
                    postDeleteObject.userToken = null;
                    var successCallback = function (response) {
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data='+ JSON.stringify(postDeleteObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                getThreadLikes: function (uniqueIds) {
                    console.log('Unique Ids------------------------',uniqueIds);
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'threadLikes/getLikes';
                    postDataObject.params = {};
                    postDataObject.params.uniqueIds = uniqueIds;
                    postDataObject.params.appId = '551ae57f94ed199c3400002e' || Buildfire.context.appId;
                    postDataObject.params.userId = "5317c378a6611c6009000001" || null;
                    var success = function (response) {
                        return deferred.resolve(response);
                    };
                    var error = function (err) {
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(success, error);
                    return deferred.promise;
                }
            }
        }])
})(window.angular, window.buildfire);
