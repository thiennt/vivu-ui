/**
 * Effect icon utility for displaying status effects on character cards
 */
import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from './colors';

export interface EffectIconConfig {
  icon: string;
  color: string;
  bgColor: string;
}

/**
 * Map of effect names/IDs to their visual representation
 */
export const EFFECT_ICON_MAP: Record<string, EffectIconConfig> = {
  // Buffs
  'ATK Buff': { icon: '⚔️', color: Colors.STAT_ATK, bgColor: Colors.EFFECT_BUFF_BLUE },
  'DEF Buff': { icon: '🛡️', color: Colors.STAT_DEF, bgColor: Colors.EFFECT_BUFF_BLUE },
  'AGI Buff': { icon: '⚡', color: Colors.STAT_AGI, bgColor: Colors.EFFECT_BUFF_BLUE },
  'Cleanse': { icon: '✨', color: Colors.EFFECT_HEAL_GREEN, bgColor: Colors.EFFECT_BUFF_CYAN },
  'Shield': { icon: '🛡️', color: Colors.STAT_DEF, bgColor: Colors.EFFECT_BUFF_BLUE },
  'Regen': { icon: '💚', color: Colors.EFFECT_HEAL_GREEN, bgColor: Colors.EFFECT_HEAL_BRIGHT },
  
  // Debuffs
  'ATK Down': { icon: '⚔️', color: Colors.STAT_ATK, bgColor: Colors.EFFECT_DEBUFF_PURPLE },
  'DEF Down': { icon: '🛡️', color: Colors.STAT_DEF, bgColor: Colors.EFFECT_DEBUFF_PURPLE },
  'AGI Down': { icon: '⚡', color: Colors.STAT_AGI, bgColor: Colors.EFFECT_DEBUFF_PURPLE },
  'Poison': { icon: '☠️', color: Colors.STAT_HP, bgColor: Colors.EFFECT_DEBUFF_DARK },
  'Burn': { icon: '🔥', color: Colors.EFFECT_FIRE_RED, bgColor: Colors.EFFECT_FIRE_ORANGE },
  'Frozen': { icon: '❄️', color: Colors.EFFECT_ICE_BLUE, bgColor: Colors.EFFECT_ICE_LIGHT },
  'Stun': { icon: '💫', color: Colors.EFFECT_YELLOW, bgColor: Colors.EFFECT_DEBUFF_PURPLE },
  'Bleed': { icon: '🩸', color: Colors.EFFECT_DAMAGE_RED, bgColor: Colors.EFFECT_DAMAGE_DARK },
  'Silence': { icon: '🔇', color: Colors.TEXT_SECONDARY, bgColor: Colors.EFFECT_DEBUFF_DARK },
  'Blind': { icon: '👁️', color: Colors.TEXT_SECONDARY, bgColor: Colors.DEFEATED_OVERLAY },
  
  // Default fallback
  'default': { icon: '●', color: Colors.TEXT_PRIMARY, bgColor: Colors.EFFECT_BUFF_CYAN }
};

/**
 * Get effect icon configuration for a given effect name
 */
export function getEffectIconConfig(effectName: string): EffectIconConfig {
  // Try exact match
  if (EFFECT_ICON_MAP[effectName]) {
    return EFFECT_ICON_MAP[effectName];
  }
  
  // Try case-insensitive match
  const lowerName = effectName.toLowerCase();
  for (const key in EFFECT_ICON_MAP) {
    if (key.toLowerCase() === lowerName) {
      return EFFECT_ICON_MAP[key];
    }
  }
  
  // Try partial match for common patterns
  if (lowerName.includes('buff') || lowerName.includes('up')) {
    return { icon: '↑', color: Colors.EFFECT_BUFF_BLUE, bgColor: Colors.EFFECT_BUFF_CYAN };
  }
  if (lowerName.includes('debuff') || lowerName.includes('down')) {
    return { icon: '↓', color: Colors.EFFECT_DEBUFF_PURPLE, bgColor: Colors.EFFECT_DEBUFF_DARK };
  }
  if (lowerName.includes('heal') || lowerName.includes('regen')) {
    return { icon: '+', color: Colors.EFFECT_HEAL_GREEN, bgColor: Colors.EFFECT_HEAL_BRIGHT };
  }
  if (lowerName.includes('poison') || lowerName.includes('toxic')) {
    return { icon: '☠️', color: Colors.STAT_HP, bgColor: Colors.EFFECT_DEBUFF_DARK };
  }
  if (lowerName.includes('fire') || lowerName.includes('burn')) {
    return { icon: '🔥', color: Colors.EFFECT_FIRE_RED, bgColor: Colors.EFFECT_FIRE_ORANGE };
  }
  if (lowerName.includes('ice') || lowerName.includes('freeze') || lowerName.includes('frozen')) {
    return { icon: '❄️', color: Colors.EFFECT_ICE_BLUE, bgColor: Colors.EFFECT_ICE_LIGHT };
  }
  
  return EFFECT_ICON_MAP['default'];
}

/**
 * Create a visual effect icon badge
 * @param effectName - Name of the effect
 * @param stacks - Number of stacks (optional, displayed if > 1)
 * @param duration - Remaining duration (optional, displayed if provided)
 * @param size - Size of the icon badge (default: 20)
 */
export function createEffectIcon(
  effectName: string,
  stacks?: number,
  duration?: number,
  size: number = 20
): Container {
  const container = new Container();
  const config = getEffectIconConfig(effectName);
  
  // Background circle
  const bg = new Graphics();
  bg.circle(size / 2, size / 2, size / 2);
  bg.fill({ color: config.bgColor, alpha: 0.85 });
  bg.stroke({ width: 1.5, color: config.color, alpha: 0.9 });
  container.addChild(bg);
  
  // Icon emoji or symbol
  const iconText = new Text({
    text: config.icon,
    style: {
      fontSize: Math.floor(size * 0.6),
      align: 'center'
    }
  });
  iconText.anchor.set(0.5);
  iconText.x = size / 2;
  iconText.y = size / 2;
  container.addChild(iconText);
  
  // Stack count indicator (if stacks > 1)
  if (stacks && stacks > 1) {
    const stackBadge = new Graphics();
    const badgeSize = size * 0.4;
    stackBadge.circle(size - badgeSize / 2, badgeSize / 2, badgeSize / 2);
    stackBadge.fill({ color: Colors.EFFECT_GOLD, alpha: 0.95 });
    stackBadge.stroke({ width: 1, color: Colors.TEXT_PRIMARY, alpha: 0.8 });
    
    const stackText = new Text({
      text: `${stacks}`,
      style: {
        fontSize: Math.floor(badgeSize * 0.8),
        fill: Colors.TEXT_PRIMARY,
        fontWeight: 'bold',
        align: 'center'
      }
    });
    stackText.anchor.set(0.5);
    stackText.x = size - badgeSize / 2;
    stackText.y = badgeSize / 2;
    
    container.addChild(stackBadge, stackText);
  }
  
  // Duration indicator (if provided)
  if (duration !== undefined && duration >= 0) {
    const durationBadge = new Graphics();
    const badgeSize = size * 0.35;
    durationBadge.circle(badgeSize / 2, size - badgeSize / 2, badgeSize / 2);
    durationBadge.fill({ color: Colors.EFFECT_WHITE, alpha: 0.9 });
    durationBadge.stroke({ width: 1, color: Colors.TEXT_SECONDARY, alpha: 0.7 });
    
    const durationText = new Text({
      text: `${duration}`,
      style: {
        fontSize: Math.floor(badgeSize * 0.8),
        fill: Colors.TEXT_SECONDARY,
        fontWeight: 'bold',
        align: 'center'
      }
    });
    durationText.anchor.set(0.5);
    durationText.x = badgeSize / 2;
    durationText.y = size - badgeSize / 2;
    
    container.addChild(durationBadge, durationText);
  }
  
  return container;
}

/**
 * Create a row of effect icons from an array of active effects
 * @param activeEffects - Array of active effects
 * @param maxIcons - Maximum number of icons to display (default: 5)
 * @param iconSize - Size of each icon (default: 20)
 * @param spacing - Space between icons (default: 4)
 */
export function createEffectIconRow(
  activeEffects: any[],
  maxIcons: number = 5,
  iconSize: number = 20,
  spacing: number = 4
): Container {
  const container = new Container();
  
  if (!activeEffects || activeEffects.length === 0) {
    return container;
  }
  
  // Display up to maxIcons effects
  const effectsToShow = activeEffects.slice(0, maxIcons);
  
  effectsToShow.forEach((effect, index) => {
    const icon = createEffectIcon(
      effect.name || effect.effectId || 'default',
      effect.stacks,
      effect.remainingDuration,
      iconSize
    );
    icon.x = index * (iconSize + spacing);
    container.addChild(icon);
  });
  
  // If there are more effects, show a "+X" indicator
  if (activeEffects.length > maxIcons) {
    const moreIndicator = new Container();
    
    const moreBg = new Graphics();
    moreBg.circle(iconSize / 2, iconSize / 2, iconSize / 2);
    moreBg.fill({ color: Colors.EFFECT_GOLD, alpha: 0.7 });
    moreBg.stroke({ width: 1.5, color: Colors.TEXT_PRIMARY, alpha: 0.8 });
    
    const moreText = new Text({
      text: `+${activeEffects.length - maxIcons}`,
      style: {
        fontSize: Math.floor(iconSize * 0.5),
        fill: Colors.TEXT_PRIMARY,
        fontWeight: 'bold',
        align: 'center'
      }
    });
    moreText.anchor.set(0.5);
    moreText.x = iconSize / 2;
    moreText.y = iconSize / 2;
    
    moreIndicator.addChild(moreBg, moreText);
    moreIndicator.x = effectsToShow.length * (iconSize + spacing);
    container.addChild(moreIndicator);
  }
  
  return container;
}
