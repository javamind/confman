'use strict';

angular.module('confman')
  .factory('Params', function Params($http, constants) {
    function getTrackingVersionByIdApp(id, callback) {
      $http
        .get(constants.urlserver + 'app/trackingversion/application/' + id)
        .success(callback);
    }

    function getAppVersionByIdApp(id, callback) {
      $http
        .get(constants.urlserver + 'app/applicationversion/application/' + id)
        .success(callback);
    }

    function getAppByIdEnv(id, callback) {
      $http
        .get(constants.urlserver + 'app/application/environment/' + id)
        .success(callback);
    }

    function getEnvByIdApp(id, callback) {
      $http
        .get(constants.urlserver + 'app/environment/application/' + id)
        .success(callback);
    }

    function getInstanceByIdAppAndIdEnv(idApp, idEnv, callback) {
      $http
        .get(constants.urlserver + 'app/instance/application/' + idApp + '/environment/' + idEnv)
        .success(callback);
    }

    function getParamValueByCriteria(filterCriteria, callbackOK, callbackKO) {
      $http
        .post(constants.urlserver + 'app/parametervalue/search', filterCriteria)
        .success(callbackOK)
        .error(callbackKO);
    }

    function compareVersion($scope, filterCriteria1, filterCriteria2, callbackOK) {
      filterCriteria1.page = 1;
      filterCriteria1.nbEltPerPage = 99999;
      filterCriteria2.page = 1;
      filterCriteria2.nbEltPerPage = 99999;

      $http
        .post(constants.urlserver + 'app/parametervalue/search', filterCriteria1)
        .success(function (datas) {
          $scope.liste1 = datas.list;
          $http
            .post(constants.urlserver + 'app/parametervalue/search', filterCriteria2)
            .success(function (data2s) {
              var finalList = [];
              $scope.liste2 = data2s.list;
              var cpt = 1;
              1           //We need a new list where all the params are aligned
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
                  difference: !find || eltBinded[0].label !== elt1.label
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

    return {

      getTrackingVersionByIdApp: getTrackingVersionByIdApp,
      getAppVersionByIdApp: getAppVersionByIdApp,
      getAppByIdEnv: getAppByIdEnv,
      getEnvByIdApp: getEnvByIdApp,
      getInstanceByIdAppAndIdEnv: getInstanceByIdAppAndIdEnv,
      getParamValueByCriteria: getParamValueByCriteria,
      compareVersion: compareVersion
    }
  });