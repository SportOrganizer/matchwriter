ipc.on("matchWriterRostersLive", function(evt, matchRoster) {

    var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null) 
        return;
    
    var homeTeamId = $scope.selectedMatch.homeTeam.team.id;
    var awayTeamId = $scope.selectedMatch.awayTeam.team.id;
    
    $scope.$apply(function() {
        if(matchRoster.team.id == homeTeamId) {
            $scope.homePlayers = matchRoster.competitorTeamPlayers;
        } else {
            $scope.awayPlayers = matchRoster.competitorTeamPlayers;
        }
    });
    
})