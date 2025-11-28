import { state, handleKeyDown, handleKeyUp, movePaddle, moveBall, gameEvents } from './game.logic.js';

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

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${state.score}`, 10, 25);
}

// Main draw function
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPaddleTrail(); // Draw paddle trail before paddle itself
    drawPaddle();
    drawBallTrail(); // Draw ball trail before ball itself
    drawBall();
    drawScore();

    if (!state.gameStarted) {
        ctx.font = '30px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('Press Spacebar to Start', canvas.width / 2 - 150, canvas.height / 2);
    }

    if (state.gameOver) {
        ctx.font = '40px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    }

    if (state.showSpeedUpNotification) {
        ctx.font = '30px Arial';
        ctx.fillStyle = '#FFD700'; // Gold color for notification
        ctx.fillText('Speed Up!', canvas.width / 2 - 70, canvas.height / 2 + 50);
    }
}

// Game loop
function update() {
    if (state.gameOver) {
        draw();
        return;
    }

    movePaddle();

    if (state.gameStarted) {
        moveBall();
    }

    draw();
    requestAnimationFrame(update);
}

update();
loadSounds();


