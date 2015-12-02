describe('Unit : Controller - ThreadCtrl', function () {

// load the controller's module
    beforeEach(module('socialPluginWidget'));

    var
        WidgetWallCtrl, scope, Modals, SocialDataStore, $timeout,$routeParams;

    beforeEach(inject(function ($controller, _$rootScope_, _Modals_, _SocialDataStore_, _$timeout_,_$routeParams_) {
            scope = _$rootScope_.$new();
            Modals = _Modals_;
            SocialDataStore = _SocialDataStore_;
            $timeout = _$timeout_;
            $routeParams=_$routeParams_;
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
});
