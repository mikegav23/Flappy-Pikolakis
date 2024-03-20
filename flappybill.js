

const highscoreKey = 'flappyDiggshighscore';

// Read highscore from local storage
function readHighscore() {
    const storedHighscore = localStorage.getItem(highscoreKey);
    return storedHighscore ? JSON.parse(storedHighscore) : { highscore: 0, playerName: '' };
}

// Write highscore to local storage
function writeHighscore(newHighscore, playerName) {
    const data = JSON.stringify({ highscore: newHighscore, playerName });
    localStorage.setItem(highscoreKey, data);
}

// board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// diggs
let diggsWidth = 20.9*2; // width/height
let diggsHeight = 28*2;
let diggsX = boardWidth/8;
let diggsY = boardHeight/2;
let diggsImg;

let diggs = {
    x : diggsX,
    y : diggsY,
    width : diggsWidth,
    height : diggsHeight
}

// pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -2; // pipes moving left speed
let velocityY = 0; // bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // used for drawing on the board

    // draw flappy diggs green container
    //context.fillStyle = "green";
    //context.fillRect(diggs.x, diggs.y, diggs.width, diggs.height);

    // load image
    diggsImg = new Image();
    diggsImg.src = "./pikolakis.png"
    diggsImg.onload = function() {
        context.drawImage(diggsImg, diggs.x, diggs.y, diggs.width, diggs.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // every 1.5 secs
    document.addEventListener("keydown", moveDiggs);
    document.addEventListener("click", moveDiggs);
}

function update() {
    requestAnimationFrame(update);
    if(gameOver) {return;}
    context.clearRect(0, 0, board.width, board.height);

    // diggs
    velocityY += gravity;
    //diggs.y += velocityY;
    diggs.y = Math.max(diggs.y + velocityY, 0); // apply gravity to diggs.y, limit diggs.y to top of the canvas
    context.drawImage(diggsImg, diggs.x, diggs.y, diggs.width, diggs.height);

    if (diggs.y > board.height) {
        gameOver = true;
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        
        if (!pipe.passed && diggs.x > pipe.x + pipe.width) {
            score += 0.5; // because there are 2 pipes
            pipe.passed = true;
        }

        if (detectCollision(diggs, pipe)) {
            gameOver = true;
        }
    }

    // clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // removes first element from the array
    }

    // score
    context.fillStyle = "white"
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    // game over
    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
        context.font = "25px sans-serif";
        context.fillText("Τράβα μάζεψε κάνα σύκο", 5, 120);
    }
}

function placePipes() {
    if (gameOver) {return;}

    // (0-1) * pipeHeight/2
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(bottomPipe);
}

function moveDiggs() {
    // jump
    velocityY = -6;

    // reset game
    if (gameOver) {
        diggs.y = diggsY;
        pipeArray = [];
        score = 0;
        gameOver = false;
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && 
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}