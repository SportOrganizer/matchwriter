ipc.on('getGoalTypes',function(event, data){
	var requiredUrl = config.urls.seasonTournamentMatchGoalType;
	allAjax(windows, requiredUrl, 'goalTypes');

});
