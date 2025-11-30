## ADDED Requirements

### Requirement: 玩家可以在遊戲開始前定位板子並發射球

The player MUST be able to position the paddle before the ball is launched.

#### Scenario: 遊戲開始時球跟隨板子

*   Given: 玩家選擇一個遊戲模式並進入遊戲
*   When: 遊戲開始，但玩家尚未發射球
*   Then: 球會跟隨板子的水平位置移動

#### Scenario: 使用 SPACE 鍵發射球

*   Given: 遊戲已開始，球在板子上
*   When: 玩家按下 SPACE 鍵
*   Then: 球從板子上發射出去

#### Scenario: 使用搖桿 A 鍵發射球

*   Given: 遊戲已開始，球在板子上，且有已連接的搖桿
*   When: 玩家按下搖桿的 A 鍵
*   Then: 球從板子上發射出去
