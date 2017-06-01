const matchWriterApp = angular.module('matchWriter', []);

matchWriterApp.controller('matchWriterController', function($rootScope, $scope, TimerService) {
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
		//TODO odkomentovať a dať preč testovacie nastavenia
		/*ipc.send('getGoalTypes', {match: $scope.selectedMatch.id,
								  game: $scope.selectedMatch.seasonTournament.id});
		*/ipc.send('getPenaltyTypes', {match: $scope.selectedMatch.id,
								  game: $scope.selectedMatch.seasonTournament.id});
		ipc.send('getTimeOutLength', {match: $scope.selectedMatch.id,
								  game: $scope.selectedMatch.seasonTournament.id});

		$scope.goalTypes = config.testData.goalTypes;//TODO zakomentovať
		$scope.timeOutLength = config.testData.seasonTournamentTimeOutLength; //TODO zakomentovať

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
	    console.log(obj);

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

		if($scope.choosedTeam == $scope.selectedMatch.homeTeam.id) {
			$scope.homeScore++;
			$scope.addHomeActivity($scope.mainTimer.getTime(), "Gól", text);

			selectedTeam = $scope.selectedMatch.homeTeam.id;
			teamName = $scope.selectedMatch.homeTeam.team.fullName;
		}

		if($scope.choosedTeam == $scope.selectedMatch.awayTeam.id) {
			$scope.awayScore++;
			$scope.addAwayActivity($scope.mainTimer.getTime(), "Gól", text);
			selectedTeam = $scope.selectedMatch.awayTeam.id;
			teamName = $scope.selectedMatch.awayTeam.team.fullName;
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
								goalTeam: teamName}
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

