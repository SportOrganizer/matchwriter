const electron = require('electron')
const config = require('../config')

const ipc = electron.ipcRenderer
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
ipc.on("errorAjax", function(evt, errorLog) {
    showError("Chyba!",errorLog);
})
ipc.on("gamePeriods", function(evt, gamePeriods) {
    var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();
    
    if($scope == null)
    	return;

    $scope.$apply(function() {
        $scope.periods = gamePeriods;
    });
})
ipc.on("getGame", function(evt, match) {
	if(match.length == 0) {
        showError('Upozornenie!',"Nebol vybratý žiaden zápas.");
        return;
    }

	var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();

    if($scope != null){

        $scope.$apply(function() {
            $scope.selectedMatch = match;
            $scope.gameLoaded();
        });

    }

    var appLiveElement = document.querySelector('[ng-app=liveScore]');
    $scope = angular.element(appLiveElement).scope();
    
    if($scope == null)
        return;

    $scope.$apply(function() {
        $scope.selectedMatch = match;
    });
})
ipc.on("getGamePreview", function(evt, match) {
	if(match == null) {
        return;
    }

	var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
    	return;
    
    $scope.$apply(function() {
        $scope.selectedMatch = match;
        $(".overlayBeforeStart").css("opacity",0);
        ipc.send('sendSelectedTournament', {});  
    });
})
ipc.on("goalTypes", function(evt, goalTypes) {
    var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();
    
    if($scope == null)
    	return;

    $scope.$apply(function() {
        $scope.goalTypes = goalTypes;//TODO zistiť pravdu
    });
})
ipc.on("PenaltyTypes", function(evt, penalties) {
    var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
    	return;
    
    $scope.$apply(function() {
        $scope.penaltyTypes = penalties;
        $scope.selectedPenalty = $scope.penaltyTypes[0].id;
    });
})
ipc.on("timeOutLength", function(evt, timeOutLength) {
    var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();

    if($scope != null) {
    	
		$scope.$apply(function() {
		    $scope.timeOutLength = timeOutLength.value;
		});
	}

	appElement = document.querySelector('[ng-app=liveScore]');
	$scope = angular.element(appElement).scope();

	if($scope == null) 
		return;

	$scope.$apply(function() {
		$scope.timeOutLength = timeOutLength.value;
	})
})
ipc.on("matchWriterRosters", function(evt, matchRoster) {
    var container = $('<div/>', {
        class: "container-fluid",
    });

    var teamRow = $('<div/>', {
        class: "row teamRow",
    })

    teamRow.appendTo(container);

    $('<div/>', {
        class: "col-xs-12 teamName",
        text: matchRoster.team.name,
        id: "ti" + matchRoster.id
    }).appendTo(teamRow);

    $('<div/>', {
        class: "logoDialog",
        html: $("<img/>", {
            src: checkLogo(matchRoster.logo.path, config.urls.defaultTournamentLogo)
        })
    }).appendTo(teamRow);

    for(var i in matchRoster.competitorTeamPlayers) {
        var name = matchRoster.competitorTeamPlayers[i].personInfo.name + " " + matchRoster.competitorTeamPlayers[i].personInfo.surname;
        var number = matchRoster.competitorTeamPlayers[i].number;
        var capitan = matchRoster.competitorTeamPlayers[i].isCapitan;

        var result = "#" + number + " - " + name;

        if(capitan) 
            result += " (C)";

        var playerRow = $('<div/>', {
            class: "col-xs-5 playerRow"
        });

        $('<input />', { 
            type: 'checkbox', 
            id: 'cb'+matchRoster.competitorTeamPlayers[i].id}
        ).appendTo(playerRow);

        $('<label />', { 
            'for': 'cb'+matchRoster.competitorTeamPlayers[i].id, 
            text: result }
        ).appendTo(playerRow);

        playerRow.appendTo(teamRow);
    }

    container.appendTo($("#myConfirm .modal-body .text"));

    $("#myConfirm .header").html("Súpiska tímov");

    var appElement = document.querySelector('[ng-app=matchWriter]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
        return;
    
    $scope.$apply(function() {
        $(matchRoster.competitorTeamPlayers).each(function (index) {
            this.playing = false;
        });

        if(matchRoster.id == $scope.selectedMatch.homeTeam.id)
            $scope.selectedMatch.homeTeam.competitorTeamPlayers = matchRoster.competitorTeamPlayers;
        else if(matchRoster.id == $scope.selectedMatch.awayTeam.id)
            $scope.selectedMatch.awayTeam.competitorTeamPlayers = matchRoster.competitorTeamPlayers;
    });

    $('#myConfirm').modal({
        backdrop: 'static',
        keyboard: false
    });
})
ipc.on("matchWriterRostersLive", function(evt, matchRoster) {

    var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null) 
        return;
    
    var homeTeamId = $scope.selectedMatch.homeTeam.team.id;
    var awayTeamId = $scope.selectedMatch.awayTeam.team.id;
    
    $scope.$apply(function() {
        if(matchRoster.team.id == homeTeamId) {
            $scope.homePlayers = matchRoster.competitorTeamPlayers;
        } else {
            $scope.awayPlayers = matchRoster.competitorTeamPlayers;
        }
    });
    
})
ipc.on('newData',function(event, data){
	var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
    	return;
    
    switch(data.name) {
    	case "PeriodStart": 
    		$scope.$apply(function() {
    			$scope.periodStart = data.data;
    		});
    		break;
        case "updateTimer":
            $scope.$apply(function() {
                $scope.updateTimer = data.data.time;
                $scope.period = data.data.period;
            });
            break;
        case "penalty":
            $scope.$apply(function() {
                $scope.penaltyPlayer = "#" + data.data.number + " " + data.data.name;
                $scope.penaltyPhoto = checkLogo(data.data.path, config.urls.defaultPlayer);
                $scope.penaltyType = data.data.penalty;
                $scope.penaltyTeam = data.data.team;
            });

            showPenalty();
            break;
        case "addPenalty": 
            $scope.$apply(function() {
                $scope.addNewPenalty(data.data.type, data.data.number, data.data.time, data.data.name);
            });

            break;
        case "goal":
            $scope.$apply(function() {
                $scope.goalPlayer = data.data.goalPlayer;
                $scope.goalTeam = data.data.goalTeam;
                $scope.goalPhoto = checkLogo(data.data.path, config.urls.defaultPlayer);
                $scope.assist1Player = data.data.assist1Player;
                $scope.assist2Player = data.data.assist2Player;

                if(data.data.position == "home") {
                    if($scope.homePenaltyTimes.length > 0) {
                        $scope.homePenaltyTimes.shift(); 
                    }
                } else {
                    if($scope.awayPenaltyTimes.length > 0) {
                        $scope.awayPenaltyTimes.shift(); 
                    }
                }
            });

            showGoal();
            break;

        case "shot":
            $scope.$apply(function() {
                switch(data.data.type) {
                    case "home":
                        $scope.homeShots = data.data.shots;
                        break;
                    case "away":
                        $scope.awayShots = data.data.shots;
                        break;
                }
            });
            break;
    }
});

ipc.on("resetMatch", function(evt, match) {
	var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
    	return;
    
    $scope.$apply(function() {
        $scope.selectedMatch = null;
    });
})
ipc.on("seasonTournamentLocations", function(evt, locations) {
	if(locations.length == 0) {
        showError('Upozornenie!',"V aplikácii sa nenachádzajú žiadne ihriská.");
        return;
    }

	var appElement = document.querySelector('[ng-app=seasonTournamentLocations]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
        return;
    
    $scope.$apply(function() {
        $scope.seasonTournamentLocations = locations;
        for(var i in $scope.seasonTournamentLocations) {
        	if($scope.seasonTournamentLocations[i].name.length > 50)
        		$scope.seasonTournamentLocations[i].name = $scope.seasonTournamentLocations[i].name.slice(0,50)+"…";

        	$scope.seasonTournamentLocations[i].logo = config.urls.defaultLocation;
        }
    });
})
ipc.on("seasonTournamentMatches", function(evt, matches) {
	var appElement = document.querySelector('[ng-app=seasonTournamentMatches]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
        return;
    
    $scope.$apply(function() {
        if(matches.length == 0) {
            showError('Upozornenie!',"V aplikácii sa nenachádzajú žiadne zápasy.");
            return;
        }

        $scope.seasonTournamentMatches = matches;

        for(var i in $scope.seasonTournamentMatches) {
        	var myDate =  $scope.seasonTournamentMatches[i].startTime;

        	$scope.seasonTournamentMatches[i].startTime = myDate;

        	//Set home logo
            $scope.seasonTournamentMatches[i].homeTeam.logo.path = checkLogo($scope.seasonTournamentMatches[i].homeTeam.logo.path, config.urls.defaultTournamentLogo);
            
           	//set away logo
            $scope.seasonTournamentMatches[i].awayTeam.logo.path = checkLogo($scope.seasonTournamentMatches[i].awayTeam.logo.path, config.urls.defaultTournamentLogo);
            $scope.seasonTournamentMatches[i].homeTeam.team.fullName = $scope.seasonTournamentMatches[i].homeTeam.team.name;
            $scope.seasonTournamentMatches[i].awayTeam.team.fullName = $scope.seasonTournamentMatches[i].awayTeam.team.name;
            
            if($scope.seasonTournamentMatches[i].homeTeam.team.name.length > 20) {
        		$scope.seasonTournamentMatches[i].homeTeam.team.name = $scope.seasonTournamentMatches[i].homeTeam.team.name.slice(0,20)+"…";
            }

        	if($scope.seasonTournamentMatches[i].awayTeam.team.name.length > 20) {
        		$scope.seasonTournamentMatches[i].awayTeam.team.name = $scope.seasonTournamentMatches[i].awayTeam.team.name.slice(0,20)+"…";
            }
        }
    }); 
})
ipc.on("seasonTournaments", function(evt, tournaments) {
    var appElement = document.querySelector('[ng-app=seasonTournaments]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
        return;
    
    $scope.$apply(function() {
    	if(tournaments.results.length == 0) {
    		showError('Upozornenie!',"V aplikácii sa nenachádzajú žiadne turnaje.");
    		return;
    	}

        for(var i in tournaments.results) {
            tournaments.results[i].logo.path = checkLogo(tournaments.results[i].logo.path, config.urls.defaultTournamentLogo);
        }
        $scope.seasonTournaments = tournaments.results;
        


        for(var i in $scope.seasonTournaments) {
        	if($scope.seasonTournaments[i].name.length > 50)
        		$scope.seasonTournaments[i].name = $scope.seasonTournaments[i].name.slice(0,50)+"…";
        }
    });
})
ipc.on('selectThisTournament',function(event, data){
    var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
        return;

    $scope.$apply(function() {
    	console.log(data);
    	if(data == null)
    		return;

        if(data.logo.path == null)
            return;
        
        $scope.selectedTournament = data.logo.path;
    });
});

ipc.on("websocket", function(evt, data) {
    var appElement = document.querySelector('[ng-app=liveScore]');
    var $scope = angular.element(appElement).scope();

    if($scope == null)
    	return;
    
    /*DATA:
    		'idGame': 
			'idCompetitorTeam':
    		'idGamePeriod': 
    		'gameTime': 
    		'realTime':
    		'idActivityType':
    		'idAssistPlayer':
	        'idGoalPlayer':
	        'idAssist2player': 
	        'idPenaltyPlayer':
	        'idPenaltyType': 
	        'idGoalType': 
	        'newScoreHome':
	        'newScoreAway': 
	        'penaltySeconds': 
	*/

	var activity = config.activities.find(x => x.id === data.idActivityType);

	switch(activity.name) {
		case "Start":
			$scope.play();
			break;
		case "Pause":
			$scope.pause();
			break;
		case "Penalty":
			break;
		case "Goal":
			$scope.$apply(function() {
                $scope.homeScore = data.newScoreHome;
                $scope.awayScore = data.newScoreAway;
            });
			break;
		case "HomeTeamTimeout":
			$scope.$apply(function() {
				$scope.timeOutHome();
			})
			break;
		case "AwayTeamTimeout":
			$scope.$apply(function() {
				$scope.timeOutAway();
			})
			break;
		case "PeriodStart":
			//TODO
			break;
		case "PeriodStop":
			//TODO
			break;
		case "MatchStart":
			//TODO
			console.log("Match start animation");
			break;
		case "MatchEnd":
			//TODO
			break;
		default:
			break;
	}

    /*
    $scope.$apply(function() {
        $scope.penaltyTypes = penalties;
        $scope.selectedPenalty = $scope.penaltyTypes[0].id;
    });*/
})
ipc.on("isAjaxStartLoading", function(evt, errorLog) {
    showLoading("Loading!","Načítavam");
})

ipc.on("isAjaxFinishLoading", function(evt, errorLog) {
	hideLoading();
})
const liveScoreApp = angular.module('liveScore', []);

liveScoreApp.controller('liveScoreController', function($rootScope, $scope, TimerService) {
	$scope.selectedMatch = null;
	$scope.homePlayers = null;
	$scope.awayPlayers = null;
	$scope.time = "00:00";
	$scope.periodStart = null; //Keď pride data z main obrazovky o čase začiatku tretiny
	$scope.homeScore = 0;
	$scope.awayScore = 0;
	$scope.homePenalties = [];
	$scope.awayPenalties = [];
	$scope.homeShots = 0;
	$scope.awayShots = 0;
	$scope.isRunning = false;
	$scope.mainTimer = new TimerService();
	$scope.actualTimer = $scope.mainTimer;
	$scope.homePenaltyTimes = [];
	$scope.awayPenaltyTimes = [];
	$scope.appName = config.names.liveScore;
	$scope.minutesPlayed = 0;
	$scope.secondsPlayed = 0;
	$scope.goalPlayer = null;
	$scope.goalTeam = null;
	$scope.goalPhoto = null;
	$scope.assist1Player = null;
	$scope.assist2Player = null;
	$scope.penaltyPlayer = null;
	$scope.penaltyType = null;
	$scope.penaltyTeam = null;
	$scope.penaltyPhoto = null;
	$scope.period = null;
	$scope.timeOutLength = null;
	$scope.selectedTournament = config.urls.defaultTournamentLogo;
	
	ipc.send('getGamePreview', {});
	ipc.send('sendSelectedTournament', {});

	$scope.play = function() {
		$scope.mainTimer.startTime();

		$($scope.homePenaltyTimes).each(function(index) {
			this.startTime();
		});

		$($scope.awayPenaltyTimes).each(function(index) {
			this.startTime();
		});
	}

	$scope.pause = function() {
		$scope.mainTimer.pauseTime();

		$($scope.homePenaltyTimes).each(function(index) {
			this.pauseTime();
		});

		$($scope.awayPenaltyTimes).each(function(index) {
			this.pauseTime();
		});
	}
	
	$scope.timeOutHome = function() {
		this.pause();
		$scope.timeOutHome = false;
		$scope.actualTimer = new TimerService();
		$scope.actualTimer.initializeSeconds($scope.timeOutLength, "timeOut");
		$scope.actualTimer.startTime();
	}

	$scope.timeOutAway = function() {
		this.pause();
		$scope.timeOutAway = false;
		$scope.actualTimer = new TimerService();
		$scope.actualTimer.initializeSeconds($scope.timeOutLength, "timeOut");
		$scope.actualTimer.startTime();
		$scope.addAwayActivity($scope.mainTimer.getTime(), "TimeOut", "TimeOut hostia");
	}

	$scope.addNewPenalty = function(type, number, time, name) {
		var penaltyService = new TimerService();
        penaltyService.setPlayer(number);
        penaltyService.initializeSeconds(time, name);
        
		switch(type) {
            case "home": 
                    $scope.homePenaltyTimes.push(penaltyService);
                break;
            case "away":
                    $scope.awayPenaltyTimes.push(penaltyService);
                break;
        }
	}
	$scope.$on("finishTime", function(event, args) {
	    var timerName = args.timerName;
	    switch(timerName) {
	    	case 'mainTimer': 
	    		//TODO volanie ukončenia tretiny 
	    		//TODO animácia ukončenia!
	    		$scope.resetPeriods();
	    		break;
	    	case 'timeOut':
	    		$scope.actualTimer = $scope.mainTimer;
	    		//TODO siréna ukončenia timeoutu!
	    		break;
	    }
	})

	$scope.$on("finishPenaltyTime", function(event, args) {
	    var timerName = args.timerName;
	    var playerId = args.playerId;
	    
	    $($scope.homePenaltyTimes).each(function(index) {
			if(this.getName() == timerName) {
				$scope.homePenaltyTimes.splice(index,1);
				return;
			}
		});

		$($scope.awayPenaltyTimes).each(function(index) {
			if(this.getName() == timerName) {
				$scope.awayPenaltyTimes.splice(index,1);
				return;
			}
		});
	})

	$scope.resetPeriods = function() {
		$($scope.homePenaltyTimes).each(function(index) {
			this.pauseTime();
		});

		$($scope.awayPenaltyTimes).each(function(index) {
			this.pauseTime();
		});
		$scope.isRunning = false;
		$scope.playButton = "Výber hracej časti";

		$scope.period = null;
	}

	$scope.getTime = function(){
        return $scope.actualTimer.getTime();
    };

	$scope.$watch('periodStart', function (newValue, oldValue, scope) {
		$scope.mainTimer.initialize(newValue, "mainTimer");
	    $scope.actualTimer = $scope.mainTimer;
	    $scope.minutesPlayed += normalizeNumber(Number($("input[name=minutes]").val()));
	    $scope.secondsPlayed += normalizeNumber(Number($("input[name=seconds]").val()));
	});

	$scope.$watch('updateTimer', function (newValue, oldValue, scope) {
		$scope.mainTimer.setMiliseconds(newValue);
	});

	$scope.$watch('selectedMatch', function(newValue, oldValue, scope) {
		if($scope.selectedMatch == null) {
        	$(".overlayBeforeStart").css("opacity",1);
        	setTimeout(function() {
			    $scope.homePlayers = null;
				$scope.awayPlayers = null;
				$scope.time = "00:00";
				$scope.periodStart = null; //Keď pride data z main obrazovky o čase začiatku tretiny
				$scope.homeScore = 0;
				$scope.awayScore = 0;
				$scope.homePenalties = [];
				$scope.awayPenalties = [];
				$scope.homeShots = 0;
				$scope.awayShots = 0;
				$scope.isRunning = false;
				$scope.mainTimer = new TimerService();
				$scope.actualTimer = $scope.mainTimer;
				$scope.homePenaltyTimes = [];
				$scope.awayPenaltyTimes = [];
				$scope.appName = config.names.liveScore;
				$scope.minutesPlayed = 0;
				$scope.secondsPlayed = 0;
				$scope.goalPlayer = null;
				$scope.goalTeam = null;
				$scope.goalPhoto = null;
				$scope.assist1Player = null;
				$scope.assist2Player = null;
				$scope.penaltyPlayer = null;
				$scope.penaltyType = null;
				$scope.penaltyTeam = null;
				$scope.penaltyPhoto = null;
				$scope.period = null;
				$scope.timeOutLength = null;
				$scope.selectedTournament = config.urls.defaultTournamentLogo;
			}, 1000);
		}
        else {
        	$(".overlayBeforeStart").css("opacity",0);
        	ipc.send('sendSelectedTournament', {});  
        }
	});
});


const matchWriterApp = angular.module('matchWriter', []);

matchWriterApp.controller('matchWriterController', function($rootScope, $scope, TimerService) {
	$('#showProjector').remove();

	$scope.seasonTournamentMatches = null;

	$scope.time = "00:00";
	$scope.homeScore = 0;
	$scope.awayScore = 0;
	$scope.homeActivities = [];
	$scope.awayActivities = [];
	$scope.homePenalties = [];
	$scope.awayPenalties = [];
	$scope.homeShots = 0;
	$scope.awayShots = 0;
	$scope.isRunning = false;
	$scope.playButton = "Výber hracej časti";
	$scope.choosedTeam = null;
	$scope.choosedTeamSide = null;
	$scope.choosedTeamPlayers = [];
	$scope.selectedPenalty = -1;
	$scope.mainTimer = new TimerService();
	$scope.timeOutHome = true;
	$scope.timeOutAway = true;
	$scope.actualTimer = $scope.mainTimer;
	$scope.homePenaltyTimes = [];
	$scope.awayPenaltyTimes = [];
	$scope.minutesPlayed = 0;
	$scope.secondsPlayed = 0;
	$scope.actualPeriod = null;
	$scope.gameStart = false;

	ipc.send('getGame', {});

	$(".rightMenu").append($("<li/>").append($("<a/>").html("Ukončiť zápas").click(function() {
		var bool = confirm("Naozaj chcete ukončiť a uložiť zápas?");

		if(bool) {
			$scope.sendGameActivity(	
			    	"MatchEnd",	//activityName
			    	null,			//teamId
					null, 			//goalPlayer
					null, 			//assistPlayer
					null, 			//assist2Player
					null, 			//goalType
					null, 			//penaltyPlayer
					null, 			//penaltytype
					null, 			//penaltyseconds
					null, 			//newHomeScore
					null 			//newAwayScore
				);

			location.href = $("#backButton").attr("href");
		};
	})));
	
	$scope.gameLoaded = function() {
		ipc.send('getGoalTypes', {match: $scope.selectedMatch.id,
								  game: $scope.selectedMatch.seasonTournament.id});
		
		ipc.send('getPenaltyTypes', {match: $scope.selectedMatch.id,
								  game: $scope.selectedMatch.seasonTournament.id});
		ipc.send('getTimeOutLength', {match: $scope.selectedMatch.id,
								  game: $scope.selectedMatch.seasonTournament.id});

		ipc.send('getGamePeriods', {match: $scope.selectedMatch.id,
									game: $scope.selectedMatch.seasonTournament.id});
	}

	$scope.addHomeActivity = function(time, action, text) {
		var newActivity = new Object();
		newActivity.time = time;
		newActivity.action = action;
		newActivity.text = text;

		$scope.homeActivities.push(newActivity);
	}

	$scope.addAwayActivity = function(time, action, text) {
		var newActivity = new Object();
		newActivity.time = time;
		newActivity.action = action;
		newActivity.text = text;

		$scope.awayActivities.push(newActivity);
	}

	$scope.confirmPlayers = function() {
		var teamRows = $("#myConfirm .selectPlayer .teamRow");
	    if(teamRows.length == 0) {
	        return;
	    }

	    var returnVal = true;

	    teamRows.each( function(index) {
	        var checkedPlayers = $(this).find(".playerRow input[type='checkbox']:checked");
	        var tmpVal = true;

	        if(checkedPlayers.length == 0) {
	            tmpVal = confirm("Žiaden vybratý hráč z tímu " + $(this).find(".teamName").html() + "! Ak nevyberiete hráča, automaticky sa všetci hráči pridajú!!! Prajete si pokračovať?");
	        } 

	        if(returnVal) {
	            returnVal = tmpVal;
	        }
	    });

	    if(returnVal) {
	       teamRows.each(function (index) {
	            var checkedPlayers = $(this).find(".playerRow input[type='checkbox']:checked");

	            if(checkedPlayers.length == 0) {
	            	checkedPlayers = $(this).find(".playerRow input[type='checkbox']");
	            }

	            var idPlayer;

	            checkedPlayers.each(function (index2) {
	                idPlayer = $(this).attr("id");
	                idPlayer = idPlayer.replace('cb','');
	                idPlayer = Number(idPlayer);

	                var myObject = new Object();
		            myObject.competitorTeamPlayerId = idPlayer;
		            if($scope.selectedMatch == null) {
		            	showError("Chyba!", "Nastala chyba, nie je vybratý zápas");
		            	return;
		            }

		            myObject.gameId = $scope.selectedMatch.id;

		            myObject = JSON.stringify(myObject);

		            var obj = $scope.selectedMatch.homeTeam.competitorTeamPlayers;
		            $(obj).each(function (index) {
		            	if(idPlayer == this.id) {
		            		this.playing = true;
		            	}
		            });

		            obj = $scope.selectedMatch.awayTeam.competitorTeamPlayers;
		            $(obj).each(function (index) {
		            	if(idPlayer == this.id) {
		            		this.playing = true;
		            	}
		            });

		            sendAjax(config.urls.post.playerChoose, myObject, "matchWriter");

	            });

	        });
	        $("#myConfirm").modal("hide");

	         if(!$scope.gameStart) {
				$scope.gameStart = true;

				var elems = $(".startGameHandling a");
   				var confirmIt = function (e) {
			        if (!confirm('Zápas je už spustený, ste si istý že chcete zrušiť prebiehajúci zápas? ZMENY SA NEULOŽIA!!!')) e.preventDefault();
			    };
			    for (var i = 0, l = elems.length; i < l; i++) {
			        elems[i].addEventListener('click', confirmIt, false);
    			}

				$scope.sendGameActivity(	
			    	"MatchStart",	//activityName
			    	null,			//teamId
					null, 			//goalPlayer
					null, 			//assistPlayer
					null, 			//assist2Player
					null, 			//goalType
					null, 			//penaltyPlayer
					null, 			//penaltytype
					null, 			//penaltyseconds
					null, 			//newHomeScore
					null 			//newAwayScore
				);
			}
	    }
	}

	$scope.sendGameActivity = function(activityName, teamId, idGoalPlayer, idAssistPlayer, idAssist2player, idGoalType, idPenaltyPlayer, idPenaltyType, penaltySeconds, newScoreHome, newScoreAway) {
		var elapsedTime = "00:" + normalizeNumber(Number($scope.minutesPlayed)) + ":" + normalizeNumber(Number($scope.secondsPlayed));
    	var estimatedTime = "00:" + $scope.mainTimer.getMinutes() + ":" + $scope.mainTimer.getSeconds();
    	var diffSeconds = hmsToSecondsOnly(elapsedTime) - hmsToSecondsOnly(estimatedTime);
    	var activityType = null;

    	activityType = config.activities.find(x => x.name === activityName);

    	if(activityType == null) {
    		console.log("Unknown activityType!");
    		return;
    	}

		var obj = {
			'idGame': $scope.selectedMatch.id,
			'idCompetitorTeam': teamId,
    		'idGamePeriod': Number($scope.actualPeriod),
    		'gameTime': "00:" + secondsToms(diffSeconds),
    		'realTime': convertDate(new Date()),
    		'idActivityType': activityType.id,
    		'idAssistPlayer': idAssistPlayer,
	        'idGoalPlayer': idGoalPlayer,
	        'idAssist2player': idAssist2player,
	        'idPenaltyPlayer': idPenaltyPlayer,
	        'idPenaltyType': idPenaltyType,
	        'idGoalType': idGoalType,
	        'newScoreHome': newScoreHome,
	        'newScoreAway': newScoreAway,
	        'penaltySeconds': penaltySeconds
		}
        	
	    sendWebSockets(JSON.stringify(obj)); //TODO
	}

	$scope.selectTeam = function(data) {
		$scope.choosedTeam = data;
	}

	$scope.selectTeamTotal = function(id, type) {
		$scope.choosedTeam = id;
		$scope.choosedTeamSide = type;
	}

	$scope.confirmPeriod = function() {
	    $scope.period = $("#selectPeriod option:selected").attr("myName");
	    $scope.time = normalizeNumber(Number($("input[name=minutes]").val())) + ":" + normalizeNumber(Number($("input[name=seconds]").val()));

	    $scope.mainTimer.initialize($scope.time, "mainTimer");
	    $scope.actualTimer = $scope.mainTimer;
	    $scope.minutesPlayed += normalizeNumber(Number($("input[name=minutes]").val()));
	    $scope.secondsPlayed += normalizeNumber(Number($("input[name=seconds]").val()));
	    $scope.actualPeriod = $("#selectPeriod option:selected").attr("myId");

	    $("#showPeriod").modal("hide");
	    $scope.playButton = "Play";
	    //TODO request selectperiod + time

	    $scope.sendGameActivity(	
	    	"PeriodStart", 	//activityName
	    	null,			//teamId
			null, 			//goalPlayer
			null, 			//assistPlayer
			null, 			//assist2Player
			null, 			//goalType
			null, 			//penaltyPlayer
			null, 			//penaltytype
			null, 			//penaltyseconds
			null, 			//newHomeScore
			null 			//newAwayScore
		);

		sendDataToLive("PeriodStart", $scope.time);
	}

	function play() {
		$scope.mainTimer.startTime();
		//TODO request play

		$($scope.homePenaltyTimes).each(function(index) {
			this.startTime();
		});

		$($scope.awayPenaltyTimes).each(function(index) {
			this.startTime();
		});


		$scope.isRunning = true;
		$scope.playButton = "Stop";

		$scope.sendGameActivity(	
	    	"Start", 		//activityName
	    	null,			//teamId
			null, 			//goalPlayer
			null, 			//assistPlayer
			null, 			//assist2Player
			null, 			//goalType
			null, 			//penaltyPlayer
			null, 			//penaltytype
			null, 			//penaltyseconds
			null, 			//newHomeScore
			null 			//newAwayScore
		);

		sendDataToLive("updateTimer", {time: $scope.mainTimer.getMiliseconds(), period: $scope.period});
	}

	function pause() {
		$scope.mainTimer.pauseTime();
		//TODO request pause

		$($scope.homePenaltyTimes).each(function(index) {
			this.pauseTime();
		});

		$($scope.awayPenaltyTimes).each(function(index) {
			this.pauseTime();
		});
		$scope.isRunning = false;
		$scope.playButton = "Play";

		$scope.sendGameActivity(	
	    	"Pause", 		//activityName
	    	null,			//teamId
			null, 			//goalPlayer
			null, 			//assistPlayer
			null, 			//assist2Player
			null, 			//goalType
			null, 			//penaltyPlayer
			null, 			//penaltytype
			null, 			//penaltyseconds
			null, 			//newHomeScore
			null 			//newAwayScore
		);

		sendDataToLive("updateTimer", {time: $scope.mainTimer.getMiliseconds(), period: $scope.period});
	}
	
	$scope.timeOutHome = function() {
		var run = confirm("Naozaj chcete spustiť timeout pre domáci tím?");
		if(!run)
			return;

		pause();
		$scope.timeOutHome = false;
		$scope.actualTimer = new TimerService();
		$scope.actualTimer.initializeSeconds($scope.timeOutLength, "timeOut");
		$scope.actualTimer.startTime();
		$scope.addHomeActivity($scope.mainTimer.getTime(), "TimeOut", "TimeOut domáci");

		$scope.sendGameActivity(	
	    	"HomeTeamTimeout",//activityName
	    	$scope.selectedMatch.homeTeam.id,//teamId
			null, 			//goalPlayer
			null, 			//assistPlayer
			null, 			//assist2Player
			null, 			//goalType
			null, 			//penaltyPlayer
			null, 			//penaltytype
			null, 			//penaltyseconds
			null, 			//newHomeScore
			null 			//newAwayScore
		);	

		sendDataToLive("updateTimer", {time: $scope.actualTimer.getMiliseconds(), period: $scope.period});
	}

	$scope.timeOutAway = function() {
		var run = confirm("Naozaj chcete spustiť timeout pre hosťujúci tím?");
		if(!run)
			return;
		
		pause();
		$scope.timeOutAway = false;
		$scope.actualTimer = new TimerService();
		$scope.actualTimer.initializeSeconds($scope.timeOutLength, "timeOut");
		$scope.actualTimer.startTime();
		$scope.addAwayActivity($scope.mainTimer.getTime(), "TimeOut", "TimeOut hostia");

		$scope.sendGameActivity(	
	    	"AwayTeamTimeout",//activityName
	    	$scope.selectedMatch.awayTeam.id,//teamId
			null, 			//goalPlayer
			null, 			//assistPlayer
			null, 			//assist2Player
			null, 			//goalType
			null, 			//penaltyPlayer
			null, 			//penaltytype
			null, 			//penaltyseconds
			null, 			//newHomeScore
			null 			//newAwayScore
		);	

		sendDataToLive("updateTimer", {time: $scope.actualTimer.getMiliseconds(), period: $scope.period});
	}

	$scope.$on("finishTime", function(event, args) {
	    var timerName = args.timerName;
	    switch(timerName) {
	    	case 'mainTimer': 
	    		//TODO volanie ukončenia tretiny 
	    		//TODO animácia ukončenia!
	    		$scope.sendGameActivity(	
			    	"PeriodStop",	//activityName
			    	null,			//teamId
					null, 			//goalPlayer
					null, 			//assistPlayer
					null, 			//assist2Player
					null, 			//goalType
					null, 			//penaltyPlayer
					null, 			//penaltytype
					null, 			//penaltyseconds
					null, 			//newHomeScore
					null 			//newAwayScore
				);
	    		$scope.resetPeriods();
	    		break;
	    	case 'timeOut':
	    		$scope.actualTimer = $scope.mainTimer;
	    		sendDataToLive("updateTimer", {time: $scope.actualTimer.getMiliseconds(), period: $scope.period});
	    		//TODO siréna ukončenia timeoutu!
	    		break;
	    }
	})

	$scope.$on("finishPenaltyTime", function(event, args) {
	    var timerName = args.timerName;
	    var playerId = args.playerId;
	    
	    $($scope.homePenaltyTimes).each(function(index) {
			if(this.getName() == timerName) {
				$scope.homePenaltyTimes.splice(index,1);
				return;
			}
		});

		$($scope.awayPenaltyTimes).each(function(index) {
			if(this.getName() == timerName) {
				$scope.awayPenaltyTimes.splice(index,1);
				return;
			}
		});
	})

	$scope.resetPeriods = function() {
		$($scope.homePenaltyTimes).each(function(index) {
			this.pauseTime();
		});

		$($scope.awayPenaltyTimes).each(function(index) {
			this.pauseTime();
		});
		$scope.isRunning = false;
		$scope.playButton = "Výber hracej časti";

		$scope.period = null;
	}
	
	$scope.playTime = function() {
		if($scope.periods == null) {
			loadPeriods($scope.periods);
		} 

		if($scope.period != null) {
			if($scope.isRunning) {
				pause();
			} else {
				play();
			}
		} else {
			loadPeriods($scope.periods);
		}
	}

	
	$scope.showGoal = function() {
		pause();
		$('#showGoal').modal({
	        backdrop: 'static',
	        keyboard: false
	    });
	}

	$scope.showPenalty = function() {
		pause();

		$('#showPenalty').modal({
	        backdrop: 'static',
	        keyboard: false
	    });
	}

	$scope.confirmPenalty = function() {
		var penaltyTypeId = $scope.selectedPenalty;
		//scope.choosedTeam = $("input[name=selectedGoal]:checked").val();

		var teamId = $scope.choosedTeam;
		var teamPosition = $scope.choosedTeamSide;
		var playerId = Number($("#penaltyPlayer option:selected").val());

		var penaltyService = new TimerService();
		var choosedPlayer;

		var penalty = null;
		$($scope.penaltyTypes).each(function(index) {
			if(penaltyTypeId == this.id)
				penalty = this;
		});

		$($scope.choosedTeamPlayers).each(function(index) {
			if(this.gamePlayerId == playerId) {
				choosedPlayer = this;
			}
		});
			
		penaltyService.setPlayer(choosedPlayer.number);
 		var selectedTeam = null;
		if(teamPosition == "away") {
			penaltyService.initializeSeconds(penalty.seasonTournamentPenaltyType.penaltyDuration, "pa" + $scope.awayPenaltyTimes.length);

			$scope.awayPenaltyTimes.push(penaltyService);
			$scope.addAwayActivity($scope.mainTimer.getTime(), "Trest", choosedPlayer.personInfo.name + " " + choosedPlayer.personInfo.surname + " (" + penalty.penalty.shortName + ")");
			selectedTeam = $scope.selectedMatch.awayTeam.id;
			sendDataToLive("addPenalty", {type: "away",
										  number: $("#penaltyPlayer option:selected").attr("numberP"),
										  time: penalty.seasonTournamentPenaltyType.penaltyDuration,
										  name: "pa" + $scope.awayPenaltyTimes.length});
		} else {
			penaltyService.initializeSeconds(penalty.seasonTournamentPenaltyType.penaltyDuration, "ph" + $scope.homePenaltyTimes.length);
			
			$scope.homePenaltyTimes.push(penaltyService);
			$scope.addHomeActivity($scope.mainTimer.getTime(), "Trest", choosedPlayer.personInfo.name + " " + choosedPlayer.personInfo.surname + " (" + penalty.penalty.shortName + ")");

			selectedTeam = $scope.selectedMatch.homeTeam.id;

			sendDataToLive("addPenalty", {type: "home",
										  number: $("#penaltyPlayer option:selected").attr("numberP"),
										  time: penalty.seasonTournamentPenaltyType.penaltyDuration,
										  name: "ph" + $scope.homePenaltyTimes.length});
		}
		//TODO ak padne gól tak zrušiť penaltu!!

		$scope.sendGameActivity(	
	    	"Penalty", 		//activityName
	    	selectedTeam,	//teamId
			null, 			//goalPlayer
			null, 			//assistPlayer
			null, 			//assist2Player
			null, 			//goalType
			playerId, 		//penaltyPlayer
			penaltyTypeId,	//penaltytype
			null, 			//penaltyseconds
			null, 			//newHomeScore
			null 			//newAwayScore
		);

		sendDataToLive("penalty", {name: $("#penaltyPlayer option:selected").attr("playerN"),
									number: $("#penaltyPlayer option:selected").attr("numberP"),
									path: choosedPlayer.photo.path,
									penalty: $("#penaltyType option:selected").html(),
									team: $("input[name=selectedGoal]:checked").attr("tname")});

		$("#showPenalty").modal("hide");
	}

	$scope.confirmGoal = function() {
		var goalPlayerId = Number($( "#goalPlayer option:selected" ).val());
		var goalTypeId = Number($( "#goalType option:selected" ).val());
		var assist1Id = Number($( "#assist1Player option:selected" ).val());
		var assist2Id = Number($( "#assist2Player option:selected" ).val());

		var assist1Player = null;
		var assist2Player = null;
		var goalPlayer = null;

		$($scope.choosedTeamPlayers).each(function(index) {
			if(this.gamePlayerId == goalPlayerId) {
				goalPlayer = this;
			}
			if(this.gamePlayerId == assist1Id) {
				assist1Player = this;
			}
			if(this.gamePlayerId == assist2Id) {
				assist2Player = this;
			}
		});

		var text = "";

		text += goalPlayer.personInfo.name + " " + goalPlayer.personInfo.surname;

		if((assist1Player != null) || (assist2Player != null)) {
			text += " (";

			if(assist1Player != null)
				text += assist1Player.personInfo.name + " " + assist1Player.personInfo.surname;
			
			if((assist2Player != null) && (assist2Player != null))
				text += ", ";
				
			if(assist2Player != null) 
				text += assist2Player.personInfo.name + " " + assist2Player.personInfo.surname;
			text += ")";
			
		}

		var selectedTeam = null;
		var teamName = null;
		var position = "home";
		if($scope.choosedTeam == $scope.selectedMatch.homeTeam.id) {
			$scope.homeScore++;
			$scope.addHomeActivity($scope.mainTimer.getTime(), "Gól", text);

			selectedTeam = $scope.selectedMatch.homeTeam.id;
			teamName = $scope.selectedMatch.homeTeam.team.fullName;

			if($scope.homePenaltyTimes.length > 0) {
				$scope.homePenaltyTimes.shift(); 
			}
		}

		if($scope.choosedTeam == $scope.selectedMatch.awayTeam.id) {
			$scope.awayScore++;
			position = "away";
			$scope.addAwayActivity($scope.mainTimer.getTime(), "Gól", text);
			selectedTeam = $scope.selectedMatch.awayTeam.id;
			teamName = $scope.selectedMatch.awayTeam.team.fullName;

			if($scope.homePenaltyTimes.length > 0) {
				$scope.homePenaltyTimes.shift(); 
			}
		}

		$("#showGoal").modal("hide");

		if(assist1Id == -1) {
			assist1Id = null;
		}

		if(assist2Id == -1) {
			assist2Id = null;
		}

		//TODO show effect goal
		//TODO send goal with attr
		$scope.sendGameActivity(	
	    	"Goal", 		//activityName
	    	selectedTeam,	//teamId
			goalPlayerId,	//goalPlayer
			assist1Id, 		//assistPlayer
			assist2Id, 		//assist2Player
			goalTypeId, 	//goalType
			null, 			//penaltyPlayer
			null, 			//penaltytype
			null, 			//penaltyseconds
			$scope.homeScore,//newHomeScore
			$scope.awayScore//newAwayScore
		);

		var goalName = "#" + goalPlayer.number + " " + goalPlayer.personInfo.name + " " + goalPlayer.personInfo.surname;
		var assist1Name = null;
		var assist2Name = null;

		if(!(assist1Id == null)) {
			assist1Name = "#" + assist1Player.number + " " + assist1Player.personInfo.name + " " + assist1Player.personInfo.surname
		}

		if(!(assist2Id == null)) {
			assist2Name = "#" + assist2Player.number + " " + assist2Player.personInfo.name + " " + assist2Player.personInfo.surname
		}

		sendDataToLive("goal", {goalPlayer: goalName,
								path: goalPlayer.photo.path,
							    assist1Player: assist1Name,
								assist2Player: assist2Name,
								goalTeam: teamName,
								position: position}
		);

	}

	$scope.chooseTournamentMatch = function(elem) {
		ipc.send('selectedTournamentMatch', {match: elem});
	}

	$scope.getTime = function(){
        return $scope.actualTimer.getTime();
    };

	$scope.reloadMatches = function() {
		ipc.send('did-finish-load', {	load: 			'seasonTournamentMatches',
										url: 			config.urls.seasonTournamentMatches,
										addTournament: 	true
									});
	}

	$scope.loadPlayers = function() {
		if($scope.choosedTeam == $scope.selectedMatch.homeTeam.id) {
			$scope.choosedTeamPlayers = [];
			$($scope.selectedMatch.homeTeam.competitorTeamPlayers).each(function(index) {
				if(this.playing) {
					$scope.choosedTeamPlayers.push(this);
				}
			});
			return;
		}

		if($scope.choosedTeam == $scope.selectedMatch.awayTeam.id) {
			$scope.choosedTeamPlayers = [];
			$($scope.selectedMatch.awayTeam.competitorTeamPlayers).each(function(index) {
				if(this.playing) {
					$scope.choosedTeamPlayers.push(this);
				}
			});
			return;
		}
	}

	$scope.$watch('ajaxResult', function (newValue, oldValue, scope) {
		if($scope.selectedMatch == undefined) 
			return;

		var obj = $scope.selectedMatch.homeTeam.competitorTeamPlayers;
        $(obj).each(function (index) {
        	if(newValue.competitorTeamPlayerId == this.id) {
        		this.gamePlayerId = newValue.id;
        	}
        });

        obj = $scope.selectedMatch.awayTeam.competitorTeamPlayers;
        $(obj).each(function (index) {
        	if(newValue.competitorTeamPlayerId == this.id) {
        		this.gamePlayerId = newValue.id;
        	}
        });

        $scope.loadPlayers();
	});

	$scope.$watch('selectedMatch', function(newValue) {
		if($scope.selectedMatch == undefined) 
			return;

		$scope.choosedTeam = $scope.selectedMatch.homeTeam.id;
	})

	$scope.$watch('choosedTeam', function(newValue) {
		if($scope.choosedTeam == undefined) 
			return;

		$scope.loadPlayers();
	})

	$rootScope.keyWasPressed = function(event)
	  {
	     switch(event.keyCode) {
	     	case 37: //LEFT
	     		$scope.homeShots++;
	     		sendDataToLive("shot", {type: "home", shots: $scope.homeShots});
	     		break;
	     	case 39: //RIGHT
	     		$scope.awayShots++;
	     		sendDataToLive("shot", {type: "away", shots: $scope.awayShots});
	     		break;
	     	case 32: //SPACE
	     		$scope.playTime();
	     		break;
	     	case 27: //ESC
	     		$(".cancelButton").click();
	     		break;
	     }
	  }
});


const seasonTournamentsApp = angular.module('seasonTournaments', []);

seasonTournamentsApp.controller('seasonTournament', function($scope) {
	$scope.seasonTournaments = null;

	$scope.chooseTournament = function(elem) {
		ipc.send('selectedTournament', {tournament: elem});
	}

	$scope.reloadTournaments = function() {
		ipc.send('did-finish-load', {
									load: 			'seasonTournaments',
									url: 			config.urls.seasonTournaments,
									addTournament: 	false
								});
	}
});
const seasonTournamentLocationsapp = angular.module('seasonTournamentLocations', []);

seasonTournamentLocationsapp.controller('seasonTournamentLocationsController', function($scope) {
	$scope.seasonTournamentLocations = null;

	$scope.chooseLocation = function(elem) {
		ipc.send('selectedTournamentLocation', {location: elem});
	}

	$scope.reloadLocations = function() {
		ipc.send('did-finish-load', {	load: 			'seasonTournamentLocations',
										url: 			config.urls.seasonTournamentLocations,
										addTournament: 	true
									});
	}
});

const seasonTournamentMatchesApp = angular.module('seasonTournamentMatches', []);

seasonTournamentMatchesApp.controller('seasonTournamentMatchesController', function($scope) {
	$scope.seasonTournamentMatches = null;

	$scope.chooseTournamentMatch = function(elem) {
		ipc.send('selectedTournamentMatch', {match: elem});
	}

	$scope.reloadMatches = function() {
		ipc.send('did-finish-load', {	load: 			'seasonTournamentMatches',
										url: 			config.urls.seasonTournamentMatches,
										addTournament: 	true
									});
	}
});


matchWriterApp.factory('TimerService', ['$interval', '$rootScope',   function($interval,$rootScope){
    var myService = function() {
        var currentMs = null;
        var startTime, stopTime;
        var interval;
        var name;
        var playerId;

        this.initialize = function(currTime, cname) {
            name = cname;
            var splitTime = currTime.split(":");

            //Vypočítam milisekundy z minút
            var ms = Number(splitTime[0]) * 60 * 1000;

            //Pridám milisekundy zo sekúnd
            ms += (Number(splitTime[1]) * 1000);

            currentMs = ms;
        }

        this.initializeSeconds = function(currTime, cname) {
            name = cname;
            currentMs = currTime*1000;
        }

        this.setPlayer = function(num) {
            playerId = num;
        }

        this.getPlayer = function() {
            return playerId;
        }

        this.getMiliseconds = function() {
            return currentMs;
        }

        this.getName = function() {
            return name;
        }

        this.getMinutes = function() {
            if((currentMs != null)&&(currentMs>0)) {
                    var mm = Math.floor(currentMs/60000);

                    var returnString = normalizeNumber(mm);
                    return returnString;
            } else {
                return "00";
            }
        }

        this.getSeconds = function() {
            if((currentMs != null)&&(currentMs>0)) {
                    var mm = Math.floor(currentMs/60000);
                    var ss = Math.floor((currentMs % 60000)/1000);

                    var returnString = normalizeNumber(ss);
                    return returnString;
            } else {
                return "00";
            }
        }

        this.getTime = function() {
            if((currentMs != null)&&(currentMs>0)) {
                if(currentMs > 60000) {
                    var mm = Math.floor(currentMs/60000);
                    var ss = Math.floor((currentMs % 60000)/1000);

                    var returnString = normalizeNumber(mm) + ":" + normalizeNumber(ss);
                    return returnString;
                } else {
                    var ss = Math.floor(currentMs/1000);
                    var ml = Math.floor((currentMs%1000)/10);
                    var returnString = normalizeNumber(ss) + "." + normalizeNumber(ml);
                    return returnString;
                }
            } else {
                $rootScope.$broadcast("finishTime", {timerName: name});
                this.pauseTime();
                if(currentMs == null) 
                    return "00:00";
                else {
                    return "00.0";
                }
            }
        }

        this.getPenaltyTime = function() {
            if((currentMs != null)&&(currentMs>0)) {
                    var mm = Math.floor(currentMs/60000);
                    var ss = Math.floor((currentMs % 60000)/1000);

                    var returnString = normalizeNumber(mm) + ":" + normalizeNumber(ss);
                    return returnString;
            } else {
                $rootScope.$broadcast("finishPenaltyTime", {timerName: name, player: playerId});
                this.pauseTime();
                if(currentMs == null) 
                    return "00:00";
                else {
                    return "00.0";
                }
            }
        }

        var updateTime = function() {
            stopTime = new Date();

            var changeMs = (stopTime.getTime() - startTime.getTime());

            currentMs-= changeMs;
            startTime = new Date();
        }

        this.pauseTime = function() {
            $interval.cancel(interval);
        }

        this.startTime = function() {
            startTime = new Date();

            interval = $interval(updateTime, 10);
        }
    }

    return myService;
}]);


liveScoreApp.factory('TimerService', ['$interval', '$rootScope',   function($interval,$rootScope){
    var myService = function() {
        var currentMs = null;
        var startTime, stopTime;
        var interval;
        var name;
        var playerId;

        this.initialize = function(currTime, cname) {
            name = cname;

            if(currTime == null)
                return;
            var splitTime = currTime.split(":");

            //Vypočítam milisekundy z minút
            var ms = Number(splitTime[0]) * 60 * 1000;

            //Pridám milisekundy zo sekúnd
            ms += (Number(splitTime[1]) * 1000);

            currentMs = ms;
        }

        this.initializeSeconds = function(currTime, cname) {
            name = cname;
            currentMs = currTime*1000;
        }

        this.setPlayer = function(num) {
            playerId = num;
        }

        this.getPlayer = function() {
            return playerId;
        }

        this.getName = function() {
            return name;
        }

        this.getMinutes = function() {
            if((currentMs != null)&&(currentMs>0)) {
                    var mm = Math.floor(currentMs/60000);

                    var returnString = normalizeNumber(mm);
                    return returnString;
            } else {
                return "00";
            }
        }

        this.getSeconds = function() {
            if((currentMs != null)&&(currentMs>0)) {
                    var mm = Math.floor(currentMs/60000);
                    var ss = Math.floor((currentMs % 60000)/1000);

                    var returnString = normalizeNumber(ss);
                    return returnString;
            } else {
                return "00";
            }
        }

        this.getMiliseconds = function() {
            return currentMs;
        }

        this.setMiliseconds = function(ms) {
            currentMs = ms;
        }

        this.getTime = function() {
            if((currentMs != null)&&(currentMs>0)) {
                if(currentMs > 60000) {
                    var mm = Math.floor(currentMs/60000);
                    var ss = Math.floor((currentMs % 60000)/1000);

                    var returnString = normalizeNumber(mm) + ":" + normalizeNumber(ss);
                    return returnString;
                } else {
                    var ss = Math.floor(currentMs/1000);
                    var ml = Math.floor((currentMs%1000)/10);
                    var returnString = normalizeNumber(ss) + "." + normalizeNumber(ml);
                    return returnString;
                }
            } else {
                $rootScope.$broadcast("finishTime", {timerName: name});
                this.pauseTime();
                if(currentMs == null) 
                    return "00:00";
                else {
                    return "00.0";
                }
            }
        }

        this.getPenaltyTime = function() {
            if((currentMs != null)&&(currentMs>0)) {
                    var mm = Math.floor(currentMs/60000);
                    var ss = Math.floor((currentMs % 60000)/1000);

                    var returnString = normalizeNumber(mm) + ":" + normalizeNumber(ss);
                    return returnString;
            } else {
                $rootScope.$broadcast("finishPenaltyTime", {timerName: name, player: playerId});
                this.pauseTime();
                if(currentMs == null) 
                    return "00:00";
                else {
                    return "00.0";
                }
            }
        }

        var updateTime = function() {
            stopTime = new Date();

            var changeMs = (stopTime.getTime() - startTime.getTime());

            currentMs-= changeMs;
            startTime = new Date();
        }

        this.pauseTime = function() {
            $interval.cancel(interval);
        }

        this.startTime = function() {
            startTime = new Date();

            interval = $interval(updateTime, 10);
        }
    }

    return myService;
}]);


function loadPeriods(gamePeriods) {
    selector = $("#selectPeriod");

    $.each(gamePeriods, function(index) {
        var splitTime = this.length.split(":");

        var hours = Number(splitTime[0]);
        var minutes = Number(splitTime[1]);

        if(hours > 0)
            minutes += (hours*60);

        if(minutes<10) {
            minutes = "0" + minutes;
        }
        var time = minutes + ":" + splitTime[2];

        $("<option/>", {
            class: "option",
            text: this.name + " (" + time + ")",
            myLength: time,
            myName: this.name,
            myId: this.id
        }).appendTo(selector);
    });

    //default a obsluhovanie prehodenia selectu
    if($("#selectPeriod option").length) {
        var times = $("#selectPeriod option:selected").attr("myLength").split(":");
        $("input[name=minutes").val(times[0]);
        $("input[name=seconds").val(times[1]);
    }

    $("#selectPeriod").change(function() {
        var times = $("#selectPeriod option:selected").attr("myLength").split(":");
        $("input[name=minutes").val(times[0]);
        $("input[name=seconds").val(times[1]);
    })

    $('#showPeriod').modal({
        backdrop: 'static',
        keyboard: false
    });
}
function sendDataToLive(name, data) {
	var mydata = {
		name: name,
	  	data: data
	};
	
	ipc.send('sendData', mydata);
}
function sendWebSockets(data) {
	ipc.send('webSocket', data);
}
function showError(header, body) {
    $("#errorHeader").html(header);
    $("#errorBody").html(body);
    $("#errorWindow").modal();
  }

function hideError() {
    $("#errorWindow").modal("hide");
}

function showLoading(header, body) {
    $("#ajaxLoading").show(0);
}

function hideLoading() {
    $("#ajaxLoading").hide(0);
}

//Dá 2 cifry a ako string
function normalizeNumber(nmb) {
    if(nmb.toString().length == 1) {
        return "0" + nmb;
    }

    if(nmb.toString().length == 0) {
        return "00";
    }

    return nmb;
}

function checkLogo(oldUrl, replacement) {
    if(oldUrl == undefined)
        oldUrl = replacement;
    else {
        var myUrl = oldUrl;
        oldUrl = config.urls.documents + oldUrl;
        $.ajax(
            {
                url: (config.urls.documents + myUrl),
                type:'HEAD',
                async: false,
                error: function() {
                    //showError("Upozornenie!","Nastala neočakávaná chyba na serveri.<br> Je možné, že program nebude fungovať správne.");
                    console.log("Chyba načítana obrázkov zo servera!");
                    console.log(oldUrl);
                    oldUrl = replacement;       
                    
                }
            }
        );
    }

    return oldUrl;
}

function sendAjax(myurl, mydata, app) {
    $.ajax({
        url: myurl,
        data: mydata,
        contentType: "application/json",
        type: 'POST',
        success: function(data){ 
            var appElement = document.querySelector('[ng-app='+ app + ']');
            var $scope = angular.element(appElement).scope();
            $scope.$apply(function() {
                $scope.ajaxResult = data;
            });
        },
        error: function(xhr, status, error) {
            showError("Chyba! AJAX Request (myurl)!", xhr.responseText);
        }
    });
}

function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-') + " " + [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
}

function hmsToSecondsOnly(str) {
    var p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}

function secondsToms(d) {
    d = Number(d);

    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    return ('0' + (m+h*60)).slice(-2) + ":" + ('0' + s).slice(-2);
}

function showPenalty() {
    $(".penaltyDiv").removeClass("upDown"); $(".penalty .overlay").removeClass("overlayHide");
    setTimeout(function() {
        $(".penaltyDiv").addClass("upDown"); $(".penalty .overlay").addClass("overlayHide");
    }, 7000);
}

function showGoal() {
    $(".goalDiv").removeClass("upDown"); $(".goal .overlay").removeClass("overlayHide");
    setTimeout(function() {
        $(".goalDiv").addClass("upDown"); $(".goal .overlay").addClass("overlayHide");
    }, 7000);
}

$("#showAbout").click(function() {
    var header = "MatchWriter";
    var body =  "<b>Autor: </b> Kristián Stroka<br>";
    body +=     "<b>Kontakt: </b> k.stroka@gmail.com";
    body +=     "<hr>";
    body +=     "<b>Verzia v1.0 </b> - aplikácia bola vytvorená za účelom tímového projektu na FEI STU. Jedná sa o prvú veriu, ktorá je ešte len v základnej verzii.";
    body +=     "<hr>";
    body +=     "Zdrojové kódy je možné prezrieť si v repozitári git: (https://github.com/SportOrganizer/matchwriter)";
    body +=     "<hr>";
    body +=     "V prípade, že chcete používať projektor (zobrazenie pre divákov), je ho potrebné aktivovať ešte <b>pred</b> začatím zápasu!!!";
    showError(header, body);
});