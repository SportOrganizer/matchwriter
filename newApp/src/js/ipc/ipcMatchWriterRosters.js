ipc.on("matchWriterRosters", function(evt, matchRoster) {
    var container = $('<div/>', {
        class: "container-fluid",
    });

    var teamRow = $('<div/>', {
        class: "row teamRow",
    })

    teamRow.appendTo(container);

    $('<div/>', {
        class: "col-xs-12 teamName",
        text: matchRoster.team.name,
        id: "ti" + matchRoster.id
    }).appendTo(teamRow);

    $('<div/>', {
        class: "logoDialog",
        html: $("<img/>", {
            src: checkLogo(matchRoster.logo.path, config.urls.defaultTournamentLogo)
        })
    }).appendTo(teamRow);

    for(var i in matchRoster.competitorTeamPlayers) {
        var name = matchRoster.competitorTeamPlayers[i].personInfo.name + " " + matchRoster.competitorTeamPlayers[i].personInfo.surname;
        var number = matchRoster.competitorTeamPlayers[i].number;
        var capitan = matchRoster.competitorTeamPlayers[i].isCapitan;

        var result = "#" + number + " - " + name;

        if(capitan) 
            result += " (C)";

        var playerRow = $('<div/>', {
            class: "col-xs-5 playerRow"
        });

        $('<input />', { 
            type: 'checkbox', 
            id: 'cb'+matchRoster.competitorTeamPlayers[i].id}
        ).appendTo(playerRow);

        $('<label />', { 
            'for': 'cb'+matchRoster.competitorTeamPlayers[i].id, 
            text: result }
        ).appendTo(playerRow);

        playerRow.appendTo(teamRow);
    }

    container.appendTo($("#myConfirm .modal-body .text"));

    $("#myConfirm .header").html("Súpiska tímov");

    var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
        return;
    
    $scope.$apply(function() {
        $(matchRoster.competitorTeamPlayers).each(function (index) {
            this.playing = false;
        });

        if(matchRoster.id == $scope.selectedMatch.homeTeam.id)
            $scope.selectedMatch.homeTeam.competitorTeamPlayers = matchRoster.competitorTeamPlayers;
        else if(matchRoster.id == $scope.selectedMatch.awayTeam.id)
            $scope.selectedMatch.awayTeam.competitorTeamPlayers = matchRoster.competitorTeamPlayers;
    });

    $('#myConfirm').modal({
        backdrop: 'static',
        keyboard: false
    });
})