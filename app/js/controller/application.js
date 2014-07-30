/**
 * Controller linked to the env list
 */
angular.module('confman').controller('applicationCtrl', function ($rootScope, $scope, $modal,$location, Application) {

    //Page definition
    $rootScope.currentPage = {
        name : 'Applications',
        description : 'List of yours apps',
        icon : 'ic_settings_24px'
    };

    //Load environments
    $scope.applications = Application.query();

    //Actions
    $scope.update =  function (elt){
        $location.path('/application/'+ elt.id);
    };
    $scope.create =  function (){
        $location.path('/application/'+0);
    };

});

angular.module('confman').controller('applicationDetailCtrl', function ($rootScope, $scope, $modal, modalConfirmDeleteCtrl, $routeParams,  Application, SoftwareSuite) {

    //Page definition
    $rootScope.currentPage = {
        name : 'Application',
        description : $routeParams.id>0 ? 'Update Application' : 'Create new application',
        icon : 'ic_settings_24px'
    };

    //Load software suites
    $scope.softwaresuites = SoftwareSuite.query();

    //Load environments
    if($routeParams.id>0){
        $scope.application = Application.get({id:$routeParams.id});
    }
    else{
        $scope.application = {};
    }

    $scope.updateInstance = function(instance){
        $modal.open({
            templateUrl: 'modalAddEltToApplication.html',
            controller: function($scope, $modalInstance,instance){
                alert(instance.id)
                $scope.appelt = {
                    title : 'Update instance',
                    verb : 'Update',
                    content : instance
                }
                $scope.ok = function (instance){
                    alert('sdfdsfsd')
                    $modalInstance.close(true);
                }
                $scope.cancel = function (instance){
                    $modalInstance.dismiss(false);
                }
            },
            resolve: {
                instance : function () {
                    return instance;
                }
            }
        });
    };

});


