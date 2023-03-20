const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const bodyParser = require('body-parser');
const { Socket } = require('socket.io');
const PORT = 3000;


app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/*', (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message || 'Internal server error');
});

const canvas = {
    width: 1024,
    height: 512
};

let loser = null;

const gameState = {
    players: {},
    ball: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        velocityX: 2,
        velocityY: -2,
        speed: 20,
    }
}

server.listen(PORT, '0.0.0.0', () => {
    console.log('Server is live on PORT:', PORT);
});

io.on('connection', (socket) => {

    console.log('a player connected:', socket.id);
    gameState.players[socket.id] = {}

    socket.on('disconnect', function () {
        console.log('player disconnected');
        delete gameState.players[socket.id]
    });

    socket.on('playername', (data) => {
        gameState.players[socket.id].name = data;
    })

    socket.on('newPlayer', (player) => {

        canvas.width = player.width;
        canvas.height = player.height;

        const playerCount = Object.keys(gameState.players).length;

        if (playerCount > 2) {
            console.log('Too many people!')
            return;
        } else if (playerCount === 1) {

            gameState.players[socket.id] = {
                x: 10,
                y: 200,
                width: 20,
                height: 100,
                score: 0,
                name: gameState.players[socket.id].name,
            };

        } else {
            gameState.players[socket.id] = {
                x: 994,
                y: 200,
                width: 20,
                height: 100,
                score: 0,
                name: gameState.players[socket.id].name,
            };

        }

        socket.on('keyevent', (event) => {
            switch (event) {
                case "down":
                    if (gameState.players[player.id].y < 410) {
                        gameState.players[player.id].y += 10;
                    }

                    break;
                case "up":
                    if (gameState.players[player.id].y > 8) {
                        gameState.players[player.id].y -= 10;
                    }

                    break;
            }
        });

    });

});

setInterval(() => {

    const playerCount = Object.keys(gameState.players).length

    if (playerCount < 2) {
        return;
    }

    gameState.ball.x += gameState.ball.velocityX;
    gameState.ball.y += gameState.ball.velocityY;

    if (gameState.ball.y - gameState.ball.radius < 0 || gameState.ball.y + gameState.ball.radius > canvas.height) {
        gameState.ball.velocityY = -gameState.ball.velocityY;
    }

    Object.keys(gameState.players).forEach(id => {

        const player = gameState.players[id];

        if (loser !== null && player !== loser) {
            player.score++;
            loser = null;
            resetBall();
        }

        if (collision(gameState.ball, player)) {
            gameState.ball.velocityX = -gameState.ball.velocityX * 1.2;

        }

        if ((player.x == 994 && gameState.ball.x + gameState.ball.radius > canvas.width)) {
            loser = player;
        }

        if ((player.x == 10 && gameState.ball.x + gameState.ball.radius < 0)) {
            loser = player;
        }

    });

    if (Object.values(gameState.players).filter(player => player.name !== undefined).length == 2) {
        io.sockets.emit('state', gameState);
    }

}, 1000 / 60);

function collision(b, p) {


    if (b.x - b.radius <= p.x + p.width && b.x + b.radius >= p.x && b.y > p.y && b.y < p.y + p.height) {
        return true;
    }

    return false;
}

function resetBall() {

    gameState.ball.x = canvas.width / 2;
    gameState.ball.y = canvas.height / 2;
    gameState.ball.velocityX = -2;
    gameState.ball.speed = 10;

}
