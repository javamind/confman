angular.module('confmanFilters', []);

angular.module('confmanFilters')
    //Help to mask password on screen
    .filter('displayPassword', function() {
        return function(param, password) {
            return password ? '********': param;

        };
    })