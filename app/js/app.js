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
        .when('/', {templateUrl: 'main.html', controller:'MainCtrl'})
        .when('/application/:id', {templateUrl: 'view/applicationdetail.html', controller:'applicationDetailCtrl'})
        .when('/config/search', {templateUrl: 'view/configsearch.html', controller:'configSearchCtrl'})
        .when('/config/create', {templateUrl: 'view/configcreate.html', controller:'configCreateCtrl'})
        .when('/config/compare', {templateUrl: 'view/configcompare.html', controller:'configCompareCtrl'})
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
});

/**
 * Commons callback
 */
confman.run(function ($rootScope, translations) {
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

    $rootScope.getI18n = function(key){
        return translations[key];
    };

})

