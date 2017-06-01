ipc.on("gamePeriods", function(evt, gamePeriods) {
    var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();
    
    if($scope == null)
    	return;

    $scope.$apply(function() {
        $scope.periods = gamePeriods;
    });
})