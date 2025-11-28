## ADDED Requirements

### Requirement: 遊戲畫面管理
The system SHALL manage and transition between different game screens.

#### Scenario: 遊戲啟動
- **GIVEN** a user opens the application
- **WHEN** the game initializes
- **THEN** the `startScreen` SHALL be displayed.

#### Scenario: 選擇遊戲模式
- **GIVEN** the user is on the `startScreen`
- **WHEN** the user clicks the "Classic Mode" or "Survival Mode" button
- **THEN** the `screen` state SHALL be set to `game`.

#### Scenario: 遊戲結束
- **GIVEN** the user is in the `game` screen
- **WHEN** the game is over
- **THEN** the `screen` state SHALL be set to `startScreen`.

### Requirement: 遊戲模式選擇
The system SHALL allow players to choose a game mode.

#### Scenario: 選擇經典模式
- **GIVEN** the user is on the `startScreen`
- **WHEN** the user clicks the "Classic Mode" button
- **THEN** the `gameMode` state SHALL be set to `classic`.

#### Scenario: 選擇生存模式
- **GIVEN** the user is on the `startScreen`
- **WHEN** the user clicks the "Survival Mode" button
- **THEN** the `gameMode` state SHALL be set to `survival`.