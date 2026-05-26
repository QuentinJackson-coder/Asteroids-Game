const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameEnded = false;

const scoreText = document.getElementById("score");
const gameOverText = document.getElementById("gameOver");

const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

class Ship {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = 20;
    this.angle = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.acceleration = 0.15;
    this.friction = 0.99;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.lineTo(-15, -15);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-15, 15);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  update() {
    if (keys["ArrowLeft"]) {
      this.angle -= 0.07;
    }

    if (keys["ArrowRight"]) {
      this.angle += 0.07;
    }

    if (keys["ArrowUp"]) {
      this.velocityX += Math.cos(this.angle) * this.acceleration;
      this.velocityY += Math.sin(this.angle) * this.acceleration;
    }

    this.x += this.velocityX;
    this.y += this.velocityY;

    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;

    this.draw();
  }
}

class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.radius = 3;
    this.speed = 7;
    this.velocityX = Math.cos(angle) * this.speed;
    this.velocityY = Math.sin(angle) * this.speed;
  }

  draw() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.draw();
  }
}

class Asteroid {
  constructor() {
    this.radius = Math.random() * 30 + 20;

    const edge = Math.floor(Math.random() * 4);

     if (edge === 0) {
      this.x = 0;
      this.y = Math.random() * canvas.height;
    } else if (edge === 1) {
      this.x = canvas.width;
      this.y = Math.random() * canvas.height;
    } else if (edge === 2) {
      this.x = Math.random() * canvas.width;
      this.y = 0;
    } else {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height;
    }

    const angle = Math.atan2(ship.y - this.y, ship.x - this.x);

    const speed = Math.random() * 2 + 1;

    this.velocityX = Math.cos(angle) * speed;
    this.velocityY = Math.sin(angle) * speed;
  }

    draw() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.draw();
  }
}

const ship = new Ship();
const bullets = [];
const asteroids = [];

let lastShot = 0;

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    const now = Date.now();

     if (now - lastShot > 200) {
      bullets.push(
        new Bullet(
          ship.x + Math.cos(ship.angle) * 25,
          ship.y + Math.sin(ship.angle) * 25,
          ship.angle
        )
      );

      lastShot = now;
    }
  }
});

function spawnAsteroid() {
  if (!gameEnded) {
    asteroids.push(new Asteroid());
  }
}

setInterval(spawnAsteroid, 1500);

function detectCollision(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < obj1.radius + obj2.radius;
}

function endGame() {
  gameEnded = true;
  gameOverText.style.display = "block";
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameEnded) {
    ship.update();

    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].update();

      if (
        bullets[i].x < 0 ||
        bullets[i].x > canvas.width ||
        bullets[i].y < 0 ||
        bullets[i].y > canvas.height
      ) {
        bullets.splice(i, 1);
      }
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
      asteroids[i].update();

      if (detectCollision(ship, asteroids[i])) {
        endGame();
      }

       for (let j = bullets.length - 1; j >= 0; j--) {
        if (detectCollision(bullets[j], asteroids[i])) {
          asteroids.splice(i, 1);
          bullets.splice(j, 1);

          score += 10;
          scoreText.textContent = score;
          break;
        }
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});