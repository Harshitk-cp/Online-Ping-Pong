let canvas2 = document.getElementById('background');
let c = canvas2.getContext('2d');

let toggle = document.getElementById('toggle');


canvas2.width = window.innerWidth;
canvas2.height = window.innerHeight;

window.addEventListener("resize", function () {
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
});


/*
* ------------------------------------------
* *-----------------------------
*  Design
* *-----------------------------
* ------------------------------------------
*/

function Star() {
    this.radius = (Math.random() * 10) + 5;
    this.x = this.radius + (canvas2.width - this.radius * 2) * Math.random();
    this.y = -10;
    this.dx = (Math.random() - 0.5) * 20;
    this.dy = 30;
    this.gravity = .5;
    this.friction = .54;

    this.update = function () {

        // Bounce particles off the floor of the canvas2
        if (this.y + this.radius + this.dy >= canvas2.height - groundHeight) {
            this.dy = -this.dy * this.friction;
            this.dx *= this.friction;
            this.radius -= 3;

            explosions.push(new Explosion(this));
        } else {
            this.dy += this.gravity;
        }

        // Bounce particles off left and right sides of canvas2
        if (this.x + this.radius + this.dx >= canvas2.width || this.x - this.radius + this.dx < 0) {
            this.dx = -this.dx;
            this.dx *= this.friction;
            explosions.push(new Explosion(this));
        };

        // Move particles by velocity
        this.x += this.dx;
        this.y += this.dy;

        this.draw();

        // Draw particles from explosion
        for (var i = 0; i < explosions.length; i++) {
            explosions[i].update();
        }

    }
    this.draw = function () {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, Math.abs(this.radius), 0, Math.PI * 2, false);

        c.shadowColor = '#E3EAEF';
        c.shadowBlur = 20;
        c.shadowOffsetX = 0;
        c.shadowOffsetY = 0;

        c.fillStyle = "#E3EAEF";
        c.fill();
        c.closePath();
        c.restore();
    }
}

function Particle(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.size = {
        width: 2,
        height: 2
    };
    this.dx = dx;
    this.dy = dy;
    this.gravity = .09;
    this.friction = 0.88;
    this.timeToLive = 3;
    this.opacity = 1;

    this.update = function () {
        if (this.y + this.size.height + this.dy >= canvas2.height - groundHeight) {
            this.dy = -this.dy * this.friction;
            this.dx *= this.friction;
        } else {
            this.dy += this.gravity;
        }

        if (this.x + this.size.width + this.dx >= canvas2.width || this.x + this.dx < 0) {
            this.dx = -this.dx;
            this.dx *= this.friction;
        };
        this.x += this.dx;
        this.y += this.dy;

        this.draw();

        this.timeToLive -= 0.01;
        this.opacity -= 1 / (this.timeToLive / 0.01);
    }
    this.draw = function () {
        c.save();
        c.fillStyle = "rgba(227, 234, 239," + this.opacity + ")";
        c.shadowColor = '#E3EAEF';
        c.shadowBlur = 20;
        c.shadowOffsetX = 0;
        c.shadowOffsetY = 0;
        c.fillRect(this.x, this.y, this.size.width, this.size.height);
        c.restore();
    }

    this.isAlive = function () {
        return 0 <= this.timeToLive;
    }
}

function Explosion(star) {
    this.particles = [];

    this.init = function (parentStar) {
        for (var i = 0; i < 8; i++) {
            var velocity = {
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 15,
            }
            this.particles.push(new Particle(parentStar.x, parentStar.y, velocity.x, velocity.y));
        }
    }

    this.init(star);

    this.update = function () {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
            if (this.particles[i].isAlive() == false) {
                this.particles.splice(i, 1);
            }
        }
    }
}


function createPlanets(x, y, radius, color) {


    c.save();
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI * 2);
    c.fillStyle = color;
    c.shadowColor = color;
    c.shadowOffsetX = 0;
    c.shadowOffsetY = 0;
    c.shadowBlur = 50;
    c.fill();
    c.restore();




    // Draw triangle
    // c.beginPath();
    // c.moveTo(i * mountainWidth, canvas2.height);
    // c.lineTo(i * mountainWidth + mountainWidth + 325, canvas2.height);

    // // Triangle peak
    // c.lineTo(i * mountainWidth + mountainWidth / 2, canvas2.height - height);
    // c.lineTo(i * mountainWidth - 325, canvas2.height);
    // c.fillStyle = color;
    // c.fill();
    // c.closePath();

}

function createMountainRange(mountainAmount, height, color) {
    for (var i = 0; i < mountainAmount; i++) {
        var mountainWidth = canvas2.width / mountainAmount;


        //Draw triangle
        c.beginPath();
        c.moveTo(i * mountainWidth, canvas2.height);
        c.lineTo(i * mountainWidth + mountainWidth + 325, canvas2.height);

        // Triangle peak
        c.lineTo(i * mountainWidth + mountainWidth / 2, canvas2.height - height);
        c.lineTo(i * mountainWidth - 325, canvas2.height);
        c.fillStyle = color;
        c.fill();
        c.closePath();
    }
}

function MiniStar() {
    this.x = Math.random() * canvas2.width;
    this.y = Math.random() * canvas2.height;
    this.radius = Math.random() * 3;

    this.draw = function () {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

        c.shadowColor = '#E3EAEF';
        c.shadowBlur = (Math.random() * 10) + 10;
        c.shadowOffsetX = 0;
        c.shadowOffsetY = 0;

        c.fillStyle = "white";
        c.fill();

        c.closePath();
        c.restore();
    }
}


/*
* ------------------------------------------
* *-----------------------------
*  Implementation
* *-----------------------------
* ------------------------------------------
*/

var timer = 0;
var stars = [];
var explosions = [];
var groundHeight = canvas2.height * 0.05;
var randomSpawnRate = Math.floor((Math.random() * 25) + 60)
var backgroundGradient = c.createLinearGradient(0, 0, 0, canvas2.height);
backgroundGradient.addColorStop(0, "#171e26");
backgroundGradient.addColorStop(1, "#3f586b");

var miniStars = [];
for (var i = 0; i < 150; i++) {
    miniStars.push(new MiniStar());
}




function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = backgroundGradient;
    c.fillRect(0, 0, canvas2.width, canvas2.height);

    for (var i = 0; i < miniStars.length; i++) {
        miniStars[i].draw();
    }

    createPlanets(canvas2.width / 2 + 200, 100, 50, "#FFFFFF")

    createMountainRange(2, canvas2.height - 150, "#384551");
    createMountainRange(3, canvas2.height - 300, "#2B3843");
    createMountainRange(5, canvas2.height - 500, "#26333E");




    c.fillStyle = "#182028";
    c.fillRect(0, canvas2.height - groundHeight, canvas2.width, groundHeight);


    var isChecked = document.getElementById("toggle").checked;

    if (isChecked) {
        for (var i = 0; i < stars.length; i++) {
            stars[i].update();


            if (stars[i].radius <= 0) {
                stars.splice(i, 1);
            }
        }

        for (var i = 0; i < explosions.length; i++) {
            if (explosions[i].length <= 0) {
                explosions.splice(i, 1);
            }
        }

        timer++;

        if (timer % randomSpawnRate == 0) {
            stars.push(new Star());
            randomSpawnRate = Math.floor((Math.random() * 10) + 75)
        }
    }


}

animate();















