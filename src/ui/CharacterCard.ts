import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { gsap } from 'gsap';

const defaultCharacterCardOptions = {
  width: 100,
  height: 120,
};

export type CharacterCardOptions = typeof defaultCharacterCardOptions;

/**
 * A character card with stats, HP bar, and avatar
 */
export class CharacterCard extends Container {
  public character: any;

  constructor(character: any, options: Partial<CharacterCardOptions> = {}) {
    super();
    
    const opts = { ...defaultCharacterCardOptions, ...options };
    this.character = character;
    const { width, height } = opts;

    // Enhanced character card background with trading card appearance
    const bg = new Graphics();
    
    // Card shadow for depth
    bg.roundRect(3, 3, width, height, 8)
      .fill({ color: Colors.SHADOW_COLOR, alpha: 0.4 });
    
    // Get rarity color for background
    const rarityColors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    const rarityColor = rarityColors[character.rarity] || rarityColors.common;
    
    // Main card background
    bg.roundRect(0, 0, width, height, 8)
      .fill(rarityColor)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Inner card frame
    bg.roundRect(3, 3, width - 6, height - 6, 5)
      .stroke({ width: 1, color: Colors.TEXT_WHITE, alpha: 0.4 });

    this.addChild(bg);

    // HP Bar in the middle section
    const hpBarWidth = width * 0.8;
    const hpBarHeight = 8;
    const hpBarX = (width - hpBarWidth) / 2;
    const hpBarY = height * 0.45;

    // HP Bar background
    const hpBarBg = new Graphics()
      .roundRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight, 4)
      .fill(Colors.HP_BAR_BG);

    // HP Bar foreground
    const hpPercent = Math.max(0, Math.min(1, character.hp / (character.max_hp || character.hp || 1)));
    const hpBarFg = new Graphics()
      .roundRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight, 4)
      .fill(Colors.HP_BAR_FILL);

    this.addChild(hpBarBg, hpBarFg);

    // Stats area at bottom
    const atkText = new Text({
      text: `⚔️${character.atk}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    atkText.anchor.set(0.5);
    atkText.x = width / 2;
    atkText.y = height * 0.65;

    const defText = new Text({
      text: `🛡️${character.def}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    defText.anchor.set(0.5);
    defText.x = width / 2;
    defText.y = height * 0.85;

    this.addChild(atkText, defText);

    // Apply visual effect if character has acted this turn
    if (character.has_acted) {
      this.alpha = 0.6;
      // Add a grayscale/desaturated effect by overlaying a gray tint
      const overlay = new Graphics();
      overlay.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.4 });
      this.addChild(overlay);
      
      // Add "ACTED" indicator badge
      const badge = new Graphics();
      badge.roundRect(0, 0, width * 0.7, 20, 4)
        .fill({ color: 0x555555, alpha: 0.9 })
        .stroke({ width: 1, color: Colors.TEXT_WHITE });
      badge.x = (width - width * 0.7) / 2;
      badge.y = height * 0.1;
      
      const badgeText = new Text({
        text: 'ACTED',
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fontWeight: 'bold',
          fill: Colors.TEXT_WHITE
        }
      });
      badgeText.anchor.set(0.5);
      badgeText.x = width / 2;
      badgeText.y = height * 0.1 + 10;
      
      this.addChild(badge, badgeText);
    }

    // Add avatar/logo if needed
    this.loadAvatar(character, width, height);
  }

  private async loadAvatar(character: any, width: number, height: number) {
    try {
      const avatarTexture = await Assets.load(character?.avatar_url || 'https://pixijs.com/assets/bunny.png');
      const avatarIcon = new Sprite(avatarTexture);
      
      // Calculate avatar size based on card dimensions
      const avatarSize = Math.min(width * 0.4, height * 0.4, 80);
      avatarIcon.width = avatarSize;
      avatarIcon.height = avatarSize;
      avatarIcon.anchor.set(0.5);
      avatarIcon.x = width / 2;
      avatarIcon.y = height * 0.25;
      
      this.addChild(avatarIcon);
    } catch (error) {
      console.warn('Failed to load avatar:', error);
    }
  }

  /** Show the card with optional animation */
  public async show(animated = true) {
    gsap.killTweensOf(this);
    this.visible = true;
    if (animated) {
      this.alpha = 0;
      this.scale.set(0.5);
      await gsap.to(this, { alpha: 1, duration: 0.3, ease: 'power2.out' });
      await gsap.to(this.scale, { x: 1, y: 1, duration: 0.3, ease: 'back.out' });
    } else {
      this.alpha = 1;
      this.scale.set(1);
    }
  }

  /** Hide the card with optional animation */
  public async hide(animated = true) {
    gsap.killTweensOf(this);
    if (animated) {
      await gsap.to(this.scale, { x: 0.5, y: 0.5, duration: 0.2, ease: 'back.in' });
      await gsap.to(this, { alpha: 0, duration: 0.2, ease: 'power2.in' });
    } else {
      this.alpha = 0;
      this.scale.set(0.5);
    }
    this.visible = false;
  }
}
