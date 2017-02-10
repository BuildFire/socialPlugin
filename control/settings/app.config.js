/**
 * Created by ahmadfhamed on 2/4/2017.
 */
app.config(['$locationProvider', '$routeProvider', 'tagsInputConfigProvider', function ($locationProvider, $routeProvider, tagsInputConfigProvider) {
    //config for tag-input plugin
    tagsInputConfigProvider.setActiveInterpolation('tagsInput', { minTags: true });

    $routeProvider.when('/', {
        templateUrl: 'views/mainSettings.html'
    }).otherwise({redirectTo: '/'});
}]);