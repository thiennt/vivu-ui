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
    // Mobile-optimized vertical layout (360x700 design)
    // Smaller padding for mobile efficiency
    const TOP_PADDING = this.STANDARD_PADDING;
    const BETWEEN_AREAS = 8; // Reduced spacing for mobile
    const BOTTOM_PADDING = this.STANDARD_PADDING;

    // Create dark background first
    this.createMobileBattleBackground();

    // Calculate available height for all areas
    const totalVerticalPadding = TOP_PADDING + BETWEEN_AREAS * 5 + BOTTOM_PADDING + 50; // +50 for end turn button
    const availableHeight = this.gameHeight - totalVerticalPadding;

    // Mobile-optimized heights - more space for character interaction
    const opponentEnergyHeight = 45;
    const opponentHandHeight = 70;
    const playerHandHeight = 85; // Larger for better mobile tapping
    const playerEnergyHeight = 45;
    const playerDiscardHeight = 35; // Add dedicated discard zone
    const battlefieldHeight = availableHeight - (opponentEnergyHeight + opponentHandHeight + playerHandHeight + playerEnergyHeight + playerDiscardHeight);

    // Y positions for each area - following mobile design
    let currentY = TOP_PADDING;

    // 1. Opponent's Section (Top Half)
    // Opponent energy/deck/discard (topmost)
    this.createOpponentEnergyDeckDiscard(currentY, opponentEnergyHeight);
    currentY += opponentEnergyHeight + BETWEEN_AREAS;

    // Opponent skill hand
    this.createOpponentHandArea(currentY, opponentHandHeight);
    currentY += opponentHandHeight + BETWEEN_AREAS;

    // Opponent character row and discard zone
    const opponentCharRowHeight = battlefieldHeight / 3;
    this.createOpponentCharacterRowAndDiscard(currentY, opponentCharRowHeight);
    currentY += opponentCharRowHeight + BETWEEN_AREAS;

    // 2. Battlefield (Center Section)
    // Battle Log (Center)
    const battleLogHeight = battlefieldHeight / 3;
    this.createActionLogInCenter(currentY, battleLogHeight);
    currentY += battleLogHeight + BETWEEN_AREAS;

    // 3. Player's Section (Bottom Half)
    // Player character row
    const playerCharRowHeight = battlefieldHeight / 3;
    this.createPlayerCharacterRow(currentY, playerCharRowHeight);
    currentY += playerCharRowHeight + BETWEEN_AREAS;
    // Player skill hand (large for mobile tapping)
    this.createHandArea(currentY, playerHandHeight);
    currentY += playerHandHeight + BETWEEN_AREAS;

    // Player discard zone (dedicated area)
    this.createPlayerDiscardZone(currentY, playerDiscardHeight);
    currentY += playerDiscardHeight + BETWEEN_AREAS;

    // Player energy/deck/discard (near bottom)
    this.createPlayerEnergyDeckDiscard(currentY, playerEnergyHeight);
    currentY += playerEnergyHeight + BETWEEN_AREAS;

    // End turn button (bottom center)
    this.createEndTurnButtonAtBottom(BOTTOM_PADDING);
    
    // Setup stage event handlers for drag and drop
    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onCardDragEnd, this);
    app.stage.on('pointerupoutside', this.onCardDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  // Helper methods for positioning each area
  private createOpponentEnergyDeckDiscard(y: number, height: number) {
    // Dark background with white text for opponent (as per design)
    this.opponentEnergyContainer = new Container();
    this.opponentDeckRemainingContainer = new Container();
    this.opponentDiscardPileContainer = new Container();
    const elementWidth = 75; // Slightly smaller for mobile
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
        isPlayerDiscard: false,
        isOpponent: true // Add flag for opponent styling
      }
    );
  }

  private createOpponentHandArea(y: number, height: number) {
    this.opponentHandContainer = new Container();
    this.createHandAreaUI(
      this.opponentHandContainer,
      { y },
      { height },
      { isOpponent: true } // Add flag for opponent styling
    );
  }

  private createCharacterRowBackground(container: Container, height: number, isOpponent: boolean): void {
    // Warm brown background for character rows
    const rowBg = new Graphics();
    rowBg.roundRect(0, 0, this.gameWidth, height, 8)
      .fill(Colors.CONTAINER_BACKGROUND, 0.6); // Warm brown with transparency
    
    // Add avatar and label
    const avatarSize = 32;
    const avatarX = this.STANDARD_PADDING;
    const avatarY = height / 2 - avatarSize / 2;
    
    // Simple avatar placeholder
    const avatar = new Graphics();
    avatar.circle(avatarSize / 2, avatarSize / 2, avatarSize / 2)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    avatar.x = avatarX;
    avatar.y = avatarY;
    
    // Label (Opponent or You)
    const label = new Text({
      text: isOpponent ? 'Opponent' : 'You',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        fontWeight: 'bold'
      }
    });
    label.x = avatarX + avatarSize + 8;
    label.y = height / 2 - 7;
    
    container.addChild(rowBg, avatar, label);
  }

  private createOpponentCharacterRowAndDiscard(y: number, height: number): void {
    // Create opponent character row first
    this.player2CharactersContainer = new Container();
    this.player2CharactersContainer.y = y;
    this.createCharacterRowBackground(this.player2CharactersContainer, height - 25, true);
    
    // Add opponent discard zone below character row
    const discardY = y + height - 25;
    this.createOpponentDiscardZone(discardY, 25);
    
    this.container.addChild(this.player2CharactersContainer);
  }

  private createOpponentDiscardZone(y: number, height: number): void {
    const discardZone = new Container();
    
    // Create horizontal rectangle for opponent discard zone (matching player style)
    const zoneWidth = Math.min(280, this.gameWidth - (this.STANDARD_PADDING * 2));
    const zoneHeight = height;
    
    // Orange border with light fill (matching player discard)
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, zoneWidth, zoneHeight, 8)
      .fill(0xfff4e0, 0.3) // Light fill with transparency
      .stroke({ 
        width: 3, 
        color: Colors.DECORATION_MAGIC // Orange color - thick border to simulate dashed effect
      });
    
    // Add inner rectangle to create dashed effect
    const innerRect = new Graphics();
    innerRect.roundRect(4, 4, zoneWidth - 8, zoneHeight - 8, 6)
      .stroke({ 
        width: 1, 
        color: Colors.DECORATION_MAGIC, 
        alpha: 0.5 
      });
    
    // Trash icon and label
    const discardLabel = new Text({
      text: '🗑️ DISCARD',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.DECORATION_MAGIC,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    discardLabel.anchor.set(0.5);
    discardLabel.x = zoneWidth / 2;
    discardLabel.y = zoneHeight / 2;
    
    discardZone.addChild(discardBg, innerRect, discardLabel);
    discardZone.x = (this.gameWidth - zoneWidth) / 2;
    discardZone.y = y;
    
    // Store reference for opponent discard (reusing container variable)
    if (!this.opponentDiscardPileContainer) {
      this.opponentDiscardPileContainer = discardZone;
    }
    this.container.addChild(discardZone);
  }

  private createPlayerCharacterRow(y: number, height: number): void {
    // Create player character row (mirrored from opponent)
    this.player1CharactersContainer = new Container();
    this.player1CharactersContainer.y = y;
    this.createCharacterRowBackground(this.player1CharactersContainer, height, false);
    
    this.container.addChild(this.player1CharactersContainer);
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
    // Dark background with white text for player resources (matching opponent)
    this.energyContainer = new Container();
    this.deckRemainingContainer = new Container();
    this.discardPileContainer = new Container();
    const elementWidth = 75; // Consistent with opponent
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
        isPlayerDiscard: true,
        isOpponent: false
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

  private createMobileBattleBackground(): void {
    this.backgroundContainer = new Container();
    
    // Dark brown gradient background optimized for mobile battle
    const bg = new Graphics();
    const darkBrownGradient = Gradients.createBackgroundGradient(this.gameWidth, this.gameHeight);
    bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(darkBrownGradient);
    
    this.backgroundContainer.addChild(bg);
    this.container.addChild(this.backgroundContainer);
  }

  private createPlayerDiscardZone(y: number, height: number): void {
    const discardZone = new Container();
    
    // Create horizontal rectangle for discard zone
    const zoneWidth = Math.min(280, this.gameWidth - (this.STANDARD_PADDING * 2));
    const zoneHeight = height;
    
    // Orange border with light fill (as per design)
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, zoneWidth, zoneHeight, 8)
      .fill(0xfff4e0, 0.3) // Light fill with transparency
      .stroke({ 
        width: 3, 
        color: Colors.DECORATION_MAGIC // Orange color - thick border to simulate dashed effect
      });
    
    // Add inner rectangle to create dashed effect
    const innerRect = new Graphics();
    innerRect.roundRect(4, 4, zoneWidth - 8, zoneHeight - 8, 6)
      .stroke({ 
        width: 1, 
        color: Colors.DECORATION_MAGIC, 
        alpha: 0.5 
      });
    
    // Trash icon and label
    const discardLabel = new Text({
      text: '🗑️ DISCARD',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.DECORATION_MAGIC,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    discardLabel.anchor.set(0.5);
    discardLabel.x = zoneWidth / 2;
    discardLabel.y = zoneHeight / 2;
    
    discardZone.addChild(discardBg, innerRect, discardLabel);
    discardZone.x = (this.gameWidth - zoneWidth) / 2;
    discardZone.y = y;
    
    // Store reference for drag and drop
    this.discardPileContainer = discardZone;
    this.container.addChild(discardZone);
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
      isOpponent?: boolean;
    }
  ): void {
    const { elementWidth, elementHeight, spacing, isPlayerDiscard = false } = config;
    const { x: startX, y: yPosition } = position;
    
    // Dark background with white text for high contrast (both player and opponent)
    const bgColor = Colors.BACKGROUND_PRIMARY; // Dark brown
    const textColor = Colors.TEXT_WHITE; // White text
    
    // Position energy container on the left
    containers.energy.x = startX;
    containers.energy.y = yPosition;
    
    // Create energy background and label
    const energyBg = new Graphics();
    energyBg.roundRect(0, 0, elementWidth, elementHeight, 8)
      .fill(bgColor)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const energyIcon = new Text({
      text: '⚡',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.ENERGY_TEXT,
        align: 'center'
      }
    });
    energyIcon.anchor.set(0.5);
    energyIcon.x = elementWidth / 2;
    energyIcon.y = elementHeight / 2 - 8;
    
    const energyLabel = new Text({
      text: '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: textColor,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    energyLabel.anchor.set(0.5);
    energyLabel.x = elementWidth / 2;
    energyLabel.y = elementHeight / 2 + 8;
    
    containers.energy.addChild(energyBg, energyIcon, energyLabel);
    
    // Position deck container in the center
    containers.deck.x = startX + elementWidth + spacing;
    containers.deck.y = yPosition;
    
    // Create deck background and label
    const deckBg = new Graphics();
    deckBg.roundRect(0, 0, elementWidth, elementHeight, 8)
      .fill(bgColor)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const deckIcon = new Text({
      text: '🃏',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.CARD_BACKGROUND,
        align: 'center'
      }
    });
    deckIcon.anchor.set(0.5);
    deckIcon.x = elementWidth / 2;
    deckIcon.y = elementHeight / 2 - 8;
    
    const deckCount = new Text({
      text: '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: textColor,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    deckCount.anchor.set(0.5);
    deckCount.x = elementWidth / 2;
    deckCount.y = elementHeight / 2 + 8;
    
    containers.deck.addChild(deckBg, deckIcon, deckCount);
    
    // Position discard container on the right
    containers.discard.x = startX + (elementWidth + spacing) * 2;
    containers.discard.y = yPosition;
    
    // Create discard background
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, elementWidth, elementHeight, 8)
      .fill(bgColor)
      .stroke({ width: isPlayerDiscard ? 3 : 2, color: Colors.UI_BORDER });
  
    const discardIcon = new Text({
      text: '🗑️',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.CARD_DISCARD,
        align: 'center'
      }
    });
    discardIcon.anchor.set(0.5);
    discardIcon.x = elementWidth / 2;
    discardIcon.y = elementHeight / 2 - 8;
    
    const discardCount = new Text({
      text: '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: textColor,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    discardCount.anchor.set(0.5);
    discardCount.x = elementWidth / 2;
    discardCount.y = elementHeight / 2 + 8;
    
    containers.discard.addChild(discardBg, discardIcon, discardCount);
    
    // Add all containers to the main container
    this.container.addChild(containers.energy);
    this.container.addChild(containers.deck);
    this.container.addChild(containers.discard);
  }

  private createHandAreaUI(
    container: Container,
    position: { y: number },
    config: { height: number },
    options: { isOpponent?: boolean } = {}
  ): void {
    const { height } = config;
    const { y: yPosition } = position;
    const { isOpponent = false } = options;
    
    // Hand background - light for opponent, UI background for player
    const handBg = new Graphics();
    const bgColor = isOpponent ? 0xfff4e0 : Colors.UI_BACKGROUND; // Light background for opponent
    const borderColor = isOpponent ? Colors.DECORATION_MAGIC : Colors.UI_BORDER; // Orange border for opponent
    const borderWidth = isOpponent ? 3 : 2; // Thicker border for opponent
    
    handBg.roundRect(0, 0, this.gameWidth, height, 10)
      .fill(bgColor, isOpponent ? 0.8 : 1.0) // Semi-transparent for opponent
      .stroke({ width: borderWidth, color: borderColor });
    
    // Add label for hand area
    if (isOpponent) {
      const handLabel = new Text({
        text: 'OPPONENT SKILL HAND',
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: Colors.DECORATION_MAGIC,
          align: 'center',
          fontWeight: 'bold'
        }
      });
      handLabel.anchor.set(0.5, 0);
      handLabel.x = this.gameWidth / 2;
      handLabel.y = 8;
      container.addChild(handLabel);
    }
    
    container.addChild(handBg);
    container.y = yPosition;
    
    this.container.addChild(container);
  }


  private createActionLogInCenter(logY: number, logHeight: number): void {
    this.actionLogContainer = new Container();
    
    // Center the action log horizontally with mobile-optimized width
    const logWidth = Math.min(320, this.gameWidth - (this.STANDARD_PADDING * 2));
    
    // Pale background with brown border (as per design)
    const logBg = new Graphics();
    logBg.roundRect(0, 0, logWidth, logHeight, 12)
      .fill(0xfff8e1, 0.9) // Pale background
      .stroke({ width: 3, color: Colors.PANEL_BACKGROUND }); // Brown border
    
    // Add title for battle log
    const logTitle = new Text({
      text: 'BATTLE LOG',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.PANEL_BACKGROUND, // Brown text
        align: 'center',
        fontWeight: 'bold'
      }
    });
    logTitle.anchor.set(0.5, 0);
    logTitle.x = logWidth / 2;
    logTitle.y = 10;
    
    // Add example log entries (placeholder)
    const logEntries = [
      'BTC attacked ETH for 230 dmg!',
      'Player used heal potion',
      'Enemy cast fireball'
    ];
    
    logEntries.forEach((entry, index) => {
      const logEntry = new Text({
        text: entry,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: Colors.BACKGROUND_PRIMARY, // Dark brown text
          align: 'left'
        }
      });
      logEntry.x = 10;
      logEntry.y = 30 + (index * 15);
      this.actionLogContainer.addChild(logEntry);
    });
    
    this.actionLogContainer.addChild(logBg, logTitle);
    this.actionLogContainer.x = (this.gameWidth - logWidth) / 2;
    this.actionLogContainer.y = logY;
    
    this.container.addChild(this.actionLogContainer);
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
    
    // Add glow effect on hover
    card.on('pointerover', () => {
      card.alpha = 0.8;
    });
    
    card.on('pointerout', () => {
      card.alpha = 1.0;
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
    
    // Find the energy text (second child after background)
    const energyText = container.children[1] as Text;
    if (energyText && energyText instanceof Text) {
      energyText.text = `Energy: ${player.deck.current_energy}`;
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
    
    // Turn indicator integrated into battle log for space efficiency
    // Mobile-optimized approach removes separate turn indicator
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
    // Calculate appropriate font scale for smaller hand cards
    const baseFontScale = Math.min(1.0, cardWidth / 80); // Scale down for smaller cards
    
    const cardContainer = this.createDeckCard(card, cardWidth, cardWidth * 1.4, {
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
    
    cardContainer.on('pointerdown', (event: FederatedPointerEvent) => {
      this.onCardDragStart(event, cardContainer, card);
    });
    
    cardContainer.on('pointerover', () => {
      cardContainer.scale.set(1.05);
    });
    
    cardContainer.on('pointerout', () => {
      cardContainer.scale.set(1.0);
    });
  }

  private onCardDragStart(event: FederatedPointerEvent, cardContainer: Container, _card: Card): void {
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
    
    // Large orange button for mobile use (high-contrast, wide, rounded)
    const buttonWidth = Math.min(220, this.gameWidth - (this.STANDARD_PADDING * 2));
    const buttonHeight = 50; // Larger for thumb access
    
    // Orange gradient background
    const buttonBg = new Graphics();
    const buttonGradient = Gradients.createButtonGradient(buttonWidth, buttonHeight);
    buttonBg.roundRect(0, 0, buttonWidth, buttonHeight, 16) // More rounded
      .fill(buttonGradient)
      .stroke({ width: 3, color: Colors.BUTTON_BORDER });
    
    const buttonText = new Text({
      text: 'END TURN',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18, // Larger font
        fill: Colors.TEXT_BUTTON,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = buttonWidth / 2;
    buttonText.y = buttonHeight / 2;
    
    endTurnButton.addChild(buttonBg, buttonText);
    
    // Position at bottom center for easy thumb access
    endTurnButton.x = (this.gameWidth - buttonWidth) / 2;
    endTurnButton.y = this.gameHeight - buttonHeight - this.STANDARD_PADDING;
    
    // Enhanced interaction feedback for mobile
    endTurnButton.interactive = true;
    endTurnButton.cursor = 'pointer';
    
    // Hover/press effects
    endTurnButton.on('pointerover', () => {
      endTurnButton.scale.set(1.05);
    });
    
    endTurnButton.on('pointerout', () => {
      endTurnButton.scale.set(1.0);
    });
    
    endTurnButton.on('pointerdown', () => {
      endTurnButton.scale.set(0.95);
    });
    
    endTurnButton.on('pointerup', () => {
      endTurnButton.scale.set(1.0);
    });
    
    endTurnButton.on('pointertap', () => {
      // Remove the button and resolve main phase
      endTurnButton.destroy();
      if (this.mainPhaseResolve) {
        this.mainPhaseResolve();
        this.mainPhaseResolve = undefined;
      }
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