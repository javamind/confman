'use strict';

angular.module('confman').controller('MainCtrl', function ($rootScope, $scope, $http, constants) {
    $rootScope.callbackOK();
    $rootScope.currentPage = {
        code: 'home',
        name : "Welcome in Confman",
        actionbar : []
    };

    $scope.refresh = function(){
        $http.get(constants.urlserver + 'hello/test')
            .success(function (data) {
                $scope.myname = "data";
            });
    }
})