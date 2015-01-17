'use strict';

angular.module('confman.filters')
    //Help to mask password on screen
    .filter('displayPassword', function() {
        return function(param, password) {
            return password ? '********': param;

        };
    })