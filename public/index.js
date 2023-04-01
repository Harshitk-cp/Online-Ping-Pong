const canvas = document.getElementById("container");
const ctx = canvas.getContext("2d");

const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");

const ballRadius = 30;

const socket = io.connect(location.href);
let playerID = "";

let globalState = {
    players: {},
    ball: {}
}

const BALL_IMAGE = new Image();
BALL_IMAGE.src = 'resources/ball_icon.png';

//takes in user name and disables further input
document.getElementById("start-btn").addEventListener("click", () => {
    const name = document.getElementById("name").value;
    document.getElementById("name").style.display = 'none';
    document.getElementById("start-btn").style.display = "none";
    player1.innerText = name
    socket.emit('playername', `${player1.innerText} `);
});

document.addEventListener("keydown", keydown);

function keydown(event) {
    if (event.keyCode === 13) {
        player1.innerText = input.value;
        socket.emit('playername', `${player1.innerText} `);
    }
}

socket.on("connect", () => {

    playerID = socket.id;
    socket.emit('newPlayer', { width: 1024, height: 512, id: playerID });
});

//update the game state on client side
socket.on('state', (gameState) => {

    globalState = gameState;
});

let fps = 0;
let rFps = 0;
let lastFpsUpdate = 0;


//clear canvas and draw elements with updated positions
function draw() {
    const time = performance.now();

    if (time - lastFpsUpdate >= 1e3) {
        rFps = fps;
        fps = 0;
        lastFpsUpdate = time;
    }

    fps += 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '16px 600 Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`FPS: ${rFps}`, 5, 15);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white";
    ctx.setLineDash([20, 5]);
    ctx.beginPath();
    ctx.moveTo(512, 0);
    ctx.lineTo(512, 512);
    ctx.stroke();
    Object.keys(globalState.players).forEach(p => {
        const playerState = globalState.players[p];

        if (p === playerID && playerState.x == 994) {

            createPaddle(10, playerState.y, playerState.width, playerState.height, "white")
            score1.innerText = playerState.score;
            player1.innerText = playerState.name;

        } else if (p === playerID && playerState.x == 10) {
            createPaddle(10, playerState.y, playerState.width, playerState.height, "white")
            score1.innerText = playerState.score;
            player1.innerText = playerState.name;
        }
        else if (p != playerID && playerState.x == 994) {

            createPaddle(playerState.x, playerState.y, playerState.width, playerState.height, "grey")
            score2.innerText = playerState.score;
            player2.innerText = playerState.name;

        } else {
            createPaddle(994, playerState.y, playerState.width, playerState.height, "grey")
            score2.innerText = playerState.score;
            player2.innerText = playerState.name;
        }

    })

    const leftPlayer = Object.keys(globalState.players)[0];

    if (leftPlayer === playerID) {
        createBall(globalState.ball.x, globalState.ball.y)
    } else {
        createBall(1024 - globalState.ball.x, globalState.ball.y)
    }

    window.requestAnimationFrame(draw);

}

ctx.lineWidth = 4;
ctx.strokeStyle = "white";
ctx.setLineDash([20, 5]);
ctx.beginPath();
ctx.moveTo(512, 0);
ctx.lineTo(512, 512);
ctx.stroke();

function createBall(x, y) {
    ctx.save()
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const PADDING = 12;

    if (BALL_IMAGE.complete && BALL_IMAGE.naturalWidth && BALL_IMAGE.naturalHeight) {
        ctx.drawImage(
            BALL_IMAGE,
            x - (ballRadius / 2) - PADDING,
            y - (ballRadius / 2) - PADDING,
            ballRadius + PADDING * 2,
            ballRadius + PADDING * 2
        );
    }

    ctx.restore();
}

draw();


function createPaddle(x, y, width, height, color) {

    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();

}

function createPaddle2(x, y, width, height) {

    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

}

//handles players mo
const keyDownHandler = (e) => {
    if (e.keyCode == 38) {
        socket.emit('keyevent', "up");
    } else if (e.keyCode == 40) {
        socket.emit('keyevent', "down");
    } else if (e.keyCode == 13) {
        const name = document.getElementById("name").value;
        document.getElementById("name").style.display = 'none';
        document.getElementById("start-btn").style.display = "none";
        player1.innerText = name
        socket.emit('playername', `${player1.innerText} `);
    }
};

document.addEventListener('keydown', keyDownHandler, false);





