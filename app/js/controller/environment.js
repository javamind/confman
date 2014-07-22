/**
 * Controller linked to the env list
 */
confman.controller('environmentCtrl', function ($rootScope, $scope, $materialDialog, $location, Environment) {
    var delete_env =  function (){
        //dialog();
        alert($scope.envToDelete)
    };


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
    $scope.environments = Environment.query();
    //Init env selected for deletion
    $scope.environments.forEach(function logArrayElements(element, index) {
        $scope.envToDelete.envId = true;
    });


    $scope.update_env =  function (id){
        $location.path('/environment/'+id);
    };


})

confman.controller('environmentDetailCtrl', function ($rootScope, $scope,$routeParams) {
    $rootScope.currentPage = {
        name : "Detail Environment",
        actionbar : []
    };

    $scope.params = $routeParams;
});