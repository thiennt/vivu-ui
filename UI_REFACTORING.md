# UI Components Refactoring Documentation

## Overview
This document describes the refactoring of UI components from `src/utils` to a dedicated `src/ui` folder, with improved organization and separation of concerns.

## Changes Made

### 1. New Folder Structure
Created `src/ui/` folder to house all UI-related components:
- `BaseScene.ts` - Base class for all game scenes
- `BottomNavigationMenu.ts` - Bottom navigation component
- `UIButton.ts` - Button creation and styling
- `UICard.ts` - Card creation (deck cards, character cards, hero cards, etc.)
- `index.ts` - Central export file for easy imports

### 2. Extracted UI Classes

#### UIButton (`src/ui/UIButton.ts`)
Handles all button creation with:
- Responsive sizing for different screen sizes
- Touch-friendly targets for mobile
- Consistent styling with hover effects
- Font size scaling based on button and screen dimensions

**Usage:**
```typescript
import { UIButton } from '@/ui/UIButton';

const button = UIButton.create(
  'Click Me',
  x, y,
  200, 50,
  () => console.log('clicked'),
  18,
  gameWidth,
  gameHeight,
  standardPadding
);
```

#### UICard (`src/ui/UICard.ts`)
Handles all card-related UI components:
- `createFaceDownCard()` - Face-down card with decorative pattern
- `createDeckCard()` - Deck card with energy cost, description, and card type
- `createCharacterCard()` - Character card with stats, HP bar, and avatar
- `createHeroCard()` - Hero card with multiple display types (preview, detailed, lineup, pool)
- `createAvatar()` - Character avatar sprite loading and sizing

**Usage:**
```typescript
import { UICard } from '@/ui/UICard';

// Create a deck card
const card = UICard.createDeckCard(cardData, 120, 160, {
  fontScale: 1,
  showDescription: true,
  onClick: (card) => handleCardClick(card)
});

// Create a hero card
const heroCard = UICard.createHeroCard(
  character,
  x, y,
  'detailed',
  undefined,
  140,
  gameWidth
);
```

### 3. Simplified BaseScene

**Before:** 816 lines with all UI creation methods inline
**After:** 246 lines with delegation to specialized UI classes

The refactored `BaseScene` now:
- Maintains the same public API for backward compatibility
- Delegates UI creation to `UIButton` and `UICard` classes
- Focuses on scene management, layout calculations, and base functionality
- Easier to maintain and extend

**Example of delegation:**
```typescript
// In BaseScene
public createButton(...args): Container {
  return UIButton.create(...args, this.gameWidth, this.gameHeight, this.STANDARD_PADDING);
}

public createHeroCard(...args): Container {
  return UICard.createHeroCard(...args, this.gameWidth);
}
```

### 4. Updated Import Paths

All scene files now import from `@/ui` instead of `@/utils`:

**Before:**
```typescript
import { BaseScene } from '@/utils/BaseScene';
```

**After:**
```typescript
import { BaseScene } from '@/ui/BaseScene';
```

**Files Updated:**
- All 14+ scene files in `src/scenes/`
- Scene components in `src/scenes/CardBattle/`
- `BottomNavigationMenu` import paths

### 5. Central Export File

`src/ui/index.ts` provides easy access to all UI components:

```typescript
// Single import for multiple components
import { BaseScene, UIButton, UICard, BottomNavigationMenu } from '@/ui';
```

## Benefits

1. **Better Organization**: UI components are now in a dedicated folder, separate from utilities
2. **Improved Reusability**: UI classes can be used independently without extending BaseScene
3. **Easier Maintenance**: Smaller, focused files are easier to understand and modify
4. **Better Separation of Concerns**: Each class has a single responsibility
5. **Backward Compatible**: Existing scenes continue to work without changes (except import paths)
6. **Type Safety**: All TypeScript types and checks maintained

## Migration Guide

### For Existing Code
No changes needed! The BaseScene API remains the same:
```typescript
// Still works exactly as before
this.createButton('Click Me', x, y, 200, 50, onClick);
this.createHeroCard(character, x, y, 'detailed');
```

### For New Code
You can now use UI classes directly:
```typescript
import { UICard, UIButton } from '@/ui';

// Use directly without extending BaseScene
const button = UIButton.create(...);
const card = UICard.createHeroCard(...);
```

### For Custom Scenes
Just update your import:
```typescript
// Old
import { BaseScene } from '@/utils/BaseScene';

// New
import { BaseScene } from '@/ui/BaseScene';
```

## Testing

All refactoring has been validated:
- ✅ TypeScript compilation passes
- ✅ Vite build succeeds
- ✅ All scene imports updated correctly
- ✅ No runtime errors

## Future Enhancements

Potential improvements:
1. Add UIPanel class for panel/dialog creation
2. Add UIText class for text formatting
3. Add UILayout class for advanced layout patterns
4. Consider creating a UIFactory pattern for complex UI composition
