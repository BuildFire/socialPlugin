describe('Unit : Controller - ContentHomeCtrl', function () {

// load the controller's module

    var ContentHome, scope, Modals, SocialDataStore, $timeout, $q, Buildfire, EVENTS;

    beforeEach(module('socialPluginContent'));

    beforeEach(inject(function ($controller, _$rootScope_, _Modals_, _$timeout_, _$q_) {
            scope = _$rootScope_.$new();
            Modals = jasmine.createSpyObj('Modals',['removePopupModal']);
            SocialDataStore = jasmine.createSpyObj('SocialDataStore',['getPosts','getUsers']);
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

    xdescribe('ContentHome.getUserName', function () {
        var username=ContentHome.getUserName(12121212);
        scope.$digest();
        expect(username).toEqual('');

    });

    xdescribe('ContentHome.deletePost', function () {

        var spy1, spySocial;
       /* beforeEach(inject(function () {
            spy1 = spyOn(Modals, 'removePopupModal').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({name: 'Post'});
                return deferred.promise;
            });
            spySocial = spyOn(SocialDataStore, 'deletePost').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({data: {result: [{_id: 2, userId: 0}]}});
                return deferred.promise;
            });
        }));*/

        it('it should pass if SocialDataStore.deletePost deletes the given post', function () {
            Modals.removePopupModal({name: 'Post'});
            ContentHome.posts = [{_id: 1}];
            ContentHome.deletePost(1);
            expect(ContentHome.posts.length).toEqual(0);
        });
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

    describe('ContentHome.seeMore', function () {
        it('it should pass if makes seeMore true of the passed argument post', function () {
            //ContentHome.posts = [{_id: 1}];
            var a = {seeMore:false};
            ContentHome.seeMore(a);
            expect(a.seeMore).toBeTruthy();
        });
    });
});