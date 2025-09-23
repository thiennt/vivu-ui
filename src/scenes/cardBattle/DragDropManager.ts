import { Container, FederatedPointerEvent } from 'pixi.js';
import { CardInDeck } from '@/types';

/**
 * Manages drag and drop interactions for cards in the CardBattleScene
 */
export class CardBattleDragDropManager {
  private scene: {
    container: Container;
    playCardOnCharacter: (card: CardInDeck, playerId: number, characterIndex: number) => Promise<void>;
    discardCard: (card: CardInDeck) => Promise<void>;
  };
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  private isDragging = false;
  private dropZones: { area: Container, type: 'character' | 'discard', playerId: number, characterIndex?: number }[] = [];

  constructor(scene: {
    container: Container;
    playCardOnCharacter: (card: CardInDeck, playerId: number, characterIndex: number) => Promise<void>;
    discardCard: (card: CardInDeck) => Promise<void>;
  }) {
    this.scene = scene;
  }

  /**
   * Set drop zones for card interactions
   */
  setDropZones(dropZones: { area: Container, type: 'character' | 'discard', playerId: number, characterIndex?: number }[]): void {
    this.dropZones = dropZones;
  }

  /**
   * Make a card container draggable
   */
  makeCardDraggable(cardContainer: Container): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'pointer';

    cardContainer.on('pointerdown', (event: FederatedPointerEvent) => this.onDragStart(event, cardContainer));
    cardContainer.on('rightclick', () => this.showCardDetails(cardContainer));
  }

  private showCardDetails(cardContainer: Container): void {
    const cardData = (cardContainer as Container & { cardData?: CardInDeck }).cardData;
    if (cardData && cardData.card) {
      // Show card details in console for now
      console.log('Card details:', cardData.card.name, cardData.card.description);
    }
  }

  /**
   * Handle drag start
   */
  private onDragStart(event: FederatedPointerEvent, cardContainer: Container): void {
    const cardData = (cardContainer as Container & { cardData?: CardInDeck }).cardData;
    if (!cardData) return;

    this.isDragging = true;
    this.dragTarget = cardContainer;

    // Calculate offset
    const globalPos = event.global;
    const localPos = cardContainer.toLocal(globalPos);
    this.dragOffset.x = localPos.x;
    this.dragOffset.y = localPos.y;

    // Visual feedback
    cardContainer.alpha = 0.7;
    cardContainer.scale.set(1.1);

    // Add global pointer events
    this.scene.container.on('pointermove', this.onDragMove, this);
    this.scene.container.on('pointerup', this.onDragEnd, this);
    this.scene.container.on('pointerupoutside', this.onDragEnd, this);

    console.log('🎯 Started dragging card:', cardData.card.name);
  }

  /**
   * Handle drag movement
   */
  private onDragMove(event: FederatedPointerEvent): void {
    if (!this.isDragging || !this.dragTarget) return;

    const globalPos = event.global;
    const parentPos = this.dragTarget.parent?.toLocal(globalPos);
    if (!parentPos) return;

    this.dragTarget.x = parentPos.x - this.dragOffset.x;
    this.dragTarget.y = parentPos.y - this.dragOffset.y;
  }

  /**
   * Handle drag end
   */
  private async onDragEnd(event: FederatedPointerEvent): Promise<void> {
    if (!this.isDragging || !this.dragTarget) return;

    const globalPos = event.global;
    const dropTarget = this.getDropTarget(globalPos);
    const cardData = (this.dragTarget as Container & { cardData?: CardInDeck }).cardData;

    if (dropTarget && cardData) {
      if (dropTarget.type === 'character') {
        console.log(`🎯 Playing card on character ${dropTarget.characterIndex} of player ${dropTarget.playerId}`);
        await this.scene.playCardOnCharacter(cardData, dropTarget.playerId, dropTarget.characterIndex || 0);
        this.cleanupDrag(true); // Remove card from hand
      } else if (dropTarget.type === 'discard') {
        console.log('🗑️ Discarding card');
        await this.scene.discardCard(cardData);
        this.cleanupDrag(true); // Remove card from hand
      }
    } else {
      console.log('🚫 Invalid drop target, returning card to hand');
      this.cleanupDrag(false); // Return card to original position
    }
  }

  /**
   * Get the drop target at the given global position
   */
  private getDropTarget(globalPos: { x: number, y: number }): { type: 'character' | 'discard', playerId: number, characterIndex?: number } | null {
    for (const zone of this.dropZones) {
      const bounds = zone.area.getBounds();
      if (globalPos.x >= bounds.x && globalPos.x <= bounds.x + bounds.width &&
          globalPos.y >= bounds.y && globalPos.y <= bounds.y + bounds.height) {
        return {
          type: zone.type,
          playerId: zone.playerId,
          characterIndex: zone.characterIndex
        };
      }
    }
    return null;
  }

  /**
   * Clean up drag state
   */
  private cleanupDrag(removeCard: boolean = false): void {
    if (this.dragTarget) {
      // Reset visual state
      this.dragTarget.alpha = 1;
      this.dragTarget.scale.set(1);

      if (!removeCard) {
        // Return to original position if not removing
        // In a real implementation, you'd store the original position
        // For now, we'll let the UI refresh handle repositioning
      }
    }

    // Remove global event listeners
    this.scene.container.off('pointermove', this.onDragMove, this);
    this.scene.container.off('pointerup', this.onDragEnd, this);
    this.scene.container.off('pointerupoutside', this.onDragEnd, this);

    // Reset state
    this.isDragging = false;
    this.dragTarget = null;
    this.dragOffset.x = 0;
    this.dragOffset.y = 0;
  }

  /**
   * Check if currently dragging
   */
  isDraggingCard(): boolean {
    return this.isDragging;
  }

  /**
   * Get the currently dragged card data
   */
  getDraggedCard(): CardInDeck | null {
    if (this.dragTarget) {
      return (this.dragTarget as Container & { cardData?: CardInDeck }).cardData || null;
    }
    return null;
  }

  /**
   * Cancel current drag operation
   */
  cancelDrag(): void {
    if (this.isDragging) {
      this.cleanupDrag(false);
    }
  }

  /**
   * Enable/disable drag and drop
   */
  setEnabled(enabled: boolean): void {
    // This could be used to disable drag during AI turns or animations
    if (!enabled && this.isDragging) {
      this.cancelDrag();
    }
  }
}