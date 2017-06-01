liveScoreApp.factory('TimerService', ['$interval', '$rootScope',   function($interval,$rootScope){
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

