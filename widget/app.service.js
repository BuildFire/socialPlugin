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
        .factory('Util', ['SERVER_URL', function (SERVER_URL) {
            return {
                requiresHttps: function () {
                    var useHttps = false;
                    var userAgent = navigator.userAgent || navigator.vendor;
                    var isiPhone = (/(iPhone|iPod|iPad)/i.test(userAgent));
                    var isAndroid = (/android/i.test(userAgent));

                    //iOS 10 and higher should use HTTPS
                    if (isiPhone) {
                        //This checks the first digit of the OS version. (Doesn't distinguish between 1 and 10)
                        if (!(/OS [4-9](.*) like Mac OS X/i.test(userAgent))) {
                            useHttps = true;
                        }
                    }

                    //For web based access, use HTTPS
                    if (!isiPhone && !isAndroid) {
                        useHttps = true;
                    }

                    console.warn('userAgent: ' + userAgent);
                    console.warn('useHttps: ' + useHttps);

                    return useHttps;
                },
                getProxyServerUrl: function () {
                    return this.requiresHttps() ? SERVER_URL.secureLink : SERVER_URL.link;
                },injectAnchors:function (text,options) {
                    text = decodeURIComponent(text);
                    var URL_CLASS = "reffix-url";
                    var URLREGEX = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;
                    var EMAILREGEX = /([\w\.]+)@([\w\.]+)\.(\w+)/g;

                    if(!options)options={injectURLAnchors:true,injectEmailAnchors:true};
                    var lookup=[];
                    if(!options.urlAnchorGen)
                        options.urlAnchorGen = function(url){
                            return {url:url,target:'_system'}
                        };
                    if(options.injectURLAnchors)
                        text= text.replace(URLREGEX, function(url) {
                            var obj = options.urlAnchorGen(url);
                            if(obj.url && obj.url.indexOf('http') !== 0 && obj.url.indexOf('https') !== 0){
                                obj.url = 'http://' + obj.url;
                            }
                            lookup.push("<a href='" + obj.url + "' target='" + obj.target + "' >" + url + "</a>");
                            return "_RF" + (lookup.length -1) + "_";
                        });
                    if(!options.emailAnchorGen)
                        options.emailAnchorGen = function(email){
                            return {url:"mailto:" + email,target:'_system'}
                        };
                    if(options.injectEmailAnchors)
                        text= text.replace(EMAILREGEX, function(url) {
                            var obj = options.emailAnchorGen(url);
                            lookup.push("<a href='" + obj.url + "' target='" + obj.target + "'>" + url + "</a>");
                            return "_RF" + (lookup.length -1) + "_";
                        });
                    /// this is done so you dont swap what was injected
                    lookup.forEach(function(e,i){
                        text = text.replace("_RF" + i + "_",e);
                    });
                    return text;
                }
            }
        }])
        .factory("SocialDataStore", ['Buildfire', '$q', '$timeout', 'Util', '$http', 'Upload', function (Buildfire, $q, $timeout, Util, $http, Upload) {
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
                    postDataObject.params.userToken = postData.userToken;
                    // postDataObject.params.parentThreadId = "5672628a935839f42b00001a";
                    postDataObject.userToken = postData.userToken;
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
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
                    postDataObject.params.userToken = data.userToken || null;
                    postDataObject.userToken = data.userToken || null;
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
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
                    postDataObject.params.userToken = userToken || null;
                    postDataObject.params.title = null;
                    postDataObject.userToken = userToken || null;
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
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
                    postDataObject.params.userToken = userToken;
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                },
                uploadImage: function (file, userToken, appId) {
                    var deferred = $q.defer();
                    console.log('inside upload image method : ', file, Upload);
                    Upload.upload({
                        url: Util.getProxyServerUrl() + '?method=Image/upload',
                        data: {
                            'files': file,
                            'userToken': userToken,
                            'secureToken': null,
                            'appId': appId

                        }
                    }).then(function (resp) {
                        console.log('Success uploaded. Response: ' + resp);
                        deferred.resolve(resp);
                    }, function (resp) {
                        console.log('Error status: ' + resp.status);
                        deferred.reject(resp);
                    }, function (evt) {
                        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        //                        deferred.notify(file.progress);
                        angular.element('.progress-bar').css('width', file.progress + '%');
                        angular.element('.filename').text(file.name + ' -' + file.progress + '%');
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
                    postDataObject.params.userToken = data.userToken || null;
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
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
                    postDataObject.params.userToken = data.userToken || null;
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
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
                    postDataObject.params.userId = userId;
                    var success = function (response) {
                        return deferred.resolve(response);
                    };
                    var error = function (err) {
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
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
                    postDataObject.params.userToken = userToken || null;
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
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
                    postDeleteObject.params.userToken = userToken;
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDeleteObject},
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
                    postDeleteObject.params.userToken = userToken || null;
                    postDeleteObject.params.secureToken = null;
                    postDeleteObject.userToken = userToken || null;
                    var successCallback = function (response) {
                        return deferred.resolve(response);
                    };
                    var errorCallback = function (err) {
                        return deferred.reject(err);
                    };
                    $http({
                        method: 'GET',
                        url: Util.getProxyServerUrl(),
                        params: {data: postDeleteObject},
                        headers: {'Content-Type': 'application/json'}
                    }).then(successCallback, errorCallback);
                    return deferred.promise;
                }
            }
        }])
        .factory('SocialItems', ['Buildfire', '$http', 'Util', 'Location', '$routeParams', 'SocialDataStore','$rootScope', function (Buildfire, $http, Util, Location, $routeParams, SocialDataStore,$rootScope) {
            var _this;
            var SocialItems = function () {
                _this = this;
                _this.items = [];
                _this.busy = false;
                _this.lastThreadId = null;
                _this.context = {};
                _this.parentThreadId = null;
                _this.socialAppId = null;
                _this.appSettings = null;
                _this.userDetails = {};
                _this.userDetails.userToken = null;
                _this.userDetails.userId = null;
                _this.userDetails.settingsId = null;
                _this.userDetails.userTags = null;
                _this._receivePushNotification;
                _this.postMehodCalledFlag = false;
                _this.newPostTimerChecker = null;
                _this.newPostAvailable = false;
                _this.newCommentsAvailable = false;
                _this.comments = [];

            };
            var instance;
            SocialItems.prototype.posts = function () {
                console.log('Get Post called------------------------in widget section SocialItems service---------------------------*****************');
                if (_this.busy) {
                    return;
                }
                _this.busy = true;
                if (_this.parentThreadId && _this.socialAppId) {
                    console.log('Inside if---------------------------------------this', _this);
                    getPosts(function () {
                        startBackgroundService();
                    });
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


                function getAppIdAndParentThreadId() {
                    console.log('getAppIdAndParentThreadId method called-------------');
                    Buildfire.datastore.get('Social', function (err, data) {
                        console.log('Get------------data--------datastore--------', err, data);
                        if (data && data.data) {
                            _this.socialAppId = data && data.data && data.data.socialAppId;
                            _this.parentThreadId = data && data.data && data.data.parentThreadId;
                            _this.appSettings = data && data.data && data.data.appSettings;
                            console.log('Inside else 2---------------------------------------this', _this);
                            getPosts(function () {
                                startBackgroundService();
                            });
                        }
                        else {
                            getAppIdAndParentThreadId();
                        }
                    });
                }

                function getPosts(callback) {
                    console.log('getPosts called');
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
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
                        headers: {'Content-Type': 'application/json'}
                    }).then(function (data) {
                        console.log('Get posts in service of SocialItems-------------------------', data);
                        if (data && data.data && data.data.result && data.data.result.length) {
                            _this.items = _this.items.concat(data.data.result);
                            _this.lastThreadId = _this.items[_this.items.length - 1]._id;
                            _this.busy = data.data.result.length < 10;
                            _this.postMehodCalledFlag = true;
                        }
                        else {
                            _this.busy = true;
                        }
                        if (callback)
                            callback();

                    }, function (err) {
                        _this.busy = false;
                        console.log('Get posts in service of SocialItems---------err----------------', err);
                        if (callback)
                            callback();
                    });
                }

                function startBackgroundService() {
                    if (!_this.newPostTimerChecker) {
                        console.info('Start background for new posts availability');
                        _this.newPostTimerChecker = setInterval(function () {
                            console.info('Background service check for new posts or comments.....');
                            checkNewPostsAvailability();
                        }, 10000);
                    }
                }

                function checkNewPostsAvailability() {
                    if($rootScope.postBusy)
                        return;

                    console.log('getPosts called');
                    var postDataObject = {};
                    postDataObject.id = '1';
                    postDataObject.method = 'thread/findByPage';
                    postDataObject.params = {};
                    postDataObject.params.appId = _this.socialAppId;
                    postDataObject.params.parentThreadId = _this.parentThreadId;
                    postDataObject.params.lastThreadId = null;
                    postDataObject.userToken = null;
                    console.log('Post data in services-------------------', postDataObject);
                    $http({
                        method: 'GET',
                        url: Util.getProxyServerUrl(),
                        params: {data: postDataObject},
                        headers: {'Content-Type': 'application/json'},
                        silent:true
                    }).then(function (response) {
                        var _newPostsAvailable = false;
                        if (response
                            && response.data
                            && response.data.result
                            && response.data.result.length) {
                            if (_this.items.length == 0 || response.data.result[0]._id != _this.items[0]._id) {
                                _newPostsAvailable = true;
                            }
                        }

                        _this.newPostAvailable = _newPostsAvailable;

                    }, function (err) {

                    });
                }

                function checkNewCommentsAvailability(threadId) {
                    //todo this not used now until we fix comments api to get the news comments instead of the oldest
                    //if side thread is active
                    var posts = _this.items.filter(function (el) {
                        return el.uniqueLink == threadId;
                    });

                    var post = posts[0] || {};
                    SocialDataStore.getCommentsOfAPost({
                        threadId: post._id,
                        lastCommentId: null,
                        userToken: null,
                        appId: _this.socialAppId
                    }).then(function (response) {
                        var _newCommentsAvailable = false;
                        if (response
                            && response.data
                            && response.data.result
                            && response.data.result.length) {
                            if (_this.comments.length == 0 ||
                                response.data.result[response.data.result.length - 1]._id != _this.comments[_this.comments.length - 1]._id) {
                                _newCommentsAvailable = true;
                            }
                        }

                        _this.newCommentsAvailable = _newCommentsAvailable;
                    }, function (err) {
                        console.log('Error while logging in user is: ', err);
                    });
                }
            };

            SocialItems.prototype.loggedInUserDetails = function (callback) {
                Buildfire.datastore.get('Social', function (err, data) {
                    if (err) {
                        if (callback)
                            callback(err, null);
                    }
                    console.log('Get------------data--------datastore--------', err, data);
                    _this.socialAppId = data && data.data && data.data.socialAppId;
                    _this.parentThreadId = data && data.data && data.data.parentThreadId;
                    _this.appSettings = data && data.data && data.data.appSettings;
                    Buildfire.auth.getCurrentUser(function (err, userData) {
                        console.info('Current Logged In user details are -----------------', userData);

                        if (userData) {
                            _this.userDetails.userToken = userData.userToken;
                            _this.userDetails.userId = userData._id;
                            _this.userDetails.userTags = userData.tags;

                            var postDataObject = {};
                            postDataObject.id = '1';
                            postDataObject.method = 'users/getUserSettings';
                            postDataObject.params = {};
                            postDataObject.params.appId = _this.socialAppId;
                            postDataObject.params.threadId = _this.parentThreadId;
                            postDataObject.params.userId = _this.userDetails.userId || null;
                            postDataObject.params.userToken = _this.userDetails.userToken || null;
                            $http({
                                method: 'GET',
                                url: Util.getProxyServerUrl(),
                                params: {data: postDataObject},
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

                        if (callback)
                            callback(err, userData);
                    });
                });
            };

            SocialItems.prototype.checkPostsCalled = function () {
                return _this.postMehodCalledFlag && (_this.items.length > 0);
            };

            SocialItems.prototype.init = function () {
                _this.lastThreadId = null;
                _this.items = [];
                _this.busy = false;
                _this.newPostAvailable = false;
                _this.comments = [];
                _this.newCommentsAvailable = false;
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
