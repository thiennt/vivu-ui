import { Container, FederatedPointerEvent } from 'pixi.js';
import { app } from '@/app';
import { Card } from '@/types';

export interface DragDropTarget {
  id: string;
  type: 'character' | 'discard';
  bounds: { x: number; y: number; width: number; height: number };
}

/**
 * Drag and drop utility for card interactions
 */
export class DragDropManager {
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  private onDragEnd: (card: Card, dropTarget: string | null) => void;

  constructor(onDragEnd: (card: Card, dropTarget: string | null) => void) {
    this.onDragEnd = onDragEnd;
  }

  /**
   * Make a card draggable
   */
  makeCardDraggable(cardContainer: Container, card: Card): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'grab';
    
    // Store card reference for later use
    (cardContainer as any).card = card;
    
    cardContainer.on('pointerdown', (event: FederatedPointerEvent) => {
      this.onCardDragStart(event, cardContainer, card);
    });
  }

  /**
   * Handle card drag start
   */
  private onCardDragStart(event: FederatedPointerEvent, cardContainer: Container, card: Card): void {
    this.dragTarget = cardContainer;
    cardContainer.alpha = 0.7;
    cardContainer.cursor = 'grabbing';
    
    // Calculate drag offset to keep pointer at the same relative position
    const localPos = cardContainer.parent?.toLocal(event.global);
    if (localPos) {
      this.dragOffset.x = localPos.x - cardContainer.x;
      this.dragOffset.y = localPos.y - cardContainer.y;
    }
    
    // Move card to stage for proper layering
    const globalPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    app.stage.addChild(cardContainer);
    if (globalPos) {
      cardContainer.position.set(globalPos.x, globalPos.y);
    }
    
    // Attach pointermove to stage
    app.stage.on('pointermove', this.onCardDragMove, this);
    
    event.stopPropagation();
  }

  /**
   * Handle card drag move
   */
  private onCardDragMove(event: FederatedPointerEvent): void {
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
  }

  /**
   * Check for drop targets at global position
   */
  getDropTarget(globalX: number, globalY: number, targets: DragDropTarget[]): string | null {
    for (const target of targets) {
      const { x, y, width, height } = target.bounds;
      if (globalX >= x && globalX <= x + width &&
          globalY >= y && globalY <= y + height) {
        return target.type === 'character' ? `character:${target.id}` : target.type;
      }
    }
    return null;
  }

  /**
   * Setup stage-level drag end handlers
   */
  setupDragEndHandlers(): void {
    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onCardDragEnd, this);
    app.stage.on('pointerupoutside', this.onCardDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  /**
   * Handle card drag end
   */
  private onCardDragEnd(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return;
    
    const card = (this.dragTarget as any).card;
    
    // Remove drag events from stage
    app.stage.off('pointermove', this.onCardDragMove, this);
    
    // Reset card appearance
    this.dragTarget.alpha = 1.0;
    this.dragTarget.cursor = 'grab';
    
    // Notify about drop
    this.onDragEnd(card, null); // The actual drop target detection is handled by the parent
    
    this.dragTarget = null;
  }

  /**
   * Get the current drag target
   */
  getDragTarget(): Container | null {
    return this.dragTarget;
  }

  /**
   * Clean up drag handlers
   */
  destroy(): void {
    app.stage.off('pointerup', this.onCardDragEnd, this);
    app.stage.off('pointerupoutside', this.onCardDragEnd, this);
    app.stage.off('pointermove', this.onCardDragMove, this);
  }
}