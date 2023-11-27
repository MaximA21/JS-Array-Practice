'use strict';
// Data
const account1 = {
    owner: 'Max Mustermann',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
};

const account3 = {
    owner: 'Steven Thomas Williams',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
};

const account4 = {
    owner: 'Sarah Smith',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (mov) {
    containerMovements.innerHTML = ""
    mov.forEach(function (oneMov, i) {
        const type = oneMov > 0 ? "deposit" : "withdrawal"

        const html = `
          <div class="movements__row">
            <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
            <div class="movements__value">${oneMov + "€"}</div>
        </div>`;
        containerMovements.insertAdjacentHTML("afterbegin", html)
    })
}
const calcDisplayBalance = function (movements) {
    labelBalance.textContent = `${movements.reduce((acc, curr) => acc+curr,0)}€`
}
const calcDisplaySummary = function (acc) {
    labelSumIn.textContent = `${acc.movements.filter(curr => curr > 0).reduce((acc, curr) => acc + curr,0)}€`
    labelSumOut.textContent = `${acc.movements.filter(curr => curr < 0).reduce((acc,curr) => acc + Math.abs(curr),0)}€`
    labelSumInterest.textContent = `${acc.movements.filter(curr => curr > 0).map(curr => curr * acc.interestRate /100).filter(curr => curr >= 1).reduce((acc, curr) => acc + curr,0)}€`
}

let currentAccount
btnLogin.addEventListener("click", function (evt) {
    //prevent form from submitting
    evt.preventDefault()
    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)

    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(" ").at(0)}`
        containerApp.style.opacity = 100

        calcDisplaySummary(currentAccount)
        displayMovements(currentAccount.movements)
        calcDisplayBalance(currentAccount.movements)

        inputLoginUsername.value = inputLoginPin.value = ""
        inputLoginUsername.blur()
        inputLoginPin.blur()
    }
})

const createUsernames = function (accs) {
    accs.forEach(function (acc) {
    acc.username = acc.owner.toLowerCase().split(" ").map(name => name.at(0)).join("")
    })
}
createUsernames(accounts)