'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('configCreateCtrl', function ($rootScope, $scope, $http, constants, Application) {

    //Page definition
    $rootScope.currentPage = {
        name: 'Configurations',
        description: 'Create new configuration',
        icon: 'ic_satellite_24px'
    };
    $scope.criteria = {};
    $scope.applications = Application.query();

    $scope.changeApplication = function () {
        if ($scope.criteria.idApplication > 0) {
            $http
                .get(constants.urlserver + '/applicationversion/application/' + $scope.criteria.idApplication)
                .success(function (datas) {
                    $scope.applicationVersions = datas;
                });
            $http
                .get(constants.urlserver + '/environment/application/' + $scope.criteria.idApplication)
                .success(function (datas) {
                    $scope.environments = datas;
                });
        }
        else {
            $scope.applicationVersions = [];
            $scope.environments = [];
        }
    };

    $scope.createParametersValues = function(){
        if ($scope.criteria.idApplicationVersion > 0) {
            $http
                .post(constants.urlserver + '/parametervalue',  $scope.criteria.idApplicationVersion)
                .success(function (datas) {
                    $scope.parameters = datas;
                })
                .error(function (datas) {
                    $scope.parameters = [];
                })
            ;
        }
        else{
            $scope.parameters = [];
        }
    }

});
