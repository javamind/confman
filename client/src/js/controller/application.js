'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('applicationCtrl', function ($rootScope, $scope, $modal, $location, Application) {
    $rootScope.callbackOK();

    //Page definition
    $rootScope.currentPage = {
        code: 'app',
        name: 'Applications',
        description: 'List of yours apps',
        icon: 'ic_settings_24px'
    };

    //Load environments
    $scope.applications = Application.query();

    //Actions
    $scope.update = function (elt) {
        $location.path('/application/' + elt.id);
    };
    $scope.create = function () {
        $location.path('/application/' + 0);
    };

});
