import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { CardBattleCharacter } from '@/types';

export interface BattleFieldOptions {
  width: number;
  height: number;
  characterCardWidth: number;
  characterCardHeight: number;
}

export interface BattleFieldEvents {
  onCharacterClick?: (character: CardBattleCharacter, cardContainer: Container) => void;
  onCharacterHover?: (character: CardBattleCharacter, cardContainer: Container) => void;
}

export class BattleField extends Container {
  private opponentCharacters: CardBattleCharacter[] = [];
  private playerCharacters: CardBattleCharacter[] = [];
  private opponentCharacterContainers: Container[] = [];
  private playerCharacterContainers: Container[] = [];
  private options: BattleFieldOptions;
  private events: BattleFieldEvents;
  private actionLogContainer!: Container;

  constructor(options: BattleFieldOptions, events: BattleFieldEvents = {}) {
    super();
    this.options = options;
    this.events = events;
    this.createBattleField();
  }

  private createBattleField(): void {
    // Background
    const bg = new Graphics()
      .roundRect(0, 0, this.options.width, this.options.height, 10)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.2 })
      .stroke({ color: Colors.UI_BORDER, width: 2 });
    this.addChild(bg);

    // Create sections
    const sectionHeight = this.options.height / 3;
    
    // Opponent characters area (top third)
    this.createOpponentArea(0, sectionHeight);
    
    // Action log area (middle third)
    this.createActionLogArea(sectionHeight, sectionHeight);
    
    // Player characters area (bottom third)
    this.createPlayerArea(sectionHeight * 2, sectionHeight);
  }

  private createOpponentArea(y: number, height: number): void {
    const opponentArea = new Container();
    opponentArea.y = y;

    // Area background
    const areaBg = new Graphics()
      .roundRect(10, 0, this.options.width - 20, height - 5, 8)
      .fill({ color: 0xff6b6b, alpha: 0.1 })
      .stroke({ color: 0xff6b6b, width: 1 });
    opponentArea.addChild(areaBg);

    // Label
    const label = new Text({
      text: 'Opponent',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    label.anchor.set(0.5, 0);
    label.x = this.options.width / 2;
    label.y = 5;
    opponentArea.addChild(label);

    this.addChild(opponentArea);
  }

  private createActionLogArea(y: number, height: number): void {
    this.actionLogContainer = new Container();
    this.actionLogContainer.y = y;

    // Action log background
    const logBg = new Graphics()
      .roundRect(10, 5, this.options.width - 20, height - 10, 8)
      .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.8 })
      .stroke({ color: Colors.UI_BORDER, width: 1 });
    this.actionLogContainer.addChild(logBg);

    // Action log title
    const logTitle = new Text({
      text: 'Battle Log',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    logTitle.anchor.set(0.5, 0);
    logTitle.x = this.options.width / 2;
    logTitle.y = 10;
    this.actionLogContainer.addChild(logTitle);

    this.addChild(this.actionLogContainer);
  }

  private createPlayerArea(y: number, height: number): void {
    const playerArea = new Container();
    playerArea.y = y;

    // Area background
    const areaBg = new Graphics()
      .roundRect(10, 5, this.options.width - 20, height, 8)
      .fill({ color: 0x4ecdc4, alpha: 0.1 })
      .stroke({ color: 0x4ecdc4, width: 1 });
    playerArea.addChild(areaBg);

    // Label
    const label = new Text({
      text: 'Your Characters',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    label.anchor.set(0.5, 1);
    label.x = this.options.width / 2;
    label.y = height - 5;
    playerArea.addChild(label);

    this.addChild(playerArea);
  }

  public setOpponentCharacters(characters: CardBattleCharacter[]): void {
    this.opponentCharacters = characters;
    this.updateOpponentCharacterDisplay();
  }

  public setPlayerCharacters(characters: CardBattleCharacter[]): void {
    this.playerCharacters = characters;
    this.updatePlayerCharacterDisplay();
  }

  private updateOpponentCharacterDisplay(): void {
    // Clear existing containers
    this.opponentCharacterContainers.forEach(container => {
      container.destroy({ children: true });
    });
    this.opponentCharacterContainers = [];

    const sectionHeight = this.options.height / 3;
    const charactersPerRow = Math.min(4, this.opponentCharacters.length);
    const spacing = 10;
    const totalWidth = charactersPerRow * this.options.characterCardWidth + (charactersPerRow - 1) * spacing;
    const startX = (this.options.width - totalWidth) / 2;
    const startY = 25; // Below the label

    this.opponentCharacters.slice(0, 4).forEach((character, index) => {
      const characterContainer = this.createCharacterCard(character, true);
      characterContainer.x = startX + index * (this.options.characterCardWidth + spacing);
      characterContainer.y = startY;
      
      this.addChild(characterContainer);
      this.opponentCharacterContainers.push(characterContainer);
    });
  }

  private updatePlayerCharacterDisplay(): void {
    // Clear existing containers
    this.playerCharacterContainers.forEach(container => {
      container.destroy({ children: true });
    });
    this.playerCharacterContainers = [];

    const sectionHeight = this.options.height / 3;
    const charactersPerRow = Math.min(4, this.playerCharacters.length);
    const spacing = 10;
    const totalWidth = charactersPerRow * this.options.characterCardWidth + (charactersPerRow - 1) * spacing;
    const startX = (this.options.width - totalWidth) / 2;
    const startY = sectionHeight * 2 + 15; // In the player section

    this.playerCharacters.slice(0, 4).forEach((character, index) => {
      const characterContainer = this.createCharacterCard(character, false);
      characterContainer.x = startX + index * (this.options.characterCardWidth + spacing);
      characterContainer.y = startY;
      
      this.makeCharacterInteractive(characterContainer, character);
      
      this.addChild(characterContainer);
      this.playerCharacterContainers.push(characterContainer);
    });
  }

  private createCharacterCard(character: CardBattleCharacter, isOpponent: boolean): Container {
    const container = new Container();
    
    // Card background
    const cardBg = new Graphics()
      .roundRect(0, 0, this.options.characterCardWidth, this.options.characterCardHeight, 8)
      .fill({ color: isOpponent ? 0xff6b6b : 0x4ecdc4, alpha: 0.2 })
      .stroke({ color: isOpponent ? 0xff6b6b : 0x4ecdc4, width: 2 });
    container.addChild(cardBg);

    // Character name
    const nameText = new Text({
      text: character.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.options.characterCardWidth - 8
      }
    });
    nameText.anchor.set(0.5, 0);
    nameText.x = this.options.characterCardWidth / 2;
    nameText.y = 8;
    container.addChild(nameText);

    // HP bar
    const hpBarBg = new Graphics()
      .roundRect(8, this.options.characterCardHeight - 30, this.options.characterCardWidth - 16, 8, 4)
      .fill({ color: 0x333333 });
    container.addChild(hpBarBg);

    const hpPercentage = Math.max(0, character.hp / character.max_hp);
    const hpBarFill = new Graphics()
      .roundRect(8, this.options.characterCardHeight - 30, (this.options.characterCardWidth - 16) * hpPercentage, 8, 4)
      .fill({ color: hpPercentage > 0.5 ? 0x4CAF50 : hpPercentage > 0.25 ? 0xFF9800 : 0xF44336 });
    container.addChild(hpBarFill);

    // HP text
    const hpText = new Text({
      text: `${character.hp}/${character.max_hp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    hpText.anchor.set(0.5);
    hpText.x = this.options.characterCardWidth / 2;
    hpText.y = this.options.characterCardHeight - 10;
    container.addChild(hpText);

    // Store character reference
    (container as any).character = character;
    
    return container;
  }

  private makeCharacterInteractive(cardContainer: Container, character: CardBattleCharacter): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'pointer';
    
    cardContainer.on('pointerdown', () => {
      this.events.onCharacterClick?.(character, cardContainer);
    });
    
    cardContainer.on('pointerover', () => {
      cardContainer.alpha = 0.8;
      this.events.onCharacterHover?.(character, cardContainer);
    });
    
    cardContainer.on('pointerout', () => {
      cardContainer.alpha = 1.0;
    });
  }

  public addLogEntry(message: string): void {
    // Simple log implementation - could be enhanced with scrolling
    const logEntry = new Text({
      text: `• ${message}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        wordWrap: true,
        wordWrapWidth: this.options.width - 40
      }
    });
    
    const existingEntries = this.actionLogContainer.children.length - 2; // Subtract bg and title
    logEntry.x = 20;
    logEntry.y = 35 + existingEntries * 15;
    
    this.actionLogContainer.addChild(logEntry);
    
    // Keep only the latest 5 entries
    if (existingEntries >= 5) {
      this.actionLogContainer.removeChildAt(2); // Remove oldest entry (after bg and title)
      // Reposition remaining entries
      for (let i = 2; i < this.actionLogContainer.children.length; i++) {
        this.actionLogContainer.children[i].y = 35 + (i - 2) * 15;
      }
    }
  }

  public getOpponentCharacters(): CardBattleCharacter[] {
    return [...this.opponentCharacters];
  }

  public getPlayerCharacters(): CardBattleCharacter[] {
    return [...this.playerCharacters];
  }
}