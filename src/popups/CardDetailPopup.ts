import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { BattleCard, Card, CardType, CardRarity } from '@/types';

// Utility function to convert Card to BattleCard for tooltip display
export function cardToBattleCard(card: Card): BattleCard {
  return {
    id: card.id,
    name: card.name,
    description: card.description,
    energyCost: card.energy_cost,
    group: card.group as CardType,
    rarity: (card.rarity as CardRarity) || CardRarity.COMMON,
    effects: [], // Card type doesn't have effects, so empty array
    cardType: card.card_type
  };
}

export class CardDetailPopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private card: BattleCard;
  private gameWidth: number;
  private gameHeight: number;
  private isTooltipMode: boolean;

  constructor(params: { card: BattleCard, tooltipMode?: boolean }) {
    super();
    this.card = params.card;
    this.isTooltipMode = params.tooltipMode || false;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.createDialog();
  }

  private createDialog(): void {
    if (this.isTooltipMode) {
      this.createTooltipMode();
    } else {
      this.createPopupMode();
    }
  }

  private createTooltipMode(): void {
    // For tooltip mode, create a compact display without full-screen background
    const tooltipWidth = 300;
    const tooltipHeight = 150;
    
    // Create tooltip panel (no full-screen background in tooltip mode)
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(0, 0, tooltipWidth, tooltipHeight, 8)
      .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY });

    this.addChild(this.dialogPanel);

    // Card name
    const cardNameText = new Text({
      text: this.card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.RARITY_LEGENDARY,
        align: 'left'
      }
    });
    cardNameText.x = 10;
    cardNameText.y = 10;
    this.addChild(cardNameText);

    // Energy cost
    const energyCostText = new Text({
      text: `Energy: ${this.card.energyCost}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY,
        align: 'left'
      }
    });
    energyCostText.x = 10;
    energyCostText.y = 35;
    this.addChild(energyCostText);

    // Card type
    if (this.card.cardType || this.card.group) {
      const typeText = new Text({
        text: `Type: ${this.card.cardType || this.card.group}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: Colors.TEXT_PRIMARY,
          align: 'left'
        }
      });
      typeText.x = 10;
      typeText.y = 55;
      this.addChild(typeText);
    }

    // Card description
    const cardDescText = new Text({
      text: this.card.description,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: tooltipWidth - 20
      }
    });
    cardDescText.x = 10;
    cardDescText.y = 80;
    this.addChild(cardDescText);
  }

  private createPopupMode(): void {
    // Create semi-transparent background
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x000000, alpha: 0.7 });
    
    const cardWidth = Math.min(480, this.gameWidth - 40);
    const cardHeight = 600;
    const cardX = (this.gameWidth - cardWidth) / 2;
    const cardY = (this.gameHeight - cardHeight) / 2;
    
    // Create card-like background with enhanced trading card appearance
    this.dialogPanel = new Graphics();
    
    // Card shadow for depth
    this.dialogPanel.roundRect(cardX + 6, cardY + 6, cardWidth, cardHeight, 16)
      .fill({ color: Colors.SHADOW_COLOR, alpha: 0.5 });
    
    // Get rarity color for background
    const rarityColors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON, 
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    const rarityColor = rarityColors[this.card.rarity] || rarityColors.common;
    
    // Main card background with rarity color
    this.dialogPanel.roundRect(cardX, cardY, cardWidth, cardHeight, 16)
      .fill(Colors.CARD_BACKGROUND)
      .stroke({ width: 4, color: rarityColor });
    
    // Inner card frame for that trading card look
    this.dialogPanel.roundRect(cardX + 8, cardY + 8, cardWidth - 16, cardHeight - 16, 8)
      .stroke({ width: 2, color: Colors.CARD_BORDER, alpha: 0.4 });
    
    // Top border accent for premium card feel
    this.dialogPanel.roundRect(cardX + 12, cardY + 12, cardWidth - 24, 20, 4)
      .fill({ color: rarityColor, alpha: 0.3 });

    // Enhanced energy cost (top left) with card-like styling - larger version
    const energyCircleRadius = 28;
    const energyCostBg = new Graphics()
      .circle(cardX + 40, cardY + 40, energyCircleRadius)
      .fill({ color: Colors.ENERGY_ACTIVE })
      .stroke({ width: 3, color: Colors.BUTTON_BORDER });
    
    // Inner energy circle for depth
    const energyCostInner = new Graphics()
      .circle(cardX + 40, cardY + 40, energyCircleRadius - 4)
      .stroke({ width: 2, color: Colors.TEXT_WHITE, alpha: 0.5 });
    
    const energyText = new Text({
      text: this.card.energyCost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = cardX + 40;
    energyText.y = cardY + 40;

    // Group icon at top right - larger version
    let groupIcon = '';
    switch (this.card.group) {
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
        fontSize: 32,
        align: 'center',
        fill: Colors.TEXT_PRIMARY
      }
    });
    groupIconText.anchor.set(1, 0);
    groupIconText.x = cardX + cardWidth - 20;
    groupIconText.y = cardY + 20;

    // Card name - styled like createDeckCard but larger
    const cardNameText = new Text({
      text: this.card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 28,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 80
      }
    });
    cardNameText.anchor.set(0.5, 0);
    cardNameText.x = cardX + cardWidth / 2;
    cardNameText.y = cardY + 80;

    // Card type and rarity badge - enhanced
    let cardTypeBadge: Container | null = null;
    if (this.card.cardType || this.card.group) {
      cardTypeBadge = this.createCardTypeBadge(
        (this.card.cardType || this.card.group).toString().toUpperCase(),
        cardX + cardWidth / 2 - 60,
        cardY + 130
      );
    }

    // Rarity badge
    const rarityBadge = this.createRarityBadge(
      this.card.rarity.toString().toUpperCase(),
      cardX + cardWidth / 2 + 20,
      cardY + 130
    );

    // Card description with better spacing
    const cardDescText = new Text({
      text: this.card.description,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 60
      }
    });
    cardDescText.anchor.set(0.5, 0);
    cardDescText.x = cardX + cardWidth / 2;
    cardDescText.y = cardY + 180;

    // Effects list with better layout
    let effectsY = cardY + 280;
    if (this.card.effects && this.card.effects.length > 0) {
      const effectsTitle = new Text({
        text: 'Effects:',
        style: {
          fontFamily: 'Kalam',
          fontSize: 18,
          fontWeight: 'bold',
          fill: Colors.TEXT_PRIMARY,
          align: 'center'
        }
      });
      effectsTitle.anchor.set(0.5, 0);
      effectsTitle.x = cardX + cardWidth / 2;
      effectsTitle.y = effectsY;

      this.addChild(effectsTitle);
      effectsY += 35;

      this.card.effects.forEach((effect, index) => {
        const effectText = new Text({
          text: `${effect.type}: ${effect.value}`,
          style: {
            fontFamily: 'Kalam',
            fontSize: 14,
            fill: Colors.TEXT_SECONDARY,
            align: 'center'
          }
        });
        effectText.anchor.set(0.5, 0);
        effectText.x = cardX + cardWidth / 2;
        effectText.y = effectsY + (index * 25);
        this.addChild(effectText);
      });
    }

    // Close button - positioned at bottom
    const closeButton = this.createButton(
      'Close',
      cardX + cardWidth / 2 - 50,
      cardY + cardHeight - 70,
      100,
      45,
      () => {
        navigation.dismissPopup();
      }
    );

    // Make background clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.on('pointerdown', () => {
      navigation.dismissPopup();
    });
    
    // Add all elements to container
    const children = [
      this.dialogBg, 
      this.dialogPanel, 
      energyCostBg, 
      energyCostInner, 
      energyText,
      groupIconText,
      cardNameText, 
      cardDescText, 
      rarityBadge,
      closeButton
    ];
    
    if (cardTypeBadge) {
      children.splice(-1, 0, cardTypeBadge); // Insert before close button
    }
    
    this.addChild(...children);
  }

  private createCardTypeBadge(cardType: string, x: number, y: number): Container {
    const badgeContainer = new Container();
    
    const badgeBg = new Graphics();
    badgeBg.roundRect(0, 0, 120, 30, 15)
      .fill({ color: Colors.BACKGROUND_SECONDARY })
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const badgeText = new Text({
      text: cardType,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON,
        align: 'center'
      }
    });
    badgeText.anchor.set(0.5);
    badgeText.x = 60;
    badgeText.y = 15;
    
    badgeContainer.addChild(badgeBg, badgeText);
    badgeContainer.x = x;
    badgeContainer.y = y;
    
    return badgeContainer;
  }

  private createRarityBadge(rarity: string, x: number, y: number): Container {
    const badgeContainer = new Container();
    
    // Get rarity color
    const rarityColors: { [key: string]: string } = {
      COMMON: Colors.RARITY_COMMON,
      UNCOMMON: Colors.RARITY_UNCOMMON,
      RARE: Colors.RARITY_RARE,
      EPIC: Colors.RARITY_EPIC,
      LEGENDARY: Colors.RARITY_LEGENDARY
    };
    const rarityColor = rarityColors[rarity] || Colors.RARITY_COMMON;
    
    const badgeBg = new Graphics();
    badgeBg.roundRect(0, 0, 120, 30, 15)
      .fill({ color: rarityColor })
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const badgeText = new Text({
      text: rarity,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    badgeText.anchor.set(0.5);
    badgeText.x = 60;
    badgeText.y = 15;
    
    badgeContainer.addChild(badgeBg, badgeText);
    badgeContainer.x = x;
    badgeContainer.y = y;
    
    return badgeContainer;
  }

  private createButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5);
    bg.fill({ color: Colors.BUTTON_PRIMARY });
    bg.stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON
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
    button.on('pointerdown', onClick);
    
    // Add hover effect
    button.on('pointerover', () => {
      bg.tint = 0xcccccc;
    });
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    return button;
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    // Recreate dialog with new dimensions
    this.removeChildren();
    this.createDialog();
  }

  public positionAtTop(screenWidth: number, screenHeight: number, _padding: number = 20): void {
    if (this.isTooltipMode) {
      // Position tooltip at top center of screen
      this.x = (screenWidth - 300) / 2; // 300 is tooltipWidth
      this.y = screenHeight * 0.30; // 30% from top
    }
  }
}