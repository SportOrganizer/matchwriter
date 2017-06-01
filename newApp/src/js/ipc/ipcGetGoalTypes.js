ipc.on("goalTypes", function(evt, goalTypes) {
    var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();
    
    if($scope == null)
    	return;

    $scope.$apply(function() {
        $scope.goalTypes = goalTypes;//TODO zistiť pravdu
    });
})