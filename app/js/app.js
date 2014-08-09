'use strict';

/**
 * Application definition
 * @type {module|*}
 */
var confman = angular.module('confman', ['ngResource','ngRoute','ngMaterial','ui.bootstrap']);

/**
 *  TODO externalize
 */
confman.constant('constants', {
        //
        urlserver: 'http://localhost:8082/'
    }
);

/**
 * Dialog controler use to confirm a deletion
 */
confman.value('modalConfirmDeleteCtrl', function ($scope, $modalInstance, entity_todelete) {
    $scope.entity_todelete = entity_todelete;

    $scope.ok = function () {
        $modalInstance.close(true);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
});

/**
 * Routes definitions
 */
confman.config(function ($routeProvider) {
    $routeProvider
        .when('/', {templateUrl: 'main.html', controller:'MainCtrl'})
        .when('/application/:id', {templateUrl: 'view/applicationdetail.html', controller:'applicationDetailCtrl'})
        .otherwise({redirectTo: '/'});

    //Dynamic construction of the URI
    ['environment', 'softwaresuite', 'application'].forEach(function logArrayElements(element, index){
        $routeProvider
            .when('/' + element, {
                templateUrl: 'view/' + element + '.html',
                controller: element + 'Ctrl'
            });
    });

});

/**
 * Menu controller
 */
confman.controller('AppCtrl', function($scope, $timeout, $materialSidenav) {
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
});

/**
 * Commons callback
 */
confman.run(function ($rootScope) {
    $rootScope.callbackOK = function(){
        $rootScope.error=null;
    };
    $rootScope.callbackKO = function(data){
        $rootScope.error= { message : data.data, code : data.status};
    };
    $rootScope.setError = function(msgError, codeError){
        $rootScope.error= { message : msgError, code : codeError};
    };
    $rootScope.getClassActionForm = function(form){
        if(form.$invalid){
            return '';
        }
        return 'btn-primary'
    };
})



