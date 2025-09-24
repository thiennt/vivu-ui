import { Container, Graphics, Text, FederatedPointerEvent } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { Colors, Gradients } from '@/utils/colors';
import { HomeScene } from './HomeScene';
import { gsap } from 'gsap';
import { 
  CardBattleState, 
  CardBattlePlayerState, 
  CardBattleCharacter, 
  TurnAction,
  BattlePhaseName,
  Card
} from '@/types';
import { battleApi } from '@/services/api';
import { app } from '../app';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  
  // Battle state
  private battleState: CardBattleState | null = null;
  private battleId: string;
  private currentPhase: BattlePhaseName = 'start_turn';
  private isAnimating: boolean = false;
  
  // UI Containers
  private backgroundContainer!: Container;
  private battlefieldContainer!: Container;
  private player1CharactersContainer!: Container;
  private player2CharactersContainer!: Container;
  private handContainer!: Container;
  private opponentHandContainer!: Container;
  private discardPileContainer!: Container;
  private deckRemainingContainer!: Container;
  private energyContainer!: Container;
  private opponentEnergyContainer!: Container;
  private opponentDiscardPileContainer!: Container;
  private opponentDeckRemainingContainer!: Container;
  private turnIndicatorContainer!: Container;
  private actionLogContainer!: Container;
  
  // Card interaction
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  private handCards: Container[] = [];
  private characterCards: Map<string, Container> = new Map();
  
  // Game flow control
  private mainPhaseResolve?: () => void;
  
  // Battle log state
  private battleLogEntries: Array<{text: string, type: 'action' | 'damage' | 'heal' | 'info', timestamp: number}> = [];
  
  // Layout constants - made more responsive
  private readonly CARD_WIDTH = 70;
  private readonly CARD_HEIGHT = 100;
  private readonly CHARACTER_CARD_WIDTH = 100;
  private readonly CHARACTER_CARD_HEIGHT = 140;
  private readonly HAND_CARD_WIDTH = 50;
  private readonly HAND_CARD_HEIGHT = 70;

  constructor(battleId?: string) {
    super();
    
    this.battleId = battleId || 'mock-battle-001';
    this.container = new Container();
    this.addChild(this.container);
    
    this.setupLayout();
    this.initializeBattle();
  }

  private setupLayout(): void {
    // Create layout matching the reference image design
    this.createBackground();
    
    // Layout dimensions based on reference image - more compact
    const statusBarHeight = 40;
    const handAreaHeight = 80;
    const playerAreaHeight = 100;
    const battleLogHeight = 120;
    const discardAreaHeight = 40;
    const endTurnHeight = 60;
    
    const padding = 8;
    let currentY = padding;
    
    // 1. Top status bar (Energy, Cards, Trash) - replaces opponent energy area
    this.createNewStatusBar(currentY, statusBarHeight, 'top');
    this.opponentEnergyContainer = this.lastCreatedContainer;
    currentY += statusBarHeight + padding;
    
    // 2. Opponent hand area - enhanced version
    this.createNewHandArea(currentY, handAreaHeight, true);
    this.opponentHandContainer = this.lastCreatedContainer;
    currentY += handAreaHeight + padding;
    
    // 3. Opponent player area (avatar + character cards)
    this.createNewPlayerArea(currentY, playerAreaHeight, true);
    this.player2CharactersContainer = this.lastCreatedContainer;
    currentY += playerAreaHeight + padding;
    
    // 4. Battle log (center area) - enhanced version
    this.createNewBattleLogArea(currentY, battleLogHeight);
    this.actionLogContainer = this.lastCreatedContainer;
    currentY += battleLogHeight + padding;
    
    // 5. Player area (avatar + character cards)  
    this.createNewPlayerArea(currentY, playerAreaHeight, false);
    this.player1CharactersContainer = this.lastCreatedContainer;
    currentY += playerAreaHeight + padding;
    
    // 6. Player hand area - enhanced version
    this.createNewHandArea(currentY, handAreaHeight, false);
    this.handContainer = this.lastCreatedContainer;
    currentY += handAreaHeight + padding;
    
    // 7. Discard area - matching reference
    this.createNewDiscardArea(currentY, discardAreaHeight);
    this.discardPileContainer = this.lastCreatedContainer;
    currentY += discardAreaHeight + padding;
    
    // 8. Bottom status bar (same as top)
    this.createNewStatusBar(currentY, statusBarHeight, 'bottom');
    this.energyContainer = this.lastCreatedContainer;
    currentY += statusBarHeight + padding;
    
    // 9. End Turn button - large button at bottom
    this.createNewEndTurnButton(currentY, endTurnHeight);
    
    // Setup remaining containers for compatibility
    this.battlefieldContainer = new Container();
    this.deckRemainingContainer = new Container();
    this.opponentDeckRemainingContainer = new Container();
    this.opponentDiscardPileContainer = new Container();
    this.turnIndicatorContainer = new Container();
    
    // Setup stage event handlers for drag and drop
    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onCardDragEnd, this);
    app.stage.on('pointerupoutside', this.onCardDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  // Helper property to store last created container for assignment
  private lastCreatedContainer!: Container;

  // New layout methods for reference image design
  private createNewStatusBar(y: number, height: number, position: 'top' | 'bottom'): void {
    const statusContainer = new Container();
    statusContainer.y = y;
    
    // Dark rounded background like in reference image
    const bg = new Graphics();
    bg.roundRect(10, 0, this.gameWidth - 20, height, 12)
      .fill(0x2d2d2d); // Dark gray background
    
    // Energy indicator (⚡5)
    const energyText = new Text({
      text: '⚡ 5',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: Colors.ACCENT_WARNING, // Yellow/orange for energy
        fontWeight: 'bold'
      }
    });
    energyText.x = 25;
    energyText.y = height / 2 - 10;
    
    // Cards indicator (🃏12)  
    const cardsText = new Text({
      text: '🃏 12',
      style: {
        fontFamily: 'Arial', 
        fontSize: 16,
        fill: Colors.ACCENT_PRIMARY, // Cyan for cards
        fontWeight: 'bold'
      }
    });
    cardsText.x = this.gameWidth / 2 - 25;
    cardsText.y = height / 2 - 10;
    
    // Trash indicator (🗑️3)
    const trashText = new Text({
      text: '🗑️ 3',
      style: {
        fontFamily: 'Arial',
        fontSize: 16, 
        fill: Colors.TEXT_SECONDARY, // Light gray for trash
        fontWeight: 'bold'
      }
    });
    trashText.x = this.gameWidth - 80;
    trashText.y = height / 2 - 10;
    
    statusContainer.addChild(bg, energyText, cardsText, trashText);
    this.container.addChild(statusContainer);
    this.lastCreatedContainer = statusContainer;
  }
  
  private createNewHandArea(y: number, height: number, isOpponent: boolean): void {
    const handContainer = new Container();
    handContainer.y = y;
    
    // Light beige background
    const bg = new Graphics();
    bg.roundRect(10, 0, this.gameWidth - 20, height, 12)
      .fill(0xf5e6d3); // Light beige like in reference
    
    // Create 5 card slots
    const cardWidth = 50;
    const cardHeight = 70;
    const spacing = 8;
    const totalWidth = (cardWidth * 5) + (spacing * 4);
    const startX = (this.gameWidth - totalWidth) / 2;
    
    if (isOpponent) {
      // Opponent cards - show first 3 slots with cards
      for (let i = 0; i < 5; i++) {
        const cardSlot = new Graphics();
        const x = startX + (i * (cardWidth + spacing));
        
        if (i < 3) {
          // Show opponent cards (first 3 slots have cards)
          cardSlot.roundRect(x, 5, cardWidth, cardHeight, 8)
            .fill(Colors.CARD_BACKGROUND)
            .stroke({ width: 2, color: Colors.CARD_BORDER });
        } else {
          // Empty slots
          cardSlot.roundRect(x, 5, cardWidth, cardHeight, 8)
            .stroke({ width: 2, color: Colors.CARD_BORDER, alpha: 0.3 });
        }
        
        handContainer.addChild(cardSlot);
      }
    } else {
      // Player cards - specific card types from reference
      const cardTypes = [
        { name: 'Fireball', color: 0xff6b35, icon: '🔥' },
        { name: 'Heal', color: 0x66bb6a, icon: '✨' },
        { name: 'LOCKED', color: 0x888888, icon: '🔒' },
        { name: 'Shield', color: 0x42a5f5, icon: '🛡️' },
        { name: 'Swap', color: 0xab47bc, icon: '🔄' }
      ];
      
      cardTypes.forEach((cardType, i) => {
        const cardSlot = new Graphics();
        const x = startX + (i * (cardWidth + spacing));
        
        // Create card with specific color
        cardSlot.roundRect(x, 5, cardWidth, cardHeight, 8)
          .fill(cardType.color)
          .stroke({ width: 2, color: Colors.CARD_BORDER });
        
        // Card icon and name
        const iconText = new Text({
          text: cardType.icon,
          style: {
            fontFamily: 'Arial',
            fontSize: 16,
            align: 'center'
          }
        });
        iconText.x = x + cardWidth / 2 - 8;
        iconText.y = 15;
        
        const nameText = new Text({
          text: cardType.name,
          style: {
            fontFamily: 'Arial',
            fontSize: 8,
            fill: 0xffffff,
            fontWeight: 'bold',
            align: 'center'
          }
        });
        nameText.x = x + cardWidth / 2 - (nameText.width / 2);
        nameText.y = 55;
        
        handContainer.addChild(cardSlot, iconText, nameText);
      });
    }
    
    handContainer.addChild(bg);
    this.container.addChild(handContainer);
    this.lastCreatedContainer = handContainer;
  }
  
  private createNewPlayerArea(y: number, height: number, isOpponent: boolean): void {
    const playerContainer = new Container();
    playerContainer.y = y;
    
    // Background color based on player
    const bgColor = isOpponent ? 0xa0522d : 0xdeb887; // Brown vs Light brown
    const bg = new Graphics();
    bg.roundRect(10, 0, this.gameWidth - 20, height, 12)
      .fill(bgColor);
    
    // Player avatar (white circle)
    const avatar = new Graphics();
    avatar.circle(40, height / 2, 20)
      .fill(0xffffff)
      .stroke({ width: 2, color: 0x000000 });
    
    // Player name
    const nameText = new Text({
      text: isOpponent ? 'Opponent' : 'You',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: isOpponent ? 0xffffff : 0x333333,
        fontWeight: 'bold'
      }
    });
    nameText.x = 70;
    nameText.y = height / 2 - 10;
    
    // Character cards
    const cardWidth = 50;
    const cardHeight = 70;
    const cardSpacing = 15;
    const cardsStartX = this.gameWidth - 250;
    
    for (let i = 0; i < 3; i++) {
      const characterCard = new Graphics();
      const x = cardsStartX + (i * (cardWidth + cardSpacing));
      
      if (!isOpponent && i === 2) {
        // Selected card for player (purple background like in reference)
        characterCard.roundRect(x, 15, cardWidth, cardHeight, 8)
          .fill(0x9966cc) // Purple for selected
          .stroke({ width: 3, color: Colors.CARD_SELECTED });
      } else if (isOpponent) {
        // Opponent cards
        characterCard.roundRect(x, 15, cardWidth, cardHeight, 8)
          .fill(Colors.RARITY_COMMON)
          .stroke({ width: 2, color: Colors.CARD_BORDER });
      } else {
        // Regular player cards
        characterCard.roundRect(x, 15, cardWidth, cardHeight, 8)
          .fill(0xffffff)
          .stroke({ width: 2, color: Colors.CARD_BORDER });
      }
        
      playerContainer.addChild(characterCard);
    }
    
    playerContainer.addChild(bg, avatar, nameText);
    this.container.addChild(playerContainer);
    this.lastCreatedContainer = playerContainer;
  }
  
  private createNewBattleLogArea(y: number, height: number): void {
    const logContainer = new Container();
    logContainer.y = y;
    
    // Light background
    const bg = new Graphics();
    bg.roundRect(10, 0, this.gameWidth - 20, height, 12)
      .fill(0xffffff)
      .stroke({ width: 2, color: 0xe0e0e0 });
    
    // "DISCARD" header (matching reference)
    const discardHeader = new Graphics();
    discardHeader.roundRect(20, -15, 80, 25, 12)
      .fill(0xffd700)
      .stroke({ width: 2, color: 0xffa500 });
      
    const discardText = new Text({
      text: 'DISCARD',
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0x8b4513,
        fontWeight: 'bold'
      }
    });
    discardText.x = 35;
    discardText.y = -12;
    
    // Battle log messages (matching reference)
    const logMessages = [
      '🚀 BTC attacked ETH for 230 dmg!',
      '💚 ETH healed 100',
      '🛡️ BNB blocked DOGE'
    ];
    
    logMessages.forEach((message, index) => {
      const messageText = new Text({
        text: message,
        style: {
          fontFamily: 'Arial',
          fontSize: 14,
          fill: 0x333333,
          fontWeight: 'bold'
        }
      });
      messageText.x = 25;
      messageText.y = 20 + (index * 25);
      logContainer.addChild(messageText);
    });
    
    logContainer.addChild(bg, discardHeader, discardText);
    this.container.addChild(logContainer);
    this.lastCreatedContainer = logContainer;
  }
  
  private createNewDiscardArea(y: number, height: number): void {
    const discardContainer = new Container();
    discardContainer.y = y;
    
    // "DISCARD" area like in reference
    const discardBox = new Graphics();
    discardBox.roundRect(10, 0, this.gameWidth - 20, height, 12)
      .stroke({ width: 2, color: 0xffa500 });
    
    const discardText = new Text({
      text: '🗑️ DISCARD',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xffa500,
        fontWeight: 'bold'
      }
    });
    discardText.x = this.gameWidth / 2 - 50;
    discardText.y = height / 2 - 10;
    
    discardContainer.addChild(discardBox, discardText);
    this.container.addChild(discardContainer);
    this.lastCreatedContainer = discardContainer;
  }
  
  private createNewEndTurnButton(y: number, height: number): void {
    const buttonContainer = new Container();
    buttonContainer.y = y;
    
    const buttonWidth = this.gameWidth - 40;
    
    // Large orange button matching reference
    const buttonBg = new Graphics();
    buttonBg.roundRect(20, 0, buttonWidth, height, 15)
      .fill(Colors.ACCENT_SECONDARY) // Bright orange-red
      .stroke({ width: 3, color: Colors.ACCENT_PRIMARY });
    
    const buttonText = new Text({
      text: 'END TURN',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        fontWeight: 'bold',
        align: 'center'
      }
    });
    buttonText.x = this.gameWidth / 2 - buttonText.width / 2;
    buttonText.y = height / 2 - 15;
    
    buttonContainer.addChild(buttonBg, buttonText);
    
    // Make interactive
    buttonContainer.interactive = true;
    buttonContainer.cursor = 'pointer';
    
    buttonContainer.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.roundRect(20, 0, buttonWidth, height, 15)
        .fill(Colors.ACCENT_WARNING)
        .stroke({ width: 3, color: Colors.ACCENT_PRIMARY });
    });
    
    buttonContainer.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.roundRect(20, 0, buttonWidth, height, 15)
        .fill(Colors.ACCENT_SECONDARY)
        .stroke({ width: 3, color: Colors.ACCENT_PRIMARY });
    });
    
    buttonContainer.on('pointertap', () => {
      if (this.mainPhaseResolve) {
        this.mainPhaseResolve();
        this.mainPhaseResolve = undefined;
      }
    });
    
    this.container.addChild(buttonContainer);
  }

  // Helper methods for positioning each area
  private createOpponentEnergyDeckDiscard(y: number, height: number) {
    // ...use y and height for positioning...
    this.opponentEnergyContainer = new Container();
    this.opponentDeckRemainingContainer = new Container();
    this.opponentDiscardPileContainer = new Container();
    const elementWidth = 80;
    const spacing = this.STANDARD_SPACING;
    const totalWidth = (elementWidth * 3) + (spacing * 2);
    const startX = (this.gameWidth - totalWidth) / 2;
    this.createEnergyDeckDiscardUI(
      { x: startX, y },
      {
        energy: this.opponentEnergyContainer,
        deck: this.opponentDeckRemainingContainer,
        discard: this.opponentDiscardPileContainer
      },
      {
        elementWidth,
        elementHeight: height,
        spacing,
        isPlayerDiscard: false
      }
    );
  }

  private createOpponentHandArea(y: number, height: number) {
    this.opponentHandContainer = new Container();
    this.createHandAreaUI(
      this.opponentHandContainer,
      { y },
      { height }
    );
  }

  private createBattlefield(y: number, height: number) {
    this.battlefieldContainer = new Container();
    // Divide battlefield into 3 sections: opponent chars, log, player chars
    const sectionHeight = height / 3;
    this.player2CharactersContainer = new Container();
    this.player2CharactersContainer.y = y;
    this.createActionLogInCenter(y + sectionHeight, sectionHeight - 20);
    this.player1CharactersContainer = new Container();
    this.player1CharactersContainer.y = y + sectionHeight * 2;
    this.battlefieldContainer.addChild(this.player2CharactersContainer);
    this.battlefieldContainer.addChild(this.player1CharactersContainer);
    this.container.addChild(this.battlefieldContainer);
  }

  private createHandArea(y: number, height: number) {
    this.handContainer = new Container();
    this.createHandAreaUI(
      this.handContainer,
      { y },
      { height }
    );
  }

  private createPlayerEnergyDeckDiscard(y: number, height: number) {
    this.energyContainer = new Container();
    this.deckRemainingContainer = new Container();
    this.discardPileContainer = new Container();
    const elementWidth = 80;
    const spacing = this.STANDARD_SPACING;
    const totalWidth = (elementWidth * 3) + (spacing * 2);
    const startX = (this.gameWidth - totalWidth) / 2;
    this.createEnergyDeckDiscardUI(
      { x: startX, y },
      {
        energy: this.energyContainer,
        deck: this.deckRemainingContainer,
        discard: this.discardPileContainer
      },
      {
        elementWidth,
        elementHeight: height,
        spacing,
        isPlayerDiscard: true
      }
    );
  }

  private createEndTurnButtonAtBottom(bottomPadding: number) {
    // This method creates the end turn button layout, but the actual button
    // will be created dynamically during the main phase
    this.turnIndicatorContainer = new Container();
    this.turnIndicatorContainer.visible = false;
    this.turnIndicatorContainer.y = this.gameHeight - bottomPadding - 44; // 44 is button height
    this.container.addChild(this.turnIndicatorContainer);
  }

  private createBackground(): void {
    this.backgroundContainer = new Container();
    
    // Main background
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill(Gradients.BACKGROUND_DARK);
    
    // Create distinct zones for player and opponent
    const zoneHeight = this.gameHeight * 0.4; // Each zone takes 40% of screen
    const middleZone = this.gameHeight - (zoneHeight * 2); // Middle area for shared elements
    
    // Player zone (bottom)
    const playerZone = new Graphics();
    playerZone.rect(0, this.gameHeight - zoneHeight, this.gameWidth, zoneHeight)
      .fill({ color: Colors.ZONE_PLAYER, alpha: 0.3 })
      .stroke({ width: 2, color: Colors.TEAM_ALLY, alpha: 0.5 });
    
    // Opponent zone (top)
    const opponentZone = new Graphics();
    opponentZone.rect(0, 0, this.gameWidth, zoneHeight)
      .fill({ color: Colors.ZONE_OPPONENT, alpha: 0.3 })
      .stroke({ width: 2, color: Colors.TEAM_ENEMY, alpha: 0.5 });
    
    // Add subtle zone labels
    const playerLabel = new Text({
      text: 'PLAYER ZONE',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEAM_ALLY,
        align: 'center'
      }
    });
    playerLabel.alpha = 0.6;
    playerLabel.anchor.set(0.5);
    playerLabel.x = this.gameWidth / 2;
    playerLabel.y = this.gameHeight - zoneHeight + 15;
    
    const opponentLabel = new Text({
      text: 'OPPONENT ZONE',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEAM_ENEMY,
        align: 'center'
      }
    });
    opponentLabel.alpha = 0.6;
    opponentLabel.anchor.set(0.5);
    opponentLabel.x = this.gameWidth / 2;
    opponentLabel.y = zoneHeight - 15;
    
    this.backgroundContainer.addChild(bg, opponentZone, playerZone, opponentLabel, playerLabel);
    this.container.addChild(this.backgroundContainer);
  }

  private createEnergyDeckDiscardUI(
    position: { x: number; y: number },
    containers: { 
      energy: Container; 
      deck: Container; 
      discard: Container; 
    },
    config: {
      elementWidth: number;
      elementHeight: number;
      spacing: number;
      isPlayerDiscard?: boolean;
    }
  ): void {
    const { elementWidth, elementHeight, spacing, isPlayerDiscard = false } = config;
    const { x: startX, y: yPosition } = position;
    
    // Position energy container on the left
    containers.energy.x = startX;
    containers.energy.y = yPosition;
    
    // Create energy background and label with enhanced visibility
    const energyBg = new Graphics();
    energyBg.roundRect(0, 0, elementWidth, elementHeight, 8)
      .fill({ color: Colors.UI_BACKGROUND, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.STAT_ENERGY }); // Green border for energy
    
    // Add inner glow for energy indicator
    const energyGlow = new Graphics();
    energyGlow.roundRect(2, 2, elementWidth - 4, elementHeight - 4, 6)
      .fill({ color: Colors.STAT_ENERGY, alpha: 0.2 });
    
    const energyLabel = new Text({
      text: '⚡ Energy: 0',
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(12, elementWidth * 0.15), // Responsive font size
        fontWeight: 'bold',
        fill: Colors.STAT_ENERGY, // Green color for energy
        align: 'center'
      }
    });
    energyLabel.anchor.set(0.5);
    energyLabel.x = elementWidth / 2;
    energyLabel.y = elementHeight / 2;
    
    containers.energy.addChild(energyGlow, energyBg, energyLabel);
    
    // Position deck container in the center
    containers.deck.x = startX + elementWidth + spacing;
    containers.deck.y = yPosition;
    
    // Create deck background and label
    const deckBg = new Graphics();
    deckBg.roundRect(0, 0, elementWidth, elementHeight, 8)
      .fill(Colors.CARD_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const deckLabel = new Text({
      text: 'DECK',
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    deckLabel.anchor.set(0.5);
    deckLabel.x = elementWidth / 2;
    deckLabel.y = elementHeight / 2 - 8;
    
    const deckCount = new Text({
      text: '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    deckCount.anchor.set(0.5);
    deckCount.x = elementWidth / 2;
    deckCount.y = elementHeight / 2 + 8;
    
    containers.deck.addChild(deckBg, deckLabel, deckCount);
    
    // Position discard container on the right
    containers.discard.x = startX + (elementWidth + spacing) * 2;
    containers.discard.y = yPosition;
    
    // Create discard background with optional enhanced styling for player
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, elementWidth, elementHeight, 8)
      .fill(Colors.CARD_DISCARD)
      .stroke({ width: isPlayerDiscard ? 3 : 2, color: Colors.UI_BORDER });
  
    const discardLabel = new Text({
      text: 'DISCARD PILE',
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    discardLabel.anchor.set(0.5);
    discardLabel.x = elementWidth / 2;
    discardLabel.y = elementHeight / 2;
    
    containers.discard.addChild(discardBg, discardLabel);
    
    // Add all containers to the main container
    this.container.addChild(containers.energy);
    this.container.addChild(containers.deck);
    this.container.addChild(containers.discard);
  }

  private createHandAreaUI(
    container: Container,
    position: { y: number },
    config: { height: number }
  ): void {
    const { height } = config;
    const { y: yPosition } = position;
    
    // Hand background
    const handBg = new Graphics();
    handBg.roundRect(0, 0, this.gameWidth, height, 10)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    container.addChild(handBg);
    container.y = yPosition;
    
    this.container.addChild(container);
  }


  private createActionLogInCenter(logY: number, logHeight: number): void {
    this.actionLogContainer = new Container();
    
    // Center the action log horizontally and use provided position
    const logWidth = Math.min(350, this.gameWidth - (this.STANDARD_PADDING * 2));
    
    const logBg = new Graphics();
    logBg.roundRect(0, 0, logWidth, logHeight, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // Add title for battle log with enhanced styling
    const logTitle = new Text({
      text: '⚔️ BATTLE LOG',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.ACCENT_PRIMARY, // Use bright cyan for title
        align: 'center'
      }
    });
    logTitle.anchor.set(0.5, 0);
    logTitle.x = logWidth / 2;
    logTitle.y = 8;
    
    this.actionLogContainer.addChild(logBg, logTitle);
    this.actionLogContainer.x = (this.gameWidth - logWidth) / 2;
    this.actionLogContainer.y = logY;
    
    // Add some sample log entries to demonstrate the visual improvements
    this.addBattleLogEntry("Battle begins!", 'info');
    this.addBattleLogEntry("Player draws cards", 'action');
    this.addBattleLogEntry("Ready for combat!", 'info');
    
    this.container.addChild(this.actionLogContainer);
  }

  // Enhanced battle log system with visual improvements
  private addBattleLogEntry(text: string, type: 'action' | 'damage' | 'heal' | 'info'): void {
    const entry = {
      text,
      type,
      timestamp: Date.now()
    };
    
    this.battleLogEntries.push(entry);
    
    // Keep only last 3 entries for space
    if (this.battleLogEntries.length > 3) {
      this.battleLogEntries.shift();
    }
    
    this.updateBattleLogDisplay();
  }
  
  private updateBattleLogDisplay(): void {
    if (!this.actionLogContainer) return;
    
    // Remove existing log entry texts (keep background and title)
    const entriesToRemove = this.actionLogContainer.children.filter(child => 
      child instanceof Text && (child as any).isLogEntry
    );
    entriesToRemove.forEach(entry => this.actionLogContainer.removeChild(entry));
    
    // Add current entries with enhanced visuals
    this.battleLogEntries.forEach((entry, index) => {
      const yPos = 30 + (index * 20); // Start below title
      
      // Get icon and color based on entry type
      const { icon, color } = this.getLogEntryStyle(entry.type);
      
      const logText = new Text({
        text: `${icon} ${entry.text}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fontWeight: 'bold',
          fill: color,
          align: 'left'
        }
      });
      
      logText.x = 10;
      logText.y = yPos;
      (logText as any).isLogEntry = true; // Mark for cleanup
      
      // Add fade-in animation for new entries
      if (index === this.battleLogEntries.length - 1) {
        logText.alpha = 0;
        gsap.to(logText, {
          alpha: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
        
        // Add subtle glow effect for new entries
        gsap.to(logText.scale, {
          x: 1.1,
          y: 1.1,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut'
        });
      }
      
      this.actionLogContainer.addChild(logText);
    });
  }
  
  private getLogEntryStyle(type: 'action' | 'damage' | 'heal' | 'info'): {icon: string, color: string} {
    switch (type) {
      case 'action':
        return { icon: '⚡', color: Colors.ACCENT_WARNING };
      case 'damage':
        return { icon: '💥', color: Colors.STAT_HEALTH };
      case 'heal':
        return { icon: '💚', color: Colors.ACCENT_SUCCESS };
      case 'info':
      default:
        return { icon: 'ℹ️', color: Colors.ACCENT_PRIMARY };
    }
  }


  private async initializeBattle(): Promise<void> {
    try {
      // Match Setup: Load battle state
      await this.setupMatch();
      
      if (this.battleState && this.battleState.players) {
        this.setupCharacters();
        this.updateUI();
        this.startGameLoop();
      } else {
        console.warn('Battle state is invalid, using fallback layout');
        this.createFallbackUI();
      }
    } catch (error) {
      console.error('Failed to initialize battle:', error);
      this.createFallbackUI();
    }
  }

  private async setupMatch(): Promise<void> {
    // Load initial battle state without starting a turn
    const response = await battleApi.getBattleState(this.battleId);
    this.battleState = response.data;
    
    console.log('Match setup complete with battle state:', this.battleState);
  }

  private async startGameLoop(): Promise<void> {
    // Main game loop following the requested flow
    while (this.battleState && this.battleState.status === 'ongoing') {
      // Turn Start (effects)
      await this.processTurnStart();
      
      // Draw Phase
      await this.processDrawPhase();
      
      // Main Phase (actions, discard)
      await this.processMainPhase();
      
      // End Turn (effects)  
      await this.processEndTurn();
      
      // AI Turn (auto) - if next player is AI
      if (this.battleState.current_player === 2) {
        await this.processAITurn();
      }
      
      // Check win/lose
      if (this.checkGameEnd()) {
        break;
      }
    }
  }

  private async processTurnStart(): Promise<void> {
    this.currentPhase = 'start_turn';
    this.isAnimating = true;
    this.updateTurnIndicator();
    
    console.log(`Turn Start - Player ${this.battleState?.current_player}`);
    
    // Add battle log entry
    const playerName = this.battleState?.current_player === 1 ? "Player" : "Opponent";
    this.addBattleLogEntry(`${playerName}'s turn begins`, 'info');
    
    try {
      const response = await battleApi.startTurn(this.battleId);
      if (response.success && response.data) {
        // response.data is CardBattleLog[], not battleState
        const logs = response.data;
        console.log('Turn start logs:', logs);
        
        // Update battle state from the logs if available
        if (logs.length > 0 && logs[0].after_state) {
          const afterState = logs[0].after_state;
          if (afterState.characters && this.battleState) {
            this.battleState.players.forEach(player => {
              const teamCharacters = afterState.characters!.filter((c: any) => 
                c.team === player.team
              );
              if (teamCharacters.length > 0) {
                player.characters = teamCharacters;
              }
            });
          }
        }
        
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to process turn start:', error);
    }
    
    // Show turn start effects animation
    await this.animateTurnStartEffects();
    this.isAnimating = false;
  }

  private async processDrawPhase(): Promise<void> {
    if (!this.battleState) return;
    
    this.currentPhase = 'draw_phase';
    this.isAnimating = true;
    this.updateTurnIndicator();
    
    console.log('Draw Phase');
    
    // Add battle log entry
    this.addBattleLogEntry("Drawing cards", 'action');
    
    const turnAction: TurnAction = {
      type: 'draw_card',
      player_team: this.battleState.current_player
    };
    
    try {
      const response = await battleApi.drawCards(this.battleId, turnAction);
      if (response.success && response.data) {
        // response.data is CardBattleLog[], not battleState
        const logs = response.data;
        console.log('Draw phase logs:', logs);
        
        // Update hand cards from drawn_cards if available
        if (logs.length > 0 && logs[0].drawn_cards) {
          const drawnCards = logs[0].drawn_cards;
          console.log('Cards drawn:', drawnCards);
          
          // Add cards to player's hand in battleState
          if (this.battleState) {
            const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
            if (currentPlayer) {
              currentPlayer.deck.hand_cards = currentPlayer.deck.hand_cards || [];
              drawnCards.forEach((card: any) => {
                currentPlayer.deck.hand_cards.push({ card: card as Card });
              });
            }
          }
        }
        
        this.updateUI();
        await this.animateCardDraw();
      }
    } catch (error) {
      console.error('Failed to draw cards:', error);
    }
    
    this.isAnimating = false;
  }

  private async processMainPhase(): Promise<void> {
    this.currentPhase = 'main_phase';
    this.updateTurnIndicator();
    
    console.log('Main Phase - Player can take actions');
    
    // For player 1: Enable interactions and wait for player input
    if (this.battleState?.current_player === 1) {
      this.createEndTurnButton();
      
      // Return Promise that resolves when player ends turn
      return new Promise((resolve) => {
        this.mainPhaseResolve = resolve;
      });
    } else {
      // For AI: Skip main phase as AI will act in AI turn
      return Promise.resolve();
    }
  }

  private async processEndTurn(): Promise<void> {
    this.currentPhase = 'end_turn';
    this.isAnimating = true;
    this.updateTurnIndicator();
    
    console.log('End Turn - Processing end turn effects');
    
    const turnAction: TurnAction = {
      type: 'end_turn',
      player_team: this.battleState!.current_player
    };
    
    try {
      const response = await battleApi.endTurn(this.battleId, turnAction);
      if (response.success && response.data) {
        // response.data is CardBattleLog[], not battleState
        const logs = response.data;
        console.log('End turn logs:', logs);
        
        // Update battle state from the logs if available
        if (logs.length > 0 && logs[0].after_state && this.battleState) {
          const afterState = logs[0].after_state;
          if (afterState.current_player !== undefined) {
            this.battleState.current_player = afterState.current_player;
          }
          if (afterState.turn !== undefined) {
            this.battleState.current_turn = afterState.turn;
          }
          if (afterState.characters) {
            this.battleState.players.forEach(player => {
              const teamCharacters = afterState.characters!.filter((c: any) => 
                c.team === player.team
              );
              if (teamCharacters.length > 0) {
                player.characters = teamCharacters;
              }
            });
          }
        }
        
        this.updateUI();
        await this.animateEndTurnEffects();
      }
    } catch (error) {
      console.error('Failed to process end turn:', error);
    }
    
    this.isAnimating = false;
  }

  private async processAITurn(): Promise<void> {
    console.log('AI Turn - Processing AI actions');
    
    this.isAnimating = true;
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // AI can play cards, discard cards, etc.
    await this.simulateAIActions();
    
    this.isAnimating = false;
  }

  private async simulateAIActions(): Promise<void> {
    if (!this.battleState || !this.battleState.players) return;
    
    // Simulate AI playing 1-2 cards randomly
    const aiPlayer = this.battleState.players.find(p => p.team === 2);
    if (!aiPlayer || !aiPlayer.deck || !aiPlayer.characters) return;
    
    const handCards = aiPlayer.deck.hand_cards;
    const numActions = Math.min(2, handCards.length);
    
    for (let i = 0; i < numActions; i++) {
      const randomCard = handCards[Math.floor(Math.random() * handCards.length)];
      const randomCharacter = aiPlayer.characters[Math.floor(Math.random() * Math.min(3, aiPlayer.characters.length))];
      
      if (randomCard.card && randomCharacter) {
        const turnAction: TurnAction = {
          type: 'play_card',
          player_team: 2,
          card_id: randomCard.card.id,
          character_id: randomCharacter.id
        };
        
        try {
          const response = await battleApi.playCard(this.battleId, turnAction);
          if (response.success && response.data) {
            this.battleState = response.data;
            this.updateUI();
            
            // Animate AI card play
            console.log(`AI played card: ${randomCard.card.name} on character: ${randomCharacter.name}`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error('AI action failed:', error);
        }
      }
    }
  }

  private checkGameEnd(): boolean {
    if (!this.battleState || !this.battleState.players) return false;
    
    if (this.battleState.status === 'completed') {
      this.showBattleResult();
      return true;
    }
    
    // Check if any team has no characters with HP > 0
    for (const player of this.battleState.players) {
      if (!player.characters) continue;
      
      const aliveCharacters = player.characters.filter(c => c.hp > 0);
      if (aliveCharacters.length === 0) {
        this.battleState.status = 'completed';
        this.battleState.winner_team = player.team === 1 ? 2 : 1;
        this.showBattleResult();
        return true;
      }
    }
    
    return false;
  }

  private async animateTurnStartEffects(): Promise<void> {
    // Show any turn start effects (buffs, debuffs, etc.)
    const currentPlayerCards = this.getCurrentPlayerCharacterCards();
    
    for (const card of currentPlayerCards) {
      // Animate a gentle glow to indicate turn start
      await gsap.to(card, {
        alpha: 0.7,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  }

  private async animateEndTurnEffects(): Promise<void> {
    // Show any end turn effects (poison, regeneration, etc.)
    const allCharacterCards = Array.from(this.characterCards.values());
    
    for (const card of allCharacterCards) {
      // Animate a subtle pulse to indicate end turn processing
      await gsap.to(card.scale, {
        x: 1.05,
        y: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  }

  private getCurrentPlayerCharacterCards(): Container[] {
    if (!this.battleState || !this.battleState.players) return [];
    
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (!currentPlayer || !currentPlayer.characters) return [];
    
    return currentPlayer.characters
      .slice(0, 3)
      .map(char => this.characterCards.get(char.id))
      .filter(card => card !== undefined) as Container[];
  }

  private createFallbackUI(): void {
    // Create a simple fallback UI to show the scene is working
    const fallbackContainer = new Container();
    
    const titleText = new Text({
      text: 'Card Battle Scene',
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    titleText.anchor.set(0.5);
    titleText.x = this.gameWidth / 2;
    titleText.y = this.gameHeight / 2 - 50;
    
    const statusText = new Text({
      text: 'Waiting for battle data...\nBattle ID: ' + this.battleId,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    statusText.anchor.set(0.5);
    statusText.x = this.gameWidth / 2;
    statusText.y = this.gameHeight / 2;
    
    // Add back button
    const backButton = new Container();
    const backBg = new Graphics();
    backBg.roundRect(0, 0, 120, 40, 8)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const backText = new Text({
      text: 'BACK TO HOME',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    backText.anchor.set(0.5);
    backText.x = 60;
    backText.y = 20;
    
    backButton.addChild(backBg, backText);
    backButton.x = this.gameWidth / 2 - 60;
    backButton.y = this.gameHeight / 2 + 50;
    
    backButton.interactive = true;
    backButton.cursor = 'pointer';
    backButton.on('pointertap', () => {
      navigation.showScreen(HomeScene);
    });
    
    fallbackContainer.addChild(titleText, statusText, backButton);
    this.container.addChild(fallbackContainer);
  }

  private setupCharacters(): void {
    if (!this.battleState) return;
    
    // Clear existing character cards
    this.characterCards.clear();
    this.player1CharactersContainer.removeChildren();
    this.player2CharactersContainer.removeChildren();
    
    const player1 = this.battleState.players.find(p => p.team === 1);
    const player2 = this.battleState.players.find(p => p.team === 2);
    
    if (player1) {
      this.createPlayerCharacters(player1, this.player1CharactersContainer, false);
    }
    
    if (player2) {
      this.createPlayerCharacters(player2, this.player2CharactersContainer, true);
    }
  }

  private createPlayerCharacters(player: CardBattlePlayerState, container: Container, isOpponent: boolean): void {
    const maxCharacters = Math.min(player.characters.length, 3); // Only show first 3 characters
    
    // Calculate responsive character card dimensions
    const availableWidth = this.gameWidth - (this.STANDARD_PADDING * 2);
    const minCardWidth = 80;
    const maxCardWidth = 120;
    const spacing = this.STANDARD_SPACING;
    
    // Calculate card width that fits all characters with proper spacing
    let cardWidth = (availableWidth - (spacing * (maxCharacters - 1))) / maxCharacters;
    cardWidth = Math.max(minCardWidth, Math.min(maxCardWidth, cardWidth));
    
    const cardHeight = cardWidth * 1.4; // Maintain aspect ratio
    const totalWidth = (cardWidth * maxCharacters) + (spacing * (maxCharacters - 1));
    const startX = (this.gameWidth - totalWidth) / 2;
    
    player.characters.forEach((character, index) => {
      if (index < maxCharacters) {
        const x = startX + index * (cardWidth + spacing);
        const y = 0;
        
        const characterCard = this.createHeroCard(
          character, 
          x, 
          y, 
          'preview', // Use preview size for better fit
          index,
          cardWidth
        );
        
        container.addChild(characterCard);
        this.characterCards.set(character.id, characterCard);
        
        // Make interactive for targeting
        if (!isOpponent) {
          this.makeCharacterCardInteractive(characterCard, character);
        }
      }
    });
  }

  private makeCharacterCardInteractive(card: Container, character: CardBattleCharacter): void {
    card.interactive = true;
    card.cursor = 'pointer';
    
    // Store character reference for future use
    (card as any).character = character;
    
    // Add card border for selection state
    const cardBorder = new Graphics();
    cardBorder.visible = false; // Initially hidden
    cardBorder.roundRect(-3, -3, card.width + 6, card.height + 6, 8)
      .stroke({ width: 3, color: Colors.CARD_SELECTED });
    card.addChildAt(cardBorder, 0); // Add as first child (background)
    (card as any).selectionBorder = cardBorder;
    
    // Enhanced hover effects with glow
    card.on('pointerover', () => {
      // Add glow effect
      gsap.to(card, {
        alpha: 0.9,
        duration: 0.2,
        ease: 'power2.out'
      });
      
      // Add subtle scale up
      gsap.to(card.scale, {
        x: 1.05,
        y: 1.05,
        duration: 0.2,
        ease: 'back.out(1.7)'
      });
      
      // Show hover border
      cardBorder.visible = true;
      cardBorder.clear();
      cardBorder.roundRect(-3, -3, card.width + 6, card.height + 6, 8)
        .stroke({ width: 3, color: Colors.CARD_HOVER });
    });
    
    card.on('pointerout', () => {
      // Reset effects
      gsap.to(card, {
        alpha: 1.0,
        duration: 0.2,
        ease: 'power2.out'
      });
      
      gsap.to(card.scale, {
        x: 1.0,
        y: 1.0,
        duration: 0.2,
        ease: 'power2.out'
      });
      
      // Hide hover border if not selected
      if (!(card as any).isSelected) {
        cardBorder.visible = false;
      }
    });
    
    // Add tap feedback
    card.on('pointerdown', () => {
      gsap.to(card.scale, {
        x: 0.95,
        y: 0.95,
        duration: 0.1,
        ease: 'power2.out'
      });
    });
    
    card.on('pointerup', () => {
      gsap.to(card.scale, {
        x: 1.05,
        y: 1.05,
        duration: 0.1,
        ease: 'power2.out'
      });
    });
    
    // Selection toggle
    card.on('pointertap', () => {
      const isSelected = (card as any).isSelected || false;
      (card as any).isSelected = !isSelected;
      
      if ((card as any).isSelected) {
        // Show selection border
        cardBorder.visible = true;
        cardBorder.clear();
        cardBorder.roundRect(-3, -3, card.width + 6, card.height + 6, 8)
          .stroke({ width: 4, color: Colors.CARD_SELECTED });
      } else {
        cardBorder.visible = false;
      }
    });
  }

  private updateUI(): void {
    this.updateEnergyIndicator();
    this.updateTurnIndicator();
    this.updateHandCards();
    this.updateOpponentHandCards();
    this.updateDeckRemaining();
    this.updateCharacterStates();
  }

  private updateOpponentHandCards(): void {
    if (!this.battleState || !this.opponentHandContainer) return;
    
    const opponentPlayer = this.battleState.players.find(p => p.team === 2);
    if (!opponentPlayer) return;
    
    // Update opponent hand card count display
    const handCardCount = opponentPlayer.deck.hand_cards.length;
    
    // Find and update the hand count text in the opponent hand container
    const handCountText = this.findTextInContainer(this.opponentHandContainer, (text) => 
      text.text.includes('Hand:') || !!text.text.match(/^\d+$/)
    );
    
    if (handCountText) {
      handCountText.text = `Hand: ${handCardCount}`;
    }
  }

  private updateCharacterStates(): void {
    if (!this.battleState) return;
    
    // Update all character displays with current stats
    this.battleState.players.forEach(player => {
      player.characters.forEach(character => {
        const characterCard = this.characterCards.get(character.id);
        if (characterCard) {
          this.updateCharacterCard(characterCard, character);
        }
      });
    });
  }

  private updateCharacterCard(card: Container, character: CardBattleCharacter): void {
    // Find the HP text element in the character card
    // The character card structure varies, but we need to update HP and status effects
    const hpText = this.findTextInContainer(card, (text) => text.text.includes('HP'));
    if (hpText) {
      hpText.text = `HP: ${character.hp}/${character.max_hp}`;
      
      // Update text color based on HP percentage
      const hpPercent = character.hp / character.max_hp;
      if (hpPercent <= 0.25) {
        hpText.style.fill = 0xff4444; // Red for critical HP
      } else if (hpPercent <= 0.5) {
        hpText.style.fill = 0xffaa44; // Orange for low HP
      } else {
        hpText.style.fill = Colors.TEXT_PRIMARY; // Normal color
      }
    }
  }

  private findTextInContainer(container: Container, predicate: (text: Text) => boolean): Text | null {
    for (const child of container.children) {
      if (child instanceof Text && predicate(child)) {
        return child;
      } else if (child instanceof Container) {
        const found = this.findTextInContainer(child, predicate);
        if (found) return found;
      }
    }
    return null;
  }

  private updateEnergyIndicator(): void {
    if (!this.battleState) return;
    
    // Update both player and opponent energy
    this.updateEnergyContainer(this.energyContainer, 1);
    this.updateEnergyContainer(this.opponentEnergyContainer, 2);
  }

  private updateEnergyContainer(container: Container, teamNumber: number): void {
    if (!container || !this.battleState) return;
    
    const player = this.battleState.players.find(p => p.team === teamNumber);
    if (!player) return;
    
    // Find the energy text (third child after glow and background)
    const energyText = container.children[2] as Text;
    if (energyText && energyText instanceof Text) {
      const oldText = energyText.text;
      const newText = `⚡ Energy: ${player.deck.current_energy}`;
      
      // Only animate if energy changed
      if (oldText !== newText) {
        energyText.text = newText;
        
        // Add energy change animation
        gsap.to(energyText.scale, {
          x: 1.2,
          y: 1.2,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut'
        });
        
        // Flash the container background to indicate change
        const energyBg = container.children[1] as Graphics;
        if (energyBg) {
          gsap.to(energyBg, {
            alpha: 0.7,
            duration: 0.1,
            yoyo: true,
            repeat: 3,
            ease: 'power2.inOut'
          });
        }
      }
    }
  }

  private updateDeckRemaining(): void {
    if (!this.battleState) return;
    
    // Update both player and opponent deck/discard counts
    this.updateDeckRemainingContainer(this.deckRemainingContainer, 1);
    this.updateDeckRemainingContainer(this.opponentDeckRemainingContainer, 2);
  }

  private updateDeckRemainingContainer(container: Container, teamNumber: number): void {
    if (!container || !this.battleState) return;
    
    const player = this.battleState.players.find(p => p.team === teamNumber);
    if (!player) return;
    
    // Calculate remaining cards (total deck minus hand and discard)
    const totalDeckCards = player.deck.deck_cards.length;
    const handCards = player.deck.hand_cards.length;
    const discardCards = player.deck.discard_cards.length;
    const remainingCards = totalDeckCards - handCards - discardCards;
    
    // Update the count label (it's the third child: bg, label, count)
    const countLabel = container.children[2] as Text;
    if (countLabel && countLabel instanceof Text) {
      countLabel.text = remainingCards.toString();
    }
  }

  private updateTurnIndicator(): void {
    if (!this.battleState) return;
    
    // Update the turn indicator by integrating it into the battle log
    // Since we removed the separate turn indicator container for the mobile layout
    const isPlayerTurn = this.battleState.current_player === 1;
    
    // We can add the turn info to the action log title instead of a separate container
    // This is more space-efficient for mobile
  }

  private updateHandCards(): void {
    if (!this.battleState) return;
    
    // Clear existing hand cards
    this.handCards.forEach(card => card.destroy());
    this.handCards = [];
    
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (!currentPlayer || this.battleState.current_player !== 1) return; // Only show player 1's hand
    
    const handCards = currentPlayer.deck.hand_cards;
    if (handCards.length === 0) return;
    
    // Calculate responsive card dimensions and spacing
    const availableWidth = this.gameWidth - (this.STANDARD_PADDING * 2);
    const maxCards = handCards.length;
    const minCardWidth = 40;
    const maxCardWidth = 60;
    const minSpacing = 5;
    const maxSpacing = 15;
    
    // Calculate optimal card width and spacing
    let cardWidth = (availableWidth - (minSpacing * (maxCards - 1))) / maxCards;
    cardWidth = Math.max(minCardWidth, Math.min(maxCardWidth, cardWidth));
    
    let cardSpacing = (availableWidth - (cardWidth * maxCards)) / Math.max(1, maxCards - 1);
    cardSpacing = Math.max(minSpacing, Math.min(maxSpacing, cardSpacing));
    
    const totalWidth = (cardWidth * maxCards) + (cardSpacing * Math.max(0, maxCards - 1));
    const startX = (this.gameWidth - totalWidth) / 2;
    
    handCards.forEach((cardInDeck, index) => {
      if (cardInDeck.card) {
        const x = startX + (index * (cardWidth + cardSpacing));
        const y = 10;
        
        const handCard = this.createHandCard(cardInDeck.card, x, y, cardWidth);
        this.handContainer.addChild(handCard);
        this.handCards.push(handCard);
      }
    });
  }

  private createHandCard(card: Card, x: number, y: number, cardWidth: number = this.HAND_CARD_WIDTH): Container {
    const cardHeight = cardWidth * 1.4; // Maintain aspect ratio
    
    // Calculate appropriate font scale for smaller hand cards
    const baseFontScale = Math.min(1.0, cardWidth / 80); // Scale down for smaller cards
    
    const cardContainer = this.createDeckCard(card, cardWidth, cardHeight, {
      fontScale: baseFontScale,
      showDescription: false, // Don't show description in hand cards for space
      enableHover: false // We handle hover effects ourselves for drag and drop
    });
    
    cardContainer.x = x;
    cardContainer.y = y;
    
    // Store card reference
    (cardContainer as any).card = card;
    
    // Make draggable
    this.makeHandCardDraggable(cardContainer, card);
    
    return cardContainer;
  }

  private makeHandCardDraggable(cardContainer: Container, card: Card): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'grab';
    
    // Add card border for states
    const cardBorder = new Graphics();
    cardBorder.visible = false;
    cardBorder.roundRect(-2, -2, cardContainer.width + 4, cardContainer.height + 4, 6)
      .stroke({ width: 2, color: Colors.CARD_HOVER });
    cardContainer.addChildAt(cardBorder, 0);
    (cardContainer as any).cardBorder = cardBorder;
    
    // Check if card is affordable/available
    const isAffordable = this.isCardAffordable(card);
    if (!isAffordable) {
      cardContainer.alpha = 0.6; // Slightly dim unaffordable cards
      cardContainer.tint = Colors.CARD_DISABLED;
    }
    
    cardContainer.on('pointerdown', (event: FederatedPointerEvent) => {
      if (isAffordable) {
        this.onCardDragStart(event, cardContainer, card);
      }
    });
    
    cardContainer.on('pointerover', () => {
      if (isAffordable) {
        // Enhanced hover effect
        gsap.to(cardContainer.scale, {
          x: 1.1,
          y: 1.1,
          duration: 0.2,
          ease: 'back.out(1.7)'
        });
        
        cardBorder.visible = true;
        cardBorder.clear();
        cardBorder.roundRect(-2, -2, cardContainer.width + 4, cardContainer.height + 4, 6)
          .stroke({ width: 2, color: Colors.CARD_AVAILABLE });
      } else {
        // Subtle feedback for unaffordable cards
        gsap.to(cardContainer, {
          alpha: 0.4,
          duration: 0.2
        });
      }
    });
    
    cardContainer.on('pointerout', () => {
      if (isAffordable) {
        gsap.to(cardContainer.scale, {
          x: 1.0,
          y: 1.0,
          duration: 0.2,
          ease: 'power2.out'
        });
        cardBorder.visible = false;
      } else {
        gsap.to(cardContainer, {
          alpha: 0.6,
          duration: 0.2
        });
      }
    });
  }
  
  // Helper method to check if a card is affordable
  private isCardAffordable(card: Card): boolean {
    if (!this.battleState) return false;
    
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (!currentPlayer) return false;
    
    // Check if player has enough energy (use deck.current_energy)
    return currentPlayer.deck.current_energy >= (card.energy_cost || 0);
  }

  private onCardDragStart(event: FederatedPointerEvent, cardContainer: Container, card: Card): void {
    if (this.isAnimating) return;
    
    this.dragTarget = cardContainer;
    cardContainer.alpha = 0.8;
    cardContainer.cursor = 'grabbing';
    
    // Calculate and store drag offset
    const globalCardPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    this.dragOffset = {
      x: event.global.x - (globalCardPos?.x || 0),
      y: event.global.y - (globalCardPos?.y || 0)
    };
    
    // Move card to top layer (app.stage) for dragging above all
    const globalPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    app.stage.addChild(cardContainer);
    if (globalPos) {
      cardContainer.position.set(globalPos.x, globalPos.y);
    }
    
    // Attach pointermove to stage
    app.stage.on('pointermove', this.onCardDragMove, this);
    
    event.stopPropagation();
  }

  private onCardDragMove(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return;
    
    // Use dragOffset to keep the pointer at the same relative position on the card
    const parent = this.dragTarget.parent;
    if (parent) {
      const newPos = parent.toLocal({
        x: event.global.x - this.dragOffset.x,
        y: event.global.y - this.dragOffset.y
      });
      this.dragTarget.position.set(newPos.x, newPos.y);
    }
  }

  private onCardDragEnd(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return;
    
    const card = (this.dragTarget as any).card;
    const dropTarget = this.getDropTarget(event.global.x, event.global.y);
    
    // Remove drag events from stage
    app.stage.off('pointermove', this.onCardDragMove, this);
    
    if (dropTarget) {
      this.handleCardDrop(card, dropTarget);
    } else {
      // Return card to hand
      this.returnCardToHand(this.dragTarget);
    }
    
    this.dragTarget.alpha = 1.0;
    this.dragTarget.cursor = 'grab';
    this.dragTarget = null;
  }

  private getDropTarget(globalX: number, globalY: number): string | null {
    // Check if dropped on character
    for (const [characterId, characterCard] of this.characterCards) {
      const bounds = characterCard.getBounds();
      if (globalX >= bounds.x && globalX <= bounds.x + bounds.width &&
          globalY >= bounds.y && globalY <= bounds.y + bounds.height) {
        return `character:${characterId}`;
      }
    }
    
    // Check if dropped on discard pile
    const discardBounds = this.discardPileContainer.getBounds();
    if (globalX >= discardBounds.x && globalX <= discardBounds.x + discardBounds.width &&
        globalY >= discardBounds.y && globalY <= discardBounds.y + discardBounds.height) {
      return 'discard';
    }
    
    return null;
  }

  private async handleCardDrop(card: Card, dropTarget: string): Promise<void> {
    if (!this.battleState || !this.dragTarget) return;
    
    this.isAnimating = true;
    
    try {
      if (dropTarget === 'discard') {
        // Discard card for energy
        await this.discardCardForEnergy(card);
      } else if (dropTarget.startsWith('character:')) {
        const characterId = dropTarget.replace('character:', '');
        await this.playCardOnCharacter(card, characterId);
      }
    } catch (error) {
      console.error('Error handling card drop:', error);
      this.returnCardToHand(this.dragTarget);
    }
    
    this.isAnimating = false;
  }

  private async discardCardForEnergy(card: Card): Promise<void> {
    if (!this.battleState) return;
    
    const turnAction: TurnAction = {
      type: 'discard_card',
      player_team: this.battleState.current_player,
      card_id: card.id
    };
    
    try {
      const response = await battleApi.discardCard(this.battleId, turnAction);
      if (response.success && response.data) {
        // response.data is CardBattleLog[], not battleState
        const logs = response.data;
        console.log('Discard card logs:', logs);
        
        // Remove card from player's hand
        if (this.battleState) {
          const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
          if (currentPlayer && currentPlayer.deck.hand_cards) {
            currentPlayer.deck.hand_cards = currentPlayer.deck.hand_cards.filter((c: any) => c.card?.id !== card.id);
          }
        }
        
        this.updateUI();
        this.animateCardToDiscard();
      }
    } catch (error) {
      console.error('Failed to discard card:', error);
    }
  }

  private async playCardOnCharacter(card: Card, characterId: string): Promise<void> {
    if (!this.battleState) return;
    
    const turnAction: TurnAction = {
      type: 'play_card',
      player_team: this.battleState.current_player,
      card_id: card.id,
      character_id: characterId
    };
    
    try {
      const response = await battleApi.playCard(this.battleId, turnAction);
      if (response.success && response.data) {
        // response.data is CardBattleLog[], not battleState
        const logs = response.data;
        console.log('Play card logs:', logs);
        
        // Remove card from player's hand
        if (this.battleState) {
          const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
          if (currentPlayer && currentPlayer.deck.hand_cards) {
            currentPlayer.deck.hand_cards = currentPlayer.deck.hand_cards.filter((c: any) => c.card?.id !== card.id);
          }
          
          // Update character states from log targets if available
          if (logs.length > 0 && logs[0].targets) {
            logs[0].targets.forEach((target: any) => {
              const player = this.battleState!.players.find(p => p.team === target.team);
              if (player) {
                const character = player.characters.find(c => c.id === target.id);
                if (character) {
                  // Update character with after state
                  Object.assign(character, target.after);
                }
              }
            });
          }
        }
        
        this.updateUI();
        this.animateCardPlay(characterId);
      }
    } catch (error) {
      console.error('Failed to play card:', error);
    }
  }

  private returnCardToHand(cardContainer: Container): void {
    // Remove from current parent (stage or container)
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    
    // Add back to hand container
    this.handContainer.addChild(cardContainer);
    
    // Find the card in the handCards array and restore position
    const cardIndex = this.handCards.indexOf(cardContainer);
    if (cardIndex !== -1) {
      // Recalculate hand layout and position with animation
      gsap.to(cardContainer, {
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          this.updateHandCards(); // Refresh hand display
        }
      });
    } else {
      // Fallback: add to hand cards array and update
      this.handCards.push(cardContainer);
      this.updateHandCards();
    }
  }

  private animateCardToDiscard(): void {
    if (!this.dragTarget) return;
    
    gsap.to(this.dragTarget, {
      x: this.discardPileContainer.x + this.CARD_WIDTH / 2,
      y: this.discardPileContainer.y + this.CARD_HEIGHT / 2,
      scale: 0.8,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        this.dragTarget?.destroy();
        this.updateHandCards();
      }
    });
  }

  private animateCardPlay(characterId: string): void {
    if (!this.dragTarget) return;
    
    const characterCard = this.characterCards.get(characterId);
    if (!characterCard) return;
    
    gsap.to(this.dragTarget, {
      x: characterCard.x + this.CHARACTER_CARD_WIDTH / 2,
      y: characterCard.y + this.CHARACTER_CARD_HEIGHT / 2,
      scale: 0,
      rotation: Math.PI,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        this.dragTarget?.destroy();
        this.updateHandCards();
        this.animateCharacterEffect(characterCard);
      }
    });
  }

  private animateCharacterEffect(characterCard: Container): void {
    // Add glow effect to character
    gsap.to(characterCard.scale, {
      x: 1.1,
      y: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  }

  private async animateCardDraw(): Promise<void> {
    // Animate cards being drawn from deck
    this.handCards.forEach((card, index) => {
      card.alpha = 0;
      card.scale.set(0);
      
      gsap.to(card, {
        alpha: 1,
        scale: 1,
        duration: 0.4,
        delay: index * 0.1,
        ease: 'back.out(1.7)'
      });
    });
    
    // Return promise that resolves when animation completes
    return new Promise(resolve => {
      const longestDelay = (this.handCards.length - 1) * 0.1 + 0.4;
      setTimeout(resolve, longestDelay * 1000);
    });
  }

  private createEndTurnButton(): void {
    const endTurnButton = new Container();
    
    // Make the button larger and more thumb-friendly with minimum touch target
    const buttonWidth = Math.min(240, this.gameWidth - (this.STANDARD_PADDING * 2));
    const buttonHeight = Math.max(48, 44); // Ensure minimum 48px for touch
    
    const buttonBg = new Graphics();
    // High contrast background with glow effect
    buttonBg.roundRect(0, 0, buttonWidth, buttonHeight, 12)
      .fill(Colors.ACCENT_SECONDARY) // Bright orange-red for high visibility
      .stroke({ width: 3, color: Colors.ACCENT_PRIMARY }); // Cyan border for contrast
    
    // Add inner glow effect
    const glowBg = new Graphics();
    glowBg.roundRect(2, 2, buttonWidth - 4, buttonHeight - 4, 10)
      .fill({ color: Colors.ACCENT_SUCCESS, alpha: 0.2 }); // Subtle green glow
    
    const buttonText = new Text({
      text: 'END TURN',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18, // Larger font for better readability
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE, // Pure white for maximum contrast
        align: 'center'
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = buttonWidth / 2;
    buttonText.y = buttonHeight / 2;
    
    endTurnButton.addChild(glowBg, buttonBg, buttonText);
    
    // Position at very bottom, centered, thumb-friendly
    endTurnButton.x = (this.gameWidth - buttonWidth) / 2;
    endTurnButton.y = this.gameHeight - buttonHeight - this.STANDARD_PADDING;
    
    endTurnButton.interactive = true;
    endTurnButton.cursor = 'pointer';
    
    // Enhanced hover/interaction feedback
    endTurnButton.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.roundRect(0, 0, buttonWidth, buttonHeight, 12)
        .fill(Colors.ACCENT_WARNING) // Change to amber on hover
        .stroke({ width: 3, color: Colors.ACCENT_PRIMARY });
      endTurnButton.scale.set(1.05); // Slight scale up
    });
    
    endTurnButton.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.roundRect(0, 0, buttonWidth, buttonHeight, 12)
        .fill(Colors.ACCENT_SECONDARY)
        .stroke({ width: 3, color: Colors.ACCENT_PRIMARY });
      endTurnButton.scale.set(1.0); // Reset scale
    });
    
    endTurnButton.on('pointerdown', () => {
      endTurnButton.scale.set(0.95); // Press feedback
    });
    
    endTurnButton.on('pointerup', () => {
      endTurnButton.scale.set(1.05); // Return to hover state
    });
    
    endTurnButton.on('pointertap', () => {
      // Add flash animation before removing
      gsap.to(buttonBg, {
        alpha: 0.5,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          endTurnButton.destroy();
          if (this.mainPhaseResolve) {
            this.mainPhaseResolve();
            this.mainPhaseResolve = undefined;
          }
        }
      });
    });
    
    this.container.addChild(endTurnButton);
  }

  private showBattleResult(): void {
    if (!this.battleState) return;
    
    const resultContainer = new Container();
    
    const overlay = new Graphics();
    overlay.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill(0x000000, 0.7);
    
    const resultBg = new Graphics();
    resultBg.roundRect(0, 0, 300, 200, 20)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 3, color: Colors.UI_BORDER });
    resultBg.x = (this.gameWidth - 300) / 2;
    resultBg.y = (this.gameHeight - 200) / 2;
    
    const isVictory = this.battleState.winner_team === 1;
    const resultText = new Text({
      text: isVictory ? 'VICTORY!' : 'DEFEAT!',
      style: {
        fontFamily: 'Kalam',
        fontSize: 32,
        fill: isVictory ? Colors.SUCCESS : Colors.ERROR,
        align: 'center'
      }
    });
    resultText.anchor.set(0.5);
    resultText.x = this.gameWidth / 2;
    resultText.y = this.gameHeight / 2 - 30;
    
    const backButton = new Container();
    const backBg = new Graphics();
    backBg.roundRect(0, 0, 100, 40, 8)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const backText = new Text({
      text: 'BACK',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    backText.anchor.set(0.5);
    backText.x = 50;
    backText.y = 20;
    
    backButton.addChild(backBg, backText);
    backButton.x = this.gameWidth / 2 - 50;
    backButton.y = this.gameHeight / 2 + 40;
    
    backButton.interactive = true;
    backButton.cursor = 'pointer';
    backButton.on('pointertap', () => {
      navigation.showScreen(HomeScene);
    });
    
    resultContainer.addChild(overlay, resultBg, resultText, backButton);
    this.container.addChild(resultContainer);
  }

  /** Resize handler */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Update layout on resize
    this.setupLayout();
    this.updateUI();
  }

  public update(): void {
    // Update logic can be added here if needed
  }
}