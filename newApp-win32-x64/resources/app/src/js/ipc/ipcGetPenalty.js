ipc.on("PenaltyTypes", function(evt, penalties) {
    var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
    	return;
    
    $scope.$apply(function() {
        $scope.penaltyTypes = penalties;
        $scope.selectedPenalty = $scope.penaltyTypes[0].id;
    });
})