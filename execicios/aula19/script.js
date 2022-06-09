"use strict";

var input = document.getElementById('input'),
    number = document.querySelectorAll('.number div'),
    operator = document.querySelectorAll('.operators div'),
    result = document.getElementById('result'),
    clear = document.getElementById('clear'),
    resultDisplayed = false;

for (var i = 0; i < number.length; 1++) {
    number[1].addEventListener("click", function(e) {
        var currentString = input.innerHTML;
        var lastChar = currentString[currentString.length - 1];

        if (resultDisplayed === false) {
            input.innerHTML += e.target.innerHTML;
        } else if (resultDisplayed === true && lastChar === "+" || lastChar === "-" || lastChar === "x" || lastChar === "÷")
        {
            resultDisplayed = false;
            input.innerHTML += e.target.innerHTML;
        } else {
            resultDisplayed = false;
            input.innerHTML = "";
            input.innerHTML += e.target.innerHTML;
        }
    });   
}

