class Character {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sprite = new Image();
    }

    setImage(imagePath) {
        this.sprite.src = imagePath;
    }

    draw(ctx) {
        const yOffset = 17; // Posun na ose y pro lepší zarovnání
        ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2 + yOffset, this.width, this.height);
    }
}

class Steps {
    constructor(stepSize, hillAngle) {
        this.steps = [];
        this.stepSize = stepSize;
        this.hillAngle = hillAngle;
    }

    initSteps(characterY, characterHeight, canvasWidth) {
        let startX = -this.stepSize;
        let startY = characterY + characterHeight / 2;
        while (startX < canvasWidth - this.stepSize) {
            this.steps.push({ x: startX, y: startY });
            startX += this.stepSize;
            startY -= startX > canvasWidth / 2 ? this.stepSize * Math.tan(this.hillAngle) : 0;
        }
    }

    drawSteps(ctx) {
        ctx.fillStyle = '#f4e1d2';
        this.steps.forEach(step => {
            ctx.fillRect(step.x, step.y, this.stepSize, this.stepSize);
        });
    }

    updateSteps(isFalling, stepSpeed, hillAngle) {
        this.steps.forEach(step => {
            if (isFalling) {
                step.x += stepSpeed * Math.cos(hillAngle);
                step.y -= stepSpeed * Math.sin(hillAngle);
            } else {
                step.x -= stepSpeed * Math.cos(hillAngle);
                step.y += stepSpeed * Math.sin(hillAngle);
            }
        });
    }

    addStep(canvasWidth) {
        let lastStep = this.steps[this.steps.length - 1];
        let startX = lastStep.x + this.stepSize;
        let startY = lastStep.y - this.stepSize * Math.tan(this.hillAngle);
        if (startX < canvasWidth - this.stepSize) {
            this.steps.push({ x: startX, y: startY });
        }
    }

    checkFirstStep(canvasWidth, canvasHeight) {
        let firstStep = this.steps[0];
        return firstStep.x >= 0 && firstStep.x <= canvasWidth && firstStep.y >= 0 && firstStep.y <= canvasHeight;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.hillAngle = 22 * Math.PI / 180;
        this.stepSize = 13;
        this.stepSpeed = 0.5;
        this.isFalling = false;
        this.animationId = null;
        this.gameRunning = false;
        this.timer = null;
        this.score = 0;

        this.character = new Character(this.canvas.width / 2, this.canvas.height / 2 - this.stepSize, 100, 100);
        this.steps = new Steps(this.stepSize, this.hillAngle);

        this.handleKey = this.handleKey.bind(this);
        this.animate = this.animate.bind(this);
        this.tahlefunkce = this.tahlefunkce.bind(this);
        this.start = this.start.bind(this);

        this.scoreElement = document.getElementById('score');

        document.addEventListener("keydown", this.handleKey);

        this.initGame();
    }

    initGame() {
        this.steps.initSteps(this.character.y, this.character.height, this.canvas.width);
        this.steps.drawSteps(this.ctx);
        this.updateSteps();
        this.walkAnimation();
        this.updateScore();
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    handleKey(event) {
        const key = event.key;
        if (key === 'Enter') {
            document.querySelector(".start-screen").style.display = 'none';
            const audio = document.getElementById("audio");
            const previousMuted = localStorage.getItem("muted");
            if (previousMuted !== null) {
                audio.muted = JSON.parse(previousMuted);
            }
            audio.play();
            this.start();
        } else if (key === ' ' && !this.isFalling) {
            this.score++;
            this.updateScore();
            clearTimeout(this.timer);
            this.animate();
            this.timer = setTimeout(() => {
                this.isFalling = true;
                this.animate();
            }, 250);
        } else if (key === 'm') {
            const audio = document.getElementById("audio");
            audio.muted = !audio.muted;
            localStorage.setItem("muted", JSON.stringify(audio.muted));
        }
    }

    tahlefunkce() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.steps.addStep(this.canvas.width);
        this.updateSteps();
        this.steps.drawSteps(this.ctx);
        this.walkAnimation();
        if (this.isFalling) {
            this.character.draw(this.ctx);
            this.animationId = requestAnimationFrame(this.tahlefunkce);
        }
    }

    walkAnimation() {
        if (!this.isFalling) {
            if (this.score % 2 === 0) {
                this.character.setImage('./images/walk_256-1.png');
            } else {
                this.character.setImage('./images/walk_256-2.png');
            }
        } else {
            this.character.setImage("./images/sis-fall-256.png");
        }
        this.character.draw(this.ctx);
    }

    animate() {
        if (this.gameRunning) {
            for (let i = 0; i < this.stepSize; i++) {
                this.animationId = requestAnimationFrame(this.tahlefunkce);
            }
        }
    }

    start() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.steps = new Steps(this.stepSize, this.hillAngle);  // Reset steps
        this.steps.initSteps(this.character.y, this.character.height, this.canvas.width);
        this.isFalling = false;
        this.score = 0;  // Reset score when game starts
        this.updateScore();
        this.steps.drawSteps(this.ctx);
        this.walkAnimation();
        this.gameRunning = true;
    }

    updateSteps() {
        this.steps.updateSteps(this.isFalling, this.stepSpeed, this.hillAngle);
        if (this.steps.checkFirstStep(this.canvas.width, this.canvas.height)) {
            this.isFalling = false;
            if (this.gameRunning) {
                this.gameRunning = false;
            }
        }
    }
}

// Inicializace hry
const game = new Game();
