document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;
  tg.ready(); // Инициализация Telegram Mini App

  const balanceElement = document.getElementById('balance');
  const caseModal = document.getElementById('case-modal');
  const caseResult = document.getElementById('case-result');
  const progressBar = document.querySelector('.progress');
  const closeCaseModalButton = document.getElementById('close-case-modal');

  let balance = localStorage.getItem('balance') ? parseFloat(localStorage.getItem('balance')) : 1000.00;
  let isSpinning = false;

  function updateBalance() {
    localStorage.setItem('balance', balance.toFixed(2));
    balanceElement.textContent = balance.toFixed(2);
  }

  window.buyCase = function (caseType) {
    if (isSpinning) return;
    isSpinning = true;

    let min, max, price;
    switch (caseType) {
      case 'novice':
        min = 100;
        max = 1000;
        price = 250;
        break;
      case 'player':
        min = 250;
        max = 2500;
        price = 500;
        break;
      case 'gambler':
        min = 400;
        max = 10000;
        price = 1000;
        break;
      case 'legend':
        min = 1000;
        max = 15000;
        price = 5000;
        break;
      case 'credit':
        min = 3000;
        max = 30000;
        price = 10000;
        break;
      default:
        return;
    }

    if (balance < price) {
      alert('Недостаточно средств на балансе!');
      isSpinning = false;
      return;
    }

    balance -= price;
    updateBalance();

    // Открываем модальное окно
    caseModal.style.display = 'flex';
    caseResult.textContent = "Открываем кейс...";
    progressBar.style.width = '0';
    closeCaseModalButton.style.display = 'none';

    // Анимация прокрутки
    let spinDuration = 5000; // Увеличили длительность анимации (5 секунд)
    let startTime = Date.now();
    let lastUpdateTime = startTime;

    function updateAnimation() {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime < spinDuration) {
        // Обновляем цифры каждые 200 мс (вместо 50 мс)
        if (currentTime - lastUpdateTime >= 200) {
          const randomAmount = getRandomAmountForAnimation(min, max);
          caseResult.textContent = `${randomAmount} рублей`;
          lastUpdateTime = currentTime;
        }

        progressBar.style.width = `${(elapsedTime / spinDuration) * 100}%`;
        requestAnimationFrame(updateAnimation);
      } else {
        const finalAmount = getRandomAmount(min, max, price);
        caseResult.textContent = `Вы выиграли: ${finalAmount} рублей!`;
        progressBar.style.width = '100%';
        balance += finalAmount;
        updateBalance();
        isSpinning = false;
        closeCaseModalButton.style.display = 'block'; // Показываем кнопку "Закрыть"
      }
    }

    updateAnimation();
  };

  // Закрытие модального окна
  closeCaseModalButton.addEventListener('click', () => {
    caseModal.style.display = 'none';
    progressBar.style.width = '0';
  });

  // Генерация случайной суммы для анимации
  function getRandomAmountForAnimation(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Генерация финальной суммы
  function getRandomAmount(min, max, price) {
    const random = Math.random();

    if (random < 0.3) {
      return Math.floor(Math.random() * (max - price + 1)) + price;
    } else if (random < 0.35) {
      const doublePrice = price * 2;
      return Math.floor(Math.random() * (max - doublePrice + 1)) + doublePrice;
    } else {
      return Math.floor(Math.random() * (price - min + 1)) + min;
    }
  }

  // Инициализация баланса
  updateBalance();
});