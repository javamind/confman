'use strict';

angular.module('confman').controller('applicationDetailCtrl', function ($rootScope, $scope, $modal, $routeParams, $filter, Application, Environment, SoftwareSuite, Instance, $location) {

    //Page definition
    $rootScope.currentPage = {
        code: 'app',
        name: 'Application',
        description: $routeParams.id > 0 ? 'Update Application' : 'Create new application',
        icon: 'ic_settings_24px',
        actionbar: [
            {icon: 'ic_arrow_back_24px', action: function () {
                $location.path('/application');
            }}
        ]
    };

    //Load software suites
    $scope.softwaresuites = SoftwareSuite.query();
    //Load envs
    $scope.environments = Environment.query();
    //Type de parameters
    $scope.parametertypes = ['APPLICATION', 'INSTANCE'];

    var refreshActiveDependencies = function () {
        $scope.instancesize = $filter('filter')($scope.application.instances, {active: true}).length;
        $scope.versionsize = $filter('filter')($scope.application.versions, {active: true}).length;
        $scope.paramsize = $filter('filter')($scope.application.parameters, {active: true}).length;
    }

    //Load environments
    if ($routeParams.id > 0) {
        Application.get({id: $routeParams.id}, function (app) {
            angular.forEach(app.instances, function (elt) {
                angular.forEach($scope.environments, function (env) {
                    if (elt.idEnvironment === env.id) {
                        elt.codeEnvironment = env.code;
                    }
                });
            });
            $scope.application = app;
            refreshActiveDependencies();
        });

    }
    else {
        $scope.application = {};
    }

    //Modal who manage instances
    //----------------------------
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
            data.active = true;
            if (!$scope.application.instances) {
                $scope.application.instances = [];
            }
            angular.forEach($scope.environments, function (env) {
                if (data.idEnvironment === env.id) {
                    data.codeEnvironment = env.code;
                }
            });
            //We see if the cpde exist
            var find = false;
            angular.forEach($scope.application.instances, function (elt) {
                if (data.code === elt.code) {
                    elt.code = data.code;
                    elt.label = data.label;
                    elt.idEnvironment = data.idEnvironment;
                    elt.active = true;
                    find = true;
                }
            });
            if (!find) {
                $scope.application.instances.push(data);
            }
            refreshActiveDependencies();
        }
    };

    //Modal who manage paramters
    //----------------------------
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
            data.active = true;
            if (!$scope.application.parameters) {
                $scope.application.parameters = [];
            }
            //We see if the cpde exist
            var find = false;
            angular.forEach($scope.application.parameters, function (elt) {
                if (data.code === elt.code) {
                    elt.code = data.code;
                    elt.label = data.label;
                    elt.type = data.type;
                    elt.active = true;
                    find = true;
                }
            });
            if (!find) {
                $scope.application.parameters.push(data);
            }
            refreshActiveDependencies();
        }
    };

    //Modal who manage versions
    //----------------------------
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
            data.active = true;
            if (!$scope.application.versions) {
                $scope.application.versions = [];
            }
            //We see if the cpde exist
            var find = false;
            angular.forEach($scope.application.versions, function (elt) {
                if (data.code === elt.code) {
                    elt.code = data.code;
                    elt.label = data.label;
                    elt.active = true;
                    find = true;
                }
            });
            if (!find) {
                $scope.application.versions.push(data);
            }
            refreshActiveDependencies();
        }
    };

    //Save application
    //----------------------------
    $scope.save = function () {

        if (!$scope.application.id) {
            Application.save($scope.application, function (data) {
                $scope.application = data;
                $rootScope.error = null;
            }, $scope.callbackKO);
        }
        else {
            $scope.application.$update(function (data) {
                    $scope.application = data;
                    $rootScope.error = null;
                }
                , $scope.callbackKO
            );
        }
    };

    //Delete application
    //----------------------------
    $scope.delete = function (elt, $event) {
        var modalInstance = $modal.open({
            templateUrl: 'modalConfirmDelete.html',
            controller: function ($scope, $modalInstance, entity_todelete) {
                $scope.entity_todelete = entity_todelete;
                $scope.ok = function () {
                    $modalInstance.close(true);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss(false);
                };
            },
            resolve: {
                entity_todelete: function () {
                    return 'application ' + elt.code;
                }
            }
        });
        //callback dans lequel on fait la suppression
        modalInstance.result.then(function (response) {
            $event.stopPropagation();
            Application.delete(
                elt,
                function (data) {
                    $location.path('/application');
                },
                $scope.callbackKO);
        });
    }
    $scope.cancel = function () {
        $location.path('/application');
    }

    //Delete some dependencies
    //----------------------------
    var deleteEntities = function ($modal, entities, nameentities, callback) {
        var modalInstance = $modal.open({
            templateUrl: 'modalConfirmDelete.html',
            controller: function ($scope, $modalInstance, entity_todelete) {
                $scope.entity_todelete = entity_todelete;
                $scope.ok = function () {
                    refreshActiveDependencies();
                    $modalInstance.close(true);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss(false);
                };
            },
            resolve: {
                entity_todelete: function () {
                    return nameentities + ' selected';
                }
            }
        });
        //callback dans lequel on fait la suppression
        modalInstance.result.then(function () {
            callback(entities.filter(function (elt) {
                return !elt.deleted;
            }));
        });
    }
    $scope.deleteInstance = function () {
        deleteEntities($modal, $scope.application.instances, 'instances', function (liste) {
            $scope.application.instances = liste;
        });
    }
    $scope.chgInstanceToDelete = function () {
        $scope.nbInstanceToDelete = 0;
        $scope.application.instances.forEach(function (elt) {
            if (elt.deleted) {
                $scope.nbInstanceToDelete++;
            }
        })
    }
    $scope.deleteVersion = function () {
        deleteEntities($modal, $scope.application.versions, 'versions', function (liste) {
            $scope.application.versions = liste;
        });
    }
    $scope.chgVersionToDelete = function () {
        $scope.nbVersionToDelete = 0;
        $scope.application.versions.forEach(function (elt) {
            if (elt.deleted) {
                $scope.nbVersionToDelete++;
            }
        })
    }
    $scope.deleteParameter = function () {
        deleteEntities($modal, $scope.application.parameters, 'parameters', function (liste) {
            $scope.application.parameters = liste;
        });
    }
    $scope.chgParameterToDelete = function () {
        $scope.nbParameterToDelete = 0;
        $scope.application.parameters.forEach(function (elt) {
            if (elt.deleted) {
                $scope.nbParameterToDelete++;
            }
        })
    }


});



