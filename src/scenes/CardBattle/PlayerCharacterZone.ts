import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";
import { CardBattlePlayerState } from "@/types";
import { BaseScene } from "@/ui/BaseScene";

export class PlayerCharacterZone extends Container {
  private zoneBg: Graphics;
  private playerInfoZone: Container;
  private playerInfoBg: Graphics;
  private playerInfoGlow: Graphics; // NEW: Add glow effect
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

  private discardTooltip: Text | null = null;

  constructor(params?: { playerNo: number }) {
    super();

    this.playerNo = params?.playerNo ?? 1;
    
    this.zoneBg = new Graphics();
    this.addChild(this.zoneBg);

    this.playerInfoZone = new Container();
    this.addChild(this.playerInfoZone);

    // Add glow layer before background
    this.playerInfoGlow = new Graphics();
    this.playerInfoZone.addChild(this.playerInfoGlow);

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
    
    this.infoWidth = width * 0.18;
    this.infoHeight = height;

    // Enhanced background with gradient feel
    const accentColor = this.playerNo === 1 
      ? Colors.TEAM_ALLY 
      : Colors.TEAM_ENEMY;
    
    // Semi-transparent background with subtle gradient
    const bgAlpha = 0.3;
    this.zoneBg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.UI_BACKGROUND, alpha: bgAlpha });
    
    // Add inner shadow effect
    this.zoneBg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: 0x000000, alpha: 0.2 });
    
    // Team-colored border with glow
    this.zoneBg.roundRect(0, 0, width, height, 8)
      .stroke({ width: 3, color: accentColor, alpha: 0.6 });
    
    // Outer glow
    this.zoneBg.roundRect(-2, -2, width + 4, height + 4, 10)
      .stroke({ width: 2, color: accentColor, alpha: 0.2 });
    
    // Layout player info zone at the left
    this.playerInfoZone.x = 0;
    this.playerInfoZone.y = 0;

    this.drawPlayerInfoBackground(false);

    // Enhanced player label with shadow
    this.playerInfoLabel.text = this.playerNo === 1 ? 'PLAYER' : 'ENEMY';
    this.playerInfoLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fontWeight: 'bold',
      fill: accentColor,
      align: 'center',
      dropShadow: {
        color: 0x000000,
        blur: 4,
        angle: Math.PI / 4,
        distance: 2,
        alpha: 0.5
      }
    };
    this.playerInfoLabel.anchor.set(0.5);
    this.playerInfoLabel.x = this.infoWidth / 2;
    this.playerInfoLabel.y = this.infoHeight * 0.15;

    // Enhanced energy display with glow
    this.energyText.text = `⚡${this.energyCount}`;
    this.energyText.style = {
      fontFamily: 'Kalam',
      fontSize: 18,
      fontWeight: 'bold',
      fill: Colors.ENERGY_TEXT,
      align: 'center',
      dropShadow: {
        color: Colors.ENERGY_ACTIVE,
        blur: 6,
        angle: 0,
        distance: 0,
        alpha: 0.8
      }
    };
    this.energyText.anchor.set(0.5);
    this.energyText.x = this.infoWidth / 2;
    this.energyText.y = this.infoHeight * 0.45;

    // Enhanced deck display
    this.deckText.text = `🃏${this.deckCount}`;
    this.deckText.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY,
      align: 'center',
      dropShadow: {
        color: 0x000000,
        blur: 3,
        angle: Math.PI / 4,
        distance: 1,
        alpha: 0.5
      }
    };
    this.deckText.anchor.set(0.5);
    this.deckText.x = this.infoWidth / 2;
    this.deckText.y = this.infoHeight * 0.75;

    this.playerInfoBg.interactive = true;
    this.updateDiscardHighlight(false);

    // Layout characters zone
    this.charactersWidth = width - this.infoWidth;
    this.charactersHeight = height;
    this.charactersZone.x = this.infoWidth;
    this.charactersZone.y = 0;

    this.updateCharactersDisplay();
  }

  private drawPlayerInfoBackground(highlight: boolean): void {
    const accentColor = this.playerNo === 1 ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY;
    
    this.playerInfoGlow.clear();
    this.playerInfoBg.clear();

    if (highlight) {
      // Glowing border when highlighted for discard
      this.playerInfoGlow.roundRect(-4, -4, this.infoWidth + 8, this.infoHeight + 8, 10)
        .fill({ color: Colors.CARD_DISCARD, alpha: 0.2 });
      
      this.playerInfoBg.roundRect(0, 0, this.infoWidth, this.infoHeight, 6)
        .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.9 })
        .stroke({ width: 3, color: Colors.CARD_DISCARD, alpha: 0.9 });
      
      // Animated dashed border effect
      const dashLength = 8;
      const spacing = 4;
      for (let i = 0; i < this.infoWidth; i += dashLength + spacing) {
        this.playerInfoBg.roundRect(i + 2, 2, Math.min(dashLength, this.infoWidth - i - 4), 3, 1)
          .fill(Colors.CARD_DISCARD);
      }
      for (let i = 0; i < this.infoHeight; i += dashLength + spacing) {
        this.playerInfoBg.roundRect(2, i + 2, 3, Math.min(dashLength, this.infoHeight - i - 4), 1)
          .fill(Colors.CARD_DISCARD);
        this.playerInfoBg.roundRect(this.infoWidth - 5, i + 2, 3, Math.min(dashLength, this.infoHeight - i - 4), 1)
          .fill(Colors.CARD_DISCARD);
      }
      for (let i = 0; i < this.infoWidth; i += dashLength + spacing) {
        this.playerInfoBg.roundRect(i + 2, this.infoHeight - 5, Math.min(dashLength, this.infoWidth - i - 4), 3, 1)
          .fill(Colors.CARD_DISCARD);
      }

      // Show tooltip
      if (!this.discardTooltip) {
        this.discardTooltip = new Text({
          text: '♻️ DISCARD',
          style: {
            fontFamily: 'Kalam',
            fontSize: 11,
            fontWeight: 'bold',
            fill: Colors.CARD_DISCARD,
            align: 'center',
            dropShadow: {
              color: 0x000000,
              blur: 3,
              distance: 1,
              alpha: 0.8
            }
          }
        });
        this.discardTooltip.anchor.set(0.5);
        this.playerInfoZone.addChild(this.discardTooltip);
      }
      
      this.discardTooltip.visible = true;
      this.discardTooltip.x = this.infoWidth / 2;
      this.discardTooltip.y = this.infoHeight - 15;
      
    } else {
      // Normal styling with subtle glow
      this.playerInfoGlow.roundRect(-3, -3, this.infoWidth + 6, this.infoHeight + 6, 9)
        .fill({ color: accentColor, alpha: 0.15 });
      
      this.playerInfoBg.roundRect(0, 0, this.infoWidth, this.infoHeight, 6)
        .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.85 })
        .stroke({ width: 2, color: accentColor, alpha: 0.7 });
      
      // Inner highlight
      this.playerInfoBg.roundRect(2, 2, this.infoWidth - 4, this.infoHeight - 4, 4)
        .stroke({ width: 1, color: accentColor, alpha: 0.3 });
        
      if (this.discardTooltip) {
        this.discardTooltip.visible = false;
      }
    }
  }

  updateBattleState(playerState: CardBattlePlayerState): void {
    this.playerState = playerState;
    
    this.energyCount = playerState.deck.current_energy || 0;
    this.deckCount = playerState.deck.remaining_cards || 0;
    
    this.energyText.text = `⚡ ${this.energyCount}`;
    this.deckText.text = `🃏 ${this.deckCount}`;

    this.updateCharactersDisplay();
  }

  private updateCharactersDisplay(): void {
    this.characterCards.forEach(card => card.destroy());
    this.characterCards = [];
    
    if (!this.playerState || !this.playerState.characters) return;
    
    const characters = this.playerState.characters.slice(0, 3);
    if (characters.length === 0) return;
    
    const spacing = 10;
    const cardWidth = Math.floor(this.charactersWidth / characters.length) - 10;
    const cardHeight = this.charactersHeight * 0.95;
    
    const startX = spacing;
    
    characters.forEach((character, index) => {
      const x = startX + (index * (cardWidth + spacing)) + cardWidth / 2;
      const y = Math.max(5, (this.charactersHeight - cardHeight) / 2) + cardHeight / 2;
      
      const characterCard = this.createCharacterCard(character, x, y, cardWidth, cardHeight);
      
      (characterCard as Container & { characterId: string }).characterId = character.id;
      
      this.charactersZone.addChild(characterCard);
      this.characterCards.push(characterCard);
    });
  }

  private createCharacterCard(character: any, x: number, y: number, width: number, height: number): Container {
    const scene = this.parent as BaseScene;
    const card = scene.createCharacterCard(character, x, y, width, height);
    card.pivot.x = card.width / 2;
    card.pivot.y = card.height / 2;
    card.width = width;
    card.height = height;
    return card;
  }

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

  updateCharacterHover(globalX: number, globalY: number, isDragging: boolean): void {
    if (!isDragging) {
      this.characterCards.forEach(card => {
        card.scale.set(1.0);
      });
      return;
    }

    for (const characterCard of this.characterCards) {
      const bounds = characterCard.getBounds();
      const isHovering = globalX >= bounds.x && globalX <= bounds.x + bounds.width &&
                        globalY >= bounds.y && globalY <= bounds.y + bounds.height;
      
      if (isHovering) {
        characterCard.scale.set(1.15);
      } else {
        characterCard.scale.set(1.0);
      }
    }
  }

  isPointInPlayerInfo(globalX: number, globalY: number): boolean {
    const globalPos = this.toGlobal({ x: 0, y: 0 });
    return globalX >= globalPos.x && globalX <= globalPos.x + this.infoWidth &&
           globalY >= globalPos.y && globalY <= globalPos.y + this.infoHeight;
  }

  updateDiscardHighlight(highlight: boolean): void {
    this.drawPlayerInfoBackground(highlight);
  }

  public findCharacterCard(characterId: string): Container | null {
    return this.characterCards.find(card => 
      (card as Container & { characterId: string }).characterId === characterId
    ) || null;
  }

  public getEnergyText(): Text {
    return this.energyText;
  }
}