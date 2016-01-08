describe('socialPluginWidget: App', function () {
    beforeEach(module('socialPluginWidget'));
    var location, route, rootScope;
    beforeEach(inject(
        function (_$location_, _$route_, _$rootScope_) {
            location = _$location_;
            route = _$route_;
            rootScope = _$rootScope_;
        }));
    xdescribe('Home route', function () {
        beforeEach(inject(
            function ($httpBackend) {
                $httpBackend.expectGET('templates/wall.html')
                    .respond(200);
                $httpBackend.expectGET('/')
                    .respond(200);
            }));

        it('should load the home page on successful load of /', function () {
            location.path('/');
            rootScope.$digest();
            expect(route.current.controller).toBe('WidgetWallCtrl')
        });
    });
    describe('Thread route', function () {
        beforeEach(inject(
            function ($httpBackend) {
                $httpBackend.expectGET('templates/thread.html')
                    .respond(200);
                $httpBackend.expectGET('/thread/123')
                    .respond(200);
            }));

        it('should load the thread page on successful load of /thread/123', function () {
            location.path('/thread/123');
            rootScope.$digest();
            expect(route.current.controller).toBe('ThreadCtrl')
        });
    });
});
