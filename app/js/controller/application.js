/**
 * Controller linked to the env list
 */
angular.module('confman').controller('applicationCtrl', function ($rootScope, $scope, $modal, $location, Application) {

    //Page definition
    $rootScope.currentPage = {
        name: 'Applications',
        description: 'List of yours apps',
        icon: 'ic_settings_24px'
    };

    //Load environments
    $scope.applications = Application.query();

    //Actions
    $scope.update = function (elt) {
        $location.path('/application/' + elt.id);
    };
    $scope.create = function () {
        $location.path('/application/' + 0);
    };

});

angular.module('confman').controller('applicationDetailCtrl', function ($rootScope, $scope, $modal, modalConfirmDeleteCtrl, $routeParams, Application, Environment, SoftwareSuite, Instance) {

    //Page definition
    $rootScope.currentPage = {
        name: 'Application',
        description: $routeParams.id > 0 ? 'Update Application' : 'Create new application',
        icon: 'ic_settings_24px'
    };

    //Load software suites
    $scope.softwaresuites = SoftwareSuite.query();
    //Load envs
    $scope.environments = Environment.query();
    //Type de parameters
    $scope.parametertypes = ['APPLICATION', 'INSTANCE'];

    //Load environments
    if ($routeParams.id > 0) {
        $scope.application = Application.get({id: $routeParams.id}, function (app) {
            angular.forEach(app.instances, function (elt) {
                angular.forEach($scope.environments, function (env) {
                    if (elt.idEnvironment === env.id) {
                        elt.codeEnvironment = env.code;
                    }
                });
            });
        });
    }
    else {
        $scope.application = {};
    }

    //Modal who manage instances
    $scope.manageInstance = function (instance) {
        $scope.modalInstance = $modal.open({
            templateUrl: 'modalAddInstanceToApplication.html',
            controller: function ($scope, $modalInstance, instance, environments) {
                $scope.error = null;
                $scope.environments = environments;
                $scope.appelt = {
                    title: instance.id ? 'Update instance' : 'Add instance',
                    verb: instance.id ? 'Update' : 'Add',
                    icon: instance.id ? 'ic_reply_all_24px.svg' : 'ic_add_24px.svg',
                    content: instance
                }
                $scope.ok = function (instance) {
                    if (!instance.id) {
                        callBackCreateInstance(instance)
                    }
                    $modalInstance.close(false);
                }
                $scope.cancel = function (instance) {
                    $modalInstance.dismiss(false);
                }
            },
            resolve: {
                instance: function () {
                    return instance;
                },
                environments: function () {
                    return $scope.environments;
                }
            }
        });

        var callBackCreateInstance = function (data) {
            $scope.error = null;
            if (!$scope.application.instances) {
                $scope.application.instances = {};
            }
            $scope.application.instances.push(data);
        }
    };
    //Modal who manage paramters
    $scope.manageParameter = function (parameter) {
        $scope.modalInstance = $modal.open({
            templateUrl: 'modalAddParamToApplication.html',
            controller: function ($scope, $modalInstance, parameter) {
                $scope.error = null;
                $scope.parametertypes = ['APPLICATION', 'INSTANCE'];
                $scope.appparam = {
                    title: parameter.id ? 'Update parameter' : 'Add parameter',
                    verb: parameter.id ? 'Update' : 'Add',
                    icon: parameter.id ? 'ic_reply_all_24px.svg' : 'ic_add_24px.svg',
                    content: parameter
                }
                $scope.ok = function (parameter) {
                    if (!parameter.id) {
                        callBackCreateParameter(parameter)
                    }
                    $modalInstance.close(false);
                }
                $scope.cancel = function () {
                    $modalInstance.dismiss(false);
                }
            },
            resolve: {
                parameter: function () {
                    return parameter;
                }
            }
        });

        var callBackCreateParameter = function (data) {
            $scope.error = null;
            if (!$scope.application.parameters) {
                $scope.application.parameters = {};
            }
            $scope.application.parameters.push(data);
        }
    };


    //Modal who manage versions
    $scope.manageVersion = function (version) {
        $scope.modalInstance = $modal.open({
            templateUrl: 'modalAddVersionToApplication.html',
            controller: function ($scope, $modalInstance, version) {
                $scope.error = null;
                $scope.appelt = {
                    title: version.id ? 'Update version' : 'Add version',
                    verb: version.id ? 'Update' : 'Add',
                    icon: version.id ? 'ic_reply_all_24px.svg' : 'ic_add_24px.svg',
                    content: version
                }
                $scope.ok = function (version) {
                    if (!version.id) {
                        callBackCreateVersion(version)
                    }
                    $modalInstance.close(false);
                }
                $scope.cancel = function () {
                    $modalInstance.dismiss(false);
                }
            },
            resolve: {
                version: function () {
                    return version;
                }
            }
        });

        var callBackCreateVersion = function (data) {
            $scope.error = null;
            if (!$scope.application.versions) {
                $scope.application.versions = {};
            }
            $scope.application.versions.push(data);
        }
    };
});


