import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";
import { CardBattlePlayerState } from "@/types";
import { BaseScene } from "@/utils/BaseScene";
import { VisualEffects } from "@/utils/visualEffects";

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
    
    // Create enhanced battle zone background directly
    this.zoneBg.roundRect(0, 0, width, height, 8)
      .fill(Colors.BATTLEFIELD_PRIMARY);
    
    // Add decorative corner accents
    const accentSize = 16;
    
    // Top-left corner accent
    this.zoneBg.moveTo(0, accentSize)
      .lineTo(0, 8)
      .arc(8, 8, 8, Math.PI, 3 * Math.PI / 2)
      .lineTo(accentSize, 0)
      .fill({ color: Colors.BATTLEFIELD_ACCENT, alpha: 0.3 });
    
    // Top-right corner accent
    this.zoneBg.moveTo(width - accentSize, 0)
      .lineTo(width - 8, 0)
      .arc(width - 8, 8, 8, 3 * Math.PI / 2, 0)
      .lineTo(width, accentSize)
      .fill({ color: Colors.BATTLEFIELD_ACCENT, alpha: 0.3 });
    
    // Border with glow effect
    this.zoneBg.roundRect(0, 0, width, height, 8)
      .stroke({ width: 2, color: Colors.UI_BORDER_GLOW, alpha: 0.8 });
    
    // Layout player info zone at the left
    const infoWidth = width * 0.18;
    this.playerInfoZone.x = 0;
    this.playerInfoZone.y = 0;

    const infoBgBorder = this.playerNo === 1 ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY;
    const infoBgColor = this.playerNo === 1 ? '#4a4a4a' : '#3a3a3a';
    
    this.playerInfoBg.clear();
    
    // Create enhanced player info background directly
    this.playerInfoBg.roundRect(0, 0, infoWidth, height, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 3, color: Colors.DECORATION_FRAME });
    
    // Add inner highlight
    const innerPadding = 3;
    this.playerInfoBg.roundRect(innerPadding, innerPadding, infoWidth - innerPadding * 2, height - innerPadding * 2, 5)
      .stroke({ width: 1, color: Colors.DECORATION_INNER_GLOW, alpha: 0.6 });
    
    // Add inner background
    this.playerInfoBg.roundRect(3, 3, infoWidth - 6, height - 6, 5)
      .fill(infoBgColor)
      .stroke({ width: 1, color: infoBgBorder, alpha: 0.8 });

    // Enhanced player label
    this.playerInfoLabel.text = this.playerNo === 1 ? 'P1' : 'P2';
    this.playerInfoLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: infoBgBorder,
      align: 'center',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 2,
        angle: Math.PI / 4,
        distance: 2
      }
    };
    this.playerInfoLabel.anchor.set(0.5);
    this.playerInfoLabel.x = infoWidth / 2;
    this.playerInfoLabel.y = height * 0.2;

    // Enhanced energy display with orb visual
    this.energyText.text = `⚡${this.energyCount}`;
    this.energyText.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: Colors.ENERGY_TEXT,
      align: 'center',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 1,
        angle: Math.PI / 4,
        distance: 1
      }
    };
    this.energyText.anchor.set(0.5);
    this.energyText.x = infoWidth / 2;
    this.energyText.y = height * 0.5;

    // Enhanced deck display
    this.deckText.text = `🃏${this.deckCount}`;
    this.deckText.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY,
      align: 'center',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 1,
        angle: Math.PI / 4,
        distance: 1
      }
    };
    this.deckText.anchor.set(0.5);
    this.deckText.x = infoWidth / 2;
    this.deckText.y = height * 0.75;

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