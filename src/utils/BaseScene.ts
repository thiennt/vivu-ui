import { Container, Graphics, Text } from 'pixi.js';
import { app } from '@/app';
import { navigation } from './navigation';
import { Colors } from './colors';

export abstract class BaseScene extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = [];

  protected gameWidth: number = navigation.width;
  protected gameHeight: number = navigation.height;

  constructor() {
    super();
    
    // Don't initialize dimensions and background here - wait for prepare() or resize()
  }

  protected setupBackground() {
    // Only create background if dimensions are properly set
    if (this.gameWidth && this.gameHeight) {
      const bg = new Graphics();
      bg.fill(Colors.BACKGROUND_PRIMARY).rect(0, 0, this.gameWidth, this.gameHeight);
      this.addChild(bg);
    }
  }

  protected initializeDimensions() {
    this.gameWidth = Math.max(400, app.screen?.width || 800);
    this.gameHeight = app.screen?.height || 600;
  }

  protected createButton(
    text: string, 
    x: number, 
    y: number, 
    width: number = 200, 
    height: number = 50,
    onClick?: () => void
  ): Container {
    const button = new Container();
    
    // Button background with fantasy styling
    const bg = new Graphics();
    bg.fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 3, color: Colors.BUTTON_BORDER })
      .roundRect(0, 0, width, height, 8);
    
    // Button text
    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON,
        align: 'center'
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = width / 2;
    buttonText.y = height / 2;
    
    button.addChild(bg, buttonText);
    button.x = x;
    button.y = y;
    button.interactive = true;
    button.cursor = 'pointer';
    
    // Hover effects
    button.on('pointerover', () => {
      bg.tint = Colors.BUTTON_HOVER;
    });
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    if (onClick) {
      button.on('pointerdown', onClick);
    }
    
    return button;
  }

  protected createTitle(text: string, x: number, y: number): Text {
    const title = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 36,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        stroke: {
          color: Colors.BACKGROUND_SECONDARY,
          width: 3,
        },
        dropShadow: {
          color: Colors.SHADOW_COLOR,
          blur: 4,
          angle: Math.PI / 6,
          distance: 6,
          alpha: 0.5,
        },
      }
    });
    title.anchor.set(0.5);
    title.x = x;
    title.y = y;
    return title;
  }

  protected createCard(
    x: number, 
    y: number, 
    width: number = 120, 
    height: number = 160,
    rarity: string = 'common'
  ): Container {
    const card = new Container();
    
    const rarityColors: { [key: string]: number } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    
    const bg = new Graphics();
    bg.fill(rarityColors[rarity] || rarityColors.common)
      .stroke({ width: 2, color: Colors.CARD_BORDER })
      .roundRect(0, 0, width, height, 8);
    
    card.addChild(bg);
    card.x = x;
    card.y = y;
    card.interactive = true;
    card.cursor = 'pointer';
    
    return card;
  }
}