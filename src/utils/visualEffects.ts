/**
 * Visual effects utility for enhanced game-like UI elements
 * Provides decorative frames, glows, and other visual enhancements
 */

import { Graphics, Container } from 'pixi.js';
import { Colors } from './colors';

export class VisualEffects {
  /**
   * Creates a decorative frame border around a component
   */
  static createDecorativeFrame(width: number, height: number, cornerRadius: number = 12): Graphics {
    const frame = new Graphics();
    
    // Main frame background
    frame.roundRect(0, 0, width, height, cornerRadius)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 3, color: Colors.DECORATION_FRAME });
    
    // Inner highlight
    const innerPadding = 3;
    frame.roundRect(innerPadding, innerPadding, width - innerPadding * 2, height - innerPadding * 2, cornerRadius - 2)
      .stroke({ width: 1, color: Colors.DECORATION_INNER_GLOW, alpha: 0.6 });
    
    return frame;
  }

  /**
   * Creates a battle zone background with enhanced visuals
   */
  static createBattleZoneBackground(width: number, height: number): Graphics {
    const bg = new Graphics();
    
    // Main background
    bg.roundRect(0, 0, width, height, 8)
      .fill(Colors.BATTLEFIELD_PRIMARY);
    
    // Add decorative corner accents
    const accentSize = 16;
    
    // Top-left corner accent
    bg.moveTo(0, accentSize)
      .lineTo(0, 8)
      .arc(8, 8, 8, Math.PI, 3 * Math.PI / 2)
      .lineTo(accentSize, 0)
      .fill({ color: Colors.BATTLEFIELD_ACCENT, alpha: 0.3 });
    
    // Top-right corner accent
    bg.moveTo(width - accentSize, 0)
      .lineTo(width - 8, 0)
      .arc(width - 8, 8, 8, 3 * Math.PI / 2, 0)
      .lineTo(width, accentSize)
      .fill({ color: Colors.BATTLEFIELD_ACCENT, alpha: 0.3 });
    
    // Border with glow effect
    bg.roundRect(0, 0, width, height, 8)
      .stroke({ width: 2, color: Colors.UI_BORDER_GLOW, alpha: 0.8 });
    
    return bg;
  }

  /**
   * Creates an enhanced card background
   */
  static createEnhancedCardBackground(
    width: number, 
    height: number, 
    rarity: string = 'common'
  ): Graphics {
    const card = new Graphics();
    
    // Get rarity color
    const rarityColors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    const rarityColor = rarityColors[rarity] || rarityColors.common;
    
    // Drop shadow
    card.roundRect(2, 2, width, height, 8)
      .fill({ color: Colors.SHADOW_COLOR, alpha: 0.4 });
    
    // Main card background
    card.roundRect(0, 0, width, height, 8)
      .fill(rarityColor)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Inner glow based on rarity
    if (rarity === 'legendary' || rarity === 'epic') {
      card.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.GLOW_COLOR, alpha: 0.7 });
    }
    
    return card;
  }

  /**
   * Creates a glowing energy orb
   */
  static createEnergyOrb(size: number, isActive: boolean = true): Graphics {
    const orb = new Graphics();
    const color = isActive ? Colors.ENERGY_ACTIVE : Colors.ENERGY_INACTIVE;
    
    // Outer glow
    if (isActive) {
      orb.circle(size/2, size/2, size/2 + 4)
        .fill({ color: Colors.GLOW_COLOR, alpha: 0.3 });
    }
    
    // Main orb
    orb.circle(size/2, size/2, size/2)
      .fill(color)
      .stroke({ width: 2, color: Colors.DECORATION_FRAME });
    
    // Inner highlight
    orb.circle(size/2, size/2 - 2, size/4)
      .fill({ color: Colors.DECORATION_INNER_GLOW, alpha: 0.6 });
    
    return orb;
  }

  /**
   * Creates a mystical battle log frame
   */
  static createMysticalFrame(width: number, height: number): Graphics {
    const frame = new Graphics();
    
    // Main background 
    frame.roundRect(0, 0, width, height, 12)
      .fill(Colors.BATTLEFIELD_PRIMARY)
      .stroke({ width: 3, color: Colors.DECORATION_MAGIC });
    
    // Add corner decorations
    const cornerSize = 16;
    
    // Top corners
    frame.moveTo(cornerSize, 2)
      .lineTo(2, 2)
      .lineTo(2, cornerSize)
      .stroke({ width: 2, color: Colors.DECORATION_FRAME });
    
    frame.moveTo(width - cornerSize, 2)
      .lineTo(width - 2, 2)
      .lineTo(width - 2, cornerSize)
      .stroke({ width: 2, color: Colors.DECORATION_FRAME });
    
    // Bottom corners
    frame.moveTo(2, height - cornerSize)
      .lineTo(2, height - 2)
      .lineTo(cornerSize, height - 2)
      .stroke({ width: 2, color: Colors.DECORATION_FRAME });
    
    frame.moveTo(width - 2, height - cornerSize)
      .lineTo(width - 2, height - 2)
      .lineTo(width - cornerSize, height - 2)
      .stroke({ width: 2, color: Colors.DECORATION_FRAME });
    
    return frame;
  }

  /**
   * Creates an enhanced HP bar with glow effects
   */
  static createEnhancedHPBar(
    width: number, 
    height: number, 
    currentHP: number, 
    maxHP: number
  ): Container {
    const container = new Container();
    
    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, height/2)
      .fill(Colors.HP_BAR_BACKGROUND)
      .stroke({ width: 1, color: Colors.UI_BORDER });
    
    // HP fill
    const hpPercent = Math.max(0, currentHP / maxHP);
    const fillWidth = width * hpPercent;
    
    if (fillWidth > 0) {
      const hpFill = new Graphics();
      hpFill.roundRect(0, 0, fillWidth, height, height/2)
        .fill(Colors.HP_BAR_FILL);
      
      // Add glow effect if HP is low
      if (hpPercent <= 0.3) {
        hpFill.roundRect(-2, -2, fillWidth + 4, height + 4, height/2 + 2)
          .stroke({ width: 2, color: Colors.ERROR, alpha: 0.6 });
      }
      
      container.addChild(hpFill);
    }
    
    container.addChild(bg);
    return container;
  }
}