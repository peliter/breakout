import { state, handleKeyDown, handleKeyUp, movePaddle, moveBall, startGame, reset, movePowerUps, gameEvents, startChallengeMode, resetBallAndPaddle } from './game.logic.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Sound Manager (Placeholder)
const soundFx = {
    paddleHit: new Audio(),
    wallBounce: new Audio()
};

function loadSounds() {
    console.log("Loading sounds...");
}

function playSound(sound) {
    if (sound && sound.play) {
        sound.currentTime = 0;
        sound.play().catch(e => console.error("Error playing sound:", e));
    }
}

// Gamepad Polling
function pollGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (gamepads.length === 0) {
        return;
    }

    // Only consider the first connected gamepad for simplicity
    const gp = gamepads[0];

    if (gp) {
        // Reset keyboard state to avoid conflicts
        state.leftPressed = false;
        state.rightPressed = false;

        // Check D-pad (buttons 14 and 15 for left and right respectively on standard gamepads)
        if (gp.buttons[14] && gp.buttons[14].pressed) {
            state.leftPressed = true;
        }
        if (gp.buttons[15] && gp.buttons[15].pressed) {
            state.rightPressed = true;
        }

        // Check left analog stick (axis 0 for horizontal movement)
        // A threshold is used to account for minor stick drift
        const horizontalAxis = gp.axes[0];
        if (horizontalAxis < -0.5) { // Left
            state.leftPressed = true;
        } else if (horizontalAxis > 0.5) { // Right
            state.rightPressed = true;
        }

        // Check A button (button 0) to launch the ball
        if (gp.buttons[0] && gp.buttons[0].pressed) {
            if (!state.ballLaunched) {
                state.ballLaunched = true;
            }
        }
    }
}

// Event Listeners
document.addEventListener('keydown', handleKeyDown, false);
document.addEventListener('keyup', handleKeyUp, false);
canvas.addEventListener('click', handleCanvasClick, false);

gameEvents.addEventListener('paddleHit', () => playSound(soundFx.paddleHit));
gameEvents.addEventListener('wallBounce', () => playSound(soundFx.wallBounce));

// Click Handler
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (state.screen === 'game') {
        const buttonWidth = 40;
        const buttonHeight = 40;
        const padding = 10;
        const btnX = state.canvas.width - buttonWidth - padding;
        const btnY = state.canvas.height - buttonHeight - padding;

        // Check if click is on the pause button
        if (mouseX >= btnX && mouseX <= btnX + buttonWidth &&
            mouseY >= btnY && mouseY <= btnY + buttonHeight) {
            state.isPaused = !state.isPaused;
            return; // Handle button click, do not process other game clicks
        }
    }

    if (state.screen === 'startScreen') {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const btnWidth = 200;
        const btnHeight = 50;
        const classicBtnX = state.canvas.width / 2 - 100;
        const classicBtnY = state.canvas.height / 2 + 20;
        const survivalBtnY = classicBtnY + btnHeight + 20;
        const challengeBtnY = survivalBtnY + btnHeight + 20;

        if (mouseY > classicBtnY && mouseY < classicBtnY + btnHeight && mouseX > classicBtnX && mouseX < classicBtnX + btnWidth) {
            startGame('classic');
        } else if (mouseY > survivalBtnY && mouseY < survivalBtnY + btnHeight && mouseX > classicBtnX && mouseX < classicBtnX + btnWidth) {
            startGame('survival');
        } else if (mouseY > challengeBtnY && mouseY < challengeBtnY + btnHeight && mouseX > classicBtnX && mouseX < classicBtnX + btnWidth) {
            startGame('challenge'); // Start challenge mode
        }
    } else if (state.screen === 'gameOver') {
        reset();
    }
}

// --- Drawing Functions ---

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBallTrail() {
    for (let i = 0; i < state.ballTrail.length; i++) {
        const trail = state.ballTrail[i];
        const opacity = (i / state.ballTrail.length) * 0.5;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, state.ball.radius * (i / state.ballTrail.length), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 149, 221, ${opacity})`;
        ctx.fill();
        ctx.closePath();
    }
}

function drawPaddleTrail() {
    for (let i = 0; i < state.paddleTrail.length; i++) {
        const trail = state.paddleTrail[i];
        const opacity = (i / state.paddleTrail.length) * 0.3;
        ctx.beginPath();
        ctx.rect(trail.x - state.paddle.width / 2, trail.y - state.paddle.height / 2, state.paddle.width * (i / state.paddleTrail.length), state.paddle.height * (i / state.paddleTrail.length));
        ctx.fillStyle = `rgba(0, 149, 221, ${opacity})`;
        ctx.fill();
        ctx.closePath();
    }
}

function drawPowerUps() {
    for (const powerUp of state.powerUps) {
        ctx.beginPath();
        ctx.rect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        let color = '#FFFFFF';
        switch(powerUp.type) {
            case 'PADDLE_EXTEND': color = '#00FF00'; break;
            case 'PADDLE_SHRINK': color = '#FFA500'; break;
            case 'EXTRA_LIFE': color = '#FFC0CB'; break;
            case 'BALL_SPEED_UP': color = '#ADD8E6'; break;
        }
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }
}

function drawBricks() {
    for (const brick of state.bricks) {
        if (brick.status === 1) {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.width, brick.height);
            ctx.fillStyle = brick.color;
            ctx.fill();
            ctx.closePath();
        }
    }
}

function drawLives() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Lives: ${state.lives}`, state.canvas.width - 85, 25);
}

function drawPauseButton() {
    const buttonWidth = 40;
    const buttonHeight = 40;
    const padding = 10;
    const btnX = state.canvas.width - buttonWidth - padding;
    const btnY = state.canvas.height - buttonHeight - padding;

    // Draw button background
    ctx.beginPath();
    ctx.rect(btnX, btnY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#0056b3'; // Darker blue for button
    ctx.fill();
    ctx.closePath();

    // Draw pause/play symbol
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; // Center text vertically
    const symbol = state.isPaused ? '▶' : '||';
    ctx.fillText(symbol, btnX + buttonWidth / 2, btnY + buttonHeight / 2);
    ctx.textAlign = 'left'; // Reset for other text
    ctx.textBaseline = 'alphabetic'; // Reset for other text
}

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${state.score}`, 10, 25);
}

function drawStartScreen() {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('BREAKOUT GAME', state.canvas.width / 2, state.canvas.height / 2 - 80);

    const btnWidth = 200;
    const btnHeight = 50;
    const classicBtnX = state.canvas.width / 2 - 100;
    const classicBtnY = state.canvas.height / 2 + 20;
    const survivalBtnY = classicBtnY + btnHeight + 20;
    const challengeBtnY = survivalBtnY + btnHeight + 20;

    ctx.fillStyle = '#0095DD';
    ctx.fillRect(classicBtnX, classicBtnY, btnWidth, btnHeight);
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Classic Mode', state.canvas.width / 2, classicBtnY + 35);
    
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(classicBtnX, survivalBtnY, btnWidth, btnHeight);
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Survival Mode', state.canvas.width / 2, survivalBtnY + 35);

    ctx.fillStyle = '#8A2BE2'; // A new color for Challenge Mode
    ctx.fillRect(classicBtnX, challengeBtnY, btnWidth, btnHeight);
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Challenge Mode', state.canvas.width / 2, challengeBtnY + 35);

    ctx.textAlign = 'left';
}

// --- Main Game Loop ---

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.screen === 'game') {
        drawBricks();
        drawPowerUps();
        drawPaddleTrail();
        drawPaddle();
        drawBallTrail();
        drawBall();
        drawScore();
        drawLives();
        if (state.gameMode === 'challenge') {
            ctx.font = '20px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(`Level: ${state.currentLevel}`, state.canvas.width / 2 - 40, 25);
        }
        drawPauseButton(); // Call the new function

        if (state.isPaused) {
            ctx.font = '48px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', state.canvas.width / 2, state.canvas.height / 2);
            ctx.textAlign = 'left';
        }

        if (state.showSpeedUpNotification) {
            ctx.font = '30px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.fillText('Speed Up!', state.canvas.width / 2, state.canvas.height / 2 + 50);
            ctx.textAlign = 'left';
        }
    } else if (state.screen === 'startScreen') {
        drawStartScreen();
    } else if (state.screen === 'gameOver') {
        ctx.font = '40px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', state.canvas.width / 2, state.canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Click to Continue', state.canvas.width / 2, state.canvas.height / 2 + 40);
        ctx.textAlign = 'left';
    }
}

function update() {
    if (state.screen === 'game' && !state.isPaused) {
        pollGamepads(); // New: Poll gamepad input
        movePaddle();
        movePowerUps();
        moveBall();
    }
    draw();
    requestAnimationFrame(update);
}

// --- Initialization ---
loadSounds();
update();
