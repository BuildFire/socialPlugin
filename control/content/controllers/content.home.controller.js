'use strict';

(function (angular) {
    angular
        .module('socialPluginContent')
        .controller('ContentHomeCtrl', ['$scope', 'SocialDataStore', 'Modals', 'Buildfire', function ($scope, SocialDataStore, Modals, Buildfire) {
            console.log('Buildfire content--------------------------------------------- controller loaded');
            var ContentHome = this;
            var usersData = [];
            var userIds = [];
            var initialCommentsLength;
            ContentHome.postText = '';
            ContentHome.posts = [];

            var init = function () {
                ContentHome.height = window.innerHeight;
                ContentHome.noMore = false;
            };
            init();

            // Method for getting posts and its detail using SocialDataStrore methods
            ContentHome.getPosts = function () {
                console.log('Get post method called--in----- content--------------');
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

                    response.data.result.forEach(function (postData) {
                        if (userIds.indexOf(postData.userId.toString()) == -1)
                            userIds.push(postData.userId.toString());
                        ContentHome.posts.push(postData);
                    });
                    // Called when getting success from SocialDataStore getUsers method
                    var successCallback = function (response) {
                        console.info('Users fetching response is: ', response.data.result);
                        if (response.data.error) {
                            console.error('Error while creating post ', response.data.error);
                        } else if (response.data.result) {
                            console.info('Users fetched successfully', response.data.result);
                            usersData = response.data.result;
                        }
                    };
                    // Called when getting error from SocialDataStore getUsers method
                    var errorCallback = function (err) {
                        console.log('Error while fetching users details ', err);
                    };
                    // Getting users details of posts
                    SocialDataStore.getUsers(userIds).then(successCallback, errorCallback);
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
                SocialDataStore.getPosts({lastThreadId: lastThreadId}).then(success, error);
            };

            // Method for getting User Name by giving userId as its argument
            ContentHome.getUserName = function (userId) {
                var userName = '';
                usersData.some(function (userData) {
                    if (userData.userObject._id == userId) {
                        userName = userData.userObject.displayName || '';
                        return true;
                    }
                });
                return userName;
            };

            //Method for getting User Image by giving userId as its argument
            ContentHome.getUserImage = function (userId) {
                var userImageUrl = '';
                usersData.some(function (userData) {
                    if (userData.userObject._id == userId) {
                        userImageUrl = userData.userObject.imageUrl || '';
                        return true;
                    }
                });
                return userImageUrl;
            };

            // Method for deleting post using SocialDataStore deletePost method
            ContentHome.deletePost = function (postId) {
                Modals.removePopupModal({name:'Post'}).then(function (data) {
                    // Deleting post having id as postId
                    SocialDataStore.deletePost(postId).then(success, error);
                }, function (err) {
                    console.log('Error is: ', err);
                });
                console.log('delete post method called');
                // Called when getting success from SocialDataStore.deletePost method
                var success = function (response) {
                    console.log('inside success of delete post', response);
                    if (response.data.result) {
                        Buildfire.messaging.sendMessageToWidget({'name': 'POST_DELETED', '_id': postId});
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
                Modals.removePopupModal({name:'Comment'}).then(function (data) {
                    // Deleting post having id as postId
                    SocialDataStore.deleteComment(commentId, post._id).then(success, error);
                }, function (err) {
                    console.log('Error is: ', err);
                });
                console.log('delete comment method called');
                // Called when getting success from SocialDataStore.deletePost method
                var success = function (response) {
                    console.log('inside success of delete comment', response);
                    if (response.data.result) {
                        Buildfire.messaging.sendMessageToWidget({'name': 'COMMENT_DELETED', '_id': commentId});
                        console.log('comment successfully deleted');
                        post.commentsCount--;
                        if(post.commentsCount < 1) {
                            post.viewComments = false;
                        }
                        post.comments = post.comments.filter(function (el) {
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
                            Buildfire.messaging.sendMessageToWidget({'name': 'BAN_USER', '_id': userId});
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
                        SocialDataStore.banUser(userId, threadId).then(success, error);
                    }
                }, function (err) {
                    console.log('Error is: ', err);
                });
            };

            // Method for loading comments
            ContentHome.loadMoreComments = function (thread, viewComment) {
                initialCommentsLength = (thread.comments && thread.comments.length) || null;
                if (viewComment && viewComment == 'viewComment' && thread.commentsCount > 0)
                    thread.viewComments = thread.viewComments ? false : true;
                SocialDataStore.getCommentsOfAPost({
                    threadId: thread._id,
                    lastCommentId: thread.comments ? thread.comments[thread.comments.length - 1]._id : null
                }).then(
                    function (data) {
                        console.log('Success in Conrtent get Load more Comments---------', data);
                        if (data && data.data && data.data.result) {
                            thread.comments = thread.comments ? thread.comments.concat(data.data.result) : data.data.result;
                            thread.moreComments = thread.comments && (thread.comments.length > initialCommentsLength) ? false : true;
                            if (!$scope.$$phase)$scope.$digest();
                        }
                    },
                    function (err) {
                        console.log('Error get Load More Comments----------', err);
                    }
                );
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
        }]);
})(window.angular);

