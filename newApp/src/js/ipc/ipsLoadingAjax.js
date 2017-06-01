ipc.on("isAjaxStartLoading", function(evt, errorLog) {
    showLoading("Loading!","Načítavam");
})

ipc.on("isAjaxFinishLoading", function(evt, errorLog) {
	hideLoading();
})