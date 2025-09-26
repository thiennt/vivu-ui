import { Colors } from "@/utils/colors";
import { Container, Graphics } from "pixi.js";
import { CardBattlePlayerState, Card } from "@/types";
import { BaseScene } from "@/utils/BaseScene";


export class HandZone extends Container {
  private handBg: Graphics;
  private handCards: Container[] = [];
  private playerState: CardBattlePlayerState | null = null;

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

  private createHandCard(card: Card, width: number, height: number): Container {
    const scene = this.parent as BaseScene;
    return scene.createDeckCard(card, width, height, {
      fontScale: 0.7,
      showDescription: false,
      enableHover: true
    });
  }
}
