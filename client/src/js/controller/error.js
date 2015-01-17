'use strict';

/**
 * Menu controller
 */
angular.module('confman').controller('errorCtrl', ['$rootScope', '$filter',
    function ($rootScope, $filter) {
      //Page definition
      $rootScope.currentPage = {
        code: 'error',
        name: $filter('translate')('error.title'),
        description: $filter('translate')('error.description'),
        icon: 'ic_settings_24px'
      };
    }]
);

