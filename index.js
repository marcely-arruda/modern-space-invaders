const scoreEl = document.querySelector("#scoreEl");
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

let player = new Player();
let projectiles = [];
let grids = [];
let invaderProjectiles = [];
let particles = [];
let bombs = [];
let powerUps = [];

let keys = {
  ArrowLeft: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  space: {
    pressed: false
  }
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);

let game = {
  over: false,
  active: true
};

let score = 0;

let spawnBuffer = 500;
let fps = 60;
let fpsInterval = 1000 / fps;

let msPrev = window.performance.now();

function init() {
  player = new Player();
  projectiles = [];
  grids = [];
  invaderProjectiles = [];
  particles = [];
  bombs = [];
  powerUps = [];

  keys = {
    ArrowLeft: {
      pressed: false
    },
    ArrowRight: {
      pressed: false
    },
    space: {
      pressed: false
    }
  };

  frames = 0;
  randomInterval = Math.floor(Math.random() * 500 + 500);

  game = {
    over: false,
    active: true
  };

  score = 0;

  for (let i = 0; i < 100; i++) {
    particles.push(
      new particle({
        position: {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height
        },
        velocity: {
          x: 0,
          y: 0.3
        },
        radius: Math.random() * 2,
        color: "white"
      })
    );
  }
}

function endGame() {
  audio.gameOver.play();

  setTimeout(() => {
    player.opacity = 0;
    game.over = true;
  }, 0);

  setTimeout(() => {
    game.active = false;
    document.querySelector("#restartScreen").style.display = "flex";
  }, 2000);

  creatParticles({
    object: player,
    color: "white",
    fades: true
  });
}

function animate() {
  if (!game.active) return;
  requestAnimationFrame(animate);

  const msNow = window.performance.now();
  const elapsed = msNow - msPrev;

  if (elapsed < fpsInterval) return;

  msPrev = msNow - (elapsed % fpsInterval);

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];

    if (powerUp.position.x - powerUp.radius >= canvas.width)
      powerUps.splice(i, 1);
    else powerUp.update();
  }

  if (frames % 500 === 0) {
    powerUps.push(
      new PowerUp({
        position: {
          x: 0,
          y: Math.random() * 300 + 15
        },
        velocity: {
          x: 5,
          y: 0
        }
      })
    );
  }

  if (frames % 200 === 0 && bombs.length < 3) {
    bombs.push(
      new Bomb({
        position: {
          x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
          y: randomBetween(Bomb.radius, canvas.height - Bomb.radius)
        },
        velocity: {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6
        }
      })
    );
  }

  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];

    if (bomb.opacity <= 0) {
      bombs.splice(i, 1);
    } else bomb.update();
  }

  player.update();

  for (let i = player.particles.length - 1; i >= 0; i--) {
    const particle = player.particles[i];
    particle.update();

    if (particle.opacity === 0) player.particles[1].splice(i, 1);
  }

  particles.forEach((particle, i) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }

    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(i, 1);
      }, 0);
    } else {
      particle.update();
    }
  });

  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
      canvas.height
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else invaderProjectile.update();

    if (
      rectangularCollision({
        rectangle1: invaderProjectile,
        rectangle2: player
      })
    ) {
      invaderProjectiles.splice(index, 1);
      endGame();
    }
  });

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];

    for (let j = bombs.length - 1; j >= 0; j--) {
      const bomb = bombs[j];

      if (
        Math.hypot(
          projectile.position.x - bomb.position.x,
          projectile.position.y - bomb.position.y
        ) <
          projectile.radius + bomb.radius &&
        !bomb.active
      ) {
        projectiles.splice(i, 1);
        bomb.explode();
      }
    }

    for (let j = powerUps.length - 1; j >= 0; j--) {
      const powerUp = powerUps[j];

      if (
        Math.hypot(
          projectile.position.x - powerUp.position.x,
          projectile.position.y - powerUp.position.y
        ) <
        projectile.radius + powerUp.radius
      ) {
        projectiles.splice(i, 1);
        powerUps.splice(j, 1);
        player.powerUp = "Metralhadora";
        audio.bonus.play();

        setTimeout(() => {
          player.powerUp = null;
        }, 5000);
      }
    }

    if(projectile.position.y + particles.radius <= 0) {
        projectiles.splice(i, 1);
    } else {
        projectile.update();
    }
  }
}
