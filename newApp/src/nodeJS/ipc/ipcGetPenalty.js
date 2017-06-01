ipc.on('getPenaltyTypes',function(event, data){
	var requiredUrl = config.urls.seasonTournaments + data.game + config.urls.seasonTournamentMatchPenalty;
	allAjax(windows, requiredUrl, 'PenaltyTypes');
});
