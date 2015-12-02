describe('Unit : Controller - ContentHomeCtrl', function () {

// load the controller's module
    beforeEach(module('socialPluginContent'));

    var
        ContentHome, scope, Modals, SocialDataStore, $timeout;

    beforeEach(inject(function ($controller, _$rootScope_, _Modals_, _SocialDataStore_, _$timeout_) {
            scope = _$rootScope_.$new();
            Modals = _Modals_;
            SocialDataStore = _SocialDataStore_;
            $timeout = _$timeout_;
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
    });
});