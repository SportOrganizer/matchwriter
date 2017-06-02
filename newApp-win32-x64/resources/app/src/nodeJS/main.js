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
	//defaultWin.setMenu(null);

	windows.push(defaultWin)
})
