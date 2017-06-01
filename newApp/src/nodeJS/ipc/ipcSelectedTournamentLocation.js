ipc.on('selectedTournamentLocation',function(event, data){
	selectedTournamentLocation = data.location;

	if(selectedTournamentLocation != null) {
		defaultWin.loadURL(`file://${__dirname}/html/matches.html`);
	}
});
