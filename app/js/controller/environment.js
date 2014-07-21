

confman.controller('environmentCtrl', function ($rootScope, $scope,$routeParams) {
    $rootScope.currentPage = {
        name : "Environment",
        actionbar : []
    };

    $scope.params = $routeParams;
})

confman.controller('environmentDetailCtrl', function ($rootScope, $scope,$routeParams) {
    $rootScope.currentPage = {
        name : "Detail Environment",
        actionbar : []
    };

    $scope.params = $routeParams;
})