ipc.on("seasonTournamentLocations", function(evt, locations) {
	if(locations.length == 0) {
        showError('Upozornenie!',"V aplikácii sa nenachádzajú žiadne ihriská.");
        return;
    }

	var appElement = document.querySelector('[ng-app=seasonTournamentLocations]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
        return;
    
    $scope.$apply(function() {
        $scope.seasonTournamentLocations = locations;
        for(var i in $scope.seasonTournamentLocations) {
        	if($scope.seasonTournamentLocations[i].name.length > 50)
        		$scope.seasonTournamentLocations[i].name = $scope.seasonTournamentLocations[i].name.slice(0,50)+"…";

        	$scope.seasonTournamentLocations[i].logo = config.urls.defaultLocation;
        }
    });
})