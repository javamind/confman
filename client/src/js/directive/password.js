/**
 * Directive to control the validity of version number
 */
angular.module('confman').directive('checkPassword', ['$http',
    function($http) {
        return {
            require: 'ngModel',
            link: function(scope, elem, attrs, ctrl) {
                /*In Angular 1.3 we can add validators*/
                ctrl.$validators.checkPassword = function(value){
                    return value===angular.element(document.querySelector('#' + attrs.checkPassword)).val();
                }
            }
        };
    }
]);