ipc.on('resetMatch',function(event, data){
	selectedTournamentMatch = null;
	for(var j in windows) {
		windows[j].webContents.send("resetMatch", null);
	}
});
