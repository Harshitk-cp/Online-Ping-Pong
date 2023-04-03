(() => {
    const toggle = document.getElementById('toggle');
    const canvas = document.getElementById('background');
    const backgroundImage = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const stars = [];
    const explosions = [];
    let randomSpawnRate = Math.floor((Math.random() * 25) + 60);
    let timer = 0;
    let groundHeight = canvas.height * 0.05;

    class Star {
        constructor() {
            this.radius = (Math.random() * 10) + 5;
            this.x = this.radius + (canvas.width - this.radius * 2) * Math.random();
            this.y = -10;
            this.dx = (Math.random() - 0.5) * 20;
            this.dy = 30;
            this.gravity = .5;
            this.friction = .54;
        }

        update() {
            // Bounce particles off the floor of the canvas
            if (this.y + this.radius + this.dy >= canvas.height - groundHeight) {
                this.dy = -this.dy * this.friction;
                this.dx *= this.friction;
                this.radius -= 3;
                explosions.push(new Explosion(this));
            } else {
                this.dy += this.gravity;
            }

            // Bounce particles off left and right sides of canvas
            if (this.x + this.radius + this.dx >= canvas.width || this.x - this.radius + this.dx < 0) {
                this.dx = -this.dx;
                this.dx *= this.friction;
                explosions.push(new Explosion(this));
            };

            // Move particles by velocity
            this.x += this.dx;
            this.y += this.dy;

            this.draw();

            // Draw particles from explosion
            for (const explosion of explosions) explosion.update();
        };

        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.abs(this.radius), 0, Math.PI * 2, false);

            ctx.shadowColor = '#E3EAEF';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.fillStyle = "#E3EAEF";
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        };
    }

    class Particle {
        constructor(x, y, dx, dy) {
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
        }

        update() {
            if (this.y + this.size.height + this.dy >= canvas.height - groundHeight) {
                this.dy = -this.dy * this.friction;
                this.dx *= this.friction;
            } else {
                this.dy += this.gravity;
            }

            if (this.x + this.size.width + this.dx >= canvas.width || this.x + this.dx < 0) {
                this.dx = -this.dx;
                this.dx *= this.friction;
            };
            this.x += this.dx;
            this.y += this.dy;

            this.draw();

            this.timeToLive -= 0.01;
            this.opacity -= 1 / (this.timeToLive / 0.01);
        }

        draw() {
            ctx.save();
            ctx.fillStyle = "rgba(227, 234, 239," + this.opacity + ")";
            ctx.shadowColor = '#E3EAEF';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillRect(this.x, this.y, this.size.width, this.size.height);
            ctx.restore();
        };

        isAlive() {
            return 0 <= this.timeToLive;
        };

    }

    class Explosion {
        constructor(star) {
            this.particles = [];
            this.init(star);
        }

        init(parentStar) {
            for (let i = 0; i < 8; i++) {
                let velocity = {
                    x: (Math.random() - 0.5) * 5,
                    y: (Math.random() - 0.5) * 15,
                };
                this.particles.push(new Particle(parentStar.x, parentStar.y, velocity.x, velocity.y));
            }
        }

        update() {
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].update();
                if (this.particles[i].isAlive() == false) {
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    const createMountainRange = (ctx, mountainAmount, height, color) => {
        for (let i = 0; i < mountainAmount; i++) {
            const mountainWidth = canvas.width / mountainAmount;

            //Draw triangle
            ctx.beginPath();
            ctx.moveTo(i * mountainWidth, canvas.height);
            ctx.lineTo(i * mountainWidth + mountainWidth + 325, canvas.height);

            // Triangle peak
            ctx.lineTo(i * mountainWidth + mountainWidth / 2, canvas.height - height);
            ctx.lineTo(i * mountainWidth - 325, canvas.height);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.closePath();
        }
    }

    const renderBackgroundImage = () => {
        const WIDTH = window.innerWidth;
        const HEIGHT = window.innerHeight;
        const bgctx = backgroundImage.getContext('2d');
        const gradient = bgctx.createLinearGradient(0, 0, 0, HEIGHT);

        backgroundImage.width = WIDTH;
        backgroundImage.height = HEIGHT;
        gradient.addColorStop(0, "#171e26");
        gradient.addColorStop(1, "#3f586b");

        // fill background
        bgctx.fillStyle = gradient;
        bgctx.fillRect(0, 0, WIDTH, HEIGHT);

        // render moon
        bgctx.save();
        bgctx.beginPath();
        bgctx.arc(WIDTH * 0.6, HEIGHT * 0.15, HEIGHT * 0.06, 0, Math.PI * 2);
        bgctx.closePath();
        bgctx.fillStyle = "#FFFFFF";
        bgctx.shadowColor = "#FFFFFF";
        bgctx.shadowBlur = 50;
        bgctx.fill();
        bgctx.restore();

        // render stars
        bgctx.save();
        bgctx.beginPath();
        bgctx.shadowColor = '#E3EAEF';
        bgctx.shadowBlur = 8;
        bgctx.fillStyle = "white";
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * WIDTH;
            const y = Math.random() * HEIGHT;
            const radius = Math.random() * 3;
            bgctx.moveTo(x, y + radius);
            bgctx.arc(x, y, radius, 0, Math.PI * 2, true);
        }
        bgctx.closePath();
        bgctx.fill();
        bgctx.restore();

        // render mountains
        createMountainRange(bgctx, 2, HEIGHT - 150, "#384551");
        createMountainRange(bgctx, 3, HEIGHT - 300, "#2B3843");
        createMountainRange(bgctx, 5, HEIGHT - 500, "#26333E");

        // render ground
        bgctx.fillStyle = "#182028";
        bgctx.fillRect(0, HEIGHT - groundHeight, WIDTH, groundHeight);
    }

    const setCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        groundHeight = canvas.height * 0.05;
        renderBackgroundImage();
    }

    function render() {
        ctx.drawImage(backgroundImage, 0, 0);

        if (toggle.checked) {
            for (let i = explosions.length - 1; i >= 0; i--) {
                if (explosions[i].length <= 0) explosions.splice(i, 1);
            }

            for (let i = stars.length - 1; i >= 0; i--) {
                if (stars[i].radius <= 0) stars.splice(i, 1);
                else stars[i].update();
            }

            timer++;

            if (timer % randomSpawnRate == 0) {
                stars.push(new Star());
                randomSpawnRate = Math.floor((Math.random() * 10) + 75)
            }
        }

        window.requestAnimationFrame(render);
    }

    const setup = () => {
        window.addEventListener("resize", setCanvasSize);

        setCanvasSize();
        render();
    }

    setup();
})()
