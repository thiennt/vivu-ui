import { Colors, Gradients } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";
import { CardBattlePlayerState, Character } from "@/types";
import { BaseScene } from "@/utils/BaseScene";


export class PlayerCharacterZone extends Container {
  private zoneBg: Graphics;
  private decorativeElements: Graphics;

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

    // Add decorative elements layer
    this.decorativeElements = new Graphics();
    this.addChild(this.decorativeElements);

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
    // Clear existing graphics
    this.zoneBg.clear();
    this.decorativeElements.clear();
    this.playerInfoBg.clear();

    // Create main zone background with gradient
    const panelGradient = Gradients.createPanelGradient(width, height);
    this.zoneBg.roundRect(0, 0, width, height, 12)
      .fill(panelGradient)
      .stroke({ width: 3, color: Colors.UI_BORDER });

    // Add decorative border elements
    const borderAccent = 2;
    this.decorativeElements
      .roundRect(borderAccent, borderAccent, width - borderAccent * 2, height - borderAccent * 2, 8)
      .stroke({ width: 1, color: Colors.DECORATION_MAGIC, alpha: 0.6 });

    // Add corner decorations
    const cornerSize = 8;
    const cornerOffset = 6;
    
    // Top-left corner decoration
    this.decorativeElements
      .moveTo(cornerOffset, cornerOffset + cornerSize)
      .lineTo(cornerOffset, cornerOffset)
      .lineTo(cornerOffset + cornerSize, cornerOffset)
      .stroke({ width: 2, color: Colors.BUTTON_HOVER });
    
    // Top-right corner decoration
    this.decorativeElements
      .moveTo(width - cornerOffset - cornerSize, cornerOffset)
      .lineTo(width - cornerOffset, cornerOffset)
      .lineTo(width - cornerOffset, cornerOffset + cornerSize)
      .stroke({ width: 2, color: Colors.BUTTON_HOVER });
    
    // Bottom-right corner decoration
    this.decorativeElements
      .moveTo(width - cornerOffset, height - cornerOffset - cornerSize)
      .lineTo(width - cornerOffset, height - cornerOffset)
      .lineTo(width - cornerOffset - cornerSize, height - cornerOffset)
      .stroke({ width: 2, color: Colors.BUTTON_HOVER });
    
    // Bottom-left corner decoration
    this.decorativeElements
      .moveTo(cornerOffset + cornerSize, height - cornerOffset)
      .lineTo(cornerOffset, height - cornerOffset)
      .lineTo(cornerOffset, height - cornerOffset - cornerSize)
      .stroke({ width: 2, color: Colors.BUTTON_HOVER });
    
    // Layout player info zone at the left with enhanced design
    const infoWidth = width * 0.3;
    const infoPadding = 8;
    const infoHeight = height - infoPadding * 2;
    
    this.playerInfoZone.x = infoPadding;
    this.playerInfoZone.y = infoPadding;

    // Create enhanced player info background with gradient
    const infoGradient = Gradients.createButtonGradient(infoWidth - infoPadding * 2, infoHeight);
    this.playerInfoBg.roundRect(0, 0, infoWidth - infoPadding * 2, infoHeight, 8)
      .fill(infoGradient)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });

    // Add subtle inner glow to player info
    this.playerInfoBg
      .roundRect(2, 2, infoWidth - infoPadding * 2 - 4, infoHeight - 4, 6)
      .stroke({ width: 1, color: Colors.DECORATION_MAGIC, alpha: 0.4 });

    // Enhanced player info label
    const playerLabel = this.playerNo === 1 ? 'PLAYER 1' : 'PLAYER 2';
    this.playerInfoLabel.text = playerLabel;
    this.playerInfoLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fontWeight: 'bold',
      fill: Colors.TEXT_WHITE,
      align: 'center',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 3,
        angle: Math.PI / 6,
        distance: 2
      }
    };
    this.playerInfoLabel.anchor.set(0.5, 0);
    this.playerInfoLabel.x = (infoWidth - infoPadding * 2) / 2;
    this.playerInfoLabel.y = 12;

    // Enhanced energy text with icon
    this.energyText.text = `⚡ Energy: ${this.energyCount}`;
    this.energyText.style = {
      fontFamily: 'Kalam',
      fontSize: 13,
      fontWeight: 'bold',
      fill: Colors.ENERGY_TEXT,
      align: 'left',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 2,
        angle: Math.PI / 6,
        distance: 1
      }
    };
    this.energyText.x = 12;
    this.energyText.y = 40;

    // Enhanced deck text with icon
    this.deckText.text = `🃏 Deck: ${this.deckCount}`;
    this.deckText.style = {
      fontFamily: 'Kalam',
      fontSize: 13,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY,
      align: 'left',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 2,
        angle: Math.PI / 6,
        distance: 1
      }
    };
    this.deckText.x = 12;
    this.deckText.y = 60;

    // Layout characters zone to the right of player info with enhanced styling
    const charactersWidth = width - infoWidth - infoPadding;
    const charactersX = infoWidth + infoPadding;
    
    this.charactersZone.x = charactersX;
    this.charactersZone.y = infoPadding;

    // Add subtle background for characters area
    this.decorativeElements
      .roundRect(charactersX, infoPadding, charactersWidth - infoPadding, infoHeight, 8)
      .fill({ color: Colors.CONTAINER_BACKGROUND, alpha: 0.3 })
      .stroke({ width: 1, color: Colors.UI_BORDER, alpha: 0.5 });

    this.updateCharactersDisplay(charactersWidth - infoPadding, infoHeight);
  }

  updateBattleState(playerState: CardBattlePlayerState): void {
    this.playerState = playerState;
    
    // Update energy and deck counts
    this.energyCount = playerState.deck.current_energy || 0;
    this.deckCount = playerState.deck.deck_cards?.length || 0;
    
    // Update text displays with enhanced styling
    this.energyText.text = `⚡ Energy: ${this.energyCount}`;
    this.deckText.text = `🃏 Deck: ${this.deckCount}`;
    
    // Get current zone bounds for character update
    const bounds = this.zoneBg.getBounds();
    if (bounds.width > 0 && bounds.height > 0) {
      const infoPadding = 8;
      const infoWidth = bounds.width * 0.3;
      const infoHeight = bounds.height - infoPadding * 2;
      const charactersWidth = bounds.width - infoWidth - infoPadding;
      this.updateCharactersDisplay(charactersWidth - infoPadding, infoHeight);
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

  private createCharacterCard(character: Character, width: number, height: number): Container {
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