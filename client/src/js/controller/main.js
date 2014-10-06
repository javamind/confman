'use strict';

angular.module('confman').controller('MainCtrl', function ($rootScope, $scope, $http, constants) {
    $rootScope.callbackOK();
    $rootScope.currentPage = {
        code: 'home',
        name : "Welcome in Confman",
        actionbar : []
    };




})