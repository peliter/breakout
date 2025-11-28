# 遊戲模式選擇的任務列表

此文件列出了根據規格書實作遊戲模式選擇功能所需的開發任務。

- [x] **1. 狀態管理**：在 `game.logic.js` 的 `state` 物件中新增 `screen` 和 `gameMode` 變數。
- [x] **2. UI 實作**：在 `game.js` 中建立 `drawStartScreen` 函式，用以渲染包含「Classic Mode (經典模式)」和「Survival Mode (生存模式)」按鈕的開始畫面。
- [x] **3. 輸入處理**：為 canvas 新增 `click` 事件監聽器，以處理開始畫面的按鈕點擊。
- [x] **4. 遊戲流程邏輯**：
    - [x] 4.1 重構主遊戲迴圈，使其僅在 `state.screen === 'game'` 時執行。
    - [x] 4.2 根據使用者的點擊，實作設定 `gameMode` 和變更 `screen` 的模式選擇邏輯。
- [x] **5. 重置流程**：修改 `reset()` 函式，使遊戲結束時能將 `state.screen` 設定為 `'startScreen'`。
- [x] **6. 文件翻譯**：將 `tasks.md` 翻譯為繁體中文。
