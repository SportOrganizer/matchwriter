ipc.on("resetMatch", function(evt, match) {
	var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
    	return;
    
    $scope.$apply(function() {
        $scope.selectedMatch = null;
    });
})