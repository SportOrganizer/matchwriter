ipc.on("timeOutLength", function(evt, timeOutLength) {
    var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();

    if($scope != null) {
    	
		$scope.$apply(function() {
		    $scope.timeOutLength = timeOutLength.value;
		});
	}

	appElement = document.querySelector('[ng-app=liveScore]');
	$scope = angular.element(appElement).scope();

	if($scope == null) 
		return;

	$scope.$apply(function() {
		$scope.timeOutLength = timeOutLength.value;
	})
})