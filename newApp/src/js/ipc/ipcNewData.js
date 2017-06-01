ipc.on('newData',function(event, data){
	var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
    	return;
    
    switch(data.name) {
    	case "PeriodStart": 
    		$scope.$apply(function() {
    			$scope.periodStart = data.data;
    		});
    		break;
        case "updateTimer":
            $scope.$apply(function() {
                $scope.updateTimer = data.data.time;
                $scope.period = data.data.period;
            });
            break;
        case "penalty":
            $scope.$apply(function() {
                $scope.penaltyPlayer = "#" + data.data.number + " " + data.data.name;
                $scope.penaltyPhoto = data.data.path;
                $scope.penaltyType = data.data.penalty;
                $scope.penaltyTeam = data.data.team;
            });

            showPenalty();
            break;
        case "addPenalty": 
            $scope.$apply(function() {
                $scope.addNewPenalty(data.data.type, data.data.number, data.data.time, data.data.name);
            });

            break;
        case "goal":
            $scope.$apply(function() {
                $scope.goalPlayer = data.data.goalPlayer;
                $scope.goalTeam = data.data.goalTeam;
                $scope.goalPhoto = data.data.path;
                $scope.assist1Player = data.data.assist1Player;
                $scope.assist2Player = data.data.assist2Player;
            });

            showGoal();
            break;

        case "shot":
            $scope.$apply(function() {
                switch(data.type) {
                    case "home":
                        $scope.homeShots = data.shots;
                        break;
                    case "away":
                        $scope.awayShots = data.shots;
                        break;
                }
            });
            break;
    }
});
