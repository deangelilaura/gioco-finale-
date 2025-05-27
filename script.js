 var myGamePiece = {
            width: 50,
            height: 70,
            x: 370,
            y: 600,
            imageList: [], // Array to store loaded images
            actualFrame: 0, // Current frame to display
            image: null, // Current image
            tryX: 0,
            tryY: 0,
            contaFrame: 0,
       update: function() {
                    if (gameOver) return;

                    // Se la rana arriva in cima (puoi cambiare 10 con la soglia che preferisci)
                    if (this.y < 10) {
                        showWin();
                        return;
                    }

                    // Controlla le collisioni con tutte le auto attive
                    let collision = false;
                    for (let car of activeCars) {
                        if (this.crashWith(car)) {
                            collision = true;
                            showGameOver();
                            break;
                        }
                    }

                    this.contaFrame++;
                    if (this.contaFrame == 50) {
                        this.contaFrame = 0;
                        this.actualFrame = (this.actualFrame + 1) % this.imageList.length;
                        this.image = this.imageList[this.actualFrame];
                    }
                },
                crashWith: function(otherobj) {
                    var myleft = this.x;
                    var myright = this.x + this.width;
                    var mytop = this.y;
                    var mybottom = this.y + this.height;
                    var otherleft = otherobj.x;
                    var otherright = otherobj.x + otherobj.width;
                    var othertop = otherobj.y;
                    var otherbottom = otherobj.y + otherobj.height;

                    if ((mybottom >= othertop) &&
                        (mytop <= otherbottom) &&
                        (myright >= otherleft) &&
                        (myleft <= otherright)) {
                        return true; // Collisione
                    }

                    return false; // Nessuna collisione
                },
            loadImages: function(running) {
                for (let imgPath of running) {
                    var img = new Image();
                    img.src = imgPath;
                    this.imageList.push(img);
                }
                this.image = this.imageList[this.actualFrame];
            },
        };
        const BLOCK_SIZE = 40
        var myGameArea = {
            canvas: document.createElement("canvas"),
            context: null,
            interval: null,
            roads: [],
            backgroundImage: null,

            start: function() {
                this.canvas.width = 800;
                this.canvas.height = 675;
                this.context = this.canvas.getContext("2d");
                document.body.insertBefore(this.canvas, document.body.childNodes[0]);
                
                // Carica l'immagine di background
                this.backgroundImage = new Image();
                this.backgroundImage.src = "background.png"; // Sostituisci con il percorso della tua immagine
                
                // Definire le strade
                this.roads = [
                    { y: 100, height: 80 },
                    { y: 200, height: 80 },
                    { y: 300, height: 80 },
                    { y: 400, height: 80 },
                    { y: 500, height: 80 }
                ];
                
                this.interval = setInterval(updateGameArea, 20); // Update game every 20ms
            },

            clear: function() {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Disegna l'immagine di background se è caricata
                if (this.backgroundImage && this.backgroundImage.complete) {
                    this.context.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
                }
            },

            drawRoads: function() {
                for (let road of this.roads) {
                    this.context.fillStyle = "#444";
                    this.context.fillRect(0, road.y, this.canvas.width, road.height);
                    this.context.strokeStyle = "white";
                    this.context.setLineDash([5, 15]);
                    this.context.beginPath();
                    this.context.moveTo(0, road.y);
                    this.context.lineTo(this.canvas.width, road.y);
                    this.context.moveTo(0, road.y + road.height);
                    this.context.lineTo(this.canvas.width, road.y + road.height);
                    this.context.stroke();
                    this.context.setLineDash([]);
                }
            },

            drawGameObject: function(gameObject) {
                if (gameObject.image) {
                    this.context.drawImage(
                        gameObject.image,
                        gameObject.x,
                        gameObject.y,
                        gameObject.width,
                        gameObject.height
                    );
                } else {
                    // Fallback per oggetti senza immagine
                    this.context.fillStyle = gameObject.color || "red";
                    this.context.fillRect(gameObject.x, gameObject.y, gameObject.width, gameObject.height);
                }
            }
        };

        // Classe per le macchine
        class Car {
            constructor(config) {
                this.width = config.width || 80;
                this.height = config.height || 50;
                this.speed = config.speed || 2;
                this.direction = config.direction || 'right';
                this.y = config.y;
                this.color = config.color || 'red';
                this.image = null;
                
                // Posizione iniziale fuori dall'area di gioco
                if (this.direction === 'right') {
                    this.x = -this.width;
                } else {
                    this.x = myGameArea.canvas.width;
                }
                
                // Carica immagine se disponibile
                if (config.imageSrc) {
                    this.loadImage(config.imageSrc);
                }
            }
            
            loadImage(src) {
                this.image = new Image(this.width, this.height);
                this.image.src = src;
            }
            
            update() {
                // Movimento in base alla direzione
                if (this.direction === 'right') {
                    this.x += this.speed;
                    
                    // Reset quando esce dall'area di gioco a destra
                    if (this.x > myGameArea.canvas.width) {
                        this.x = -this.width;
                    }
                } else {
                    this.x -= this.speed;
                    
                    // Reset quando esce dall'area di gioco a sinistra
                    if (this.x < -this.width) {
                        this.x = myGameArea.canvas.width;
                    }
                }
            }
        }

        // Configurazione delle corsie di macchine
        const carLanes = [
            { y: 110, speed: 0.5, direction: 'right', color: 'red', interval: 3000, width: 80, height: 50, imageSrc: 'immagini/car7.png' },
            { y: 210, speed: 2, direction: 'left', color: 'blue', interval: 4000, width: 80, height: 50, imageSrc: 'immagini/car1.png' },
            { y: 310, speed: 1.5, direction: 'right', color: 'yellow', interval: 3500, width: 80, height: 50, imageSrc: 'immagini/car2.png' },
            { y: 410, speed: 1.0, direction: 'left', color: 'purple', interval: 2800, width: 80, height: 50, imageSrc: 'immagini/car3.png' },
            { y: 510, speed: 0.75, direction: 'right', color: 'orange', interval: 3200, width: 80, height: 50, imageSrc: 'immagini/car10.png' }
        ];
        
        // Variabili globali
        var activeCars = [];
        var running = ['spirite/Run1.png', 'spirite/Run2.png', 'spirite/Run3.png'];
        var gameOver = false;
        var carIntervals = [];

       
    function startGame() {
        gameOver = false;
        activeCars = [];
        document.getElementById('game-over').style.display = 'none';
        myGamePiece.loadImages(running);
        myGameArea.start();

        for (let interval of carIntervals) clearInterval(interval);
        carIntervals = [];

        carLanes.forEach(lane => {
            // Crea la prima macchina con posizione randomizzata
            let firstCar = new Car({
                ...lane,
                x: lane.direction === 'right'
                    ? -Math.random() * 300 // posizione random fuori dallo schermo
                    : myGameArea.canvas.width + Math.random() * 300
            });
            activeCars.push(firstCar);

            // Intervallo di generazione casuale
            const intervalId = setInterval(() => {
                // Trova tutte le macchine in questa corsia
                const carsInLane = activeCars.filter(car => car.y === lane.y);

                // Trova la macchina più vicina al punto di spawn
                let canSpawn = true;
                for (let car of carsInLane) {
                    if (lane.direction === 'right') {
                        if (car.x < 0 && Math.abs(car.x) < (car.width + 80)) {
                            canSpawn = false;
                            break;
                        }
                    } else {
                        if (car.x > myGameArea.canvas.width && (car.x - myGameArea.canvas.width) < (car.width + 80)) {
                            canSpawn = false;
                            break;
                        }
                    }
                    // Controlla anche la distanza tra le macchine già in corsia
                    for (let otherCar of carsInLane) {
                        if (car !== otherCar && Math.abs(car.x - otherCar.x) < (car.width + 80)) {
                            canSpawn = false;
                            break;
                        }
                    }
                }

                if (canSpawn && carsInLane.length < 3) {
                    // Randomizza la posizione di spawn leggermente
                    let spawnX = lane.direction === 'right'
                        ? -lane.width - Math.random() * 100
                        : myGameArea.canvas.width + Math.random() * 100;
                    activeCars.push(new Car({ ...lane, x: spawnX }));
                }

                // Limita il numero totale di macchine attive
                if (activeCars.length > 50) {
                    const indexToRemove = activeCars.findIndex(car =>
                        (car.direction === 'right' && car.x < -car.width) ||
                        (car.direction === 'left' && car.x > myGameArea.canvas.width)
                    );
                    if (indexToRemove !== -1) {
                        activeCars.splice(indexToRemove, 1);
                    } else {
                        activeCars.shift();
                    }
                }
            }, lane.interval + Math.floor(Math.random() * 1200)); // intervallo randomizzato

            carIntervals.push(intervalId);
        });
    }

        function showGameOver() {
            gameOver = true;
            document.getElementById('game-over').style.display = 'flex';
        }
        
        function respawn() {
            startGame();
            
            // Riposiziona il personaggio nella posizione iniziale
            myGamePiece.x = 370;
            myGamePiece.y = 600;
            myGamePiece.speedX = 0;
            myGamePiece.speedY = 0;
        }
        function showWin() {
            gameOver = true;
            document.getElementById('win-message').style.display = 'flex';
        }

        function restartGame() {
            document.getElementById('win-message').style.display = 'none';
            respawn();
        }

        function updateGameArea() {
            myGameArea.clear();
            
            // Disegna le strade
            myGameArea.drawRoads();
            
            // Aggiorna e disegna tutte le macchine
            for (let car of activeCars) {
                car.update();
                myGameArea.drawGameObject(car);
            }
            
            // Aggiorna e disegna il giocatore
            myGamePiece.update();
            myGameArea.drawGameObject(myGamePiece);
        }

        // Control functions
        function moveup() {
            myGamePiece.y -= BLOCK_SIZE;
            if (myGamePiece.y < 0) myGamePiece.y = 0;
        }


        function movedown() {
            myGamePiece.y += BLOCK_SIZE;
            if (myGamePiece.y + myGamePiece.height > myGameArea.canvas.height)
                myGamePiece.y = myGameArea.canvas.height - myGamePiece.height;
}

        function moveleft() {
            myGamePiece.x -= BLOCK_SIZE;
            if (myGamePiece.x < 0) myGamePiece.x = 0;
}

        function moveright() {
            myGamePiece.x += BLOCK_SIZE;
            if (myGamePiece.x + myGamePiece.width > myGameArea.canvas.width)
                myGamePiece.x = myGameArea.canvas.width - myGamePiece.width;     
}

        function clearmove() {}

// Gestione pressione tasti per movimento
document.addEventListener('keydown', function(event) {
    if (gameOver) return;
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            moveup();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movedown();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            moveleft();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            moveright();
            break;
    }
});

// Ferma il movimento quando il tasto viene rilasciato
document.addEventListener('keyup', function(event) {
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'ArrowDown':
        case 's':
        case 'S':
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'ArrowRight':
        case 'd':
        case 'D':
            clearmove();
            break;
    }
});
 
