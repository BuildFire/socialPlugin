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
        .factory("SocialDataStore", ['Buildfire', '$q', 'SERVER_URL', 'API_KEY', '$http', function (Buildfire, $q, SERVER_URL, API_KEY, $http) {
            return {
                addApplication: function (appId, dataStoreKey) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'applications/add';
                    postDataObject.params = {};
                    //postDataObject.params._id = appId;
                    postDataObject.params.secureToken = dataStoreKey;
                    postDataObject.params.externalAppId = appId;
                    postDataObject.apiKey = API_KEY.value;
                    var successCallback = function (response) {
                        console.log('Resolve in add application Api-------------------',response);
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
                getPosts: function (data) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'thread/findByPage';
                    postDataObject.params = {};
                    postDataObject.params.appId =  data.socialAppId;
                    postDataObject.params.parentThreadId = data.socialAppId + data.instanceId;
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
                deletePost: function (postId, socialAppId) {
                    var deferred = $q.defer();
                    var postDeleteObject = {};
                    postDeleteObject.id = '1';
                    postDeleteObject.method = 'thread/delete';
                    postDeleteObject.params = {};
                    postDeleteObject.params.threadId = postId;
                    postDeleteObject.params.appId = socialAppId;
                    postDeleteObject.params.userToken = null;
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
                    postDataObject.params.appId = data.socialAppId;
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
                banUser: function (userId, threadId, socialAppId) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'users/blockUnblockUser';
                    postDataObject.params = {};
                    postDataObject.params.appId = socialAppId;
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
                deleteComment: function (commentId, threadId, socialAppId) {
                    var deferred = $q.defer();
                    var postDeleteObject = {};
                    postDeleteObject.id = '1';
                    postDeleteObject.method = 'threadComments/delete';
                    postDeleteObject.params = {};
                    postDeleteObject.params.commentId = commentId;
                    postDeleteObject.params.appId = socialAppId;
                    postDeleteObject.params.threadId = threadId;
                    postDeleteObject.params.userToken = null;
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
                getThreadLikes: function (uniqueIds, socialAppId) {
                    console.log('Unique Ids------------------------',uniqueIds);
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'threadLikes/getLikes';
                    postDataObject.params = {};
                    postDataObject.params.uniqueIds = uniqueIds;
                    postDataObject.params.appId = socialAppId;
                    postDataObject.params.userId = null;
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
