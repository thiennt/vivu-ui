import { Container, Graphics, Text, FederatedPointerEvent } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { Card } from '@/types';
import { app } from '@/app';

export interface BattleHandOptions {
  width: number;
  height: number;
  cardWidth: number;
  cardHeight: number;
  isOpponent?: boolean;
}

export interface BattleHandEvents {
  onCardDragStart?: (card: Card, cardContainer: Container) => void;
  onCardHover?: (card: Card, cardContainer: Container) => void;
  onCardOut?: (card: Card, cardContainer: Container) => void;
}

export class BattleHand extends Container {
  private cards: Card[] = [];
  private cardContainers: Container[] = [];
  private options: BattleHandOptions;
  private events: BattleHandEvents;

  constructor(options: BattleHandOptions, events: BattleHandEvents = {}) {
    super();
    this.options = options;
    this.events = events;
    this.createBackground();
  }

  private createBackground(): void {
    const bg = new Graphics()
      .roundRect(0, 0, this.options.width, this.options.height, 10)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.3 })
      .stroke({ color: Colors.UI_BORDER, width: 2 });
    this.addChild(bg);

    if (!this.options.isOpponent) {
      const label = new Text({
        text: 'Your Hand',
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fill: Colors.TEXT_SECONDARY,
          align: 'center'
        }
      });
      label.anchor.set(0.5);
      label.x = this.options.width / 2;
      label.y = 15;
      this.addChild(label);
    }
  }

  public setCards(cards: Card[]): void {
    this.cards = cards;
    this.updateCardDisplay();
  }

  public addCard(card: Card): void {
    this.cards.push(card);
    this.updateCardDisplay();
  }

  public removeCard(card: Card): void {
    const index = this.cards.findIndex(c => c.id === card.id);
    if (index >= 0) {
      this.cards.splice(index, 1);
      this.updateCardDisplay();
    }
  }

  private updateCardDisplay(): void {
    // Clear existing card containers
    this.cardContainers.forEach(container => {
      container.destroy({ children: true });
    });
    this.cardContainers = [];

    const startY = this.options.isOpponent ? 10 : 35;
    const maxCardsVisible = Math.floor((this.options.width - 20) / (this.options.cardWidth + 5));
    const visibleCards = this.cards.slice(0, maxCardsVisible);
    
    if (visibleCards.length === 0) return;

    const totalCardWidth = visibleCards.length * this.options.cardWidth + (visibleCards.length - 1) * 5;
    const startX = (this.options.width - totalCardWidth) / 2;

    visibleCards.forEach((card, index) => {
      const cardContainer = this.createCardContainer(card);
      cardContainer.x = startX + index * (this.options.cardWidth + 5);
      cardContainer.y = startY;
      
      if (!this.options.isOpponent) {
        this.makeCardInteractive(cardContainer, card);
      }
      
      this.addChild(cardContainer);
      this.cardContainers.push(cardContainer);
    });

    // Show card count if there are more cards than visible
    if (this.cards.length > maxCardsVisible) {
      const countText = new Text({
        text: `+${this.cards.length - maxCardsVisible}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: Colors.TEXT_SECONDARY
        }
      });
      countText.anchor.set(1, 0);
      countText.x = this.options.width - 10;
      countText.y = startY + this.options.cardHeight / 2;
      this.addChild(countText);
    }
  }

  private createCardContainer(card: Card): Container {
    const container = new Container();
    
    // Card background
    const cardBg = new Graphics()
      .roundRect(0, 0, this.options.cardWidth, this.options.cardHeight, 5)
      .fill({ color: this.getCardColor(card.type) })
      .stroke({ color: Colors.BORDER_PRIMARY, width: 1 });
    container.addChild(cardBg);

    if (this.options.isOpponent) {
      // Show card back for opponent
      const cardBack = new Graphics()
        .roundRect(2, 2, this.options.cardWidth - 4, this.options.cardHeight - 4, 3)
        .fill({ color: Colors.PANEL_BACKGROUND });
      container.addChild(cardBack);
    } else {
      // Show card details for player
      const nameText = new Text({
        text: card.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: Colors.TEXT_PRIMARY,
          wordWrap: true,
          wordWrapWidth: this.options.cardWidth - 8
        }
      });
      nameText.x = 4;
      nameText.y = 4;
      container.addChild(nameText);

      const costText = new Text({
        text: `${card.energy_cost}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: Colors.ENERGY_TEXT,
          fontWeight: 'bold'
        }
      });
      costText.anchor.set(1, 0);
      costText.x = this.options.cardWidth - 4;
      costText.y = 4;
      container.addChild(costText);
    }

    // Store card reference
    (container as any).card = card;
    
    return container;
  }

  private getCardColor(cardType: string): number {
    switch (cardType) {
      case 'attack': return 0xff6b6b;
      case 'skill': return 0x4ecdc4;
      case 'power': return 0xffe66d;
      default: return 0xf8f9fa;
    }
  }

  private makeCardInteractive(cardContainer: Container, card: Card): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'grab';
    
    cardContainer.on('pointerdown', (event: FederatedPointerEvent) => {
      this.events.onCardDragStart?.(card, cardContainer);
    });
    
    cardContainer.on('pointerover', () => {
      cardContainer.scale.set(1.05);
      this.events.onCardHover?.(card, cardContainer);
    });
    
    cardContainer.on('pointerout', () => {
      cardContainer.scale.set(1.0);
      this.events.onCardOut?.(card, cardContainer);
    });
  }

  public getCards(): Card[] {
    return [...this.cards];
  }

  public getCardCount(): number {
    return this.cards.length;
  }
}