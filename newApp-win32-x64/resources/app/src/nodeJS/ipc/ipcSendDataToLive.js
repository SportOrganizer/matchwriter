ipc.on('sendData',function(event, data){
	for(var j in windows) {
		windows[j].webContents.send('newData', data);
	}
});
