document.addEventListener("DOMContentLoaded", function() {
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
        constructor(stepSize, hillAngle, canvasHeight) {
            this.steps = [];
            this.stepSize = stepSize;
            this.hillAngle = hillAngle;
            this.canvasHeight = canvasHeight;
            this.strokeWidth = 5; // Nastavení šířky okraje
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
            ctx.strokeStyle = '#f4e1d2';
            ctx.lineWidth = this.strokeWidth;
            this.steps.forEach(step => {
                ctx.beginPath();
                ctx.rect(step.x, step.y, this.stepSize, this.canvasHeight - step.y + this.stepSize);
                ctx.fill();
                ctx.stroke();
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

    class Background {
        constructor(svgElement) {
            this.svgElement = svgElement;
            this.polygons = Array.from(svgElement.querySelectorAll('polygon'));
            this.stepSpeed = 0.5;
        }

        updateBackground(isFalling) {
            const direction = isFalling ? -1 : 1;
            this.polygons.forEach(polygon => {
                let points = polygon.getAttribute('points').split(' ').map(point => {
                    let coords = point.split(',').map(Number);
                    return `${coords[0] - direction * this.stepSpeed},${coords[1]}`;
                }).join(' ');

                polygon.setAttribute('points', points);
            });

            this.checkAndAddPolygons(isFalling);
        }

        checkAndAddPolygons(isFalling) {
            if (isFalling) {
                let firstPolygon = this.polygons[0];
                let firstPoint = firstPolygon.getAttribute('points').split(' ')[0];
                let firstX = Number(firstPoint.split(',')[0]);

                if (firstX > 0) {
                    this.addPolygonAtStart();
                }
            } else {
                let lastPolygon = this.polygons[this.polygons.length - 1];
                let lastPoint = lastPolygon.getAttribute('points').split(' ')[2];
                let lastX = Number(lastPoint.split(',')[0]);

                if (lastX < window.innerWidth) {
                    this.addPolygon();
                }
            }
        }

        addPolygon() {
            let newPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            let lastPolygon = this.polygons[this.polygons.length - 1];
            let lastPoint = lastPolygon.getAttribute('points').split(' ')[2];
            let lastX = Number(lastPoint.split(',')[0]);

            let newPoints = `${lastX + 400},600 ${lastX + 700},100 ${lastX + 1000},600`;
            newPolygon.setAttribute('points', newPoints);
            newPolygon.setAttribute('fill', '#A9A9A9');
            this.svgElement.appendChild(newPolygon);
            this.polygons.push(newPolygon);
        }

        addPolygonAtStart() {
            let newPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            let firstPolygon = this.polygons[0];
            let firstPoint = firstPolygon.getAttribute('points').split(' ')[0];
            let firstX = Number(firstPoint.split(',')[0]);

            let newPoints = `${firstX - 400},600 ${firstX - 100},100 ${firstX + 200},600`;
            newPolygon.setAttribute('points', newPoints);
            newPolygon.setAttribute('fill', '#A9A9A9');
            this.svgElement.insertBefore(newPolygon, firstPolygon);
            this.polygons.unshift(newPolygon);
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
            this.steps = new Steps(this.stepSize, this.hillAngle, this.canvas.height);
            this.background = new Background(document.getElementById('background'));

            this.handleKey = this.handleKey.bind(this);
            this.animate = this.animate.bind(this);
            this.tahlefunkce = this.tahlefunkce.bind(this);
            this.start = this.start.bind(this);
            this.showStartScreen = this.showStartScreen.bind(this);
            this.showGameScreen = this.showGameScreen.bind(this);
            this.showRestartScreen = this.showRestartScreen.bind(this);
            this.hideRestartScreen = this.hideRestartScreen.bind(this);
            this.handlePopState = this.handlePopState.bind(this);

            this.scoreElement = document.getElementById('score');
            this.statusElement = document.getElementById('status');

            document.addEventListener("keydown", this.handleKey);
            window.addEventListener('popstate', this.handlePopState);

            this.initGame();
            this.updateStatus();
            window.addEventListener('online', this.updateStatus.bind(this));
            window.addEventListener('offline', this.updateStatus.bind(this));

            // Inicializace historie
            if (window.location.hash === "#game") {
                this.showGameScreen();
            } else {
                this.showStartScreen();
            }
        }

        updateStatus() {
            this.statusElement.textContent = navigator.onLine ? "Status: Online" : "Status: Offline";
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
                if (document.getElementById('restart-screen').style.display === 'block') {
                    this.hideRestartScreen();
                    this.start();
                } else {
                    this.start();
                }
                history.pushState({ screen: "game" }, "Game", "#game");
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
            this.background.updateBackground(this.isFalling); // Aktualizace pozadí
            if (this.isFalling) {
                this.character.draw(this.ctx);
                this.animationId = requestAnimationFrame(this.tahlefunkce);
            } else if (!this.gameRunning) {
                this.showRestartScreen(); // Zobrazení restartovací obrazovky po pádu
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
            this.showGameScreen();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.steps = new Steps(this.stepSize, this.hillAngle, this.canvas.height);  // Reset steps
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
                    this.showRestartScreen(); // Zobrazení restartovací obrazovky po pádu
                }
            }
        }

        showStartScreen() {
            const startScreen = document.getElementById('start-screen');
            startScreen.classList.add('show');
            startScreen.classList.remove('hide');
            startScreen.style.display = 'block';
            document.getElementById('restart-screen').style.display = 'none';
            document.getElementById('canvas').style.display = 'none';
        }

        showGameScreen() {
            const startScreen = document.getElementById('start-screen');
            startScreen.classList.add('hide');
            startScreen.classList.remove('show');
            setTimeout(() => {
                startScreen.style.display = 'none';
                document.getElementById('restart-screen').style.display = 'none';
                document.getElementById('canvas').style.display = 'block';
                const audio = document.getElementById("audio");
                const previousMuted = localStorage.getItem("muted");
                if (previousMuted !== null) {
                    audio.muted = JSON.parse(previousMuted);
                }
                audio.play();
            }, 500); // Match the duration of the CSS transition
        }

        showRestartScreen() {
            const restartScreen = document.getElementById('restart-screen');
            restartScreen.classList.add('show');
            restartScreen.classList.remove('hide');
            restartScreen.style.display = 'block';
        }

        hideRestartScreen() {
            const restartScreen = document.getElementById('restart-screen');
            restartScreen.classList.add('hide');
            restartScreen.classList.remove('show');
            setTimeout(() => {
                restartScreen.style.display = 'none';
            }, 500); // Match the duration of the CSS transition
        }

        handlePopState(event) {
            if (event.state && event.state.screen === "game") {
                this.showGameScreen();
            } else {
                this.showStartScreen();
            }
        }
    }

    // Inicializace hry
    const game = new Game();

    // Registrace Service Workeru
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }

    // Funkce pro aktualizaci stavu připojení
    function updateOnlineStatus() {
        const status = navigator.onLine ? "Online" : "Offline";
        console.log(`Status: ${status}`);
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = `Status: ${status}`;
        }
    }

    // Posluchače událostí pro změnu stavu připojení
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    updateOnlineStatus();
});
