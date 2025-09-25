import { Container, Graphics, Text } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { Colors, Gradients } from '@/utils/colors';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';

/**
 * CardBattleScene - A React-like component implementing a card battle scene layout
 * 
 * Layout structure (top to bottom):
 * 1. Opponent info panel (HP/ATK/DEF, avatar)  
 * 2. Opponent hand zone (cards face down)
 * 3. Opponent discard pile
 * 4. Battle log area (center)
 * 5. Player characters row (up to 3)  
 * 6. Player hand zone (cards face up)
 * 7. Player info panel & discard pile
 * 8. END TURN button (prominent, accessible)
 */
export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];

  public container: Container;

  // UI Containers - organized by layout zones
  private backgroundContainer!: Container;
  private opponentInfoContainer!: Container;
  private opponentHandContainer!: Container;
  private opponentDiscardContainer!: Container;
  private battleLogContainer!: Container;
  private playerCharactersContainer!: Container;
  private playerHandContainer!: Container;
  private playerInfoContainer!: Container;
  private playerDiscardContainer!: Container;
  private endTurnContainer!: Container;

  // Mock game state for demonstration
  private mockBattleState!: MockBattleState;

  // Layout constants - responsive
  private readonly ZONE_PADDING = 8;
  private readonly CARD_ASPECT_RATIO = 1.4; // height/width
  private readonly CHARACTER_ASPECT_RATIO = 1.25;

  constructor() {
    super();
    
    this.container = new Container();
    this.addChild(this.container);
    
    // Initialize containers
    this.initializeContainers();
    
    // Initialize mock battle state
    this.initializeMockState();
    
    // Create the scene layout
    this.createScene();
  }

  private initializeContainers(): void {
    this.backgroundContainer = new Container();
    this.opponentInfoContainer = new Container();
    this.opponentHandContainer = new Container();
    this.opponentDiscardContainer = new Container();
    this.battleLogContainer = new Container();
    this.playerCharactersContainer = new Container();
    this.playerHandContainer = new Container();
    this.playerInfoContainer = new Container();
    this.playerDiscardContainer = new Container();
    this.endTurnContainer = new Container();

    // Add all containers to main container in proper order
    this.container.addChild(
      this.backgroundContainer,
      this.opponentInfoContainer,
      this.opponentHandContainer,
      this.opponentDiscardContainer,
      this.battleLogContainer,
      this.playerCharactersContainer,
      this.playerHandContainer,
      this.playerInfoContainer,
      this.playerDiscardContainer,
      this.endTurnContainer
    );
  }

  private initializeMockState(): void {
    // Mock data for demonstration purposes
    this.mockBattleState = {
      currentPlayer: 1,
      turn: 3,
      phase: 'main_phase',
      
      player: {
        hp: 85,
        maxHp: 100,
        energy: 3,
        maxEnergy: 5,
        handCards: this.createMockCards(5),
        discardCount: 2,
        deckCount: 15,
        characters: this.createMockPlayerCharacters()
      },
      
      opponent: {
        hp: 67,
        maxHp: 100,
        energy: 4,
        maxEnergy: 5,
        handCardCount: 4,
        discardCount: 3,
        deckCount: 12,
        characters: this.createMockOpponentCharacters()
      },
      
      battleLog: [
        "Turn 3 begins",
        "Player draws Lightning Bolt",
        "Opponent plays Fireball on Crypto Cat",
        "Crypto Cat takes 15 damage"
      ]
    };
  }

  private createMockCards(count: number): MockCard[] {
    const cardNames = ["Lightning Bolt", "Heal", "Shield Block", "Fire Strike", "Ice Shard"];
    const cardTypes = ["Attack", "Support", "Defense", "Attack", "Attack"];
    const energyCosts = [2, 1, 1, 3, 2];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `card_${i}`,
      name: cardNames[i % cardNames.length],
      type: cardTypes[i % cardTypes.length],
      energyCost: energyCosts[i % energyCosts.length],
      description: `A powerful ${cardTypes[i % cardTypes.length].toLowerCase()} card`
    }));
  }

  private createMockPlayerCharacters(): MockCharacter[] {
    return [
      { id: "char_1", name: "Crypto Cat", hp: 45, maxHp: 60, atk: 25, def: 15 },
      { id: "char_2", name: "Doge Knight", hp: 80, maxHp: 80, atk: 30, def: 20 },
      { id: "char_3", name: "Bitcoin Bear", hp: 20, maxHp: 70, atk: 35, def: 10 }
    ];
  }

  private createMockOpponentCharacters(): MockCharacter[] {
    return [
      { id: "opp_1", name: "Shadow Wolf", hp: 55, maxHp: 70, atk: 28, def: 12 },
      { id: "opp_2", name: "Fire Drake", hp: 40, maxHp: 90, atk: 40, def: 25 },
      { id: "opp_3", name: "Ice Golem", hp: 65, maxHp: 65, atk: 20, def: 30 }
    ];
  }

  private createScene(): void {
    this.createBackground();
    this.calculateLayout();
    this.createOpponentInfo();
    this.createOpponentHand();
    this.createOpponentDiscard();
    this.createBattleLog();
    this.createPlayerCharacters();
    this.createPlayerHand();
    this.createPlayerInfo();
    this.createPlayerDiscard();
    this.createEndTurnButton();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill(Gradients.BACKGROUND_DARK);
    
    this.backgroundContainer.addChild(bg);
  }

  private calculateLayout(): void {
    // Calculate responsive zone heights based on screen size
    const totalHeight = this.gameHeight;
    const padding = this.ZONE_PADDING;
    
    // Zone height distribution (percentages of available space)
    const zoneDistribution = {
      opponentInfo: 0.08,    // 8%
      opponentHand: 0.12,    // 12%
      opponentDiscard: 0.06, // 6%
      battleLog: 0.20,       // 20%
      playerCharacters: 0.25, // 25%
      playerHand: 0.15,      // 15%
      playerInfo: 0.08,      // 8%
      endTurn: 0.06          // 6%
    };

    let currentY = padding;

    // Calculate positions for each zone
    this.opponentInfoContainer.y = currentY;
    currentY += totalHeight * zoneDistribution.opponentInfo + padding;

    this.opponentHandContainer.y = currentY;
    currentY += totalHeight * zoneDistribution.opponentHand + padding;

    this.opponentDiscardContainer.y = currentY;
    currentY += totalHeight * zoneDistribution.opponentDiscard + padding;

    this.battleLogContainer.y = currentY;
    currentY += totalHeight * zoneDistribution.battleLog + padding;

    this.playerCharactersContainer.y = currentY;
    currentY += totalHeight * zoneDistribution.playerCharacters + padding;

    this.playerHandContainer.y = currentY;
    currentY += totalHeight * zoneDistribution.playerHand + padding;

    this.playerInfoContainer.y = currentY;
    currentY += totalHeight * zoneDistribution.playerInfo + padding;

    this.playerDiscardContainer.y = currentY;
    currentY += totalHeight * zoneDistribution.playerInfo + padding;

    this.endTurnContainer.y = this.gameHeight - (totalHeight * zoneDistribution.endTurn) - padding;
  }

  private createOpponentInfo(): void {
    const panelWidth = Math.min(300, this.gameWidth - (this.ZONE_PADDING * 2));
    const panelHeight = 40;
    
    // Background panel
    const bg = new Graphics();
    bg.roundRect(0, 0, panelWidth, panelHeight, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // Avatar placeholder
    const avatar = new Graphics();
    avatar.circle(20, 20, 16)
      .fill(Colors.TEAM_ENEMY)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // HP Bar
    const hpBarBg = new Graphics();
    hpBarBg.roundRect(45, 8, 120, 8, 4)
      .fill(Colors.HP_BAR_BACKGROUND);
    
    const hpPercent = this.mockBattleState.opponent.hp / this.mockBattleState.opponent.maxHp;
    const hpBarFill = new Graphics();
    hpBarFill.roundRect(46, 9, 118 * hpPercent, 6, 3)
      .fill(Colors.HP_BAR_FILL);
    
    // HP Text
    const hpText = new Text({
      text: `HP: ${this.mockBattleState.opponent.hp}/${this.mockBattleState.opponent.maxHp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY
      }
    });
    hpText.x = 45;
    hpText.y = 22;
    
    // Energy display
    const energyText = new Text({
      text: `Energy: ${this.mockBattleState.opponent.energy}/${this.mockBattleState.opponent.maxEnergy}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.ENERGY_TEXT
      }
    });
    energyText.x = panelWidth - 80;
    energyText.y = 22;
    
    this.opponentInfoContainer.addChild(bg, avatar, hpBarBg, hpBarFill, hpText, energyText);
    this.opponentInfoContainer.x = (this.gameWidth - panelWidth) / 2;
  }

  private createOpponentHand(): void {
    const handWidth = this.gameWidth - (this.ZONE_PADDING * 2);
    const cardCount = this.mockBattleState.opponent.handCardCount || 0;
    
    if (cardCount === 0) return;
    
    const cardWidth = Math.min(50, (handWidth - (cardCount - 1) * 5) / cardCount);
    const cardHeight = cardWidth * this.CARD_ASPECT_RATIO;
    
    for (let i = 0; i < cardCount; i++) {
      const cardBg = new Graphics();
      cardBg.roundRect(0, 0, cardWidth, cardHeight, 6)
        .fill(Colors.CARD_BACK)
        .stroke({ width: 1, color: Colors.CARD_BORDER });
      
      const x = (this.gameWidth - (cardCount * (cardWidth + 5) - 5)) / 2 + i * (cardWidth + 5);
      cardBg.x = x;
      
      this.opponentHandContainer.addChild(cardBg);
    }
  }

  private createOpponentDiscard(): void {
    const discardWidth = 60;
    const discardHeight = 80;
    
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, discardWidth, discardHeight, 6)
      .fill(Colors.CARD_DISCARD)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const discardText = new Text({
      text: `DISCARD\n${this.mockBattleState.opponent.discardCount}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    discardText.anchor.set(0.5);
    discardText.x = discardWidth / 2;
    discardText.y = discardHeight / 2;
    
    this.opponentDiscardContainer.addChild(discardBg, discardText);
    this.opponentDiscardContainer.x = this.gameWidth - discardWidth - this.ZONE_PADDING;
  }

  private createBattleLog(): void {
    const logWidth = Math.min(350, this.gameWidth - (this.ZONE_PADDING * 2));
    const logHeight = 80;
    
    // Background
    const logBg = new Graphics();
    logBg.roundRect(0, 0, logWidth, logHeight, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // Title
    const titleText = new Text({
      text: 'BATTLE LOG',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    titleText.anchor.set(0.5, 0);
    titleText.x = logWidth / 2;
    titleText.y = 8;
    
    // Log entries
    const logText = this.mockBattleState.battleLog.slice(-3).join('\n');
    const logContent = new Text({
      text: logText,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: logWidth - 16
      }
    });
    logContent.anchor.set(0.5, 0);
    logContent.x = logWidth / 2;
    logContent.y = 30;
    
    this.battleLogContainer.addChild(logBg, titleText, logContent);
    this.battleLogContainer.x = (this.gameWidth - logWidth) / 2;
  }

  private createPlayerCharacters(): void {
    const characters = this.mockBattleState.player.characters;
    const availableWidth = this.gameWidth - (this.ZONE_PADDING * 2);
    const charWidth = Math.min(100, (availableWidth - (characters.length - 1) * 10) / characters.length);
    const charHeight = charWidth * this.CHARACTER_ASPECT_RATIO;
    
    characters.forEach((character, index) => {
      const charCard = this.createCharacterCard(character, charWidth, charHeight);
      const x = (this.gameWidth - (characters.length * (charWidth + 10) - 10)) / 2 + index * (charWidth + 10);
      charCard.x = x;
      
      this.playerCharactersContainer.addChild(charCard);
    });
  }

  private createCharacterCard(character: MockCharacter, width: number, height: number): Container {
    const card = new Container();
    
    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill(Colors.TEAM_ALLY)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // Character name
    const nameText = new Text({
      text: character.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(10, width * 0.12),
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    nameText.anchor.set(0.5, 0);
    nameText.x = width / 2;
    nameText.y = 5;
    
    // HP bar
    const hpBarBg = new Graphics();
    hpBarBg.roundRect(5, height * 0.6, width - 10, 8, 4)
      .fill(Colors.HP_BAR_BACKGROUND);
    
    const hpPercent = character.hp / character.maxHp;
    const hpBarFill = new Graphics();
    hpBarFill.roundRect(6, height * 0.6 + 1, (width - 12) * hpPercent, 6, 3)
      .fill(Colors.HP_BAR_FILL);
    
    // Stats text
    const statsText = new Text({
      text: `HP: ${character.hp}/${character.maxHp}\nATK: ${character.atk} DEF: ${character.def}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(8, width * 0.08),
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    statsText.anchor.set(0.5, 0);
    statsText.x = width / 2;
    statsText.y = height * 0.75;
    
    card.addChild(bg, nameText, hpBarBg, hpBarFill, statsText);
    return card;
  }

  private createPlayerHand(): void {
    const handCards = this.mockBattleState.player.handCards;
    if (!handCards || handCards.length === 0) return;
    
    const availableWidth = this.gameWidth - (this.ZONE_PADDING * 2);
    const cardWidth = Math.min(60, (availableWidth - (handCards.length - 1) * 8) / handCards.length);
    const cardHeight = cardWidth * this.CARD_ASPECT_RATIO;
    
    handCards.forEach((card, index) => {
      const handCard = this.createHandCard(card, cardWidth, cardHeight);
      const x = (this.gameWidth - (handCards.length * (cardWidth + 8) - 8)) / 2 + index * (cardWidth + 8);
      handCard.x = x;
      
      this.playerHandContainer.addChild(handCard);
    });
  }

  private createHandCard(card: MockCard, width: number, height: number): Container {
    const cardContainer = new Container();
    
    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 6)
      .fill(Colors.CARD_BACKGROUND)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    // Energy cost circle
    const energyCost = new Graphics();
    energyCost.circle(width - 12, 12, 8)
      .fill(Colors.ENERGY_TEXT);
    
    const costText = new Text({
      text: card.energyCost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    costText.anchor.set(0.5);
    costText.x = width - 12;
    costText.y = 12;
    
    // Card name
    const nameText = new Text({
      text: card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(8, width * 0.1),
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: width - 8
      }
    });
    nameText.anchor.set(0.5, 0);
    nameText.x = width / 2;
    nameText.y = height * 0.3;
    
    // Card type
    const typeText = new Text({
      text: card.type,
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(7, width * 0.08),
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    typeText.anchor.set(0.5, 0);
    typeText.x = width / 2;
    typeText.y = height * 0.7;
    
    cardContainer.addChild(bg, energyCost, costText, nameText, typeText);
    
    // Make interactive
    cardContainer.interactive = true;
    cardContainer.cursor = 'pointer';
    cardContainer.on('pointerover', () => {
      cardContainer.scale.set(1.05);
    });
    cardContainer.on('pointerout', () => {
      cardContainer.scale.set(1.0);
    });
    
    return cardContainer;
  }

  private createPlayerInfo(): void {
    const panelWidth = Math.min(300, this.gameWidth - (this.ZONE_PADDING * 2));
    const panelHeight = 40;
    
    // Background panel
    const bg = new Graphics();
    bg.roundRect(0, 0, panelWidth, panelHeight, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // Avatar placeholder
    const avatar = new Graphics();
    avatar.circle(20, 20, 16)
      .fill(Colors.TEAM_ALLY)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // HP Bar
    const hpBarBg = new Graphics();
    hpBarBg.roundRect(45, 8, 120, 8, 4)
      .fill(Colors.HP_BAR_BACKGROUND);
    
    const hpPercent = this.mockBattleState.player.hp / this.mockBattleState.player.maxHp;
    const hpBarFill = new Graphics();
    hpBarFill.roundRect(46, 9, 118 * hpPercent, 6, 3)
      .fill(Colors.HP_BAR_FILL);
    
    // HP Text
    const hpText = new Text({
      text: `HP: ${this.mockBattleState.player.hp}/${this.mockBattleState.player.maxHp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY
      }
    });
    hpText.x = 45;
    hpText.y = 22;
    
    // Energy display
    const energyText = new Text({
      text: `Energy: ${this.mockBattleState.player.energy}/${this.mockBattleState.player.maxEnergy}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.ENERGY_TEXT
      }
    });
    energyText.x = panelWidth - 80;
    energyText.y = 22;
    
    this.playerInfoContainer.addChild(bg, avatar, hpBarBg, hpBarFill, hpText, energyText);
    this.playerInfoContainer.x = (this.gameWidth - panelWidth) / 2;
  }

  private createPlayerDiscard(): void {
    const discardWidth = 60;
    const discardHeight = 80;
    
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, discardWidth, discardHeight, 6)
      .fill(Colors.CARD_DISCARD)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const discardText = new Text({
      text: `DISCARD\n${this.mockBattleState.player.discardCount}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    discardText.anchor.set(0.5);
    discardText.x = discardWidth / 2;
    discardText.y = discardHeight / 2;
    
    // Make interactive (drop zone for discarding cards)
    discardBg.interactive = true;
    discardBg.cursor = 'pointer';
    discardBg.on('pointerover', () => {
      discardBg.tint = 0xdddddd;
    });
    discardBg.on('pointerout', () => {
      discardBg.tint = 0xffffff;
    });
    
    this.playerDiscardContainer.addChild(discardBg, discardText);
    this.playerDiscardContainer.x = this.gameWidth - discardWidth - this.ZONE_PADDING;
  }

  private createEndTurnButton(): void {
    const buttonWidth = Math.min(120, this.gameWidth * 0.3);
    const buttonHeight = 44;
    
    // Button background with prominent styling
    const buttonBg = new Graphics();
    const gradient = Gradients.createButtonGradient(buttonWidth, buttonHeight);
    buttonBg.roundRect(0, 0, buttonWidth, buttonHeight, 12)
      .fill(gradient)
      .stroke({ width: 3, color: Colors.BUTTON_BORDER });
    
    // Button text
    const buttonText = new Text({
      text: 'END TURN',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON,
        align: 'center'
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = buttonWidth / 2;
    buttonText.y = buttonHeight / 2;
    
    const button = new Container();
    button.addChild(buttonBg, buttonText);
    
    // Position at bottom center
    button.x = (this.gameWidth - buttonWidth) / 2;
    
    // Make interactive with accessibility features
    button.interactive = true;
    button.cursor = 'pointer';
    button.on('pointerover', () => {
      buttonBg.tint = 0xbbbbbb;
      button.scale.set(1.02);
    });
    button.on('pointerout', () => {
      buttonBg.tint = 0xffffff;
      button.scale.set(1.0);
    });
    button.on('pointertap', () => {
      this.handleEndTurn();
    });
    
    // Add accessibility (screen reader support would be added here in a real implementation)
    (button as unknown as Record<string, string>).accessibleTitle = 'End Turn';
    (button as unknown as Record<string, string>).accessibleHint = 'Press to end your turn and pass to opponent';
    
    this.endTurnContainer.addChild(button);
  }

  private handleEndTurn(): void {
    console.log('End turn clicked - implementing turn logic...');
    
    // In a real implementation, this would trigger game logic
    // For now, we'll just simulate some changes
    this.mockBattleState.turn++;
    this.mockBattleState.currentPlayer = this.mockBattleState.currentPlayer === 1 ? 2 : 1;
    
    // Add to battle log
    this.mockBattleState.battleLog.push(`Turn ${this.mockBattleState.turn} begins`);
    
    // Update battle log display
    this.updateBattleLog();
  }

  private updateBattleLog(): void {
    // Remove old battle log content and recreate
    this.battleLogContainer.removeChildren();
    this.createBattleLog();
  }

  /** Resize handler for responsive layout */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Clear and recreate the scene with new dimensions
    this.container.removeChildren();
    this.initializeContainers();
    this.createScene();
  }

  /** Update method called by the game loop */
  update(): void {
    // Animation updates would go here
    // For now, this is a static scene
  }

  /** Navigation back to home */
  private goHome(): void {
    navigation.showScreen(HomeScene);
  }
}

// Mock types for the component
interface MockBattleState {
  currentPlayer: number;
  turn: number;
  phase: string;
  player: MockPlayer;
  opponent: MockPlayer;
  battleLog: string[];
}

interface MockPlayer {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  handCards?: MockCard[];
  handCardCount?: number;
  discardCount: number;
  deckCount: number;
  characters: MockCharacter[];
}

interface MockCard {
  id: string;
  name: string;
  type: string;
  energyCost: number;
  description: string;
}

interface MockCharacter {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
}