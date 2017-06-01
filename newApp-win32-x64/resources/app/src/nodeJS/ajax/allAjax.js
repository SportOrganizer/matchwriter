function allAjax(windows, url, ipcName) {
	for(var j in windows) {
		windows[j].webContents.send("isAjaxStartLoading", "");
	}

	makeAjax(url, windows, function(response) {
		for(var j in windows) {
			windows[j].webContents.send(ipcName, response);
			windows[j].webContents.send("isAjaxFinishLoading", "");
		}
	})
}