import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { Card } from '@/types';

export class CardTooltip extends Container {
  private tooltipBg!: Graphics;
  private card: Card;

  constructor(card: Card) {
    super();
    this.card = card;
    this.createTooltip();
  }

  private createTooltip(): void {
    // Create tooltip background
    this.tooltipBg = new Graphics();
    
    const tooltipWidth = 300;
    const tooltipHeight = 150;
    
    // Semi-transparent background with rounded corners
    this.tooltipBg.roundRect(0, 0, tooltipWidth, tooltipHeight, 8)
      .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY });

    this.addChild(this.tooltipBg);

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
      text: `Energy: ${this.card.energy_cost}`,
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
    if (this.card.group) {
      const typeText = new Text({
        text: `Type: ${this.card.group}`,
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

  public positionAtTop(screenWidth: number, screenHeight: number, padding: number = 20): void {
    // Position tooltip at top center of screen
    this.x = (screenWidth - this.tooltipBg.width) / 2;
    this.y = padding;
  }
}