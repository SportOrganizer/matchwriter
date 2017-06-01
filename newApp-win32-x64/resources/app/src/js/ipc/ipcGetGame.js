ipc.on("getGame", function(evt, match) {
	if(match.length == 0) {
        showError('Upozornenie!',"Nebol vybratý žiaden zápas.");
        return;
    }

	var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();

    if($scope != null){

        $scope.$apply(function() {
            $scope.selectedMatch = match;
            $scope.gameLoaded();
        });

    }

    var appLiveElement = document.querySelector('[ng-app=liveScore]');
    $scope = angular.element(appLiveElement).scope();
    
    if($scope == null)
        return;

    $scope.$apply(function() {
        $scope.selectedMatch = match;
    });
})