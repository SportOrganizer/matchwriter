const electron = require('electron')

const config = require('./config')
const path = require('path')
const http = require('http')
const SockJS = require('sockjs-client')
const Stomp = require('stompjs');

const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain

let data = []
let windows = []

let defaultWin = null
let selectedTournament = null
let selectedTournamentLocation = null
let selectedTournamentMatch = null
let socket = null
let stompClient = null
let stompConnected = false

app.on('ready', _ => {
	defaultWin = new BrowserWindow( {
		height: 600,
		width: 800
	})

	defaultWin.loadURL(`file://${__dirname}/html/index.html`)

	defaultWin.on('closed', _ => {
		app.quit()
	})

	defaultWin.maximize()
	defaultWin.setMenu(null);

	windows.push(defaultWin)
})

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
function makeAjax(url, windows, callback) {
	console.log(url);
	http.get(url, (res) => {
	  
		const statusCode = res.statusCode;
		const contentType = res.headers['content-type'];

		let error;

		if (statusCode !== 200) {
			error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`);
		} else if (!/^application\/json/.test(contentType)) {
			error = new Error(`Invalid content-type.\n` + `Expected application/json but received ${contentType}`);
		}

		if (error) {
			sendError("Nastala neočakávaná chyba (" + error.message + ")");
			res.resume();
			return;
		}
		
		let rawData = '';
		
		res.setEncoding('utf8');
		res.on('data', (chunk) => rawData += chunk);
		res.on('end', () => {
			try {
				let parsedData = JSON.parse(rawData);
				data = parsedData;
				return callback(data);
			} catch (e) {
				console.log(e.message);
			}
		});
	}).on('error', (e) => {
		console.log("Error2: " +  `Got error: ${e.message}`);
		sendError("Nastala neočakávaná chyba (" + e.message + ")");
	});
}
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

					//nextWindow.setMenu(null);
					
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
					nextWindow.setMenu(null); 

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
ipc.on('did-finish-load',function(event, data){
	var requiredUrl = data.url;

	if(data.addTournament) {
		requiredUrl = config.urls.seasonTournaments + selectedTournament.id + data.url;
	}

	if(selectedTournamentLocation != null)
		requiredUrl += "?location="+selectedTournamentLocation.id;

	if(data.addTeam) {
		if(selectedTournamentMatch != null) {
			
			requiredUrl = config.urls.competitorTeam + selectedTournamentMatch.homeTeam.id;
			allAjax(windows, requiredUrl , data.load);
			requiredUrl = config.urls.competitorTeam + selectedTournamentMatch.awayTeam.id;
			allAjax(windows, requiredUrl , data.load);
		}
		
	} else {
		allAjax(windows, requiredUrl , data.load);
	}
});
function sendError(data) {
	for(var j in windows) {
		windows[j].webContents.send('errorAjax', data);
	}
}
ipc.on('getGame',function(event, data){
	for(var j in windows) {
		windows[j].webContents.send("getGame", selectedTournamentMatch);
	}
});

ipc.on('getGamePeriods',function(event, data){
	var requiredUrl = config.urls.seasonTournaments + data.game + config.urls.seasonTournamentPeriod;
	allAjax(windows, requiredUrl, 'gamePeriods');
});

ipc.on('getGamePreview',function(event, data){
	for(var j in windows) {
		windows[j].webContents.send("getGamePreview", selectedTournamentMatch);
	}
});

ipc.on('getGoalTypes',function(event, data){
	var requiredUrl = config.urls.seasonTournamentMatchGoalType;
	allAjax(windows, requiredUrl, 'goalTypes');

});

ipc.on('getPenaltyTypes',function(event, data){
	var requiredUrl = config.urls.seasonTournaments + data.game + config.urls.seasonTournamentMatchPenalty;
	allAjax(windows, requiredUrl, 'PenaltyTypes');
});

ipc.on('getTimeOutLength',function(event, data){
	var requiredUrl = config.urls.seasonTournaments + data.game + config.urls.setting + "TIME_OUT_DURATION";
	allAjax(windows, requiredUrl, 'timeOutLength');

});

ipc.on('resetMatch',function(event, data){
	selectedTournamentMatch = null;
	for(var j in windows) {
		windows[j].webContents.send("resetMatch", null);
	}
});

ipc.on('selectedTournament',function(event, data){
	selectedTournament = data.tournament;

	if(selectedTournament != null) {
		defaultWin.loadURL(`file://${__dirname}/html/location.html`);
	}

	for(var j in windows) {
		windows[j].webContents.send("selectThisTournament", selectedTournament);
	}
});
ipc.on('selectedTournamentLocation',function(event, data){
	selectedTournamentLocation = data.location;

	if(selectedTournamentLocation != null) {
		defaultWin.loadURL(`file://${__dirname}/html/matches.html`);
	}
});

ipc.on('selectedTournamentMatch',function(event, data){
	selectedTournamentMatch = data.match;
	if(selectedTournamentMatch != null) {
		defaultWin.loadURL(`file://${__dirname}/html/matchWriter.html`);
	}
});

ipc.on('sendData',function(event, data){
	for(var j in windows) {
		windows[j].webContents.send('newData', data);
	}
});

ipc.on('sendSelectedTournament',function(event, data){
	for(var j in windows) {
		windows[j].webContents.send("selectThisTournament", selectedTournament);
	}
});
ipc.on('webSocket',function(event, data){
	sendName(data);
});

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