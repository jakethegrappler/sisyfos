document.addEventListener("DOMContentLoaded", function() {
    // Třída pro postavu
    class Character {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.sprite = new Image(); // Obrázek postavy
        }

        // Nastavení obrázku pro postavu
        setImage(imagePath) {
            this.sprite.src = imagePath;
        }

        // Vykreslení postavy na canvas
        draw(ctx) {
            const yOffset = 17; // Posun na ose y pro lepší zarovnání
            ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2 + yOffset, this.width, this.height);
        }
    }

    // Třída pro schody
    class Steps {
        constructor(stepSize, hillAngle, canvasHeight) {
            this.steps = []; // Pole schodů
            this.stepSize = stepSize; // Velikost jednoho schodu
            this.hillAngle = hillAngle; // Úhel kopce
            this.canvasHeight = canvasHeight; // Výška canvasu
            this.strokeWidth = 5; // Nastavení šířky okraje schodů
        }

        // Inicializace schodů
        initSteps(characterY, characterHeight, canvasWidth) {
            let startX = -this.stepSize;
            let startY = characterY + characterHeight / 2;
            while (startX < canvasWidth - this.stepSize) {
                this.steps.push({ x: startX, y: startY });
                startX += this.stepSize;
                startY -= startX > canvasWidth / 2 ? this.stepSize * Math.tan(this.hillAngle) : 0;
            }
        }

        // Vykreslení schodů
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

        // Aktualizace pozice schodů
        updateSteps(isFalling, stepSpeed, hillAngle) {
            this.steps.forEach(step => {
                if (isFalling) {
                    // Posun schodů směrem dolů při pádu
                    step.x += stepSpeed * Math.cos(hillAngle);
                    step.y -= stepSpeed * Math.sin(hillAngle);
                } else {
                    // Posun schodů směrem nahoru při tlačení balvanu
                    step.x -= stepSpeed * Math.cos(hillAngle);
                    step.y += stepSpeed * Math.sin(hillAngle);
                }
            });
        }

        // Přidání nového schodu na konec
        addStep(canvasWidth) {
            let lastStep = this.steps[this.steps.length - 1];
            let startX = lastStep.x + this.stepSize;
            let startY = lastStep.y - this.stepSize * Math.tan(this.hillAngle);
            if (startX < canvasWidth - this.stepSize) {
                this.steps.push({ x: startX, y: startY });
            }
        }

        // Kontrola, zda je první schod stále viditelný
        checkFirstStep(canvasWidth, canvasHeight) {
            let firstStep = this.steps[0];
            return firstStep.x >= 0 && firstStep.x <= canvasWidth && firstStep.y >= 0 && firstStep.y <= canvasHeight;
        }
    }

    // Třída pro pozadí
    class Background {
        constructor(svgElement) {
            this.svgElement = svgElement;
            this.polygons = Array.from(svgElement.querySelectorAll('polygon'));
            this.stepSpeed = 0.5; // Rychlost posunu pozadí
        }

        // Aktualizace pozadí
        updateBackground(isFalling) {
            const direction = isFalling ? -1 : 1; // Směr pohybu pozadí
            this.polygons.forEach(polygon => {
                let points = polygon.getAttribute('points').split(' ').map(point => {
                    let coords = point.split(',').map(Number);
                    return `${coords[0] - direction * this.stepSpeed},${coords[1]}`;
                }).join(' ');

                polygon.setAttribute('points', points);
            });

            this.checkAndAddPolygons(isFalling);
        }

        // Kontrola a přidání nových polygonů pro pozadí
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

        // Přidání nového polygonu na konec
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

        // Přidání nového polygonu na začátek
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

    // Hlavní třída hry
    class Game {
        constructor() {
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            this.hillAngle = 22 * Math.PI / 180; // Úhel kopce
            this.stepSize = 13; // Velikost schodů
            this.stepSpeed = 0.5; // Rychlost pohybu schodů
            this.isFalling = false; // Stav, zda postava padá
            this.animationId = null; // ID animace
            this.gameRunning = false; // Stav, zda hra běží
            this.timer = null; // Timer pro animaci
            this.score = 0; // Skóre hry
            this.highscore = 0;

            // Inicializace postavy, schodů a pozadí
            this.character = new Character(this.canvas.width / 2, this.canvas.height / 2 - this.stepSize, 100, 100);
            this.steps = new Steps(this.stepSize, this.hillAngle, this.canvas.height);
            this.background = new Background(document.getElementById('background'));

            // Bindování metod pro použití v event listech
            this.handleKey = this.handleKey.bind(this);
            this.animate = this.animate.bind(this);
            this.tahlefunkce = this.tahlefunkce.bind(this);
            this.start = this.start.bind(this);
            this.showStartScreen = this.showStartScreen.bind(this);
            this.showGameScreen = this.showGameScreen.bind(this);
            this.showRestartScreen = this.showRestartScreen.bind(this);
            this.hideRestartScreen = this.hideRestartScreen.bind(this);
            this.handlePopState = this.handlePopState.bind(this);

            // Elementy pro zobrazení skóre a statusu
            this.scoreElement = document.getElementById('score');
            this.highscoreElement = document.getElementById('high-score');
            this.statusElement = document.getElementById('status');


            // Registrace event listenerů
            document.addEventListener("keydown", this.handleKey);
            window.addEventListener('popstate', this.handlePopState);

            // Inicializace hry
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

        // Aktualizace statusu připojení
        updateStatus() {
            this.statusElement.textContent = navigator.onLine ? "Status: Online" : "Status: Offline";
        }

        // Inicializace hry
        initGame() {
            this.steps.initSteps(this.character.y, this.character.height, this.canvas.width);
            this.steps.drawSteps(this.ctx);
            this.updateSteps();
            this.walkAnimation();
            this.updateScore();

        }

        // Aktualizace skóre
        updateScore() {
            this.scoreElement.textContent = `Score: ${this.score}`;
        }

        updateHighScore() {
            this.highscoreElement.textContent = `HighScore: ${this.highscore}`;
            localStorage.setItem("highScore", JSON.stringify(this.highscore));
        }

        // Zpracování stisknutí klávesy
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
                }, 222);  //Casovani maximalniho intervalu mezi stisknutim mezerniku (obtiznost)
            } else if (key === 'm') {
                const audio = document.getElementById("audio");
                audio.muted = !audio.muted;
                localStorage.setItem("muted", JSON.stringify(audio.muted));
            }
        }

        // Hlavní funkce animace
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
                if (this.score > this.highscore){
                    this.highscore = this.score
                    this.updateHighScore();
                }
            }
        }

        // Animace chůze
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

        // Funkce pro spuštění animace
        animate() {
            if (this.gameRunning) {
                for (let i = 0; i < this.stepSize; i++) {
                    this.animationId = requestAnimationFrame(this.tahlefunkce);
                }
            }
        }

        // Spuštění hry
        start() {
            this.showGameScreen();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.steps = new Steps(this.stepSize, this.hillAngle, this.canvas.height);  // Reset schodu
            this.steps.initSteps(this.character.y, this.character.height, this.canvas.width);
            this.isFalling = false;
            this.score = 0;  // Reset skore kdyz zacne nova hra
            this.updateScore();
            this.steps.drawSteps(this.ctx);
            this.walkAnimation();
            this.gameRunning = true;
        }

        // Aktualizace schodů
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

        // Zobrazení úvodní obrazovky
        showStartScreen() {
            const startScreen = document.getElementById('start-screen');
            startScreen.classList.add('show');
            startScreen.classList.remove('hide');
            startScreen.style.display = 'block';
            document.getElementById('restart-screen').style.display = 'none';
            document.getElementById('canvas').style.display = 'none';
        }

        // Zobrazení herní obrazovky
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

        // Zobrazení restartovací obrazovky
        showRestartScreen() {
            const restartScreen = document.getElementById('restart-screen');
            restartScreen.classList.add('show');
            restartScreen.classList.remove('hide');
            restartScreen.style.display = 'block';
        }

        // Skrytí restartovací obrazovky
        hideRestartScreen() {
            const restartScreen = document.getElementById('restart-screen');
            restartScreen.classList.add('hide');
            restartScreen.classList.remove('show');
            setTimeout(() => {
                restartScreen.style.display = 'none';
            }, 500); // Match the duration of the CSS transition
        }

        // Zpracování událostí popstate pro historii prohlížeče
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
