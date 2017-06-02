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

