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
        .constant('EVENTS',{
            COMMENT_DELETED:"COMMENT_DELETED",
            POST_DELETED:"POST_DELETED",
            BAN_USER:"BAN_USER",
            POST_UNLIKED:"POST_UNLIKED",
            POST_LIKED:"POST_LIKED",
            POST_CREATED:"POST_CREATED",
            COMMENT_ADDED:"COMMENT_ADDED"
        })
        .constant('THREAD_STATUS', {
            FOLLOW: "Follow Thread",
            FOLLOWING: "Following Thread"
        })
})(window.angular);
