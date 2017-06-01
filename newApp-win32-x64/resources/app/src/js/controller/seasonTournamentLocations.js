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
