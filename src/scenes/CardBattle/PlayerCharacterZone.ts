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

  private infoWidth: number = 0;
  private infoHeight: number = 0;
  private charactersWidth: number = 0;
  private charactersHeight: number = 0;

  // Discard zone functionality - playerInfoBg will act as discard drop target
  private discardTooltip: Text | null = null;

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
    this.infoWidth = width * 0.18;
    this.infoHeight = height;

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
    this.playerInfoBg.roundRect(0, 0, this.infoWidth, this.height, 6)
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
    this.playerInfoLabel.x = this.infoWidth / 2;
    this.playerInfoLabel.y = this.infoHeight * 0.2;

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
    this.energyText.x = this.infoWidth / 2;
    this.energyText.y = this.infoHeight * 0.5;

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
    this.deckText.x = this.infoWidth / 2;
    this.deckText.y = this.infoHeight * 0.75;

    // Make playerInfoBg interactive for discard functionality
    this.playerInfoBg.interactive = true;
    this.updateDiscardHighlight(false); // Initialize without highlight

    // Layout characters zone to the right of player info
    this.charactersWidth = width - this.infoWidth;
    this.charactersHeight = height;
    this.charactersZone.x = this.infoWidth;
    this.charactersZone.y = 0;

    this.updateCharactersDisplay();
  }

  updateBattleState(playerState: CardBattlePlayerState): void {
    this.playerState = playerState;
    
    // Update energy and deck counts
    this.energyCount = playerState.deck.current_energy || 0;
    this.deckCount = playerState.deck.remaining_cards || 0;
    
    // Update text displays
    this.energyText.text = `⚡x ${this.energyCount}`;
    this.deckText.text = `🃏x ${this.deckCount}`;


    this.updateCharactersDisplay();
  }

  private updateCharactersDisplay(): void {
    // Clear existing character cards
    this.characterCards.forEach(card => card.destroy());
    this.characterCards = [];
    
    if (!this.playerState || !this.playerState.characters) return;
    
    const characters = this.playerState.characters.slice(0, 3); // Max 3 characters
    if (characters.length === 0) return;
    
    // Calculate optimal card dimensions to fit within the zone
    const spacing = 10;
    const cardWidth = Math.floor(this.charactersWidth / characters.length) - 10;
    const cardHeight = this.charactersHeight * 0.95;
    
    const startX = spacing;
    
    characters.forEach((character, index) => {
      const x = startX + (index * (cardWidth + spacing)) + cardWidth / 2; // Center horizontally
      const y = Math.max(5, (this.charactersHeight - cardHeight) / 2) + cardHeight / 2; // Center vertically
      
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
    card.pivot.x = card.width / 2;
    card.pivot.y = card.height / 2;
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

  // Method to highlight character cards when dragging cards over them
  updateCharacterHover(globalX: number, globalY: number, isDragging: boolean): void {
    if (!isDragging) {
      // Reset all character cards to normal scale
      this.characterCards.forEach(card => {
        card.scale.set(1.0);
      });
      return;
    }

    // Check which character card is being hovered
    for (const characterCard of this.characterCards) {
      const bounds = characterCard.getBounds();
      const isHovering = globalX >= bounds.x && globalX <= bounds.x + bounds.width &&
                        globalY >= bounds.y && globalY <= bounds.y + bounds.height;
      
      if (isHovering) {
        // Zoom in the hovered character card
        characterCard.scale.set(1.15);
      } else {
        // Reset non-hovered cards
        characterCard.scale.set(1.0);
      }
    }
  }

  // Method to check if coordinates are within player info zone bounds (discard functionality)
  isPointInPlayerInfo(globalX: number, globalY: number): boolean {
    // Use fixed dimensions and position for consistent hit detection
    const globalPos = this.toGlobal({ x: 0, y: 0 });
    return globalX >= globalPos.x && globalX <= globalPos.x + this.infoWidth &&
           globalY >= globalPos.y && globalY <= globalPos.y + this.infoHeight;
  }

  // Method to highlight/unhighlight player info zone for discard
  updateDiscardHighlight(highlight: boolean): void {    
    // Use fixed dimensions instead of getBounds to prevent size changes
    const infoWidth = this.infoWidth;
    const height = this.infoHeight;
    
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

  // Method to find character card by ID for animations
  public findCharacterCard(characterId: string): Container | null {
    return this.characterCards.find(card => 
      (card as Container & { characterId: string }).characterId === characterId
    ) || null;
  }

  // Method to get energy text for animations
  public getEnergyText(): Text {
    return this.energyText;
  }
}