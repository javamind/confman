'use strict';

angular.module('confman').controller('applicationDetailCtrl', [
  '$rootScope', '$scope', '$modal', '$routeParams', '$filter', 'Application', 'Environment', 'SoftwareSuite', 'Instance', '$location',
  function ($rootScope, $scope, $modal, $routeParams, $filter, Application, Environment, SoftwareSuite, Instance, $location) {

    //Page definition
    $rootScope.currentPage = {
      code: 'app',
      name: $filter('translate')('application.title'),
      description: ($routeParams.id > 0 ? $filter('translate')('global.verb.update') : $filter('translate')('global.verb.create')) + ' ' + $filter('translate')('application.name'),
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
      var tab = $filter('filter')($scope.application.instances, {active: true});
      $scope.instancesize = tab ? tab.length : 0;
      var tab = $filter('filter')($scope.application.versions, {active: true});
      $scope.versionsize = tab ? tab.length : 0;
      var tab = $filter('filter')($scope.application.parameters, {active: true});
      $scope.paramsize = tab ? tab.length : 0;
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
        controller: ['$scope', '$modalInstance', 'instance', 'environments', function ($scope, $modalInstance, instance, environments) {
          $scope.error = null;
          $scope.environments = environments;
          $scope.appelt = {
            title: instance.id ? $filter('translate')('global.verb.update') : $filter('translate')('global.verb.create') + ' ' + $filter('translate')('application.instance'),
            verb: instance.id ? $filter('translate')('global.verb.update') : $filter('translate')('global.verb.create'),
            icon: instance.id ? 'ic_reply_all_24px.svg' : 'ic_add_24px.svg',
            content: instance
          }
          $scope.ok = function (instance) {
            callBackCreateInstance(instance)
            $modalInstance.close(false);
          }
          $scope.cancel = function (instance) {
            $modalInstance.dismiss(false);
          }
        }],
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
        if ($scope.application.id) {
          //In update the change is persisted directly
          saveApplication();
        }
        refreshActiveDependencies();
      }
    };

    //Modal who manage paramters
    //----------------------------
    $scope.manageParameter = function (parameter) {
      $scope.modalInstance = $modal.open({
        templateUrl: 'modalAddParamToApplication.html',
        controller: ['$scope', '$modalInstance', 'parameter', function ($scope, $modalInstance, parameter) {
          $scope.error = null;
          $scope.parametertypes = ['APPLICATION', 'INSTANCE'];
          $scope.appparam = {
            title: parameter.id ? $filter('translate')('global.verb.update') : $filter('translate')('global.verb.create') + ' ' + $filter('translate')('application.parameter'),
            verb: parameter.id ? $filter('translate')('global.verb.update') : $filter('translate')('global.verb.create'),
            icon: parameter.id ? 'ic_reply_all_24px.svg' : 'ic_add_24px.svg',
            content: parameter
          }
          $scope.ok = function (parameter) {
            callBackCreateParameter(parameter)
            $modalInstance.close(false);
          }
          $scope.cancel = function () {
            $modalInstance.dismiss(false);
          }
        }],
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
        if ($scope.application.id) {
          //In update the change is persisted directly
          saveApplication();
        }
        refreshActiveDependencies();
      }
    };

    //Modal who manage versions
    //----------------------------
    $scope.manageVersion = function (version) {
      $scope.modalInstance = $modal.open({
        templateUrl: 'modalAddVersionToApplication.html',
        controller: ['$scope', '$modalInstance', 'version', function ($scope, $modalInstance, version) {
          $scope.error = null;
          $scope.appelt = {
            title: version.id ? $filter('translate')('global.verb.update') : $filter('translate')('global.verb.create') + ' ' + $filter('translate')('application.version'),
            verb: version.id ? $filter('translate')('global.verb.update') : $filter('translate')('global.verb.create'),
            icon: version.id ? 'ic_reply_all_24px.svg' : 'ic_add_24px.svg',
            content: version
          }
          $scope.ok = function (version) {
            callBackCreateVersion(version)
            $modalInstance.close(false);
          }
          $scope.cancel = function () {
            $modalInstance.dismiss(false);
          }
        }],
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
        if ($scope.application.id) {
          //In update the change is persisted directly
          saveApplication();
        }
        refreshActiveDependencies();
      }
    };

    //Save application
    //----------------------------
    var saveApplication = function () {
      if ($scope.application) {
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
      }
    };
    $scope.save = function () {
      saveApplication();
    };

    //Delete application
    //----------------------------
    $scope.delete = function (elt, $event) {
      var modalInstance = $modal.open({
        templateUrl: 'modalConfirmDelete.html',
        controller: 'ConfirmDeleteCtrl',
        resolve: {
          entity_todelete: function () {
            return $filter('translate')('application.name.the') + ' <b>' + elt.code + '</b>';
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
        controller: ['$scope', '$modalInstance', 'entity_todelete', function ($scope, $modalInstance, entity_todelete) {
          $scope.entity_todelete = entity_todelete;
          $scope.ok = function () {
            refreshActiveDependencies();
            $modalInstance.close(true);
          };
          $scope.cancel = function () {
            $modalInstance.dismiss(false);
          };
        }],
        resolve: {
          entity_todelete: function () {
            return nameentities + ' selected';
          }
        }
      });
      //callback dans lequel on fait la suppression
      modalInstance.result.then(function () {
        alert("rr")
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


  }
]);


