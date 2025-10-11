import { Colors } from "@/utils/colors";
import { Container, Graphics, FederatedPointerEvent, Text } from "pixi.js";
import { CardBattlePlayerState, Card } from "@/types";
import { BaseScene } from "@/ui/BaseScene";
import { app } from "@/app";
import { gsap } from "gsap";
import { CardDetailPopup } from "@/popups/CardDetailPopup";


export class HandZone extends Container {
  private handBg: Container;
  private handCards: Container[] = [];
  private playerState: CardBattlePlayerState | null = null;
  private playerNo: number = 1;
  
  private zoneWidth: number = 0;
  private zoneHeight: number = 0;
  
  private buttonContainer: Container;
  private endTurnCallback?: () => void;
  private backButtonCallback?: () => void;

  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  private onCardDropCallback?: (card: Card, dropTarget: string, cardPosition?: number) => void;
  private onDragEnterDiscardCallback?: () => void;
  private onDragLeaveDiscardCallback?: () => void;
  private onCharacterHoverCallback?: (globalX: number, globalY: number, isDragging: boolean) => void;
  private currentDropTarget: string | null = null;

  private cardTooltip: CardDetailPopup | null = null;

  private isInteractable: boolean = true;

  constructor(params?: { playerNo?: number }) {
    super();

    this.playerNo = params?.playerNo || 1;

    this.handBg = new Container();
    this.addChild(this.handBg);

    this.buttonContainer = new Container();
    this.addChild(this.buttonContainer);

    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onCardDragEnd, this);
    app.stage.on('pointerupoutside', this.onCardDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  resize(width: number, height: number): void {
    this.zoneWidth = width;
    this.zoneHeight = height;
    
    this.handBg.removeChildren();

    const BUTTON_HEIGHT = 46;
    const BUTTON_PADDING = this.parent ? (this.parent as BaseScene).STANDARD_PADDING : 8;
    
    const buttonTotalSpace = BUTTON_HEIGHT + BUTTON_PADDING * 2;
    const handBgHeight = height - buttonTotalSpace;
    
    const handBgY = this.playerNo === 2 ? buttonTotalSpace : 0;

    // Fantasy hand zone background
    const handBgGraphics = new Graphics();
    this.handBg.addChild(handBgGraphics);
    
    // Dark wooden background with texture
    handBgGraphics.roundRect(0, handBgY, width, handBgHeight, 8)
      .fill({ color: 0x2a1810, alpha: 0.5 });
    
    // Inner wood grain texture
    handBgGraphics.roundRect(2, handBgY + 2, width - 4, handBgHeight - 4, 6)
      .stroke({ width: 1, color: 0x8b4513, alpha: 0.4 });
    
    // Subtle border
    handBgGraphics.roundRect(0, handBgY, width, handBgHeight, 8)
      .stroke({ width: 2, color: 0x6b4423, alpha: 0.6 });
    
    this.updateButton(width, height);

    if (this.playerState) {
      this.updateHandDisplay();
    }
  }

  updateBattleState(playerState: CardBattlePlayerState): void {
    this.playerState = playerState;

    if (this.zoneWidth > 0 && this.zoneHeight > 0) {
      this.updateHandDisplay();
    }
  }

  private updateHandDisplay(): void {
    if (!this.playerState) return;

    this.handCards.forEach(card => card.destroy());
    this.handCards = [];
    this.hideCardTooltip();

    const handCards = this.playerState.deck.hand_cards || [];
    if (handCards.length === 0) return;

    const cardWidth = 60;
    const cardHeight = 90;
    const availableWidth = this.zoneWidth - 20;
    
    let cardSpacing = 5;
    let totalWidth = (cardWidth * handCards.length) + (cardSpacing * Math.max(0, handCards.length - 1));
    
    if (totalWidth > availableWidth && handCards.length > 1) {
      cardSpacing = (availableWidth - (cardWidth * handCards.length)) / Math.max(1, handCards.length - 1);
      cardSpacing = Math.max(cardSpacing, -cardWidth + 10);
      totalWidth = (cardWidth * handCards.length) + (cardSpacing * Math.max(0, handCards.length - 1));
    }
    
    const startX = Math.max(10, (this.zoneWidth - totalWidth) / 2);
    
    const BUTTON_HEIGHT = 46;
    const BUTTON_PADDING = (this.parent as BaseScene).STANDARD_PADDING;
    const buttonTotalSpace = BUTTON_HEIGHT + BUTTON_PADDING * 2;
    const handBgHeight = this.zoneHeight - buttonTotalSpace;
    const handBgY = this.playerNo === 2 ? buttonTotalSpace : 0;
    
    const cardY = handBgY + (handBgHeight - cardHeight) / 2;

    handCards.forEach((cardInDeck, index) => {
      const x = startX + (index * (cardWidth + cardSpacing));
      const handCard = this.playerNo === 2 
        ? this.createFaceDownHandCard(cardWidth, cardHeight)
        : this.createHandCard(cardInDeck.card!, cardWidth, cardHeight);
      
      handCard.x = x;
      handCard.y = cardY;
      
      (handCard as Container & { card: Card, cardPosition?: number }).cardPosition = cardInDeck.position;
      this.handBg.addChild(handCard);
      this.handCards.push(handCard);
    });
  }

  private updateButton(width: number, height: number): void {
    this.buttonContainer.removeChildren();

    const scene = this.parent as BaseScene;
    const buttonWidth = Math.min(180, width - 2 * scene.STANDARD_PADDING);
    const buttonHeight = 46;

    if (this.playerNo === 1) {
      // END TURN button - fantasy style
      const buttonY = height - buttonHeight - scene.STANDARD_PADDING;
      
      const endTurnButton = this.createFantasyButton(
        '⚔️ END TURN',
        (width - buttonWidth) / 2,
        buttonY,
        buttonWidth,
        buttonHeight,
        () => {
          if (this.isInteractable && this.endTurnCallback) {
            this.endTurnCallback();
          }
        }
      );
      
      endTurnButton.interactive = this.isInteractable;
      endTurnButton.alpha = this.isInteractable ? 1.0 : 0.5;
      endTurnButton.cursor = this.isInteractable ? 'pointer' : 'default';
      
      this.buttonContainer.addChild(endTurnButton);
    } else {
      // BACK button - fantasy style
      const buttonY = scene.STANDARD_PADDING;
      
      const backButton = this.createFantasyButton(
        '← BACK',
        scene.STANDARD_PADDING,
        buttonY,
        100,
        buttonHeight,
        () => {
          if (this.backButtonCallback) {
            this.backButtonCallback();
          }
        }
      );
      
      this.buttonContainer.addChild(backButton);
    }
  }

  private createFantasyButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    
    // Shadow
    bg.roundRect(2, 2, width, height, 8)
      .fill({ color: 0x000000, alpha: 0.5 });
    
    // Main wooden button
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: 0x8b4513, alpha: 0.98 })
      .stroke({ width: 2, color: 0xd4af37 });
    
    // Inner wooden texture
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .fill({ color: 0xa0632a, alpha: 0.3 });
    
    // Golden highlight
    bg.roundRect(3, 3, width - 6, height - 6, 5)
      .stroke({ width: 1, color: 0xffd700, alpha: 0.6 });
    
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: text.includes('END TURN') ? 16 : 14,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x2a1810, width: 2 },
        align: 'center'
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
    
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.5 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: 0xa0632a, alpha: 0.98 })
        .stroke({ width: 2, color: 0xffd700 });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .fill({ color: 0xb87333, alpha: 0.4 });
      bg.roundRect(3, 3, width - 6, height - 6, 5)
        .stroke({ width: 1, color: 0xffd700, alpha: 0.9 });
      button.scale.set(1.03);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.5 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x8b4513, alpha: 0.98 })
        .stroke({ width: 2, color: 0xd4af37 });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .fill({ color: 0xa0632a, alpha: 0.3 });
      bg.roundRect(3, 3, width - 6, height - 6, 5)
        .stroke({ width: 1, color: 0xffd700, alpha: 0.6 });
      button.scale.set(1.0);
    });
    
    return button;
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

    (cardContainer as Container & { card: Card }).card = card;

    this.makeHandCardDraggable(cardContainer, card);

    return cardContainer;
  }

  private createFaceDownHandCard(width: number, height: number): Container {
    const scene = this.parent as BaseScene;
    const cardContainer = scene.createFaceDownCard(width, height);

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

    this.showCardTooltip(card);

    const globalCardPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    this.dragOffset = {
      x: event.global.x - (globalCardPos?.x || 0),
      y: event.global.y - (globalCardPos?.y || 0)
    };

    const globalPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    app.stage.addChild(cardContainer);
    if (globalPos) {
      cardContainer.position.set(globalPos.x, globalPos.y);
    }

    app.stage.on('pointermove', this.onCardDragMove, this);

    event.stopPropagation();
  }

  private onCardDragMove = (event: FederatedPointerEvent): void => {
    if (!this.dragTarget) return;

    const parent = this.dragTarget.parent;
    if (parent) {
      const newPos = parent.toLocal({
        x: event.global.x - this.dragOffset.x,
        y: event.global.y - this.dragOffset.y
      });
      this.dragTarget.position.set(newPos.x, newPos.y);
    }

    if (this.onCharacterHoverCallback) {
      this.onCharacterHoverCallback(event.global.x, event.global.y, true);
    }

    const getDropTargetMethod = (this as any).getDropTarget;
    const dropTarget = getDropTargetMethod ? getDropTargetMethod(event.global.x, event.global.y) : null;

    if (dropTarget !== this.currentDropTarget) {
      if (this.currentDropTarget === 'discard' && this.onDragLeaveDiscardCallback) {
        this.onDragLeaveDiscardCallback();
      }

      if (dropTarget === 'discard' && this.onDragEnterDiscardCallback) {
        this.onDragEnterDiscardCallback();
      }

      this.currentDropTarget = dropTarget;
    }
  };

  private onCardDragEnd = (event: FederatedPointerEvent): void => {
    if (!this.dragTarget) return;

    const card = (this.dragTarget as Container & { card: Card }).card;

    const cardPosition = (this.dragTarget as Container & { cardPosition?: number }).cardPosition ?? 0;

    this.hideCardTooltip();

    if (this.onCharacterHoverCallback) {
      this.onCharacterHoverCallback(0, 0, false);
    }

    if (this.currentDropTarget === 'discard' && this.onDragLeaveDiscardCallback) {
      this.onDragLeaveDiscardCallback();
    }
    this.currentDropTarget = null;

    const getDropTargetMethod = (this as any).getDropTarget;
    const dropTarget = getDropTargetMethod ? getDropTargetMethod(event.global.x, event.global.y) : null;

    app.stage.off('pointermove', this.onCardDragMove, this);

    if (dropTarget && this.onCardDropCallback) {
      this.onCardDropCallback(card, dropTarget, cardPosition >= 0 ? cardPosition : undefined);
    } else {
      this.returnCardToHand(this.dragTarget);
    }

    this.dragTarget.alpha = 1.0;
    this.dragTarget.cursor = 'grab';
    this.dragTarget = null;
  };

  private getDropTarget(_globalX: number, _globalY: number): string | null {
    return null;
  }

  private returnCardToHand(cardContainer: Container): void {
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }

    this.addChild(cardContainer);

    const cardIndex = this.handCards.indexOf(cardContainer);
    if (cardIndex !== -1) {
      gsap.to(cardContainer, {
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          this.refreshHandDisplay();
        }
      });
    } else {
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

    return new Promise(resolve => {
      const longestDelay = (this.handCards.length - 1) * 0.1 + 0.4;
      setTimeout(resolve, longestDelay * 1000);
    });
  }

  private showCardTooltip(card: Card): void {
    this.hideCardTooltip();

    this.cardTooltip = new CardDetailPopup({ card, tooltipMode: true });

    app.stage.addChild(this.cardTooltip);

    this.cardTooltip.positionAtTop(app.screen.width, app.screen.height);
  }

  private hideCardTooltip(): void {
    if (this.cardTooltip) {
      if (this.cardTooltip.parent) {
        this.cardTooltip.parent.removeChild(this.cardTooltip);
      }
      this.cardTooltip.destroy();
      this.cardTooltip = null;
    }
  }

  getDragTarget(): Container | null {
    return this.dragTarget;
  }

  getRandomHandCard(): Container | null {
    if (this.handCards.length === 0) return null;
    
    const cardIndex = this.handCards.length - 1;
    const card = this.handCards[cardIndex];
    
    this.handCards.splice(cardIndex, 1);
    
    if (card.parent) {
      card.parent.removeChild(card);
    }
    
    app.stage.addChild(card);
    const globalPos = this.toGlobal({ x: card.x, y: card.y });
    card.position.set(globalPos.x, globalPos.y);
    
    return card;
  }

  public setInteractable(interactable: boolean): void {
    this.isInteractable = interactable;
    
    this.handCards.forEach(cardContainer => {
      cardContainer.interactive = interactable;
      cardContainer.cursor = interactable ? 'grab' : 'default';
    });
    
    if (this.zoneWidth > 0 && this.zoneHeight > 0) {
      this.updateButton(this.zoneWidth, this.zoneHeight);
    }
  }
}