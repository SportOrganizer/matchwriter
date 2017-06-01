function sendWebSockets(data) {
	ipc.send('webSocket', data);
}