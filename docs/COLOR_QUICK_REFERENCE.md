# Color Quick Reference

## Most Commonly Used Colors

### Backgrounds
```typescript
Colors.BACKGROUND_PRIMARY      // #1C3A33 - Main dark green background
Colors.BACKGROUND_SECONDARY    // #2A4C44 - Lighter green panels
Colors.CARD_BACKGROUND         // #2A4C44 - Card backgrounds
Colors.PANEL_BACKGROUND        // #2A4C44 - Panel backgrounds
```

### Text
```typescript
Colors.TEXT_PRIMARY            // #F0F4E8 - Main ivory text
Colors.TEXT_SECONDARY          // #A9C1A9 - Sage green secondary text
Colors.TEXT_WHITE              // #FFFFFF - Pure white for high contrast
Colors.TEXT_TERTIARY           // #D4B35F - Gold highlighted text
```

### UI Elements
```typescript
Colors.BUTTON_PRIMARY          // #8B6D31 - Dark gold buttons
Colors.BUTTON_HOVER            // #A88A45 - Lighter gold hover
Colors.CARD_BORDER             // #3D5A50 - Forest border
```

### Status & Feedback
```typescript
Colors.SUCCESS                 // #5FAD56 - Green for success
Colors.ERROR                   // #E05E33 - Orange-red for errors
Colors.HP_HIGH                 // #5FAD56 - Healthy HP (>50%)
Colors.HP_MEDIUM               // #D9A441 - Medium HP (25-50%)
Colors.HP_LOW                  // #E05E33 - Low HP (<25%)
Colors.HP_CRITICAL             // #FF5252 - Critical HP
```

### Rarity Colors
```typescript
Colors.RARITY_COMMON           // #729683 - Gray-green
Colors.RARITY_UNCOMMON         // #5FAD56 - Vibrant green
Colors.RARITY_RARE             // #5792C1 - Blue
Colors.RARITY_EPIC             // #9568A7 - Purple
Colors.RARITY_LEGENDARY        // #D9A441 - Ancient gold
```

### Element Types
```typescript
Colors.ELEMENT_FIRE            // #E05E33 - Ember orange
Colors.ELEMENT_WATER           // #4CA5B3 - Forest lake blue
Colors.ELEMENT_EARTH           // #5FAD56 - Vibrant green
Colors.ELEMENT_AIR             // #D4CE8D - Golden wind
Colors.ELEMENT_LIGHT           // #F0E68C - Sunlight yellow
Colors.ELEMENT_DARK            // #2F4F4F - Dark forest
```

## Base Palette Quick Lookup

### Neutrals
- `BLACK` - #000000
- `WHITE` - #FFFFFF
- `GRAY` - #666666
- `GRAY_LIGHT` - #AAAAAA

### Golds
- `GOLD_BRIGHT` - #FFD700 - Pure gold
- `GOLD` - #D4AF37 - Standard gold
- `GOLD_DARK` - #8B6D31 - Dark gold
- `GOLD_ANCIENT` - #D9A441 - Ancient gold

### Browns & Parchment
- `PARCHMENT_LIGHT` - #F5E6D3 - Light parchment
- `PARCHMENT` - #E8D4B8 - Standard parchment
- `BROWN` - #8B4513 - Saddle brown
- `BROWN_DARK` - #2A1810 - Dark brown

### Greens
- `FOREST_DARK` - #1C3A33 - Dark forest green
- `FOREST_EMERALD` - #2A4C44 - Emerald forest
- `FOREST_BORDER` - #3D5A50 - Forest border
- `GREEN_VIBRANT` - #5FAD56 - Vibrant green
- `GREEN_BRIGHT` - #26DE81 - Bright green

### Blues
- `BLUE_NAVY_DARK` - #1A1A2E - Dark navy
- `BLUE_STEEL` - #6B8CAE - Steel blue
- `BLUE_SKY` - #4A90E2 - Sky blue
- `CYAN_BRIGHT` - #5ECCD9 - Bright cyan

### Purples
- `PURPLE_MYSTIC` - #9568A7 - Mystical purple
- `PURPLE_VIVID` - #B57EDC - Vivid purple
- `PURPLE_DARK` - #4A2F5F - Dark purple

### Reds & Oranges
- `RED` - #E74C3C - Standard red
- `RED_BRIGHT` - #FF6B6B - Bright red
- `RED_CRITICAL` - #FF5252 - Critical red
- `ORANGE` - #F39C12 - Standard orange
- `ORANGE_EMBER` - #E05E33 - Ember orange
- `ORANGE_FIRE` - #FF8800 - Fire orange

## Usage Examples

### Basic Usage
```typescript
import { Colors } from '@/utils/colors';

// Graphics
graphics.fill({ color: Colors.PARCHMENT_LIGHT), alpha: 0.95 });
graphics.stroke({ width: 2, color: Colors.GOLD) });

// Text
const text = new Text({
  text: 'Hello',
  style: {
    fill: Colors.TEXT_PRIMARY),
    fontSize: 16
  }
});
```

### Conditional Colors
```typescript
// HP bar color based on percentage
const hpPercentage = currentHp / maxHp;
const hpColor = hpPercentage > 0.5 ? Colors.HP_HIGH :
                hpPercentage > 0.25 ? Colors.HP_MEDIUM :
                Colors.HP_LOW;

hpBar.fill({ color: hexToPixi(hpColor) });
```

### Rarity-based Colors
```typescript
function getRarityColor(rarity: string) {
  switch(rarity) {
    case 'common': return Colors.RARITY_COMMON;
    case 'uncommon': return Colors.RARITY_UNCOMMON;
    case 'rare': return Colors.RARITY_RARE;
    case 'epic': return Colors.RARITY_EPIC;
    case 'legendary': return Colors.RARITY_LEGENDARY;
    default: return Colors.FOREST_STONE;
  }
}

cardFrame.stroke({ 
  width: 2, 
  color: getRarityColor(card.rarity)) 
});
```

## Tips

1. **Always use hexToPixi()** when setting colors in PixiJS
2. **Use semantic names** (e.g., `BUTTON_PRIMARY`) for UI elements
3. **Use base colors** (e.g., `GOLD_BRIGHT`) when you need the actual color value
4. **Check existing colors** before adding new ones to avoid duplicates
5. **Keep alpha separate** - PixiJS handles alpha in most APIs as a separate parameter

## Need Help?

See the full documentation in [docs/COLOR_SYSTEM.md](./COLOR_SYSTEM.md) for:
- Detailed explanation of the color system
- How to add new colors
- Migration guide for old code
- Theme information
