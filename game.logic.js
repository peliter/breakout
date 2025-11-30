export const state = {
    score: 0,
    gameOver: false,
    screen: 'startScreen', // New: Controls which screen is active (startScreen, game, gameOver)
    gameMode: 'classic', // New: Stores the current game mode (classic, survival)
    rightPressed: false,
    leftPressed: false,
    paddle: {
        x: 400 - 50, // canvas.width / 2 - 50
        y: 600 - 20, // canvas.height - 20
        width: 100,
        height: 10,
        speed: 7
    },
    ball: {
        x: 400, // canvas.width / 2
        y: 600 - 30, // canvas.height - 30
        radius: 10,
        dx: 0,
        dy: 0
    },
    canvas: {
        width: 800,
        height: 600
    },
    // Survival Mode Feature
    bricks: [],
    paddleHitCount: 0,
    lives: 3,
    powerUps: [],
    // Dynamic Speed Feature
    baseBallSpeed: 2,
    speedIncreaseThreshold: 5, // Increase speed every 5 points
    speedIncreaseFactor: 0.2,   // Increase speed by 20%
    currentSpeedLevel: 0,
    showSpeedUpNotification: false,
    isPaused: false, // New: Game pause state
    // Visual Enhancements
    ballTrail: [],
    paddleTrail: [],
    maxTrailLength: 10, // Store last 10 positions for trail
    // Challenge Mode Features
    currentLevel: 0,
    challengeLevels: [], // To be populated with level definitions
    brickSwayDirection: 1, // 1 for right, -1 for left
    brickSwayOffset: 0,
    lastBrickMoveTime: 0,
    brickFallInterval: 60000, // Bricks fall every 60 seconds
    ballLaunched: false
};

// Event Dispatcher for sounds
const gameEvents = new EventTarget();
export { gameEvents };

export function handleKeyDown(e) {
    if (e.code === 'KeyP') {
        state.isPaused = !state.isPaused;
        return; // Don't process other keys if P is pressed
    }
    if (state.isPaused) {
        return; // Ignore other key presses if paused
    }

    if (e.code == 'Right' || e.code == 'ArrowRight') {
        state.rightPressed = true;
    } else if (e.code == 'Left' || e.code == 'ArrowLeft') {
        state.leftPressed = true;
    } else if (e.code == 'Space') {
        if (!state.ballLaunched) {
            state.ballLaunched = true;
        }
    }
}

export function handleKeyUp(e) {
    if (e.code == 'Right' || e.code == 'ArrowRight') {
        state.rightPressed = false;
    } else if (e.code == 'Left' || e.code == 'ArrowLeft') {
        state.leftPressed = false;
    }
}

export function movePaddle() {
    if (state.rightPressed && state.paddle.x < state.canvas.width - state.paddle.width) {
        state.paddle.x += state.paddle.speed;
    } else if (state.leftPressed && state.paddle.x > 0) {
        state.paddle.x -= state.paddle.speed;
    }
    // Store paddle trail position
    state.paddleTrail.push({ x: state.paddle.x + state.paddle.width / 2, y: state.paddle.y + state.paddle.height / 2 });
    if (state.paddleTrail.length > state.maxTrailLength) {
        state.paddleTrail.shift();
    }
}

export function updateBallSpeed() {
    const newSpeedLevel = Math.floor(state.score / state.speedIncreaseThreshold);
    if (newSpeedLevel > state.currentSpeedLevel) {
        state.currentSpeedLevel = newSpeedLevel;
        
        // Scale the current dx and dy directly to increase speed
        state.ball.dx *= (1 + state.speedIncreaseFactor);
        state.ball.dy *= (1 + state.speedIncreaseFactor);

        state.showSpeedUpNotification = true;
        setTimeout(() => {
            state.showSpeedUpNotification = false;
        }, 1000); // Show notification for 1 second
    }
}

export function spawnPowerUp(x, y) {
    const powerUpTypes = ['PADDLE_EXTEND', 'PADDLE_SHRINK', 'EXTRA_LIFE', 'BALL_SPEED_UP'];
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    const newPowerUp = {
        x: x,
        y: y,
        width: 15,
        height: 15,
        type: type,
        speed: 1.5
    };
    state.powerUps.push(newPowerUp);
}

export function activatePowerUp(type) {
    const originalWidth = 100; // Original paddle width
    const baseSpeed = state.baseBallSpeed * (1 + state.currentSpeedLevel * state.speedIncreaseFactor);

    switch (type) {
        case 'PADDLE_EXTEND':
            state.paddle.width = originalWidth * 1.5;
            setTimeout(() => {
                state.paddle.width = originalWidth;
            }, 10000); // Effect lasts 10 seconds
            break;
        case 'PADDLE_SHRINK':
            state.paddle.width = originalWidth * 0.5;
            setTimeout(() => {
                state.paddle.width = originalWidth;
            }, 10000); // Effect lasts 10 seconds
            break;
        case 'EXTRA_LIFE':
            state.lives++;
            break;
        case 'BALL_SPEED_UP':
            const speedMultiplier = 1.5;
            state.ball.dx *= speedMultiplier;
            state.ball.dy *= speedMultiplier;
            setTimeout(() => {
                state.ball.dx /= speedMultiplier;
                state.ball.dy /= speedMultiplier;
            }, 10000); // Effect lasts 10 seconds
            break;
    }
}

export function movePowerUps() {
    for (let i = state.powerUps.length - 1; i >= 0; i--) {
        const powerUp = state.powerUps[i];
        powerUp.y += powerUp.speed;

        // Collision with paddle
        if (
            powerUp.x < state.paddle.x + state.paddle.width &&
            powerUp.x + powerUp.width > state.paddle.x &&
            powerUp.y < state.paddle.y + state.paddle.height &&
            powerUp.y + powerUp.height > state.paddle.y
        ) {
            activatePowerUp(powerUp.type);
            state.powerUps.splice(i, 1); // Remove power-up from array
        }

        // Remove if it goes off-screen
        if (powerUp.y + powerUp.height > state.canvas.height) {
            state.powerUps.splice(i, 1);
        }
    }
}

export function spawnBrick() {
    const brickWidth = 75;
    const brickHeight = 20;
    let hp;
    const rand = Math.random();

    if (rand < 0.45) {
        hp = 1; // 45% chance
    } else if (rand < 0.80) { // 0.45 + 0.35
        hp = 2; // 35% chance
    } else {
        hp = 3; // 20% chance
    }

    let color;
    switch (hp) {
        case 1: color = '#A0A0A0'; break; // Grey
        case 2: color = '#D4A017'; break; // Gold
        case 3: color = '#B80F0A'; break; // Red
    }

    const newBrick = {
        x: Math.random() * (state.canvas.width * 0.6) + (state.canvas.width * 0.2), // Spawn in middle 60%
        y: Math.random() * (state.canvas.height * 0.4) + (state.canvas.height * 0.1), // Spawn in upper 40%
        width: brickWidth,
        height: brickHeight,
        hp: hp,
        scoreValue: hp,
        status: 1,
        color: color
    };

    // Very simple overlap check, can be improved
    for (const brick of state.bricks) {
        if (
            newBrick.x < brick.x + brick.width &&
            newBrick.x + newBrick.width > brick.x &&
            newBrick.y < brick.y + brick.height &&
            newBrick.y + newBrick.height > brick.y
        ) {
            // Overlap detected, try spawning again in the next frame to avoid infinite loops
            return; 
        }
    }

    state.bricks.push(newBrick);
}

export function moveBall() {
    if (!state.ballLaunched) {
        state.ball.x = state.paddle.x + state.paddle.width / 2;
        return;
    }

    // Brick collision detection
    for (const brick of state.bricks) {
        if (brick.status === 1) {
            if (
                state.ball.x > brick.x &&
                state.ball.x < brick.x + brick.width &&
                state.ball.y > brick.y &&
                state.ball.y < brick.y + brick.height
            ) {
                state.ball.dy *= -1;
                brick.hp--;
                state.score += brick.scoreValue; // Increase score by brick's value
                updateBallSpeed(); // Check and update speed

                if (brick.hp <= 0) {
                    brick.status = 0;
                    // Power-ups only spawn from 3-hit bricks
                    if (brick.scoreValue === 3) { // 100% chance from 3-hp bricks
                        spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }
                    if (state.gameMode === 'challenge') {
                        const remainingBricks = state.bricks.filter(b => b.status === 1);
                        if (remainingBricks.length === 0) {
                            // Level complete!
                            state.currentLevel++;
                            if (state.currentLevel > 10) {
                                state.screen = 'gameOver'; // Or 'gameWon' screen
                                // Potentially add a game won screen here
                            } else {
                                // Load next level
                                resetBallAndPaddle();
                                startChallengeMode();
                            }
                        }
                    }
                } else {
                    // Update color based on remaining HP
                    switch (brick.hp) {
                        case 1: brick.color = '#A0A0A0'; break;
                        case 2: brick.color = '#D4A017'; break;
                        case 3: brick.color = '#B80F0A'; break;
                        case 4: brick.color = '#4B0082'; break; // Indigo for 4HP
                    }
                }
                // We don't break here, allowing the ball to hit multiple bricks in one frame
            }
        }
    }

    // Handle brick movement in challenge mode
    if (state.gameMode === 'challenge') {
        const now = Date.now();
        // Move bricks down every 60 seconds
        if (now - state.lastBrickMoveTime > state.brickFallInterval) {
            state.bricks.forEach(brick => {
                if (brick.status === 1) {
                    brick.y += brick.height + 5; // Move down by brick height + padding
                    // Check if bricks hit the paddle area - game over
                    if (brick.y + brick.height > state.paddle.y) {
                        state.screen = 'gameOver';
                    }
                }
            });
            state.lastBrickMoveTime = now;
        }

        // Sway bricks left and right
        state.brickSwayOffset += state.brickSwayDirection * 0.1; // Small sway increment
        if (state.brickSwayOffset > 5 || state.brickSwayOffset < -5) { // Sway limit
            state.brickSwayDirection *= -1; // Reverse direction
        }
        state.bricks.forEach(brick => {
            if (brick.status === 1) {
                brick.x = brick.initialX + state.brickSwayOffset;
            }
        });
    }

    state.ball.x += state.ball.dx;
    state.ball.y += state.ball.dy;


    // Store ball trail position
    state.ballTrail.push({ x: state.ball.x, y: state.ball.y });
    if (state.ballTrail.length > state.maxTrailLength) {
        state.ballTrail.shift();
    }
    
    // Wall collision (left/right)
    if (state.ball.x + state.ball.radius > state.canvas.width || state.ball.x - state.ball.radius < 0) {
        state.ball.dx *= -1;
        gameEvents.dispatchEvent(new CustomEvent('wallBounce'));
    }

    // Wall collision (top)
    if (state.ball.y - state.ball.radius < 0) {
        state.ball.dy *= -1;
        gameEvents.dispatchEvent(new CustomEvent('wallBounce'));
    }

    // Game over
    if (state.ball.y + state.ball.radius > state.canvas.height) {
        state.lives--;
        if (state.lives <= 0) {
            state.screen = 'gameOver';
        } else {
            // Reset ball to starting position
            state.ball.x = state.canvas.width / 2;
            state.ball.y = state.canvas.height - 30;
            state.ball.dx = state.baseBallSpeed;
            state.ball.dy = -state.baseBallSpeed;
            // Also reset paddle position
            state.paddle.x = state.canvas.width / 2 - state.paddle.width / 2;
        }
    }

    // Paddle collision
    if (
        state.ball.x + state.ball.radius > state.paddle.x &&
        state.ball.x - state.ball.radius < state.paddle.x + state.paddle.width &&
        state.ball.y + state.ball.radius > state.paddle.y &&
        state.ball.y - state.ball.radius < state.paddle.y + state.paddle.height
    ) {
        // Get the ball's speed before collision
        const speed = Math.sqrt(state.ball.dx * state.ball.dx + state.ball.dy * state.ball.dy);

        // Invert vertical velocity
        state.ball.dy = -state.ball.dy;

        // Calculate where the ball hit the paddle (-1 to 1)
        const collidePoint = (state.ball.x - (state.paddle.x + state.paddle.width / 2)) / (state.paddle.width / 2);

        // Add horizontal influence based on the collision point
        // The '2' is a spin factor, can be adjusted for more/less spin
        state.ball.dx += collidePoint * 2;

        // Normalize the new velocity vector to maintain the original speed
        const currentSpeed = Math.sqrt(state.ball.dx * state.ball.dx + state.ball.dy * state.ball.dy);
        state.ball.dx = (state.ball.dx / currentSpeed) * speed;
        state.ball.dy = (state.ball.dy / currentSpeed) * speed;
        
        // Move ball slightly to prevent getting stuck
        state.ball.y = state.paddle.y - state.ball.radius;

        if (state.gameMode === 'survival') {
            state.paddleHitCount++;
            if (state.paddleHitCount >= 2) {
                spawnBrick();
                state.paddleHitCount = 0;
            }
        } else {
            // In modes other than survival, increment score on paddle hit
            state.score++;
            updateBallSpeed(); // Check and update speed
        }
        
        gameEvents.dispatchEvent(new CustomEvent('paddleHit'));
    }
}

export function startGame(mode) {
    state.gameMode = mode;
    state.screen = 'game';
    state.score = 0;
    state.gameOver = false;
    state.paddle.x = state.canvas.width / 2 - state.paddle.width / 2;
    state.ball.x = state.canvas.width / 2;
    state.ball.y = state.canvas.height - 30;
    state.ball.dx = state.baseBallSpeed;
    state.ball.dy = -state.baseBallSpeed;
    state.currentSpeedLevel = 0;
    state.showSpeedUpNotification = false;
    state.ballTrail = [];
    state.paddleTrail = [];
    state.bricks = []; // Clear bricks
    state.powerUps = []; // Clear power-ups
    state.paddleHitCount = 0; // Reset paddle hit count
    state.ballLaunched = false;

    if (mode === 'challenge') {
        state.currentLevel = 1; // Start from level 1
        startChallengeMode();
    }
}

export function reset() {
    state.score = 0;
    state.gameOver = false; // Reset game over status
    state.screen = 'startScreen'; // Go back to start screen
    state.rightPressed = false;
    state.leftPressed = false;
    state.paddle.x = state.canvas.width / 2 - state.paddle.width / 2; // Center paddle
    state.ball.x = state.canvas.width / 2;
    state.ball.y = state.canvas.height - 30;
    state.ball.dx = 0; // Ball stationary until game starts
    state.ball.dy = 0; // Ball stationary until game starts
    state.currentSpeedLevel = 0; // Reset speed level
    state.showSpeedUpNotification = false; // Reset notification
    state.ballTrail = []; // Clear ball trail
    state.paddleTrail = []; // Clear paddle trail
    state.bricks = []; // Clear bricks
    state.powerUps = []; // Clear power-ups
    state.paddleHitCount = 0;
    state.currentLevel = 0;
    state.brickSwayDirection = 1;
    state.brickSwayOffset = 0;
    state.lastBrickMoveTime = 0;
}


export function resetBallAndPaddle() {
    state.ball.x = state.canvas.width / 2;
    state.ball.y = state.canvas.height - 30;
    state.ball.dx = state.baseBallSpeed;
    state.ball.dy = -state.baseBallSpeed;
    state.paddle.x = state.canvas.width / 2 - state.paddle.width / 2;
}

export function startChallengeMode() {
    state.bricks = []; // Clear any existing bricks
    state.bricks = JSON.parse(JSON.stringify(state.challengeLevels[state.currentLevel - 1])); // Load bricks for current level
    state.lastBrickMoveTime = Date.now(); // Initialize timer for brick movement
    state.brickSwayOffset = 0;
    state.brickSwayDirection = 1;
}

// Challenge Mode Definitions
function createChallengeBrickLayout(level) {
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    const bricks = [];
    const cols = Math.floor((state.canvas.width - 2 * brickOffsetLeft) / (brickWidth + brickPadding));
    const rows = 5;

    let layout = [];
    let hpDistribution = [];

    switch (level) {
        case 1:
            layout = [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
            ];
            hpDistribution = [1]; // All bricks are 1 HP
            break;
        case 2:
            layout = [
                [0,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1],
                [1,1,0,0,0,0,1,1],
                [1,1,1,1,1,1,1,1],
                [0,1,1,1,1,1,1,0],
            ];
            hpDistribution = [1,2]; // Mixed 1 and 2 HP
            break;
        case 3:
            layout = [
                [1,0,1,0,1,0,1,0],
                [0,1,0,1,0,1,0,1],
                [1,0,1,0,1,0,1,0],
                [0,1,0,1,0,1,0,1],
                [1,0,1,0,1,0,1,0],
            ];
            hpDistribution = [2]; // All bricks are 2 HP
            break;
        case 4:
            layout = [
                [1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,1],
                [1,0,1,1,1,1,0,1],
                [1,0,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1],
            ];
            hpDistribution = [2,3]; // Mixed 2 and 3 HP
            break;
        case 5:
            layout = [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
            ];
            hpDistribution = [3]; // All bricks are 3 HP
            break;
        case 6: // More complex pattern
            layout = [
                [1,0,0,1,1,0,0,1],
                [0,1,0,1,1,0,1,0],
                [0,0,1,1,1,1,0,0],
                [0,1,0,1,1,0,1,0],
                [1,0,0,1,1,0,0,1],
            ];
            hpDistribution = [1,2,3]; // Mixed HP
            break;
        case 7: // Pyramid
            layout = [
                [0,0,0,1,1,0,0,0],
                [0,0,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
            ];
            hpDistribution = [2,3]; // Tougher pyramid
            break;
        case 8: // Diagonal pattern
            layout = [
                [1,0,0,0,0,0,0,0],
                [0,1,0,0,0,0,0,0],
                [0,0,1,0,0,0,0,0],
                [0,0,0,1,0,0,0,0],
                [0,0,0,0,1,1,1,1],
            ];
            hpDistribution = [3]; // All very strong
            break;
        case 9: // Checkerboard with high HP
            layout = [
                [1,0,1,0,1,0,1,0],
                [0,1,0,1,0,1,0,1],
                [1,0,1,0,1,0,1,0],
                [0,1,0,1,0,1,0,1],
                [1,0,1,0,1,0,1,0],
            ];
            hpDistribution = [3,3,3,3,3,3,3,3]; // All 3 HP
            break;
        case 10: // Full block of toughest bricks
            layout = [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
            ];
            hpDistribution = [4]; // Even tougher bricks (need to handle 4HP in spawnBrick)
            break;
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (layout[r] && layout[r][c] === 1) {
                let hp = hpDistribution[Math.floor(Math.random() * hpDistribution.length)];
                // For level 10, ensure 4 HP
                if (level === 10) hp = 4;

                let color;
                switch (hp) {
                    case 1: color = '#A0A0A0'; break; // Grey
                    case 2: color = '#D4A017'; break; // Gold
                    case 3: color = '#B80F0A'; break; // Red
                    case 4: color = '#4B0082'; break; // Indigo for 4HP
                    default: color = '#A0A0A0'; // Default to grey
                }

                bricks.push({
                    x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                    y: r * (brickHeight + brickPadding) + brickOffsetTop,
                    width: brickWidth,
                    height: brickHeight,
                    hp: hp,
                    scoreValue: hp,
                    status: 1,
                    color: color,
                    initialX: c * (brickWidth + brickPadding) + brickOffsetLeft // Store initial X for swaying
                });
            }
        }
    }
    return bricks;
}

// Populate challengeLevels
for (let i = 1; i <= 10; i++) {
    state.challengeLevels.push(createChallengeBrickLayout(i));
}