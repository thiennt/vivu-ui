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

  protected createHeroCard(
    character: any,
    x: number,
    y: number,
    cardType: 'preview' | 'detailed' | 'formation' | 'pool' = 'detailed',
    positionIndex?: number
  ): Container {
    // Define card dimensions based on type
    const cardSizes = {
      preview: { width: 120, height: 140 },
      detailed: { width: 140, height: 180 },
      formation: { width: 100, height: 100 },
      pool: { width: 90, height: 90 }
    };
    
    const { width, height } = cardSizes[cardType];
    const card = this.createCard(x, y, width, height, character.rarity);
    
    // Character symbol (crypto token) - always at top center
    const symbolSize = cardType === 'detailed' ? 24 : (cardType === 'preview' ? 18 : 16);
    const symbolText = new Text({
      text: character.tokenSymbol,
      style: {
        fontFamily: 'Kalam',
        fontSize: symbolSize,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    symbolText.anchor.set(0.5);
    symbolText.x = width / 2;
    symbolText.y = cardType === 'formation' || cardType === 'pool' ? height / 2 - 15 : 25;
    
    // Level text - positioned below symbol
    const levelSize = cardType === 'detailed' ? 14 : (cardType === 'preview' ? 12 : 10);
    const levelText = new Text({
      text: `Lv.${character.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: levelSize,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    levelText.anchor.set(0.5);
    levelText.x = width / 2;
    levelText.y = cardType === 'formation' || cardType === 'pool' ? height / 2 + 10 : 50;
    
    card.addChild(symbolText, levelText);
    
    // Add additional elements based on card type
    if (cardType === 'detailed') {
      this.addDetailedCardElements(card, character, width, height);
    } else if (cardType === 'preview') {
      this.addPreviewCardElements(card, character, width, height);
    }
    
    // Add element indicator for all types except formation/pool
    if (cardType !== 'formation' && cardType !== 'pool') {
      this.addElementIndicator(card, character, width);
    }
    
    return card;
  }

  private addDetailedCardElements(card: Container, character: any, width: number, height: number): void {
    // Character name - below level
    const nameText = new Text({
      text: character.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 11,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: width - 20
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = width / 2;
    nameText.y = 75;
    
    // Experience
    const expText = new Text({
      text: `EXP: ${character.experience}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 9,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    expText.anchor.set(0.5);
    expText.x = width / 2;
    expText.y = 95;
    
    // Stats in a compact grid
    const stats = [
      `HP: ${character.stats.health}`,
      `ATK: ${character.stats.attack}`,
      `DEF: ${character.stats.defense}`,
      `SPD: ${character.stats.speed}`
    ];
    
    stats.forEach((stat, index) => {
      const statText = new Text({
        text: stat,
        style: {
          fontFamily: 'Kalam',
          fontSize: 8,
          fill: Colors.TEXT_SECONDARY
        }
      });
      statText.x = 10 + (index % 2) * (width / 2 - 10);
      statText.y = 115 + Math.floor(index / 2) * 18;
      card.addChild(statText);
    });
    
    card.addChild(nameText, expText);
  }

  private addPreviewCardElements(card: Container, character: any, width: number, height: number): void {
    // Basic stats for preview
    const hpText = new Text({
      text: `HP: ${character.stats.health}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 9,
        fill: Colors.TEXT_SECONDARY
      }
    });
    hpText.x = 10;
    hpText.y = 75;

    const atkText = new Text({
      text: `ATK: ${character.stats.attack}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 9,
        fill: Colors.TEXT_SECONDARY
      }
    });
    atkText.x = 10;
    atkText.y = 90;
    
    card.addChild(hpText, atkText);
  }

  private addElementIndicator(card: Container, character: any, width: number): void {
    const elementColors: { [key: string]: number } = {
      fire: Colors.ELEMENT_FIRE,
      water: Colors.ELEMENT_WATER,
      earth: Colors.ELEMENT_EARTH,
      air: Colors.ELEMENT_AIR,
      light: Colors.ELEMENT_LIGHT,
      dark: Colors.ELEMENT_DARK
    };
    
    const elementIndicator = new Graphics();
    elementIndicator.fill(elementColors[character.element] || Colors.ELEMENT_DEFAULT)
      .circle(width - 15, 15, 6);
    
    card.addChild(elementIndicator);
  }
}