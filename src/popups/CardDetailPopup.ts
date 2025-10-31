import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { Card, CardType, CardRarity } from '@/types';
import { DropShadowFilter } from 'pixi-filters';

export class CardDetailPopup extends Container {
  private dialogPanel!: Graphics;
  private dialogBg?: Graphics;
  private card: Card;

  public static readonly CARD_WIDTH = 250;
  public static readonly CARD_HEIGHT = 300;
  
  private readonly CARD_MAX_WIDTH = CardDetailPopup.CARD_WIDTH;
  private readonly CARD_MAX_HEIGHT = CardDetailPopup.CARD_HEIGHT;

  private popupMode: boolean = false;

  constructor(params: { card: Card, popupMode?: boolean }) {
    super();
    this.card = params.card;
    this.popupMode = params.popupMode || false;
    this.createDialog();
  }

  private createDialog(): void {
    if (this.popupMode) {
      this.createOverlay();
    }
    this.createCardDisplay();
    if (this.popupMode) {
      this.positionAtCenter(navigation.width, navigation.height);
    } else {
      this.positionAtTop(navigation.width, navigation.height);
    }
  }

  private createOverlay(): void {
    // Create semi-transparent dark overlay
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, navigation.width, navigation.height)
      .fill({ color: Colors.BLACK, alpha: 0.85 });
    
    // Make overlay clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.cursor = 'pointer';
    this.dialogBg.on('pointerdown', () => {
      navigation.dismissPopup();
    });

    this.addChild(this.dialogBg);
  }

  private createCardDisplay(): void {
    const cardWidth = this.CARD_MAX_WIDTH;
    const cardHeight = this.CARD_MAX_HEIGHT;

    this.dialogPanel = new Graphics();

    // Shadows
    this.dialogPanel.roundRect(6, 6, cardWidth, cardHeight, 14)
      .fill({ color: Colors.BLACK, alpha: 0.6 });
    this.dialogPanel.roundRect(3, 3, cardWidth, cardHeight, 14)
      .fill({ color: Colors.BLACK, alpha: 0.3 });

    // Main card background
    this.dialogPanel.roundRect(0, 0, cardWidth, cardHeight, 14)
      .fill({ color: Colors.PARCHMENT_LIGHT, alpha: 0.98 })
      .stroke({ width: 3, color: Colors.GOLD });

    // Inner layer
    this.dialogPanel.roundRect(5, 5, cardWidth - 10, cardHeight - 10, 10)
      .fill({ color: Colors.PARCHMENT, alpha: 0.7 });

    // Inner trim
    this.dialogPanel.roundRect(7, 7, cardWidth - 14, cardHeight - 14, 8)
      .stroke({ width: 1.5, color: Colors.GOLD_BRIGHT, alpha: 0.6 });

    this.drawOrnateCorners(0, 0, cardWidth, cardHeight);

    // Top banner
    const rarityColor = this.getRarityColor(this.card.rarity);
    const bannerHeight = 24;
    this.dialogPanel.moveTo(14, 14)
      .lineTo(10, 20)
      .lineTo(14, 14 + bannerHeight)
      .lineTo(cardWidth - 14, 14 + bannerHeight)
      .lineTo(cardWidth - 10, 20)
      .lineTo(cardWidth - 14, 14)
      .lineTo(14, 14)
      .fill({ color: rarityColor, alpha: 0.85 })
      .stroke({ width: 2, color: Colors.BROWN });

    // Art frame
    const frameMargin = 14;
    const frameY = 48;
    const frameHeight = 90;
    const frameWidth = cardWidth - (frameMargin * 2);

    this.dialogPanel.roundRect(frameMargin, frameY, frameWidth, frameHeight, 8)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.95 })
      .stroke({ width: 1.5, color: Colors.GOLD, alpha: 0.95 });

    this.dialogPanel.roundRect(frameMargin + 2, frameY + 2, frameWidth - 4, frameHeight - 4, 6)
      .stroke({ width: 1, color: Colors.BROWN, alpha: 0.6 });

    this.drawFantasyCorners(frameMargin, frameY, frameWidth, frameHeight, Colors.GOLD_BRIGHT);

    this.addChild(this.dialogPanel);

    // Energy cost badge (bigger)
    const energyBadge = this.createEnergyGem(14, 28, 48, 28);
    this.addChild(energyBadge);

    // Group icon (top right, bigger)
    const groupIcon = this.getGroupIcon(this.card.group);
    const groupColor = this.getGroupColor(this.card.group);

    const groupIconBg = new Graphics()
      .circle(cardWidth - 32, 38, 22)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD, alpha: 0.95 });

    groupIconBg.circle(cardWidth - 32, 38, 18)
      .stroke({ width: 2, color: groupColor, alpha: 0.7 });

    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fill: Colors.WHITE
      }
    });
    groupIconText.anchor.set(0.5);
    groupIconText.x = cardWidth - 32;
    groupIconText.y = 38;
    groupIconText.filters = [new DropShadowFilter({
      offset: { x: 0, y: 0 },
      blur: 10,
      alpha: 0.9,
      color: groupColor
    })];

    this.addChild(groupIconBg, groupIconText);

    // Card name
    const cardNameText = new Text({
      text: this.card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.BROWN_DARK,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 40,
        stroke: { color: Colors.GOLD_BRIGHT, width: 1 },
        dropShadow: { color: Colors.GOLD, blur: 1, angle: Math.PI / 4, distance: 1, alpha: 0.5 }
      }
    });
    cardNameText.anchor.set(0.5, 0);
    cardNameText.x = cardWidth / 2;
    cardNameText.y = 12;
    this.addChild(cardNameText);

    // Avatar icon
    const avatarIcon = new Text({
      text: this.card.icon_url || groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 54,
        fill: Colors.WHITE
      }
    });
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = cardWidth / 2;
    avatarIcon.y = frameY + frameHeight / 2;
    avatarIcon.filters = [new DropShadowFilter({
      offset: { x: 0, y: 0 },
      blur: 8,
      alpha: 0.9,
      color: groupColor
    })];
    this.addChild(avatarIcon);

    // Divider (move below avatar)
    const dividerY = frameY + frameHeight + 12;
    const divider = new Graphics();
    divider.moveTo(18, dividerY)
      .lineTo(cardWidth - 18, dividerY)
      .stroke({ width: 1, color: Colors.BROWN, alpha: 0.5 });
    divider.circle(cardWidth / 2, dividerY, 2)
      .fill({ color: Colors.GOLD });
    this.addChild(divider);

    // Description (below divider)
    const descY = dividerY + 10;
    const descText = new Text({
      text: this.card.description,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fill: Colors.BROWN_DARKER,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 24,
      }
    });
    descText.anchor.set(0.5, 0);
    descText.x = cardWidth / 2;
    descText.y = descY;
    this.addChild(descText);

    // show close button on popup mode
    if (this.popupMode) {
      this.createCloseButton(cardWidth, cardHeight);
    }
  }

  private createEnergyGem(x: number, y: number, width: number, height: number): Container {
    const gem = new Container();

    // Gem shape (hexagonal/diamond style)
    const gemBg = new Graphics();
    
    // Dark background
    gemBg.roundRect(0, 0, width, height, height / 4)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD, alpha: 0.95 });
    
    // Inner shine/highlight
    gemBg.roundRect(2, 2, width - 4, height - 4, height / 4 - 1)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });

    const energyIcon = new Text({
      text: '⚡',
      style: {
        fontFamily: 'Kalam',
        fontSize: height * 0.45,
        fill: Colors.ORANGE,
        dropShadow: {
          color: Colors.GOLD_BRIGHT,
          blur: 4,
          angle: 0,
          distance: 0,
          alpha: 0.8
        }
      }
    });
    energyIcon.anchor.set(0.5);
    energyIcon.x = width * 0.3;
    energyIcon.y = height / 2;

    const energyText = new Text({
      text: this.card.energy_cost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: height * 0.55,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BROWN_DARK, width: 3 }
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = width * 0.7;
    energyText.y = height / 2;

    gem.addChild(gemBg, energyIcon, energyText);
    gem.x = x;
    gem.y = y;

    return gem;
  }

  private drawOrnateCorners(x: number, y: number, width: number, height: number): void {
    const cornerSize = 20;
    const cornerColor = Colors.GOLD_BRIGHT;

    // Top-left ornate corner
    this.dialogPanel.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 3, color: cornerColor, alpha: 0.9 });
    
    // Small decorative flourish
    this.dialogPanel.circle(x + 8, y + 8, 2)
      .fill({ color: cornerColor });

    // Top-right
    this.dialogPanel.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 3, color: cornerColor, alpha: 0.9 });
    
    this.dialogPanel.circle(x + width - 8, y + 8, 2)
      .fill({ color: cornerColor });

    // Bottom-left
    this.dialogPanel.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 3, color: cornerColor, alpha: 0.9 });
    
    this.dialogPanel.circle(x + 8, y + height - 8, 2)
      .fill({ color: cornerColor });

    // Bottom-right
    this.dialogPanel.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 3, color: cornerColor, alpha: 0.9 });
    
    this.dialogPanel.circle(x + width - 8, y + height - 8, 2)
      .fill({ color: cornerColor });
  }

  private drawFantasyCorners(x: number, y: number, width: number, height: number, color: string): void {
    const cornerSize = 12;

    // More elaborate corner decorations
    const cornerGraphics = new Graphics();

    // Top-left L-shape with ornament
    cornerGraphics.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 2, color: color, alpha: 0.9 });
    
    cornerGraphics.circle(x + 5, y + 5, 1.5)
      .fill({ color: color });

    // Top-right
    cornerGraphics.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.9 });
    
    cornerGraphics.circle(x + width - 5, y + 5, 1.5)
      .fill({ color: color });

    // Bottom-left
    cornerGraphics.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 2, color: color, alpha: 0.9 });
    
    cornerGraphics.circle(x + 5, y + height - 5, 1.5)
      .fill({ color: color });

    // Bottom-right
    cornerGraphics.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.9 });
    
    cornerGraphics.circle(x + width - 5, y + height - 5, 1.5)
      .fill({ color: color });

    this.addChild(cornerGraphics);
  }

  private getGroupIcon(group: string): string {
    const groupLower = group.toLowerCase();
    if (groupLower.includes('attack') || groupLower.includes('damage')) return '⚔️';
    return '✨';
  }

  private getGroupColor(group: string): string {
    const groupLower = group.toLowerCase();
    if (groupLower.includes('attack') || groupLower.includes('damage')) return Colors.RED;
    return Colors.GREEN_BRIGHT;
  }

  private getRarityColor(rarity?: string): string {
    const rarityColors: { [key: string]: string } = {
      common: Colors.GRAY_SILVER,    // Grey
      uncommon: Colors.GREEN_BRIGHT,  // Green
      rare: Colors.BLUE_SKY,      // Blue
      epic: Colors.PURPLE_BRIGHT,      // Purple
      legendary: Colors.ORANGE  // Gold/Orange
    };
    return rarityColors[rarity?.toLowerCase() || 'common'] || rarityColors.common;
  }

  private createCloseButton(cardWidth: number, cardHeight: number): void {
    const buttonSize = 30;
    const button = new Container();
    
    const bg = new Graphics();
    bg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2)
      .fill({ color: Colors.BROWN, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD });
    
    const buttonText = new Text({
      text: '✕',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.WHITE
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = buttonSize / 2;
    buttonText.y = buttonSize / 2;
    
    button.addChild(bg, buttonText);
    button.x = cardWidth - buttonSize - 5;
    button.y = 5;
    
    button.interactive = true;
    button.cursor = 'pointer';
    button.on('pointerdown', () => {
      navigation.dismissPopup();
    });
    
    button.on('pointerover', () => {
      bg.tint = 0xcccccc;
      button.scale.set(1.1);
    });
    
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
      button.scale.set(1.0);
    });
    
    this.addChild(button);
  }

  public positionAtTop(screenWidth: number, screenHeight: number, padding: number = 20): void {
    // Position the content container
    this.x = (screenWidth - this.CARD_MAX_WIDTH) / 2;
    this.y = 70;
  }

  public positionAtCenter(screenWidth: number, screenHeight: number): void {
    // Create a container for card content (everything except overlay)
    const contentContainer = new Container();
    
    // Move all children except overlay to content container
    const childrenToMove = this.children.filter(child => child !== this.dialogBg);
    childrenToMove.forEach(child => {
      this.removeChild(child);
      contentContainer.addChild(child);
    });
    
    // Center the content container on screen
    contentContainer.x = (screenWidth - this.CARD_MAX_WIDTH) / 2;
    contentContainer.y = (screenHeight - this.CARD_MAX_HEIGHT) / 2;
    
    this.addChild(contentContainer);
  }
}