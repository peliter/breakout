### Requirement: Control the paddle

The player MUST be able to control the paddle.

板子是玩家在遊戲中控制的主要元素。

#### Scenario: 使用鍵盤向左移動

*   Given: 遊戲正在進行中
*   When: 玩家按下向左方向鍵
*   Then: 板子向左移動

#### Scenario: 使用鍵盤向右移動

*   Given: 遊戲正在進行中
*   When: 玩家按下向右方向鍵
*   Then: 板子向右移動

#### Scenario: 使用鍵盤停止移動

*   Given: 遊戲正在進行中且板子正在移動
*   When: 玩家放開方向鍵
*   Then: 板子停止移動

## ADDED Requirements

### Requirement: Control the paddle with a gamepad

The player MUST be able to control the paddle with a gamepad.

除了鍵盤，玩家也可以使用已連接的藍牙搖桿來控制板子。

#### Scenario: 使用搖桿的 D-pad 向左移動

*   Given: 遊戲正在進行中且有已連接的搖桿
*   When: 玩家按下搖桿上的 D-pad 向左按鈕
*   Then: 板子向左移動

#### Scenario: 使用搖桿的 D-pad 向右移動

*   Given: 遊戲正在進行中且有已連接的搖桿
*   When: 玩家按下搖桿上的 D-pad 向右按鈕
*   Then: 板子向右移動

#### Scenario: 使用搖桿的類比搖桿向左移動

*   Given: 遊戲正在進行中且有已連接的搖桿
*   When: 玩家將類比搖桿向左推
*   Then: 板子向左移動

#### Scenario: 使用搖桿的類比搖桿向右移動

*   Given: 遊戲正在進行中且有已連接的搖桿
*   When: 玩家將類比搖桿向右推
*   Then: 板子向右移動

#### Scenario: 使用搖桿停止移動

*   Given: 遊戲正在進行中且板子正在移動
*   When: 玩家放開搖桿的 D-pad 或將類比搖桿置中
*   Then: 板子停止移動
