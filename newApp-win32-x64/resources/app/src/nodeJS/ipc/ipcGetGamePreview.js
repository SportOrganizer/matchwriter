ipc.on('getGamePreview',function(event, data){
	for(var j in windows) {
		windows[j].webContents.send("getGamePreview", selectedTournamentMatch);
	}
});
