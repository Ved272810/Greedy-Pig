// DOM Elements
const startButton = document.getElementById("start-button");
const setupScreen = document.getElementById("setup-screen");
const startScreen = document.getElementById("start-screen");
const addPlayerBtn = document.getElementById("add-player");
const playerListDiv = document.getElementById("player-list");
const startGameBtn = document.getElementById("start-game");
const playersContainer = document.getElementById("players-container");
const diceDiv = document.getElementById("dice");
const rollButton = document.getElementById("roll-button");
const nextButton = document.getElementById("next-button");
const countdownDiv = document.getElementById("countdown");
const roundNumberSpan = document.getElementById("round-number");
const endScreen = document.getElementById("end-screen");
const finalScoresDiv = document.getElementById("final-scores");
const playAgainBtn = document.getElementById("play-again");
const roundsSelect = document.getElementById("rounds-select");
const playerNameInput = document.getElementById("player-name");
const roundPointsBox = document.getElementById("round-points-box");
const spike = document.getElementById("spike");

let players = [];
let round = 1;
let totalRounds = 3;
let roundScores = [];
let roundTotalPoints = 0;
let diceRoll = 0;
let countdownTimer;
let autoNextTimer;

const diceFaces = ["⚀","⚁","⚂","⚃","⚄","⚅"];

startButton.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  setupScreen.classList.remove("hidden");
});

// Add Player
addPlayerBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if (name !== "") {
    players.push({ name: name, totalScore: 0, in: true });
    updatePlayerList();
    playerNameInput.value = "";
  }
});

function updatePlayerList() {
  playerListDiv.innerHTML = "";
  players.forEach((p) => {
    const div = document.createElement("div");
    div.textContent = p.name;
    div.classList.add("player-box", "in");
    playerListDiv.appendChild(div);
  });
}

// Start Game
startGameBtn.addEventListener("click", () => {
  totalRounds = parseInt(roundsSelect.value);
  setupScreen.classList.add("hidden");
  round = 1;
  startRound();
});

function startRound() {
  roundScores = players.map(() => 0);
  roundTotalPoints = 0;
  players.forEach(p => p.in = true);
  roundNumberSpan.textContent = round;
  document.getElementById("game-screen").classList.remove("hidden");
  endScreen.classList.add("hidden");
  updatePlayerBoxes();
  updateRoundPointsBox();
  countdownDiv.textContent = "";
}

// Update player boxes in-game
function updatePlayerBoxes() {
  playersContainer.innerHTML = "";
  players.forEach((p) => {
    const div = document.createElement("div");
    div.textContent = p.name + " (" + (p.in ? "IN" : "OUT") + ")";
    div.classList.add("player-box", p.in ? "in" : "out");
    div.addEventListener("click", () => {
      p.in = !p.in;
      updatePlayerBoxes();
    });
    playersContainer.appendChild(div);
  });
}

// Update round total points box
function updateRoundPointsBox() {
  roundPointsBox.textContent = "Round Total: " + roundTotalPoints;
}

// Dice roll animation
function rollDiceAnimation(callback) {
    const finalValue = Math.floor(Math.random() * 6) + 1;
    let rolls = 25; // number of emoji switches
    let count = 0;
    diceDiv.style.fontSize = "250px";
    rollButton.disabled = true;

    const rollInterval = setInterval(() => {
        const randFace = Math.floor(Math.random() * 6) + 1;
        diceDiv.textContent = diceFaces[randFace - 1];
        count++;
        if(count >= rolls){
            clearInterval(rollInterval);
            diceDiv.textContent = diceFaces[finalValue - 1];
            diceRoll = finalValue;
            if(callback) callback(finalValue);
        }
    }, 60);
}

// Roll button
rollButton.addEventListener("click", () => {
    rollDiceAnimation(handleDiceResult);
});

function handleDiceResult(value){
    if(value === 4){
        // Animate spike and shatter
        animateSpikeAndShatter();
        players.forEach((p, i) => {
            if(p.in) roundScores[i] = 0;
        });
        setTimeout(() => showLeaderboard("A 4 was rolled! Round ends."), 2000);
    } else {
        players.forEach((p, i) => {
            if(p.in) {
                roundScores[i] += value;
                roundTotalPoints += value;
            }
        });
        updatePlayerBoxes();
        updateRoundPointsBox();
        startAutoNextTimer();
    }
    rollButton.disabled = false;
}

// Animate spike and round box shatter
function animateSpikeAndShatter() {
    // spike rises
    spike.style.bottom = "0px";
    roundPointsBox.style.transition = "transform 0.8s ease-in";
    roundPointsBox.style.transform = "translateY(500px) rotate(30deg)";
    setTimeout(()=>{
        // shatter effect
        roundPointsBox.style.background = "red";
        roundPointsBox.style.transform = "translateY(500px) rotate(30deg) scale(0)";
    }, 800);
    setTimeout(()=>{
        spike.style.bottom = "-200px";
        roundPointsBox.style.transform = "translateY(0) scale(1)";
        roundPointsBox.style.background = "linear-gradient(45deg, #ffeb3b, #ff9800)";
        roundTotalPoints = 0;
        updateRoundPointsBox();
    }, 2000);
}

// Show leaderboard after each round
function showLeaderboard(message){
    endScreen.querySelector("h2").textContent = message;
    finalScoresDiv.innerHTML = "";
    // Sort players by total score descending
    const sortedPlayers = [...players].sort((a,b)=>b.totalScore-a.totalScore);
    sortedPlayers.forEach((p,i)=>{
        const div = document.createElement("div");
        div.textContent = `${i+1}. ${p.name}: ${p.totalScore} points`;
        div.classList.add("player-box");
        finalScoresDiv.appendChild(div);
    });
    document.getElementById("game-screen").classList.add("hidden");
    endScreen.classList.remove("hidden");

    // Auto move to next round in 5s
    autoNextTimer = setTimeout(()=>{
        endScreen.classList.add("hidden");
        nextRound();
    },5000);
}

// Auto next after roll
function startAutoNextTimer() {
    clearTimeout(autoNextTimer);
    clearInterval(countdownTimer);
    let timeLeft = 10;
    countdownDiv.textContent = `Auto-next in ${timeLeft}s`;
    countdownTimer = setInterval(()=>{
        timeLeft--;
        countdownDiv.textContent = `Auto-next in ${timeLeft}s`;
        if(timeLeft <=0){
            clearInterval(countdownTimer);
            startFinalCountdown();
        }
    }, 1000);
}

function startFinalCountdown(){
    let timeLeft = 3;
    countdownDiv.textContent = `Next round in ${timeLeft}...`;
    countdownTimer = setInterval(()=>{
        timeLeft--;
        countdownDiv.textContent = `Next round in ${timeLeft}...`;
        if(timeLeft<=0){
            clearInterval(countdownTimer);
            nextRound();
        }
    },1000);
}

// Next round button
nextButton.addEventListener("click", () => {
    clearInterval(countdownTimer);
    clearTimeout(autoNextTimer);
    countdownDiv.textContent = "";
    nextRound();
});

function nextRound(){
    players.forEach((p,i)=> p.totalScore += roundScores[i]);
    round++;
    if(round>totalRounds){
        endGame();
    } else {
        startRound();
    }
}

// End game
function endGame(){
    document.getElementById("game-screen").classList.add("hidden");
    endScreen.classList.remove("hidden");
    finalScoresDiv.innerHTML = "";
    endScreen.querySelector("h2").textContent = "Game Over!";
    // Sort players by total score descending
    const sortedPlayers = [...players].sort((a,b)=>b.totalScore-a.totalScore);
    sortedPlayers.forEach((p,i)=>{
        const div = document.createElement("div");
        div.textContent = `${i+1}. ${p.name}: ${p.totalScore} points`;
        div.classList.add("player-box");
        finalScoresDiv.appendChild(div);
    });
}

// Play again
playAgainBtn.addEventListener("click", () => {
    round = 1;
    players.forEach(p => p.totalScore = 0);
    players = [];
    endScreen.classList.add("hidden");
    setupScreen.classList.remove("hidden");
    playerListDiv.innerHTML = "";
    roundPointsBox.textContent = "Round Total: 0";
});
