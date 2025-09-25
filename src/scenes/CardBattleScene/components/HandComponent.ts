import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { Card, CardInDeck } from '@/types';
import { BaseScene } from '@/utils/BaseScene';
import { CardRenderer } from '../utils/cardRendering';
import { LayoutCalculator } from '../utils/layout';
import { DragDropManager } from '../utils/dragDrop';

export interface HandComponentConfig {
  gameWidth: number;
  gameHeight: number;
  position: { y: number };
  dimensions: { height: number };
  cardDimensions: {
    width: number;
    height: number;
  };
  isOpponent?: boolean;
}

/**
 * Component for managing hand area UI and interactions
 */
export class HandComponent {
  private container: Container;
  private baseScene: BaseScene;
  private cardRenderer: CardRenderer;
  private dragDropManager?: DragDropManager;
  private config: HandComponentConfig;
  private handCards: Container[] = [];

  constructor(
    baseScene: BaseScene,
    config: HandComponentConfig,
    dragDropManager?: DragDropManager
  ) {
    this.baseScene = baseScene;
    this.config = config;
    this.dragDropManager = dragDropManager;
    this.cardRenderer = new CardRenderer(config.gameWidth, config.gameHeight);
    this.container = new Container();
    
    this.setupHandArea();
  }

  /**
   * Get the container for this component
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Setup the hand area background
   */
  private setupHandArea(): void {
    this.cardRenderer.createHandAreaUI(
      this.container,
      this.config.position,
      this.config.dimensions
    );

    if (this.config.isOpponent) {
      this.setupOpponentHandDisplay();
    }
  }

  /**
   * Setup opponent hand display (card count only)
   */
  private setupOpponentHandDisplay(): void {
    const handLabel = new Text({
      text: 'Opponent Hand: 0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    handLabel.anchor.set(0.5);
    handLabel.x = this.config.gameWidth / 2;
    handLabel.y = this.config.dimensions.height / 2;
    
    this.container.addChild(handLabel);
  }

  /**
   * Update hand cards display
   */
  updateHandCards(handCards: CardInDeck[]): void {
    // Clear existing hand cards
    this.handCards.forEach(card => card.destroy());
    this.handCards = [];

    if (this.config.isOpponent) {
      this.updateOpponentHandCount(handCards.length);
      return;
    }

    // Show actual cards for player
    const layout = LayoutCalculator.calculateHandLayout(
      handCards,
      this.config.gameWidth,
      this.config.cardDimensions.width,
      this.config.cardDimensions.height,
      6,
      10
    );

    layout.visibleCards.forEach((cardInDeck: CardInDeck, index) => {
      if (cardInDeck.card) {
        const position = layout.cardPositions[index];
        const handCard = this.cardRenderer.createHandCard(
          cardInDeck.card,
          position.x,
          position.y,
          this.config.cardDimensions.width,
          (card, width, height, options) => this.baseScene.createDeckCard(card, width, height, options)
        );
        
        // Make draggable if drag manager is provided
        if (this.dragDropManager) {
          this.dragDropManager.makeCardDraggable(handCard, cardInDeck.card);
          this.addHoverEffects(handCard);
        }
        
        this.container.addChild(handCard);
        this.handCards.push(handCard);
      }
    });
  }

  /**
   * Update opponent hand card count display
   */
  private updateOpponentHandCount(count: number): void {
    const handCountText = this.findTextInContainer((text) => 
      text.text.includes('Hand:') || !!text.text.match(/^\d+$/)
    );
    
    if (handCountText) {
      handCountText.text = `Opponent Hand: ${count}`;
    }
  }

  /**
   * Add hover effects to hand cards
   */
  private addHoverEffects(cardContainer: Container): void {
    cardContainer.on('pointerover', () => {
      cardContainer.scale.set(1.05);
    });
    
    cardContainer.on('pointerout', () => {
      cardContainer.scale.set(1.0);
    });
  }

  /**
   * Find text in container with predicate
   */
  private findTextInContainer(predicate: (text: Text) => boolean): Text | null {
    for (const child of this.container.children) {
      if (child instanceof Text && predicate(child)) {
        return child;
      } else if (child instanceof Container) {
        const found = this.findTextInChild(child, predicate);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Helper method to find text in child containers
   */
  private findTextInChild(container: Container, predicate: (text: Text) => boolean): Text | null {
    for (const child of container.children) {
      if (child instanceof Text && predicate(child)) {
        return child;
      } else if (child instanceof Container) {
        const found = this.findTextInChild(child, predicate);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Get hand cards containers
   */
  getHandCards(): Container[] {
    return this.handCards;
  }

  /**
   * Remove a card from hand
   */
  removeCard(card: Card): void {
    const cardIndex = this.handCards.findIndex(container => {
      return (container as any).card?.id === card.id;
    });
    
    if (cardIndex !== -1) {
      this.handCards[cardIndex].destroy();
      this.handCards.splice(cardIndex, 1);
    }
  }

  /**
   * Add a card back to hand
   */
  addCardToHand(cardContainer: Container): void {
    // Remove from current parent
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    
    // Add back to hand container
    this.container.addChild(cardContainer);
    
    // Find the card in the handCards array and restore position
    const cardIndex = this.handCards.indexOf(cardContainer);
    if (cardIndex === -1) {
      // Add to hand cards array if not found
      this.handCards.push(cardContainer);
    }
  }

  /**
   * Resize handler
   */
  resize(width: number, height: number): void {
    this.config.gameWidth = width;
    this.config.gameHeight = height;
    this.cardRenderer.updateDimensions(width, height);
    
    // Clear and recreate hand area
    this.container.removeChildren();
    this.handCards = [];
    this.setupHandArea();
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.handCards.forEach(card => card.destroy());
    this.handCards = [];
    this.container.destroy();
  }
}