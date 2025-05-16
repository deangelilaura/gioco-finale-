 var myGamePiece = {
            speedX: 0,
            speedY: 0,
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
                this.tryY = this.y + this.speedY;
                this.tryX = this.x + this.speedX;

                if (gameOver) return;

                // Se la rana arriva in cima (puoi cambiare 10 con la soglia che preferisci)
                if (this.tryY < 10) {
                    this.speedX = 0;
                    this.speedY = 0;
                    showWin();
                    return;
                }
            
                // Controlla le collisioni con tutte le auto attive
                let collision = false;
                for (let car of activeCars) {
                    if (this.crashWith(car)) {
                        collision = true;
                        // Ferma il movimento quando c'è una collisione
                        this.speedX = 0;
                        this.speedY = 0;
                        // Mostra schermata game over
                        showGameOver();
                        break;
                    }
                }
            
                if (!collision) {
                    // Controlla bordi canvas
                    if (this.tryX < 0) this.tryX = 0;
                    if (this.tryX + this.width > myGameArea.canvas.width)
                        this.tryX = myGameArea.canvas.width - this.width;
                    if (this.tryY < 0) this.tryY = 0;
                    if (this.tryY + this.height > myGameArea.canvas.height)
                        this.tryY = myGameArea.canvas.height - this.height;
            
                    // Solo se non c'è collisione
                    this.x = this.tryX;
                    this.y = this.tryY;
                }
            
                this.contaFrame++;
                if (this.contaFrame == 50) {
                    this.contaFrame = 0;
                    this.actualFrame = (this.actualFrame + 1) % this.imageList.length;
                    this.image = this.imageList[this.actualFrame];
                }
            },            

            loadImages: function(running) {
                for (let imgPath of running) {
                    var img = new Image();
                    img.src = imgPath;
                    this.imageList.push(img);
                }
                this.image = this.imageList[this.actualFrame];
            },
            
            crashWith: function(otherobj) {
                var myleft = this.tryX;
                var myright = this.tryX + this.width;
                var mytop = this.tryY;
                var mybottom = this.tryY + this.height;
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
            }
        };

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
            
            // Nascondi la schermata di game over se visibile
            document.getElementById('game-over').style.display = 'none';
            
            myGamePiece.loadImages(running);
            myGameArea.start();
            
            // Cancella eventuali intervalli precedenti
            for (let interval of carIntervals) {
                clearInterval(interval);
            }
            carIntervals = [];
            
            // Crea le prime macchine e imposta gli intervalli per le nuove macchine
            carLanes.forEach(lane => {
                // Crea la prima macchina
                activeCars.push(new Car(lane));
                
                // Crea nuove macchine ad intervalli
                const intervalId = setInterval(() => {
                    // Limita il numero di macchine per corsia
                    const carsInLane = activeCars.filter(car => car.y === lane.y).length;
                    
                    if (carsInLane < 3) { // Massimo 3 macchine per corsia
                        activeCars.push(new Car(lane));
                    }
                    
                    // Limita il numero totale di macchine attive
                    if (activeCars.length > 50) {
                        // Rimuovi la macchina più vecchia che non è visibile
                        const indexToRemove = activeCars.findIndex(car => 
                            (car.direction === 'right' && car.x < -car.width) || 
                            (car.direction === 'left' && car.x > myGameArea.canvas.width)
                        );
                        
                        if (indexToRemove !== -1) {
                            activeCars.splice(indexToRemove, 1);
                        } else {
                            activeCars.shift();  // Rimuovi la macchina più vecchia
                        }
                    }
                }, lane.interval);
                
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
            myGamePiece.speedY = -2;
        }

        function movedown() {
            myGamePiece.speedY = 2;
        }

        function moveleft() {
            myGamePiece.speedX = -2;
        }

        function moveright() {
            myGamePiece.speedX = 2;
        }

        function clearmove() {
            myGamePiece.speedX = 0;
            myGamePiece.speedY = 0;
        }

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
 
