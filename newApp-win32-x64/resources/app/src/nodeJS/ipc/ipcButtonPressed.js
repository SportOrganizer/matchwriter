ipc.on('buttonPressed',function(event, data){
	var urlToOpen = data.myUrl;

	//open new windows if is not opened
	var electronScreen = electron.screen;
	var displays = electronScreen.getAllDisplays();

	while(displays.length != windows.length) {
		var externalDisplays = [];
		for (var i in displays) {
			if (displays[i].bounds.x != 0 || displays[i].bounds.y != 0) {
				externalDisplays.push(displays[i]);
			}

		}

		if (externalDisplays.length) {
			for(var i in externalDisplays) {
				var hasBeen = false;
				for(var k in windows) {
					if(windows[k].displayId == externalDisplays[i].id)
						hasBeen = true;
				}

				if(!hasBeen) {
					var nextWindow = new BrowserWindow({
						x: externalDisplays[i].bounds.x + 50,
						y: externalDisplays[i].bounds.y + 50,
						fullscreen: true
					});

					nextWindow.setMenu(null);
					
					nextWindow.displayId = externalDisplays[i].id;

					nextWindow.on('close', function() { //   <---- Catch close event
						for(var j in windows) {
							if (windows[j].displayId == this.displayId) {
								console.log("removing display")
								windows.splice(j, 1);
							}
						}
				    });


					nextWindow.loadURL(`file://${__dirname}/html/` + urlToOpen)

					windows.push(nextWindow)
				}
			}
		} else {
			for(var j in windows) {
				windows[j].webContents.send('errorAjax', "Nie je pripojená ďalšia obrazovka!");
			}
			return;
		}
	}
});