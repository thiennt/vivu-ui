import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { DropShadowFilter, GlowFilter } from 'pixi-filters';
import { gsap } from 'gsap';

const defaultHeroCardOptions = {
  cardType: 'detailed' as 'preview' | 'detailed' | 'lineup' | 'pool',
  customWidth: undefined as number | undefined,
  gameWidth: 800,
};

export type HeroCardOptions = typeof defaultHeroCardOptions;

/**
 * A hero card with multiple display modes
 */
export class HeroCard extends Container {
  public character: any;
  private cardWidth: number;
  private cardHeight: number;

  constructor(character: any, options: Partial<HeroCardOptions> = {}) {
    super();
    
    const opts = { ...defaultHeroCardOptions, ...options };
    this.character = character;

    // Define card dimensions based on type - optimized for 400x700
    const cardSizes = {
      preview: { width: opts.customWidth || 100, height: (opts.customWidth || 100) * 1.25 }, // Reduced from 120
      detailed: { width: opts.customWidth || 110, height: (opts.customWidth || 110) * 1.25 }, // Reduced from 140
      lineup: { width: opts.customWidth || 85, height: opts.customWidth || 85 }, // Reduced from 100
      pool: { width: opts.customWidth || 75, height: opts.customWidth || 75 } // Reduced from 90
    };
    
    const { width, height } = cardSizes[opts.cardType];
    this.cardWidth = width;
    this.cardHeight = height;

    // Create polished card base
    this.createPolishedCard(width, height);

    // Create card background with rarity color
    const rarityColors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill(rarityColors[character.rarity] || rarityColors.common)
      .stroke({ width: 2, color: Colors.CARD_BORDER });

    this.addChild(bg);

    // Character name - responsive font size (reduced for 400x700)
    const baseNameSize = opts.cardType === 'detailed' ? 14 : (opts.cardType === 'preview' ? 12 : 10); // Reduced all by 2
    const nameSize = this.calculateResponsiveFontSize(baseNameSize, width, opts.gameWidth, 9, 16); // Reduced max from 20 to 16
    const nameText = new Text({
      text: character.name,
      style: {
        fontFamily: 'Roboto',
        fontSize: nameSize,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = width / 2;
    nameText.y = opts.cardType === 'lineup' || opts.cardType === 'pool' ? height / 2 - 15 : height * 0.15;

    // Load avatar
    this.loadAvatar(character, width, height);
    
    // Add additional elements based on card type
    if (opts.cardType === 'detailed') {
      this.addDetailedCardElements(character, width, height, opts.gameWidth);
    } else if (opts.cardType === 'preview') {
      this.addPreviewCardElements(character, width, height);
    }

    this.interactive = true;
    this.cursor = 'pointer';
  }

  private createPolishedCard(w: number, h: number, isSelected: boolean = false) {
    // Shadow
    this.filters = [
      new DropShadowFilter({ color: Colors.SHADOW_COLOR, alpha: 0.17, blur: 8, offset: { x: 4, y: 4 } })
    ];

    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 12).fill(Colors.ACTIVE_WHITE);
    this.addChild(bg);

    // Glow on selection
    if (isSelected) {
      this.filters = [
        ...(this.filters ?? []),
        new GlowFilter({ color: Colors.HERO_GLOW_ORANGE, distance: 8, outerStrength: 2, innerStrength: 0.8 })
      ];
    }
  }

  private async loadAvatar(character: any, cardWidth: number, cardHeight: number) {
    try {
      const avatarTexture = await Assets.load(character?.avatar_url || 'https://pixijs.com/assets/bunny.png');
      const avatarIcon = new Sprite(avatarTexture);
      
      // Calculate avatar size based on card dimensions
      const avatarSize = Math.min(cardWidth * 0.4, cardHeight * 0.4, 80);
      avatarIcon.width = avatarSize;
      avatarIcon.height = avatarSize;
      avatarIcon.anchor.set(0.5);
      avatarIcon.x = cardWidth / 2;
      avatarIcon.y = avatarSize - 10;
      
      this.addChild(avatarIcon);
    } catch (error) {
      console.warn('Failed to load avatar:', error);
    }
  }

  private addDetailedCardElements(character: any, width: number, height: number, gameWidth: number) {    
    // Experience with responsive font
    const baseExpSize = 9;
    const expSize = this.calculateResponsiveFontSize(baseExpSize, width, gameWidth, 7, 12);
    const expText = new Text({
      text: `EXP: ${character.exp}`,
      style: {
        fontFamily: 'Roboto',
        fontSize: expSize,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    expText.anchor.set(0.5);
    expText.x = width / 2;
    expText.y = height * 0.65;
    
    // Stats in a compact grid with responsive font
    const baseStatSize = 8;
    const statSize = this.calculateResponsiveFontSize(baseStatSize, width, gameWidth, 6, 10);
    const stats = [
      `HP: ${character.hp}`,
      `ATK: ${character.atk}`,
      `DEF: ${character.def}`,
      `AGI: ${character.agi}`
    ];
    
    stats.forEach((stat, index) => {
      const statText = new Text({
        text: stat,
        style: {
          fontFamily: 'Roboto',
          fontSize: statSize,
          fill: Colors.TEXT_SECONDARY
        }
      });
      statText.x = width * 0.08 + (index % 2) * (width / 2 - width * 0.08);
      statText.y = height * 0.72 + Math.floor(index / 2) * (height * 0.08);
      this.addChild(statText);
    });
    
    this.addChild(expText);
  }

  private addPreviewCardElements(character: any, width: number, height: number) {
    // Basic stats for preview
    const hpText = new Text({
      text: `❤️ ${character.hp}`,
      style: {
        fontFamily: 'Roboto',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY
      }
    });
    hpText.x = width / 4;
    hpText.y = 85;

    const atkText = new Text({
      text: `⚔️ ${character.atk}`,
      style: {
        fontFamily: 'Roboto',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY
      }
    });
    atkText.x = width / 4;
    atkText.y = 105;

    const defText = new Text({
      text: `🛡️ ${character.def}`,
      style: {
        fontFamily: 'Roboto',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY
      }
    });
    defText.x = width / 4;
    defText.y = 125;

    this.addChild(hpText, atkText, defText);
  }

  private calculateResponsiveFontSize(
    baseSize: number,
    cardWidth: number,
    screenWidth: number,
    minSize: number = 8,
    maxSize: number = 24
  ): number {
    const baseCardWidth = 120;
    const cardScale = cardWidth / baseCardWidth;
    
    const baseScreenWidth = 800;
    const screenScale = Math.min(screenWidth / baseScreenWidth, 1.2);
    
    const scaledSize = baseSize * cardScale * screenScale;
    
    return Math.max(minSize, Math.min(maxSize, scaledSize));
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
