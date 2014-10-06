'use strict';

/**
 * Application definition
 * @type {module|*}
 */
var confman = angular.module('confman', ['ngResource','ngRoute','ngMaterial','ui.bootstrap']);

/**
 *  Constants
 */
confman.constant('constants', config);

/**
 * Routes definitions
 */
confman.config(function ($routeProvider) {
    $routeProvider
        .when('/', {templateUrl: 'views/main.html', controller:'MainCtrl'})
        .when('/application/:id', {templateUrl: 'views/applicationdetail.html', controller:'applicationDetailCtrl'})
        .when('/config/search', {templateUrl: 'views/configsearch.html', controller:'configSearchCtrl'})
        .when('/config/create', {templateUrl: 'views/configcreate.html', controller:'configCreateCtrl'})
        .when('/config/compare', {templateUrl: 'views/configcompare.html', controller:'configCompareCtrl'})
        .otherwise({redirectTo: '/'});

    //Dynamic construction of the URI
    ['environment', 'softwaresuite', 'application'].forEach(function logArrayElements(element, index){
        $routeProvider
            .when('/' + element, {
                templateUrl: 'views/' + element + '.html',
                controller: element + 'Ctrl'
            });
    });

});

/**
 * Menu controller
 */
confman.controller('AppCtrl', function($scope, $timeout, $materialSidenav, $http, constants) {
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

/**
 * Commons callback
 */
confman.run(function ($rootScope) {
    $rootScope.callbackOK = function(){
        $rootScope.error=null;
    };
    $rootScope.callbackKO = function(data){
        if(data){
            $rootScope.error= { message : data.data, code : data.status};
        }
        else{
            $rootScope.error= { message : 'server error', code : 500};
        }
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
    $rootScope.setClassError = function(boolean){
        if(boolean){
            return 'confman-line-error';
        }
        return ''
    };
    $rootScope.isSelected = function(idElt, idSelected){
        return idElt===idSelected ? 'confman-selected' : '';
    };

})

