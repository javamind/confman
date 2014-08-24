'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('configCompareCtrl', function ($rootScope, $scope) {

    //Page definition
    $rootScope.currentPage = {
        code: 'confcomp',
        name: 'Configurations',
        description: 'Compare two configurations',
        icon: 'ic_settings_24px'
    };

});
