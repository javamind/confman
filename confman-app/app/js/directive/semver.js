/**
 * Directive to control the validity of version number
 */
angular.module('confman').directive('semverChecker', ['$http','constants',
    function($http, constants) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, elem, attrs, ctrl) {
                /*We need to check that the value is different to the original*/
                /*using push() here to run it as the last parser, after we are sure
                that other validators were run*/
                ctrl.$parsers.push(function(viewValue) {
                    $http.get(constants.urlserver + '/applicationversion/check/' + viewValue).success(function(data) {
                        ctrl.$setValidity('semver', data === 'true');
                    });
                    return viewValue;
                });
            }
        };
    }
]);