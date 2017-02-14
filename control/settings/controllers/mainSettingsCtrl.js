/**
 * Created by ahmadfhamed on 2/5/2017.
 */
app.controller('MainSettingsCtrl', function ($scope) {
    var _pluginData = {
        data: {}
    };

    //init tags = [] to avoid on-tag-added bug https://github.com/mbenford/ngTagsInput/issues/622
    $scope.data = {
        mainThreadUserTags: [],
        sideThreadUserTags: []
    };

    $scope.init = function () {
        buildfire.spinner.show();
        buildfire.datastore.get('Social', function (err, result) {
            if (err) {
                console.error('App settings -- ', err);
            } else {
                if (result && result.data) {
                    _pluginData = result;
                    if (result.data.appSettings) {
                        if (!result.data.appSettings.mainThreadUserTags) {
                            result.data.appSettings.mainThreadUserTags = [];
                        }
                        if (!result.data.appSettings.sideThreadUserTags) {
                            result.data.appSettings.sideThreadUserTags = [];
                        }
                        $scope.data = result.data.appSettings;
                    }
                }
            }
            buildfire.spinner.hide();
            $scope.$digest();
        });
    };

    $scope.save = function () {
        buildfire.spinner.show();
        _pluginData.data.appSettings = $scope.data;
        buildfire.datastore.save(_pluginData.data, 'Social', function (err, data) {
            if (err) {
                console.error('App settings -- ', err);
            } else {
                console.log('Data saved using datastore-------------', data);
            }
            buildfire.spinner.hide();
            $scope.$digest();
        });
    };
    $scope.init();
});