'use strict';

(function (angular, buildfire, location) {
    angular.module('socialPluginWidget')
        .provider('Buildfire', [function () {
            var Buildfire = this;
            Buildfire.$get = function () {
                return buildfire
            };
            return Buildfire;
        }])
        .factory('Location', [function () {
            var _location = location;
            return {
                go: function (path) {
                    _location.href = path;
                },
                goToHome: function () {
                    _location.href = _location.href.substr(0, _location.href.indexOf('#'));
                }
            };
        }])
        .factory("SocialDataStore", ['Buildfire', '$q', '$timeout', 'SERVER_URL', '$http', 'Upload', function (Buildfire, $q, $timeout, SERVER_URL, $http, Upload) {
            return {
                createPost: function (postData) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    console.log('buildfire is: >>>>>', Buildfire.context);
                    postDataObject.id = '1';
                    postDataObject.method = 'thread/add';
                    postDataObject.params = postData || {};
                    //postDataObject.params.appId = "5672627b935839f42b000018";
                    postDataObject.params.secureToken = null;
                    postDataObject.params.userToken = encodeURIComponent(postData.userToken);
                    // postDataObject.params.parentThreadId = "5672628a935839f42b00001a";
                    postDataObject.userToken = encodeURIComponent(postData.userToken);
                    console.log('Create post param ???????????????????????? ???????????????????? ', postDataObject);
                    /*if (localStorage.getItem('user'))
                     postData.params.userToken = localStorage.getItem('user').userToken;*/
                    var successCallback = function (response) {
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    /*$http.get('http://social.kaleoapps.com/src/server.js?data={"id":1,"method":"thread/add","params":{"appId":"551ae57f94ed199c3400002e","parentThreadId":"564f676cfbe10b9c240002ff","userToken":"ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=","text":"testThread","title":"","imageUrl":null,"secureToken":null},"userToken":null}').then(successCallback, errorCallback);*/
                    return deferred.promise;
                },
                getUsers: function (userIdsArray, userToken) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'users/getUsers';
                    postDataObject.params = {};
                    postDataObject.params.userIds = userIdsArray || [];
                    postDataObject.userToken = userToken || null;
                    var successCallback = function (response) {
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                addComment: function (data) {
                    console.log('params in add comment---------------??????????????????????????????', data);
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'threadComments/add';
                    postDataObject.params = {};
                    postDataObject.params.appId = data.appId;
                    postDataObject.params.threadId = data.threadId;
                    postDataObject.params.comment = data.comment;
                    postDataObject.params.attachedImage = data.imageUrl;
                    postDataObject.params.userToken = encodeURIComponent(data.userToken) || null;
                    postDataObject.userToken = encodeURIComponent(data.userToken) || null;
                    var successCallback = function (response) {
                        console.log('add Comment callback recieved--------------', response);
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        console.log('add Comment callback recieved--Error------------', err);
                        return deferred.reject(err);
                    };
                    console.log('Data----------------------------in add comment method--------', JSON.stringify(postDataObject));
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                getThreadByUniqueLink: function (threadUniqueLink, appId, userToken) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'thread/getThread';
                    postDataObject.params = {};
                    postDataObject.params.appId = appId;
                    postDataObject.params.uniqueLink = threadUniqueLink;
                    postDataObject.params.userToken = encodeURIComponent(userToken) || null;
                    postDataObject.params.title = null;
                    postDataObject.userToken = encodeURIComponent(userToken) || null;
                    var successCallback = function (response) {
                        console.log('get Post callback recieved--------------', response);
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        console.log('get Post callback recieved--Error------------', err);
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                getCommentsOfAPost: function (data) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'threadComments/findByPage';
                    postDataObject.params = {};
                    postDataObject.params.appId = data.appId;
                    postDataObject.params.threadId = data.threadId;
                    postDataObject.params.lastCommentId = data.lastCommentId || null;
                    postDataObject.userToken = data.userToken || null;
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
                addThreadLike: function (post, type, appId, userToken) {
                    console.log('Add Like Api post Data----------------------', post);
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'threadLikes/add';
                    postDataObject.params = {};
                    postDataObject.params.appId = appId;
                    postDataObject.params.threadId = post._id;
                    postDataObject.params.userToken = encodeURIComponent(userToken);
                    postDataObject.params.parentThreadId = post.parentThreadId || post.threadId;
                    postDataObject.params.additionalInfo = {
                        type: type,
                        refId: post._id,
                        externalAppId: appId
                    };
                    var successCallback = function (response) {
                        console.log('add like callback recieved--------------', response);
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        console.log('add like callback recieved--Error------------', err);
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                uploadImage: function (file, userToken, appId) {
                    var deferred = $q.defer();
                    console.log('inside upload image method : ', file, Upload);
                    Upload.upload({
                        url: SERVER_URL.link + '?method=Image/upload',
                        data: {
                            'files': file,
                            'userToken': userToken,
                            'secureToken' : null,
                            'appId': appId

                        }
                    }).then(function (resp) {
                        console.log('Success uploaded. Response: ' + resp);
                        deferred.resolve(resp);
                    }, function (resp) {
                        console.log('Error status: ' + resp.status);
                        deferred.reject(resp);
                    });
                    return deferred.promise;
                },
                getUserSettings: function (data) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'users/getUserSettings';
                    postDataObject.params = {};
                    postDataObject.params.appId = data.appId;
                    postDataObject.params.threadId = data.threadId;
                    postDataObject.params.userId = data.userId || null;
                    postDataObject.params.userToken = encodeURIComponent(data.userToken) || null;
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
                saveUserSettings: function (data) {
                    console.log('data is: ========================', data);
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'users/saveUserSettings';
                    postDataObject.params = {};
                    postDataObject.params.userToken = encodeURIComponent(data.userToken) || null;
                    postDataObject.params.userSettings = {};
                    postDataObject.params.userSettings._id = data.settingsId;
                    postDataObject.params.userSettings.appId = data.appId;
                    postDataObject.params.userSettings.threadId = data.threadId;
                    postDataObject.params.userSettings.userId = data.userId || null;
                    postDataObject.params.userSettings.receivePushNotification = data.receivePushNotification;
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
                getThreadLikes: function (uniqueIds, appId, userId) {
                    console.log('Unique Ids------------------------', uniqueIds);
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'threadLikes/getLikes';
                    postDataObject.params = {};
                    postDataObject.params.uniqueIds = uniqueIds;
                    postDataObject.params.appId = appId;
                    postDataObject.params.userId = userId || null;
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
                },
                removeThreadLike: function (post, type, appId, userToken) {
                    var deferred = $q.defer();
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'threadLikes/unlike';
                    postDataObject.params = {};
                    postDataObject.params.appId = appId;
                    postDataObject.params.threadId = post._id;
                    postDataObject.params.userToken = encodeURIComponent(userToken) || null;
                    //postDataObject.params.parentThreadId = post.parentThreadId || post.threadId;
                    postDataObject.params.additionalInfo = {
                        type: type,
                        refId: post._id,
                        externalAppId: appId
                    };
                    postDataObject.userToken = null;
                    var successCallback = function (response) {
                        console.log('remove like callback recieved--------------', response);
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        console.log('remove like callback recieved--Error------------', err);
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                reportPost: function (postId, appId, userToken) {
                    var deferred = $q.defer();
                    var reportPostbject = {};
                    reportPostbject.id = '1';
                    reportPostbject.method = 'thread/delete';
                    reportPostbject.params = {};
                    reportPostbject.params.threadId = postId;
                    reportPostbject.params.appId = appId;
                    reportPostbject.params.userToken = userToken || null;
                    reportPostbject.params.secureToken = null;
                    reportPostbject.userToken = userToken || null;
                    var successCallback = function (response) {
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        return deferred.reject(err);
                    };
                    $timeout(function () {
                        successCallback(200);
                    }, 500);

                    return deferred.promise;
                },
                deletePost: function (postId, appId, userToken) {
                    var deferred = $q.defer();
                    var postDeleteObject = {};
                    postDeleteObject.id = '1';
                    postDeleteObject.method = 'thread/delete';
                    postDeleteObject.params = {};
                    postDeleteObject.params.threadId = postId;
                    postDeleteObject.params.appId = appId;
                    postDeleteObject.params.userToken = encodeURIComponent(userToken);
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
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDeleteObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                deleteComment: function (commentId, threadId, appId, userToken) {
                    var deferred = $q.defer();
                    var postDeleteObject = {};
                    postDeleteObject.id = '1';
                    postDeleteObject.method = 'threadComments/delete';
                    postDeleteObject.params = {};
                    postDeleteObject.params.commentId = commentId;
                    postDeleteObject.params.appId = appId;
                    postDeleteObject.params.threadId = threadId;
                    postDeleteObject.params.userToken = encodeURIComponent(userToken) || null;
                    postDeleteObject.params.secureToken = null;
                    postDeleteObject.userToken = encodeURIComponent(userToken) || null;
                    var successCallback = function (response) {
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDeleteObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                }
            }
        }])
        .factory('SocialItems', ['Buildfire', '$http', 'SERVER_URL', 'Location', function (Buildfire, $http, SERVER_URL, Location) {
            var _this;
            var SocialItems = function () {
                _this = this;
                _this.items = [];
                _this.busy = false;
                _this.lastThreadId = null;
                _this.context = {};
                _this.parentThreadId = null;
                _this.socialAppId = null;
                _this.userDetails = {};
                _this.userDetails.userToken = null;
                _this.userDetails.userId = null;
                _this.userDetails.settingsId = null;
                _this._receivePushNotification;

            };
            var instance;
            SocialItems.prototype.posts = function () {
                if (_this.busy) {
                    return;
                }
                if (_this.parentThreadId && _this.socialAppId) {
                    console.log('Inside if---------------------------------------this', _this);
                    getPosts();
                }
                else {
                    console.log('Inside else 1---------------------------------------this', _this);
                    Buildfire.getContext(function (err, context) {
                        if (err) {
                            console.error("Error while getting buildfire context details", err);
                        } else {
                            console.log('inside get context success::::::::::');
                            _this.context = context;
                            getAppIdAndParentThreadId();
                        }
                    });

                }
                console.log('This in Service-------------------------------------------', this);


                function getAppIdAndParentThreadId(){
                    console.log('getAppIdAndParentThreadId method called-------------');
                    Buildfire.datastore.get('Social', function (err, data) {
                        console.log('Get------------data--------datastore--------', err, data);
                        if(data && data.data){
                            _this.socialAppId = data && data.data && data.data.socialAppId;
                            _this.parentThreadId = data && data.data && data.data.parentThreadId;
                            console.log('Inside else 2---------------------------------------this', _this);
                            getPosts();
                        }
                        else{
                            getAppIdAndParentThreadId();
                        }
                    });
                }
                function getPosts(){
                    console.log('getPosts called');
                    _this.busy = true;
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'thread/findByPage';
                    postDataObject.params = {};
                    postDataObject.params.appId = _this.socialAppId;
                    postDataObject.params.parentThreadId = _this.parentThreadId;
                    postDataObject.params.lastThreadId = _this.lastThreadId;
                    postDataObject.userToken = null;
                    console.log('Post data in services-------------------', postDataObject);
                    $http({
                        method: 'GET',
                        url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                        headers: {'Content-Type': 'application/json'}
                    }).then(function (data) {
                        console.log('Get posts in service of SocialItems-------------------------', data);
                        if (data && data.data && data.data.result && data.data.result.length) {
                            _this.items = _this.items.concat(data.data.result);
                            _this.lastThreadId = _this.items[_this.items.length - 1]._id;
                            _this.busy = data.data.result.length < 10;
                        }
                        else {
                            _this.busy = true;
                        }

                    }, function (err) {
                        _this.busy = false;
                        console.log('Get posts in service of SocialItems---------err----------------', err);
                    });
                }
            };

            SocialItems.prototype.loggedInUserDetails = function () {
                Buildfire.datastore.get('Social', function (err, data) {
                    console.log('Get------------data--------datastore--------', err, data);
                    _this.socialAppId = data && data.data && data.data.socialAppId;
                    _this.parentThreadId = data && data.data && data.data.parentThreadId;
                    Buildfire.auth.getCurrentUser(function (err, userData) {
                        console.info('Current Logged In user details are -----------------', userData);
                        if (userData) {
                            _this.userDetails.userToken = userData.userToken;
                            _this.userDetails.userId = userData._id;
                            var postDataObject = {};
                            postDataObject.id = '1';
                            postDataObject.method = 'users/getUserSettings';
                            postDataObject.params = {};
                            postDataObject.params.appId = _this.socialAppId;
                            postDataObject.params.threadId = _this.parentThreadId;
                            postDataObject.params.userId = _this.userDetails.userId || null;
                            postDataObject.params.userToken = encodeURIComponent(_this.userDetails.userToken) || null;
                            $http({
                                method: 'GET',
                                url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                                headers: {'Content-Type': 'application/json'}
                            }).then(function (response) {
                                console.log('inside getUser settings :::::::::::::', response);
                                if (response && response.data && response.data.result) {
                                    console.log('getUserSettings response is: ', response);
                                    _this._receivePushNotification = response.data.result.receivePushNotification;
                                    _this.userDetails.settingsId = response.data.result._id;
                                } else if (response && response.data && response.data.error) {
                                    console.log('response error is: ', response.data.error);
                                }

                            }, function (err) {
                                console.log('Error while logging in user is: ', err);
                            });
                        }
                        else {
                            Buildfire.auth.login(null, function (err, user) {
                                console.log('Login called---------------------------------', user, err);
                                Buildfire.auth.getCurrentUser(function (err, userData) {
                                    console.info('Current Logged In user details are -----------------', userData);
                                    if (userData) {
                                        _this.userDetails.userToken = userData.userToken;
                                        _this.userDetails.userId = userData._id;
                                        var postDataObject = {};
                                        postDataObject.id = '1';
                                        postDataObject.method = 'users/getUserSettings';
                                        postDataObject.params = {};
                                        postDataObject.params.appId = _this.socialAppId;
                                        postDataObject.params.threadId = _this.parentThreadId;
                                        postDataObject.params.userId = _this.userDetails.userId || null;
                                        postDataObject.params.userToken = encodeURIComponent(_this.userDetails.userToken) || null;
                                        $http({
                                            method: 'GET',
                                            url: SERVER_URL.link + '?data=' + JSON.stringify(postDataObject),
                                            headers: {'Content-Type': 'application/json'}
                                        }).then(function (response) {
                                            console.log('inside getUser settings :::::::::::::', response);
                                            if (response && response.data && response.data.result) {
                                                console.log('getUserSettings response is: ', response);
                                                _this._receivePushNotification = response.data.result.receivePushNotification;
                                                _this.userDetails.settingsId = response.data.result._id;
                                            } else if (response && response.data && response.data.error) {
                                                console.log('response error is: ', response.data.error);
                                            }

                                        }, function (err) {
                                            console.log('Error while logging in user is: ', err);
                                        });
                                    }
                                });
                                Location.goToHome();
                            });
                        }
                    });
                });
            };
            return {
                getInstance: function () {
                    if (!instance) {
                        instance = new SocialItems();
                    }
                    return instance;
                }
            };
        }])
})(window.angular, window.buildfire, window.location);
