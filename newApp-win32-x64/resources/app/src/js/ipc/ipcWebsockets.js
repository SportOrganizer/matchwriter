ipc.on("websocket", function(evt, data) {
    var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
    	return;
    
    /*DATA:
    		'idGame': 
			'idCompetitorTeam':
    		'idGamePeriod': 
    		'gameTime': 
    		'realTime':
    		'idActivityType':
    		'idAssistPlayer':
	        'idGoalPlayer':
	        'idAssist2player': 
	        'idPenaltyPlayer':
	        'idPenaltyType': 
	        'idGoalType': 
	        'newScoreHome':
	        'newScoreAway': 
	        'penaltySeconds': 
	*/

	var activity = config.activities.find(x => x.id === data.idActivityType);

	switch(activity.name) {
		case "Start":
			$scope.play();
			break;
		case "Pause":
			$scope.pause();
			break;
		case "Penalty":
			break;
		case "Goal":
			$scope.$apply(function() {
                $scope.homeScore = data.newScoreHome;
                $scope.awayScore = data.newScoreAway;
            });
			break;
		case "HomeTeamTimeout":
			$scope.$apply(function() {
				$scope.timeOutHome();
			})
			break;
		case "AwayTeamTimeout":
			$scope.$apply(function() {
				$scope.timeOutAway();
			})
			break;
		case "PeriodStart":
			//TODO
			break;
		case "PeriodStop":
			//TODO
			break;
		case "MatchStart":
			//TODO
			console.log("Match start animation");
			break;
		case "MatchEnd":
			//TODO
			break;
		default:
			break;
	}

    /*
    $scope.$apply(function() {
        $scope.penaltyTypes = penalties;
        $scope.selectedPenalty = $scope.penaltyTypes[0].id;
    });*/
})