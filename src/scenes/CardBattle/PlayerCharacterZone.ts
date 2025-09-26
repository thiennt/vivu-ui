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
    
    // Use the enhanced epic battle frame for character zones
    // Manually recreate epic battle frame styling
    // Deep shadow for depth
    this.zoneBg.roundRect(3, 3, width, height, 12)
      .fill({ color: Colors.BATTLE_SHADOW_DEEP, alpha: 0.5 });
    
    // Main background
    this.zoneBg.roundRect(0, 0, width, height, 12)
      .fill(Colors.BATTLEFIELD_PRIMARY);
    
    // Inner mystical glow
    this.zoneBg.roundRect(2, 2, width - 4, height - 4, 10)
      .stroke({ width: 2, color: Colors.MYSTICAL_GLOW, alpha: 0.6 });
    
    // Golden battle frame
    this.zoneBg.roundRect(0, 0, width, height, 12)
      .stroke({ width: 3, color: Colors.BATTLE_FRAME_GOLD });
    
    // Add mystical corner accents
    const cornerSize = 20;
    const accentColor = this.playerNo === 1 ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY;
    
    // Top corners
    this.zoneBg.moveTo(cornerSize, 2)
      .lineTo(2, 2)
      .lineTo(2, cornerSize)
      .stroke({ width: 3, color: accentColor, alpha: 0.8 });
    
    this.zoneBg.moveTo(width - cornerSize, 2)
      .lineTo(width - 2, 2)
      .lineTo(width - 2, cornerSize)
      .stroke({ width: 3, color: accentColor, alpha: 0.8 });
    
    // Layout player info zone at the left
    const infoWidth = width * 0.18;
    this.playerInfoZone.x = 0;
    this.playerInfoZone.y = 0;

    const infoBgBorder = this.playerNo === 1 ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY;
    
    this.playerInfoBg.clear();
    
    // Create enhanced player info background with mystical frame
    this.playerInfoBg.roundRect(2, 2, infoWidth, height - 4, 8)
      .fill({ color: Colors.BATTLE_SHADOW_DEEP, alpha: 0.3 });
    
    this.playerInfoBg.roundRect(0, 0, infoWidth, height, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: infoBgBorder, alpha: 0.9 });
    
    // Add mystical inner glow
    this.playerInfoBg.roundRect(2, 2, infoWidth - 4, height - 4, 6)
      .stroke({ width: 1, color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.7 });
    
    // Add inner background with team color accent
    const infoBgColor = this.playerNo === 1 ? '#4a4a4a' : '#3a3a3a';
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