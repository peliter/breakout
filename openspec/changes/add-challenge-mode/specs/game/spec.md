## ADDED Requirements

### Requirement: 玩家可以選擇挑戰模式

The player MUST be able to select "Challenge Mode" from the start screen.

#### Scenario: 選擇挑戰模式

*   Given: 玩家在開始畫面上
*   When: 玩家點擊「挑戰模式」按鈕
*   Then: 遊戲以挑戰模式開始

### Requirement: 挑戰模式有 10 個關卡

Challenge Mode MUST consist of 10 levels.

#### Scenario: 過關

*   Given: 玩家在挑戰模式中，並清除了目前關卡的所有方塊
*   When: 玩家完成一個關卡
*   Then: 遊戲進入下一個關卡

#### Scenario: 完成所有關卡

*   Given: 玩家在挑戰模式的第 10 關
*   When: 玩家清除了第 10 關的所有方塊
*   Then: 遊戲結束，並顯示勝利訊息

### Requirement: 方塊會定時向下移動並左右晃動

In Challenge Mode, the bricks MUST move down periodically and sway.

#### Scenario: 方塊向下移動

*   Given: 遊戲在挑戰模式中進行
*   When: 60 秒過去了
*   Then: 所有方塊向下移動一個單位

#### Scenario: 方塊左右晃動

*   Given: 遊戲在挑戰模式中進行
*   When: 遊戲進行中
*   Then: 所有方塊會輕微地左右晃動
