# CardBattle Components and Effects

This directory contains modular components and effect animations for the Card Battle scene.

## Components

### HandZone.ts
Manages the player hand zone displaying skill cards.

### PlayerCharacterZone.ts
Handles the battlefield display for player characters.

### BattleLogZone.ts
Displays the battle log and notifications.

### DiscardZone.ts
Manages the discard pile zone.

## Effects

### CardBattleEffects.ts
**Centralized animation effects for card battles** - provides reusable animation methods with meaningful names.

#### Main API

##### Character Skill Animations
```typescript
// Animate a character performing a skill
await CardBattleEffects.animateCharacterSkill(characterCard, 'damage');
await CardBattleEffects.animateCharacterSkill(characterCard, 'healing');
await CardBattleEffects.animateCharacterSkill(characterCard, 'debuff');
await CardBattleEffects.animateCharacterSkill(characterCard, 'other');
```

##### Target Effect Animations
```typescript
// Apply effects to a target character
await CardBattleEffects.applyTargetEffect(targetCard, targetData, 'damage');
await CardBattleEffects.applyTargetEffect(targetCard, targetData, 'healing');
```

##### Floating Numbers
```typescript
// Show damage number
CardBattleEffects.showFloatingDamage(targetCard, 50, false); // normal hit
CardBattleEffects.showFloatingDamage(targetCard, 100, true); // critical hit

// Show healing number
CardBattleEffects.showFloatingHealing(targetCard, 30);
```

##### Energy Animation
```typescript
// Animate energy increase
await CardBattleEffects.animateEnergyIncrease(energyText);
```

##### Simple Effect
```typescript
// Simple fallback animation
await CardBattleEffects.animateSimpleEffect(characterCard);
```

#### Animation Types

**Damage** - Aggressive forward lunge with red tint
- Character performs forward thrust motion
- Target receives impact with recoil and shake
- Enhanced for critical hits

**Healing** - Gentle glow and pulse with green tint
- Character performs gentle pulse animation
- Target receives restore effect with sparkle

**Debuff** - Dark energy and shake with purple tint
- Character performs shake effect
- Target receives pulsing control effect

**Other/Default** - Simple glow and scale
- Generic animation for non-specific effects

#### Benefits

✅ **Reusable** - Static methods can be called from any scene
✅ **Meaningful Names** - Clear function names indicate purpose
✅ **Type-Safe** - Uses `CardGroup` type for animation selection
✅ **Consistent** - All battle effects use the same animation system
✅ **Maintainable** - Single file for all effect animations

## Usage Example

```typescript
import { CardBattleEffects, CardGroup } from './CardBattle/CardBattleEffects';

// In your scene
private async performSkill(characterId: string, cardGroup: CardGroup) {
  const characterCard = this.findCharacterCard(characterId);
  if (!characterCard) return;
  
  // Animate the character performing the skill
  await CardBattleEffects.animateCharacterSkill(characterCard, cardGroup);
  
  // Apply effects to targets
  for (const target of targets) {
    const targetCard = this.findCharacterCard(target.id);
    if (targetCard) {
      await CardBattleEffects.applyTargetEffect(targetCard, target, cardGroup);
    }
  }
}
```
