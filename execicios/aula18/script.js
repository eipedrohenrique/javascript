window.onload = function () {
    var seconds = 00;
    var tens = 00;
    var appendTens = 
    document.getElementById("tens")
        var appendSeconds = 
    document.getElementById("seconds")
        var buttonStart = 
    document.getElementById('button-start')
        var buttonStop = 
    document.getElementById('button-stop')
        var buttonReset= 
    document.getElementById('button-reset')
        var Interval ;

        buttonStart.onclick = function () {
            clearInterval(Interval);
            Interval = setInterval(startTimer, 10);
        }

        buttonStop.onclick = function() {
            clearInterval(Interval);
        }

        

}