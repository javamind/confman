'use strict';

angular
    .module('confman', [
        'ngResource',
        'ngRoute'
    ])
    .constant('constants', {
        urlserver: 'http://localhost:8082/'
    }
)
    .controller('confmanController', function ($scope,$http, constants) {
        $scope.myname = "toto";

        $scope.refresh = function(){
            $http.get(constants.urlserver + 'hello/test')
                .success(function (data) {
                    $scope.myname = "data";
                });
        }
    });



