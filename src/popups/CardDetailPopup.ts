import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { BattleCard } from '@/types';

export class CardDetailPopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private card: BattleCard;
  private gameWidth: number;
  private gameHeight: number;

  constructor(params: { card: BattleCard }) {
    super();
    this.card = params.card;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.createDialog();
  }

  private createDialog(): void {
    // Create semi-transparent background
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x000000, alpha: 0.7 });
    
    const dialogWidth = Math.min(400, this.gameWidth - 40);
    const dialogHeight = 350;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Create dialog panel
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    // Dialog title
    const dialogTitle = new Text({
      text: 'Card Details',
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5, 0);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = dialogY + 20;

    // Card name
    const cardNameText = new Text({
      text: this.card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.RARITY_LEGENDARY,
        align: 'center'
      }
    });
    cardNameText.anchor.set(0.5, 0);
    cardNameText.x = this.gameWidth / 2;
    cardNameText.y = dialogY + 60;

    // Card type and rarity badge
    let cardTypeBadge: Container | null = null;
    if (this.card.cardType || this.card.group) {
      cardTypeBadge = this.createCardTypeBadge(
        (this.card.cardType || this.card.group).toUpperCase(),
        this.gameWidth / 2 - 40,
        dialogY + 90
      );
    }

    // Energy cost
    const energyCostText = new Text({
      text: `Energy Cost: ${this.card.energyCost}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    energyCostText.anchor.set(0.5, 0);
    energyCostText.x = this.gameWidth / 2;
    energyCostText.y = dialogY + 120;

    // Card description
    const cardDescText = new Text({
      text: this.card.description,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_SECONDARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: dialogWidth - 40
      }
    });
    cardDescText.anchor.set(0.5, 0);
    cardDescText.x = this.gameWidth / 2;
    cardDescText.y = dialogY + 150;

    // Effects list
    let effectsY = dialogY + 200;
    if (this.card.effects && this.card.effects.length > 0) {
      const effectsTitle = new Text({
        text: 'Effects:',
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fontWeight: 'bold',
          fill: Colors.TEXT_PRIMARY,
          align: 'center'
        }
      });
      effectsTitle.anchor.set(0.5, 0);
      effectsTitle.x = this.gameWidth / 2;
      effectsTitle.y = effectsY;

      this.addChild(effectsTitle);
      effectsY += 25;

      this.card.effects.forEach((effect, index) => {
        const effectText = new Text({
          text: `${effect.type}: ${effect.value}`,
          style: {
            fontFamily: 'Kalam',
            fontSize: 12,
            fill: Colors.TEXT_SECONDARY,
            align: 'center'
          }
        });
        effectText.anchor.set(0.5, 0);
        effectText.x = this.gameWidth / 2;
        effectText.y = effectsY + (index * 20);
        this.addChild(effectText);
      });
    }

    // Close button
    const closeButton = this.createButton(
      'Close',
      this.gameWidth / 2 - 40,
      dialogY + dialogHeight - 60,
      80,
      35,
      () => {
        navigation.dismissPopup();
      }
    );

    // Make background clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.on('pointerdown', () => {
      navigation.dismissPopup();
    });
    
    const children = [this.dialogBg, this.dialogPanel, dialogTitle, cardNameText, energyCostText, cardDescText, closeButton];
    if (cardTypeBadge) {
      children.splice(-1, 0, cardTypeBadge); // Insert before close button
    }
    
    this.addChild(...children);
  }

  private createCardTypeBadge(cardType: string, x: number, y: number): Container {
    const badgeContainer = new Container();
    
    const badgeBg = new Graphics();
    badgeBg.roundRect(0, 0, 80, 25, 12)
      .fill({ color: Colors.BACKGROUND_SECONDARY })
      .stroke({ width: 1, color: Colors.BUTTON_BORDER });
    
    const badgeText = new Text({
      text: cardType,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON,
        align: 'center'
      }
    });
    badgeText.anchor.set(0.5);
    badgeText.x = 40;
    badgeText.y = 12;
    
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
}