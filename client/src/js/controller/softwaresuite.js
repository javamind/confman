'use strict';
/**
 * Controller linked to the application's groupment list
 */
angular.module('confman').controller('softwaresuiteCtrl', function ($rootScope, $scope, $http, $modal, SoftwareSuite, Environment, constants) {
    $rootScope.callbackOK();

    //Page definition
    $rootScope.currentPage = {
        code: 'soft',
        name : 'Software Suite',
        description : 'In a complex context you have often a set of of software',
        icon : 'ic_settings_24px'
    };


    //Load applicationgroupments
    $scope.softwaresuites = SoftwareSuite.query();


    //Actions
    $scope.update =  function (elt){
        $scope.entity = {
            verb : 'Update software suite',
            content : elt,
            selected : elt.id
        };
        $scope.hideEnv=true;
        //Load environments
        $scope.environments = Environment.query(function(){
            $http.get(constants.urlserver + '/softwaresuite/' + elt.id +'/environment')
                .success(function (data) {
                    data.forEach(function(element){
                        //on parcours la liste des env
                        for(var i = 0 ; i<$scope.environments.length ; i++){
                            var o = $scope.environments[i];
                            if(o.id===element.idEnvironmentDto){
                                o.selected = true;
                                break;
                            }
                        }
                    });
                    $scope.hideEnv=false;
                })
                .error(function (data) {
                    $rootScope.setError('Error on environments load ');
                });
        });

    };
    $scope.create =  function (){
        $scope.entity = {
            verb : 'Create software suite',
            content : {}
        };
    };
    $scope.delete =  function (elt, $event){
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
                entity_todelete : function () {
                    return 'software suite ' + elt.code;
                }
            }
        });
        //callback dans lequel on fait la suppression
        modalInstance.result.then(function (response) {
            $event.stopPropagation();
            SoftwareSuite.delete(
                elt,
                function(data){
                    $scope.error=null;
                    var index = find_entity_index($scope.softwaresuites, elt);
                    if(index>=0) {
                        $scope.softwaresuites.splice(index, 1);
                    }
                    $scope.entity.content = null;
                    $scope.entity.verb = null;
                },
                $scope.callbackKO);
        });
    };
    $scope.save =  function (form){
        if(form.$error.required){
            $rootScope.setError('Your form is not submitted : code and label are required');
            return;
        }
        //We check code existence
        if(verify_code_unicity($scope.softwaresuites, $scope.entity.content)>0){
            $rootScope.setError('The code [' + $scope.entity.content + '] is already in use');
            return;
        }

        if(!$scope.entity.content.id){
            SoftwareSuite.save(
                $scope.entity.content,
                function(data){
                    $rootScope.error=null;
                    if(!$scope.softwaresuites){
                        $scope.softwaresuites = {};
                    }
                    $scope.softwaresuites.push(data);
                    $scope.entity.content = data;
                    $scope.entity.verb = 'Update software suite';
                    $scope.entity.selected = data.id;
                },
                $scope.callbackKO);
        }
        else{
            //Environment linked to the suite
            var envs = $scope.environments.filter(function filter(env){
                return  env.selected;
            })
            if(envs) {
                var softenv = [];
                envs.forEach(function prepare(elt){
                    softenv.push({
                        idEnvironmentDto : elt.id,
                        codeEnvironmentDto : elt.code,
                        idSoftwareSuiteDto : $scope.entity.content.id,
                        codeSoftwareSuiteDto : $scope.entity.content.code
                    });
                })
                $scope.entity.content.environments = softenv;
            }
            $scope.entity.content.$update($scope.callbackOK, $scope.callbackKO);
            $scope.entity.selected = $scope.entity.content.id;
        }
    };

})


