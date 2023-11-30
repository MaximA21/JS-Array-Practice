'use strict';
// Data

const account1 = {
    owner: 'Max Mustermann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2020-05-27T17:01:17.194Z',
        '2023-11-27T23:36:17.929Z',
        '2023-11-29T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'de-DE',
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];


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


const formatMovementDate = function (date, locale) {
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))
    const daysPassed = calcDaysPassed(new Date(), date)

    if (daysPassed === 0) return "Today"
    if (daysPassed === 1) return "Yesterday"
    if (daysPassed <= 7) return `${daysPassed} days ago`
    return new Intl.DateTimeFormat(locale).format(date)
}

const formatCurr = function (value, locale, curr) {
    return new Intl.NumberFormat(locale, {style: "currency", currency: curr}).format(value)
}

const displayMovements = function (acc, sort = false) {
    containerMovements.innerHTML = ""
    const movs = sort ? acc.movements.slice().sort((a,b) => a-b) : acc.movements
    movs.forEach(function (oneMov, i) {
        const type = oneMov > 0 ? "deposit" : "withdrawal"

        const date = new Date(acc.movementsDates.at(i))
        const displayDate = formatMovementDate(date, acc.locale)

        const html = `
          <div class="movements__row">
            <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
             <div class="movements__date">${displayDate}</div>
            <div class="movements__value">${formatCurr(oneMov,acc.locale,acc.currency)}</div>
        </div>`;
        containerMovements.insertAdjacentHTML("afterbegin", html)
    })
}
const calcDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, curr) => acc+curr,0)
    labelBalance.textContent = formatCurr(acc.balance, acc.locale, acc.currency)
}
const calcDisplaySummary = function (acc) {
    labelSumIn.textContent = formatCurr(acc.movements.filter(curr => curr > 0).reduce((acc, curr) => acc + curr,0), acc.locale, acc.currency)
    labelSumOut.textContent = formatCurr(acc.movements.filter(curr => curr < 0).reduce((acc,curr) => acc + Math.abs(curr),0) , acc.locale, acc.currency)
    labelSumInterest.textContent = formatCurr(acc.movements.filter(curr => curr > 0).map(curr => curr * acc.interestRate /100).filter(curr => curr >= 1).reduce((acc, curr) => acc + curr,0), acc.locale, acc.currency)
}

const updateUI = function (acc) {
    calcDisplaySummary(acc)
    displayMovements(acc)
    calcDisplayBalance(acc)
}

let currentAccount, timer
btnLogin.addEventListener("click", function (evt) {
    //prevent form from submitting
    evt.preventDefault()
    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)

    if (currentAccount?.pin === +inputLoginPin.value) {
        labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(" ").at(0)}`
        containerApp.style.opacity = "100"
        //Display date
        const now = new Date()
        const options = {
            weekday: "short",
            year: "numeric",
            month: "numeric",
            day: "numeric"
        }
      //  const local = navigator.language
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now)

        if (timer) clearInterval(timer)
        timer = startLogOutTimer()
        updateUI(currentAccount)

        inputLoginUsername.value = inputLoginPin.value = ""
        inputLoginUsername.blur()
        inputLoginPin.blur()
    }
})

btnTransfer.addEventListener("click", function (e) {
    e.preventDefault()
    const amount = +inputTransferAmount.value
    const receiverAccount = accounts.find(acc => acc.username === inputTransferTo.value)
    inputTransferAmount.value = inputTransferTo.value = ""

    if (amount > 0 && receiverAccount && currentAccount.balance >= amount && receiverAccount.username !== currentAccount.username) {
        currentAccount.movements.push(-amount)
        receiverAccount.movements.push(amount)
        currentAccount.movementsDates.push(new Date().toISOString())
        receiverAccount.movementsDates.push(new Date().toISOString())

        updateUI(currentAccount)
        clearInterval(timer)
        timer = startLogOutTimer()
    }
})

btnClose.addEventListener("click", function (evt) {
    evt.preventDefault()

    if (inputCloseUsername.value === currentAccount.username && +inputClosePin.value === currentAccount.pin) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username)
        accounts.splice(index, 1)
        containerApp.style.opacity = "0"
    }
    inputCloseUsername.value = inputClosePin.value = ""
})

btnLoan.addEventListener("click", function (evt) {
    evt.preventDefault()
    const amount = Math.floor(inputLoanAmount.value)

    if (amount > 0 &&currentAccount.movements.some(mov => mov >= amount * 0.1)) {
      setTimeout( function () {
          currentAccount.movements.push(amount)
          currentAccount.movementsDates.push(new Date().toISOString())
          updateUI(currentAccount)
          clearInterval(timer)
          timer = startLogOutTimer()
      }, 3000)
    }
    inputLoanAmount.value = ""
})
let isSorted = false
btnSort.addEventListener("click", function (evt) {
    evt.preventDefault()
    displayMovements(currentAccount, !isSorted)
    isSorted = !isSorted
})

const startLogOutTimer = function () {
    const tick = function () {
        const min = String(Math.trunc(time / 60)).padStart(2, "0")
        const sec = String(time % 60).padStart(2, "0")
        labelTimer.textContent = `${min}:${sec}`
        if (time === 0) {
            clearInterval(timer)
            labelWelcome.textContent = `Log in to get started`
            containerApp.style.opacity = "0"
        }
        time--
    }
    let time = 100
    tick()
    const timer = setInterval(tick ,1000)
    return timer
}



const createUsernames = function (accs) {
    accs.forEach(function (acc) {
    acc.username = acc.owner.toLowerCase().split(" ").map(name => name.at(0)).join("")
    })
}
createUsernames(accounts)