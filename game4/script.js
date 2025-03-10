

const grid = document.querySelector('.grid');
const spinButton = document.getElementById('spin-button');
const buyBonusButton = document.getElementById('buy-bonus');
const balanceDisplay = document.getElementById('balance');
const betSelector = document.getElementById('bet');
const bonusCostDisplay = document.getElementById('bonus-cost');
const totalBonusWinsDisplay = document.getElementById('total-bonus-wins');
const lastSpinWinDisplay = document.getElementById('last-spin-win');
const spinsLeftDisplay = document.getElementById('spins-left');
const modal = document.getElementById('custom-modal');
const modalText = document.getElementById('modal-text');
const modalOk = document.getElementById('modal-ok');
const modalCancel = document.getElementById('modal-cancel');
const gameTitle = document.querySelector('h1');

// Загрузка баланса из LocalStorage
let balance = localStorage.getItem('balance') ? parseFloat(localStorage.getItem('balance')) : 1000.00;
let currentBet = 10;
let bonusCost = currentBet * 100;
let isSpinning = false;
let isBonusRound = false;
let bonusSpins = 0;
let totalBonusWins = 0.00;
let lastSpinWin = 0.00;

// Символы для игры и их шансы
const symbols = [
  { symbol: '🍒', chance: 9.5 },
  { symbol: '🍋', chance: 8.5 },
  { symbol: '🍊', chance: 8 },
  { symbol: '🍎', chance: 7 },
  { symbol: '🍇', chance: 6 },
  { symbol: '🍉', chance: 5 },
  { symbol: '⭐', chance: 4 },
];

// Бомбы и их шансы
const bombs = [
  { symbol: '2X', chance: 5 },
  { symbol: '3X', chance: 3 },
  { symbol: '5X', chance: 2 },
  { symbol: '10X', chance: 1 },
  { symbol: '15X', chance: 0.5 },
  { symbol: '20X', chance: 0.3 },
  { symbol: '50X', chance: 0.2 },
  { symbol: '100X', chance: 100 },
];

const lollipopChance = 3; // Шанс выпадения 🍭 (3%)
const bombChance = 50; // Шанс выпадения бомбы в бонуске (5%)

// Ценность символов
const symbolValues = {
  '🍒': 1 / 15,
  '🍋': 1 / 12,
  '🍊': 1 / 8,
  '🍎': 1 / 5,
  '🍇': 1 / 3,
  '🍉': 1 / 2,
  '⭐': 1,
};


// Обновление отображения баланса и стоимости бонуса
function updateUI() {
  localStorage.setItem('balance', balance.toFixed(2));
  bonusCostDisplay.textContent = bonusCost.toFixed(2);
  balanceDisplay.textContent = balance.toFixed(2);
  totalBonusWinsDisplay.textContent = totalBonusWins.toFixed(2);
  lastSpinWinDisplay.textContent = lastSpinWin.toFixed(2);
  spinsLeftDisplay.textContent = bonusSpins;

  // Блокировка кнопок только во время бонусного раунда
  spinButton.disabled = isBonusRound;
  buyBonusButton.disabled = isBonusRound;
}

// Создание сетки 6x5
function createGrid() {
  for (let i = 0; i < 30; i++) {
    const cell = document.createElement('div');
    grid.appendChild(cell);
  }
}

// Выбор случайного символа с учетом шансов
function getRandomSymbol() {
  const totalChance = symbols.reduce((sum, sym) => sum + sym.chance, 0);
  let random = Math.random() * totalChance;
  for (const sym of symbols) {
    if (random < sym.chance) return sym.symbol;
    random -= sym.chance;
  }
  return symbols[0].symbol;
}

// Выбор случайной бомбы с учетом шансов
function getRandomBomb() {
  const totalChance = bombs.reduce((sum, bomb) => sum + bomb.chance, 0);
  let random = Math.random() * totalChance;
  for (const bomb of bombs) {
    if (random < bomb.chance) return bomb.symbol;
    random -= bomb.chance;
  }
  return bombs[0].symbol;
}

// Заполнение сетки случайными символами
function spinGrid() {
  if (isSpinning) return;
  if (balance < currentBet && !isBonusRound) {
    showModal('Недостаточно средств!');
    return;
  }

  isSpinning = true;
  if (!isBonusRound) {
    balance -= currentBet; // Списываем ставку только в обычном раунде
  }
  updateUI();

  const cells = document.querySelectorAll('.grid div');
  cells.forEach(cell => {
    let randomSymbol;
    if (isBonusRound) {
      // В бонусном раунде добавляем бомбы и 🍭
      const random = Math.random() * 100;
      if (random < lollipopChance) {
        randomSymbol = '🍭'; // Шанс 1% на 🍭
      } else if (random < bombChance) {
        randomSymbol = getRandomBomb();
      } else {
        randomSymbol = getRandomSymbol();
      }
    } else {
      // В обычном раунде бомб и 🍭 нет
      randomSymbol = getRandomSymbol();
    }
    cell.textContent = randomSymbol;
    cell.classList.add('falling');
    setTimeout(() => cell.classList.remove('falling'), 500);
  });

  setTimeout(() => {
    checkForWins();
    isSpinning = false;
  }, 500);
}

// Подсветка выигрышных символов
function highlightWinningSymbols(winningCells) {
  winningCells.forEach(cell => cell.classList.add('highlight'));
  setTimeout(() => {
    winningCells.forEach(cell => cell.classList.remove('highlight'));
  }, 500);
}

// Анимация тряски бомбы (снизу вверх)
function shakeBomb(cell) {
  cell.classList.add('shake');
  setTimeout(() => cell.classList.remove('shake'), 500);
}

// Проверка на выигрышные комбинации
function checkForWins() {
  const cells = document.querySelectorAll('.grid div');
  const symbolCounts = {};
  let totalMultiplier = 0;
  let lollipopCount = 0;
  const winningCells = [];

  cells.forEach(cell => {
    const symbol = cell.textContent;
    if (bombs.map(b => b.symbol).includes(symbol)) {
      const multiplier = parseInt(symbol);
      totalMultiplier += multiplier;
      shakeBomb(cell); // Анимация тряски бомбы
    } else if (symbol === '🍭') {
      lollipopCount++;
    } else {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
      if (symbolCounts[symbol] >= 8) {
        winningCells.push(cell);
      }
    }
  });

  // Обработка 🍭
  if (lollipopCount >= 3) {
    bonusSpins += 5;
    showModal(`+5 бонусных спинов! Осталось спинов: ${bonusSpins}`);
  }

  // Обработка выигрышей
  let winAmount = 0;
  Object.keys(symbolCounts).forEach(symbol => {
    const count = symbolCounts[symbol];
    if (count >= 8) {
      winAmount += currentBet * symbolValues[symbol] * count;
      // Подсветка всех символов, которые сыграли
      cells.forEach(cell => {
        if (cell.textContent === symbol) {
          winningCells.push(cell);
        }
      });
    }
  });

  if (totalMultiplier > 0) {
    winAmount *= totalMultiplier;
  }

  if (winAmount > 0) {
    if (isBonusRound) {
      totalBonusWins += winAmount; // Накапливаем выигрыш в бонуске
    } else {
      balance += winAmount; // Начисляем выигрыш сразу в обычном раунде
    }
    lastSpinWin = winAmount;
    highlightWinningSymbols(winningCells);
  }

  // Обновляем интерфейс
  updateUI();

  // Если это бонусный раунд, продолжаем автоматически
  if (isBonusRound) {
    bonusSpins--; // Уменьшаем количество оставшихся спинов
    if (bonusSpins > 0) {
      setTimeout(spinGrid, 1400); // Задержка 1.4 секунды
    } else {
      setTimeout(() => {
        isBonusRound = false;
        balance += totalBonusWins; // Начисляем выигрыш после завершения бонусного раунда
        showModal(`Бонусный раунд завершен! Выигрыш: ${totalBonusWins.toFixed(2)} ₽`, false, true); // Показываем окно завершения

        // Возвращаем надпись "Слоты"
        gameTitle.textContent = 'Слоты';

        // Блокировка кнопки "ОК" на 1 секунду
        modalOk.disabled = true;
        setTimeout(() => {
          modalOk.disabled = false;
        }, 1000);

        totalBonusWins = 0.00;
        lastSpinWin = 0.00;
        updateUI();
      }, 1400); // Задержка 1.4 секунды перед завершением бонусного раунда
    }
  }
}

// Покупка бонуса
function buyBonus() {
  if (balance >= bonusCost) {
    showModal(`Купить бонусный раунд за ${bonusCost.toFixed(2)} ₽?`, true);
  } else {
    showModal('Недостаточно средств для покупки бонуса!');
  }
}

// Показать модальное окно
function showModal(text, isConfirm = false, isCompletion = false) {
  modalText.textContent = text;
  modal.style.display = 'flex';

  if (isConfirm) {
    modalOk.style.display = 'inline-block';
    modalCancel.style.display = 'inline-block';
  } else if (isCompletion) {
    modalOk.style.display = 'inline-block';
    modalCancel.style.display = 'none';
  } else {
    modalOk.style.display = 'inline-block';
    modalCancel.style.display = 'none';
  }
}

// Закрыть модальное окно
function closeModal() {
  modal.style.display = 'none';
}

// Обработка подтверждения покупки бонуса
modalOk.addEventListener('click', () => {
  if (modalText.textContent.includes('Бонусный раунд начался')) {
    // Если это окно "Бонусный раунд начался", запускаем бонусный раунд
    closeModal();
    gameTitle.textContent = 'Игра началась'; // Меняем надпись
    setTimeout(spinGrid, 500); // Задержка 0.5 секунды перед началом бонусного раунда
  } else if (modalText.textContent.includes('Бонусный раунд завершен')) {
    // Если это окно "Бонусный раунд завершен", просто закрываем окно
    closeModal();
  } else {
    // Обычное подтверждение (например, покупка бонуса)
    if (balance >= bonusCost) {
      balance -= bonusCost;
      isBonusRound = true;
      bonusSpins = 10;
      totalBonusWins = 0.00;
      updateUI();
      closeModal();
      showModal('Бонусный раунд начался!', false, false); // Показываем окно начала бонусного раунда
    } else {
      closeModal(); // Закрываем окно, если недостаточно средств
    }
  }
});

modalCancel.addEventListener('click', closeModal);

// Изменение ставки
betSelector.addEventListener('change', (e) => {
  if (isBonusRound) {
    showModal('Нельзя менять ставку во время бонусного раунда!');
    e.target.value = currentBet; // Сбрасываем выбор
    return;
  }
  currentBet = parseInt(e.target.value);
  bonusCost = currentBet * 100;
  updateUI();
});

// Инициализация игры
createGrid();
updateUI();
spinButton.addEventListener('click', spinGrid);
buyBonusButton.addEventListener('click', buyBonus);
