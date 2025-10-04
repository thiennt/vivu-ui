# Avatar Skill Effect Feature - Quick Start

## What's New? 🎮

A special visual effect has been added to `CardBattleEffects` that creates a flying avatar projectile animation. When a character uses a skill, their avatar can now fly from the attacker to the target as a dramatic visual effect!

## Quick Start (30 seconds) ⚡

```typescript
import { CardBattleEffects } from '@/ui/CardBattleEffects';

// In your battle scene, add this one line:
await CardBattleEffects.animateAvatarSkillEffect(
  effectsContainer,  // Container above your cards
  attackerCard,      // The attacking character's card
  targetCard,        // The target character's card
  'damage'          // Skill type: 'damage', 'healing', 'debuff', or 'other'
);
```

That's it! The avatar will automatically:
- ✨ Extract from the attacker card
- 🚀 Fly with rotation and glowing trail
- 💥 Impact the target with particles
- 🧹 Clean up all temporary sprites

## Visual Preview

```
Before:                        During:                       After:
┌──────┐                      ┌──────┐                     ┌──────┐
│ 🎭  │                      │      │                     │      │
│      │                      │      │    🎭→              │      │
└──────┘                      └──────┘                     └──────┘
Attacker                                                    
                              ┌──────┐                     ┌──────┐
┌──────┐                      │      │     →🎭✨          │ 💥  │
│      │                      │      │                     │      │
│      │                      │      │                     │      │
└──────┘                      └──────┘                     └──────┘
Target                                                      Target
```

## Features at a Glance 🌟

| Feature | Description |
|---------|-------------|
| **Auto-detection** | Automatically finds avatar in character cards |
| **Smooth Animation** | 0.95s total with 3 phases: fade in, flight, impact |
| **Color-coded** | Different colors for damage (red), healing (green), debuff (purple), other (blue) |
| **Particle Trail** | Dynamic particles follow the projectile |
| **Memory Safe** | Auto-cleanup, no memory leaks |
| **Easy to Use** | Single method call, works with existing code |

## Common Use Cases 📋

### 1. Basic Attack Skill
```typescript
await CardBattleEffects.animateAvatarSkillEffect(
  this.effectsContainer,
  attackerCard,
  targetCard,
  'damage'  // Red glow for attacks
);
```

### 2. Healing Skill
```typescript
await CardBattleEffects.animateAvatarSkillEffect(
  this.effectsContainer,
  healerCard,
  allyCard,
  'healing'  // Green glow for healing
);
```

### 3. Debuff Skill
```typescript
await CardBattleEffects.animateAvatarSkillEffect(
  this.effectsContainer,
  casterCard,
  enemyCard,
  'debuff'  // Purple glow for debuffs
);
```

### 4. Full Battle Combo
```typescript
// Complete skill animation sequence
async function executeUltimateSkill() {
  // 1. Character charges up
  await CardBattleEffects.animateCharacterSkill(attackerCard, 'damage');
  
  // 2. Avatar flies as projectile (NEW!)
  await CardBattleEffects.animateAvatarSkillEffect(
    effectsContainer,
    attackerCard,
    targetCard,
    'damage'
  );
  
  // 3. Screen shake on impact
  await CardBattleEffects.shakeScreen(sceneContainer, 10);
  
  // 4. Apply damage effect
  await CardBattleEffects.applyTargetEffect(targetCard, target, 'damage');
}
```

## Setup Requirements ⚙️

### 1. Effects Container
Make sure you have a container for effects above your cards:

```typescript
// In your scene setup
this.effectsContainer = new Container();
this.addChild(this.cardsContainer);    // Add cards first
this.addChild(this.effectsContainer);  // Add effects above cards
```

### 2. Character Cards
Your character cards should have an avatar sprite with:
- Anchor point at (0.5, 0.5)
- Positioned at the card center
- Valid texture loaded

This is already the case if you're using `CharacterCard` or `HeroCard` from the UI library!

## Documentation Files 📚

| File | Description |
|------|-------------|
| **AVATAR_SKILL_EFFECT.md** | Complete API reference, examples, troubleshooting |
| **AVATAR_EFFECT_EXAMPLE.ts** | Working code examples you can copy |
| **AVATAR_EFFECT_VISUAL_GUIDE.md** | Visual diagrams and animation flow |
| **IMPLEMENTATION_SUMMARY.md** | Technical details and benefits |
| **README_AVATAR_EFFECT.md** | This quick start guide |

## Animation Details ⏱️

The effect runs for approximately **0.95 seconds** total:

1. **Fade In** (0.15s) - Avatar appears and scales up
2. **Flight** (0.6s) - Flies to target with rotation and particles
3. **Impact** (0.2s) - Scales up and fades out on impact

## Color Guide 🎨

| Skill Type | Color | Hex Code | Use Case |
|------------|-------|----------|----------|
| `'damage'` | 🔴 Red | `0xFF4444` | Offensive skills, attacks |
| `'healing'` | 🟢 Green | `0x44FF88` | Healing, support skills |
| `'debuff'` | 🟣 Purple | `0x8844FF` | Debuffs, control effects |
| `'other'` | 🔵 Blue | `0x66CCFF` | Neutral effects, buffs |

## Troubleshooting 🔧

### Avatar Not Showing?
- Check that `effectsContainer` is visible and above card layers
- Verify the character card has an avatar sprite
- Ensure avatar sprite has anchor (0.5, 0.5)

### Wrong Position?
- Make sure card containers have proper `x`, `y`, `width`, `height` properties
- Check container hierarchy for correct coordinate transformation

### Performance Issues?
- Limit to 10 simultaneous effects maximum
- Reduce particle frequency for low-end devices

## Integration Example 💻

Here's a complete example for a battle scene:

```typescript
import { Container } from 'pixi.js';
import { CardBattleEffects, CardGroup } from '@/ui/CardBattleEffects';
import { BaseScene } from '@/ui/BaseScene';

export class MyBattleScene extends BaseScene {
  private effectsContainer: Container;
  private cards: Map<string, Container>;

  async init() {
    // Setup effects container
    this.effectsContainer = new Container();
    this.container.addChild(this.effectsContainer);
    
    // ... setup cards ...
  }

  async executeSkill(
    attackerId: string,
    targetId: string,
    skillType: CardGroup
  ) {
    const attackerCard = this.cards.get(attackerId);
    const targetCard = this.cards.get(targetId);
    
    if (!attackerCard || !targetCard) return;

    // Use the new avatar effect!
    await CardBattleEffects.animateAvatarSkillEffect(
      this.effectsContainer,
      attackerCard,
      targetCard,
      skillType
    );
  }
}
```

## What's Next? 🚀

Try it out in your battle scenes! The effect works immediately with no additional setup required if you're already using the CardBattleEffects system.

For more advanced usage, customization options, and detailed examples, see the complete documentation files listed above.

## Questions or Issues? 💬

- Check **AVATAR_SKILL_EFFECT.md** for comprehensive documentation
- Review **AVATAR_EFFECT_EXAMPLE.ts** for working code examples
- See **AVATAR_EFFECT_VISUAL_GUIDE.md** for visual explanations
- Read **IMPLEMENTATION_SUMMARY.md** for technical details

Enjoy the new avatar effects! 🎮✨
