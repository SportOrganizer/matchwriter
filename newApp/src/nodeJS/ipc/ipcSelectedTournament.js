ipc.on('selectedTournament',function(event, data){
	selectedTournament = data.tournament;

	if(selectedTournament != null) {
		defaultWin.loadURL(`file://${__dirname}/html/location.html`);
	}

	for(var j in windows) {
		windows[j].webContents.send("selectThisTournament", selectedTournament);
	}
});