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

  // Discard zone functionality - playerInfoBg will act as discard drop target
  private isDiscardHighlighted: boolean = false;
  private discardTooltip: Text | null = null;

  // Fixed dimensions to prevent size changes during highlighting
  private fixedInfoWidth: number = 0;
  private fixedHeight: number = 0;

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
    
    // Store fixed dimensions to prevent changes during highlighting
    this.fixedInfoWidth = width * 0.18;
    this.fixedHeight = height;
    
    // Simplified character zone background
    // Main background
    this.zoneBg.roundRect(0, 0, width, height, 8)
      .fill(Colors.UI_BACKGROUND);
    
    // Simple team-colored border
    const accentColor = this.playerNo === 1 ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY;
    this.zoneBg.roundRect(0, 0, width, height, 8)
      .stroke({ width: 2, color: accentColor, alpha: 0.7 });
    
    // Layout player info zone at the left
    this.playerInfoZone.x = 0;
    this.playerInfoZone.y = 0;

    const infoBgBorder = this.playerNo === 1 ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY;
    
    this.playerInfoBg.clear();
    
    // Simplified player info background
    this.playerInfoBg.roundRect(0, 0, this.fixedInfoWidth, this.fixedHeight, 6)
      .fill(Colors.PANEL_BACKGROUND)
      .stroke({ width: 1, color: infoBgBorder, alpha: 0.8 });

    // Simplified player label
    this.playerInfoLabel.text = this.playerNo === 1 ? 'P1' : 'P2';
    this.playerInfoLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: infoBgBorder,
      align: 'center'
    };
    this.playerInfoLabel.anchor.set(0.5);
    this.playerInfoLabel.x = this.fixedInfoWidth / 2;
    this.playerInfoLabel.y = this.fixedHeight * 0.2;

    // Simplified energy display
    this.energyText.text = `⚡${this.energyCount}`;
    this.energyText.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: Colors.ENERGY_TEXT,
      align: 'center'
    };
    this.energyText.anchor.set(0.5);
    this.energyText.x = this.fixedInfoWidth / 2;
    this.energyText.y = this.fixedHeight * 0.5;

    // Simplified deck display
    this.deckText.text = `🃏${this.deckCount}`;
    this.deckText.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY,
      align: 'center'
    };
    this.deckText.anchor.set(0.5);
    this.deckText.x = this.fixedInfoWidth / 2;
    this.deckText.y = this.fixedHeight * 0.75;

    // Make playerInfoBg interactive for discard functionality
    this.playerInfoBg.interactive = true;
    this.updateDiscardHighlight(false); // Initialize without highlight

    // Layout characters zone to the right of player info
    const charactersWidth = width - this.fixedInfoWidth;
    this.charactersZone.x = this.fixedInfoWidth;
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
    const cardWidth = Math.floor(width / characters.length);
    const cardHeight = cardWidth * 1.3; // Assume 1:1.3 aspect ratio
    
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Method to check if coordinates are within player info zone bounds (discard functionality)
  isPointInPlayerInfo(globalX: number, globalY: number): boolean {
    const bounds = this.playerInfoBg.getBounds();
    return globalX >= bounds.x && globalX <= bounds.x + bounds.width &&
           globalY >= bounds.y && globalY <= bounds.y + bounds.height;
  }

  // Method to highlight/unhighlight player info zone for discard
  updateDiscardHighlight(highlight: boolean): void {
    this.isDiscardHighlighted = highlight;
    
    // Use fixed dimensions instead of getBounds to prevent size changes
    const infoWidth = this.fixedInfoWidth;
    const height = this.fixedHeight;
    
    const infoBgBorder = this.playerNo === 1 ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY;
    
    this.playerInfoBg.clear();
    
    if (highlight) {
      // Dashed border when highlighted for discard
      this.playerInfoBg.roundRect(0, 0, infoWidth, height, 6)
        .fill(Colors.PANEL_BACKGROUND)
        .stroke({ width: 3, color: Colors.CARD_DISCARD, alpha: 0.8 });
        
      // Add dashed border effect by drawing small rectangles
      const dashLength = 8;
      const spacing = 4;
      for (let i = 0; i < infoWidth; i += dashLength + spacing) {
        this.playerInfoBg.roundRect(i + 2, 2, Math.min(dashLength, infoWidth - i - 4), 2, 1)
          .fill(Colors.CARD_DISCARD);
      }
      for (let i = 0; i < height; i += dashLength + spacing) {
        this.playerInfoBg.roundRect(2, i + 2, 2, Math.min(dashLength, height - i - 4), 1)
          .fill(Colors.CARD_DISCARD);
        this.playerInfoBg.roundRect(infoWidth - 4, i + 2, 2, Math.min(dashLength, height - i - 4), 1)
          .fill(Colors.CARD_DISCARD);
      }
      for (let i = 0; i < infoWidth; i += dashLength + spacing) {
        this.playerInfoBg.roundRect(i + 2, height - 4, Math.min(dashLength, infoWidth - i - 4), 2, 1)
          .fill(Colors.CARD_DISCARD);
      }

      // Add "Discard here" tooltip
      if (!this.discardTooltip) {
        this.discardTooltip = new Text({
          text: 'Discard here',
          style: {
            fontFamily: 'Kalam',
            fontSize: 12,
            fontWeight: 'bold',
            fill: Colors.TEXT_PRIMARY,
            align: 'center'
          }
        });
        this.discardTooltip.anchor.set(0.5);
        this.playerInfoZone.addChild(this.discardTooltip);
      }
      
      this.discardTooltip.visible = true;
      this.discardTooltip.x = infoWidth / 2;
      this.discardTooltip.y = height - 20;
      
    } else {
      // Normal styling
      this.playerInfoBg.roundRect(0, 0, infoWidth, height, 6)
        .fill(Colors.PANEL_BACKGROUND)
        .stroke({ width: 1, color: infoBgBorder, alpha: 0.8 });
        
      // Hide tooltip
      if (this.discardTooltip) {
        this.discardTooltip.visible = false;
      }
    }
  }
}