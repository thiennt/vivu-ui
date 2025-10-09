import { Colors } from "@/utils/colors";
import { Container, Graphics, FederatedPointerEvent, Text } from "pixi.js";
import { CardBattlePlayerState, Card } from "@/types";
import { BaseScene } from "@/ui/BaseScene";
import { app } from "@/app";
import { gsap } from "gsap";
import { CardDetailPopup, cardToBattleCard } from "@/popups/CardDetailPopup";


export class HandZone extends Container {
  private handBg: Container;
  private handCards: Container[] = [];
  private playerState: CardBattlePlayerState | null = null;
  private playerNo: number = 1; // Default to player 1
  
  // Store dimensions for consistent calculations
  private zoneWidth: number = 0;
  private zoneHeight: number = 0;
  
  // Button state (End Turn for P1, Back for P2)
  private buttonContainer: Container;
  private endTurnCallback?: () => void;
  private backButtonCallback?: () => void;

  // Drag/drop state
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  private onCardDropCallback?: (card: Card, dropTarget: string, cardPosition?: number) => void;
  private onDragEnterDiscardCallback?: () => void;
  private onDragLeaveDiscardCallback?: () => void;
  private onCharacterHoverCallback?: (globalX: number, globalY: number, isDragging: boolean) => void;
  private currentDropTarget: string | null = null;

  // Tooltip state
  private cardTooltip: CardDetailPopup | null = null;

  // Interactable state
  private isInteractable: boolean = true;

  constructor(params?: { playerNo?: number }) {
    super();

    this.playerNo = params?.playerNo || 1;

    this.handBg = new Container();
    this.addChild(this.handBg);

    this.buttonContainer = new Container();
    this.addChild(this.buttonContainer);

    // Setup stage event handlers for drag and drop
    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onCardDragEnd, this);
    app.stage.on('pointerupoutside', this.onCardDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  resize(width: number, height: number): void {
    // Store dimensions
    this.zoneWidth = width;
    this.zoneHeight = height;
    
    this.handBg.removeChildren();

    const BUTTON_HEIGHT = 46;
    const BUTTON_PADDING = this.parent ? (this.parent as BaseScene).STANDARD_PADDING : 8;
    
    // Calculate hand background area (excludes button space)
    // P1: Button at bottom, so handBg is at top
    // P2: Button at top, so handBg is at bottom
    const buttonTotalSpace = BUTTON_HEIGHT + BUTTON_PADDING * 2; // Button + padding above and below
    const handBgHeight = height - buttonTotalSpace;
    
    // Position hand background based on player number
    // Player 1: handBg at TOP (0 to handBgHeight), button at bottom
    // Player 2: handBg at BOTTOM (buttonTotalSpace to height), button at top
    const handBgY = this.playerNo === 2 ? buttonTotalSpace : 0;

    const handBgGraphics = new Graphics();
    //this.handBg.addChild(handBgGraphics);
    
    // Draw background at calculated position
    handBgGraphics.roundRect(0, handBgY, width, handBgHeight, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 1, color: Colors.UI_BORDER, alpha: 0.6 });
    
    this.updateButton(width, height);

    // Redraw hand cards if we have player state
    if (this.playerState) {
      this.updateHandDisplay();
    }
  }

  updateBattleState(playerState: CardBattlePlayerState): void {
    this.playerState = playerState;

    // Update display if zone has been sized
    if (this.zoneWidth > 0 && this.zoneHeight > 0) {
      this.updateHandDisplay();
    }
  }

  private updateHandDisplay(): void {
    if (!this.playerState) return;

    // Clear existing
    this.handCards.forEach(card => card.destroy());
    this.handCards = [];
    this.hideCardTooltip();

    const handCards = this.playerState.deck.hand_cards || [];
    if (handCards.length === 0) return;

    // Keep card size fixed as requested
    const cardWidth = 60;
    const cardHeight = 90;
    const availableWidth = this.zoneWidth - 20; // Padding on both sides
    
    // Calculate spacing - start with preferred spacing
    let cardSpacing = 5;
    let totalWidth = (cardWidth * handCards.length) + (cardSpacing * Math.max(0, handCards.length - 1));
    
    // If cards don't fit with normal spacing, reduce spacing until they overlap to fit
    if (totalWidth > availableWidth && handCards.length > 1) {
      // Calculate required spacing (can be negative for overlap)
      cardSpacing = (availableWidth - (cardWidth * handCards.length)) / Math.max(1, handCards.length - 1);
      // Ensure minimum 10px visible per card for readability
      cardSpacing = Math.max(cardSpacing, -cardWidth + 10);
      totalWidth = (cardWidth * handCards.length) + (cardSpacing * Math.max(0, handCards.length - 1));
    }
    
    const startX = Math.max(10, (this.zoneWidth - totalWidth) / 2);
    
    // Calculate Y position to center cards in the handBg area (NOT the full zone)
    const BUTTON_HEIGHT = 46;
    const BUTTON_PADDING = (this.parent as BaseScene).STANDARD_PADDING;
    const buttonTotalSpace = BUTTON_HEIGHT + BUTTON_PADDING * 2;
    const handBgHeight = this.zoneHeight - buttonTotalSpace;
    const handBgY = this.playerNo === 2 ? buttonTotalSpace : 0;
    
    // Center cards vertically within the handBg area
    const cardY = handBgY + (handBgHeight - cardHeight) / 2;

    handCards.forEach((cardInDeck, index) => {
      // For Player 2 (AI), show face-down cards instead of actual card details
      const x = startX + (index * (cardWidth + cardSpacing));
      const handCard = this.playerNo === 2 
        ? this.createFaceDownHandCard(cardWidth, cardHeight)
        : this.createHandCard(cardInDeck.card!, cardWidth, cardHeight);
      
      // Position cards - they are positioned from top-left corner
      handCard.x = x;
      handCard.y = cardY;
      
      (handCard as Container & { card: Card, cardPosition?: number }).cardPosition = cardInDeck.position;
      this.handBg.addChild(handCard);
      this.handCards.push(handCard);
    });
  }

  private updateButton(width: number, height: number): void {
    // Remove existing button if any
    this.buttonContainer.removeChildren();

    const scene = this.parent as BaseScene;
    // Responsive button sizing
    const buttonWidth = Math.min(180, width - 2 * scene.STANDARD_PADDING);
    const buttonHeight = 46;

    if (this.playerNo === 1) {
      // END TURN button for Player 1 - at BOTTOM INSIDE the zone
      const buttonY = height - buttonHeight - scene.STANDARD_PADDING;
      
      const endTurnButton = scene.createButton(
        'END TURN',
        (width - buttonWidth) / 2,
        buttonY,
        buttonWidth,
        buttonHeight,
        () => {
          if (this.isInteractable && this.endTurnCallback) {
            this.endTurnCallback();
          }
        },
        14
      );
      
      // Set button interactivity based on isInteractable state
      endTurnButton.interactive = this.isInteractable;
      endTurnButton.alpha = this.isInteractable ? 1.0 : 0.5;
      endTurnButton.cursor = this.isInteractable ? 'pointer' : 'default';
      
      this.buttonContainer.addChild(endTurnButton);
    } else {
      // BACK button for Player 2 - at TOP INSIDE the zone
      const buttonY = scene.STANDARD_PADDING;
      
      const backButton = scene.createButton(
        '← BACK',
        scene.STANDARD_PADDING,
        buttonY,
        100, // Smaller width for back button
        buttonHeight,
        () => {
          if (this.backButtonCallback) {
            this.backButtonCallback();
          }
        },
        12 // Smaller font size
      );
      
      this.buttonContainer.addChild(backButton);
    }
  }

  setCardDropCallback(callback: (card: Card, dropTarget: string, cardPosition?: number) => void): void {
    this.onCardDropCallback = callback;
  }

  setDiscardHighlightCallbacks(
    onDragEnter: () => void,
    onDragLeave: () => void
  ): void {
    this.onDragEnterDiscardCallback = onDragEnter;
    this.onDragLeaveDiscardCallback = onDragLeave;
  }

  setCharacterHoverCallback(callback: (globalX: number, globalY: number, isDragging: boolean) => void): void {
    this.onCharacterHoverCallback = callback;
  }

  setEndTurnCallback(callback: () => void): void {
    this.endTurnCallback = callback;
  }

  setBackButtonCallback(callback: () => void): void {
    this.backButtonCallback = callback;
  }

  private createHandCard(card: Card, width: number, height: number): Container {
    const scene = this.parent as BaseScene;
    const cardContainer = scene.createDeckCard(card, width, height, {
      fontScale: 0.8,
      showDescription: false,
      enableHover: true
    });

    // Store card reference for drag/drop
    (cardContainer as Container & { card: Card }).card = card;

    // Make draggable
    this.makeHandCardDraggable(cardContainer, card);

    return cardContainer;
  }

  private createFaceDownHandCard(width: number, height: number): Container {
    const scene = this.parent as BaseScene;
    const cardContainer = scene.createFaceDownCard(width, height);

    // Face-down cards are not interactive for AI player
    cardContainer.interactive = false;

    return cardContainer;
  }

  private makeHandCardDraggable(cardContainer: Container, _card: Card): void {
    cardContainer.interactive = this.isInteractable;
    cardContainer.cursor = this.isInteractable ? 'grab' : 'default';

    cardContainer.on('pointerdown', (event: FederatedPointerEvent) => {
      if (this.isInteractable) {
        this.onCardDragStart(event, cardContainer, _card);
      }
    });

    cardContainer.on('pointerover', () => {
      if (!this.dragTarget && this.isInteractable) {
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

    // Show card tooltip at top of screen
    this.showCardTooltip(card);

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

    // Update character card hover effects
    if (this.onCharacterHoverCallback) {
      this.onCharacterHoverCallback(event.global.x, event.global.y, true);
    }

    // Check for discard zone highlighting
    const getDropTargetMethod = (this as any).getDropTarget;
    const dropTarget = getDropTargetMethod ? getDropTargetMethod(event.global.x, event.global.y) : null;

    if (dropTarget !== this.currentDropTarget) {
      // Left previous drop target
      if (this.currentDropTarget === 'discard' && this.onDragLeaveDiscardCallback) {
        this.onDragLeaveDiscardCallback();
      }

      // Entered new drop target
      if (dropTarget === 'discard' && this.onDragEnterDiscardCallback) {
        this.onDragEnterDiscardCallback();
      }

      this.currentDropTarget = dropTarget;
    }
  };

  private onCardDragEnd = (event: FederatedPointerEvent): void => {
    if (!this.dragTarget) return;

    const card = (this.dragTarget as Container & { card: Card }).card;

    // Find the position of this card in the hand
    const cardPosition = (this.dragTarget as Container & { cardPosition?: number }).cardPosition ?? 0;

    // Hide card tooltip
    this.hideCardTooltip();

    // Reset character hover effects
    if (this.onCharacterHoverCallback) {
      this.onCharacterHoverCallback(0, 0, false);
    }

    // Clear discard highlight
    if (this.currentDropTarget === 'discard' && this.onDragLeaveDiscardCallback) {
      this.onDragLeaveDiscardCallback();
    }
    this.currentDropTarget = null;

    // Use the externally set getDropTarget method if available
    const getDropTargetMethod = (this as any).getDropTarget;
    const dropTarget = getDropTargetMethod ? getDropTargetMethod(event.global.x, event.global.y) : null;

    // Remove drag events from stage
    app.stage.off('pointermove', this.onCardDragMove, this);

    if (dropTarget && this.onCardDropCallback) {
      this.onCardDropCallback(card, dropTarget, cardPosition >= 0 ? cardPosition : undefined);
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
    if (this.zoneWidth > 0 && this.zoneHeight > 0 && this.playerState) {
      this.updateHandDisplay();
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

  private showCardTooltip(card: Card): void {
    // Remove existing tooltip if any
    this.hideCardTooltip();

    // Convert Card to BattleCard for the popup
    const battleCard = cardToBattleCard(card);

    // Create new tooltip in tooltip mode
    this.cardTooltip = new CardDetailPopup({ card: battleCard, tooltipMode: true });

    // Add tooltip to app.stage so it appears above everything
    app.stage.addChild(this.cardTooltip);

    // Position tooltip at top of screen
    this.cardTooltip.positionAtTop(app.screen.width, app.screen.height);
  }

  private hideCardTooltip(): void {
    if (this.cardTooltip) {
      // Remove from app.stage
      if (this.cardTooltip.parent) {
        this.cardTooltip.parent.removeChild(this.cardTooltip);
      }
      this.cardTooltip.destroy();
      this.cardTooltip = null;
    }
  }

  // Method to get the current drag target for animations
  getDragTarget(): Container | null {
    return this.dragTarget;
  }

  // Method to get a random hand card for AI discard animation
  getRandomHandCard(): Container | null {
    if (this.handCards.length === 0) return null;
    
    // Get the last card (or random) for animation
    const cardIndex = this.handCards.length - 1;
    const card = this.handCards[cardIndex];
    
    // Remove from hand cards array
    this.handCards.splice(cardIndex, 1);
    
    // Remove from parent but don't destroy yet (animation will handle it)
    if (card.parent) {
      card.parent.removeChild(card);
    }
    
    // Move to app.stage for animation
    app.stage.addChild(card);
    const globalPos = this.toGlobal({ x: card.x, y: card.y });
    card.position.set(globalPos.x, globalPos.y);
    
    return card;
  }

  // Method to enable/disable interactions
  public setInteractable(interactable: boolean): void {
    this.isInteractable = interactable;
    
    // Update all hand cards
    this.handCards.forEach(cardContainer => {
      cardContainer.interactive = interactable;
      cardContainer.cursor = interactable ? 'grab' : 'default';
    });
    
    // Update button state
    if (this.zoneWidth > 0 && this.zoneHeight > 0) {
      this.updateButton(this.zoneWidth, this.zoneHeight);
    }
  }
}