ipc.on('getGoalTypes',function(event, data){
	var requiredUrl = config.urls.seasonTournaments + data.game +"haha" + config.urls.seasonTournamentPeriod;//TODO nastaviť URL
	allAjax(windows, requiredUrl, 'goalTypes');

});
