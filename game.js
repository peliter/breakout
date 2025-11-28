import { state, handleKeyDown, handleKeyUp, movePaddle, moveBall, startGame, reset, movePowerUps, gameEvents } from './game.logic.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Sound Manager (Placeholder)
const soundFx = {
    paddleHit: new Audio(), // Placeholder for paddle hit sound
    wallBounce: new Audio() // Placeholder for wall bounce sound
};

function loadSounds() {
    // In a real scenario, you would load actual audio files here
    // For now, these are just Audio objects ready to be played (silently if no source)
    console.log("Loading sounds...");
    // Example: soundFx.paddleHit.src = 'sounds/paddle_hit.wav';
    // Example: soundFx.wallBounce.src = 'sounds/wall_bounce.wav';
}

function playSound(sound) {
    if (sound && sound.play) {
        sound.currentTime = 0; // Rewind to start if already playing
        sound.play().catch(e => console.error("Error playing sound:", e));
    }
}

// Event Listeners
document.addEventListener('keydown', handleKeyDown, false);
document.addEventListener('keyup', handleKeyUp, false);

gameEvents.addEventListener('paddleHit', () => playSound(soundFx.paddleHit));
gameEvents.addEventListener('wallBounce', () => playSound(soundFx.wallBounce));

function handleCanvasClick(event) {
    if (state.screen === 'startScreen') {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Classic Mode Button area
        const classicBtnX = state.canvas.width / 2 - 100;
        const classicBtnY = state.canvas.height / 2 + 20;
        const btnWidth = 200;
        const btnHeight = 50;

        if (
            mouseX > classicBtnX &&
            mouseX < classicBtnX + btnWidth &&
            mouseY > classicBtnY &&
            mouseY < classicBtnY + btnHeight
        ) {
            startGame('classic');
        }

        // Survival Mode Button area
        const survivalBtnX = state.canvas.width / 2 - 100;
        const survivalBtnY = classicBtnY + btnHeight + 20;

        if (
            mouseX > survivalBtnX &&
            mouseX < survivalBtnX + btnWidth &&
            mouseY > survivalBtnY &&
            mouseY < survivalBtnY + btnHeight
        ) {
            startGame('survival');
        }
    } else if (state.screen === 'gameOver') {
        reset(); // Go back to start screen on click
    }
}

canvas.addEventListener('click', handleCanvasClick, false);

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
        const opacity = (i / state.ballTrail.length) * 0.5; // Fades out
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, state.ball.radius * (i / state.ballTrail.length), 0, Math.PI * 2); // Smaller and fainter
        ctx.fillStyle = `rgba(0, 149, 221, ${opacity})`; // Blue, fading
        ctx.fill();
        ctx.closePath();
    }
}

function drawPaddleTrail() {
    for (let i = 0; i < state.paddleTrail.length; i++) {
        const trail = state.paddleTrail[i];
        const opacity = (i / state.paddleTrail.length) * 0.3; // Fades out, less opaque than ball
        ctx.beginPath();
        ctx.rect(trail.x - state.paddle.width / 2, trail.y - state.paddle.height / 2, state.paddle.width * (i / state.paddleTrail.length), state.paddle.height * (i / state.paddleTrail.length)); // Adjust to center, scale
        ctx.fillStyle = `rgba(0, 149, 221, ${opacity})`; // Blue, fading
        ctx.fill();
        ctx.closePath();
    }
}

function drawPowerUps() {
    for (const powerUp of state.powerUps) {
        ctx.beginPath();
        ctx.rect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        
        let color = '#FFFFFF'; // Default to white
        switch(powerUp.type) {
            case 'PADDLE_EXTEND':
                color = '#00FF00'; // Green
                break;
            case 'PADDLE_SHRINK':
                color = '#FFA500'; // Orange
                break;
            case 'EXTRA_LIFE':
                color = '#FFC0CB'; // Pink
                break;

            case 'BALL_SPEED_UP':
                color = '#ADD8E6'; // Light Blue
                break;
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
}function drawLives() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Lives: ${state.lives}`, state.canvas.width - 85, 25);
}

function drawScore() {
    ctx.font = '20px Arial';
// ... (rest of file is unchanged until draw function)
// ...
    if (state.screen === 'game') {
        drawBricks();
        drawPowerUps();
        drawPaddleTrail();
        drawPaddle();
        drawBallTrail();
        drawBall();
        drawScore();
        drawLives();

        if (state.showSpeedUpNotification) {
            ctx.font = '30px Arial';
            ctx.fillStyle = '#FFD700'; // Gold color for notification
            ctx.textAlign = 'center';
            ctx.fillText('Speed Up!', state.canvas.width / 2, state.canvas.height / 2 + 50);
            ctx.textAlign = 'left'; // Reset text alignment
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
        ctx.textAlign = 'left'; // Reset text alignment
    }
}

// Game loop
function update() {
    // Only update game logic if we are in the 'game' screen
    if (state.screen === 'game') {
        movePaddle();
        movePowerUps();
        moveBall();
    }
    
    draw(); // Always draw to render the current screen
    requestAnimationFrame(update);
}

update();
loadSounds();


