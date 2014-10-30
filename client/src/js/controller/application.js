'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('applicationCtrl', ['$rootScope', '$scope', '$modal', '$location', 'Application','SoftwareSuite',
    function ($rootScope, $scope, $modal, $location, Application, SoftwareSuite) {
        $rootScope.callbackOK();

        //Page definition
        $rootScope.currentPage = {
            code: 'app',
            name: 'Applications',
            description: 'List of yours apps',
            icon: 'ic_settings_24px'
        };

        //Load software suites
        $scope.softwaresuites = SoftwareSuite.query();
        //Load environments
        Application.query(function(apps){
            apps.forEach(function(elt){
                //We search the linked software
                if($scope.softwaresuites){
                    var softwaresuite = $scope.softwaresuites.filter(function(soft){
                        return soft.id === elt.idSoftwareSuite;
                    });
                    if(softwaresuite.length>0){
                        elt.softwaresuite = softwaresuite[0];
                    }
                }
            });
            $scope.applications = apps;
        });

        //Actions
        $scope.update = function (elt) {
            $location.path('/application/' + elt.id);
        };
        $scope.create = function () {
            $location.path('/application/' + 0);
        };
    }
]);
