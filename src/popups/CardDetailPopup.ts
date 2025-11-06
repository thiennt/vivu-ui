import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors, FontFamily } from '@/utils/cssStyles';
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
      .fill({ color: Colors.BLACK, alpha: 0.9 });
    
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

    // Clean shadow
    this.dialogPanel.roundRect(4, 4, cardWidth, cardHeight, 12)
      .fill({ color: Colors.BLACK, alpha: 0.5 });

    // Main card background - darker for better contrast
    this.dialogPanel.roundRect(0, 0, cardWidth, cardHeight, 12)
      .fill({ color: 0x0a0e1a, alpha: 1 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 1 });

    // Subtle inner glow
    this.dialogPanel.roundRect(2, 2, cardWidth - 4, cardHeight - 4, 10)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.3 });

    // Top banner - cleaner design
    const rarityColor = this.getRarityColor(this.card.rarity);
    const bannerHeight = 28;
    this.dialogPanel.roundRect(10, 10, cardWidth - 20, bannerHeight, 6)
      .fill({ color: rarityColor, alpha: 0.2 })
      .stroke({ width: 2, color: rarityColor, alpha: 0.8 });

    // Card name - improved readability (moved to top)
    const cardNameText = new Text({
      text: this.card.name,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 15,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 40,
        dropShadow: { 
          color: Colors.ROBOT_CYAN, 
          blur: 8, 
          angle: Math.PI / 4, 
          distance: 2, 
          alpha: 0.8 
        }
      }
    });
    cardNameText.anchor.set(0.5, 0.5);
    cardNameText.x = cardWidth / 2;
    cardNameText.y = 24;

    // Art frame - cleaner, more minimal
    const frameMargin = 15;
    const frameY = 52;
    const frameHeight = 100;
    const frameWidth = cardWidth - (frameMargin * 2);

    // Frame with neon glow
    this.dialogPanel.roundRect(frameMargin, frameY, frameWidth, frameHeight, 8)
      .fill({ color: 0x051420, alpha: 1 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.8 });

    // Inner frame accent
    this.dialogPanel.roundRect(frameMargin + 3, frameY + 3, frameWidth - 6, frameHeight - 6, 6)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.4 });

    this.addChild(this.dialogPanel);
    this.addChild(cardNameText);

    // Energy cost badge - hidden (energy feature disabled)
    // Energy badge removed to declutter UI

    // Group icon - positioned at top-right of frame
    const { icon: groupIcon, color: groupColor } = this.getGroupIconColor(this.card.group);

    const groupIconBg = new Graphics()
      .circle(frameWidth - 10, frameY + 20, 20)
      .fill({ color: 0x051420, alpha: 1 })
      .stroke({ width: 2, color: groupColor, alpha: 0.8 });
    
    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 22,
        fill: Colors.WHITE
      }
    });
    groupIconText.anchor.set(0.5);
    groupIconText.x = frameWidth - 10;
    groupIconText.y = frameY + 20;
    groupIconText.filters = [new DropShadowFilter({
      offset: { x: 0, y: 0 },
      blur: 12,
      alpha: 0.8,
      color: groupColor
    })];

    this.addChild(groupIconBg, groupIconText);

    // Avatar icon with stronger glow
    const avatarIcon = new Text({
      text: this.card.icon_url || groupIcon,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 60,
        fill: Colors.WHITE
      }
    });
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = cardWidth / 2;
    avatarIcon.y = frameY + frameHeight / 2;
    avatarIcon.filters = [new DropShadowFilter({
      offset: { x: 0, y: 0 },
      blur: 20,
      alpha: 0.9,
      color: Colors.ROBOT_CYAN
    })];
    this.addChild(avatarIcon);

    // Clean divider
    const dividerY = frameY + frameHeight + 15;
    const divider = new Graphics();
    divider.moveTo(25, dividerY)
      .lineTo(cardWidth - 25, dividerY)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.5 });
    
    // Accent dots
    divider.circle(25, dividerY, 2).fill({ color: Colors.ROBOT_CYAN, alpha: 0.8 });
    divider.circle(cardWidth - 25, dividerY, 2).fill({ color: Colors.ROBOT_CYAN, alpha: 0.8 });
    this.addChild(divider);

    // Description - improved readability
    const descY = dividerY + 12;
    const descText = new Text({
      text: this.card.description,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fill: Colors.WHITE,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 30,
        lineHeight: 22,
        dropShadow: {
          color: Colors.BLACK,
          blur: 2,
          angle: 0,
          distance: 1,
          alpha: 0.8
        }
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

  private getGroupIconColor(group: string): { icon: string; color: string } {
    let groupIcon = '';
    let iconColor: string = Colors.ROBOT_CYAN;

    if (group.includes('Damage')) {
      groupIcon = '⚔️';
      iconColor = Colors.RED;
    } else if (group.includes('Healing')) {
      groupIcon = '❤️';
      iconColor = Colors.GREEN_BRIGHT;
    } else if (group.includes('Buff')) {
      groupIcon = '🔼';
      iconColor = Colors.BLUE_SKY;
    } else {
      groupIcon = '✨';
      iconColor = Colors.PURPLE;
    }

    return { icon: groupIcon, color: iconColor };
  }

  private getRarityColor(rarity?: string): string {
    const rarityColors: { [key: string]: string } = {
      common: Colors.GRAY_SILVER,
      uncommon: Colors.GREEN_BRIGHT,
      rare: Colors.BLUE_SKY,
      epic: Colors.PURPLE_BRIGHT,
      legendary: Colors.ORANGE
    };
    return rarityColors[rarity?.toLowerCase() || 'common'] || rarityColors.common;
  }

  private createCloseButton(cardWidth: number, cardHeight: number): void {
    const buttonSize = 32;
    const button = new Container();
    
    const bg = new Graphics();
    bg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2)
      .fill({ color: 0x051420, alpha: 1 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.8 });
    
    const buttonText = new Text({
      text: '✕',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        dropShadow: {
          color: Colors.BLACK,
          blur: 2,
          angle: 0,
          distance: 1,
          alpha: 0.8
        }
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = buttonSize / 2;
    buttonText.y = buttonSize / 2;
    
    button.addChild(bg, buttonText);
    button.x = cardWidth - buttonSize - 8;
    button.y = 8;
    
    button.interactive = true;
    button.cursor = 'pointer';
    button.on('pointerdown', () => {
      navigation.dismissPopup();
    });
    
    button.on('pointerover', () => {
      bg.clear();
      bg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.3 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 1 });
      button.scale.set(1.05);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2)
        .fill({ color: 0x051420, alpha: 1 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.8 });
      button.scale.set(1.0);
    });
    
    this.addChild(button);
  }

  public positionAtTop(screenWidth: number, screenHeight: number, padding: number = 20): void {
    this.x = (screenWidth - this.CARD_MAX_WIDTH) / 2;
    this.y = 70;
  }

  public positionAtCenter(screenWidth: number, screenHeight: number): void {
    const contentContainer = new Container();
    
    const childrenToMove = this.children.filter(child => child !== this.dialogBg);
    childrenToMove.forEach(child => {
      this.removeChild(child);
      contentContainer.addChild(child);
    });
    
    contentContainer.x = (screenWidth - this.CARD_MAX_WIDTH) / 2;
    contentContainer.y = (screenHeight - this.CARD_MAX_HEIGHT) / 2;
    
    this.addChild(contentContainer);
  }
}