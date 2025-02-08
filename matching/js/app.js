/*
 * Create a list that holds all of your cards
 */
const deck = document.querySelector('.deck');
const ul = document.createDocumentFragment();
const cardsList = [];

// Use PNG images (02.png - 12.png)
const imagePaths = [
    "02.png", "03.png", "05.png", "06.png",
    "08.png", "09.png", "10.png", "12.png"
];

// Create duplicate cards for matching
const cardImages = [...imagePaths, ...imagePaths];

// Shuffle the cards
const shuffledCards = shuffle(cardImages);

shuffledCards.forEach((img) => {
    const li = document.createElement('li');
    li.className = 'card';
    li.dataset.image = img;

    const imgElement = document.createElement('img');
    imgElement.src = `img/png/${img}`;
    imgElement.alt = `Memory Card ${img}`;
    imgElement.classList.add('hidden');

    li.appendChild(imgElement);
    cardsList.push(li);
});

// Append shuffled cards to the deck
cardsList.forEach(card => ul.appendChild(card));
deck.appendChild(ul);

let openCards = [];
let matchedCards = [];
let movesCounter = 0;
const moves = document.querySelector('.moves');
const restartBtn = document.querySelector('.restart');
const min = document.querySelector('.min');
const sec = document.querySelector('.sec');
const stars = document.querySelectorAll('.stars li');
const comment = document.querySelector('.comment');
const finalScoreModal = document.querySelector('.modal');
const closeModal = document.querySelector('.close');
const playAgain = document.querySelector('.play-again');
const totalTime = document.querySelector('#total-time');
let timerOn = false;
let playerTime;

// Initialize Moves
moves.textContent = `${movesCounter} Moves`;

// Restart Game
restartBtn.addEventListener('click', restart);

// Card click event listener
deck.addEventListener('click', function (e) {
    if (e.target.tagName === 'LI' && !e.target.classList.contains('match')) {
        showCard(e.target);
    }
});

// Timer Start
deck.addEventListener('click', function(e) {
    if (!timerOn && e.target.classList.contains('card')) {
        startTimer();
    }
});

function showCard(card) {
    if (openCards.length >= 2 || card.classList.contains('open')) return;

    card.classList.add('open');
    card.querySelector('img').style.display = 'block';
    openCards.push(card);

    if (openCards.length === 2) {
        movesCounter++;
        moves.textContent = `${movesCounter} Moves`;
        updateStars();
        checkMatch();
    }
}

function checkMatch() {
    const [firstCard, secondCard] = openCards;
    
    if (firstCard.dataset.image === secondCard.dataset.image) {
        openCards.forEach(card => card.classList.add('match'));
        matchedCards.push(...openCards);
        openCards = [];

        if (matchedCards.length === cardsList.length) {
            setTimeout(showFinalScore, 500);
        }
    } else {
        setTimeout(() => {
            openCards.forEach(card => {
                card.classList.remove('open');
                card.querySelector('img').style.display = 'none';
            });
            openCards = [];
        }, 800);
    }
}

// Restart Game
function restart() {
    openCards = [];
    matchedCards = [];
    movesCounter = 0;
    moves.textContent = "0 Moves";

    // Reset all cards
    cardsList.forEach(card => {
        card.classList.remove('open', 'match');
        card.querySelector('img').style.display = 'none';
    });

    // Shuffle and reassign cards
    const shuffled = shuffle(cardImages);
    cardsList.forEach((card, index) => {
        card.dataset.image = shuffled[index];
        card.querySelector('img').src = `img/png/${shuffled[index]}`;
    });

    // Append to deck
    deck.innerHTML = "";
    cardsList.forEach(card => deck.appendChild(card));

    // Reset Timer & Stars
    timerOn = false;
    clearInterval(playerTime);
    min.textContent = "00";
    sec.textContent = "00";
    stars.forEach(star => star.style.display = 'inline-block');
    comment.textContent = "";
}

// Show Final Score Modal
function showFinalScore() {
    finalScoreModal.style.display = 'block';
    totalTime.textContent = `${min.textContent}m ${sec.textContent}s`;
    updateStars();
}

playAgain.addEventListener('click', function () {
    restart();
    closeModalHandler();
});

closeModal.addEventListener('click', closeModalHandler);

function closeModalHandler() {
    finalScoreModal.style.display = 'none';
}

// Timer Functionality
function startTimer() {
    timerOn = true;
    let minuteCounter = 0;
    let secondCounter = 0;

    playerTime = setInterval(() => {
        if (secondCounter === 59) {
            secondCounter = 0;
            minuteCounter++;
            min.textContent = minuteCounter < 10 ? '0' + minuteCounter : minuteCounter;
        }
        secondCounter++;
        sec.textContent = secondCounter < 10 ? '0' + secondCounter : secondCounter;
    }, 1000);
}

// Update Star Rating
function updateStars() {
    if (movesCounter > 18) {
        stars[2].style.display = 'none';
        comment.textContent = 'Memory Made of Stone?';
    }
    if (movesCounter > 25) {
        stars[1].style.display = 'none';
        comment.textContent = 'Good Job!';
    }
    if (movesCounter > 30) {
        stars[0].style.display = 'none';
        comment.textContent = 'Try Again!';
    }
}

// Fisher-Yates Shuffle Algorithm
function shuffle(arr) {
    let currentIndex = arr.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }
    return arr;
}
