describe('Unit : Controller - WidgetWallCtrl', function () {

// load the controller's module
    beforeEach(module('socialPluginWidget'));

    var
        WidgetWallCtrl, scope, Modals, SocialDataStore, $timeout,$q;

    beforeEach(inject(function ($controller, _$rootScope_, _Modals_, _SocialDataStore_, _$timeout_,_$q_) {
            scope = _$rootScope_.$new();
            Modals = _Modals_;
            SocialDataStore = _SocialDataStore_;
            $timeout = _$timeout_;
            $q = _$q_;
            WidgetWallCtrl = $controller('WidgetWallCtrl', {
                $scope: scope,
                Modals: Modals,
                SocialDataStore: SocialDataStore
            });
        })
    )
    ;

    describe('Units: units should be Defined', function () {
        it('it should pass if WidgetWallCtrl is defined', function () {
            expect(WidgetWallCtrl).not.toBeUndefined();
        });
        it('it should pass if Modals is defined', function () {
            expect(Modals).not.toBeUndefined();
        });
    });


    describe('WidgetWall.createPost', function () {

        var spy1;
        beforeEach(inject(function () {
            spy1 = spyOn(SocialDataStore,'createPost').and.callFake(function () {
                console.log(3);
                var deferred = $q.defer();
                deferred.resolve('');
                return deferred.promise;
            });

        }));

        it('it should pass', function () {
            WidgetWallCtrl.postText = 'test';
            WidgetWallCtrl.createPost();
            expect(WidgetWallCtrl.postText).toEqual('');
        });
    });

    describe('WidgetWall.likeThread', function () {

        var spy1;
        beforeEach(inject(function () {
            spy1 = spyOn(SocialDataStore,'addThreadLike').and.callFake(function () {

                var deferred = $q.defer();
                deferred.resolve('');
                return deferred.promise;
            });

        }));

        it('it should pass', function () {
            var a = {likesCount:9};
            WidgetWallCtrl.likeThread(a,{});
            expect(a.likesCount).toEqual(10);
        });
    });

});