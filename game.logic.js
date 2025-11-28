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
    // Dynamic Speed Feature
    baseBallSpeed: 2,
    speedIncreaseThreshold: 10, // Increase speed every 10 points
    speedIncreaseFactor: 0.2,   // Increase speed by 20%
    currentSpeedLevel: 0,
    showSpeedUpNotification: false,
    // Visual Enhancements
    ballTrail: [],
    paddleTrail: [],
    maxTrailLength: 10 // Store last 10 positions for trail
};

// Event Dispatcher for sounds
const gameEvents = new EventTarget();
export { gameEvents };

export function handleKeyDown(e) {
    if (e.code == 'Right' || e.code == 'ArrowRight') {
        state.rightPressed = true;
    } else if (e.code == 'Left' || e.code == 'ArrowLeft') {
        state.leftPressed = true;
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

export function spawnBrick() {
    const brickWidth = 75;
    const brickHeight = 20;

    const hp = Math.floor(Math.random() * 3) + 1; // 1 to 3 HP
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

                if (brick.hp <= 0) {
                    brick.status = 0;
                } else {
                    // Update color based on remaining HP
                    switch (brick.hp) {
                        case 1: brick.color = '#A0A0A0'; break;
                        case 2: brick.color = '#D4A017'; break;
                    }
                }
                // We don't break here, allowing the ball to hit multiple bricks in one frame
            }
        }
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
        state.screen = 'gameOver';
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
        }
        
        updateBallSpeed(); // Check and update speed
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
    // Future mode-specific logic can be added here
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
}

