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
            vx:(Math.random()-0.5)*6,
            vy:(Math.random()-0.5)*6,
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
        if(p.gravity) p.vy += 0.3;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
        if(p.life <= 0) particles.splice(i,1);
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Floating background particles
function spawnBackgroundParticles(){
    for(let i=0;i<50;i++){
        spawnParticles(Math.random()*canvas.width, Math.random()*canvas.height, 'rgba(255,255,255,0.5)',1,2,false);
    }
}
spawnBackgroundParticles();

// START GAME BUTTON
startButton.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    setupScreen.classList.remove("hidden");
});

// ADD PLAYER
addPlayerBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if(name !== ""){
        players.push({name:name,totalScore:0,in:true});
        updatePlayerList();
        playerNameInput.value = "";
    }
});

function updatePlayerList(){
    playerListDiv.innerHTML = "";
    players.forEach(p=>{
        const div = document.createElement("div");
        div.textContent = p.name;
        div.classList.add("player-box","in");
        playerListDiv.appendChild(div);
    });
}

// START GAME
startGameBtn.addEventListener("click", () => {
    totalRounds = parseInt(roundsSelect.value);
    setupScreen.classList.add("hidden");
    round=1;
    startRound();
});

// START ROUND
function startRound(){
    roundScores = players.map(()=>0);
    roundTotalPoints=0;
    players.forEach(p=>p.in=true);
    roundNumberSpan.textContent=round;
    document.getElementById("game-screen").classList.remove("hidden");
    endScreen.classList.add("hidden");
    updatePlayerBoxes();
    updateRoundPointsBox();
    countdownDiv.textContent="";
}

// UPDATE PLAYER BOXES
function updatePlayerBoxes(){
    playersContainer.innerHTML="";
    players.forEach((p)=>{
        const div=document.createElement("div");
        div.textContent=p.name + " (" + (p.in?"IN":"OUT") + ")";
        div.classList.add("player-box",p.in?"in":"out");
        div.addEventListener("click",()=>{
            p.in=!p.in;
            updatePlayerBoxes();
            if(p.in) spawnParticles(div.offsetLeft+div.offsetWidth/2,div.offsetTop+div.offsetHeight/2,'#00ff00',10,5);
            else spawnParticles(div.offsetLeft+div.offsetWidth/2,div.offsetTop+div.offsetHeight/2,'#ff0000',20,5,true);
        });
        playersContainer.appendChild(div);
    });
}

// UPDATE ROUND TOTAL BOX
function updateRoundPointsBox(){
    roundPointsBox.textContent="Round Total: "+roundTotalPoints;
}

// DICE ROLL ANIMATION
function rollDiceAnimation(callback){
    const finalValue = Math.floor(Math.random()*6)+1;
    let rolls = 25;
    let count=0;
    diceDiv.style.fontSize="250px";
    rollButton.disabled=true;
    const rollInterval = setInterval(()=>{
        const randFace=Math.floor(Math.random()*6)+1;
        diceDiv.textContent=diceFaces[randFace-1];
        count++;
        if(count>=rolls){
            clearInterval(rollInterval);
            diceDiv.textContent=diceFaces[finalValue-1];
            spawnParticles(diceDiv.offsetLeft+diceDiv.offsetWidth/2,diceDiv.offsetTop+diceDiv.offsetHeight/2,'#ffeb3b',30,8);
            callback(finalValue);
        }
    },60);
}

rollButton.addEventListener("click",()=>rollDiceAnimation(handleDiceResult));

// HANDLE DICE RESULT
function handleDiceResult(value){
    if(value===4){
        animateSpikeAndShatter();
        players.forEach((p,i)=>{
            if(p.in) roundScores[i]=0;
        });
        setTimeout(()=>showLeaderboard("A 4 was rolled! Round ends."),2000);
    } else {
        players.forEach((p,i)=>{
            if(p.in){
                roundScores[i]+=value;
                roundTotalPoints+=value;
                spawnParticles(playersContainer.children[i].offsetLeft+playersContainer.children[i].offsetWidth/2,
                    playersContainer.children[i].offsetTop,'#ffd700',15,6,true);
            }
        });
        updatePlayerBoxes();
        updateRoundPointsBox();
        startAutoNextTimer();
    }
    rollButton.disabled=false;
}

// SPIKE + SHATTER ANIMATION
function animateSpikeAndShatter(){
    spike.style.bottom="0px";
    roundPointsBox.style.transition="transform 0.8s ease-in";
    roundPointsBox.style.transform="translateY(500px) rotate(30deg)";
    spawnParticles(roundPointsBox.offsetLeft+roundPointsBox.offsetWidth/2,
        roundPointsBox.offsetTop+roundPointsBox.offsetHeight/2,'#ff0000',50,8,true);
    setTimeout(()=>{
        roundPointsBox.style.background="red";
        roundPointsBox.style.transform="translateY(500px) rotate(30deg) scale(0)";
    },800);
    setTimeout(()=>{
        spike.style.bottom="-200px";
        roundPointsBox.style.transform="translateY(0) scale(1)";
        roundPointsBox.style.background="linear-gradient(45deg,#ffeb3b,#ff9800)";
        roundTotalPoints=0;
        updateRoundPointsBox();
    },2000);
}

// LEADERBOARD DISPLAY
function showLeaderboard(message){
    endScreen.querySelector("h2").textContent=message;
    finalScoresDiv.innerHTML="";
    const sortedPlayers=[...players].sort((a,b)=>b.totalScore-a.totalScore);
    sortedPlayers.forEach((p,i)=>{
        const div=document.createElement("div");
        div.textContent=`${i+1}. ${p.name}: ${p.totalScore} points`;
        div.classList.add("player-box");
        finalScoresDiv.appendChild(div);
        if(i<3) spawnParticles(div.offsetLeft+div.offsetWidth/2,div.offsetTop+div.offsetHeight/2,i===0?'#ffd700':i===1?'#c0c0c0':'#cd7f32',20,6);
    });
    document.getElementById("game-screen").classList.add("hidden");
    endScreen.classList.remove("hidden");
    autoNextTimer=setTimeout(()=>{
        endScreen.classList.add("hidden");
        nextRound();
    },5000);
}

// AUTO NEXT ROUND TIMERS
function startAutoNextTimer(){
    clearTimeout(autoNextTimer);
    clearInterval(countdownTimer);
    let timeLeft=10;
    countdownDiv.textContent=`Auto-next in ${timeLeft}s`;
    countdownTimer=setInterval(()=>{
        timeLeft--;
        countdownDiv.textContent=`Auto-next in ${timeLeft}s`;
        if(timeLeft<=0){
            clearInterval(countdownTimer);
            startFinalCountdown();
        }
    },1000);
}

function startFinalCountdown(){
    let timeLeft=3;
    countdownDiv.textContent=`Next round in ${timeLeft}...`;
    countdownTimer=setInterval(()=>{
        timeLeft--;
        countdownDiv.textContent=`Next round in ${timeLeft}...`;
        if(timeLeft<=0){
            clearInterval(countdownTimer);
            nextRound();
        }
    },1000);
}

// NEXT ROUND BUTTON
nextButton.addEventListener("click",()=>{
    clearInterval(countdownTimer);
    clearTimeout(autoNextTimer);
    countdownDiv.textContent="";
    nextRound();
});

// NEXT ROUND LOGIC
function nextRound(){
    players.forEach((p,i)=>p.totalScore+=roundScores[i]);
    round++;
    if(round>totalRounds){
        endGame();
    } else {
        startRound();
    }
}

// END GAME
function endGame(){
    document.getElementById("game-screen").classList.add("hidden");
    endScreen.classList.remove("hidden");
    finalScoresDiv.innerHTML="";
    endScreen.querySelector("h2").textContent="Game Over!";
    const sortedPlayers=[...players].sort((a,b)=>b.totalScore-a.totalScore);
    sortedPlayers.forEach((p,i)=>{
        const div=document.createElement("div");
        div.textContent=`${i+1}. ${p.name}: ${p.totalScore} points`;
        div.classList.add("player-box");
        finalScoresDiv.appendChild(div);
        spawnParticles(div.offsetLeft+div.offsetWidth/2,div.offsetTop+div.offsetHeight/2,i===0?'#ffd700':i===1?'#c0c0c0':'#cd7f32',30,8);
    });
}

// PLAY AGAIN BUTTON
playAgainBtn.addEventListener("click",()=>{
    round=1;
    players.forEach(p=>p.totalScore=0);
    players=[];
    endScreen.classList.add("hidden");
    setupScreen.classList.remove("hidden");
    playerListDiv.innerHTML="";
    roundPointsBox.textContent="Round Total: 0";
});

// BUTTON CLICK GLOW EFFECT
document.querySelectorAll("button").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
        const rect=btn.getBoundingClientRect();
        spawnParticles(rect.left+rect.width/2,rect.top+rect.height/2,'#ff69b4',20,4,true);
    });
});


