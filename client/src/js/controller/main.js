'use strict';

/**
 * Menu controller
 */
angular.module('confman').controller('appCtrl', ['$scope', '$timeout', '$mdSidenav', '$http', 'constants',
    function($scope, $timeout, $mdSidenav, $http, constants) {
        var leftNav;
        $timeout(function() {
            leftNav = $mdSidenav('left');
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

        $http.get(constants.urlserver + 'app/environment')
            .success(function (data) {
                $scope.errorUrl = "";
            })
            .error(function () {
                $scope.errorUrl = "Impossible to dialog with confman server. Verify the server port in the config file [CONFMAN_PATH]/app/config.js";
            });
    }]
);


angular.module('confman').controller('ConfirmDeleteCtrl', ['$scope', '$modalInstance', 'entity_todelete',
    function ($scope, $modalInstance, entity_todelete) {
        $scope.entity_todelete = entity_todelete;
        $scope.ok = function () {
            $modalInstance.close(true);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss(false);
        };
    }
]);