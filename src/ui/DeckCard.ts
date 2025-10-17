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
 * A compact deck card optimized for 70x100px with Slay the Spire fantasy style
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

    // Fantasy-styled card background with parchment look
    this.bg = new Graphics();
    
    // Multi-layer shadow for depth (Slay the Spire style)
    this.bg.roundRect(2.5, 2.5, width, height, 5)
      .fill({ color: 0x000000, alpha: 0.4 });
    
    this.bg.roundRect(1.5, 1.5, width, height, 5)
      .fill({ color: 0x000000, alpha: 0.2 });
    
    // Main card background - aged parchment
    this.bg.roundRect(0, 0, width, height, 5)
      .fill({ color: 0xf5e6d3, alpha: 0.98 })  // Parchment color
      .stroke({ width: 2, color: 0xd4af37 });   // Golden border
    
    // Inner darker parchment layer for depth
    this.bg.roundRect(2, 2, width - 4, height - 4, 4)
      .fill({ color: 0xe8d4b8, alpha: 0.6 });
    
    // Inner golden highlight
    this.bg.roundRect(3, 3, width - 6, height - 6, 3)
      .stroke({ width: 0.8, color: 0xffd700, alpha: 0.5 });

    // Avatar/Art frame in center with ornate border
    const frameMargin = 6;
    const frameY = 28;
    const frameHeight = height - 34;
    const frameWidth = width - (frameMargin * 2);
    
    // Dark inner frame for avatar/art with golden border
    this.bg.roundRect(frameMargin, frameY, frameWidth, frameHeight, 3)
      .fill({ color: 0x2a1810, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0xd4af37, alpha: 0.9 });
    
    // Inner bevel effect
    this.bg.roundRect(frameMargin + 1, frameY + 1, frameWidth - 2, frameHeight - 2, 2)
      .stroke({ width: 0.8, color: 0x8b4513, alpha: 0.5 });
    
    // Fantasy corner decorations with golden accents
    const cornerSize = 4;
    const cornerColor = 0xffd700;
    
    // Top-left corner
    this.bg.moveTo(frameMargin, frameY + cornerSize)
      .lineTo(frameMargin, frameY)
      .lineTo(frameMargin + cornerSize, frameY)
      .stroke({ width: 1.2, color: cornerColor, alpha: 0.9 });
    
    // Small decorative dot
    this.bg.circle(frameMargin + 2, frameY + 2, 0.8)
      .fill({ color: cornerColor });
    
    // Top-right corner
    this.bg.moveTo(frameMargin + frameWidth - cornerSize, frameY)
      .lineTo(frameMargin + frameWidth, frameY)
      .lineTo(frameMargin + frameWidth, frameY + cornerSize)
      .stroke({ width: 1.2, color: cornerColor, alpha: 0.9 });
    
    this.bg.circle(frameMargin + frameWidth - 2, frameY + 2, 0.8)
      .fill({ color: cornerColor });
    
    // Bottom-left corner
    this.bg.moveTo(frameMargin, frameY + frameHeight - cornerSize)
      .lineTo(frameMargin, frameY + frameHeight)
      .lineTo(frameMargin + cornerSize, frameY + frameHeight)
      .stroke({ width: 1.2, color: cornerColor, alpha: 0.9 });
    
    this.bg.circle(frameMargin + 2, frameY + frameHeight - 2, 0.8)
      .fill({ color: cornerColor });
    
    // Bottom-right corner
    this.bg.moveTo(frameMargin + frameWidth - cornerSize, frameY + frameHeight)
      .lineTo(frameMargin + frameWidth, frameY + frameHeight)
      .lineTo(frameMargin + frameWidth, frameY + frameHeight - cornerSize)
      .stroke({ width: 1.2, color: cornerColor, alpha: 0.9 });
    
    this.bg.circle(frameMargin + frameWidth - 2, frameY + frameHeight - 2, 0.8)
      .fill({ color: cornerColor });

    this.addChild(this.bg);

    // Hover overlay (initially hidden) - subtle golden tint
    this.hoverOverlay = new Graphics();
    this.hoverOverlay.roundRect(0, 0, width, height, 5)
      .fill({ color: 0xffd700, alpha: 0 });
    this.addChild(this.hoverOverlay);

    // Energy cost gem - TOP LEFT - fantasy crystal style
    const energyX = 5;
    const energyY = 7;
    const energyBgWidth = 26;
    const energyBgHeight = 19;
    
    const energyCostBg = new Graphics()
      .roundRect(energyX, energyY, energyBgWidth, energyBgHeight, 4)
      .fill({ color: 0x2a1810, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0xd4af37, alpha: 0.95 });  // Golden border
    
    // Inner highlight for gem effect
    energyCostBg.roundRect(energyX + 1, energyY + 1, energyBgWidth - 2, energyBgHeight - 2, 3)
      .stroke({ width: 0.6, color: 0xffd700, alpha: 0.6 });
    
    const energyIcon = new Text({
      text: '⚡',
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(8, Math.round(14 * fontScale)),
        fill: 0xf39c12,
        dropShadow: {
          color: 0xffd700,
          blur: 2,
          angle: 0,
          distance: 0,
          alpha: 0.6
        }
      }
    });
    energyIcon.anchor.set(0.5);
    energyIcon.x = energyX + 7;
    energyIcon.y = energyY + energyBgHeight / 2;
    
    const energyText = new Text({
      text: card.energy_cost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(12, Math.round(14 * fontScale)),
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x2a1810, width: 1.5 }
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = energyX + 17.5;
    energyText.y = energyY + energyBgHeight / 2;

    // Group icon - TOP RIGHT with ornate frame
    let groupIcon = '';
    let iconColor = 0xffffff;
    
    switch (card.group) {
      case CardType.ATTACK:
        groupIcon = '⚔️';
        iconColor = 0xe74c3c;  // Red
        break;
      // case CardType.HEAL:
      //   groupIcon = '✨';
      //   iconColor = 0x26de81;  // Green
      //   break;
      // case CardType.DEBUFF:
      //   groupIcon = '🌀';
      //   iconColor = 0xa55eea;  // Purple
      //   break;
      // case CardType.BUFF:
      //   groupIcon = '🔼';
      //   iconColor = 0x4a90e2;  // Blue
      //   break;
      default:
        groupIcon = '✨';
        iconColor = 0x26de81;
    }
    
    const groupIconRadius = 10;
    const groupIconBg = new Graphics()
      .circle(width - 12, 16, groupIconRadius)
      .fill({ color: 0x2a1810, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0xd4af37, alpha: 0.9 });
    
    // Inner magical glow ring
    groupIconBg.circle(width - 12, 16, groupIconRadius - 1.5)
      .stroke({ width: 1, color: iconColor, alpha: 0.6 });
    
    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(10, Math.round(12 * fontScale)),
        align: 'center',
        fill: 0xffffff,
        dropShadow: {
          color: 0x000000,
          blur: 1,
          angle: Math.PI / 4,
          distance: 1,
          alpha: 0.6
        }
      }
    });
    groupIconText.anchor.set(0.5);
    groupIconText.x = width - 12;
    groupIconText.y = 16;

    // Avatar/Icon in center of frame with magical glow
    const avatarIcon = new Text({
      text: card.icon_url || groupIcon,  // Fallback to group icon if no avatar
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(28, Math.round(36 * fontScale)),
        align: 'center',
        fill: 0xffffff
      }
    });
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = width / 2;
    avatarIcon.y = frameY + (frameHeight / 2);
    
    // Apply magical glow filter matching the card type
    const glowFilter = new DropShadowFilter({
      offset: { x: 0, y: 0 },
      blur: 6,
      alpha: 0.8,
      color: iconColor
    });
    avatarIcon.filters = [glowFilter];

    this.addChild(energyCostBg, energyIcon, energyText, groupIconBg, groupIconText, avatarIcon);

    // Make card interactive with smooth hover effects
    if (enableHover || opts.onClick) {
      this.interactive = true;
      this.cursor = 'pointer';

      if (enableHover) {
        this.on('pointerover', () => {
          // Golden glow on hover
          gsap.to(this.hoverOverlay, {
            alpha: 0.15,
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
          
          // Increase glow intensity on hover
          if (avatarIcon.filters && avatarIcon.filters[0]) {
            const glow = avatarIcon.filters[0] as DropShadowFilter;
            gsap.to(glow, {
              blur: 10,
              alpha: 1.0,
              duration: 0.35,
              ease: 'power2.out'
            });
          }
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
          
          // Reset glow
          if (avatarIcon.filters && avatarIcon.filters[0]) {
            const glow = avatarIcon.filters[0] as DropShadowFilter;
            gsap.to(glow, {
              blur: 6,
              alpha: 0.8,
              duration: 0.35,
              ease: 'power2.out'
            });
          }
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