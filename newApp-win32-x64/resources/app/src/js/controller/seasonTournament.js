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