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
