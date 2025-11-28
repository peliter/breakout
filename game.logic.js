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

export function moveBall() {
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
        state.gameOver = true;
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

        state.score++;
        updateBallSpeed(); // Check and update speed when score increases
        gameEvents.dispatchEvent(new CustomEvent('paddleHit'));
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
}

