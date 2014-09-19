'use strict';

angular.module('confman').controller('MainCtrl', function ($rootScope, $scope, $http, constants) {
    $rootScope.callbackOK();
    $rootScope.currentPage = {
        code: 'home',
        name : "Welcome in Confman",
        actionbar : []
    };


    $http.get(constants.urlserver + 'environment')
        .success(function (data) {
            $scope.errorUrl = "";
        })
        .error(function () {
            $scope.errorUrl = "Impossible to dialog with confman server. Verify the server port in the config file [CONFMAN_PATH]/app/config.js";
        });


})