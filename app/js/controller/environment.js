

confman.controller('environmentCtrl', function ($rootScope, $scope, $materialDialog, $location, Environment) {
    var create_env =  function (){
        alert('create')
    };
    var delete_env =  function (){
        //dialog();
        alert($scope.data)
    };


    $rootScope.currentPage = {
        name : 'Environment',
        actionbar : [
            { icon : 'ic_insert_drive_file_24px',  action : create_env},
            { icon : 'ic_delete_24px',  action : delete_env}
        ]
    };

    $scope.environments = Environment.query();

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