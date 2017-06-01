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

