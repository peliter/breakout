import { state, handleKeyDown, handleKeyUp, movePaddle, moveBall, startGame, gameEvents } from './game.logic.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// ... (rest of the file is unchanged until handleCanvasClick)
// ...
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

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${state.score}`, 10, 25);
}

// Function to draw the start screen with mode selection buttons
function drawStartScreen() {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('BREAKOUT GAME', state.canvas.width / 2, state.canvas.height / 2 - 80);

    // Draw Classic Mode Button
    const classicBtnX = state.canvas.width / 2 - 100;
    const classicBtnY = state.canvas.height / 2 + 20;
    const btnWidth = 200;
    const btnHeight = 50;

    ctx.fillStyle = '#0095DD'; // Button background
    ctx.fillRect(classicBtnX, classicBtnY, btnWidth, btnHeight);
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff'; // Button text
    ctx.fillText('Classic Mode', state.canvas.width / 2, classicBtnY + 35);

    // Draw Survival Mode Button
    const survivalBtnX = state.canvas.width / 2 - 100;
    const survivalBtnY = classicBtnY + btnHeight + 20; // Below Classic button
    
    ctx.fillStyle = '#FFA500'; // Different color for survival
    ctx.fillRect(survivalBtnX, survivalBtnY, btnWidth, btnHeight);
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Survival Mode', state.canvas.width / 2, survivalBtnY + 35);

    ctx.textAlign = 'left'; // Reset text alignment
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

    if (state.screen === 'startScreen') {
        drawStartScreen();
    } else if (state.screen === 'gameOver') {
        ctx.font = '40px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', state.canvas.width / 2, state.canvas.height / 2);
        ctx.textAlign = 'left'; // Reset text alignment
    }

    if (state.showSpeedUpNotification) {
        ctx.font = '30px Arial';
        ctx.fillStyle = '#FFD700'; // Gold color for notification
        ctx.textAlign = 'center'; // Center speed up notification
        ctx.fillText('Speed Up!', state.canvas.width / 2, state.canvas.height / 2 + 50);
        ctx.textAlign = 'left'; // Reset text alignment
    }
}

// Game loop
function update() {
    // If game over, just draw once and return, no further game logic updates
    if (state.screen === 'gameOver') {
        draw();
        return;
    }

    // Only update game logic if we are in the 'game' screen
    if (state.screen === 'game') {
        movePaddle();
        moveBall();
    }
    
    draw(); // Always draw to render the current screen (startScreen or game)
    requestAnimationFrame(update);
}

update();
loadSounds();


