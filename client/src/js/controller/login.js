'use strict';

/**
 * Menu controller
 */
angular.module('confman').controller('loginCtrl', ['$rootScope','$scope', '$location', 'AuthenticationSharedService',
    function($rootScope,$scope, $location, AuthenticationSharedService) {
        //Page definition
        $rootScope.currentPage = {
            code: 'login',
            name : 'Authentification',

            icon : 'ic_settings_24px'
        };

        $scope.login = function () {
            AuthenticationSharedService.login({
                username: $scope.username,
                password: $scope.password
            });
        }

    }]
);
