const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Constraint = Matter.Constraint,
  Body = Matter.Body,
  Vector = Matter.Vector,
  Events = Matter.Events;

// Constants for fixed time step
const FIXED_DELTA_TIME = 1000 / 60; // Target 60 FPS
const MAX_DELTA_TIME = 1000 / 30; // Prevent huge time steps
let lastUpdateTime = performance.now();

// Initialize engine with fixed time step
const engine = Engine.create({
  gravity: { x: 0, y: 1, scale: 0.001 },
  enableSleeping: false,
  timing: {
    timeScale: 1,
    timestamp: 0,
    lastDelta: FIXED_DELTA_TIME
  }
});

const canvas = document.getElementById('canvas');
const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: 1200,
    height: 600,
    wireframes: false
  }
});

// Create fixed time step runner
const runner = Runner.create({
  isFixed: true,
  delta: FIXED_DELTA_TIME
});

// Ragdoll creation function
function createRagdoll(x, y) {
  const parts = {};
  const group = Body.nextGroup(true);
  
  // Head - updated to match arm red
  parts.head = Bodies.circle(x, y, 15, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#e74c3c' }
  });

  // Upper body (chest)
  parts.chest = Bodies.rectangle(x, y + 35, 40, 30, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#3498db' }
  });

  // Lower body (stomach)
  parts.stomach = Bodies.rectangle(x, y + 60, 35, 20, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#2980b9' }
  });

  // Upper arms - existing red color
  parts.upperArmLeft = Bodies.rectangle(x - 30, y + 35, 20, 10, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#e74c3c' }
  });
  parts.upperArmRight = Bodies.rectangle(x + 30, y + 35, 20, 10, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#e74c3c' }
  });

  // Lower arms
  parts.lowerArmLeft = Bodies.rectangle(x - 45, y + 35, 15, 8, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#c0392b' }
  });
  parts.lowerArmRight = Bodies.rectangle(x + 45, y + 35, 15, 8, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#c0392b' }
  });

  // Hands - updated to match arm red
  parts.handLeft = Bodies.circle(x - 57, y + 35, 5, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#e74c3c' }
  });
  parts.handRight = Bodies.circle(x + 57, y + 35, 5, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#e74c3c' }
  });

  // Upper legs - updated to match arm red
  parts.upperLegLeft = Bodies.rectangle(x - 10, y + 85, 15, 30, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#e74c3c' }
  });
  parts.upperLegRight = Bodies.rectangle(x + 10, y + 85, 15, 30, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#e74c3c' }
  });

  // Lower legs - updated to match arm red
  parts.lowerLegLeft = Bodies.rectangle(x - 10, y + 110, 12, 25, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#e74c3c' }
  });
  parts.lowerLegRight = Bodies.rectangle(x + 10, y + 110, 12, 25, {
    friction: 0.5,
    restitution: 0.3,
    render: { fillStyle: '#e74c3c' }
  });

  // Constraints (joints)
  const constraints = [
    // Neck
    Constraint.create({
      bodyA: parts.head,
      bodyB: parts.chest,
      pointA: { x: 0, y: 15 },
      pointB: { x: 0, y: -15 },
      stiffness: 0.5,
      render: { visible: false }
    }),

    // Spine
    Constraint.create({
      bodyA: parts.chest,
      bodyB: parts.stomach,
      pointA: { x: 0, y: 15 },
      pointB: { x: 0, y: -10 },
      stiffness: 0.7,
      render: { visible: false }
    }),

    // Arms
    Constraint.create({
      bodyA: parts.chest,
      bodyB: parts.upperArmLeft,
      pointA: { x: -20, y: 0 },
      pointB: { x: 10, y: 0 },
      stiffness: 0.5,
      render: { visible: false }
    }),
    Constraint.create({
      bodyA: parts.upperArmLeft,
      bodyB: parts.lowerArmLeft,
      pointA: { x: -10, y: 0 },
      pointB: { x: 7.5, y: 0 },
      stiffness: 0.5,
      render: { visible: false }
    }),
    Constraint.create({
      bodyA: parts.chest,
      bodyB: parts.upperArmRight,
      pointA: { x: 20, y: 0 },
      pointB: { x: -10, y: 0 },
      stiffness: 0.5,
      render: { visible: false }
    }),
    Constraint.create({
      bodyA: parts.upperArmRight,
      bodyB: parts.lowerArmRight,
      pointA: { x: 10, y: 0 },
      pointB: { x: -7.5, y: 0 },
      stiffness: 0.5,
      render: { visible: false }
    }),

    // Hand joints
    Constraint.create({
      bodyA: parts.lowerArmLeft,
      bodyB: parts.handLeft,
      pointA: { x: -7.5, y: 0 },
      pointB: { x: 0, y: 0 },
      stiffness: 0.5,
      render: { visible: false }
    }),
    Constraint.create({
      bodyA: parts.lowerArmRight,
      bodyB: parts.handRight,
      pointA: { x: 7.5, y: 0 },
      pointB: { x: 0, y: 0 },
      stiffness: 0.5,
      render: { visible: false }
    }),

    // Legs
    Constraint.create({
      bodyA: parts.stomach,
      bodyB: parts.upperLegLeft,
      pointA: { x: -10, y: 10 },
      pointB: { x: 0, y: -15 },
      stiffness: 0.6,
      render: { visible: false }
    }),
    Constraint.create({
      bodyA: parts.upperLegLeft,
      bodyB: parts.lowerLegLeft,
      pointA: { x: 0, y: 15 },
      pointB: { x: 0, y: -12.5 },
      stiffness: 0.6,
      render: { visible: false }
    }),
    Constraint.create({
      bodyA: parts.stomach,
      bodyB: parts.upperLegRight,
      pointA: { x: 10, y: 10 },
      pointB: { x: 0, y: -15 },
      stiffness: 0.6,
      render: { visible: false }
    }),
    Constraint.create({
      bodyA: parts.upperLegRight,
      bodyB: parts.lowerLegRight,
      pointA: { x: 0, y: 15 },
      pointB: { x: 0, y: -12.5 },
      stiffness: 0.6,
      render: { visible: false }
    })
  ];

  return { parts, constraints };
}

// Create ceiling
const ceiling = Bodies.rectangle(600, 10, 1210, 20, {
  isStatic: true,
  render: { fillStyle: '#666' }
});

// Create ground
const ground = Bodies.rectangle(600, 590, 1210, 20, {
  isStatic: true,
  render: { fillStyle: '#666' }
});

// Initialize ragdoll
let currentRagdoll = createRagdoll(600, 100);
Composite.add(engine.world, [
  ground,
  ceiling,
  ...Object.values(currentRagdoll.parts),
  ...currentRagdoll.constraints
]);

// Rope management
let leftRopeConstraint = null;
let rightRopeConstraint = null;

// Mouse control with rope shooting
let isMouseDown = false;
let mousePosition = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  const rect = canvas.getBoundingClientRect();
  mousePosition = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };

  // Determine which hand is closer to the mouse position
  const leftHandPos = currentRagdoll.parts.handLeft.position;
  const rightHandPos = currentRagdoll.parts.handRight.position;
  const leftDist = Vector.magnitude(Vector.sub(mousePosition, leftHandPos));
  const rightDist = Vector.magnitude(Vector.sub(mousePosition, rightHandPos));

  // Create rope constraint from the closer hand with initial tension
  if (leftDist < rightDist && !leftRopeConstraint) {
    leftRopeConstraint = Constraint.create({
      pointA: { x: mousePosition.x, y: 10 }, // Attach to ceiling
      bodyB: currentRagdoll.parts.handLeft,
      stiffness: 0.1,
      damping: 0.001,
      length: leftDist * 0.8, // Initial tension
      render: {
        strokeStyle: '#fff',
        lineWidth: 2
      }
    });
    Composite.add(engine.world, leftRopeConstraint);
  } else if (!rightRopeConstraint) {
    rightRopeConstraint = Constraint.create({
      pointA: { x: mousePosition.x, y: 10 }, // Attach to ceiling
      bodyB: currentRagdoll.parts.handRight,
      stiffness: 0.1,
      damping: 0.001,
      length: rightDist * 0.8, // Initial tension
      render: {
        strokeStyle: '#fff',
        lineWidth: 2
      }
    });
    Composite.add(engine.world, rightRopeConstraint);
  }
});

canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
  
  // Remove both rope constraints
  if (leftRopeConstraint) {
    Composite.remove(engine.world, leftRopeConstraint);
    leftRopeConstraint = null;
  }
  if (rightRopeConstraint) {
    Composite.remove(engine.world, rightRopeConstraint);
    rightRopeConstraint = null;
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mousePosition = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Health system
let health = 10;
let isGameOver = false;
let lastHitTime = 0;
const invincibilityTime = 1000; // 1 second of invincibility after getting hit

function updateHealthDisplay() {
  const healthDisplay = document.querySelector('.health-display');
  healthDisplay.innerHTML = '';
  
  for (let i = 0; i < 10; i++) {
    const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    heart.classList.add('heart');
    if (i >= health) heart.classList.add('empty');
    heart.setAttribute('viewBox', '0 0 24 24');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
    heart.appendChild(path);
    healthDisplay.appendChild(heart);
  }
}

function createBall(isFromLeft) {
  const y = 100 + Math.random() * 400; // Keep spawn height between 100-500
  const x = isFromLeft ? -100 : render.options.width + 100;
  
  const ball = Bodies.circle(x, y, 10, {
    friction: 0.5,
    restitution: 0.7,
    render: {
      fillStyle: '#f1c40f'
    },
    hasDealtDamage: false
  });
  
  // Scale velocity by fixed delta time
  const baseSpeed = 0.25; // Reduced base speed
  const speed = baseSpeed * FIXED_DELTA_TIME;
  
  // Calculate target position
  const targetX = render.options.width / 2 + (Math.random() - 0.5) * 300;
  const targetY = render.options.height / 2 + (Math.random() - 0.5) * 200;
  
  const angle = Math.atan2(targetY - y, targetX - x);
  const verticalVariation = (Math.random() - 0.5) * 0.5 * FIXED_DELTA_TIME;
  
  Body.setVelocity(ball, {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed + verticalVariation
  });
  
  Composite.add(engine.world, ball);
  balls.push(ball);
  
  if (balls.length > 20) {
    const removedBall = balls.shift();
    Composite.remove(engine.world, removedBall);
  }
}

Events.on(engine, 'collisionStart', (event) => {
  if (isGameOver) return;
  
  const now = Date.now();
  if (now - lastHitTime < invincibilityTime) return;
  
  const pairs = event.pairs;
  
  for (let pair of pairs) {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;
    
    // Check if one body is a ball and the other is a ragdoll part
    const ball = balls.includes(bodyA) ? bodyA : balls.includes(bodyB) ? bodyB : null;
    const ragdollPart = Object.values(currentRagdoll.parts).includes(bodyA) ? 
      bodyA : Object.values(currentRagdoll.parts).includes(bodyB) ? bodyB : null;
    
    if (ball && ragdollPart && !ball.hasDealtDamage) {
      ball.hasDealtDamage = true;
      health--;
      lastHitTime = now;
      updateHealthDisplay();
      
      if (health <= 0) {
        gameOver();
      }
      
      // Updated visual feedback on hit - changed to white flash
      const originalColor = getOriginalColor(ragdollPart);
      ragdollPart.render.fillStyle = '#ffffff';
      setTimeout(() => {
        ragdollPart.render.fillStyle = originalColor;
      }, 200);
      
      break;
    }
  }
});

function getOriginalColor(part) {
  // Parts that should be red
  if (part === currentRagdoll.parts.head || 
      part === currentRagdoll.parts.handLeft || 
      part === currentRagdoll.parts.handRight || 
      part === currentRagdoll.parts.upperArmLeft ||
      part === currentRagdoll.parts.upperArmRight ||
      part === currentRagdoll.parts.upperLegLeft || 
      part === currentRagdoll.parts.upperLegRight || 
      part === currentRagdoll.parts.lowerLegLeft || 
      part === currentRagdoll.parts.lowerLegRight) {
    return '#e74c3c';
  }
  // Lower arms are darker red
  if (part === currentRagdoll.parts.lowerArmLeft ||
      part === currentRagdoll.parts.lowerArmRight) {
    return '#c0392b';
  }
  // Chest and stomach are blue
  if (part === currentRagdoll.parts.chest) {
    return '#3498db';
  }
  return '#2980b9'; // stomach color
}

function gameOver() {
  isGameOver = true;
  const finalTime = scoreManager.stopStopwatch();
  scoreManager.addScore(finalTime);
  
  const gameOverScreen = document.querySelector('.game-over');
  const finalTimeDisplay = gameOverScreen.querySelector('.final-time');
  finalTimeDisplay.textContent = `You survived for ${scoreManager.formatTime(finalTime)}`;
  gameOverScreen.classList.add('visible');
  
  clearInterval(ballSpawnInterval);
}

let outOfBoundsTime = 0;
let isOutOfBounds = false;

function checkRagdollBounds() {
  const head = currentRagdoll.parts.head;
  const chest = currentRagdoll.parts.chest;
  const stomach = currentRagdoll.parts.stomach;
  
  // Check if core body parts are out of bounds
  const buffer = 100; // Allow some buffer space beyond visible window
  const isNowOutOfBounds = 
    head.position.y < -buffer || head.position.y > render.options.height + buffer ||
    head.position.x < -buffer || head.position.x > render.options.width + buffer ||
    chest.position.y < -buffer || chest.position.y > render.options.height + buffer ||
    chest.position.x < -buffer || chest.position.x > render.options.width + buffer ||
    stomach.position.y < -buffer || stomach.position.y > render.options.height + buffer ||
    stomach.position.x < -buffer || stomach.position.x > render.options.width + buffer;

  const currentTime = Date.now();
  
  if (isNowOutOfBounds && !isOutOfBounds) {
    // Just went out of bounds
    isOutOfBounds = true;
    outOfBoundsTime = currentTime;
  } else if (!isNowOutOfBounds && isOutOfBounds) {
    // Just came back in bounds
    isOutOfBounds = false;
    outOfBoundsTime = 0;
  } else if (isOutOfBounds && currentTime - outOfBoundsTime > 1000) {
    // Been out of bounds for more than 1 second
    if (!isGameOver) {
      gameOver();
    }
  }
}

function resetGame() {
  isOutOfBounds = false;
  outOfBoundsTime = 0;
  
  // Remove ropes if they exist
  if (leftRopeConstraint) {
    Composite.remove(engine.world, leftRopeConstraint);
    leftRopeConstraint = null;
  }
  if (rightRopeConstraint) {
    Composite.remove(engine.world, rightRopeConstraint);
    rightRopeConstraint = null;
  }

  // Clear all existing balls only when resetting
  balls.forEach(ball => {
    Composite.remove(engine.world, ball);
  });
  balls = [];

  // Reset ragdoll
  Composite.remove(engine.world, [
    ...Object.values(currentRagdoll.parts),
    ...currentRagdoll.constraints
  ]);
  currentRagdoll = createRagdoll(600, 100);
  Composite.add(engine.world, [
    ...Object.values(currentRagdoll.parts),
    ...currentRagdoll.constraints
  ]);
  
  // Reset health
  health = 10;
  isGameOver = false;
  document.querySelector('.game-over').classList.remove('visible');
  updateHealthDisplay();
  
  // Reset slow motion
  slowMotionActive = false;
  slowMotionTimeLeft = SLOW_MOTION_DURATION;
  engine.timing.timeScale = NORMAL_TIME_SCALE;
  updateSlowMotionDisplay();

  // Start stopwatch
  scoreManager.startStopwatch();
  
  // Start ball spawning
  startBallSpawning();

  // After resetting, show game container and hide title screen
  document.getElementById('game-container').classList.remove('hidden');
  document.getElementById('title-screen').style.display = 'none';
}

// Ball creation and management
const ballRadius = 10;
const ballSpeed = 15;
const spawnInterval = 1000; // Spawn every 1 second
const maxBalls = 20; // Increased maximum balls

let balls = [];

// Update slow motion variables
let slowMotionActive = false;
let slowMotionTimeLeft = 10000; // Changed to 10 seconds
let lastTime = Date.now();
const SLOW_MOTION_DURATION = 10000; // Changed to 10 seconds
const SLOW_MOTION_COOLDOWN = 5000; // Cooldown remains 5 seconds
const NORMAL_TIME_SCALE = 1;
const SLOW_TIME_SCALE = 0.3;

let ballSpawnInterval;

function startBallSpawning() {
  // Clear any existing interval first
  if (ballSpawnInterval) {
    clearInterval(ballSpawnInterval);
  }
  
  // Start new spawn interval
  let isFromLeft = true;
  const spawnTime = 1000; // 1 second interval
  
  ballSpawnInterval = setInterval(() => {
    if (!isGameOver) {
      createBall(isFromLeft);
      isFromLeft = !isFromLeft;
    }
  }, spawnTime);
}

// Modified movement controls with delta time scaling
document.addEventListener('keydown', (e) => {
  if (isGameOver) return;
  
  // Scale force by delta time
  const baseMoveForce = 0.0004; // Reduced base force
  const moveForce = baseMoveForce * FIXED_DELTA_TIME;
  const parts = currentRagdoll.parts;
  
  if (e.code === 'KeyA' || e.code === 'KeyD') {
    const direction = e.code === 'KeyA' ? -1 : 1;
    const coreParts = [parts.head, parts.chest, parts.stomach];
    
    coreParts.forEach(part => {
      Body.applyForce(part, part.position, {
        x: moveForce * direction,
        y: 0
      });
    });
  }
  
  // Handle slow motion separately
  if (e.code === 'KeyS' && !slowMotionActive && slowMotionTimeLeft > 0) {
    slowMotionActive = true;
    engine.timing.timeScale = SLOW_TIME_SCALE;
    updateSlowMotionDisplay();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'KeyS' && slowMotionActive) { 
    slowMotionActive = false;
    engine.timing.timeScale = NORMAL_TIME_SCALE;
    updateSlowMotionDisplay();
  }
});

function updateSlowMotionDisplay() {
  const slowMotionBar = document.querySelector('.slow-motion-bar');
  const barFillPercent = (slowMotionTimeLeft / SLOW_MOTION_DURATION) * 100;
  slowMotionBar.style.width = `${barFillPercent}%`;
  
  if (slowMotionActive) {
    slowMotionBar.style.backgroundColor = '#3498db';
  } else if (slowMotionTimeLeft <= 0) {
    slowMotionBar.style.backgroundColor = '#e74c3c';
  } else {
    slowMotionBar.style.backgroundColor = '#2ecc71';
  }
}

// Modified game update loop
Events.on(engine, 'beforeUpdate', () => {
  const currentTime = performance.now();
  const deltaTime = Math.min(currentTime - lastUpdateTime, MAX_DELTA_TIME);
  lastUpdateTime = currentTime;

  // Scale time effects
  const timeScale = slowMotionActive ? SLOW_TIME_SCALE : NORMAL_TIME_SCALE;
  engine.timing.timeScale = timeScale;

  // Update slow motion with fixed time step
  if (slowMotionActive) {
    slowMotionTimeLeft -= deltaTime;
    if (slowMotionTimeLeft <= 0) {
      slowMotionActive = false;
      engine.timing.timeScale = NORMAL_TIME_SCALE;
      slowMotionTimeLeft = 0;
    }
  } else if (slowMotionTimeLeft < SLOW_MOTION_DURATION) {
    slowMotionTimeLeft = Math.min(
      SLOW_MOTION_DURATION,
      slowMotionTimeLeft + (deltaTime * 0.5)
    );
  }
  
  checkRagdollBounds();
  updateSlowMotionDisplay();
});

// Run engine with fixed time step
Events.on(runner, 'beforeUpdate', function(event) {
  engine.timing.timestamp += FIXED_DELTA_TIME;
  engine.timing.lastDelta = FIXED_DELTA_TIME;
});

Runner.run(runner, engine);
Render.run(render);

// Add ball cleanup to keep performance optimal
Events.on(engine, 'afterUpdate', () => {
  balls = balls.filter(ball => {
    const outOfBounds = ball.position.x < -200 || ball.position.x > render.options.width + 200;
    if (outOfBounds) {
      Composite.remove(engine.world, ball);
      return false;
    }
    return true;
  });
});

document.querySelector('.game-over').addEventListener('click', resetGame);

// Initialize health display
updateHealthDisplay();

function startGame() {
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('game-container').classList.remove('hidden');
  resetGame();
}

function showInstructions() {
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('instructions-screen').style.display = 'flex';
}

function backToMenu() {
  document.getElementById('instructions-screen').style.display = 'none';
  document.getElementById('title-screen').style.display = 'flex';
}

document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('show-instructions').addEventListener('click', showInstructions);
document.getElementById('back-to-menu').addEventListener('click', backToMenu);