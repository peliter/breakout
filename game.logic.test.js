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

    test('should end game when ball goes out of bounds after losing all lives', () => {
        // Set lives to 1 so the next out of bounds event ends the game
        state.lives = 1; 
        state.ball.y = state.canvas.height + state.ball.radius;
        moveBall();
        expect(state.screen).toBe('gameOver');
    });

    test('should reset the game state', () => {
        handleKeyDown({ code: 'Space' });
        state.score = 10;
        state.ballTrail.push({ x: 1, y: 1 }); // Populate for testing reset
        state.paddleTrail.push({ x: 1, y: 1 }); // Populate for testing reset
        reset();
        expect(state.score).toBe(0);
        expect(state.currentSpeedLevel).toBe(0);
        expect(state.showSpeedUpNotification).toBe(false);
        expect(state.ballTrail).toEqual([]);
        expect(state.paddleTrail).toEqual([]);
        expect(state.screen).toBe('startScreen'); // Verify screen reset
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

    describe('Pause Functionality', () => {
        beforeEach(() => {
            reset();
        });

        test('should toggle isPaused state when P key is pressed', () => {
            expect(state.isPaused).toBe(false);
            handleKeyDown({ code: 'KeyP' });
            expect(state.isPaused).toBe(true);
            handleKeyDown({ code: 'KeyP' });
            expect(state.isPaused).toBe(false);
        });

        test('should ignore other key presses when game is paused', () => {
            handleKeyDown({ code: 'KeyP' }); // Pause the game
            expect(state.isPaused).toBe(true);

            handleKeyDown({ code: 'ArrowRight' });
            expect(state.rightPressed).toBe(false); // Should remain false
            handleKeyUp({ code: 'ArrowRight' });
            expect(state.rightPressed).toBe(false);

            handleKeyDown({ code: 'ArrowLeft' });
            expect(state.leftPressed).toBe(false); // Should remain false
            handleKeyUp({ code: 'ArrowLeft' });
            expect(state.leftPressed).toBe(false);
        });
    });

    describe('Dynamic Ball Speed', () => {
        let originalSetTimeout;
        let originalClearTimeout;
        let timeouts = {};
        let timeoutId = 0;

        beforeEach(() => {
            originalSetTimeout = global.setTimeout;
            originalClearTimeout = global.clearTimeout;
            
            global.setTimeout = jest.fn((fn, delay) => {
                const id = timeoutId++;
                timeouts[id] = fn;
                return id;
            });
            global.clearTimeout = jest.fn((id) => {
                delete timeouts[id];
            });

            reset();
            // Start the game to give the ball initial speed
            handleKeyDown({ code: 'Space' }); // This line is actually not needed as startGame() is called to initialize ball dx/dy
            state.ball.dx = state.baseBallSpeed;
            state.ball.dy = -state.baseBallSpeed;
            state.score = 0; // Ensure score starts at 0 for this test
            state.currentSpeedLevel = 0; // Ensure speed level starts at 0
            state.showSpeedUpNotification = false; // Ensure notification is off
        });

        afterEach(() => {
            global.setTimeout = originalSetTimeout; // Restore original setTimeout
            global.clearTimeout = originalClearTimeout; // Restore original clearTimeout
            timeouts = {}; // Clear any remaining timeouts
            timeoutId = 0;
        });

        const runAllTimeouts = () => {
            for (const id in timeouts) {
                timeouts[id]();
                delete timeouts[id];
            }
        };

        test('should increase ball speed and show notification when score crosses threshold (e.g., 5 points)', () => {
            const initialDx = state.ball.dx;
            const initialDy = state.ball.dy;

            // Increase score to trigger first speed increase
            state.score = 4;
            updateBallSpeed(); // This call won't increase speed yet
            expect(state.ball.dx).toBe(initialDx);
            expect(state.ball.dy).toBe(initialDy);
            expect(state.currentSpeedLevel).toBe(0);
            expect(state.showSpeedUpNotification).toBe(false);

            state.score = 5;
            updateBallSpeed();
            const expectedDx1 = initialDx * (1 + state.speedIncreaseFactor);
            const expectedDy1 = initialDy * (1 + state.speedIncreaseFactor);
            expect(state.ball.dx).toBeCloseTo(expectedDx1);
            expect(state.ball.dy).toBeCloseTo(expectedDy1);
            expect(state.currentSpeedLevel).toBe(1);
            expect(state.showSpeedUpNotification).toBe(true);
            expect(setTimeout).toHaveBeenCalledTimes(1);

            runAllTimeouts(); // Manually run timeouts
            expect(state.showSpeedUpNotification).toBe(false);

            // Increase score again to trigger second speed increase
            state.score = 9;
            updateBallSpeed(); // No change yet
            expect(state.ball.dx).toBeCloseTo(expectedDx1);
            expect(state.ball.dy).toBeCloseTo(expectedDy1);
            expect(state.currentSpeedLevel).toBe(1);

            state.score = 10;
            updateBallSpeed();
            const expectedDx2 = expectedDx1 * (1 + state.speedIncreaseFactor);
            const expectedDy2 = expectedDy1 * (1 + state.speedIncreaseFactor);
            expect(state.ball.dx).toBeCloseTo(expectedDx2);
            expect(state.ball.dy).toBeCloseTo(expectedDy2);
            expect(state.currentSpeedLevel).toBe(2);
            expect(state.showSpeedUpNotification).toBe(true);
            expect(setTimeout).toHaveBeenCalledTimes(2);
            
            runAllTimeouts(); // Manually run timeouts
            expect(state.showSpeedUpNotification).toBe(false);
        });

        test('should not increase speed if score is below threshold', () => {
            state.score = 4;
            const initialDx = state.ball.dx;
            const initialDy = state.ball.dy;
            updateBallSpeed();
            expect(state.ball.dx).toBe(initialDx);
            expect(state.ball.dy).toBe(initialDy);
            expect(state.currentSpeedLevel).toBe(0);
            expect(state.showSpeedUpNotification).toBe(false);
            expect(setTimeout).not.toHaveBeenCalled();
        });

        test('should not increase speed if score is within the same speed level', () => {
            state.score = 5;
            updateBallSpeed(); // First increase
            runAllTimeouts(); // Clear notification
            const speedAfterFirstIncreaseDx = state.ball.dx;
            const speedAfterFirstIncreaseDy = state.ball.dy;
            expect(state.showSpeedUpNotification).toBe(false);

            state.score = 6; // Still within the first speed level (5-9)
            updateBallSpeed();
            expect(state.ball.dx).toBeCloseTo(speedAfterFirstIncreaseDx);
            expect(state.ball.dy).toBeCloseTo(speedAfterFirstIncreaseDy);
            expect(state.currentSpeedLevel).toBe(1);
            expect(state.showSpeedUpNotification).toBe(false); // Should not show notification again
            expect(setTimeout).toHaveBeenCalledTimes(1); // Only called once for the first speed up
        });
    });
});
