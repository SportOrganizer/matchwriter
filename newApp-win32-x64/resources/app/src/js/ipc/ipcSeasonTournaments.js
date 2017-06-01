ipc.on("seasonTournaments", function(evt, tournaments) {
    var appElement = document.querySelector('[ng-app=seasonTournaments]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
        return;
    
    $scope.$apply(function() {
    	if(tournaments.results.length == 0) {
    		showError('Upozornenie!',"V aplikácii sa nenachádzajú žiadne turnaje.");
    		return;
    	}

        for(var i in tournaments.results) {
            tournaments.results[i].logo.path = checkLogo(tournaments.results[i].logo.path, config.urls.defaultTournamentLogo);
        }
        $scope.seasonTournaments = tournaments.results;
        


        for(var i in $scope.seasonTournaments) {
        	if($scope.seasonTournaments[i].name.length > 50)
        		$scope.seasonTournaments[i].name = $scope.seasonTournaments[i].name.slice(0,50)+"…";
        }
    });
})