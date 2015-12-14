'use strict';

(function (angular) {
    angular.module('socialPluginWidget')
        .constant('SERVER_URL', {
            link: 'http://social.kaleoapps.com/src/server.js'
        })
        .constant('MORE_MENU_POPUP', {
            REPORT: 'Report Post',
            BLOCK: 'Delete Post'
        })
})(window.angular);
