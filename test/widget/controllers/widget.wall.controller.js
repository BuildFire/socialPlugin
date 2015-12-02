describe('Unit : Controller - WidgetWallCtrl', function () {

// load the controller's module
    beforeEach(module('socialPluginWidget'));

    var
        WidgetWallCtrl, scope, Modals, SocialDataStore, $timeout;

    beforeEach(inject(function ($controller, _$rootScope_, _Modals_, _SocialDataStore_, _$timeout_) {
            scope = _$rootScope_.$new();
            Modals = _Modals_;
            SocialDataStore = _SocialDataStore_;
            $timeout = _$timeout_;
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
});