'use strict';

/**
 * Controller linked to the user list
 */
angular.module('confman').controller('userCtrl', ['$rootScope', '$scope', '$modal', '$filter', 'User',
    function ($rootScope, $scope, $modal, $filter, User) {
        $rootScope.callbackOK();

        //Page definition
        $rootScope.currentPage = {
            code: 'user',
            name : $filter('translate')('user.title'),
            description : $filter('translate')('user.description'),
            icon : 'ic_settings_24px'
        };

        //Load users
        $scope.users = User.query();
        //$scope.entity = { verb :null, content: { code:' ', label:' '}}

        //Actions
        $scope.update =  function (elt){
            $scope.entity = {
                verb : $filter('translate')('global.verb.update') + ' ' + $filter('translate')('user.name'),
                content : elt,
                selected : elt.id
            };
        };
        $scope.create =  function (){
            $scope.entity = {
                verb : $filter('translate')('global.verb.create') + ' ' + $filter('translate')('user.name'),
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
                        return $filter('translate')('user.name.the') + ' <b>' +  elt.login + '</b>';
                    }
                }
            });
            //callback dans lequel on fait la suppression
            modalInstance.result.then(function (response) {
                $event.stopPropagation();
                User.delete(
                    elt,
                    function(data){
                        $scope.error=null;
                        var index = find_entity_index($scope.users, elt);
                        if(index>=0) {
                            $scope.users.splice(index, 1);
                        }
                        $scope.entity.content = null;
                        $scope.entity.verb = null;
                    },
                    $scope.callbackKO);
            });
        };
        $scope.save =  function (form){
            if(form.$error.required){
                $rootScope.setError($filter('translate')('user.messages.error.required'));
                return;
            }
            //We check code existence
            if(verify_code_unicity($scope.users, $scope.entity.content)>0){
                $rootScope.setError($filter('translate')('user.messages.error.used'));
                return;
            }

             if(!$scope.entity.content.id){
                User.save(
                        $scope.entity.content,
                        function(data){
                            $scope.error=null;
                            if(!$scope.users){
                                $scope.users = {};
                            }
                            $scope.users.push(data)
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


