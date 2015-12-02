describe('Unit : Controller - ContentHomeCtrl', function () {

// load the controller's module
    beforeEach(module('socialPluginContent'));

    var
        ContentHome, scope, Modals, SocialDataStore, $timeout, $q;

    beforeEach(inject(function ($controller, _$rootScope_, _Modals_, _SocialDataStore_, _$timeout_, _$q_) {
            scope = _$rootScope_.$new();
            Modals = _Modals_;
            SocialDataStore = _SocialDataStore_;
            $timeout = _$timeout_;
            $q = _$q_;
            ContentHome = $controller('ContentHomeCtrl', {
                $scope: scope,
                Modals: Modals,
                SocialDataStore: SocialDataStore
            });
        })
    )
    ;

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

        var spy;
        beforeEach(inject(function () {
            spy = spyOn(SocialDataStore, 'getPosts').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({data: {result: [{_id: 2, userId: 0}]}});
                return deferred.promise;
            });
        }));

        it('it should pass if SocialDataStore.getPosts is called with null when ContentHome.posts is empty', function () {
            ContentHome.posts = [];
            ContentHome.getPosts();
            expect(spy).toHaveBeenCalledWith({lastThreadId: null});
        });

        it('it should pass if SocialDataStore.getPosts is called with last element id when ContentHome.posts is not empty', function () {
            ContentHome.posts = [{_id: 1}];
            ContentHome.getPosts();
            expect(spy).toHaveBeenCalledWith({lastThreadId: 1});
        });

        xit('it should pass if SocialDataStore.getPosts adds to ContentHome.posts in case of success', function () {
            ContentHome.posts = [{_id: 1}];
            ContentHome.getPosts();
            expect(ContentHome.posts.length).toEqual(2);
        });
    });

    describe('ContentHome.deletePost', function () {

        var spy1, spySocial;
        beforeEach(inject(function () {
            spy1 = spyOn(Modals, 'removePopupModal').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('');
                return deferred.promise;
            });
            spySocial = spyOn(SocialDataStore, 'deletePost').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve({data: {result: [{_id: 2, userId: 0}]}});
                return deferred.promise;
            });
        }));

        it('it should pass if SocialDataStore.deletePost deletes the given post', function () {
            ContentHome.posts = [{_id: 1}];
            ContentHome.deletePost(1);
            expect(ContentHome.posts.length).toEqual(0);
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

});