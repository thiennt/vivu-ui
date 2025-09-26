import { Colors } from "@/utils/colors";
import { Container, Graphics, FederatedPointerEvent } from "pixi.js";
import { CardBattlePlayerState, Card } from "@/types";
import { BaseScene } from "@/utils/BaseScene";
import { app } from "@/app";
import { gsap } from "gsap";


export class HandZone extends Container {
  private handBg: Graphics;
  private handCards: Container[] = [];
  private playerState: CardBattlePlayerState | null = null;
  
  // Drag/drop state
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  private onCardDropCallback?: (card: Card, dropTarget: string) => void;

  constructor() {
    super();
    
    this.handBg = new Graphics();
    this.addChild(this.handBg);
  }

  resize(width: number, height: number): void {
    this.handBg.clear();
    this.handBg.roundRect(0, 0, width, height, 10)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // Redraw hand cards if we have player state
    if (this.playerState) {
      this.updateHandDisplay(width, height);
    }
  }

  updateBattleState(playerState: CardBattlePlayerState): void {
    this.playerState = playerState;
    
    // Get the current size from the background
    const bounds = this.handBg.getBounds();
    if (bounds.width > 0 && bounds.height > 0) {
      this.updateHandDisplay(bounds.width, bounds.height);
    }
  }

  private updateHandDisplay(width: number, height: number): void {
    if (!this.playerState) return;
    
    // Clear existing hand cards
    this.handCards.forEach(card => card.destroy());
    this.handCards = [];
    
    const handCards = this.playerState.deck.hand_cards || [];
    if (handCards.length === 0) return;
    
    // Calculate card layout
    const cardWidth = 45;
    const cardHeight = 60;
    const spacing = 5;
    const totalWidth = (cardWidth * handCards.length) + (spacing * Math.max(0, handCards.length - 1));
    const startX = Math.max(10, (width - totalWidth) / 2);
    const cardY = (height - cardHeight) / 2;
    
    handCards.forEach((cardInDeck, index) => {
      if (cardInDeck.card) {
        const x = startX + (index * (cardWidth + spacing));
        const handCard = this.createHandCard(cardInDeck.card, cardWidth, cardHeight);
        handCard.x = x;
        handCard.y = cardY;
        this.addChild(handCard);
        this.handCards.push(handCard);
      }
    });
  }

  setCardDropCallback(callback: (card: Card, dropTarget: string) => void): void {
    this.onCardDropCallback = callback;
  }

  private createHandCard(card: Card, width: number, height: number): Container {
    const scene = this.parent as BaseScene;
    const cardContainer = scene.createDeckCard(card, width, height, {
      fontScale: 0.7,
      showDescription: false,
      enableHover: true
    });
    
    // Store card reference for drag/drop
    (cardContainer as Container & { card: Card }).card = card;
    
    // Make draggable
    this.makeHandCardDraggable(cardContainer, card);
    
    return cardContainer;
  }

  private makeHandCardDraggable(cardContainer: Container, _card: Card): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'grab';
    
    cardContainer.on('pointerdown', (event: FederatedPointerEvent) => {
      this.onCardDragStart(event, cardContainer, _card);
    });
    
    cardContainer.on('pointerover', () => {
      if (!this.dragTarget) {
        cardContainer.scale.set(1.05);
      }
    });
    
    cardContainer.on('pointerout', () => {
      if (!this.dragTarget) {
        cardContainer.scale.set(1.0);
      }
    });
  }

  private onCardDragStart(event: FederatedPointerEvent, cardContainer: Container, card: Card): void {
    this.dragTarget = cardContainer;
    cardContainer.alpha = 0.8;
    cardContainer.cursor = 'grabbing';
    
    // Calculate and store drag offset
    const globalCardPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    this.dragOffset = {
      x: event.global.x - (globalCardPos?.x || 0),
      y: event.global.y - (globalCardPos?.y || 0)
    };
    
    // Move card to top layer (app.stage) for dragging above all
    const globalPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    app.stage.addChild(cardContainer);
    if (globalPos) {
      cardContainer.position.set(globalPos.x, globalPos.y);
    }
    
    // Attach pointer events to stage
    app.stage.on('pointermove', this.onCardDragMove, this);
    app.stage.on('pointerup', this.onCardDragEnd, this);
    app.stage.on('pointerupoutside', this.onCardDragEnd, this);
    
    event.stopPropagation();
  }

  private onCardDragMove = (event: FederatedPointerEvent): void => {
    if (!this.dragTarget) return;
    
    // Use dragOffset to keep the pointer at the same relative position on the card
    const parent = this.dragTarget.parent;
    if (parent) {
      const newPos = parent.toLocal({
        x: event.global.x - this.dragOffset.x,
        y: event.global.y - this.dragOffset.y
      });
      this.dragTarget.position.set(newPos.x, newPos.y);
    }
  };

  private onCardDragEnd = (event: FederatedPointerEvent): void => {
    if (!this.dragTarget) return;
    
    const card = (this.dragTarget as Container & { card: Card }).card;
    
    // Use the externally set getDropTarget method if available - cast to any to bypass private method restriction
    const getDropTargetMethod = (this as any).getDropTarget;
    const dropTarget = getDropTargetMethod ? getDropTargetMethod(event.global.x, event.global.y) : null;
    
    // Remove drag events from stage
    app.stage.off('pointermove', this.onCardDragMove, this);
    app.stage.off('pointerup', this.onCardDragEnd, this);
    app.stage.off('pointerupoutside', this.onCardDragEnd, this);
    
    if (dropTarget && this.onCardDropCallback) {
      this.onCardDropCallback(card, dropTarget);
    } else {
      // Return card to hand
      this.returnCardToHand(this.dragTarget);
    }
    
    this.dragTarget.alpha = 1.0;
    this.dragTarget.cursor = 'grab';
    this.dragTarget = null;
  };

  private getDropTarget(_globalX: number, _globalY: number): string | null {
    // This method needs to check global zones - will be called from CardBattleScene
    // For now, return null - the actual drop detection will be handled by CardBattleScene
    return null;
  }

  private returnCardToHand(cardContainer: Container): void {
    // Remove from current parent (stage)
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    
    // Add back to hand container
    this.addChild(cardContainer);
    
    // Find the card in the handCards array and restore position
    const cardIndex = this.handCards.indexOf(cardContainer);
    if (cardIndex !== -1) {
      // Animate back to original position
      gsap.to(cardContainer, {
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          // Refresh hand display to ensure proper positioning
          this.refreshHandDisplay();
        }
      });
    } else {
      // Fallback: add to hand cards array and update
      this.handCards.push(cardContainer);
      this.refreshHandDisplay();
    }
  }

  private refreshHandDisplay(): void {
    const bounds = this.handBg.getBounds();
    if (bounds.width > 0 && bounds.height > 0 && this.playerState) {
      this.updateHandDisplay(bounds.width, bounds.height);
    }
  }

  animateCardDraw(): Promise<void> {
    // Animate cards being drawn from deck
    this.handCards.forEach((card, index) => {
      card.alpha = 0;
      card.scale.set(0);
      
      gsap.to(card, {
        alpha: 1,
        scale: 1,
        duration: 0.4,
        delay: index * 0.1,
        ease: 'back.out(1.7)'
      });
    });
    
    // Return promise that resolves when animation completes
    return new Promise(resolve => {
      const longestDelay = (this.handCards.length - 1) * 0.1 + 0.4;
      setTimeout(resolve, longestDelay * 1000);
    });
  }
}
