let seconds = 30;
const timerEl = document.getElementById("timer");
const periodEl = document.getElementById("period");
const mainContent = document.querySelector(".main-content");
const allButtons = document.querySelectorAll(".buttons button, .number-buttons button");
const tableBody = document.querySelector("table tbody");
const popupOverlay = document.getElementById('popupOverlay');
const selectedItem = document.getElementById('selectedItem');
const winRate = document.getElementById('winRate');
const selectedAmountText = document.getElementById('selectedAmount');
const tableNo = document.getElementById("tableNo");
const balancetxt = document.getElementById("balance");

let balance = 0.00;
let selectedAmount = 0;
let selectedBetS = "";
let selectedBetN = -1;
let isBet = false;
let selectedAmountBtn = 0;
let wTime = -1;
let uItemC = "";
let uItemN = -1;
document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/balance')
  .then(response => response.json())
    
  .then(data => {
      if (data.balance !== undefined) {
          balancetxt.textContent = "Available balance: ₹" + data.balance;
          balance = data.balance;
      } 
  })
  .catch(error => {
      console.error('Error fetching balance:', error);
  });
});

let currentPeriod; // Save the period number globally

function startTimer() {
    seconds--;
    if (seconds === 5) {
      calculatebet();
    }
    if (seconds <= 5 ) {
        mainContent.classList.remove("active");
        allButtons.forEach(btn => btn.disabled = true);
        closePopup(isBet);
    } else if (!(isBet)){
        mainContent.classList.add("active");
        allButtons.forEach(btn => btn.disabled = false);
    }

    if (seconds === 0) {
      
        
        closePopup(isBet);
        updateTrend();
        isBet = false;
    }

    if (seconds < 0 ) {
        mainContent.classList.add("active");
        allButtons.forEach(btn => btn.disabled = false);
        seconds = 30;
    }

    timerEl.innerText = `00:${seconds < 10 ? '0' : ''}${seconds}`;
}

function getRandomPrice() {
    return Math.floor(120000 + Math.random() * (200000 - 120000));
}

function getRandomNumber() {
    return Math.floor(Math.random() * 10);
}

function getRandomColor() {
    let chance = Math.random();
    if (chance < 0.45) return 'green'; // 45% green
    if (chance < 0.9) return 'red';    // 45% red
    return 'purple';                   // 10% violet
}

function generateRandomStartPeriod() {
    return Math.floor(10000000000 + Math.random() * 900000);
}

function updateTrend() {
   
    
    
    const price = getRandomPrice();
    const number = getRandomNumber();
    let color = selectedBetN === -1  && isBet === true && selectedBetS != "purple"? uItemC :getRandomColor();
    if (color === "Lose") {
      while (color === "Lose" || color === selectedBetS) {
        color = getRandomColor();
      }
    } 
    if (selectedBetN === number) { 
      balance += selectedAmount*9;
      balancetxt.textContent = "Available balance: ₹" + balance + ".00";
      showResultCard('win', selectedAmount*9);
    }
    if (selectedBetS === color) {
      if (selectedBetS != "purple") {
        balance += selectedAmount*1.9;
        showResultCard('win', selectedAmount*1.9);
        console.log("win")
      } else {
        balance += selectedAmount*4.5;
        showResultCard('win', selectedAmount*4.5);
      }
      balancetxt.textContent = "Available balance: ₹" + balance + ".00";
    }
    if ((selectedBetN != number && selectedBetS != color) && isBet === true) {
      showResultCard('lose', selectedAmount);
    }
    if (isBet === true) {
      fetch('/api/update_balance', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
        },
          body: JSON.stringify({ amount: balance })  // Amount user won
      })
      .then(res => res.json())
      .then(data => {
          console.log(data.message);
      })
      .catch(error => {
          console.error('Error updating balance:', error);
      });
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${currentPeriod}</td>
      <td>${price}</td>
      <td>${number}</td>
      <td><span class="result-dot dot-${color}"></span></td>
    `;

    newRow.classList.add('new-row'); // Add animation class

    tableBody.prepend(newRow); // Insert new record at top
    currentPeriod += 1; // Increase period by 1
    periodEl.textContent = currentPeriod;

    // Remove new-row class after animation (1s)
    setTimeout(() => {
        newRow.classList.remove('new-row');
    }, 1000);

    // Optional: Keep only 10 rows
    if (tableBody.children.length > 10) {
        tableBody.removeChild(tableBody.lastChild);
    }
}


function initializeGame() {

    //set user balance
    balancetxt.textContent = "Available balance: ₹" + balance;
    // Set random starting period
    currentPeriod = generateRandomStartPeriod();
    periodEl.textContent = currentPeriod;

    //update table no
    let table = Math.floor(1 + Math.random() * 99);
    console.log(table)
    tableNo.innerHTML = `<b>Table no:</b> ${table}`;


    // Generate 10 previous trends
    for (let i = 0; i <= 9; i++) {
        const period = currentPeriod - i-1;
        const price = getRandomPrice();
        const number = getRandomNumber();
        const color = getRandomColor();

        const newRow = document.createElement("tr");
        newRow.innerHTML = `
      <td>${period}</td>
      <td>${price}</td>
      <td>${number}</td>
      <td><span class="result-dot dot-${color}"></span></td>
    `;

        tableBody.appendChild(newRow);
    }
}

// Initialize everything
initializeGame();
updateUI();
setInterval(startTimer, 1000);

function updateUI() {
  timerEl.innerText = `00:${seconds < 10 ? '0' : ''}${seconds}`;

    allButtons.forEach(btn => btn.disabled = true);
}
function openPopup(value, type) {
  if (balance < 3000 && balance >= 10) {
    selected = document.getElementById("selected");
    popupOverlay.style.display = 'flex';
    selectedAmount = 10;
    
    selectedAmountBtn = 10;
    selectedAmountText.innerText = "₹10";
  
    if (type === 'color') {
      selectedBetS = value;
      selected.classList.add(`dot-${value}`, "result-dot");
      
      if (value === 'violet') {
        winRate.innerText = "Get 1:5";
      } else {
        winRate.innerText = "Get 1:2";
      }
    } else if (type === 'number') {
      selectedBetN = value;
      selectedItem.innerText = `${value}`;
      winRate.innerText = "Get 1:9";
    }
  } else if (balance <= 10){
    alert("Not enough balance")
  }
  else {
  alert("According to RBI guidlines, You can't play with more than ₹3000 to avoid any financial loss. To continue , please withdraw money");
 }
}
  
  function closePopup(x) {
    if (x === false) {
      selectedAmount = 0;
      selectedBetN = -1; 
      selectedBetS = ""; 
      popupOverlay.style.display = 'none';
      selected = document.getElementById("selected");
      selected.classList.remove("dot-red", "dot-green", "dot-purple", "result-dot");
      selectedItem.innerText = "";
    } else if (x === true) {
      mainContent.classList.remove("active");
      allButtons.forEach(btn => btn.disabled = true);
      popupOverlay.style.display = 'none';
      selected = document.getElementById("selected");
      selected.classList.remove("dot-red", "dot-green", "dot-purple", "result-dot");
      selectedItem.innerText = "";
    }

  }
  
  function selectAmount(amount) {
    if (amount <= balance) {
      selectedAmount = amount;
      selectedAmountBtn = amount;
      selectedAmountText.innerText = `₹${selectedAmount}`;
    } else {
      console.log('Not enough balance'); 
    }
  }
  
  function multiplyAmount(action) {
    if (action === '+' ) {
      if (selectedAmount + selectedAmountBtn <= balance) {
        selectedAmount += selectedAmountBtn;
        selectedAmountText.innerText = `₹${selectedAmount}`;
      } else {
        console.log("Not enough balance");
      }

     } else if  (action === '-' && selectedAmount != 0) {
      selectedAmount -= selectedAmountBtn;
      selectedAmountText.innerText = `₹${selectedAmount}`;
     }
  }
  function bet() {
    if (selectedAmount != 0) {
      balance -= selectedAmount;
      balancetxt.textContent = "Available balance: ₹" + balance + ".00";
      isBet = true;
      closePopup(true);
    }
    else {
      console.log("Select amount !")
    }
  }
  
  function calculatebet() {
    if (isBet === true && selectedBetS != "purple") {
      if (wTime > 0) {
        uItemC = selectedBetN != -1 ? selectedBetN : selectedBetS;
        wTime -= 1;
      }else if (wTime === 0) {
        uItemC = "Lose"
        wTime -= 1;
      } else {
        let x = Math.random() ;
        if (x < 0.25) {
          wTime = 3;
        } else if (x < 0.5) {
          wTime = 2;
        } else if (x < 0.75) {
          wTime = 1;
        } else {
          wTime = 0;
        }
        calculatebet();
      }
    }
  }
  function showResultCard(result, amount) {
    const card = document.getElementById('resultCard');
    const text = document.getElementById('resultText');

    if (result === 'win') {
        text.innerText = `You Won +₹${amount}`;
        text.className = 'result-text result-win';
    } else if (result === 'lose') {
        text.innerText = `You Lose -₹${amount}`;
        text.className = 'result-text result-lose';
    }

    card.style.display = 'block';
    setTimeout(() => {
      closeResultCard();
    }, 3000)
}

function closeResultCard() {
    document.getElementById('resultCard').style.display = 'none';
}

  
 
