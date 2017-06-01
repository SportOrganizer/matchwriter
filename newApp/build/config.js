var mainSettings = {
	server: 	'http://sad.upc.uniba.sk:8080/',
	core: 		'http://sad.upc.uniba.sk:8080/core/',
	documents:  'http://sad.upc.uniba.sk:8080/core/document/',
}

var names = {
	liveScore: 'MatchWriter v1.0'
}

var urls = {
	defaultTournamentLogo: 		"../images/defaultTournament.png",
	defaultLocation: 			"../images/defaultPitch.png",
	documents: 					mainSettings.documents,
	seasonTournaments: 			mainSettings.core + 'seasontournament/',
	seasonTournamentGroup: 		mainSettings.core + 'seasontournamentgroup/',
	seasonTournamentMatches: 	'/game/',
	seasonTournamentLocations: 	'/location/',
	seasonTournamentPeriod: 	'/period/',
	seasonTournamentMatchPenalty:'/stpenaltysettings/',
	seasonTournamentMatchGoalType: '/goaltype/',
	competitorTeam: 			mainSettings.core + 'competitorteam/',
	setting: 					'/stsetting/',
	post: {
		playerChoose: mainSettings.core + 'game/gameplayer/'
	}
}

var activities = [
	{
		id: 1,
		name: "Start",
		showName: "Pokračovanie"
	},
	{
		id: 2,
		name: "Pause",
		showName: "Pauza"
	},
	{
		id: 3,
		name: "Penalty",
		showName: "Trest"
	},
	{
		id: 4,
		name: "Goal",
		showName: "Gól"
	},
	{
		id: 5,
		name: "HomeTeamTimeout",
		showName: "TimeOut - domáci tím"
	},
	{
		id: 6,
		name: "AwayTeamTimeout",
		showName: "TimeOut - hosťujúci tím"
	},
	{
		id: 7,
		name: "PeriodStart",
		showName: "Začiatok časti"
	},
	{
		id: 8,
		name: "PeriodStop",
		showName: "Koniec časti"
	},
	{
		id: 9,
		name: "MatchStart",
		showName: "Začiatok zápasu"
	},
	{
		id: 10,
		name: "MatchEnd",
		showName: "Koniec zápasu"
	}
]

var testData = {
	goalTypes: [
		{
			id:1,
			name:"Rovnovážny stav",
			cancelPenalty:1
		},
		{
			id:2,
			name:"Presilová hra",
			cancelPenalty:1
		},
		{
			id:3,
			name:"Oslabenie",
			cancelPenalty:1
		},
		{
			id:4,
			name:"Trestné strieľanie",
			cancelPenalty:0
		},
		{
			id:5,
			name:"Technický gól",
			cancelPenalty:1
		}
	],
	seasonTournamentTimeOutLength: 5
}

var configuration = {
	server: 	mainSettings,
	urls: 		urls,
	testData: 	testData,
	activities: activities,
	names:      names
}

module.exports = configuration;