'use strict';

/**
 * Controller linked to the env list
 */
angular.module('confman').controller('environmentCtrl', ['$rootScope', '$scope', '$modal', '$filter', 'Environment',
    function ($rootScope, $scope, $modal, $filter, Environment) {
        $rootScope.callbackOK();

        //Page definition
        $rootScope.currentPage = {
            code: 'env',
            name : $filter('translate')('env.title'),
            description : $filter('translate')('env.description'),
            icon : 'ic_settings_24px'
        };

        //Load environments
        $scope.environments = Environment.query();
        //$scope.entity = { verb :null, content: { code:' ', label:' '}}

        //Actions
        $scope.update =  function (elt){
            $scope.entity = {
                verb : $filter('translate')('global.verb.update') + ' ' + $filter('translate')('env.name'),
                content : elt,
                selected : elt.id
            };
        };
        $scope.create =  function (){
            $scope.entity = {
                verb : $filter('translate')('global.verb.create') + ' ' + $filter('translate')('env.name'),
                content : {},
                selected : null
            };
        };
        $scope.delete =  function (elt, $event){
            var modalInstance = $modal.open({
                templateUrl: 'modalConfirmDelete.html',
                controller: 'ConfirmDeleteCtrl',
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
                        $scope.entity.verb = null;
                    },
                    $scope.callbackKO);
            });
        };
        $scope.save =  function (form){
            if(form.$error.required){
                $rootScope.setError($filter('translate')('env.messages.error.required'));
                return;
            }
            //We check code existence
            if(verify_code_unicity($scope.environments, $scope.entity.content)>0){
                $rootScope.setError($filter('translate')('env.messages.error.used'));
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
                            $scope.entity.verb = null;
                        },
                        $scope.callbackKO);
            }
            else{
                $scope.entity.content.$update($scope.callbackOK, $scope.callbackKO);
            }
        };

    }
]);


