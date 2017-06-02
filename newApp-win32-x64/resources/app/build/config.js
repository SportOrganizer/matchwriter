var mainSettings = {
	server: 	'http://sad.upc.uniba.sk:8080/',
	core: 		'http://sad.upc.uniba.sk:8080/core/',
	documents:  'http://sad.upc.uniba.sk:8080/core/document/',
	floorball: 	'http://sad.upc.uniba.sk:8080/floorball/'
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
	seasonTournamentMatchGoalType: mainSettings.floorball + 'goaltype/',
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

var configuration = {
	server: 	mainSettings,
	urls: 		urls,
	activities: activities,
	names:      names
}

module.exports = configuration;