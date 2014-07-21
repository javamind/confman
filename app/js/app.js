'use strict';

/**
 * Application definition
 * @type {module|*}
 */
var confman = angular.module('confman', ['ngResource','ngRoute','ngMaterial']);

/**
 *  TODO externalize
 */
confman.constant('constants', {
        //
        urlserver: 'http://localhost:8082/'
    }
);

/**
 * Routes definitions
 */
confman.config(function ($routeProvider) {
    $routeProvider
        .when('/', {templateUrl: 'main.html', controller:'MainCtrl'})
        .when('/environment', {templateUrl: 'environment.html',controller: 'EnvCtrl'})
        .otherwise({redirectTo: '/'});
});

/**
 * Menu toggle
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




