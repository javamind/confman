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
                    if($scope.parameters.length>0){
                        $scope.versionTrackiCode = $scope.parameters[0].codeTrackingVersion;
                        if($scope.environments.length>0){
                            $scope.onTabSelected($scope.environments[0]);
                        }
                        else{
                            $scope.envparameters =  $scope.parameters;
                        }
                    }
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

    $scope.onTabSelected = function(env) {
        $scope.envparameters =  $scope.parameters.filter(function(elt){
            if(elt.codeEnvironment===env.code){
                return true;
            }
        });
    }

});
