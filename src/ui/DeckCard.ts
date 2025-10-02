import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { Card, CardType } from '@/types';
import { gsap } from 'gsap';

const defaultDeckCardOptions = {
  width: 120,
  height: 160,
  fontScale: 1,
  showDescription: true,
  maxDescriptionLength: 50,
  enableHover: true,
};

export type DeckCardOptions = typeof defaultDeckCardOptions;

/**
 * A deck card with full card details
 */
export class DeckCard extends Container {
  private bg: Graphics;
  public card: Card;

  constructor(
    card: Card,
    options: Partial<DeckCardOptions> & { onClick?: (card: Card) => void } = {}
  ) {
    super();
    
    const opts = { ...defaultDeckCardOptions, ...options };
    this.card = card;
    const { width, height, fontScale, showDescription, maxDescriptionLength, enableHover } = opts;

    // Enhanced card background with card-like appearance
    this.bg = new Graphics();
    
    // Card shadow for depth
    this.bg.roundRect(3, 3, width, height, 8)
      .fill({ color: Colors.SHADOW_COLOR, alpha: 0.3 });
    
    // Main card background with subtle gradient
    this.bg.roundRect(0, 0, width, height, 8)
      .fill(Colors.CARD_BACKGROUND)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Inner card frame for that trading card look
    this.bg.roundRect(4, 4, width - 8, height - 8, 4)
      .stroke({ width: 1, color: Colors.CARD_BORDER, alpha: 0.3 });
    
    // Top border accent for premium card feel
    this.bg.roundRect(6, 6, width - 12, 12, 2)
      .fill({ color: Colors.RARITY_COMMON, alpha: 0.3 });

    this.addChild(this.bg);

    // Group icon at top right
    let groupIcon = '';
    switch (card.group) {
      case CardType.ATTACK:
        groupIcon = '⚔️';
        break;
      case CardType.HEAL:
        groupIcon = '✨';
        break;
      case CardType.DEBUFF:
        groupIcon = '🌀';
        break;
      case CardType.BUFF:
        groupIcon = '🔼';
        break;
      default:
        groupIcon = '⭐';
    }
    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(8, Math.round(16 * fontScale)),
        align: 'center',
        fill: Colors.TEXT_PRIMARY
      }
    });
    groupIconText.anchor.set(1, 0);
    groupIconText.x = width - 8;
    groupIconText.y = height * 0.05;

    // Card name at top, below icon
    const cardName = new Text({
      text: card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(6, Math.round(14 * fontScale)),
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        wordWrap: true,
        wordWrapWidth: width - 16
      }
    });
    cardName.anchor.set(0.5, 0);
    cardName.x = width / 2;
    cardName.y = groupIconText.y + groupIconText.height + 10;

    // Enhanced energy cost (top left) with card-like styling  
    const energyCircleRadius = Math.max(10, Math.round(16 * fontScale));
    const energyCostBg = new Graphics()
      .circle(20, 20, energyCircleRadius)
      .fill({ color: Colors.ENERGY_ACTIVE })
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    // Inner energy circle for depth
    const energyCostInner = new Graphics()
      .circle(20, 20, energyCircleRadius - 3)
      .stroke({ width: 1, color: Colors.TEXT_WHITE, alpha: 0.5 });
    
    const energyText = new Text({
      text: card.energy_cost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(10, Math.round(16 * fontScale)),
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = 20;
    energyText.y = 20;

    this.addChild(groupIconText, cardName, energyCostBg, energyCostInner, energyText);

    // Card description (optional)
    if (showDescription && card.description) {
      let descText = card.description;
      if (descText.length > maxDescriptionLength) {
        descText = descText.slice(0, maxDescriptionLength - 3) + '...';
      }
      const description = new Text({
        text: descText,
        style: {
          fontFamily: 'Kalam',
          fontSize: Math.max(6, Math.round(14 * fontScale)),
          fill: Colors.TEXT_SECONDARY,
          wordWrap: true,
          wordWrapWidth: width - 24,
          align: 'center'
        }
      });
      description.anchor.set(0.5, 0.5);
      description.x = width / 2;
      description.y = height / 2 + 20;
      this.addChild(description);
    }

    // Make card interactive for hover effects and click
    if (enableHover || opts.onClick) {
      this.interactive = true;
      this.cursor = 'pointer';

      if (enableHover) {
        this.on('pointerover', () => {
          this.bg.tint = 0xcccccc;
        });

        this.on('pointerout', () => {
          this.bg.tint = 0xffffff;
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
