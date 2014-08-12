/**
 * Controller linked to the env list
 */
angular.module('confman').controller('configCreateCtrl', function ($rootScope, $scope) {

    //Page definition
    $rootScope.currentPage = {
        name: 'Configurations',
        description: 'Create new configuration',
        icon: 'ic_settings_24px'
    };

});
