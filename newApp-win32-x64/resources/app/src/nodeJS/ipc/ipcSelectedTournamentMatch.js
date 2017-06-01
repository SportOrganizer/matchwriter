ipc.on('selectedTournamentMatch',function(event, data){
	selectedTournamentMatch = data.match;
	if(selectedTournamentMatch != null) {
		defaultWin.loadURL(`file://${__dirname}/html/matchWriter.html`);
	}
});
