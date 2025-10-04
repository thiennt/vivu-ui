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

    // ATK in top-left corner
    const atkText = new Text({
      text: `⚔️ \n ${character.atk}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 13,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    atkText.anchor.set(0, 0);
    atkText.x = 5;
    atkText.y = 5;

    // DEF in top-right corner
    const defText = new Text({
      text: `🛡️ \n ${character.def}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 13,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    defText.anchor.set(1, 0);
    defText.x = width - 5;
    defText.y = 5;

    this.addChild(atkText, defText);

    // HP Bar at the bottom
    const hpBarWidth = width * 0.9;
    const hpBarHeight = 6;
    const hpBarX = (width - hpBarWidth) / 2;
    const hpBarY = height - 18;

    // HP Bar background
    const hpBarBg = new Graphics()
      .roundRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight, 3)
      .fill(Colors.HP_BAR_BG);

    // HP Bar foreground
    const hpPercent = Math.max(0, Math.min(1, character.hp / (character.max_hp || character.hp || 1)));
    const hpBarFg = new Graphics()
      .roundRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight, 3)
      .fill(Colors.HP_BAR_FILL);

    this.addChild(hpBarBg, hpBarFg);

    // Energy Bar at the bottom (below HP bar)
    const energyBarWidth = width * 0.9;
    const energyBarHeight = 6;
    const energyBarX = (width - energyBarWidth) / 2;
    const energyBarY = height - 10;

    // Energy Bar background
    const energyBarBg = new Graphics()
      .roundRect(energyBarX, energyBarY, energyBarWidth, energyBarHeight, 3)
      .fill(Colors.BACKGROUND_SECONDARY);

    // Energy Bar foreground
    const maxEnergy = character.max_energy || 100;
    const currentEnergy = character.current_energy || character.energy || 0;
    const energyPercent = Math.max(0, Math.min(1, currentEnergy / maxEnergy));
    const energyBarFg = new Graphics()
      .roundRect(energyBarX, energyBarY, energyBarWidth * energyPercent, energyBarHeight, 3)
      .fill(0x2196f3);

    this.addChild(energyBarBg, energyBarFg);

    // Apply visual effect for defeated characters (hp === 0)
    if (character.hp === 0) {
      this.alpha = 0.5; // Make defeated characters semi-transparent
      
      // Add "DEFEATED" overlay
      const defeatedOverlay = new Graphics();
      defeatedOverlay.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.6 });
      
      const defeatedText = new Text({
        text: 'DEFEATED',
        style: {
          fontFamily: 'Kalam',
          fontSize: Math.max(10, Math.min(14, width * 0.12)),
          fontWeight: 'bold',
          fill: 0xff4444,
          align: 'center'
        }
      });
      defeatedText.anchor.set(0.5);
      defeatedText.x = width / 2;
      defeatedText.y = height / 2;
      
      this.addChild(defeatedOverlay, defeatedText);
    } else if (character.has_acted) {
      // Apply visual effect if character has acted this turn
      this.alpha = 0.5;
      // Add a grayscale/desaturated effect by overlaying a gray tint
      const overlay = new Graphics();
      overlay.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.3 });
      this.addChild(overlay);
    }

    // Add avatar/logo if needed
    this.loadAvatar(character, width, height);
  }

  private async loadAvatar(character: any, width: number, height: number) {
    try {
      const avatarTexture = await Assets.load(character?.avatar_url || 'https://pixijs.com/assets/bunny.png');
      const avatarIcon = new Sprite(avatarTexture);
      
      // Calculate avatar size based on card dimensions
      avatarIcon.width = width * 0.5;
      avatarIcon.height = height * 0.5;
      avatarIcon.anchor.set(0.5);
      avatarIcon.x = width / 2;
      avatarIcon.y = height / 2;
      
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