'use strict';

/**
 * Application definition
 * @type {module|*}
 */
var confman = angular.module('confman', ['ngResource','ngRoute','ngCookies',    'ngMaterial','ui.bootstrap']);

/**
 * Routes definitions
 */
confman.config(function ($routeProvider, USER_ROLES) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller:'MainCtrl',
            access: {
                authorizedRoles: [USER_ROLES.all]
            }
        })
        .when('/application/:id', {
            templateUrl: 'views/applicationdetail.html',
            controller:'applicationDetailCtrl',
            access: {
                authorizedRoles: [USER_ROLES.all]
            }
        })
        .when('/config/search', {
            templateUrl: 'views/configsearch.html',
            controller:'configSearchCtrl',
            access: {
                authorizedRoles: [USER_ROLES.all]
            }
        })
        .when('/config/create', {
            templateUrl: 'views/configcreate.html',
            controller:'configCreateCtrl',
            access: {
                authorizedRoles: [USER_ROLES.user]
            }
        })
        .when('/config/compare', {
            templateUrl: 'views/configcompare.html',
            controller:'configCompareCtrl',
            access: {
                authorizedRoles: [USER_ROLES.all]
            }
        })
        .otherwise({redirectTo: '/'});

    //Dynamic construction of the URI
    ['environment', 'softwaresuite', 'application'].forEach(function logArrayElements(element, index){
        $routeProvider
            .when('/' + element, {
                templateUrl: 'views/' + element + '.html',
                controller: element + 'Ctrl',
                access: {
                    authorizedRoles: [USER_ROLES.all]
                }
            });
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

/**
 * Authentification
 */
confman.run(function($rootScope, $location, $http, AuthenticationSharedService, Session, USER_ROLES) {
        $rootScope.$on('$routeChangeStart', function (event, next) {
            $rootScope.isAuthorized = AuthenticationSharedService.isAuthorized;
            $rootScope.userRoles = USER_ROLES;
            AuthenticationSharedService.valid(next.access.authorizedRoles);
        });

        // Call when the the client is confirmed
        $rootScope.$on('event:auth-loginConfirmed', function(data) {
            $rootScope.authenticated = true;
            if ($location.path() === "/login") {
                var search = $location.search();
                if (search.redirect !== undefined) {
                    $location.path(search.redirect).search('redirect', null).replace();
                } else {
                    $location.path('/').replace();
                }
            }
        });

        // Call when the 401 response is returned by the server
        $rootScope.$on('event:auth-loginRequired', function(rejection) {
            Session.invalidate();
            $rootScope.authenticated = false;
            if ($location.path() !== "/" && $location.path() !== "" && $location.path() !== "/register" &&
                $location.path() !== "/activate" && $location.path() !== "/login") {
                var redirect = $location.path();
                $location.path('/login').search('redirect', redirect).replace();
            }
        });

        // Call when the 403 response is returned by the server
        $rootScope.$on('event:auth-notAuthorized', function(rejection) {
            $rootScope.errorMessage = 'errors.403';
            $location.path('/error').replace();
        });

        // Call when the user logs out
        $rootScope.$on('event:auth-loginCancelled', function() {
            $location.path('');
        });
    });

