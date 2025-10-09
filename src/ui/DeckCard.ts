import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { Card, CardType } from '@/types';
import { gsap } from 'gsap';
import { DropShadowFilter } from 'pixi-filters';

const defaultDeckCardOptions = {
  width: 70,
  height: 100,
  fontScale: 1,
  showDescription: false,
  maxDescriptionLength: 50,
  enableHover: true,
};

export type DeckCardOptions = typeof defaultDeckCardOptions;

/**
 * A compact deck card optimized for 70x100px showing energy cost, group icon, and avatar
 */
export class DeckCard extends Container {
  private bg: Graphics;
  private hoverOverlay: Graphics;
  public card: Card;

  constructor(
    card: Card,
    options: Partial<DeckCardOptions> & { onClick?: (card: Card) => void } = {}
  ) {
    super();
    
    const opts = { ...defaultDeckCardOptions, ...options };
    this.card = card;
    const { width, height, fontScale, enableHover } = opts;

    // Enhanced card background with warmer palette
    this.bg = new Graphics();
    
    // Multi-layer shadow for depth
    this.bg.roundRect(2.5, 2.5, width, height, 5)
      .fill({ color: 0x000000, alpha: 0.3 });
    
    this.bg.roundRect(1.5, 1.5, width, height, 5)
      .fill({ color: 0x000000, alpha: 0.15 });
    
    // Main card background - warmer brown-grey
    this.bg.roundRect(0, 0, width, height, 5)
      .fill({ color: 0x2d3436, alpha: 0.98 })  // Charcoal grey
      .stroke({ width: 1.5, color: 0x636e72 });   // Medium grey border
    
    // Inner glow/highlight
    this.bg.roundRect(1.5, 1.5, width - 3, height - 3, 3.5)
      .stroke({ width: 0.8, color: 0x95a5a6, alpha: 0.3 });

    // Avatar/Art frame in center with decorative corners
    const frameMargin = 6;
    const frameY = 28;
    const frameHeight = height - 34;
    const frameWidth = width - (frameMargin * 2);
    
    // Dark inner frame for avatar/art
    this.bg.roundRect(frameMargin, frameY, frameWidth, frameHeight, 3)
      .fill({ color: 0x1a1d1f, alpha: 0.9 })
      .stroke({ width: 1, color: 0x636e72, alpha: 0.5 });
    
    // Decorative corner accents
    const cornerSize = 5;
    const cornerColor = 0x95a5a6;
    
    // Top-left corner
    this.bg.moveTo(frameMargin, frameY + cornerSize)
      .lineTo(frameMargin, frameY)
      .lineTo(frameMargin + cornerSize, frameY)
      .stroke({ width: 1.2, color: cornerColor, alpha: 0.8 });
    
    // Top-right corner
    this.bg.moveTo(frameMargin + frameWidth - cornerSize, frameY)
      .lineTo(frameMargin + frameWidth, frameY)
      .lineTo(frameMargin + frameWidth, frameY + cornerSize)
      .stroke({ width: 1.2, color: cornerColor, alpha: 0.8 });
    
    // Bottom-left corner
    this.bg.moveTo(frameMargin, frameY + frameHeight - cornerSize)
      .lineTo(frameMargin, frameY + frameHeight)
      .lineTo(frameMargin + cornerSize, frameY + frameHeight)
      .stroke({ width: 1.2, color: cornerColor, alpha: 0.8 });
    
    // Bottom-right corner
    this.bg.moveTo(frameMargin + frameWidth - cornerSize, frameY + frameHeight)
      .lineTo(frameMargin + frameWidth, frameY + frameHeight)
      .lineTo(frameMargin + frameWidth, frameY + frameHeight - cornerSize)
      .stroke({ width: 1.2, color: cornerColor, alpha: 0.8 });

    this.addChild(this.bg);

    // Hover overlay (initially hidden)
    this.hoverOverlay = new Graphics();
    this.hoverOverlay.roundRect(0, 0, width, height, 5)
      .fill({ color: 0xffffff, alpha: 0 });
    this.addChild(this.hoverOverlay);

    // Energy cost - TOP LEFT - SLIGHTLY LARGER but no overlap
    const energyX = 5;
    const energyY = 7;
    const energyBgWidth = 26;  // Increased from 20px
    const energyBgHeight = 19;  // Increased from 16px
    
    const energyCostBg = new Graphics()
      .roundRect(energyX, energyY, energyBgWidth, energyBgHeight, 5)
      .fill({ color: 0x1a1d1f, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0xf39c12, alpha: 0.95 });  // Gold border
    
    const energyIcon = new Text({
      text: '⚡',
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(8, Math.round(14 * fontScale)),  // Bigger
        fill: 0xf39c12
      }
    });
    energyIcon.anchor.set(0.5);
    energyIcon.x = energyX + 7;
    energyIcon.y = energyY + energyBgHeight / 2;
    
    const energyText = new Text({
      text: card.energy_cost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(12, Math.round(14 * fontScale)),  // Bigger, more readable
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 1.2 }
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = energyX + 17.5;
    energyText.y = energyY + energyBgHeight / 2;

    // Group icon - TOP RIGHT with proper spacing
    let groupIcon = '';
    let iconColor = 0xffffff;
    
    switch (card.group) {
      case CardType.ATTACK:
        groupIcon = '⚔️';
        iconColor = 0xe74c3c;  // Red
        break;
      case CardType.HEAL:
        groupIcon = '✨';
        iconColor = 0x26de81;  // Green
        break;
      case CardType.DEBUFF:
        groupIcon = '🌀';
        iconColor = 0xa55eea;  // Purple
        break;
      case CardType.BUFF:
        groupIcon = '🔼';
        iconColor = 0x4a90e2;  // Blue
        break;
      default:
        groupIcon = '⭐';
    }
    
    const groupIconRadius = 10;  // Smaller for 70px card
    const groupIconBg = new Graphics()
      .circle(width - 12, 16, groupIconRadius)
      .fill({ color: 0x1a1d1f, alpha: 0.95 })
      .stroke({ width: 1.5, color: iconColor, alpha: 0.85 });
    
    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(10, Math.round(12 * fontScale)),
        align: 'center',
        fill: 0xffffff
      }
    });
    groupIconText.anchor.set(0.5);
    groupIconText.x = width - 12;
    groupIconText.y = 16;

    // Avatar/Icon in center of frame with proper drop shadow using filter
    const avatarIcon = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(28, Math.round(36 * fontScale)),  // Scaled for 70x100
        align: 'center',
        fill: 0xffffff
      }
    });
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = width / 2;
    avatarIcon.y = frameY + (frameHeight / 2);
    
    // Apply drop shadow filter instead of style property
    const dropShadowFilter = new DropShadowFilter({
      offset: { x: 1.5, y: 1.5 },
      blur: 2,
      alpha: 0.5,
      color: 0x000000
    });
    avatarIcon.filters = [dropShadowFilter];

    this.addChild(energyCostBg, energyIcon, energyText, groupIconBg, groupIconText, avatarIcon);

    // Make card interactive with smooth hover effects
    if (enableHover || opts.onClick) {
      this.interactive = true;
      this.cursor = 'pointer';

      if (enableHover) {
        this.on('pointerover', () => {
          gsap.to(this.hoverOverlay, {
            alpha: 0.12,
            duration: 0.35,
            ease: 'power2.out'
          });
          
          gsap.to(this.scale, {
            x: 1.05,
            y: 1.05,
            duration: 0.35,
            ease: 'power2.out'
          });

          gsap.to(avatarIcon.scale, {
            x: 1.1,
            y: 1.1,
            duration: 0.35,
            ease: 'power2.out'
          });
        });

        this.on('pointerout', () => {
          gsap.to(this.hoverOverlay, {
            alpha: 0,
            duration: 0.35,
            ease: 'power2.out'
          });
          
          gsap.to(this.scale, {
            x: 1.0,
            y: 1.0,
            duration: 0.35,
            ease: 'power2.out'
          });

          gsap.to(avatarIcon.scale, {
            x: 1.0,
            y: 1.0,
            duration: 0.35,
            ease: 'power2.out'
          });
        });
      }

      if (opts.onClick) {
        this.on('pointertap', () => {
          opts.onClick!(card);
        });
      }
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