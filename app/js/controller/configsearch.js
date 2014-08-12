/**
 * Controller linked to the env list
 */
angular.module('confman').controller('configSearchCtrl', function ($rootScope, $scope, $http, constants, Environment) {

    //Page definition
    $rootScope.currentPage = {
        name: 'Configurations',
        description: 'Search configuration and wath parameters values',
        icon: 'ic_settings_24px'
    };

    //Load environment
    $scope.environments = Environment.query();
    $scope.parametervalues = [];
    //Criteria is empty
    $scope.criteria = {};
    $scope.page = 1;

    //If application change we load instance and tracking version
    $scope.changeApplication = function () {
        if ($scope.criteria.idApplication > 0) {
            $http
                .get(constants.urlserver + '/instance/application/' + $scope.criteria.idApplication + '/environment/' + $scope.criteria.idEnvironment)
                .success(function (datas) {
                $scope.instances = datas;
            });
            $http
                .get(constants.urlserver + '/versiontracking/application/' + $scope.criteria.idApplication)
                .success(function (datas) {
                    $scope.versionTrackings = datas;
                });
        }
        else {
            $scope.instances = [];
            $scope.versionTrackings = [];
        }
    };

    $scope.changeEnvironment = function () {
        if ($scope.criteria.idEnvironment > 0) {
            $http
                .get(constants.urlserver + '/application/environment/' + $scope.criteria.idEnvironment)
                .success(function (datas) {
                    $scope.applications = datas;
                });
        }
        else {
            $scope.applications = [];
            $scope.instances = [];
            $scope.versionTrackings = [];
        }
    };

    $scope.reset = function (){
        $scope.criteria = {};
        $scope.applications = [];
        $scope.instances = [];
        $scope.versionTrackings = [];
    }

    $scope.filter = function (){
        var filterCriteria = {
            page : $scope.page
        };
        if($scope.criteria.idApplication > 0){
            filterCriteria.idApplication = $scope.criteria.idApplication;
        }
        if($scope.criteria.idInstance > 0){
            filterCriteria.idInstance = $scope.criteria.idInstance;
        }
        if($scope.criteria.idVersionTracking > 0){
            filterCriteria.idVersionTracking = $scope.criteria.idVersionTracking;
        }
        if($scope.criteria.code){
            filterCriteria.code = $scope.criteria.code;
        }
        $http
            .post(constants.urlserver + '/parametervalue', filterCriteria)
            .success(function (datas) {
                $scope.parametervalues = datas;
                $scope.callbackOK();
            })
            .error($scope.callbackKO);
    }
});
