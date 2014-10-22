'use strict';

angular.module('confman').controller('MainCtrl', function($scope, $timeout, $materialSidenav, $http, constants) {
    var leftNav;
    $timeout(function() {
        leftNav = $materialSidenav('left');
    });
    $scope.toggleLeft = function() {
        leftNav.toggle();
    };
    $scope.close = function() {
        leftNav.close();
    };
    $scope.isConfmanPageSelected = function(pages) {
        if($scope.currentPage) {
            if(pages.filter(function(elt){
                if ($scope.currentPage.code === elt) {
                    return true;
                }
            }).length>0)
                return true;
        }
        return false;
    };
    $http.get(constants.urlserver + 'environment')
        .success(function (data) {
            $scope.errorUrl = "";
        })
        .error(function () {
            $scope.errorUrl = "Impossible to dialog with confman server. Verify the server port in the config file [CONFMAN_PATH]/app/config.js";
        });
});