function sendDataToLive(name, data) {
	var mydata = {
		name: name,
	  	data: data
	};
	
	ipc.send('sendData', mydata);
}