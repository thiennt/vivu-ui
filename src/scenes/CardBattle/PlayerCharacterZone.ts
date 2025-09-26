import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";
import { CardBattlePlayerState } from "@/types";
import { BaseScene } from "@/utils/BaseScene";

export class PlayerCharacterZone extends Container {
  private zoneBg: Graphics;

  private playerInfoZone: Container;
  private playerInfoBg: Graphics;
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

    this.playerInfoBg = new Graphics();
    this.playerInfoZone.addChild(this.playerInfoBg);

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
    const infoWidth = width * 0.18;
    this.playerInfoZone.x = 0;
    this.playerInfoZone.y = 0;

    const infoBgBorder = this.playerNo === 1 ? '#E67A1C' : '#4A90E2';
    this.playerInfoBg.clear();
    this.playerInfoBg.roundRect(0, 0, infoWidth, height, 10)
      .fill('#ececece3')
      .stroke({ width: 2, color: infoBgBorder });

    this.playerInfoLabel.text = this.playerNo === 1 ? 'P1' : 'P2';
    this.playerInfoLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 18,
      fill: infoBgBorder,
      align: 'left'
    };
    this.playerInfoLabel.x = infoWidth * 0.4;
    this.playerInfoLabel.y = height * 0.15;

    this.energyText.text = `⚡x ${this.energyCount}`;
    this.energyText.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fill: infoBgBorder,
      align: 'left'
    };
    this.energyText.x = 5;
    this.energyText.y = height * 0.45;

    this.deckText.text = `🃏x ${this.deckCount}`;
    this.deckText.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fill: infoBgBorder,
      align: 'left'
    };
    this.deckText.x = 5;
    this.deckText.y = height * 0.7;

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
    this.energyText.text = `⚡x ${this.energyCount}`;
    this.deckText.text = `🃏x ${this.deckCount}`;
    
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
    let cardWidth = Math.floor(width / characters.length);
    let cardHeight = cardWidth * 1.3; // Assume 1:1.3 aspect ratio
    
    const startX = spacing;
    
    characters.forEach((character, index) => {
      const x = startX + (index * (cardWidth + spacing));
      const y = Math.max(5, (height - cardHeight) / 2); // Center vertically
      
      const characterCard = this.createCharacterCard(character, x, y, cardWidth, cardHeight);
      
      // Store character ID for drag/drop targeting
      (characterCard as Container & { characterId: string }).characterId = character.id;
      
      this.charactersZone.addChild(characterCard);
      this.characterCards.push(characterCard);
    });
  }

  private createCharacterCard(character: any, x: number, y: number, width: number, height: number): Container {
    const scene = this.parent as BaseScene;
    const card = scene.createCharacterCard(character, x, y, width, height);
    card.width = width;
    card.height = height;
    return card;
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