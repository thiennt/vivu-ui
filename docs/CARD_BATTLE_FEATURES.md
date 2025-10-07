# Card Battle Scene Features

## Overview
This document describes the features and UI components in the Card Battle Scene.

## Navigation

### Back Button
The Card Battle Scene includes a back button that allows players to return to the Home Scene at any time during gameplay.

**Location**: Top-left corner of the screen

**Features**:
- Small and unobtrusive design (80x32 pixels)
- Shows "← BACK" text
- Positioned with standard padding from screen edges
- Automatically repositions on screen resize
- Always accessible during gameplay

**Implementation**:
- Component: `CardBattleScene.ts`
- Method: `createBackButton()`
- Styling: Uses `Colors.BUTTON_PRIMARY` and `Colors.BUTTON_BORDER`
- Behavior: Navigates to `HomeScene` on click

## Battle Zones

The battle screen is organized into the following zones:

1. **Player 2 Hand Zone** - Shows AI opponent's hand (face-down cards)
2. **Player 2 Character Zone** - AI opponent's characters and info
3. **Battle Log Zone** - Displays turn information and battle events
4. **Player 1 Character Zone** - Player's characters and info
5. **Player 1 Hand Zone** - Player's hand (interactive cards)

## User Interactions

- **Drag and Drop**: Players can drag cards from their hand to play them
- **Card Discard**: Drop cards on the player info area to discard for energy
- **Character Targeting**: Drop cards on characters to apply effects
- **End Turn**: Button appears during player's main phase
- **Back Navigation**: Back button always available for exiting battle

## Visual Effects

The scene includes various visual effects:
- Card animations when drawn
- Energy increase animations
- Skill effect animations
- Character health updates
- Turn transition effects
