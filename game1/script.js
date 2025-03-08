document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready(); // Инициализация Telegram Mini App

    const balanceElement = document.getElementById('balance');
    const betInput = document.getElementById('bet');
    const losingFieldsInput = document.getElementById('losing-fields');
    const startGameButton = document.getElementById('start-game');
    const cashOutButton = document.getElementById('cash-out');
    const resultElement = document.querySelector('.result');
    const nextWinElement = document.getElementById('next-win');
    const fields = document.querySelectorAll('.field');
    const loseModal = document.getElementById('lose-modal');
    const closeLoseModalButton = document.getElementById('close-lose-modal');
    const gameTitle = document.getElementById('game-title');

    let balance = localStorage.getItem('balance') ? parseFloat(localStorage.getItem('balance')) : 1000.00;
    let currentBet = 10;
    let currentMultiplier = 1;
    let revealedFields = [];
    let losingFields = [];
    let isGameActive = false;

    const progressiveMultipliers = [0.5, 0.6, 0.8, 1.0, 1.3, 1.7, 2.2, 2.8, 3.5, 4.3, 5.2, 6.2];

    function getBaseMultiplier(losingFieldsCount) {
        return 1 + (losingFieldsCount - 1) * 0.5;
    }

    function updateBalance() {
        localStorage.setItem('balance', balance.toFixed(2));
        balanceElement.textContent = balance.toFixed(2);
    }

    function updateWinAmount() {
        const baseMultiplier = getBaseMultiplier(Number(losingFieldsInput.value));
        const currentWin = currentBet * currentMultiplier * baseMultiplier;
        const nextMultiplier = progressiveMultipliers[revealedFields.length] || 1;
        const nextWin = currentBet * nextMultiplier * baseMultiplier;

        resultElement.textContent = `Текущий выигрыш: ${currentWin.toFixed(2)}₽`;
        nextWinElement.textContent = `-> ${nextWin.toFixed(2)}₽`;
    }

    function generateLosingFields(count) {
        losingFields = [];
        while (losingFields.length < count) {
            const randomIndex = Math.floor(Math.random() * 12);
            if (!losingFields.includes(randomIndex)) {
                losingFields.push(randomIndex);
            }
        }
    }

    function resetGame() {
        fields.forEach(field => {
            field.classList.remove('revealed', 'lose', 'win');
            field.textContent = '';
            field.style.pointerEvents = 'auto';
        });
        revealedFields = [];
        currentMultiplier = 1;
        resultElement.textContent = 'Текущий выигрыш: 0.00₽';
        nextWinElement.textContent = '-> 0.00₽';
        cashOutButton.disabled = true;
        cashOutButton.textContent = 'Забрать приз';
        isGameActive = false;
        gameTitle.textContent = 'Мины';
    }

    function showAllLosingFields() {
        losingFields.forEach(index => {
            const field = fields[index];
            field.classList.add('revealed', 'lose');
            field.textContent = '💣';
            field.style.pointerEvents = 'none';
        });
    }

    function checkGameOver() {
        if (revealedFields.length === 12 - losingFields.length) {
            cashOutButton.textContent = 'MAX WIN';
            cashOutButton.disabled = false;
        }
    }

    fields.forEach(field => {
        field.addEventListener('click', () => {
            if (!isGameActive) return;

            const index = field.dataset.index;
            if (losingFields.includes(Number(index))) {
                showAllLosingFields();
                loseModal.style.display = 'flex';
                resetGame();
            } else {
                field.classList.add('revealed', 'win');
                field.textContent = '💰';
                revealedFields.push(Number(index));
                currentMultiplier = progressiveMultipliers[revealedFields.length - 1] || 1;
                cashOutButton.disabled = false;
                updateWinAmount();
                checkGameOver();
            }
            field.style.pointerEvents = 'none';
        });
    });

    startGameButton.addEventListener('click', () => {
        if (isGameActive) return;

        const losingFieldsCount = Number(losingFieldsInput.value);
        if (balance < currentBet) {
            alert('Недостаточно средств на балансе!');
            return;
        }
        resetGame();
        generateLosingFields(losingFieldsCount);
        balance -= currentBet;
        updateBalance();
        isGameActive = true;
        gameTitle.textContent = 'Игра началась';
    });

    cashOutButton.addEventListener('click', () => {
        const baseMultiplier = getBaseMultiplier(Number(losingFieldsInput.value));
        const winAmount = currentBet * currentMultiplier * baseMultiplier;
        balance += winAmount;
        updateBalance();
        resetGame();
    });

    betInput.addEventListener('input', () => {
        currentBet = Number(betInput.value);
    });

    // Закрытие модального окна "Вы проиграли"
    closeLoseModalButton.addEventListener('click', () => {
        loseModal.style.display = 'none';
    });

    // Инициализация баланса
    updateBalance();
});