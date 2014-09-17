'use strict';

/**
 * Controller linked to the env list
 */
angular.module('confman').controller('environmentCtrl', function ($rootScope, $scope, $modal, Environment) {
    $rootScope.callbackOK();

    //Page definition
    $rootScope.currentPage = {
        code: 'env',
        name : 'Environment',
        description : 'You can use several environments to offer different context for developers, testers, the final users... ' +
            'For example you can have development, staging, production...',
        icon : 'ic_settings_24px'
    };

    //Load environments
    $scope.environments = Environment.query();
    //$scope.entity = { verb :null, content: { code:' ', label:' '}}

    //Actions
    $scope.update =  function (elt){
        $scope.entity = {
            verb : 'Update environment',
            content : elt
        };
    };
    $scope.create =  function (){
        $scope.entity = {
            verb : 'Create environment',
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
                    return 'environment ' + elt.code;
                }
            }
        });
        //callback dans lequel on fait la suppression
        modalInstance.result.then(function (response) {
            $event.stopPropagation();
            Environment.delete(
                elt,
                function(data){
                    $scope.error=null;
                    var index = find_entity_index($scope.environments, elt);
                    if(index>=0) {
                        $scope.environments.splice(index, 1);
                    }
                    $scope.entity.content = null;
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
        if(verify_code_unicity($scope.environments, $scope.entity.content)>0){
            $rootScope.setError('The code [' + $scope.entity.content + '] is already in use');
            return;
        }

         if(!$scope.entity.content.id){
            Environment.save(
                    $scope.entity.content,
                    function(data){
                        $scope.error=null;
                        if(!$scope.environments){
                            $scope.environments = {};
                        }
                        $scope.environments.push(data)
                        $scope.entity.content = null;
                    },
                    $scope.callbackKO);
        }
        else{
            $scope.entity.content.$update($scope.callbackOK, $scope.callbackKO);
        }
    };

})


