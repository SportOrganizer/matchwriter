socket = new SockJS('http://sad.upc.uniba.sk:8080/floorball/chat');

stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
    setConnected(true);
    console.log('Connected: ' + frame);
    stompClient.subscribe('/topic/messages', function (greeting) {
        receiveWebsocket(JSON.parse(greeting.body));
    });
});

function disconnect() {
    if (stompClient != null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function sendName(data) {
    stompClient.send("/app/hello", {}, data);
}

function receiveWebsocket(message) {
    for(var j in windows) {
        windows[j].webContents.send("websocket", message);
    }
}

function setConnected(connected) {
    stompConnected = connected
}