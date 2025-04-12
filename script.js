const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 20;
let CELL_SIZE;

let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let dx = 1;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let nextDirection = { dx: 1, dy: 0 };
document.addEventListener('touchmove', function (e) {
  e.preventDefault();
}, { passive: false });

document.getElementById('highScore').textContent = highScore;

function resizeCanvas() {
  const container = document.getElementById('gameContainer');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  CELL_SIZE = canvas.width / GRID_SIZE;
  draw();
}

window.addEventListener('resize', resizeCanvas);

function generateFood() {
  while (true) {
    const food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some(segment => segment.x === food.x && segment.y === food.y)) {
      return food;
    }
  }
}

function update() {
  dx = nextDirection.dx;
  dy = nextDirection.dy;

  const newHead = {
    x: (snake[0].x + dx + GRID_SIZE) % GRID_SIZE,
    y: (snake[0].y + dy + GRID_SIZE) % GRID_SIZE,
  };

  if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    gameOver();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    document.getElementById('score').textContent = score;
    food = generateFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  snake.forEach((segment, index) => {
    const gradient = ctx.createRadialGradient(
      (segment.x + 0.5) * CELL_SIZE,
      (segment.y + 0.5) * CELL_SIZE,
      0,
      (segment.x + 0.5) * CELL_SIZE,
      (segment.y + 0.5) * CELL_SIZE,
      CELL_SIZE / 2
    );
    gradient.addColorStop(0, '#ffee58');
    gradient.addColorStop(1, '#fbc02d');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(
      segment.x * CELL_SIZE,
      segment.y * CELL_SIZE,
      CELL_SIZE - 1,
      CELL_SIZE - 1,
      index === 0 ? 6 : 3
    );
    ctx.fill();
  });

  // Draw food
  ctx.fillStyle = '#ff5252';
  ctx.beginPath();
  ctx.arc(
    (food.x + 0.5) * CELL_SIZE,
    (food.y + 0.5) * CELL_SIZE,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function gameOver() {
  clearInterval(gameLoop);
  document.getElementById('gameOver').style.display = 'block';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    document.getElementById('highScore').textContent = highScore;
  }
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  dx = 1;
  dy = 0;
  nextDirection = { dx: 1, dy: 0 };
  score = 0;
  document.getElementById('score').textContent = score;
  document.getElementById('gameOver').style.display = 'none';
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(update, 100);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      if (dy !== 1) nextDirection = { dx: 0, dy: -1 };
      break;
    case 'ArrowDown':
      if (dy !== -1) nextDirection = { dx: 0, dy: 1 };
      break;
    case 'ArrowLeft':
      if (dx !== 1) nextDirection = { dx: -1, dy: 0 };
      break;
    case 'ArrowRight':
      if (dx !== -1) nextDirection = { dx: 1, dy: 0 };
      break;
  }
});

// Swipe support
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 30 && dx !== -1) {
      nextDirection = { dx: 1, dy: 0 };
    } else if (deltaX < -30 && dx !== 1) {
      nextDirection = { dx: -1, dy: 0 };
    }
  } else {
    if (deltaY > 30 && dy !== -1) {
      nextDirection = { dx: 0, dy: 1 };
    } else if (deltaY < -30 && dy !== 1) {
      nextDirection = { dx: 0, dy: -1 };
    }
  }
}, { passive: true });

resizeCanvas();
resetGame();
