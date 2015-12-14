describe('Unit : Controller - ThreadCtrl', function () {

// load the controller's module
    beforeEach(module('socialPluginWidget'));

    var
        WidgetWallCtrl, scope, Modals, SocialDataStore, $timeout,$routeParams,$q;

    beforeEach(inject(function ($controller, _$rootScope_, _Modals_, _SocialDataStore_, _$timeout_,_$routeParams_,_$q_) {
            scope = _$rootScope_.$new();
            Modals = _Modals_;
            SocialDataStore = _SocialDataStore_;
            $timeout = _$timeout_;
            $routeParams=_$routeParams_;
            $q = _$q_;
            ThreadCtrl = $controller('ThreadCtrl', {
                $scope: scope,
                Modals: Modals,
                SocialDataStore: SocialDataStore,
                $routeParams:$routeParams
            });
        })
    )
    ;

    describe('Units: units should be Defined', function () {
        it('it should pass if WidgetWallCtrl is defined', function () {
            expect(ThreadCtrl).not.toBeUndefined();
        });
        it('it should pass if Modals is defined', function () {
            expect(Modals).not.toBeUndefined();
        });
    });

    xdescribe('Thread.likeThread', function () {


        var spy1;
        beforeEach(inject(function () {
            spy1 = spyOn(SocialDataStore,'addThreadLike').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('');
                console.log(123);
                return deferred.promise;
            });

        }));

        it('it should pass if it calls SocialDataStore.addThreadLike', function () {
            var a = {likeCount:0};
            ThreadCtrl.likeThread(a,{});
            expect(spy1).toHaveBeenCalled();
        });


        xit('it should pass if increases likeCount', function () {
            var a = {likeCount:0};
            ThreadCtrl.likeThread(a,{});
            expect(a.likeCount).toEqual(1);
        });

    });

    describe('Thread.showMoreOptions', function () {
        var spy1;
        beforeEach(inject(function () {
            spy1 = spyOn(Modals,'showMoreOptionsModal').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('');
                console.log(123);
                return deferred.promise;
            });

        }));

        it('it should pass if it calls Modals.showMoreOptionsModal', function () {
            ThreadCtrl.showMoreOptions();
            expect(spy1).toHaveBeenCalled();
        });
    });

    describe('Thread.loadMoreComments', function () {
        var spy1;
        beforeEach(inject(function () {
            spy1 = spyOn(SocialDataStore,'getCommentsOfAPost').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('');
                console.log(123);
                return deferred.promise;
            });

        }));

        it('it should pass if it calls SocialDataStore.getCommentsOfAPost', function () {
            ThreadCtrl.post ={_id:1};
            ThreadCtrl.comments = [{_id:''}];
            ThreadCtrl.loadMoreComments();
            expect(spy1).toHaveBeenCalled();
        });
    });

    xdescribe('Thread.addComment', function () {
        var spy1;
        beforeEach(inject(function () {
            spy1 = spyOn(SocialDataStore,'addComment').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('');
                console.log(123);
                return deferred.promise;
            });

        }));

        it('it should pass if it calls SocialDataStore.addComment', function () {
            ThreadCtrl.post ={_id:1};
            ThreadCtrl.comment = '';
            ThreadCtrl.addComment();
            expect(spy1).toHaveBeenCalled();
        });
    });


});
