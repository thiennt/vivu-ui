# Avatar Skill Effect - Documentation

## Overview

The Avatar Skill Effect is a special visual effect in the `CardBattleEffects` class that creates a flying projectile animation using the character's avatar sprite. This effect clones the character's avatar and animates it from the attacker to the target, creating an impressive skill animation with particle trails and glowing effects.

## Features

- **Avatar Cloning**: Automatically extracts and clones the avatar sprite from character cards
- **Flying Projectile**: Smooth animation from attacker to target with rotation
- **Particle Trails**: Dynamic particle effects that follow the avatar's path
- **Glow Effects**: Color-coded glows based on skill type (damage/healing/debuff/other)
- **Automatic Cleanup**: Proper memory management with automatic destruction of temporary sprites

## API Reference

### Main Method

```typescript
static async animateAvatarSkillEffect(
  effectsContainer: Container,
  attackerCard: Container,
  targetCard: Container,
  cardGroup: CardGroup = 'other'
): Promise<void>
```

#### Parameters

- **effectsContainer** (`Container`): The container where the effect will be rendered. This should be a container that sits above the cards in the scene hierarchy to ensure the flying avatar is visible above all cards.

- **attackerCard** (`Container`): The character card container of the attacker. The method will automatically search for and extract the avatar sprite from this container.

- **targetCard** (`Container`): The character card container of the target. The avatar will fly toward the center of this card.

- **cardGroup** (`CardGroup`, optional): The type of skill effect. Defaults to `'other'`. Valid values:
  - `'damage'` - Red glow (0xFF4444) for offensive skills
  - `'healing'` - Green glow (0x44FF88) for healing/support skills
  - `'debuff'` - Purple glow (0x8844FF) for debuff/control skills
  - `'other'` - Blue glow (0x66CCFF) for neutral effects

#### Returns

Returns a `Promise<void>` that resolves when the animation completes (approximately 0.95 seconds total duration).

## Usage Examples

### Basic Usage

```typescript
import { CardBattleEffects, CardGroup } from '@/ui/CardBattleEffects';
import { Container } from 'pixi.js';

// Assuming you have these containers in your battle scene
const effectsContainer = new Container(); // Add this above cards in scene
const attackerCard = findCharacterCard(attackerId);
const targetCard = findCharacterCard(targetId);

// Animate a damage skill effect
await CardBattleEffects.animateAvatarSkillEffect(
  effectsContainer,
  attackerCard,
  targetCard,
  'damage'
);
```

### Integration with Existing Battle System

```typescript
// In your battle scene
class BattleScene extends BaseScene {
  private effectsContainer: Container;

  private async animateSkillWithAvatar(
    attackerId: string, 
    targetId: string, 
    skillType: CardGroup
  ): Promise<void> {
    const attackerCard = this.findCharacterCard(attackerId);
    const targetCard = this.findCharacterCard(targetId);
    
    if (!attackerCard || !targetCard) {
      console.warn('Card not found for avatar effect');
      return;
    }

    // Play the avatar skill effect
    await CardBattleEffects.animateAvatarSkillEffect(
      this.effectsContainer,
      attackerCard,
      targetCard,
      skillType
    );
  }

  // Usage during battle
  private async executeSkill(skill: Skill): Promise<void> {
    // Animate attacker preparation
    await CardBattleEffects.animateCharacterSkill(attackerCard, skill.cardGroup);
    
    // Fly the avatar as projectile
    await this.animateSkillWithAvatar(
      skill.casterId,
      skill.targetId,
      skill.cardGroup
    );
    
    // Apply target effect
    await CardBattleEffects.applyTargetEffect(targetCard, target, skill.cardGroup);
  }
}
```

### Combining with Other Effects

```typescript
// Create a combo effect with screen shake and flash
async function executeUltimateSkill(
  effectsContainer: Container,
  attackerCard: Container,
  targetCard: Container,
  sceneContainer: Container
): Promise<void> {
  // 1. Character animation
  await CardBattleEffects.animateCharacterSkill(attackerCard, 'damage');
  
  // 2. Avatar projectile (don't await to continue immediately)
  const avatarPromise = CardBattleEffects.animateAvatarSkillEffect(
    effectsContainer,
    attackerCard,
    targetCard,
    'damage'
  );
  
  // 3. Wait a bit for avatar to reach halfway, then shake screen
  await new Promise(resolve => setTimeout(resolve, 300));
  CardBattleEffects.shakeScreen(sceneContainer, 8);
  
  // 4. Wait for avatar to complete
  await avatarPromise;
  
  // 5. Screen flash on impact
  await CardBattleEffects.animateScreenFlash(sceneContainer, 0xFFFFFF, 0.6, 0.2);
  
  // 6. Apply damage effect
  await CardBattleEffects.applyTargetEffect(targetCard, target, 'damage');
}
```

## Animation Breakdown

The avatar skill effect animation consists of three phases:

### Phase 1: Fade In (0.15 seconds)
- Avatar clone fades in from alpha 0 to 1
- Scales up from 0.8 to 1.2
- Starts at attacker's position

### Phase 2: Flight (0.6 seconds)
- Avatar flies from attacker to target position
- Rotates 360 degrees (2π radians)
- Trail particles spawn randomly during flight
- Glow effect pulses (0.3s fade in, 0.3s fade out)

### Phase 3: Impact (0.2 seconds)
- Avatar scales up to 1.5
- Fades out to alpha 0
- Automatic cleanup of all temporary sprites

**Total Duration**: ~0.95 seconds

## Technical Details

### Avatar Detection

The effect automatically finds the avatar sprite within a character card by:
1. Searching through all children of the card container
2. Looking for `Sprite` instances with a valid texture
3. Checking for centered anchor point (0.5, 0.5)
4. Returning the first matching sprite

If no avatar is found, the method logs a warning and returns early without error.

### Coordinate Transformation

The effect uses PixiJS coordinate transformation to handle nested containers:
```typescript
// Convert card positions to global coordinates
const attackerPos = attackerCard.toGlobal({ x: cardWidth/2, y: cardHeight/2 });
const targetPos = targetCard.toGlobal({ x: cardWidth/2, y: cardHeight/2 });

// Convert to local coordinates of effects container
const startPos = effectsContainer.toLocal(attackerPos);
const endPos = effectsContainer.toLocal(targetPos);
```

This ensures the effect works correctly regardless of card positioning or container hierarchy.

### Memory Management

All temporary sprites are properly destroyed:
- Avatar clone is destroyed with `{ children: true }` to clean up child elements
- Trail particles are destroyed individually after fading
- Glow effect is destroyed as a child of the avatar clone

## Customization

### Adjusting Animation Duration

You can fork the method and modify the `duration` variable:
```typescript
const duration = 0.8; // Make it slower
const duration = 0.4; // Make it faster
```

### Changing Trail Particle Frequency

Modify the probability threshold in the `onUpdate` callback:
```typescript
if (Math.random() > 0.5) { // More particles (was 0.7)
  // Create particle
}
```

### Custom Glow Colors

Add new cases to the `getGlowColorForCardGroup` helper:
```typescript
private static getGlowColorForCardGroup(cardGroup: CardGroup): number {
  switch (cardGroup) {
    case 'damage':
      return 0xFF0000; // Pure red
    case 'healing':
      return 0x00FF00; // Pure green
    // ... more cases
  }
}
```

## Performance Considerations

- The effect creates temporary sprites that are automatically cleaned up
- Trail particles are created probabilistically (30% chance per update frame)
- Maximum ~20-30 trail particles are typically generated per animation
- All sprites use shared textures (no duplicate texture loading)
- GSAP handles animation optimization automatically

## Troubleshooting

### Avatar Not Appearing

**Problem**: The avatar doesn't show up during the effect.

**Solutions**:
1. Ensure the character card has a Sprite child with anchor (0.5, 0.5)
2. Check that the avatar texture is loaded before animation
3. Verify effectsContainer is added to the scene and visible
4. Check z-index/layer ordering of containers

### Effect Not Visible

**Problem**: The effect plays but you don't see it.

**Solutions**:
1. Ensure effectsContainer is above card containers in the scene
2. Check that effectsContainer has proper positioning
3. Verify the container hierarchy allows visibility

### Performance Issues

**Problem**: Animation is choppy or slow.

**Solutions**:
1. Reduce trail particle frequency (increase threshold from 0.7 to 0.85)
2. Disable particle trails for low-end devices
3. Reduce animation duration for faster completion
4. Use object pooling for particles if playing many effects simultaneously

## See Also

- `CardBattleEffects.animateCharacterSkill()` - Character attack animations
- `CardBattleEffects.applyTargetEffect()` - Target impact effects
- `CardBattleEffects.animateScreenFlash()` - Screen flash effects
- `CardBattleEffects.shakeScreen()` - Screen shake effects

## Version History

- **v1.0.0** (Current): Initial implementation with flying avatar projectile effect
