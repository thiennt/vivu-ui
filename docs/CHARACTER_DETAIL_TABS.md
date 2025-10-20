# Character Detail Scene - Tab Implementation

## Overview
The CharacterDetailScene has been updated with a tabbed interface to organize character information into three main categories: Stats, Skills, and Equipment.

## Features

### Tab System
- **Three tabs**: Stats (📊), Skills (📜), Equipment (⚔️)
- **Active state**: The active tab is highlighted with a distinct visual style
- **Smooth transitions**: Clicking a tab instantly switches the content
- **ScrollBox integration**: Each tab's content is wrapped in a ScrollBox for overflow handling

### Layout Structure
```
┌─────────────────────────────┐
│     Character Name Banner    │
├─────────────────────────────┤
│   Character Info Panel       │
│   (Portrait + Core Stats)    │
├─────────────────────────────┤
│  [Stats] [Skills] [Equipment]│ ← Tab buttons
├─────────────────────────────┤
│                              │
│    Scrollable Content        │
│    (Tab-specific content)    │
│                              │
│                              │
├─────────────────────────────┤
│        Back Button           │
└─────────────────────────────┘
```

### Stats Tab
- **Combat Stats Panel**: Displays detailed combat statistics (Crit Rate, Crit Dmg, Resist, Damage, Mitigation, Hit, Dodge)

### Skills Tab
- **Active Skill Slots**: Shows Normal, Active, and Passive skill slots
- **Skill Badges**: Color-coded type indicators (Normal: purple, Active: blue, Passive: green)
- **Interactive Skills**: Click skill names to view details
- **Empty Slots**: Shows "(Empty)" for unlearned skills with "Learn" buttons
- **Change Buttons**: For active and passive skills to swap them out

### Equipment Tab
- **Equipment Slots**: Weapon, Armor, Accessory with interactive click-to-change functionality
- **Equipment Bonuses Panel**: Shows total stat bonuses aggregated from all equipped items (weapon + armor + accessory)
  - HP, ATK, DEF, AGI bonuses
  - Crit Rate, Crit Dmg bonuses
  - Color-coded stat indicators
  - Calculated dynamically from equipment data
- **Interactive Hover**: Equipment slots highlight on hover

## Technical Implementation

### Key Components
- `TabType`: Type definition for 'stats' | 'skills' | 'equipment'
- `activeTab`: State variable tracking the current tab
- `tabsContainer`: Container for tab buttons
- `contentContainer`: Container for tab content with ScrollBox
- `scrollBox`: ScrollBox instance for scrollable content

### Key Methods
- `createTabs()`: Creates the three tab buttons
- `createTabButton()`: Builds individual tab button with styling
- `switchTab()`: Handles tab switching and content refresh
- `createTabContent()`: Creates the appropriate content based on active tab
- `createEquipmentBonusesPanel()`: Shows equipment stat bonuses (Equipment tab)
- `calculateEquipmentBonuses()`: Sums bonuses from all equipped items
- `refreshTabContent()`: Refreshes scroll content after data changes

### Data Flow
1. User clicks a tab button
2. `switchTab()` is called with the new TabType
3. Containers are cleared and ScrollBox is reset
4. `createTabs()` recreates tab buttons with new active state
5. `createTabContent()` creates the appropriate content container
6. Content is wrapped in a new ScrollBox instance

## Styling

### Tab Buttons
- **Active**: Purple background (#4a2f5f), bold white text, steel blue border (#8b9dc3)
- **Inactive**: Dark gray background (#2a2a2a), normal gray text
- **Hover** (inactive): Lighter gray background (#3a3a3a), steel blue border (#6b8cae)

### Panels
All panels maintain the fantasy theme with:
- Dark blue/purple backgrounds (#1a1a2e, #16213e)
- Steel/blue borders (#4a5f7f, #6b8cae)
- Shadow effects for depth
- Rounded corners

## Usage
Navigate to the Characters section from the home screen, select a character to view the Character Detail Scene with the new tabbed interface.
