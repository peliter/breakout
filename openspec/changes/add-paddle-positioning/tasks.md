# Tasks

1.  **新增 `ballLaunched` 狀態**:
    *   在 `game.logic.js` 的 `state` 物件中新增 `ballLaunched` 布林值狀態。
2.  **修改遊戲開始邏輯**:
    *   在 `startGame` 函式中，將 `ballLaunched` 初始化為 `false`。
3.  **實作球的發射機制**:
    *   在 `game.logic.js` 的 `handleKeyDown` 中新增對 `Space` 鍵的處理，將 `ballLaunched` 設為 `true`。
    *   在 `game.js` 的 `pollGamepads` 中新增對搖桿 `A` 鍵的處理，將 `ballLaunched` 設為 `true`。
4.  **修改球的移動邏輯**:
    *   在 `moveBall` 函式中，只有當 `ballLaunched` 為 `true` 時才移動球。
    *   當 `ballLaunched` 為 `false` 時，讓球的位置跟隨板子的水平位置。
5.  **測試**:
    *   手動測試以確保所有遊戲模式都能正常運作，且球在發射前會跟隨板子移動。
