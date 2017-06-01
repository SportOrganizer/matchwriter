ipc.on('did-finish-load',function(event, data){
	var requiredUrl = data.url;

	if(data.addTournament) {
		requiredUrl = config.urls.seasonTournaments + selectedTournament.id + data.url;
	}

	if(selectedTournamentLocation != null)
		requiredUrl += "?location="+selectedTournamentLocation.id;

	if(data.addTeam) {
		if(selectedTournamentMatch != null) {
			
			requiredUrl = config.urls.competitorTeam + selectedTournamentMatch.homeTeam.id;
			allAjax(windows, requiredUrl , data.load);
			requiredUrl = config.urls.competitorTeam + selectedTournamentMatch.awayTeam.id;
			allAjax(windows, requiredUrl , data.load);
		}
		
	} else {
		allAjax(windows, requiredUrl , data.load);
	}
});