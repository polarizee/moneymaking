document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;
  tg.ready(); // Инициализация Telegram Mini App

  const startButton = document.getElementById('startButton');
  const cashOutButton = document.getElementById('cashOutButton');
  const betAmountInput = document.getElementById('betAmount');
  const multiplierDisplay = document.getElementById('multiplier');
  const winAmountDisplay = document.getElementById('winAmount');
  const messageDisplay = document.getElementById('message');
  const rocket = document.getElementById('rocket');
  const balanceDisplay = document.getElementById('balance');
  const gameTitle = document.getElementById('gameTitle');

  let currentMultiplier = 1.0;
  let betAmount = 0;
  let gameInterval;
  let isGameRunning = false;
  let balance = localStorage.getItem('balance') ? parseFloat(localStorage.getItem('balance')) : 1000.00;

  function updateBalance() {
    localStorage.setItem('balance', balance.toFixed(2));
    balanceDisplay.textContent = balance.toFixed(2);
  }

  // Функция для запуска игры
  startButton.addEventListener('click', () => {
    if (isGameRunning) return;

    betAmount = parseInt(betAmountInput.value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
      messageDisplay.textContent = "Некорректная сумма ставки!";
      return;
    }

    balance -= betAmount;
    updateBalance();

    isGameRunning = true;
    startButton.disabled = true;
    cashOutButton.disabled = false;
    messageDisplay.textContent = "";
    currentMultiplier = 1.0;
    multiplierDisplay.textContent = "1.00x";
    winAmountDisplay.textContent = "0";
    gameTitle.textContent = "Игра началась!";

    gameInterval = setInterval(() => {
      currentMultiplier += 0.01;
      multiplierDisplay.textContent = currentMultiplier.toFixed(2) + "x";
      winAmountDisplay.textContent = Math.floor(betAmount * currentMultiplier);

      // Анимация ракетки (без движения вверх)
      const scale = 1 + currentMultiplier * 0.1; // Увеличиваем размер ракетки
      rocket.style.transform = `translateX(-50%) scale(${scale})`;

      // Добавляем эффект "вибрации" для иллюзии движения
      const shake = Math.sin(currentMultiplier * 10) * 2; // Небольшое дрожание
      rocket.style.transform = `translateX(-50%) scale(${scale}) translateX(${shake}px)`;

      // Случайный "взрыв" (2% шанс каждую секунду)
      if (Math.random() < 0.01) {
        endGame(false);
      }
    }, 100);
  });

  // Функция для завершения игры
  cashOutButton.addEventListener('click', () => {
    if (!isGameRunning) return;
    endGame(true);
  });

  function endGame(isWin) {
    clearInterval(gameInterval);
    isGameRunning = false;
    startButton.disabled = false;
    cashOutButton.disabled = true;
    gameTitle.textContent = "Ракетка";

    if (isWin) {
      const winAmount = Math.floor(betAmount * currentMultiplier);
      balance += winAmount;
      updateBalance();
      messageDisplay.textContent = `Вы выиграли ${winAmount}₽!`;
      rocket.style.transform = "translateX(-50%) scale(1)"; // Возвращаем ракетку к исходному размеру
    } else {
      messageDisplay.textContent = "Ракетка взорвалась! Вы проиграли.";
      rocket.textContent = "💥";
      setTimeout(() => {
        rocket.textContent = "🚀";
        rocket.style.transform = "translateX(-50%) scale(1)"; // Возвращаем ракетку к исходному размеру
      }, 1000);
    }
  }

  // Инициализация баланса
  updateBalance();
});
