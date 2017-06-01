ipc.on('getGame',function(event, data){
	for(var j in windows) {
		windows[j].webContents.send("getGame", selectedTournamentMatch);
	}
});
