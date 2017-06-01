ipc.on('getTimeOutLength',function(event, data){
	var requiredUrl = config.urls.seasonTournaments + data.game + config.urls.setting + "TIME_OUT_DURATION";
	allAjax(windows, requiredUrl, 'timeOutLength');

});
