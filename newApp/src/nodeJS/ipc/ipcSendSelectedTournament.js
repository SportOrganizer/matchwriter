ipc.on('sendSelectedTournament',function(event, data){
	for(var j in windows) {
		windows[j].webContents.send("selectThisTournament", selectedTournament);
	}
});