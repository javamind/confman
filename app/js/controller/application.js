

angular.module('confman').controller('applicationCtrl', function ($rootScope, $scope,$routeParams) {
    $rootScope.currentPage = {
        name : "application",
        actionbar : []
    };

    $scope.params = $routeParams;
})

angular.module('confman').controller('applicationDetailCtrl', function ($rootScope, $scope,$routeParams) {
    $rootScope.currentPage = {
        name : "Detail application",
        actionbar : []
    };

    $scope.params = $routeParams;
})