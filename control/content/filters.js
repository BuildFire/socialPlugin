(function (angular, location) {
    "use strict";
    //created mediaCenterWidget module
    angular
        .module('socialFilters', [])
        .filter('dateConversion', [function () {
            return function (date1) {
                var date2 = new Date();
                var date1 = new Date(date1.toString());
                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                var diffSeconds = Math.floor(timeDiff / (1000));
                var diffMinutes = Math.floor(timeDiff / (1000 * 60));
                var diffHours = Math.floor(timeDiff / (1000 * 60 * 24));
//                var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
//                var diffMonths = Math.floor(diffDays/31);
                if(diffDays <1) {       // difference is less than a day between current date and date passed in argument to this filter
                    if()
                }
            };
        }])
})(window.angular, window.location);