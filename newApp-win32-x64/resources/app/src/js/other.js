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