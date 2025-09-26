import { Assets, Color, Container, Graphics, Sprite, Text } from 'pixi.js';
import { app } from '@/app';
import { navigation } from './navigation';
import { Colors, Gradients } from './colors';
import { BottomNavigationMenu } from './BottomNavigationMenu';
import { Card, CardType } from '@/types';
import { DropShadowFilter, GlowFilter } from 'pixi-filters';

export abstract class BaseScene extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = [];

  protected gameWidth: number = navigation.width;
  protected gameHeight: number = navigation.height;
  
  // Standard layout constants
  protected readonly STANDARD_PADDING = 10;
  protected readonly STANDARD_SPACING = 10;

  // Bottom navigation
  protected bottomNavigation: BottomNavigationMenu | null = null;

  constructor() {
    super();
    // Don't create bottom navigation in constructor yet - wait for proper dimensions
  }

  protected createBottomNavigation(): void {
    if (!this.bottomNavigation && this.gameWidth > 0 && this.gameHeight > 0) {
      this.bottomNavigation = new BottomNavigationMenu(this.gameWidth, this.gameHeight);
      this.addChild(this.bottomNavigation);
      // Ensure it's on top
      this.bottomNavigation.zIndex = 9999;
      this.sortChildren();
    }
  }

  protected updateBottomNavigation(): void {
    if (this.bottomNavigation) {
      this.bottomNavigation.updateDimensions(this.gameWidth, this.gameHeight);
    } else if (this.gameWidth > 0 && this.gameHeight > 0) {
      // Create it if it doesn't exist and we have proper dimensions
      this.createBottomNavigation();
    }
  }

  protected getContentHeight(): number {
    // Return available height excluding bottom navigation
    return this.gameHeight - (this.bottomNavigation?.getMenuHeight() || 0);
  }

  protected setupBackground() {
    // Only create background if dimensions are properly set
    if (this.gameWidth && this.gameHeight) {
      const bg = new Graphics();
      const backgroundGradient = Gradients.createBackgroundGradient(this.gameWidth, this.gameHeight);
      bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(backgroundGradient);
      this.addChild(bg);
    }
  }

  protected initializeDimensions() {
    this.gameWidth = Math.max(400, app.screen?.width || 800);
    this.gameHeight = app.screen?.height || 600;
  }

  /**
   * Creates a centered container with standard padding
   */
  protected createCenteredContainer(
    width?: number, 
    height?: number, 
    padding: number = this.STANDARD_PADDING
  ): Container {
    const container = new Container();
    const containerWidth = width || (this.gameWidth - 2 * padding);
    const containerHeight = height || (this.gameHeight - 2 * padding);
    
    container.x = (this.gameWidth - containerWidth) / 2;
    container.y = padding;
    
    return container;
  }

  /**
   * Calculates responsive grid layout with consistent spacing
   */
  protected calculateGridLayout(
    availableWidth: number,
    minItemWidth: number,
    maxItemWidth: number,
    spacing: number = this.STANDARD_SPACING
  ): { itemsPerRow: number; itemWidth: number; totalWidth: number } {
    let itemsPerRow = Math.floor((availableWidth + spacing) / (minItemWidth + spacing));
    itemsPerRow = Math.max(1, itemsPerRow);
    
    const totalSpacing = (itemsPerRow - 1) * spacing;
    let itemWidth = (availableWidth - totalSpacing) / itemsPerRow;
    itemWidth = Math.max(minItemWidth, Math.min(itemWidth, maxItemWidth));
    
    const totalWidth = itemsPerRow * itemWidth + (itemsPerRow - 1) * spacing;
    
    return { itemsPerRow, itemWidth, totalWidth };
  }

  /**
   * Calculates grid layout with exactly 3 cards per row
   */
  protected calculateThreeCardsLayout(
    availableWidth: number,
    spacing: number = this.STANDARD_SPACING
  ): { itemsPerRow: number; itemWidth: number; totalWidth: number } {
    const itemsPerRow = 3;
    const totalSpacing = (itemsPerRow - 1) * spacing;
    const itemWidth = (availableWidth - totalSpacing) / itemsPerRow;
    const totalWidth = itemsPerRow * itemWidth + (itemsPerRow - 1) * spacing;
    
    return { itemsPerRow, itemWidth, totalWidth };
  }

  /**
   * Calculates grid layout with exactly 4 cards per row
   */
  protected calculateFourCardsLayout(
    availableWidth: number,
    spacing: number = this.STANDARD_SPACING
  ): { itemsPerRow: number; itemWidth: number; totalWidth: number } {
    const itemsPerRow = 4;
    const totalSpacing = (itemsPerRow - 1) * spacing;
    const itemWidth = (availableWidth - totalSpacing) / itemsPerRow;
    const totalWidth = itemsPerRow * itemWidth + (itemsPerRow - 1) * spacing;
    
    return { itemsPerRow, itemWidth, totalWidth };
  }

  /**
   * Calculates responsive font size based on card dimensions and screen size
   */
  protected calculateResponsiveFontSize(
    baseSize: number,
    cardWidth: number,
    screenWidth: number,
    minSize: number = 8,
    maxSize: number = 24
  ): number {
    // Scale font size based on card width relative to a base card width (120px)
    const baseCardWidth = 120;
    const cardScale = cardWidth / baseCardWidth;
    
    // Scale font size based on screen width relative to base screen width (800px)
    const baseScreenWidth = 800;
    const screenScale = Math.min(screenWidth / baseScreenWidth, 1.2); // Cap at 120% scaling
    
    // Combine both scaling factors
    const scaledSize = baseSize * cardScale * screenScale;
    
    // Ensure font size stays within bounds
    return Math.max(minSize, Math.min(maxSize, scaledSize));
  }

  protected createButton(
    text: string, 
    x: number, 
    y: number, 
    width: number = 200, 
    height: number = 50,
    onClick?: () => void,
    baseFontSize: number = 18
  ): Container {
    const button = new Container();
    
    // Ensure minimum touch target for mobile (44px) but scale down for small screens
    const minHeight = Math.min(44, this.gameHeight * 0.08);
    const adjustedHeight = Math.max(minHeight, height);
    
    // Adjust width for small screens - ensure it doesn't exceed available space
    const maxWidth = this.gameWidth - (2 * this.STANDARD_PADDING);
    const adjustedWidth = Math.min(width, maxWidth);
    
    // Button background with orange gradient styling
    const bg = new Graphics();
    const buttonGradient = Gradients.createButtonGradient(adjustedWidth, adjustedHeight);
    bg.roundRect(0, 0, adjustedWidth, adjustedHeight, 8)
      .fill(buttonGradient)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER }); // Reduced border thickness for small screens

    // Calculate responsive font size based on button dimensions and screen size
    const responsiveFontSize = this.calculateResponsiveFontSize(
      baseFontSize,
      adjustedWidth,
      this.gameWidth,
      Math.max(10, adjustedHeight * 0.25), // Minimum font size based on button height
      Math.min(20, adjustedHeight * 0.5)   // Maximum font size reduced for better fit
    );

    // Button text
    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: responsiveFontSize,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: adjustedWidth * 0.9 // Ensure text fits within button
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = adjustedWidth / 2;
    buttonText.y = adjustedHeight / 2;
    
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
    const card = this.createPolishedCard(width, height);
    
    const rarityColors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill(rarityColors[rarity] || rarityColors.common)
      .stroke({ width: 2, color: Colors.CARD_BORDER });

    card.addChild(bg);
    card.x = x;
    card.y = y;
    card.interactive = true;
    card.cursor = 'pointer';
    
    return card;
  }

  public createDeckCard(
    card: Card, 
    width: number, 
    height: number, 
    options: {
      fontScale?: number;
      showDescription?: boolean;
      maxDescriptionLength?: number;
      onClick?: (card: Card) => void;
      enableHover?: boolean;
    } = {}
  ): Container {
    const {
      fontScale = 1,
      showDescription = true,
      maxDescriptionLength = 50,
      onClick,
      enableHover = true
    } = options;

    const cardContainer = new Container();

    // Card background
    const bg = new Graphics()
      .roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.BACKGROUND_SECONDARY })
      .stroke({ width: 2, color: Colors.CARD_BORDER });

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

    // Energy cost (top left)
    const energyCircleRadius = Math.max(8, Math.round(14 * fontScale));
    const energyCost = new Graphics()
      .circle(18, 18, energyCircleRadius)
      .fill({ color: Colors.BUTTON_PRIMARY })
      .stroke({ width: 1, color: Colors.BUTTON_BORDER });
    const energyText = new Text({
      text: card.energy_cost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(8, Math.round(14 * fontScale)),
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = 18;
    energyText.y = 18;

    cardContainer.addChild(bg, groupIconText, cardName, energyCost, energyText);

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
      cardContainer.addChild(description);
    }

    // Make card interactive for hover effects and click
    if (enableHover || onClick) {
      cardContainer.interactive = true;
      cardContainer.cursor = 'pointer';

      if (enableHover) {
        cardContainer.on('pointerover', () => {
          bg.tint = 0xcccccc;
        });

        cardContainer.on('pointerout', () => {
          bg.tint = 0xffffff;
        });
      }

      if (onClick) {
        cardContainer.on('pointertap', () => {
          onClick(card);
        });
      }
    }

    return cardContainer;
  }

  public createCharacterCard(character: any, x: number, y: number, width: number, height: number): Container {
    const card = this.createCard(x, y, width, height, character.rarity || 'common');

    this.createAvatar(character, width, height, width/2, height * 0.2).then(avatarIcon => {
      card.addChild(avatarIcon);
    });

    // HP Bar (replaces hpText)
    const hpBarWidth = width * 0.9;
    const hpBarHeight = 10;
    const hpBarX = (width - hpBarWidth) / 2;
    const hpBarY = y + height * 0.35;

    // Background bar
    const hpBarBg = new Graphics()
      .roundRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight, 4)
      .fill(Colors.HP_BAR_BG);

    // Foreground (current HP)
    const hpPercent = Math.max(0, Math.min(1, character.hp / (character.max_hp || character.hp || 1)));
    const hpBarFg = new Graphics()
      .roundRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight, 4)
      .fill(Colors.HP_BAR_FILL);
    
    card.addChild(hpBarBg, hpBarFg);

    const atkText = new Text({
      text: `⚔️ ${character.atk}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY
      }
    });
    atkText.x = width * 0.2;
    atkText.y = y + height * 0.5;

    const defText = new Text({
      text: `🛡️ ${character.def}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY
      }
    });
    defText.x = width * 0.2;
    defText.y = y + height * 0.7;

    card.addChild(atkText, defText);

    return card;
  }

  public createHeroCard(
    character: any,
    x: number,
    y: number,
    cardType: 'preview' | 'detailed' | 'lineup' | 'pool' = 'detailed',
    positionIndex?: number,
    customWidth?: number
  ): Container {
    // Define card dimensions based on type, or use custom width
    const cardSizes = {
      preview: { width: customWidth || 120, height: (customWidth || 120) * 1.25 }, // 4:5 aspect ratio
      detailed: { width: customWidth || 140, height: (customWidth || 140) * 1.25 }, // 4:5 aspect ratio  
      lineup: { width: customWidth || 100, height: customWidth || 100 },
      pool: { width: customWidth || 90, height: customWidth || 90 }
    };
    
    const { width, height } = cardSizes[cardType];
    const card = this.createCard(x, y, width, height, character.rarity || 'common');
    (card as any).character = character;

    // Character name - responsive font size
    const baseNameSize = cardType === 'detailed' ? 16 : (cardType === 'preview' ? 14 : 12);
    const nameSize = this.calculateResponsiveFontSize(baseNameSize, width, this.gameWidth, 10, 20);
    const nameText = new Text({
      text: character.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: nameSize,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = width / 2;
    nameText.y = cardType === 'lineup' || cardType === 'pool' ? height / 2 - 15 : height * 0.15;
    //card.addChild(nameText);
    
    // // Level text - positioned below symbol
    // const levelSize = cardType === 'detailed' ? 14 : (cardType === 'preview' ? 12 : 10);
    // const levelText = new Text({
    //   text: `Lv.${character.level}`,
    //   style: {
    //     fontFamily: 'Kalam',
    //     fontSize: levelSize,
    //     fill: Colors.TEXT_SECONDARY,
    //     align: 'center'
    //   }
    // });
    // levelText.anchor.set(0.5);
    // levelText.x = width / 2;
    // levelText.y = cardType === 'lineup' || cardType === 'pool' ? height / 2 + 10 : 50;

    // card.addChild(nameText, levelText);

    // Avatar text (ticker symbol)
    this.createAvatar(character, width, height).then(avatarIcon => {
      card.addChild(avatarIcon);
    });
    
    // Add additional elements based on card type
    if (cardType === 'detailed') {
      this.addDetailedCardElements(card, character, width, height);
    } else if (cardType === 'preview') {
      this.addPreviewCardElements(card, character, width, height);
    }

    // Add element indicator for all types except lineup/pool
    if (cardType !== 'lineup' && cardType !== 'pool') {
      //this.addElementIndicator(card, character, width);
    }
    
    return card;
  }

  protected createAvatar(character: any, cardWidth: number, cardHeight: number, x?: number, y?: number): Promise<Sprite> {
    return new Promise(async (resolve) => {
      const avatarTexture = await Assets.load(character?.avatar_url || 'https://pixijs.com/assets/bunny.png');
      const avatarIcon = new Sprite(avatarTexture);
      
      // Calculate avatar size based on card dimensions
      const avatarSize = Math.min(cardWidth * 0.4, cardHeight * 0.4, 80);
      avatarIcon.width = avatarSize;
      avatarIcon.height = avatarSize;
      avatarIcon.anchor.set(0.5);
      if (x !== undefined && y !== undefined) {
        avatarIcon.x = x;
        avatarIcon.y = y;
      } else {
        avatarIcon.x = cardWidth / 2;
        avatarIcon.y = avatarSize - 10; // Position in lower half of card
      }
      resolve(avatarIcon);
    });
  }

  private addDetailedCardElements(card: Container, character: any, width: number, height: number): void {    
    // Experience with responsive font
    const baseExpSize = 9;
    const expSize = this.calculateResponsiveFontSize(baseExpSize, width, this.gameWidth, 7, 12);
    const expText = new Text({
      text: `EXP: ${character.exp}`,
      style: {
        fontFamily: 'Kalam',
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
    const statSize = this.calculateResponsiveFontSize(baseStatSize, width, this.gameWidth, 6, 10);
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
          fontFamily: 'Kalam',
          fontSize: statSize,
          fill: Colors.TEXT_SECONDARY
        }
      });
      statText.x = width * 0.08 + (index % 2) * (width / 2 - width * 0.08);
      statText.y = height * 0.72 + Math.floor(index / 2) * (height * 0.08);
      card.addChild(statText);
    });
    
    card.addChild(expText);
  }

  private addPreviewCardElements(card: Container, character: any, width: number, height: number): void {
    // Basic stats for preview
    const hpText = new Text({
      text: `❤️ ${character.hp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY
      }
    });
    hpText.x = width / 4;
    hpText.y = 85;

    const atkText = new Text({
      text: `⚔️ ${character.atk}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY
      }
    });
    atkText.x = width / 4;
    atkText.y = 105;

    const defText = new Text({
      text: `🛡️ ${character.def}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY
      }
    });
    defText.x = width / 4;
    defText.y = 125;

    card.addChild(hpText, atkText, defText);
  }

  private addElementIndicator(card: Container, character: any, width: number): void {
    const elementColors: { [key: string]: string } = {
      fire: Colors.ELEMENT_FIRE,
      water: Colors.ELEMENT_WATER,
      earth: Colors.ELEMENT_EARTH,
      air: Colors.ELEMENT_AIR,
      light: Colors.ELEMENT_LIGHT,
      dark: Colors.ELEMENT_DARK
    };
    
    const elementIndicator = new Graphics();
    elementIndicator.circle(width - 15, 15, 6)
      .fill(elementColors[character.element || 'earth'] || Colors.ELEMENT_DEFAULT);
    
    card.addChild(elementIndicator);
  }

  private createPolishedCard(w: number, h: number, isSelected: boolean = false): Container {
    const c = new Container();

    // Shadow
    c.filters = [
      new DropShadowFilter({ color: 0x000000, alpha: 0.17, blur: 8, offset: { x: 4, y: 4 } })
    ];

    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 12).fill(0xffffff);
    c.addChild(bg);

    // Glow on selection
    if (isSelected) {
      c.filters = [
        ...(c.filters ?? []),
        new GlowFilter({ color: 0xffa000, distance: 8, outerStrength: 2, innerStrength: 0.8 })
      ];
    }

    return c;
  }
}