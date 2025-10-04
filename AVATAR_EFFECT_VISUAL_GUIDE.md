# Avatar Skill Effect - Visual Guide

## Animation Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Avatar Skill Effect Timeline                     │
└─────────────────────────────────────────────────────────────────────┘

Time: 0s                    0.15s                 0.75s             0.95s
      │                      │                     │                 │
      ▼                      ▼                     ▼                 ▼
┌──────────┐          ┌──────────┐          ┌──────────┐      ┌──────────┐
│ Phase 1  │          │ Phase 2  │          │ Phase 2  │      │ Phase 3  │
│ Fade In  │  ──────▶ │  Flight  │  ──────▶ │  Flight  │ ───▶ │  Impact  │
└──────────┘          └──────────┘          └──────────┘      └──────────┘
 
    🎭                   🎭→                   →🎭              💥🎭
 (Attacker)          (Mid-flight)           (Near Target)    (Target)

  alpha: 0→1           rotation: 0→2π        particles:       scale: 1.5
  scale: 0.8→1.2       glow: pulse          trailing ✨       alpha: 0
  
```

## Visual Elements

### 1. Avatar Clone
```
    Original Avatar          Clone Created           Flying           Impact
    ┌──────────┐            ┌──────────┐          ┌──────────┐     ┌──────────┐
    │   🎭    │     ═══▶    │   🎭    │   ═══▶   │   🎭⟳   │ ═▶  │    💥    │
    │ (static) │            │ (start)  │          │ (flying) │     │ (impact) │
    └──────────┘            └──────────┘          └──────────┘     └──────────┘
```

### 2. Glow Effect
```
    Start                   Mid-Flight              End
    ⚪ (alpha: 0)           ⭕ (alpha: 0.6)        ⭕⭕ (alpha: 0, scale: 2)
                           Color based on skill:
                           🔴 damage   🟢 healing   🟣 debuff   🔵 other
```

### 3. Particle Trail
```
    Flight Path with Particles:
    
    🎭 ✨                        ✨ = Particle (random spawn)
        ✨ → → → ✨
            ✨     ✨ → → → 💥
                ✨ → ✨
                
    Particles fade out: ●●● → ◐◐◐ → ◯◯◯ (disappear)
```

## Skill Type Visual Styles

### Damage (Red)
```
🎭 ─────────────────────▶ 💥
    🔴 Red glow trail
    🔴 Aggressive red glow
    Fast rotation (360°)
```

### Healing (Green)
```
🎭 ─────────────────────▶ ✨
    🟢 Green glow trail
    🟢 Gentle green glow
    Smooth rotation (360°)
```

### Debuff (Purple)
```
🎭 ─────────────────────▶ 🌀
    🟣 Purple glow trail
    🟣 Dark purple glow
    Ominous rotation (360°)
```

### Other (Blue)
```
🎭 ─────────────────────▶ ⭐
    🔵 Blue glow trail
    🔵 Neutral blue glow
    Standard rotation (360°)
```

## Position Transformation

```
Battle Scene Layout:
┌─────────────────────────────────────────────────────────┐
│  Scene Container                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Effects Container (Layer above cards)              │ │
│  │                                                     │ │
│  │  [Avatar Clone appears here during animation]      │ │
│  │                                                     │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────┐                      ┌────────────┐     │
│  │ Attacker   │  ═══════════════▶   │  Target    │     │
│  │   Card     │    (Avatar path)     │   Card     │     │
│  │   🎭      │                      │   💥      │     │
│  └────────────┘                      └────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Coordinate Transformation Flow

```
1. Get Attacker Position
   characterCard.toGlobal() ──▶ Global coordinates (screen space)
                                     │
2. Convert to Effects Space         │
   effectsContainer.toLocal() ◀─────┘
                                     │
3. Create Clone at Start Position   │
   avatarClone.x = startPos.x ◀─────┘
   avatarClone.y = startPos.y

4. Same process for Target Position
   
5. Animate: startPos → endPos
```

## Integration Example Flow

```
Battle Action Sequence:

┌─────────────────────────────────────────────────────────────┐
│ 1. Attacker Preparation                                     │
│    CardBattleEffects.animateCharacterSkill()                │
│    🎭 (character glows, scales up)                          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Avatar Projectile Launch (NEW!)                          │
│    CardBattleEffects.animateAvatarSkillEffect()             │
│    🎭 → → → → → 💥                                         │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Impact Effects                                            │
│    CardBattleEffects.applyTargetEffect()                    │
│    💥 (target shakes, damage numbers appear)                │
└─────────────────────────────────────────────────────────────┘
```

## Performance Characteristics

```
Resource Usage per Effect:

Sprites Created:     1 (avatar clone)
Graphics Created:    1 (glow) + ~20-30 (particles)
Timeline Duration:   0.95 seconds
Peak Memory:         ~2-3KB per effect
Cleanup:            Automatic at end

Multiple Effects:
├─ 5 simultaneous:  OK ✓
├─ 10 simultaneous: OK ✓
└─ 20+ simultaneous: Consider throttling ⚠️
```

## Quick Reference

### Method Signature
```typescript
animateAvatarSkillEffect(
  effectsContainer: Container,  // Where to render
  attackerCard: Container,      // Source card
  targetCard: Container,        // Target card
  cardGroup: CardGroup          // 'damage'|'healing'|'debuff'|'other'
): Promise<void>
```

### Color Codes
- 🔴 Damage:  `0xFF4444` (red)
- 🟢 Healing: `0x44FF88` (green)
- 🟣 Debuff:  `0x8844FF` (purple)
- 🔵 Other:   `0x66CCFF` (blue)

### Timing Breakdown
- **0.00s - 0.15s**: Fade in and scale up
- **0.15s - 0.75s**: Flight with rotation and particles (0.6s)
- **0.75s - 0.95s**: Impact and fade out
- **Total**: 0.95 seconds

### Requirements
✓ PixiJS 7.3+
✓ GSAP 3.13+
✓ Character cards must have avatar sprite with anchor (0.5, 0.5)
✓ Effects container must be above card layers

## Troubleshooting Visual Issues

### Avatar Not Visible
```
Issue: Avatar doesn't appear during animation

Check:
1. Is effectsContainer visible?
   └─▶ container.visible = true
   
2. Is effectsContainer above cards?
   └─▶ scene.addChild(cardsContainer)
       scene.addChild(effectsContainer)  ← Must be after
   
3. Does card have avatar sprite?
   └─▶ Check with: cardBattleEffects.findAvatarSprite(card)
```

### Wrong Position
```
Issue: Avatar appears in wrong location

Check:
1. Container hierarchy
   └─▶ Ensure toGlobal/toLocal transforms work
   
2. Card dimensions
   └─▶ card.width and card.height must be set
   
3. Z-index ordering
   └─▶ effectsContainer should be top layer
```

## Examples in Action

See these files for working examples:
- `AVATAR_EFFECT_EXAMPLE.ts` - Code examples
- `AVATAR_SKILL_EFFECT.md` - Complete documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical overview

## Try It Yourself

```typescript
// Simple test
import { CardBattleEffects } from '@/ui/CardBattleEffects';

// Setup (in your scene)
const effects = new Container();
this.addChild(effects);

// Execute
await CardBattleEffects.animateAvatarSkillEffect(
  effects,
  myAttacker,
  myTarget,
  'damage'
);
```

Enjoy the new avatar skill effects! 🎮✨
