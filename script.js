document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready(); // Инициализация Telegram Mini App

    const balanceElement = document.getElementById('balance');
    const resetBalanceButton = document.getElementById('reset-balance');
    const dodepModal = document.getElementById('dodep-modal');
    const dodepWarningModal = document.getElementById('dodep-warning-modal');
    const closeDodepWarningModalButton = document.getElementById('close-dodep-warning-modal');

    let balance = localStorage.getItem('balance') ? parseFloat(localStorage.getItem('balance')) : 1000.00;

    function updateBalance() {
        localStorage.setItem('balance', balance.toFixed(2));
        balanceElement.textContent = balance.toFixed(2);
    }

    // Обработчик для кнопки "ДОДЕП"
    resetBalanceButton.addEventListener('click', () => {
        if (balance > 0) {
            dodepWarningModal.style.display = 'flex';
        } else {
            dodepModal.style.display = 'flex';
            setTimeout(() => {
                dodepModal.style.display = 'none';
            }, 2000);
            balance = 1000.00;
            updateBalance();
        }
    });

    // Закрытие модального окна "Додепать можно, если все проиграл"
    closeDodepWarningModalButton.addEventListener('click', () => {
        dodepWarningModal.style.display = 'none';
    });

    // Инициализация баланса
    updateBalance();
});