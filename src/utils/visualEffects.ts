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
   * Creates a simplified battle zone background
   */
  static createBattleZoneBackground(width: number, height: number): Graphics {
    const bg = new Graphics();
    
    // Simple background
    bg.roundRect(0, 0, width, height, 8)
      .fill(Colors.BATTLEFIELD_PRIMARY)
      .stroke({ width: 1, color: Colors.BATTLEFIELD_BORDER, alpha: 0.5 });
    
    return bg;
  }

  /**
   * Creates a simplified card background
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
    
    // Subtle drop shadow
    card.roundRect(2, 2, width, height, 8)
      .fill({ color: Colors.SHADOW_COLOR, alpha: 0.2 });
    
    // Main card background
    card.roundRect(0, 0, width, height, 8)
      .fill(rarityColor)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Simple inner border for premium feel
    card.roundRect(3, 3, width - 6, height - 6, 5)
      .stroke({ width: 1, color: Colors.TEXT_WHITE, alpha: 0.3 });
    
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
   * Creates an epic battle arena frame with mystical elements
   */
  static createEpicBattleFrame(width: number, height: number): Graphics {
    const frame = new Graphics();
    
    // Deep shadow base
    frame.roundRect(4, 4, width, height, 12)
      .fill({ color: Colors.BATTLE_SHADOW_DEEP, alpha: 0.7 });
    
    // Main frame background with gradient effect
    frame.roundRect(0, 0, width, height, 12)
      .fill(Colors.BATTLEFIELD_PRIMARY);
    
    // Inner mystical glow
    frame.roundRect(3, 3, width - 6, height - 6, 9)
      .stroke({ width: 2, color: Colors.MYSTICAL_GLOW, alpha: 0.6 });
    
    // Golden battle frame
    frame.roundRect(0, 0, width, height, 12)
      .stroke({ width: 4, color: Colors.BATTLE_FRAME_GOLD });
    
    // Enhanced corner decorations with battle symbols
    const cornerSize = 24;
    const cornerThickness = 4;
    
    // Top corners with enhanced mystical design
    frame.moveTo(cornerSize, 2)
      .lineTo(2, 2)
      .lineTo(2, cornerSize)
      .stroke({ width: cornerThickness, color: Colors.EPIC_BORDER_GLOW });
    
    frame.moveTo(width - cornerSize, 2)
      .lineTo(width - 2, 2)
      .lineTo(width - 2, cornerSize)
      .stroke({ width: cornerThickness, color: Colors.EPIC_BORDER_GLOW });
    
    // Bottom corners with enhanced mystical design
    frame.moveTo(2, height - cornerSize)
      .lineTo(2, height - 2)
      .lineTo(cornerSize, height - 2)
      .stroke({ width: cornerThickness, color: Colors.EPIC_BORDER_GLOW });
    
    frame.moveTo(width - 2, height - cornerSize)
      .lineTo(width - 2, height - 2)
      .lineTo(width - cornerSize, height - 2)
      .stroke({ width: cornerThickness, color: Colors.EPIC_BORDER_GLOW });
    
    // Add mystical energy lines in corners
    const energyOffset = 8;
    
    // Top-left energy lines
    frame.moveTo(energyOffset, energyOffset + 8)
      .lineTo(energyOffset + 8, energyOffset)
      .stroke({ width: 2, color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.8 });
    
    // Top-right energy lines
    frame.moveTo(width - energyOffset - 8, energyOffset)
      .lineTo(width - energyOffset, energyOffset + 8)
      .stroke({ width: 2, color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.8 });
    
    // Bottom-left energy lines
    frame.moveTo(energyOffset, height - energyOffset - 8)
      .lineTo(energyOffset + 8, height - energyOffset)
      .stroke({ width: 2, color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.8 });
    
    // Bottom-right energy lines
    frame.moveTo(width - energyOffset - 8, height - energyOffset)
      .lineTo(width - energyOffset, height - energyOffset - 8)
      .stroke({ width: 2, color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.8 });
    
    return frame;
  }

  /**
   * Creates a mystical battle log frame
   */
  static createMysticalFrame(width: number, height: number): Graphics {
    const frame = new Graphics();
    
    // Shadow for depth
    frame.roundRect(2, 2, width, height, 12)
      .fill({ color: Colors.BATTLE_SHADOW_DEEP, alpha: 0.5 });
    
    // Main background with battle theme
    frame.roundRect(0, 0, width, height, 12)
      .fill(Colors.BATTLEFIELD_PRIMARY);
    
    // Inner mystical glow
    frame.roundRect(2, 2, width - 4, height - 4, 10)
      .stroke({ width: 1, color: Colors.MYSTICAL_GLOW, alpha: 0.7 });
    
    // Main mystical border
    frame.roundRect(0, 0, width, height, 12)
      .stroke({ width: 3, color: Colors.BATTLE_MAGIC_AURA });
    
    // Add enhanced corner decorations
    const cornerSize = 18;
    
    // Top corners with mystical energy
    frame.moveTo(cornerSize, 2)
      .lineTo(2, 2)
      .lineTo(2, cornerSize)
      .stroke({ width: 3, color: Colors.BATTLE_FRAME_GOLD });
    
    frame.moveTo(width - cornerSize, 2)
      .lineTo(width - 2, 2)
      .lineTo(width - 2, cornerSize)
      .stroke({ width: 3, color: Colors.BATTLE_FRAME_GOLD });
    
    // Bottom corners with mystical energy
    frame.moveTo(2, height - cornerSize)
      .lineTo(2, height - 2)
      .lineTo(cornerSize, height - 2)
      .stroke({ width: 3, color: Colors.BATTLE_FRAME_GOLD });
    
    frame.moveTo(width - 2, height - cornerSize)
      .lineTo(width - 2, height - 2)
      .lineTo(width - cornerSize, height - 2)
      .stroke({ width: 3, color: Colors.BATTLE_FRAME_GOLD });
    
    // Add subtle energy orbs in corners
    const orbSize = 4;
    const orbOffset = 6;
    
    // Corner energy orbs
    frame.circle(orbOffset, orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.8 });
    
    frame.circle(width - orbOffset, orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.8 });
    
    frame.circle(orbOffset, height - orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.8 });
    
    frame.circle(width - orbOffset, height - orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.8 });
    
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