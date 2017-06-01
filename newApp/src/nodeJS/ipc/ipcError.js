function sendError(data) {
	for(var j in windows) {
		windows[j].webContents.send('errorAjax', data);
	}
}