'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('configCompareCtrl', function ($rootScope, $scope, $http, constants, Application, Params) {
    $rootScope.callbackOK();

    //Page definition
    $rootScope.currentPage = {
        code: 'confcomp',
        name: 'Configurations',
        description: 'Compare two configurations',
        icon: 'ic_settings_24px'
    };

    $scope.applications = Application.query();
    $scope.applicationVersions = [];
    $scope.environments = [];
    $scope.criteria = {};

    $scope.changeApplication = function () {
        $scope.applicationVersions = [];
        $scope.environments = [];
        if ($scope.criteria.idApplication > 0) {
            Params.getTrackingVersionByIdApp($scope.criteria.idApplication, function (datas) {
                $scope.applicationVersions = datas;
            });
            Params.getEnvByIdApp($scope.criteria.idApplication, function (datas) {
                $scope.environments = datas;
            });
        }
    };

    $scope.compareVersion = function () {
        //We call twice the API to load versions
        Params.compareVersion(
            $scope,
            {
                idEnvironment: $scope.criteria.idEnvironment1,
                idTrackingVersion: $scope.criteria.idApplicationVersion1
            },
            {
                idEnvironment: $scope.criteria.idEnvironment2,
                idTrackingVersion: $scope.criteria.idApplicationVersion2
            },
            function(datas){
                $scope.listecomp = datas;
            }
        );
    };
});
