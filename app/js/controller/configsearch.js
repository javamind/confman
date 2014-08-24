'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('configSearchCtrl', function ($rootScope, $scope, $http, constants, Environment, TableService) {

    //Page definition
    $rootScope.currentPage = {
        code: 'confsearch',
        name: 'Configurations',
        description: 'Search configuration and wath parameters values',
        icon: 'ic_satellite_24px'
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
                .get(constants.urlserver + '/trackingversion/application/' + $scope.criteria.idApplication)
                .success(function (datas) {
                    $scope.trackingVersions = datas;
                });
        }
        else {
            $scope.instances = [];
            $scope.trackingVersions = [];
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
            $scope.trackingVersions = [];
        }
    };

    $scope.reset = function (){
        $scope.criteria = {};
        $scope.applications = [];
        $scope.instances = [];
        $scope.trackingVersions = [];
    }

    $scope.pageActive = function (pageElt){
        if($scope.page===pageElt){
            return 'active';
        }
    }
    $scope.filter = function (currentpage){
        var filterCriteria = {
            page : currentpage
        };
        if($scope.criteria.idApplication > 0){
            filterCriteria.idApplication = $scope.criteria.idApplication;
        }
        if($scope.criteria.idInstance > 0){
            filterCriteria.idInstance = $scope.criteria.idInstance;
        }
        if($scope.criteria.idTrackingVersion > 0){
            filterCriteria.idTrackingVersion = $scope.criteria.idTrackingVersion;
        }
        if($scope.criteria.idEnvironment > 0){
            filterCriteria.idEnvironment = $scope.criteria.idEnvironment;
        }
        if($scope.criteria.code){
            filterCriteria.code = $scope.criteria.code;
        }
        $http
            .post(constants.urlserver + '/parametervalue/search', filterCriteria)
            .success(function (datas) {
                $scope.parametervalues = datas;
                $scope.page = datas.currentPage;
                $scope.nbPageTotal =  TableService.getNumMaxPage(datas.completeSize, datas.nbElementByPage);
                $scope.pageSelector = $scope.nbPageTotal > 1 ? TableService.getPageSelector(datas.currentPage, $scope.nbPageTotal) : null;
                $scope.pageSelectorNext =  $scope.pageSelector ? $scope.pageSelector[$scope.pageSelector.length-1] : 0;
                $scope.callbackOK();
            })
            .error($scope.callbackKO);
    }
});
