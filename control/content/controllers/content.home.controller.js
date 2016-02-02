'use strict';

(function (angular) {
    angular
        .module('socialPluginContent')
        .controller('ContentHomeCtrl', ['$scope', 'SocialDataStore', 'Modals', 'Buildfire', 'EVENTS', function ($scope, SocialDataStore, Modals, Buildfire, EVENTS) {
            console.log('Buildfire content--------------------------------------------- controller loaded');
            var ContentHome = this;
            ContentHome.usersData = [];
            var userIds = [];
            var initialCommentsLength;
            ContentHome.postText = '';
            ContentHome.posts = [];
            ContentHome.socialAppId;
            ContentHome.parentThreadId;
            var datastoreWriteKey;
            var instanceId;
            var init = function () {
                Buildfire.getContext(function(err,context){
                    datastoreWriteKey=context.datastoreWriteKey;
                });
                Buildfire.datastore.get('Social',function(err,data){
                    console.log('Get data in content section socail App Id------------------',err,data);
                    if(data && data.data && data.data.socialAppId){
                        ContentHome.socialAppId=data.data.socialAppId;
                        ContentHome.parentThreadId=data.data.parentThreadId;
                        $scope.$digest();
                        console.log('Content------------------------social App id, parent id',ContentHome.socialAppId,ContentHome.parentThreadId);
                    }
                    else{
                        Buildfire.getContext(function (err, context) {
                            if (err) {
                                console.error("Error occurred while getting buildfire context");
                            } else {
                                console.log('buildfire get context response::: ', context);
                                instanceId = context && context.instanceId;
                                SocialDataStore.addApplication(context.appId, context.datastoreWriteKey).then(function (response) {
                                    if (response && response.data && response.data.result) {
                                        console.log('application successfully added:::::-------------------------- ', response);
                                        ContentHome.socialAppId = response.data.result;
                                        SocialDataStore.getThreadByUniqueLink(ContentHome.socialAppId,context).then(
                                            function(parentThreadRes){
                                                console.log('Parent ThreadId -------success----',parentThreadRes);
                                                if(parentThreadRes && parentThreadRes.data && parentThreadRes.data.result && parentThreadRes.data.result._id){
                                                    ContentHome.parentThreadId=parentThreadRes.data.result._id;
                                                    Buildfire.datastore.insert({socialAppId:response.data.result,parentThreadId:parentThreadRes.data.result._id},'Social',false,function(err,data){
                                                        console.log('Data saved using datastore-------------',err,data);
                                                    });
                                                }
                                            },
                                            function(error){
                                                console.log('Parent thread callback error------',error);
                                            }
                                        );
                                    }
                                }, function (err) {
                                    console.error("Error add application api is: ", err);
                                });
                            }
                        });
                    }
                });

                ContentHome.height = window.innerHeight;
                ContentHome.noMore = false;
                console.log('inside init method of content controller:::::::: ');
                /*Buildfire.auth.getCurrentUser(function (err, userData) {
                    if(userData) {

                    }
                });*/
            };
            init();

            // Method for getting posts and its detail using SocialDataStrore methods
            ContentHome.getPosts = function () {
                console.log('Get post method called--in----- content--------------');
                var newUserIds = [];
                ContentHome.noMore = true;
                var lastThreadId;
                // Called when getting success from SocialDataStore getPosts method
                var success = function (response) {
                    console.info('inside success of get posts and result inside content section is: ', response);
//                        ContentHome.posts = response.data.result;
                    if (response && response.data && response.data.result && response.data.result.length < 10) {
                        ContentHome.noMore = true;
                    }
                    else {
                        ContentHome.noMore = false;
                    }
                    if(response && response.data && response.data.result) {
                        response.data.result.forEach(function (postData) {
                            if (userIds.indexOf(postData.userId.toString()) == -1) {
                                userIds.push(postData.userId.toString());
                                newUserIds.push(postData.userId.toString());
                            }
                            ContentHome.posts.push(postData);
                        });
                        console.log('newUserIds::::::::::::::',newUserIds, userIds);
                        // Called when getting success from SocialDataStore getUsers method
                        var successCallback = function (response) {
                            console.info('Users fetching response is: ', response.data.result);
                            if (response.data.error) {
                                console.error('Error while creating post ', response.data.error);
                            } else if (response.data.result) {
                                console.info('Users fetched successfully', response.data.result);
                                ContentHome.usersData = ContentHome.usersData.concat(response.data.result);
                                console.log('ContentHome.usersData is:::::::::::',ContentHome.usersData);
                            }
                        };
                        // Called when getting error from SocialDataStore getUsers method
                        var errorCallback = function (err) {
                            console.log('Error while fetching users details ', err);
                        };
                        // Getting users details of posts
                        SocialDataStore.getUsers(newUserIds).then(successCallback, errorCallback);
                    } else if(response && response.data && response.data.error) {
                        console.log("error while getting posts:::::: ", response.data.error);
                    }
                };
                // Called when getting error from SocialDataStore getPosts method
                var error = function (err) {
                    console.error('Error while getting data inside content section is: ', err);
                };
                if (ContentHome.posts.length)
                    lastThreadId = ContentHome.posts[ContentHome.posts.length - 1]._id;
                else
                    lastThreadId = null;
                // Getting posts initially and on scroll down by passing lastThreadId
                SocialDataStore.getPosts({lastThreadId: lastThreadId, socialAppId: ContentHome.socialAppId, parentThreadId: ContentHome.parentThreadId}).then(success, error);
            };

            // Method for getting User Name by giving userId as its argument
            ContentHome.getUserName = function (userId) {
                var userName = '';
                ContentHome.usersData.some(function (userData) {
                    if (userData && userData.userObject && userData.userObject._id == userId) {
                        userName = userData.userObject.displayName || 'No Name';
                        return true;
                    }
                });
                return userName;
            };

            //Method for getting User Image by giving userId as its argument
            ContentHome.getUserImage = function (userId) {
                var userImageUrl = '';
                ContentHome.usersData.some(function (userData) {
                    if (userData && userData.userObject && userData.userObject._id == userId) {
                        userImageUrl = userData.userObject.imageUrl ? Buildfire.imageLib.cropImage(userData.userObject.imageUrl, {width:40,height:40}) : '';
                        return true;
                    }
                });
                return userImageUrl;
            };

            // Method for deleting post using SocialDataStore deletePost method
            ContentHome.deletePost = function (postId) {
                Modals.removePopupModal({name: 'Post'}).then(function (data) {
                    // Deleting post having id as postId
                    SocialDataStore.deletePost(postId, ContentHome.socialAppId,datastoreWriteKey).then(success, error);
                }, function (err) {
                    console.log('Error is: ', err);
                });
                console.log('delete post method called');
                // Called when getting success from SocialDataStore.deletePost method
                var success = function (response) {
                    console.log('inside success of delete post', response);
                    if (response.data.result) {
                        Buildfire.messaging.sendMessageToWidget({'name': EVENTS.POST_DELETED, '_id': postId});
                        console.log('post successfully deleted');
                        ContentHome.posts = ContentHome.posts.filter(function (el) {
                            return el._id != postId;
                        });
                        if (!$scope.$$phase)
                            $scope.$digest();
                    }
                };
                // Called when getting error from SocialDataStore.deletePost method
                var error = function (err) {
                    console.log('Error while deleting post ', err);
                };
            };

            // Method for deleting comments of a post
            ContentHome.deleteComment = function (post, commentId) {
                Modals.removePopupModal({name: 'Comment'}).then(function (data) {
                    // Deleting post having id as postId
                    SocialDataStore.deleteComment(commentId, post._id, ContentHome.socialAppId,datastoreWriteKey).then(success, error);
                }, function (err) {
                    console.log('Error is: ', err);
                });
                console.log('delete comment method called');
                // Called when getting success from SocialDataStore.deletePost method
                var success = function (response) {
                    console.log('inside success of delete comment', response);
                    if (response.data.result) {
                        Buildfire.messaging.sendMessageToWidget({
                            'name': EVENTS.COMMENT_DELETED,
                            '_id': commentId,
                            'postId': post._id
                        });
                        console.log('comment successfully deleted');
                        post.commentsCount--;
                        if (post.commentsCount < 1) {
                            post.viewComments = false;
                        }
                        post.comments = post && post.comments && post.comments.length && post.comments.filter(function (el) {
                            return el._id != commentId;
                        });
                        if (!$scope.$$phase)
                            $scope.$digest();
                    }
                };
                // Called when getting error from SocialDataStore.deletePost method
                var error = function (err) {
                    console.log('Error while deleting post ', err);
                };
            };

            // Method for banning a user by calling SocialDataStore banUser method
            ContentHome.banUser = function (userId, threadId) {
                console.log('inside ban user controller method>>>>>>>>>>');
                Modals.banPopupModal().then(function (data) {
                    if (data == 'yes') {
                        // Called when getting success from SocialDataStore banUser method
                        var success = function (response) {
                            console.log('User successfully banned and response is :', response);
                            Buildfire.messaging.sendMessageToWidget({'name': EVENTS.BAN_USER, '_id': userId});
                            ContentHome.posts = ContentHome.posts.filter(function (el) {
                                return el.userId != userId;
                            });
                            if (!$scope.$$phase)
                                $scope.$digest();
                        };
                        // Called when getting error from SocialDataStore banUser method
                        var error = function (err) {
                            console.log('Error while banning a user ', err);
                        };
                        // Calling SocialDataStore banUser method for banning a user
                        SocialDataStore.banUser(userId, threadId, ContentHome.socialAppId).then(success, error);
                    }
                }, function (err) {
                    console.log('Error is: ', err);
                });
            };

            // Method for loading comments
            ContentHome.loadMoreComments = function (thread, viewComment) {
                var newUniqueLinksOfComments = [];
                var newUserIds = [];
                initialCommentsLength = (thread.comments && thread.comments.length) || null;
                if (viewComment && viewComment == 'viewComment' && thread.commentsCount > 0)
                    thread.viewComments = thread.viewComments ? false : true;
                if (thread.commentsCount > 0 && thread.commentsCount != initialCommentsLength) {
                    SocialDataStore.getCommentsOfAPost({
                        threadId: thread._id,
                        lastCommentId: thread.comments && !viewComment ? thread.comments[thread.comments.length - 1]._id : null,
                        socialAppId: ContentHome.socialAppId
                    }).then(
                        function (data) {
                            console.log('Success in Content get Load more Comments---------', data);
                            if (data && data.data && data.data.result) {
                                thread.uniqueLinksOfComments = thread.uniqueLinksOfComments || [];
                                thread.comments = thread.comments && !viewComment ? thread.comments.concat(data.data.result) : data.data.result;
                                thread.moreComments = thread.comments && thread.comments.length < thread.commentsCount ? false : true;
                                thread.comments.forEach(function (commentData) {
                                    if(thread.uniqueLinksOfComments.indexOf(commentData.threadId + "cmt" + commentData._id) == -1) {
                                        thread.uniqueLinksOfComments.push(commentData.threadId + "cmt" + commentData._id);
                                        newUniqueLinksOfComments.push(commentData.threadId + "cmt" + commentData._id);
                                    }

                                    if (userIds.indexOf(commentData.userId) == -1) {
                                        userIds.push(commentData.userId);
                                        newUserIds.push(commentData.userId);
                                    }
                                });
                                console.log('newUniqueLinksOfComments are:::::::::', newUniqueLinksOfComments, thread.uniqueLinksOfComments);
                                getCommentsLikeAndUpdate(thread, newUniqueLinksOfComments);
                                if (newUserIds && newUserIds.length > 0) {
                                    SocialDataStore.getUsers(newUserIds).then(function (response) {
                                        console.info('Users fetching for comments and response is: ', response.data.result);
                                        if (response.data.error) {
                                            console.error('Error while fetching users for comments ', response.data.error);
                                        } else if (response.data.result) {
                                            console.info('Users fetched successfully for comments ', response.data.result);
                                            ContentHome.usersData = ContentHome.usersData.concat(response.data.result);
                                        }
                                    }, function (err) {
                                        console.log('Error while fetching users of comments inside thread page: ', err);
                                    });
                                }
                                if (!$scope.$$phase)$scope.$digest();
                            }
                        },
                        function (err) {
                            console.log('Error get Load More Comments----------', err);
                        }
                    );
                }
            };

            var getCommentsLikeAndUpdate = function (thread, uniqueLinksOfComments) {
                console.log('inside getCommentsLikeAndUpdate', thread, uniqueLinksOfComments);
                SocialDataStore.getThreadLikes(uniqueLinksOfComments, ContentHome.socialAppId).then(function (data) {
                        console.log('Response of a post comments like-----------------', data);
                        if(data && data.data && data.data.result && data.data.result.length){
                            console.log('In If------------------',data.data.result);
                            data.data.result.forEach(function (uniqueLinkData) {
                                thread.comments.some(function(comment){
                                    if(uniqueLinkData.uniqueLink==(comment.threadId+"cmt"+comment._id)){
                                        comment.likesCount=uniqueLinkData.likesCount;
                                        comment.isUserLikeActive=uniqueLinkData.isUserLikeActive;
                                        console.log('Updated comments data------------------',comment);
                                        return true;
                                    }
                                });
                            });
                        }
                    },
                    function (err) {
                        console.log('Response error of comment likes ------------', err);
                    });
            };

            ContentHome.seeMore = function (post) {
                post.seeMore = true;
                post.limit = 10000000;
                if (!$scope.$$phase)$scope.$digest();
            };

            // Method for getting Post's and Comment's creation time in User Readable Time Format
            ContentHome.getDuration = function (timestamp) {
                return moment(timestamp.toString()).fromNow();
            };

            Buildfire.messaging.onReceivedMessage = function (event) {
                console.log('Content syn called method in content.home.controller called-----', event);
                if (event) {
                    switch (event.name) {
                        case EVENTS.POST_CREATED :
                            if (event.post) {
                                ContentHome.posts.unshift(event.post);
                                // Called when getting success from SocialDataStore getUsers method
                                var successCallback = function (response) {
                                    console.info('Users fetching response is: ', response.data.result);
                                    if (response.data.error) {
                                        console.error('Error while creating post ', response.data.error);
                                    } else if (response.data.result && response.data.result.length > 0) {
                                        console.info('Users fetched successfully', response.data.result);
                                        ContentHome.usersData.push(response.data.result[0]);
                                        if (!$scope.$$phase)$scope.$digest();
                                    }
                                };
                                // Called when getting error from SocialDataStore getUsers method
                                var errorCallback = function (err) {
                                    console.log('Error while fetching users details ', err);
                                };
                                if (userIds.indexOf(event.post.userId) == -1) {
                                    userIds.push(event.post.userId);
                                    // Getting users details of posts
                                    SocialDataStore.getUsers([event.post.userId]).then(successCallback, errorCallback);
                                }
                            }
                           /* if (!$scope.$$phase)$scope.$digest();*/
                            break;
                        case EVENTS.POST_LIKED :
                            ContentHome.posts.some(function (el) {
                                if (el._id == event._id) {
                                    el.likesCount++;
                                    return true;
                                }
                            });
                           /* if (!$scope.$$phase)$scope.$digest();*/
                            break;
                        case EVENTS.POST_UNLIKED:
                            ContentHome.posts.some(function (el) {
                                if (el._id == event._id) {
                                    el.likesCount--;
                                    return true;
                                }
                            });
                            /*if (!$scope.$$phase)$scope.$digest();*/
                            break;
                        case EVENTS.COMMENT_ADDED:
                            ContentHome.posts.some(function (el) {
                                if (el._id == event._id) {
                                    el.commentsCount++;
                                    // Called when getting success from SocialDataStore getUsers method
                                    var successCallback = function (response) {
                                        console.info('Users fetching response inside add comments:  ', response.data.result);
                                        if (response.data.error) {
                                            console.error('Error while creating post ', response.data.error);
                                        } else if (response.data.result && response.data.result.length) {
                                            console.info('Users fetched successfully in comment added', response.data.result);
                                            ContentHome.usersData.push(response.data.result[0]);
                                        }
                                        if (!$scope.$$phase)$scope.$digest();
                                    };
                                    // Called when getting error from SocialDataStore getUsers method
                                    var errorCallback = function (err) {
                                        console.log('Error while fetching users details ', err);
                                    };
                                    console.log('userIds', userIds, event.userId);
                                    if (userIds.indexOf(event.userId) == -1) {
                                        userIds.push(event.userId);
                                        // Getting users details of posts
                                        SocialDataStore.getUsers([event.userId]).then(successCallback, errorCallback);
                                    }
                                    return true;
                                }
                            });
                            if (!$scope.$$phase)$scope.$digest();
                            break;
                        case EVENTS.POST_DELETED:
                            ContentHome.posts = ContentHome.posts.filter(function (el) {
                                return el._id != event._id;
                            });
                           /* if (!$scope.$$phase)$scope.$digest();*/
                            break;
                        case EVENTS.COMMENT_DELETED:
                            ContentHome.posts.some(function (el) {
                                if (el._id == event.postId && el.comments) {
                                    el.commentsCount--;
                                    el.comments = el.comments.filter(function (comment) {
                                        return comment._id != event._id;
                                    });
                                    return true;
                                }
                            });
                           /* if (!$scope.$$phase)
                                $scope.$digest();*/
                            break;
                        case EVENTS.COMMENT_UNLIKED:
                            ContentHome.posts.some(function (el) {
                                if(el._id == event.postId) {
                                    if(el.comments && el.comments.length)
                                    el.comments.some(function (commentData) {
                                        if(commentData._id == event._id) {
                                            commentData.likesCount = commentData.likesCount > 0 ? commentData.likesCount-- : 0;
                                            return true;
                                        }
                                    });
                                    return true;
                                }
                            });
                           /* if (!$scope.$$phase)
                                $scope.$digest();*/
                            break;
                        case EVENTS.COMMENT_LIKED:
                            console.log('comment liked in content home controller event called from widget thread page');
                            ContentHome.posts.some(function (el) {
                                if(el._id == event.postId) {
                                    if(el.comments && el.comments.length)
                                     el.comments.some(function (commentData) {
                                        if(commentData._id == event._id) {
                                            commentData.likesCount++;
                                            return true;
                                        }
                                    });
                                    return true;
                                }
                            });
                            /*if (!$scope.$$phase)
                                $scope.$digest();*/
                            break;
                        default :
                            break;
                    }
                    if (!$scope.$$phase)
                        $scope.$digest();
                }
            };
        }]);
})(window.angular);

