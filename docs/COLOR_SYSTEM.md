# Color System Documentation

## Overview

The vivu-ui project uses a centralized color system defined in `src/utils/colors.ts`. All colors are defined once and reused throughout the application to ensure consistency and maintainability.

## Structure

The color system is organized into two main sections:

### 1. Base Color Palette

The base palette contains all unique colors used in the application. These are the single source of truth for color values. Colors are grouped by category:

- **Neutrals**: Black, white, and grayscale
- **Golds & Yellows**: Various gold shades for UI accents
- **Browns & Parchment**: Earthy tones for cards and backgrounds
- **Ivories & Creams**: Soft text colors
- **Greens**: Forest theme colors
- **Blues**: Navy, steel, and cyan variants
- **Purples & Violets**: Mystical and rare item colors
- **Reds & Oranges**: Fire, damage, and warning colors
- **Teals & Cyans**: Special water and ice effects
- **Special Effect Colors**: Specific animation and visual effect colors

### 2. Semantic Aliases

Semantic aliases are descriptive names that reference base colors. These provide context-specific naming for better code readability.

Examples:
- `BACKGROUND_PRIMARY` → References `FOREST_DARK`
- `TEXT_PRIMARY` → References `IVORY_SOFT`
- `BUTTON_PRIMARY` → References `GOLD_DARK`
- `RARITY_LEGENDARY` → References `GOLD_ANCIENT`

## Usage

### In TypeScript/PixiJS Files

PixiJS can directly accept hex color strings, so you can use Colors constants directly:

```typescript
import { Colors } from '@/utils/colors';

// Create a graphics object with a colored fill
const graphics = new Graphics();
graphics
  .roundRect(0, 0, 100, 100, 5)
  .fill({ color: Colors.PARCHMENT_LIGHT, alpha: 0.95 })
  .stroke({ width: 2, color: Colors.GOLD });

// Set text color
const text = new Text({
  text: 'Hello World',
  style: {
    fill: Colors.TEXT_PRIMARY
  }
});
```

### In CSS/HTML (if applicable)

Colors are stored as hex strings (e.g., `#RRGGBB`), so they can be used directly in CSS:

```typescript
element.style.color = Colors.TEXT_PRIMARY; // '#F0F4E8'
```

## Benefits of This System

1. **Single Source of Truth**: Each unique color is defined only once in the base palette
2. **Consistency**: No duplicate or slightly-different color values
3. **Maintainability**: Easy to update colors globally - just change the base color definition
4. **Readability**: Semantic names make code self-documenting
5. **Type Safety**: TypeScript provides autocomplete and type checking for color names
6. **Reusability**: Common colors are easily reused across components

## Color Naming Conventions

### Base Colors
- Named by appearance: `GOLD_BRIGHT`, `BLUE_STEEL`, `BROWN_DARK`
- Include intensity/lightness modifiers: `_DARK`, `_DARKER`, `_DARKEST`, `_LIGHT`, `_LIGHTER`, `_LIGHTEST`
- Use descriptive terms: `PARCHMENT`, `IVORY`, `FOREST`, `EMERALD`

### Semantic Aliases
- Named by purpose: `BACKGROUND_PRIMARY`, `TEXT_SECONDARY`, `BUTTON_HOVER`
- Include context: `CARD_BORDER`, `HP_BAR_FILL`, `ENERGY_ACTIVE`
- Use common UI terms: `SUCCESS`, `ERROR`, `DISABLED`

## Common Color Groups

### UI Backgrounds
```typescript
Colors.BACKGROUND_PRIMARY      // Main app background
Colors.BACKGROUND_SECONDARY    // Secondary backgrounds
Colors.PANEL_BACKGROUND        // Panel containers
Colors.CARD_BACKGROUND         // Card backgrounds
```

### Text
```typescript
Colors.TEXT_PRIMARY            // Primary text
Colors.TEXT_SECONDARY          // Secondary/muted text
Colors.TEXT_TERTIARY           // Highlighted text
Colors.TEXT_WHITE              // High contrast text
```

### Status Colors
```typescript
Colors.SUCCESS                 // Success messages
Colors.ERROR                   // Error messages
Colors.HP_HIGH                 // Healthy state
Colors.HP_LOW                  // Warning state
Colors.HP_CRITICAL             // Critical state
```

### Rarity (for items/cards)
```typescript
Colors.RARITY_COMMON
Colors.RARITY_UNCOMMON
Colors.RARITY_RARE
Colors.RARITY_EPIC
Colors.RARITY_LEGENDARY
```

## Adding New Colors

When adding new colors:

1. **Check if it exists**: Search the base palette first
2. **Add to base palette**: If it's a new unique color, add it to the appropriate category
3. **Create semantic alias**: Add a semantic name that describes its purpose
4. **Use hexToPixi()**: Always use the helper function in PixiJS contexts
5. **Document**: Add comments explaining the color's purpose if not obvious

Example:
```typescript
// In Colors.ts - Base palette section
BLUE_OCEAN: '#1E88E5',           // Ocean blue

// In Colors.ts - Semantic aliases section
WATER_EFFECT: '#1E88E5',         // = BLUE_OCEAN

// In your component
import { Colors, hexToPixi } from '@/utils/colors';

waterGraphics.fill({ color: hexToPixi(Colors.WATER_EFFECT) });
```

## Color Format

Colors are defined as hex strings (`#RRGGBB`) which work directly in both CSS and PixiJS v8+. PixiJS can accept string colors natively, so no conversion is needed.

```typescript
// Good - Direct usage
.fill({ color: Colors.GOLD, alpha: 0.8 })

// Avoid - Hardcoded colors
.fill({ color: 0xD4AF37, alpha: 0.8 })  // Hardcoded color
.fill({ color: '#D4AF37', alpha: 0.8 })  // Hardcoded color
```

## Migration Guide

If you're updating old code with hardcoded colors:

1. Find the hardcoded color value (e.g., `0xD4AF37` or `#D4AF37`)
2. Look up the corresponding Colors constant in `colors.ts`
3. Import `Colors` if not already imported
4. Replace with `Colors.CONSTANT_NAME`

Example:
```typescript
// Before
.fill({ color: 0xD4AF37, alpha: 0.95 })

// After
.fill({ color: Colors.GOLD, alpha: 0.95 })
```

## Theme Information

Current theme: **Ancient Forest**
- Deep forest greens with golden accents
- Parchment and brown tones for UI elements
- Mystical purples for rare items
- Vibrant greens for success/health

The theme can be modified by updating the base color values in `colors.ts`.
