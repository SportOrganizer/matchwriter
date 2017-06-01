ipc.on('getGamePeriods',function(event, data){
	var requiredUrl = config.urls.seasonTournaments + data.game + config.urls.seasonTournamentPeriod;
	allAjax(windows, requiredUrl, 'gamePeriods');
});
