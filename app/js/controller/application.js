/**
 * Controller linked to the env list
 */
angular.module('confman').controller('applicationCtrl', function ($rootScope, $scope, $modal,$location, Application) {

    //Page definition
    $rootScope.currentPage = {
        name : 'Applications',
        description : 'List of yours apps',
        icon : 'ic_settings_24px',
        actionbar : [
            { icon : 'ic_insert_drive_file_24px',  action : function (){
                $location.path('/application/'+0);
            }}
        ]
    };

    //Load environments
    $scope.applications = Application.query();

    //Actions
    $scope.update =  function (elt){
       //TODO
    };
    $scope.create =  function (){
        //TODO
    };

});

angular.module('confman').controller('applicationDetailCtrl', function ($rootScope, $scope, $modal, modalConfirmDeleteCtrl, $routeParams,  Application) {

    //Page definition
    $rootScope.currentPage = {
        name : 'Application',
        description : $routeParams.id>0 ? 'Update Application' : 'Create new application',
        icon : 'ic_settings_24px'
    };


    $scope.routeparam = $routeParams;


});


