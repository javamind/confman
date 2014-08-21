'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('configCreateCtrl', function ($rootScope, $scope, $http, $modal, constants, Application) {

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
                    $rootScope.callbackOK();
                });
            $http
                .get(constants.urlserver + '/environment/application/' + $scope.criteria.idApplication)
                .success(function (datas) {
                    $scope.environments = datas;
                    $scope.selectedIndex = 0;
                    $rootScope.callbackOK();
                });
        }
        else {
            $scope.applicationVersions = [];
            $scope.environments = [];
        }
    };

    $scope.createParametersValues = function(){
        $modal.open({
            templateUrl: 'modalConfirmCreation.html',
            controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
               $scope.cancel = function () {
                    $modalInstance.dismiss(false);
                };
                $scope.ok = function (filename) {
                    callBackCreation();
                    $modalInstance.close(true);
                };
            }]
        });

        var callBackCreation = function() {
            if ($scope.criteria.idApplicationVersion > 0) {
                $http
                    .post(constants.urlserver + '/parametervalue', $scope.criteria.idApplicationVersion)
                    .success(function (datas) {
                        $scope.parameters = datas;
                        if ($scope.parameters.length > 0) {
                            $scope.versionTrackiCode = $scope.parameters[0].codeTrackingVersion;
                            if ($scope.environments.length > 0) {
                                $scope.onTabSelected($scope.environments[0]);
                            }
                            else {
                                $scope.envparameters = $scope.parameters;
                            }
                        }
                        $rootScope.callbackOK();
                    })
                    .error(function (datas) {
                        $scope.parameters = [];
                        $rootScope.setError('An error occured');
                    })
                ;
            }
            else {
                $scope.parameters = [];
            }
        }
    }

    $scope.saveParametersValues = function(){
        $modal.open({
            templateUrl: 'modalConfirmCreation.html',
            controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                $scope.cancel = function () {
                    $modalInstance.dismiss(false);
                };
                $scope.ok = function () {
                    callBackUpdate();
                    $modalInstance.close(true);
                };
            }]
        });

        var callBackUpdate = function() {
            $http
                .put(constants.urlserver + '/parametervalue', $scope.criteria.parameters)
                .success(function (datas) {
                    $rootScope.callbackOK();
                })
                .error(function (datas) {
                    $rootScope.setError('An error occured');
                });
        }
    }

    $scope.onTabSelected = function(env) {
        if($scope.parameters) {
            $scope.envparameters = $scope.parameters.filter(function (elt) {
                if (elt.codeEnvironment === env.code) {
                    return true;
                }
            });
        }
    }


});
