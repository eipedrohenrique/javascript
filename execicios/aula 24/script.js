const result = document.getElementById('result');
const clear = document.getElementById('clear');
const calculate = document.getElementById('calculate');
const operators = document.querySelectorAll('.operator');
const buttons = document.querySelectorAll('button:not(.operator)');

for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function() {
        result.value += this.value;
    });
}

for (let i = 0; i < operators.length; i++) {
    operators[i].addEventListener('click', function() {
        result.value += this.value;
    });
}

clear.addEventListener('click', function() {
    result.value = '';
});

calculate.addEventListener('click', function() {
    try {
        result.value = eval(result.value);
    } catch (error) {
        result.value = 'Error';
    }
});