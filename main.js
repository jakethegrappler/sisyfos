const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const hillAngle = 22 * Math.PI / 180; // Sklon 22 stupňů převedený na radiány
const stepSize = 30; // Velikost jednoho schodu (čtverec)
const stepSpeed = 0.5; // Rychlost pohybu schodů
let isFalling = false; // Proměnná pro určení, zda schody padají
let animationId; // ID pro animaci
let gameRunning = false;
let timer;
let score = 0;

// Hlavní postavička
const character = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 70,
    height: 70,
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
};

// Inicializace a vykreslení schodů
let steps = []; // Schody jsou uloženy jako pole segmentů

function initSteps() {
    let startX = -stepSize;
    let startY = character.y + character.height / 2;
    while (startX < canvas.width + stepSize) {
        steps.push({x: startX, y: startY});
        startX += stepSize;
        startY -= startX > canvas.width / 2 ? stepSize * Math.tan(hillAngle) : 0;
    }
}

function drawSteps() {
    ctx.fillStyle = 'green';

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
            gameRunning = false
        }
        // cancelAnimationFrame(animationId); // Zastavení animace
    }
}
function addStep(){
    let lastStep = steps[steps.length-1];
    let startX = lastStep.x + stepSize
    let startY = lastStep.y - stepSize * Math.tan(hillAngle);

    steps.push({x: startX, y: startY});

}

function handleKey(event){
    console.log(event.key)
    const key = event.key;
    if (key === 'Enter'){
        start()
    }
    else if (key === ' ' && !isFalling){
        score++;
        clearTimeout(timer);
        animate();
        timer = setTimeout(function(){
            console.log(score)
            score = 0
            isFalling = true
            animate();
        }, 180);

    }
}

function tahlefunkce(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    addStep();
    updateSteps();
    drawSteps();
    character.draw();
    if(isFalling){
        animationId = requestAnimationFrame(tahlefunkce);
    }

}
function animate() {
    if (gameRunning) {

        for (var i = 0; i < stepSize; i++) {
            animationId = requestAnimationFrame(tahlefunkce);
         }
    }
}
function start(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSteps();
    isFalling = false;
    character.draw();
    gameRunning = true;

}



initSteps();
drawSteps();
updateSteps();
character.draw();
document.addEventListener("keydown", (event) =>{
    handleKey(event)
})


