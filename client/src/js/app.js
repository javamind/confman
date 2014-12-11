'use strict';

/**
 * Application definition
 * @type {module|*}
 */
var confman = angular.module('confman', ['http-auth-interceptor', 'ngResource','ngRoute','ngSanitize','ngMaterial', 'ngCookies', 'ui.bootstrap', 'pascalprecht.translate']);

/**
 *  Constants
 */
confman.constant('constants',
    {
        //In dev we use grunt serve on port 9000 so we can't construct url easily
        urlserver: document.location.port==='9000' ? 'http://localhost:8082/' : document.location.origin + '/',
        urlclient: document.location.port==='9000' ? 'http://localhost:9000/' : document.location.origin + '/confman/'
    }
);

confman.constant('USER_ROLES', {
    all: '*',
    admin: 'ROLE_ADMIN',
    user: 'ROLE_USER'
});

/*
 Languages codes are ISO_639-1 codes, see http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 They are written in English to avoid character encoding issues (not a perfect solution)
 */
confman.constant('LANGUAGES', {
    en: 'English',
    fr: 'French'
});

/**
 * Routes definitions
 */
confman.config(function ($routeProvider, $translateProvider, $httpProvider, constants, USER_ROLES) {
    //Application use creadentials
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller:'appCtrl',
            access: {
                authorizedRoles: [USER_ROLES.all]
            }
        })
        .when('/application/:id', {
            templateUrl: 'views/applicationdetail.html',
            controller:'applicationDetailCtrl',
            access: {
                authorizedRoles: [USER_ROLES.user]
            }
        })
        .when('/config/search', {
            templateUrl: 'views/configsearch.html',
            controller:'configSearchCtrl',
            access: {
                authorizedRoles: [USER_ROLES.user]
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
                authorizedRoles: [USER_ROLES.user]
            }
        })
        .when('/user', {
            templateUrl: 'views/user.html',
            controller:'userCtrl',
            access: {
                authorizedRoles: [USER_ROLES.admin]
            }
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller:'loginCtrl',
            access: {
                authorizedRoles: [USER_ROLES.all]
            }
        })
        .otherwise({
            redirectTo: '/',
            access: {
                authorizedRoles: [USER_ROLES.all]
            }
        }
    );

    //Dynamic construction of the URI
    ['environment', 'softwaresuite', 'application'].forEach(function logArrayElements(element, index){
        $routeProvider
            .when('/' + element, {
                templateUrl: 'views/' + element + '.html',
                controller: element + 'Ctrl',
                access: {
                    authorizedRoles: [USER_ROLES.user]
                }
            });
    });

    // Initialize angular-translate
    $translateProvider.useStaticFilesLoader({
        prefix: constants.urlclient + 'i18n/',
        suffix: '.json'
    });

    $translateProvider.preferredLanguage('en');

    $translateProvider.useCookieStorage();


});

/**
 * Commons callback
 */
confman.run(function ($rootScope, constants) {
    $rootScope.urlserver = constants.urlserver;

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
 * Security management
 */
confman.run(function($rootScope, $location, $http, AuthenticationSharedService, Session, USER_ROLES) {
    $rootScope.$on('$routeChangeStart', function (event, next) {
        $rootScope.isAuthorized = false;//AuthenticationSharedService.isAuthorized;
        $rootScope.userRoles = USER_ROLES;
        if (next.acces && next.access.authorizedRoles) {
            AuthenticationSharedService.valid(next.access.authorizedRoles);
        }
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
        if ($location.path() !==  "/login") {
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