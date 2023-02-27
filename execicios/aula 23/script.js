var operand1 = 0;
var operand2 = null;
var operator = null;
var display = document.getElementById("display");

function calculator(value) {
  if (value >= 0 && value <= 9) {
    if (operator == null) {
      operand1 = (operand1 * 10) + parseInt(value);
      display.value = operand1;
    } else {
      if (operand2 == null) {
        operand2 = parseInt(value);
      } else {
        operand2 = (operand2 * 10) + parseInt(value);
      }
      display.value = operand2;
    }
  } else if (value == "+" || value == "-" || value == "*" || value == "/") {
    operator = value;
  } else if (value == "=") {
    var result = 0;
    switch (operator) {
      case "+":
        result = operand1 + operand2;
        break;
      case "-":
        result = operand1 - operand2;
        break;
      case "*":
        result = operand1 * operand2;
        break;
      case "/":
        result = operand1 / operand2;
        break;
    }
    display.value = result;
    operand1 = result;
    operand2 = null;
    operator = null;
  } else if (value == "c") {
    operand1 = 0;
    operand2 = null;
    operator = null;
    display.value = "0";
  }
}