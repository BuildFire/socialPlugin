describe('Unit : Controller - ContentHomeCtrl', function () {

// load the controller's module

    var ContentHome, scope, Modals, SocialDataStore, $timeout, $q, Buildfire, EVENTS;

    beforeEach(module('socialPluginContent'));

    beforeEach(inject(function ($controller, _$rootScope_, _Modals_, _$timeout_, _$q_) {
            scope = _$rootScope_.$new();
            Modals = jasmine.createSpyObj('Modals',['removePopupModal','open']);
            SocialDataStore = jasmine.createSpyObj('SocialDataStore',['getPosts','getUsers','deletePost','deleteComment']);
            $timeout = _$timeout_;
            $q = _$q_;
            ContentHome = $controller('ContentHomeCtrl', {
                $scope: scope,
                Modals: Modals,
                SocialDataStore: SocialDataStore
            });
        }));

   describe('Units: units should be Defined', function () {
        it('it should pass if ContentHome is defined', function () {
            expect(ContentHome).not.toBeUndefined();
        });
        it('it should pass if Modals is defined', function () {
            expect(Modals).not.toBeUndefined();
        });
        it('it should pass if SocialDataStore is defined', function () {
            expect(SocialDataStore).not.toBeUndefined();
        });
    });

    describe('ContentHome.getPosts', function () {
        describe('Should pass when SocialDataStore.getPosts and SocialDataStore.getUsers return success', function () {
            beforeEach(function(){
                SocialDataStore.getPosts.and.callFake(function () {
                    var deferred = $q.defer();
                    deferred.resolve({data: {result: [{_id: 2, userId: 0}]}});
                    return deferred.promise;
                });
                SocialDataStore.getUsers.and.callFake(function () {
                    var deferred = $q.defer();
                    deferred.resolve({data: {result: []}});
                    return deferred.promise;
                });
            });

            it('when ContentHome.posts.length>0 ', function () {
            ContentHome.posts = [{_id: 3, userId: 15}];
            ContentHome.getPosts();
            scope.$digest();
            expect(ContentHome.posts.length).toBeGreaterThan(0);
            });
            it('when ContentHome.posts.length=0 ', function () {
            ContentHome.posts = [];
            ContentHome.getPosts();
            scope.$digest();
            expect(ContentHome.posts.length).toBeGreaterThan(0);
        });
        });

        it('it should pass if SocialDataStore.getPosts return success and SocialDataStore.getUsers returns result.error', function () {
            ContentHome.posts = [];
            SocialDataStore.getPosts.and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({data: {result: [{_id: 2, userId: 0}]}});
                return deferred.promise;
            });
            SocialDataStore.getUsers.and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({data: {error: []}});
                return deferred.promise;
            });
            ContentHome.getPosts();
            scope.$digest();
            expect(ContentHome.posts.length).toBeGreaterThan(0);
        });
        it('it should pass if SocialDataStore.getPosts return success and SocialDataStore.getUsers returns failure', function () {
            ContentHome.posts = [];
            SocialDataStore.getPosts.and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({data: {result: [{_id: 2, userId: 0}]}});
                return deferred.promise;
            });
            SocialDataStore.getUsers.and.callFake(function () {
                var deferred = $q.defer();
                deferred.reject('401, unauthorized');
                return deferred.promise;
            });
            ContentHome.getPosts();
            scope.$digest();
            expect(ContentHome.posts.length).toBeGreaterThan(0);
        });
        it('it should pass if SocialDataStore.getPosts returns result.error', function () {
            ContentHome.posts = [];
            SocialDataStore.getPosts.and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({data: {error: {}}});
                return deferred.promise;
            });

            ContentHome.getPosts();
            scope.$digest();
            expect(ContentHome.posts.length).toEqual(0);
        });
        it('it should pass if SocialDataStore.getPosts returns failure', function () {
            ContentHome.posts = [];
            SocialDataStore.getPosts.and.callFake(function () {
                var deferred = $q.defer();
                deferred.reject('401, unauthorized');
                return deferred.promise;
            });

            ContentHome.getPosts();
            scope.$digest();
            expect(ContentHome.posts.length).toEqual(0);
        });
    });

    describe('ContentHome.getUserName', function () {

        beforeEach(function(){
            SocialDataStore.getPosts.and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({data: {result: [{_id: 2, userId: 0}]}});
                return deferred.promise;
            });
            SocialDataStore.getUsers.and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({"data":{"id":"1","result":[{"_id":"55a8ce9adaf0ea9c2a000e59","userObject":{"_id":"55a8ce9adaf0ea9c2a000e59","createdOn":"2015-07-17T09:44:58.129Z","displayName":"Vini Sharma","email":"vineeta.sharma@tothenew.com","firstName":"Vini","imageUrl":"https://s3.amazonaws.com/Kaleo.DevBucket/upload_85afd72abba40258aa256409a01ed44b.jpg","lastName":"Sharma","loginProviderType":"KAuth","username":"vineeta.sharma@tothenew.com"}}]},"status":200,"config":{"method":"GET","transformRequest":[null],"transformResponse":[null],"url":"http://social.kaleoapps.com/src/server.js?data={\"id\":\"1\",\"method\":\"users/getUsers\",\"params\":{\"userIds\":[\"55a8ce9adaf0ea9c2a000e59\"]},\"userToken\":null}","headers":{"Accept":"application/json, text/plain, */*"}},"statusText":"OK"});
                return deferred.promise;
            });

            ContentHome.posts = [{_id: 3, userId: 15}];
            ContentHome.getPosts();
            scope.$digest();

        });

        it('ContentHome.getUserName test empty name',function(){
            console.log(ContentHome);
            var username=ContentHome.getUserName(12121212);
            scope.$digest();
            expect(username).toEqual('');
        });

        it('ContentHome.getUserName test non empty name',function(){


            var username=ContentHome.getUserName('55a8ce9adaf0ea9c2a000e59');
            scope.$digest();
            expect(username).toEqual('Vini Sharma');
        })

    });

    describe('ContentHome.getUserImage', function () {

        beforeEach(function(){
            SocialDataStore.getPosts.and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({data: {result: [{_id: 2, userId: 0}]}});
                return deferred.promise;
            });
            SocialDataStore.getUsers.and.callFake(function () {
                var deferred = $q.defer();
            ContentHome.getPosts();
                deferred.resolve({"data":{"id":"1","result":[{"_id":"55a8ce9adaf0ea9c2a000e59","userObject":{"_id":"55a8ce9adaf0ea9c2a000e59","createdOn":"2015-07-17T09:44:58.129Z","displayName":"Vini Sharma","email":"vineeta.sharma@tothenew.com","firstName":"Vini","imageUrl":"https://s3.amazonaws.com/Kaleo.DevBucket/upload_85afd72abba40258aa256409a01ed44b.jpg","lastName":"Sharma","loginProviderType":"KAuth","username":"vineeta.sharma@tothenew.com"}}]},"status":200,"config":{"method":"GET","transformRequest":[null],"transformResponse":[null],"url":"http://social.kaleoapps.com/src/server.js?data={\"id\":\"1\",\"method\":\"users/getUsers\",\"params\":{\"userIds\":[\"55a8ce9adaf0ea9c2a000e59\"]},\"userToken\":null}","headers":{"Accept":"application/json, text/plain, */*"}},"statusText":"OK"});
                return deferred.promise;
            });

            ContentHome.posts = [{_id: 3, userId: 15}];
            scope.$digest();

        });

        it('ContentHome.getUserImage test empty name',function(){
            console.log(ContentHome);
            var userImageUrl=ContentHome.getUserImage(12121212);
            scope.$digest();
            expect(userImageUrl).toEqual('');
        });

        it('ContentHome.getUserImage test non empty name',function(){


            var userImageUrl=ContentHome.getUserImage('55a8ce9adaf0ea9c2a000e59');
            scope.$digest();
            expect(userImageUrl).toEqual('https://s3.amazonaws.com/Kaleo.DevBucket/upload_85afd72abba40258aa256409a01ed44b.jpg');
        })

    });

    describe('ContentHome.deletePost', function () {



        describe('ContentHome.deletePost Modal success SocialDatastore Success',function(){
            beforeEach(function(){

                Modals.removePopupModal.and.callFake(function () {
                    console.log('-------------------------------->');
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                });

                SocialDataStore.deletePost.and.callFake(function () {
                    var deferred = $q.defer();
                    deferred.resolve({"data":{"id":"1","result":[{"_id":"55a8ce9adaf0ea9c2a000e59","userObject":{"_id":"55a8ce9adaf0ea9c2a000e59","createdOn":"2015-07-17T09:44:58.129Z","displayName":"Vini Sharma","email":"vineeta.sharma@tothenew.com","firstName":"Vini","imageUrl":"https://s3.amazonaws.com/Kaleo.DevBucket/upload_85afd72abba40258aa256409a01ed44b.jpg","lastName":"Sharma","loginProviderType":"KAuth","username":"vineeta.sharma@tothenew.com"}}]},"status":200,"config":{"method":"GET","transformRequest":[null],"transformResponse":[null],"url":"http://social.kaleoapps.com/src/server.js?data={\"id\":\"1\",\"method\":\"users/getUsers\",\"params\":{\"userIds\":[\"55a8ce9adaf0ea9c2a000e59\"]},\"userToken\":null}","headers":{"Accept":"application/json, text/plain, */*"}},"statusText":"OK"});
                    return deferred.promise;
                });

            });

            it('it should pass if SocialDataStore.deletePost deletes the given post and returns 0', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deletePost(1);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(0);
            });

            it('it should pass if SocialDataStore.deletePost deletes the given post and returns nothing to delete', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deletePost(2);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

        })
        describe('ContentHome.deletePost Modal success SocialDatastore failure',function(){
            beforeEach(function(){

                Modals.removePopupModal.and.callFake(function () {
                    console.log('-------------------------------->');
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                });

                SocialDataStore.deletePost.and.callFake(function () {
                    var deferred = $q.defer();
                    deferred.reject({"data":{"id":"1","result":[{"_id":"55a8ce9adaf0ea9c2a000e59","userObject":{"_id":"55a8ce9adaf0ea9c2a000e59","createdOn":"2015-07-17T09:44:58.129Z","displayName":"Vini Sharma","email":"vineeta.sharma@tothenew.com","firstName":"Vini","imageUrl":"https://s3.amazonaws.com/Kaleo.DevBucket/upload_85afd72abba40258aa256409a01ed44b.jpg","lastName":"Sharma","loginProviderType":"KAuth","username":"vineeta.sharma@tothenew.com"}}]},"status":200,"config":{"method":"GET","transformRequest":[null],"transformResponse":[null],"url":"http://social.kaleoapps.com/src/server.js?data={\"id\":\"1\",\"method\":\"users/getUsers\",\"params\":{\"userIds\":[\"55a8ce9adaf0ea9c2a000e59\"]},\"userToken\":null}","headers":{"Accept":"application/json, text/plain, */*"}},"statusText":"OK"});
                    return deferred.promise;
                });

            });

            it('it should pass if SocialDataStore.deletePost deletes the given post and returns 0', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deletePost(1);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

            it('it should pass if SocialDataStore.deletePost deletes the given post and returns nothing to delete', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deletePost(2);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

        })
        describe('ContentHome.deletePost Modal failure SocialDatastore success',function(){
            beforeEach(function(){

                Modals.removePopupModal.and.callFake(function () {
                    console.log('-------------------------------->');
                    var deferred = $q.defer();
                    deferred.reject();
                    return deferred.promise;
                });

                SocialDataStore.deletePost.and.callFake(function () {
                    var deferred = $q.defer();
                    deferred.resolve({"data":{"id":"1","result":[{"_id":"55a8ce9adaf0ea9c2a000e59","userObject":{"_id":"55a8ce9adaf0ea9c2a000e59","createdOn":"2015-07-17T09:44:58.129Z","displayName":"Vini Sharma","email":"vineeta.sharma@tothenew.com","firstName":"Vini","imageUrl":"https://s3.amazonaws.com/Kaleo.DevBucket/upload_85afd72abba40258aa256409a01ed44b.jpg","lastName":"Sharma","loginProviderType":"KAuth","username":"vineeta.sharma@tothenew.com"}}]},"status":200,"config":{"method":"GET","transformRequest":[null],"transformResponse":[null],"url":"http://social.kaleoapps.com/src/server.js?data={\"id\":\"1\",\"method\":\"users/getUsers\",\"params\":{\"userIds\":[\"55a8ce9adaf0ea9c2a000e59\"]},\"userToken\":null}","headers":{"Accept":"application/json, text/plain, */*"}},"statusText":"OK"});
                    return deferred.promise;
                });

            });

            it('it should pass if SocialDataStore.deletePost deletes the given post and returns 0', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deletePost(1);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

            it('it should pass if SocialDataStore.deletePost deletes the given post and returns nothing to delete', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deletePost(2);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

        })
        describe('ContentHome.deletePost Modal failure SocialDatastore failure',function(){
            beforeEach(function(){

                Modals.removePopupModal.and.callFake(function () {
                    console.log('-------------------------------->');
                    var deferred = $q.defer();
                    deferred.reject();
                    return deferred.promise;
                });

                SocialDataStore.deletePost.and.callFake(function () {
                    var deferred = $q.defer();
                    deferred.reject({"data":{"id":"1","result":[{"_id":"55a8ce9adaf0ea9c2a000e59","userObject":{"_id":"55a8ce9adaf0ea9c2a000e59","createdOn":"2015-07-17T09:44:58.129Z","displayName":"Vini Sharma","email":"vineeta.sharma@tothenew.com","firstName":"Vini","imageUrl":"https://s3.amazonaws.com/Kaleo.DevBucket/upload_85afd72abba40258aa256409a01ed44b.jpg","lastName":"Sharma","loginProviderType":"KAuth","username":"vineeta.sharma@tothenew.com"}}]},"status":200,"config":{"method":"GET","transformRequest":[null],"transformResponse":[null],"url":"http://social.kaleoapps.com/src/server.js?data={\"id\":\"1\",\"method\":\"users/getUsers\",\"params\":{\"userIds\":[\"55a8ce9adaf0ea9c2a000e59\"]},\"userToken\":null}","headers":{"Accept":"application/json, text/plain, */*"}},"statusText":"OK"});
                    return deferred.promise;
                });

            });

            it('it should pass if SocialDataStore.deletePost deletes the given post and returns 0', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deletePost(1);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

            it('it should pass if SocialDataStore.deletePost deletes the given post and returns nothing to delete', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deletePost(2);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

        })
    });

    describe('ContentHome.deleteComment', function () {

        describe('ContentHome.deleteComment Modal success SocialDatastore Success',function(){
            beforeEach(function(){

                Modals.removePopupModal.and.callFake(function () {
                    console.log('-------------------------------->');
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                });

                SocialDataStore.deleteComment.and.callFake(function () {
                    var deferred = $q.defer();
                    deferred.resolve({"data":{"id":"1","result":[{"_id":"568659cdbb77afac29000251","appId":"567a4b04df473cfc2b000068","threadId":"568658312cd9df90090000eb","comment":"sdfsdfsd","deletedOn":null,"deletedBy":null,"attachedImage":null,"userId":"55a8ce9adaf0ea9c2a000e59","createdOn":"2016-01-01T10:49:49.883Z","lastUpdated":"2016-01-01T10:49:49.883Z"},{"_id":"56883842af956cfc19000081","appId":"567a4b04df473cfc2b000068","threadId":"568658312cd9df90090000eb","comment":"dsfsdfsd","deletedOn":null,"deletedBy":null,"attachedImage":null,"userId":"55a8ce9adaf0ea9c2a000e59","createdOn":"2016-01-02T20:51:14.764Z","lastUpdated":"2016-01-02T20:51:14.764Z"}]},"status":200,"config":{"method":"GET","transformRequest":[null],"transformResponse":[null],"url":"http://social.kaleoapps.com/src/server.js?data={\"id\":\"1\",\"method\":\"threadComments/findByPage\",\"params\":{\"appId\":\"567a4b04df473cfc2b000068\",\"threadId\":\"568658312cd9df90090000eb\",\"lastCommentId\":null},\"userToken\":null}","headers":{"Accept":"application/json, text/plain, */*"}},"statusText":"OK"});
                    return deferred.promise;
                });

            });

            it('it should pass if SocialDataStore.deletePost deletes the given post and returns 0', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deleteComment(1);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

            xit('it should pass if SocialDataStore.deletePost deletes the given post and returns nothing to delete', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deletePost(2);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

        })
        describe('ContentHome.deleteComment Modal failure SocialDatastore Success',function(){
            beforeEach(function(){

                Modals.removePopupModal.and.callFake(function () {
                    console.log('-------------------------------->');
                    var deferred = $q.defer();
                    deferred.reject();
                    return deferred.promise;
                });

                SocialDataStore.deleteComment.and.callFake(function () {
                    var deferred = $q.defer();
                    deferred.resolve({"data":{"id":"1","result":[{"_id":"568659cdbb77afac29000251","appId":"567a4b04df473cfc2b000068","threadId":"568658312cd9df90090000eb","comment":"sdfsdfsd","deletedOn":null,"deletedBy":null,"attachedImage":null,"userId":"55a8ce9adaf0ea9c2a000e59","createdOn":"2016-01-01T10:49:49.883Z","lastUpdated":"2016-01-01T10:49:49.883Z"},{"_id":"56883842af956cfc19000081","appId":"567a4b04df473cfc2b000068","threadId":"568658312cd9df90090000eb","comment":"dsfsdfsd","deletedOn":null,"deletedBy":null,"attachedImage":null,"userId":"55a8ce9adaf0ea9c2a000e59","createdOn":"2016-01-02T20:51:14.764Z","lastUpdated":"2016-01-02T20:51:14.764Z"}]},"status":200,"config":{"method":"GET","transformRequest":[null],"transformResponse":[null],"url":"http://social.kaleoapps.com/src/server.js?data={\"id\":\"1\",\"method\":\"threadComments/findByPage\",\"params\":{\"appId\":\"567a4b04df473cfc2b000068\",\"threadId\":\"568658312cd9df90090000eb\",\"lastCommentId\":null},\"userToken\":null}","headers":{"Accept":"application/json, text/plain, */*"}},"statusText":"OK"});
                    return deferred.promise;
                });

            });

            it('it should pass if SocialDataStore.deletePost deletes the given post and returns 0', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deleteComment(1);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

            xit('it should pass if SocialDataStore.deletePost deletes the given post and returns nothing to delete', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deletePost(2);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

        })
        describe('ContentHome.deleteComment Modal success SocialDatastore failure',function(){-
            beforeEach(function(){

                Modals.removePopupModal.and.callFake(function () {
                    console.log('-------------------------------->');
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                });

                SocialDataStore.deleteComment.and.callFake(function () {
                    var deferred = $q.defer();
                    deferred.reject();
                    return deferred.promise;
                });

            });

            it('it should pass if SocialDataStore.deleteComments the given post and returns 0', function () {

                ContentHome.posts = [{_id: 1}];
                ContentHome.deleteComment(1);
                scope.$digest();


                expect(ContentHome.posts.length).toEqual(1);
            });

        })

    });

    xdescribe('ContentHome.banUser', function () {
        var spy1;
        beforeEach(inject(function () {
            spy1 = spyOn(Modals,'banPopupModal').and.callFake(function () {
                console.log(2);
                var deferred = $q.defer();
                deferred.resolve('');
                return deferred.promise;
            });

        }));

        it('it should pass if it calls Modals.banPopupModal', function () {
            //ContentHome.posts = [{_id: 1}];

            ContentHome.banUser(1,1);
            expect(spy1).toHaveBeenCalled();
        });
    });

    xdescribe('ContentHome.loadMoreComments', function () {

        var spy1;
        beforeEach(inject(function () {
            spy1 = spyOn(SocialDataStore,'getCommentsOfAPost').and.callFake(function () {
                console.log(2);
                var deferred = $q.defer();
                deferred.resolve('');
                return deferred.promise;
            });

        }));

        it('it should pass if SocialDataStore.getPosts is called with null when ContentHome.posts is empty', function () {
            //ContentHome.posts = [{_id: 1}];
            var a = {commentsCount:0};
            ContentHome.loadMoreComments(a,'viewComment');
            expect(a.comments).toBeDefined();
        });
    });

    xdescribe('ContentHome.seeMore', function () {
        it('it should pass if makes seeMore true of the passed argument post', function () {
            //ContentHome.posts = [{_id: 1}];
            var a = {seeMore:false};
            ContentHome.seeMore(a);
            expect(a.seeMore).toBeTruthy();
        });
    });
});