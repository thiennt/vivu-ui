import { Colors } from '@/utils/colors';
import { Container, Graphics, Text } from "pixi.js";
import { CardBattlePlayerState } from "@/types";
import { BaseScene } from "@/ui/BaseScene";

export class PlayerCharacterZone extends Container {
  private zoneBg: Graphics;
  private playerInfoZone: Container;
  private playerInfoBg: Graphics;
  private playerInfoGlow: Graphics;
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

  constructor(params?: { playerNo: number }) {
    super();

    this.playerNo = params?.playerNo ?? 1;
    
    this.zoneBg = new Graphics();
    this.addChild(this.zoneBg);

    this.playerInfoZone = new Container();
    this.addChild(this.playerInfoZone);

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

    const accentColor = this.playerNo === 1 
      ? Colors.TEAM_ALLY 
      : Colors.TEAM_ENEMY;
    
    // Dark wooden frame background
    this.zoneBg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.4 });
    
    // Inner wooden texture
    this.zoneBg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: Colors.BROWN, alpha: 0.3 });
    
    // Team-colored border
    this.zoneBg.roundRect(0, 0, width, height, 8)
      .stroke({ width: 3, color: accentColor, alpha: 0.8 });
    
    // Outer mystical glow
    this.zoneBg.roundRect(-2, -2, width + 4, height + 4, 10)
      .stroke({ width: 2, color: accentColor, alpha: 0.3 });
    
    this.playerInfoZone.x = 0;
    this.playerInfoZone.y = 0;

    this.drawPlayerInfoBackground();

    // Player label with better contrast - white text
    const labelIcon = this.playerNo === 1 ? '🛡️' : '⚔️';
    this.playerInfoLabel.text = this.playerNo === 1 ? `${labelIcon}\nYOU` : `${labelIcon}\nENEMY`;
    this.playerInfoLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: Colors.WHITE,
      stroke: { color: Colors.BLACK, width: 2.5 },
      align: 'center',
      lineHeight: 16,
      dropShadow: {
        color: Colors.BLACK,
        blur: 4,
        angle: Math.PI / 4,
        distance: 2,
        alpha: 0.8
      }
    };
    this.playerInfoLabel.anchor.set(0.5);
    this.playerInfoLabel.x = this.infoWidth / 2;
    this.playerInfoLabel.y = this.infoHeight * 0.18;

    // Energy display - bright and readable
    this.energyText.text = `⚡${this.energyCount}`;
    this.energyText.style = {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: Colors.GOLD_BRIGHT,
      align: 'center',
      stroke: { color: Colors.BLACK, width: 3 },
      dropShadow: {
        color: Colors.GOLD_BRIGHT,
        blur: 8,
        angle: 0,
        distance: 0,
        alpha: 0.9
      }
    };
    this.energyText.anchor.set(0.5);
    this.energyText.x = this.infoWidth / 2;
    this.energyText.y = this.infoHeight * 0.50;

    // Deck display - white text for readability
    this.deckText.text = `🃏${this.deckCount}`;
    this.deckText.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fontWeight: 'bold',
      fill: Colors.WHITE,
      align: 'center',
      stroke: { color: Colors.BLACK, width: 2.5 },
      dropShadow: {
        color: Colors.BLACK,
        blur: 3,
        angle: Math.PI / 4,
        distance: 1,
        alpha: 0.7
      }
    };
    this.deckText.anchor.set(0.5);
    this.deckText.x = this.infoWidth / 2;
    this.deckText.y = this.infoHeight * 0.78;

    this.charactersWidth = width - this.infoWidth;
    this.charactersHeight = height;
    this.charactersZone.x = this.infoWidth;
    this.charactersZone.y = 0;

    this.updateCharactersDisplay();
  }

  private drawPlayerInfoBackground(): void {
    const accentColor = this.playerNo === 1 ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY;
    
    this.playerInfoGlow.clear();
    this.playerInfoBg.clear();

    // Normal dark fantasy styling
    this.playerInfoGlow.roundRect(-3, -3, this.infoWidth + 6, this.infoHeight + 6, 9)
      .fill({ color: accentColor, alpha: 0.15 });
    
    // Dark brown background
    this.playerInfoBg.roundRect(0, 0, this.infoWidth, this.infoHeight, 6)
      .fill({ color: Colors.BROWN_DARKER, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD, alpha: 0.7 });
    
    // Inner darker texture
    this.playerInfoBg.roundRect(2, 2, this.infoWidth - 4, this.infoHeight - 4, 4)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.6 });
    
    // Team-colored inner border (subtle)
    this.playerInfoBg.roundRect(3, 3, this.infoWidth - 6, this.infoHeight - 6, 3)
      .stroke({ width: 1, color: accentColor, alpha: 0.4 });
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
      
      // Add energy-full visual and click handler for player 1
      if (this.playerNo === 1) {
        this.setupEnergyFullInteraction(characterCard, character);
      }
      
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

  private setupEnergyFullInteraction(characterCard: Container, character: any): void {
    const maxEnergy = character.max_energy || 100;
    const currentEnergy = character.energy || 0;
    const isEnergyFull = currentEnergy >= maxEnergy;
    
    if (isEnergyFull) {
      // Add visual indicator - glowing effect
      const glowGraphics = new Graphics();
      glowGraphics.roundRect(0, 0, characterCard.width, characterCard.height, 10)
        .stroke({ width: 3, color: Colors.GOLD_BRIGHT, alpha: 0.8 });
      
      // Add to card at bottom layer
      characterCard.addChildAt(glowGraphics, 0);
      
      // Add pulsing animation
      let pulseDirection = 1;
      let pulseAlpha = 0.8;
      const pulseInterval = setInterval(() => {
        if (!characterCard.destroyed) {
          pulseAlpha += 0.05 * pulseDirection;
          if (pulseAlpha >= 1) pulseDirection = -1;
          if (pulseAlpha <= 0.5) pulseDirection = 1;
          glowGraphics.alpha = pulseAlpha;
        } else {
          clearInterval(pulseInterval);
        }
      }, 50);
      
      // Make card clickable to perform skill
      // characterCard.interactive = true;
      // characterCard.cursor = 'pointer';
      
      // characterCard.on('pointerdown', () => {
      //   this.onCharacterSkillActivate(character);
      // });
      
      // // Add hover effect
      // characterCard.on('pointerover', () => {
      //   glowGraphics.clear();
      //   glowGraphics.roundRect(0, 0, characterCard.width, characterCard.height, 10)
      //     .stroke({ width: 4, color: Colors.GOLD_BRIGHT, alpha: 1 });
      // });
      
      // characterCard.on('pointerout', () => {
      //   glowGraphics.clear();
      //   glowGraphics.roundRect(0, 0, characterCard.width, characterCard.height, 10)
      //     .stroke({ width: 3, color: Colors.GOLD_BRIGHT, alpha: 0.8 });
      // });
    }
  }

  private onCharacterSkillActivate(character: any): void {
    // This would trigger the character's skill
    console.log('Character skill activated:', character);
    // TODO: Implement skill activation logic
    // This could emit an event that CardBattleScene listens to
    this.emit('characterSkillActivated', character);
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

  public findCharacterCard(characterId: string): Container | null {
    return this.characterCards.find(card => 
      (card as Container & { characterId: string }).characterId === characterId
    ) || null;
  }

  public getEnergyText(): Text {
    return this.energyText;
  }
}