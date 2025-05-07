function startGame() {
    myGamePiece.loadImages(running);
    car1Object.loadImages();
    car2Object.loadImages();
    car7Object.loadImages();
    myGameArea.start();
}

var myGamePiece = {
    speedX: 0,
    speedY: 0,
    width: 70,
    height: 70,
    x: 370,
    y: 320,
    imageList: [], // Array to store loaded images
    actualFrame: 0, // Current frame to display
    image: null, // Current image
    tryX: 0,
    tryY: 0,

    update: function() {
        this.tryY = this.y + this.speedY;
        this.tryX = this.x + this.speedX;
    
        const collidesWithCar7 = this.crashWith(car7Object);
        const collidesWithCar1 = this.crashWith(car1Object);
        const collideWithCar2 = this.crashWith(car2Object);
    
        if (!collidesWithCar7 && !collidesWithCar1) {
            // Controlla bordi canvas
            if (this.tryX < 0) this.tryX = 0;
            if (this.tryX + this.width > myGameArea.canvas.width)
                this.tryX = myGameArea.canvas.width - this.width;
            if (this.tryY < 0) this.tryY = 0;
            if (this.tryY + this.height > myGameArea.canvas.height)
                this.tryY = myGameArea.canvas.height - this.height;
    
            // Solo se non c'è collisione con entrambi
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

    start: function() {
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 1); // Update game every 20ms
    },

    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    drawGameObject: function (gameObject) {
        this.context.drawImage(
            gameObject.image,
            gameObject.x,
            gameObject.y,
            gameObject.width,
            gameObject.height
        );
    }
};
var car7Object = {
    width: 80,
    height: 50,
    x: 100,
    y: 270 - 41,
    image : null,
    loadImages: function() {
        
      this.image = new Image(this.width, this.height);
      this.image.src = "/immagini/car7.png";
    }
  };

var car2Object = {
    width: 80,
    height: 50,
    x: 300,
    y: 270 - 66,
    image: null,
    loadImages: function() {

        this.image = new Image(this.width, this.height);
        this.image.src = "/immagini/car2.png";
    }
};

var car1Object = {
    width: 80,
    height: 50,
    x: 200,
    y: 270 - 94,
  
    loadImages: function() {
      this.image = new Image(this.width, this.height);
      this.image.src = "/immagini/car1.png";
    }
  };
var running = ['spirite/Run1.png', 'spirite/Run2.png', 'spirite/Run3.png']; // Example paths for images

function updateGameArea() {
    myGameArea.clear();
    myGamePiece.update();
    myGameArea.drawGameObject(myGamePiece);
    myGameArea.drawGameObject(car7Object);
    myGameArea.drawGameObject(car1Object);
    myGameArea.drawGameObject(car2Object);
}

// Control functions
function moveup() {
    myGamePiece.speedY -= 0.4; 
}

function movedown() {
    myGamePiece.speedY += 0.4; 
}

function moveleft() {
    myGamePiece.speedX -= 0.4; 
}

function moveright() {
    myGamePiece.speedX += 0.4; 
}

function clearmove() {
    myGamePiece.speedX = 0; 
    myGamePiece.speedY = 0; 
}