const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const hillAngle = 22 * Math.PI / 180; // Sklon 22 stupňů převedený na radiány
const stepSize = 13; // Velikost jednoho schodu (čtverec)
const stepSpeed = 0.5; // Rychlost pohybu schodů
let isFalling = false; // Proměnná pro určení, zda schody padají111
let animationId; // ID pro animaci
let gameRunning = false;
let timer;
let score = 0;


// Hlavní postavička
const character = {
    x: canvas.width / 2,
    y: canvas.height / 2 - stepSize,
    width: 100,
    height: 100,
    sprite : new Image(),
    setImage(imagePath){
        this.sprite.src = imagePath;
    },
    draw() {
        const yOffset = 17; // Posun na ose y pro lepší zarovnání
        ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2 + yOffset, this.width, this.height);
    },


};

// Inicializace a vykreslení schodů
let steps = []; // Schody jsou uloženy jako pole segmentů

function initSteps() {
    let startX = -stepSize;
    let startY = character.y + character.height / 2;
    while (startX < canvas.width - stepSize) {
        steps.push({x: startX, y: startY});
        startX += stepSize;
        startY -= startX > canvas.width / 2 ? stepSize * Math.tan(hillAngle) : 0;
    }
}

function drawSteps() {
    ctx.fillStyle = '#f4e1d2';

    steps.forEach(step => {
        ctx.fillRect(step.x, step.y, stepSize, stepSize);
    });
}

function updateSteps() {

    // Aktualizace pozice schodů
    steps.forEach(step => {
        if (isFalling) {
            step.x += stepSpeed * Math.cos(hillAngle);
            step.y -= stepSpeed * Math.sin(hillAngle);
        } else {
            step.x -= stepSpeed * Math.cos(hillAngle);
            step.y += stepSpeed * Math.sin(hillAngle);

        }
    });

    // Kontrola prvního schodu
    let firstStep = steps[0];
    if (firstStep.x >= 0 && firstStep.x <= canvas.width && firstStep.y >= 0 && firstStep.y <= canvas.height) {
        isFalling = false; // Nastavení isFalling na false
        if (gameRunning) {
            gameRunning = false;
        }
        // cancelAnimationFrame(animationId); // Zastavení animace
    }
}

function addStep() {
    let lastStep = steps[steps.length - 1];
    let startX = lastStep.x + stepSize;
    let startY = lastStep.y - stepSize * Math.tan(hillAngle);
    steps.push({x: startX, y: startY});
}

function handleKey(event) {
    console.log(event.key);
    const key = event.key;
    if (key === 'Enter') {
        document.querySelector(".start-screen").style.display = 'none';
        start();
    } else if (key === ' ' && !isFalling) {
        score++;
        clearTimeout(timer);
        animate();
        timer = setTimeout(function () {
            console.log(score);
            score = 0;
            isFalling = true;
            animate();
        }, 250);
    }
}

function tahlefunkce() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    addStep();
    updateSteps();
    drawSteps();
    walkAnimation();
    if (isFalling) {
        character.draw();
        animationId = requestAnimationFrame(tahlefunkce);
    }
}

function walkAnimation() {
    if (!isFalling) {
        if (score % 2 === 0) {
            character.setImage('./images/walk_256-1.png');
        } else {
            character.setImage('./images/walk_256-2.png');
        }
    } else {
        character.setImage("./images/sis-fall-256.png");
    }
    character.draw();
}

function animate() {
    if (gameRunning) {
        for (let i = 0; i < stepSize; i++) {
            animationId = requestAnimationFrame(tahlefunkce);
        }
    }
}

function start() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSteps();
    isFalling = false;
    walkAnimation();
    gameRunning = true;
}

initSteps();
drawSteps();
updateSteps();
walkAnimation();
document.addEventListener("keydown", (event) => {
    handleKey(event);
});
