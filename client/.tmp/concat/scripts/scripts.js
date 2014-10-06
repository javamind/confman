'use strict';
function verify_code_unicity(myListe, myObject) {
  return myListe.filter(function verify(element) {
    return element.code === myObject.code && element.id !== myObject.id;
  }).length;
}
function find_entity_index(myListe, myObject) {
  var indexreturned = -1;
  myListe.forEach(function find(element, index) {
    if (element.code === myObject.code) {
      indexreturned = index;
    }
  });
  return indexreturned;
}
'use strict';
/**
 * Application definition
 * @type {module|*}
 */
var confman = angular.module('confman', [
    'ngResource',
    'ngRoute',
    'ngMaterial',
    'ui.bootstrap'
  ]);
/**
 *  Constants
 */
confman.constant('constants', config);
/**
 * Routes definitions
 */
confman.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    }).when('/application/:id', {
      templateUrl: 'views/applicationdetail.html',
      controller: 'applicationDetailCtrl'
    }).when('/config/search', {
      templateUrl: 'views/configsearch.html',
      controller: 'configSearchCtrl'
    }).when('/config/create', {
      templateUrl: 'views/configcreate.html',
      controller: 'configCreateCtrl'
    }).when('/config/compare', {
      templateUrl: 'views/configcompare.html',
      controller: 'configCompareCtrl'
    }).otherwise({ redirectTo: '/' });
    //Dynamic construction of the URI
    [
      'environment',
      'softwaresuite',
      'application'
    ].forEach(function logArrayElements(element, index) {
      $routeProvider.when('/' + element, {
        templateUrl: 'views/' + element + '.html',
        controller: element + 'Ctrl'
      });
    });
  }
]);
/**
 * Menu controller
 */
confman.controller('AppCtrl', [
  '$scope',
  '$timeout',
  '$materialSidenav',
  '$http',
  'constants',
  function ($scope, $timeout, $materialSidenav, $http, constants) {
    var leftNav;
    $timeout(function () {
      leftNav = $materialSidenav('left');
    });
    $scope.toggleLeft = function () {
      leftNav.toggle();
    };
    $scope.close = function () {
      leftNav.close();
    };
    $scope.isConfmanPageSelected = function (pages) {
      if ($scope.currentPage) {
        if (pages.filter(function (elt) {
            if ($scope.currentPage.code === elt) {
              return true;
            }
          }).length > 0)
          return true;
      }
      return false;
    };
    $http.get(constants.urlserver + 'environment').success(function (data) {
      $scope.errorUrl = '';
    }).error(function () {
      $scope.errorUrl = 'Impossible to dialog with confman server. Verify the server port in the config file [CONFMAN_PATH]/app/config.js';
    });
  }
]);
/**
 * Commons callback
 */
confman.run([
  '$rootScope',
  function ($rootScope) {
    $rootScope.callbackOK = function () {
      $rootScope.error = null;
    };
    $rootScope.callbackKO = function (data) {
      if (data) {
        $rootScope.error = {
          message: data.data,
          code: data.status
        };
      } else {
        $rootScope.error = {
          message: 'server error',
          code: 500
        };
      }
    };
    $rootScope.setError = function (msgError, codeError) {
      $rootScope.error = {
        message: msgError,
        code: codeError
      };
    };
    $rootScope.getClassActionForm = function (form) {
      if (form.$invalid) {
        return '';
      }
      return 'btn-primary';
    };
    $rootScope.setClassError = function (boolean) {
      if (boolean) {
        return 'confman-line-error';
      }
      return '';
    };
    $rootScope.isSelected = function (idElt, idSelected) {
      return idElt === idSelected ? 'confman-selected' : '';
    };
  }
]);
'use strict';
angular.module('confman').controller('MainCtrl', [
  '$rootScope',
  '$scope',
  '$http',
  'constants',
  function ($rootScope, $scope, $http, constants) {
    $rootScope.callbackOK();
    $rootScope.currentPage = {
      code: 'home',
      name: 'Welcome in Confman',
      actionbar: []
    };
  }
]);
'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('environmentCtrl', [
  '$rootScope',
  '$scope',
  '$modal',
  'Environment',
  function ($rootScope, $scope, $modal, Environment) {
    $rootScope.callbackOK();
    //Page definition
    $rootScope.currentPage = {
      code: 'env',
      name: 'Environment',
      description: 'You can use several environments to offer different context for developers, testers, the final users... ' + 'For example you can have development, staging, production...',
      icon: 'ic_settings_24px'
    };
    //Load environments
    $scope.environments = Environment.query();
    //$scope.entity = { verb :null, content: { code:' ', label:' '}}
    //Actions
    $scope.update = function (elt) {
      $scope.entity = {
        verb: 'Update environment',
        content: elt,
        selected: elt.id
      };
    };
    $scope.create = function () {
      $scope.entity = {
        verb: 'Create environment',
        content: {},
        selected: null
      };
    };
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
              return 'environment ' + elt.code;
            }
          }
        });
      //callback dans lequel on fait la suppression
      modalInstance.result.then(function (response) {
        $event.stopPropagation();
        Environment.delete(elt, function (data) {
          $scope.error = null;
          var index = find_entity_index($scope.environments, elt);
          if (index >= 0) {
            $scope.environments.splice(index, 1);
          }
          $scope.entity.content = null;
          $scope.entity.verb = null;
        }, $scope.callbackKO);
      });
    };
    $scope.save = function (form) {
      if (form.$error.required) {
        $rootScope.setError('Your form is not submitted : code and label are required');
        return;
      }
      //We check code existence
      if (verify_code_unicity($scope.environments, $scope.entity.content) > 0) {
        $rootScope.setError('The code [' + $scope.entity.content + '] is already in use');
        return;
      }
      if (!$scope.entity.content.id) {
        Environment.save($scope.entity.content, function (data) {
          $scope.error = null;
          if (!$scope.environments) {
            $scope.environments = {};
          }
          $scope.environments.push(data);
          $scope.entity.content = null;
          $scope.entity.verb = null;
        }, $scope.callbackKO);
      } else {
        $scope.entity.content.$update($scope.callbackOK, $scope.callbackKO);
      }
    };
  }
]);
'use strict';
/**
 * Controller linked to the application's groupment list
 */
angular.module('confman').controller('softwaresuiteCtrl', [
  '$rootScope',
  '$scope',
  '$http',
  '$modal',
  'SoftwareSuite',
  'Environment',
  'constants',
  function ($rootScope, $scope, $http, $modal, SoftwareSuite, Environment, constants) {
    $rootScope.callbackOK();
    //Page definition
    $rootScope.currentPage = {
      code: 'soft',
      name: 'Software Suite',
      description: 'In a complex context you have often a set of of software',
      icon: 'ic_settings_24px'
    };
    //Load applicationgroupments
    $scope.softwaresuites = SoftwareSuite.query();
    //Actions
    $scope.update = function (elt) {
      $scope.entity = {
        verb: 'Update software suite',
        content: elt,
        selected: elt.id
      };
      $scope.hideEnv = true;
      //Load environments
      $scope.environments = Environment.query(function () {
        $http.get(constants.urlserver + '/softwaresuite/' + elt.id + '/environment').success(function (data) {
          data.forEach(function (element) {
            //on parcours la liste des env
            for (var i = 0; i < $scope.environments.length; i++) {
              var o = $scope.environments[i];
              if (o.id === element.idEnvironmentDto) {
                o.selected = true;
                break;
              }
            }
          });
          $scope.hideEnv = false;
        }).error(function (data) {
          $rootScope.setError('Error on environments load ');
        });
      });
    };
    $scope.create = function () {
      $scope.entity = {
        verb: 'Create software suite',
        content: {}
      };
    };
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
              return 'software suite ' + elt.code;
            }
          }
        });
      //callback dans lequel on fait la suppression
      modalInstance.result.then(function (response) {
        $event.stopPropagation();
        SoftwareSuite.delete(elt, function (data) {
          $scope.error = null;
          var index = find_entity_index($scope.softwaresuites, elt);
          if (index >= 0) {
            $scope.softwaresuites.splice(index, 1);
          }
          $scope.entity.content = null;
          $scope.entity.verb = null;
        }, $scope.callbackKO);
      });
    };
    $scope.save = function (form) {
      if (form.$error.required) {
        $rootScope.setError('Your form is not submitted : code and label are required');
        return;
      }
      //We check code existence
      if (verify_code_unicity($scope.softwaresuites, $scope.entity.content) > 0) {
        $rootScope.setError('The code [' + $scope.entity.content + '] is already in use');
        return;
      }
      if (!$scope.entity.content.id) {
        SoftwareSuite.save($scope.entity.content, function (data) {
          $rootScope.error = null;
          if (!$scope.softwaresuites) {
            $scope.softwaresuites = {};
          }
          $scope.softwaresuites.push(data);
          $scope.entity.content = data;
          $scope.entity.verb = 'Update software suite';
          $scope.entity.selected = data.id;
        }, $scope.callbackKO);
      } else {
        //Environment linked to the suite
        var envs = $scope.environments.filter(function filter(env) {
            return env.selected;
          });
        if (envs) {
          var softenv = [];
          envs.forEach(function prepare(elt) {
            softenv.push({
              idEnvironmentDto: elt.id,
              codeEnvironmentDto: elt.code,
              idSoftwareSuiteDto: $scope.entity.content.id,
              codeSoftwareSuiteDto: $scope.entity.content.code
            });
          });
          $scope.entity.content.environments = softenv;
        }
        $scope.entity.content.$update($scope.callbackOK, $scope.callbackKO);
        $scope.entity.selected = $scope.entity.content.id;
      }
    };
  }
]);
'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('applicationCtrl', [
  '$rootScope',
  '$scope',
  '$modal',
  '$location',
  'Application',
  function ($rootScope, $scope, $modal, $location, Application) {
    $rootScope.callbackOK();
    //Page definition
    $rootScope.currentPage = {
      code: 'app',
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
  }
]);
'use strict';
angular.module('confman').controller('applicationDetailCtrl', [
  '$rootScope',
  '$scope',
  '$modal',
  '$routeParams',
  '$filter',
  'Application',
  'Environment',
  'SoftwareSuite',
  'Instance',
  '$location',
  function ($rootScope, $scope, $modal, $routeParams, $filter, Application, Environment, SoftwareSuite, Instance, $location) {
    //Page definition
    $rootScope.currentPage = {
      code: 'app',
      name: 'Application',
      description: $routeParams.id > 0 ? 'Update Application' : 'Create new application',
      icon: 'ic_settings_24px',
      actionbar: [{
          icon: 'ic_arrow_back_24px',
          action: function () {
            $location.path('/application');
          }
        }]
    };
    //Load software suites
    $scope.softwaresuites = SoftwareSuite.query();
    //Load envs
    $scope.environments = Environment.query();
    //Type de parameters
    $scope.parametertypes = [
      'APPLICATION',
      'INSTANCE'
    ];
    var refreshActiveDependencies = function () {
      $scope.instancesize = $filter('filter')($scope.application.instances, { active: true }).length;
      $scope.versionsize = $filter('filter')($scope.application.versions, { active: true }).length;
      $scope.paramsize = $filter('filter')($scope.application.parameters, { active: true }).length;
    };
    //Load environments
    if ($routeParams.id > 0) {
      Application.get({ id: $routeParams.id }, function (app) {
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
    } else {
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
          };
          $scope.ok = function (instance) {
            if (!instance.id) {
              callBackCreateInstance(instance);
            }
            $modalInstance.close(false);
          };
          $scope.cancel = function (instance) {
            $modalInstance.dismiss(false);
          };
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
      };
    };
    //Modal who manage paramters
    //----------------------------
    $scope.manageParameter = function (parameter) {
      $scope.modalInstance = $modal.open({
        templateUrl: 'modalAddParamToApplication.html',
        controller: function ($scope, $modalInstance, parameter) {
          $scope.error = null;
          $scope.parametertypes = [
            'APPLICATION',
            'INSTANCE'
          ];
          $scope.appparam = {
            title: parameter.id ? 'Update parameter' : 'Add parameter',
            verb: parameter.id ? 'Update' : 'Add',
            icon: parameter.id ? 'ic_reply_all_24px.svg' : 'ic_add_24px.svg',
            content: parameter
          };
          $scope.ok = function (parameter) {
            if (!parameter.id) {
              callBackCreateParameter(parameter);
            }
            $modalInstance.close(false);
          };
          $scope.cancel = function () {
            $modalInstance.dismiss(false);
          };
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
      };
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
          };
          $scope.ok = function (version) {
            if (!version.id) {
              callBackCreateVersion(version);
            }
            $modalInstance.close(false);
          };
          $scope.cancel = function () {
            $modalInstance.dismiss(false);
          };
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
      };
    };
    //Save application
    //----------------------------
    $scope.save = function () {
      if (!$scope.application.id) {
        Application.save($scope.application, function (data) {
          $scope.application = data;
          $rootScope.error = null;
        }, $scope.callbackKO);
      } else {
        $scope.application.$update(function (data) {
          $scope.application = data;
          $rootScope.error = null;
        }, $scope.callbackKO);
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
        Application.delete(elt, function (data) {
          $location.path('/application');
        }, $scope.callbackKO);
      });
    };
    $scope.cancel = function () {
      $location.path('/application');
    };
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
    };
    $scope.deleteInstance = function () {
      deleteEntities($modal, $scope.application.instances, 'instances', function (liste) {
        $scope.application.instances = liste;
      });
    };
    $scope.chgInstanceToDelete = function () {
      $scope.nbInstanceToDelete = 0;
      $scope.application.instances.forEach(function (elt) {
        if (elt.deleted) {
          $scope.nbInstanceToDelete++;
        }
      });
    };
    $scope.deleteVersion = function () {
      deleteEntities($modal, $scope.application.versions, 'versions', function (liste) {
        $scope.application.versions = liste;
      });
    };
    $scope.chgVersionToDelete = function () {
      $scope.nbVersionToDelete = 0;
      $scope.application.versions.forEach(function (elt) {
        if (elt.deleted) {
          $scope.nbVersionToDelete++;
        }
      });
    };
    $scope.deleteParameter = function () {
      deleteEntities($modal, $scope.application.parameters, 'parameters', function (liste) {
        $scope.application.parameters = liste;
      });
    };
    $scope.chgParameterToDelete = function () {
      $scope.nbParameterToDelete = 0;
      $scope.application.parameters.forEach(function (elt) {
        if (elt.deleted) {
          $scope.nbParameterToDelete++;
        }
      });
    };
  }
]);
'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('configCompareCtrl', [
  '$rootScope',
  '$scope',
  '$http',
  'constants',
  'Application',
  'Params',
  function ($rootScope, $scope, $http, constants, Application, Params) {
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
      Params.compareVersion($scope, {
        idEnvironment: $scope.criteria.idEnvironment1,
        idTrackingVersion: $scope.criteria.idApplicationVersion1
      }, {
        idEnvironment: $scope.criteria.idEnvironment2,
        idTrackingVersion: $scope.criteria.idApplicationVersion2
      }, function (datas) {
        $scope.listecomp = datas;
      });
    };
  }
]);
'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('configCreateCtrl', [
  '$rootScope',
  '$scope',
  '$http',
  '$modal',
  'constants',
  'Application',
  'Params',
  function ($rootScope, $scope, $http, $modal, constants, Application, Params) {
    $rootScope.callbackOK();
    //Page definition
    $rootScope.currentPage = {
      code: 'confcreate',
      name: 'Configurations',
      description: 'Create new configuration',
      icon: 'ic_satellite_24px'
    };
    $scope.criteria = {};
    $scope.applications = Application.query();
    $scope.envSelected = {};
    $scope.changeApplication = function () {
      $scope.applicationVersions = [];
      $scope.environments = [];
      if ($scope.criteria.idApplication > 0) {
        Params.getAppVersionByIdApp($scope.criteria.idApplication, function (datas) {
          $scope.applicationVersions = datas;
        });
        Params.getEnvByIdApp($scope.criteria.idApplication, function (datas) {
          $scope.environments = datas;
          $scope.selectedIndex = 0;
        });
      }
    };
    $scope.createParametersValues = function () {
      $modal.open({
        templateUrl: 'modalConfirmCreation.html',
        controller: [
          '$scope',
          '$modalInstance',
          function ($scope, $modalInstance) {
            $scope.icon = 'ic_add_24px.svg';
            $scope.cancel = function () {
              $modalInstance.dismiss(false);
            };
            $scope.ok = function (filename) {
              callBackCreation();
              $modalInstance.close(true);
            };
          }
        ]
      });
      var callBackCreation = function () {
        if ($scope.criteria.idApplicationVersion > 0) {
          $http.post(constants.urlserver + '/parametervalue', $scope.criteria.idApplicationVersion).success(function (datas) {
            $scope.parameters = datas;
            if ($scope.parameters.length > 0) {
              $scope.versionTrackiCode = $scope.parameters[0].codeTrackingVersion;
              $scope.versionTrackiId = $scope.parameters[0].idTrackingVersion;
              if ($scope.environments.length > 0) {
                $scope.onTabSelected($scope.environments[0], 0);
              } else {
                $scope.envparameters = $scope.parameters;
              }
            }
            $rootScope.callbackOK();
          }).error(function (datas) {
            $scope.parameters = [];
            $rootScope.setError('An error occured');
          });
          ;
        } else {
          $scope.parameters = [];
        }
      };
    };
    $scope.saveParametersValues = function () {
      $modal.open({
        templateUrl: 'modalConfirmCreation.html',
        controller: [
          '$scope',
          '$modalInstance',
          function ($scope, $modalInstance) {
            $scope.icon = 'ic_save_24px.svg';
            $scope.cancel = function () {
              $modalInstance.dismiss(false);
            };
            $scope.ok = function () {
              callBackUpdate();
              $modalInstance.close(true);
            };
          }
        ]
      });
      var callBackUpdate = function () {
        $http.put(constants.urlserver + '/parametervalue', $scope.parameters).success(function (datas) {
          $rootScope.callbackOK();
          $scope.lockVersion = true;
          //Refresh of paramaters
          $http.post(constants.urlserver + '/parametervalue/search', {
            nbEltPerPage: 99999,
            idTrackingVersion: $scope.versionTrackiId
          }).success(function (datas) {
            $scope.parameters = datas.list;
            $scope.onTabSelected($scope.environments[0], 0);
            $scope.callbackOK();
          }).error(function (datas) {
            $rootScope.setError('An error occured when we search the changes in database');
          });
        }).error(function (datas) {
          $rootScope.setError('An error occured on saving changes');
        });
      };
    };
    $scope.onTabSelected = function (env, index) {
      $scope.envSelected = env;
      //$('#myTab a[href="#tab' + env.code + '"]').tab('show')
      if ($scope.parameters) {
        if (index) {
          $scope.selectedIndex = index;
        }
        $scope.envparameters = $scope.parameters.filter(function (elt) {
          if (elt.codeEnvironment === env.code) {
            return true;
          }
        });
      }
    };
    $scope.classTabSelected = function (env) {
      if ($scope.envSelected.code === env.code) {
        return 'active confman-tab-pane';
      }
      return '';
    };
  }
]);
'use strict';
/**
 * Controller linked to the env list
 */
angular.module('confman').controller('configSearchCtrl', [
  '$rootScope',
  '$scope',
  '$http',
  'constants',
  'Environment',
  'TableService',
  'Params',
  function ($rootScope, $scope, $http, constants, Environment, TableService, Params) {
    $rootScope.callbackOK();
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
      $scope.instances = [];
      $scope.trackingVersions = [];
      if ($scope.criteria.idApplication > 0) {
        Params.getInstanceByIdAppAndIdEnv($scope.criteria.idApplication, $scope.criteria.idEnvironment, function (datas) {
          $scope.instances = datas;
        });
        Params.getTrackingVersionByIdApp($scope.criteria.idApplication, function (datas) {
          $scope.trackingVersions = datas;
        });
      }
    };
    $scope.changeEnvironment = function () {
      if ($scope.criteria.idEnvironment > 0) {
        Params.getAppByIdEnv($scope.criteria.idEnvironment, function (datas) {
          $scope.applications = datas;
        });
      } else {
        $scope.applications = [];
        $scope.instances = [];
        $scope.trackingVersions = [];
      }
    };
    $scope.reset = function () {
      $scope.criteria = {};
      $scope.applications = [];
      $scope.instances = [];
      $scope.trackingVersions = [];
    };
    $scope.pageActive = function (pageElt) {
      if ($scope.page === pageElt) {
        return 'active';
      }
    };
    $scope.filter = function (currentpage) {
      var filterCriteria = { page: currentpage };
      if ($scope.criteria.idApplication > 0) {
        filterCriteria.idApplication = $scope.criteria.idApplication;
      }
      if ($scope.criteria.idInstance > 0) {
        filterCriteria.idInstance = $scope.criteria.idInstance;
      }
      if ($scope.criteria.idTrackingVersion > 0) {
        filterCriteria.idTrackingVersion = $scope.criteria.idTrackingVersion;
      }
      if ($scope.criteria.idEnvironment > 0) {
        filterCriteria.idEnvironment = $scope.criteria.idEnvironment;
      }
      if ($scope.criteria.code) {
        filterCriteria.code = $scope.criteria.code;
      }
      Params.getParamValueByCriteria(filterCriteria, function (datas) {
        $scope.parametervalues = datas;
        $scope.page = datas.currentPage;
        $scope.nbPageTotal = TableService.getNumMaxPage(datas.completeSize, datas.nbElementByPage);
        $scope.pageSelector = $scope.nbPageTotal > 1 ? TableService.getPageSelector(datas.currentPage, $scope.nbPageTotal) : null;
        $scope.pageSelectorNext = $scope.pageSelector ? $scope.pageSelector[$scope.pageSelector.length - 1] : 0;
        $scope.callbackOK();
      }, $scope.callbackKO);
    };
  }
]);
'use strict';
var restActions = {
    'get': { method: 'GET' },
    'save': { method: 'POST' },
    'update': { method: 'PUT' },
    'query': {
      method: 'GET',
      isArray: true
    },
    'delete': { method: 'DELETE' }
  };
angular.module('confman').factory('Environment', [
  '$resource',
  'constants',
  function Environment($resource, constants) {
    return $resource(constants.urlserver + 'environment/:id', { id: '@_id' }, restActions);
  }
]).factory('SoftwareSuite', [
  '$resource',
  'constants',
  function SoftwareSuite($resource, constants) {
    return $resource(constants.urlserver + 'softwaresuite/:id', { id: '@_id' }, restActions);
  }
]).factory('Application', [
  '$resource',
  'constants',
  function Application($resource, constants) {
    return $resource(constants.urlserver + 'application/:id', { id: '@_id' }, restActions);
  }
]).factory('ApplicationVersion', [
  '$resource',
  'constants',
  function ApplicationVersion($resource, constants) {
    return $resource(constants.urlserver + 'applicationversion/:id', { id: '@_id' }, restActions);
  }
]).factory('TrackingVersion', [
  '$resource',
  'constants',
  function TrackingVersion($resource, constants) {
    return $resource(constants.urlserver + 'trackingversion/:id', { id: '@_id' }, restActions);
  }
]).factory('Instance', [
  '$resource',
  'constants',
  function Instance($resource, constants) {
    return $resource(constants.urlserver + 'instance/:id', { id: '@_id' }, restActions);
  }
]).factory('Parameter', [
  '$resource',
  'constants',
  function Parameter($resource, constants) {
    return $resource(constants.urlserver + 'parameter/:id', { id: '@_id' }, restActions);
  }
]).factory('ParamaterGroupment', [
  '$resource',
  'constants',
  function ParamaterGroupment($resource, constants) {
    return $resource(constants.urlserver + 'parametergroupment/:id', { id: '@_id' }, restActions);
  }
]);
'use strict';
angular.module('confman').factory('TableService', function TableService() {
  return {
    getNumMaxPage: function (total, nbparpage) {
      if (total && nbparpage > 0) {
        var numMaxPage = parseInt(total / nbparpage);
        //On regarde si le nb passe est un multiple de NbMax
        if (total % nbparpage === 0) {
          return numMaxPage;
        }
        return numMaxPage + 1;
      }
      return 0;
    },
    getPageSelector: function (page, numMaxPage) {
      var debut = 1, fin = numMaxPage, nbPageAffichee = numMaxPage;
      //On a un traitement particluier si la page en cours est plus grande que 6 pour limiter le nb affiche
      if (page > 6 && numMaxPage >= 10) {
        nbPageAffichee = 10;
        //On regarde si on a 4 pages après
        if (numMaxPage - page >= 4) {
          debut = page - 5;
          fin = page + 4;
        } else {
          //Sinon on se contente de celle présente
          debut = numMaxPage - 9;
        }
      }
      //Construction de la liste retournee en limitant à 10
      var tab = [];
      for (var i = debut, c = 0; i <= fin && c < 10; i++, c++) {
        tab.push(i);
      }
      return tab;
    }
  };
});
'use strict';
angular.module('confman').factory('Params', [
  '$http',
  'constants',
  function Params($http, constants) {
    return {
      getTrackingVersionByIdApp: function (id, callback) {
        $http.get(constants.urlserver + 'trackingversion/application/' + id).success(callback);
      },
      getAppVersionByIdApp: function (id, callback) {
        $http.get(constants.urlserver + 'applicationversion/application/' + id).success(callback);
      },
      getAppByIdEnv: function (id, callback) {
        $http.get(constants.urlserver + 'application/environment/' + id).success(callback);
      },
      getEnvByIdApp: function (id, callback) {
        $http.get(constants.urlserver + 'environment/application/' + id).success(callback);
      },
      getInstanceByIdAppAndIdEnv: function (idApp, idEnv, callback) {
        $http.get(constants.urlserver + 'instance/application/' + idApp + '/environment/' + idEnv).success(callback);
      },
      getParamValueByCriteria: function (filterCriteria, callbackOK, callbackKO) {
        $http.post(constants.urlserver + 'parametervalue/search', filterCriteria).success(callbackOK).error(callbackKO);
      },
      compareVersion: function ($scope, filterCriteria1, filterCriteria2, callbackOK) {
        filterCriteria1.page = 1;
        filterCriteria1.nbEltPerPage = 99999;
        filterCriteria2.page = 1;
        filterCriteria2.nbEltPerPage = 99999;
        $http.post(constants.urlserver + 'parametervalue/search', filterCriteria1).success(function (datas) {
          $scope.liste1 = datas.list;
          $http.post(constants.urlserver + 'parametervalue/search', filterCriteria2).success(function (data2s) {
            var finalList = [];
            $scope.liste2 = data2s.list;
            var cpt = 1;
            //We need a new list where all the params are aligned
            $scope.liste1.forEach(function (elt1) {
              var eltBinded = $scope.liste2.filter(function (elt2) {
                  return elt2.code === elt1.code;
                });
              var find = eltBinded.length > 0;
              finalList.push({
                elt1: elt1,
                elt2: find ? eltBinded[0] : {},
                codeInstance: find ? eltBinded[0].codeInstance : elt1.codeInstance,
                code: find ? eltBinded[0].code : elt1.code,
                difference: !find
              });
            });
            //some elements in list2 may be not present in list1
            $scope.liste2.forEach(function (elt2) {
              //Does it exist in second list?
              if ($scope.liste1.filter(function (elt1) {
                  return elt2.code === elt1.code;
                }).length == 0) {
                finalList.push({
                  elt1: {},
                  elt2: elt2,
                  codeInstance: elt2.codeInstance,
                  code: elt2.code,
                  difference: true
                });
              }
            });
            callbackOK(finalList);
          });
        });
      }
    };
  }
]);
/**
 * Directive to control the validity of version number
 */
angular.module('confman').directive('semverChecker', [
  '$http',
  'constants',
  function ($http, constants) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, elem, attrs, ctrl) {
        /*We need to check that the value is different to the original*/
        /*using push() here to run it as the last parser, after we are sure
                that other validators were run*/
        ctrl.$parsers.push(function (viewValue) {
          $http.get(constants.urlserver + '/applicationversion/check/' + viewValue).success(function (data) {
            ctrl.$setValidity('semver', data === 'true');
          });
          return viewValue;
        });
      }
    };
  }
]);