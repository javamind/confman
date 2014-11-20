'use strict';

/**
 * Menu controller
 */
angular.module('confman').controller('loginCtrl', ['$rootScope','$scope', '$location', '$filter','AuthenticationSharedService',
    function($rootScope,$scope, $location, $filter, AuthenticationSharedService) {
        //Page definition
        $rootScope.currentPage = {
            code: 'login',
            name : $filter('translate')('login.title'),
            icon : 'ic_settings_24px'
        };

        $scope.login = function () {
            AuthenticationSharedService.login({
                username: $scope.username,
                password: $scope.password,
                rememberMe: true
            });
        }

    }]
);
