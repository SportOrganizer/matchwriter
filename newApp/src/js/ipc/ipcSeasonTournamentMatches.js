ipc.on("seasonTournamentMatches", function(evt, matches) {
	var appElement = document.querySelector('[ng-app=seasonTournamentMatches]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
        return;
    
    $scope.$apply(function() {
        if(matches.length == 0) {
            showError('Upozornenie!',"V aplikácii sa nenachádzajú žiadne zápasy.");
            return;
        }

        $scope.seasonTournamentMatches = matches;

        for(var i in $scope.seasonTournamentMatches) {
        	//Set date
        	var myDate = new Date($scope.seasonTournamentMatches[i].startTime);
        	var myTime = myDate.toTimeString().split(' ')[0].split(':');
        	myTime = myTime[0] + ":" + myTime[1];
        	myDate = myDate.toLocaleDateString() + " - " ;

        	$scope.seasonTournamentMatches[i].startTime = myDate + myTime;

        	//Set home logo
            $scope.seasonTournamentMatches[i].homeTeam.logo.path = checkLogo($scope.seasonTournamentMatches[i].homeTeam.logo.path, config.urls.defaultTournamentLogo);
            
           	//set away logo
            $scope.seasonTournamentMatches[i].awayTeam.logo.path = checkLogo($scope.seasonTournamentMatches[i].awayTeam.logo.path, config.urls.defaultTournamentLogo);
            $scope.seasonTournamentMatches[i].homeTeam.team.fullName = $scope.seasonTournamentMatches[i].homeTeam.team.name;
            $scope.seasonTournamentMatches[i].awayTeam.team.fullName = $scope.seasonTournamentMatches[i].awayTeam.team.name;
            
            if($scope.seasonTournamentMatches[i].homeTeam.team.name.length > 20) {
        		$scope.seasonTournamentMatches[i].homeTeam.team.name = $scope.seasonTournamentMatches[i].homeTeam.team.name.slice(0,20)+"…";
            }

        	if($scope.seasonTournamentMatches[i].awayTeam.team.name.length > 20) {
        		$scope.seasonTournamentMatches[i].awayTeam.team.name = $scope.seasonTournamentMatches[i].awayTeam.team.name.slice(0,20)+"…";
            }
        }
    }); 
})