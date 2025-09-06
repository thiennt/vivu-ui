import { Container, Graphics, Text } from 'pixi.js';
import { app } from '@/app';

export abstract class BaseScene extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = [];

  protected gameWidth: number;
  protected gameHeight: number;

  constructor() {
    super();
    
    this.gameWidth = Math.max(400, app.screen.width);
    this.gameHeight = app.screen.height;
    
    this.setupBackground();
  }

  protected setupBackground() {
    const bg = new Graphics();
    bg.fill(0x2c1810).rect(0, 0, this.gameWidth, this.gameHeight);
    this.addChild(bg);
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
    bg.fill(0x8d6e63)
      .stroke({ width: 3, color: 0x5d4037 })
      .roundRect(0, 0, width, height, 8);
    
    // Button text
    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xfff8e1,
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
      bg.tint = 0xa1887f;
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
        fill: 0xffecb3,
        stroke: {
          color: 0x3e2723,
          width: 3,
        },
        dropShadow: {
          color: 0x000000,
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
      common: 0x8d6e63,
      uncommon: 0x66bb6a,
      rare: 0x42a5f5,
      epic: 0xab47bc,
      legendary: 0xff9800
    };
    
    const bg = new Graphics();
    bg.fill(rarityColors[rarity] || rarityColors.common)
      .stroke({ width: 2, color: 0x3e2723 })
      .roundRect(0, 0, width, height, 8);
    
    card.addChild(bg);
    card.x = x;
    card.y = y;
    card.interactive = true;
    card.cursor = 'pointer';
    
    return card;
  }
}