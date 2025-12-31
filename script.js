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

// Particle canvas
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
let players = [];
let round = 1;
let totalRounds = 3;
let roundScores = [];
let roundTotalPoints = 0;
let diceRoll = 0;
let countdownTimer;
let autoNextTimer;
const diceFaces = ["⚀","⚁","⚂","⚃","⚄","⚅"];
let particles = [];

// Utility: spawn particles
function spawnParticles(x,y,color,count=30,size=5,gravity=false){
    for(let i=0;i<count;i++){
        particles.push({
            x:x,
            y:y,
            vx:(Math.random()-0.5)*5,
            vy:(Math.random()-0.5)*5,
            life:Math.random()*60+30,
            color:color,
            size:size,
            gravity:gravity
        });
    }
}

// Particle loop
function animateParticles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=particles.length-1;i>=0;i--){
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if(p.gravity) p.vy+=0.3;
        p.life--;
        ctx.fillStyle=p.color;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
        if(p.life<=0) particles.splice(i,1);
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Rest of the game code (player management, dice animation, spike/shatter, leaderboard, round logic)
// ... (Due to space, I can continue this full script in the next message with all particle triggers)

