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