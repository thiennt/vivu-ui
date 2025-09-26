import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";
import { CardBattlePlayerState } from "@/types";
import { BaseScene } from "@/utils/BaseScene";


export class PlayerCharacterZone extends Container {
  private zoneBg: Graphics;

  private playerInfoZone: Container;
  private playerInfoLabel: Text;
  private energyText: Text;
  private energyCount: number = 0;
  private deckText: Text;
  private deckCount: number = 0;

  private charactersZone: Container;
  private characterCards: Container[] = [];
  
  private playerNo: number = 1;
  private playerState: CardBattlePlayerState | null = null;

  constructor(params?: { playerNo: number }) {
    super();

    this.playerNo = params?.playerNo ?? 1;
    
    this.zoneBg = new Graphics();
    this.addChild(this.zoneBg);

    this.playerInfoZone = new Container();
    this.addChild(this.playerInfoZone);

    this.playerInfoLabel = new Text();
    this.playerInfoZone.addChild(this.playerInfoLabel);

    this.energyText = new Text();
    this.playerInfoZone.addChild(this.energyText);

    this.deckText = new Text();
    this.playerInfoZone.addChild(this.deckText);

    this.charactersZone = new Container();
    this.addChild(this.charactersZone);
  }

  resize(width: number, height: number): void {
    this.zoneBg.clear();
    this.zoneBg.roundRect(0, 0, width, height, 10)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // Layout player info zone at the left
    const infoWidth = width * 0.3;
    this.playerInfoZone.x = 0;
    this.playerInfoZone.y = 0;

    this.playerInfoLabel.text = this.playerNo === 1 ? 'P1' : 'P2';
    this.playerInfoLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fill: Colors.TEXT_PRIMARY,
      align: 'left'
    };
    this.playerInfoLabel.x = 10;
    this.playerInfoLabel.y = 10;

    this.energyText.text = `Energy: ${this.energyCount}`;
    this.energyText.style = {
      fontFamily: 'Kalam',
      fontSize: 12,
      fill: Colors.TEXT_PRIMARY,
      align: 'left'
    };
    this.energyText.x = 10;
    this.energyText.y = 30;

    this.deckText.text = `Deck: ${this.deckCount}`;
    this.deckText.style = {
      fontFamily: 'Kalam',
      fontSize: 12,
      fill: Colors.TEXT_PRIMARY,
      align: 'left'
    };
    this.deckText.x = 10;
    this.deckText.y = 50;

    // Layout characters zone to the right of player info
    const charactersWidth = width - infoWidth;
    this.charactersZone.x = infoWidth;
    this.charactersZone.y = 0;

    this.updateCharactersDisplay(charactersWidth, height);
  }

  updateBattleState(playerState: CardBattlePlayerState): void {
    this.playerState = playerState;
    
    // Update energy and deck counts
    this.energyCount = playerState.deck.current_energy || 0;
    this.deckCount = playerState.deck.deck_cards?.length || 0;
    
    // Update text displays
    this.energyText.text = `Energy: ${this.energyCount}`;
    this.deckText.text = `Deck: ${this.deckCount}`;
    
    // Get current zone bounds for character update
    const bounds = this.zoneBg.getBounds();
    if (bounds.width > 0 && bounds.height > 0) {
      const infoWidth = bounds.width * 0.3;
      const charactersWidth = bounds.width - infoWidth;
      this.updateCharactersDisplay(charactersWidth, bounds.height);
    }
  }

  private updateCharactersDisplay(width: number, height: number): void {
    // Clear existing character cards
    this.characterCards.forEach(card => card.destroy());
    this.characterCards = [];
    
    if (!this.playerState || !this.playerState.characters) return;
    
    const characters = this.playerState.characters.slice(0, 3); // Max 3 characters
    if (characters.length === 0) return;
    
    // Calculate optimal card dimensions to fit within the zone
    const spacing = 10;
    const availableWidth = width - (spacing * Math.max(0, characters.length - 1)) - 10; // 10px total margins
    let cardWidth = Math.floor(availableWidth / characters.length);
    
    // Ensure cards maintain reasonable aspect ratio and fit in height
    const maxCardWidth = Math.min(100, cardWidth); // Cap at 100px like backup scene
    const aspectRatio = 1.4; // Character cards are taller than wide
    cardWidth = Math.min(maxCardWidth, cardWidth);
    
    let cardHeight = cardWidth * aspectRatio;
    const maxCardHeight = height - 10; // Leave margin
    
    // If calculated height is too big, scale down proportionally
    if (cardHeight > maxCardHeight) {
      cardHeight = maxCardHeight;
      cardWidth = cardHeight / aspectRatio;
    }
    
    const totalWidth = (cardWidth * characters.length) + (spacing * Math.max(0, characters.length - 1));
    const startX = Math.max(5, (width - totalWidth) / 2);
    
    characters.forEach((character, index) => {
      const x = startX + (index * (cardWidth + spacing));
      const y = Math.max(5, (height - cardHeight) / 2); // Center vertically
      
      const characterCard = this.createCharacterCard(character, cardWidth, cardHeight);
      characterCard.x = x;
      characterCard.y = y;
      
      // Store character ID for drag/drop targeting
      (characterCard as Container & { characterId: string }).characterId = character.id;
      
      this.charactersZone.addChild(characterCard);
      this.characterCards.push(characterCard);
    });
  }

  private createCharacterCard(character: any, width: number, height: number): Container {
    const scene = this.parent as BaseScene;
    return scene.createHeroCard(character, width, height);
  }

  // Method to check if coordinates are within a character card bounds
  getCharacterDropTarget(globalX: number, globalY: number): string | null {
    for (const characterCard of this.characterCards) {
      const bounds = characterCard.getBounds();
      if (globalX >= bounds.x && globalX <= bounds.x + bounds.width &&
          globalY >= bounds.y && globalY <= bounds.y + bounds.height) {
        return `character:${(characterCard as Container & { characterId: string }).characterId}`;
      }
    }
    return null;
  }
}