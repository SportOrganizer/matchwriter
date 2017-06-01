document.onreadystatechange = function () {
	if(document.readyState != 'complete') {
		return;
	}
	
	var pageName = document.location.href.match(/[^\/]+$/)[0];

	switch(pageName) {
		case 'index.html':
			sendIPC('seasonTournaments',
					config.urls.seasonTournaments,
					false,
					false);
			ipc.send('resetMatch', {});
			break;
		case 'location.html':
			sendIPC('seasonTournamentLocations',
					config.urls.seasonTournamentLocations,
					true,
					false);
			ipc.send('resetMatch', {});
			break;
		case 'matches.html':
			sendIPC('seasonTournamentMatches',
					config.urls.seasonTournamentMatches,
					true,
					false);
			ipc.send('resetMatch', {});
			break;
		case 'matchWriter.html':
			sendIPC('matchWriterRosters',
					config.urls.competitorTeam,
					false,
					true);
			break;
		case 'liveScore.html':
			sendIPC('matchWriterRostersLive',
					config.urls.competitorTeam,
					false,
					true);
			break;
	}

	$("a[sendIpc]").click(function() {
			ipc.send('buttonPressed', {myUrl: $(this).attr("sendIpc")});
	});
	
}

function sendIPC(myload, myurl, myaddTournament, myAddTeam) {
	ipc.send('did-finish-load', {	load: 			myload,
									url:  			myurl,
									addTournament: 	myaddTournament,
									addTeam: 		myAddTeam
								});	
}