import { Container, Graphics, Text } from 'pixi.js';
import { Colors, FontFamily } from '@/utils/cssStyles';
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
 * A compact deck card with Neon Cyan style - clean and readable
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
    const { width, height, fontScale, enableHover } = opts;

    // Clean neon-styled card background
    this.bg = new Graphics();
    
    // Main card background - dark with cyan accent
    this.bg.roundRect(0, 0, width, height, 6)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.8 });
    
    // Art/Avatar frame in center with clean neon border
    const frameMargin = 8;
    const frameY = 30;
    const frameHeight = height - 38;
    const frameWidth = width - (frameMargin * 2);
    
    // // Dark frame with cyan glow
    // this.bg.roundRect(frameMargin, frameY, frameWidth, frameHeight, 4)
    //   .fill({ color: Colors.BLACK, alpha: 0.6 })
    //   .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.9 });

    this.addChild(this.bg);

    // Energy cost - TOP LEFT with clean neon style
    const energyX = 4;
    const energyY = 5;
    const energyBgWidth = 28;
    const energyBgHeight = 20;
    
    const energyCostBg = new Graphics()
      .roundRect(energyX, energyY, energyBgWidth, energyBgHeight, 4)
      .fill({ color: Colors.BLACK, alpha: 0.8 })
      .stroke({ width: 1.5, color: Colors.ROBOT_CYAN, alpha: 0.9 });
    
    const energyIcon = new Text({
      text: '⚡',
      style: {
        fontFamily: FontFamily.SECONDARY,
        fontSize: Math.round(12 * fontScale),
        fill: Colors.ROBOT_CYAN,
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 3,
          angle: 0,
          distance: 0,
          alpha: 0.8
        }
      }
    });
    energyIcon.anchor.set(0.5);
    energyIcon.x = energyX + 7;
    energyIcon.y = energyY + energyBgHeight / 2;
    
    const energyText = new Text({
      text: card.energy_cost.toString(),
      style: {
        fontFamily: FontFamily.SECONDARY,
        fontSize: Math.round(15 * fontScale),
        fontWeight: '900',
        fill: Colors.WHITE,
        stroke: { color: Colors.BLACK, width: 3 },
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 2,
          angle: 0,
          distance: 0,
          alpha: 0.6
        }
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = energyX + 19;
    energyText.y = energyY + energyBgHeight / 2;

    // Group icon - TOP RIGHT with clean design
    let groupIcon = '';
    let iconColor: string = Colors.ROBOT_CYAN;
    
    if (card.group.includes('Damage')) {
      groupIcon = '⚔️';
      iconColor = Colors.RED;
    } else if (card.group.includes('Healing')) {
      groupIcon = '❤️';
      iconColor = Colors.GREEN_BRIGHT;
    } else if (card.group.includes('Buff')) {
      groupIcon = '🔼';
      iconColor = Colors.BLUE_SKY;
    } else {
      groupIcon = '✨';
      iconColor = Colors.PURPLE;
    }
    
    const groupIconRadius = 9;
    const groupIconBg = new Graphics()
      .circle(width - 11, 14, groupIconRadius)
      .fill({ color: Colors.BLACK, alpha: 0.8 })
      .stroke({ width: 1.5, color: iconColor, alpha: 0.9 });
    
    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: FontFamily.SECONDARY,
        fontSize: Math.round(11 * fontScale),
        align: 'center',
        fill: Colors.WHITE,
        dropShadow: {
          color: iconColor,
          blur: 2,
          angle: 0,
          distance: 0,
          alpha: 0.8
        }
      }
    });
    groupIconText.anchor.set(0.5);
    groupIconText.x = width - 11;
    groupIconText.y = 14;

    // Avatar/Icon in center of frame with clean glow
    const avatarIcon = new Text({
      text: card.icon_url || groupIcon,
      style: {
        fontFamily: FontFamily.SECONDARY,
        fontSize: Math.round(32 * fontScale),
        align: 'center',
        fill: Colors.WHITE,
        dropShadow: {
          color: Colors.BLACK,
          blur: 2,
          angle: Math.PI / 4,
          distance: 1,
          alpha: 0.8
        }
      }
    });
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = width / 2;
    avatarIcon.y = frameY + (frameHeight / 2);

    this.addChild(energyCostBg, energyIcon, energyText, groupIconBg, groupIconText, avatarIcon);

    // Make card interactive with smooth hover effects
    if (enableHover || opts.onClick) {
      this.interactive = true;
      this.cursor = 'pointer';

      if (enableHover) {
        this.on('pointerover', () => {
          gsap.to(this.scale, {
            x: 1.05,
            y: 1.05,
            duration: 0.3,
            ease: 'power2.out'
          });
        });

        this.on('pointerout', () => {
          gsap.to(this.scale, {
            x: 1.0,
            y: 1.0,
            duration: 0.3,
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
  public async show() {}

  /** Hide the card with optional animation */
  public async hide() {}
}