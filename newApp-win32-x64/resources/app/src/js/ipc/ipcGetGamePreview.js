ipc.on("getGamePreview", function(evt, match) {
	if(match == null) {
        return;
    }

	var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
    	return;
    
    $scope.$apply(function() {
        $scope.selectedMatch = match;
        $(".overlayBeforeStart").css("opacity",0);
        ipc.send('sendSelectedTournament', {});  
    });
})