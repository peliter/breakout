import { state, handleKeyDown, handleKeyUp, movePaddle, moveBall, reset, updateBallSpeed, gameEvents } from './game.logic.js';

describe('Game Logic', () => {
    beforeEach(() => {
        reset();
    });

    test('should handle key down and up for right arrow', () => {
        handleKeyDown({ code: 'ArrowRight' });
        expect(state.rightPressed).toBe(true);
        handleKeyUp({ code: 'ArrowRight' });
        expect(state.rightPressed).toBe(false);
    });

    test('should handle key down and up for left arrow', () => {
        handleKeyDown({ code: 'ArrowLeft' });
        expect(state.leftPressed).toBe(true);
        handleKeyUp({ code: 'ArrowLeft' });
        expect(state.leftPressed).toBe(false);
    });

    test('should start game on spacebar press', () => {
        handleKeyDown({ code: 'Space' });
        expect(state.gameStarted).toBe(true);
        expect(state.ball.dx).not.toBe(0);
        expect(state.ball.dy).not.toBe(0);
    });

    test('should move paddle right', () => {
        const initialX = state.paddle.x;
        handleKeyDown({ code: 'ArrowRight' });
        movePaddle();
        expect(state.paddle.x).toBe(initialX + state.paddle.speed);
    });

    test('should move paddle left', () => {
        const initialX = state.paddle.x;
        handleKeyDown({ code: 'ArrowLeft' });
        movePaddle();
        expect(state.paddle.x).toBe(initialX - state.paddle.speed);
    });

    test('should move ball', () => {
        handleKeyDown({ code: 'Space' }); // Start the game
        const initialX = state.ball.x;
        const initialY = state.ball.y;
        moveBall();
        expect(state.ball.x).toBe(initialX + state.ball.dx);
        expect(state.ball.y).toBe(initialY + state.ball.dy);
    });

    test('should handle ball collision with top wall', () => {
        handleKeyDown({ code: 'Space' });
        state.ball.y = state.ball.radius;
        state.ball.dy = -2;
        moveBall();
        expect(state.ball.dy).toBe(2);
    });

    test('should handle ball collision with paddle and increment score', () => {
        handleKeyDown({ code: 'Space' });
        state.ball.x = state.paddle.x + state.paddle.width / 2;
        state.ball.y = state.paddle.y - state.ball.radius;
        state.ball.dy = 2;
        moveBall();
        expect(state.ball.dy).toBe(-2);
        expect(state.score).toBe(1);
    });

    test('should end game when ball goes out of bounds', () => {
        handleKeyDown({ code: 'Space' });
        state.ball.y = state.canvas.height + state.ball.radius;
        moveBall();
        expect(state.gameOver).toBe(true);
    });

    test('should reset the game state', () => {
        handleKeyDown({ code: 'Space' });
        state.score = 10;
        state.ballTrail.push({ x: 1, y: 1 }); // Populate for testing reset
        state.paddleTrail.push({ x: 1, y: 1 }); // Populate for testing reset
        reset();
        expect(state.score).toBe(0);
        expect(state.gameStarted).toBe(false);
        expect(state.currentSpeedLevel).toBe(0);
        expect(state.showSpeedUpNotification).toBe(false);
        expect(state.ballTrail).toEqual([]);
        expect(state.paddleTrail).toEqual([]);
    });

    test('should populate ballTrail with recent positions', () => {
        handleKeyDown({ code: 'Space' }); // Start game to set ball dx/dy
        const initialBallX = state.ball.x;
        const initialBallY = state.ball.y;
        state.ballTrail = []; // Ensure it's empty to start

        // Move ball multiple times
        for (let i = 0; i < state.maxTrailLength + 5; i++) {
            moveBall();
        }

        expect(state.ballTrail.length).toBe(state.maxTrailLength);
        // Ensure the last element is the current ball position (or very close)
        expect(state.ballTrail[state.maxTrailLength - 1].x).toBeCloseTo(state.ball.x);
        expect(state.ballTrail[state.maxTrailLength - 1].y).toBeCloseTo(state.ball.y);
    });

    test('should populate paddleTrail with recent positions', () => {
        state.paddleTrail = []; // Ensure it's empty to start
        state.rightPressed = true; // Simulate paddle movement

        // Move paddle multiple times
        for (let i = 0; i < state.maxTrailLength + 5; i++) {
            movePaddle();
        }

        expect(state.paddleTrail.length).toBe(state.maxTrailLength);
        // Ensure the last element is the current paddle position (or very close)
        // Note: paddleTrail stores center, paddle.x is top-left
        expect(state.paddleTrail[state.maxTrailLength - 1].x).toBeCloseTo(state.paddle.x + state.paddle.width / 2);
        expect(state.paddleTrail[state.maxTrailLength - 1].y).toBeCloseTo(state.paddle.y + state.paddle.height / 2);
    });

    test('should dispatch paddleHit event on paddle collision', () => {
        const mockListener = jest.fn();
        gameEvents.addEventListener('paddleHit', mockListener);

        handleKeyDown({ code: 'Space' });
        state.ball.x = state.paddle.x + state.paddle.width / 2;
        state.ball.y = state.paddle.y - state.ball.radius;
        state.ball.dy = 2;
        moveBall();

        expect(mockListener).toHaveBeenCalledTimes(1);
        gameEvents.removeEventListener('paddleHit', mockListener);
    });

    test('should dispatch wallBounce event on wall collision', () => {
        const mockListener = jest.fn();
        gameEvents.addEventListener('wallBounce', mockListener);

        handleKeyDown({ code: 'Space' });
        state.ball.x = state.canvas.width - state.ball.radius; // Ball at right wall
        state.ball.dx = 2; // Moving right
        state.ball.y = state.canvas.height / 2; // Middle of screen
        moveBall();

        expect(mockListener).toHaveBeenCalledTimes(1);
        gameEvents.removeEventListener('wallBounce', mockListener);
    });
});
