'use strict';

var confman = angular.module('confman', ['ngResource','ngRoute','ngMaterial']);

confman.constant('constants', {
        urlserver: 'http://localhost:8082/'
    }
);

confman.controller('AppCtrl', function($scope, $timeout, $materialSidenav) {
    var leftNav;
    $timeout(function() {
        leftNav = $materialSidenav('left');
    });
    $scope.toggleLeft = function() {
        leftNav.toggle();
    };
});

confman.controller('LeftCtrl', function($scope, $timeout, $materialSidenav) {
        var nav;
        $timeout(function() {
            nav = $materialSidenav('left');
        });
        $scope.close = function() {
            nav.close();
        };
    });

confman.controller('confmanController', function ($scope,$http, constants) {
        $scope.myname = "toto";

        $scope.refresh = function(){
            $http.get(constants.urlserver + 'hello/test')
                .success(function (data) {
                    $scope.myname = "data";
                });
        }
    });



