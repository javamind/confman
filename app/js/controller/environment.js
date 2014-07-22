/**
 * Controller linked to the env list
 */
confman.controller('environmentCtrl', function ($rootScope, $scope, $materialDialog, $location, Environment) {
    //delete an environment
    var delete_env =  function (){
        //We read the env to delete
        var eltToDelete = [];
        var c=0;
        $scope.environments.forEach(function (element) {
            if(element.todelete){
                eltToDelete[c++] = element;
            }
        });
        if(eltToDelete.length>0){
            $scope.todelete= {
                entity : 'environments'
            };
            $materialDialog({
                templateUrl: 'dialog/dialog-confirm-delete.html',
                controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
                    $scope.close = function() {
                        $hideDialog();
                    };
                }]
            });

        }

    };

    //Page definition
    $rootScope.currentPage = {
        name : 'Environment',
        actionbar : [
            { icon : 'ic_insert_drive_file_24px',  action : function (){
                $location.path('/environment/'+0);
            }},
            { icon : 'ic_delete_24px',  action : delete_env}
        ]
    };

    //Load environments
    $scope.environments = Environment.query({}, function(elements){
        //Init env selected for deletion
        elements.forEach(function (element) {
            element.todelete = false;
        });
    });


    //update an environment
    $scope.update_env =  function (elt){
        //$location.path('/environment/'+id);
        $scope.entity = {
            verb : 'Update environment',
            content : elt
        };
    };




})

confman.controller('environmentDetailCtrl', function ($rootScope, $scope,$routeParams) {
    $rootScope.currentPage = {
        name : 'Detail Environment',
        actionbar : []
    };

    $scope.params = $routeParams;
});