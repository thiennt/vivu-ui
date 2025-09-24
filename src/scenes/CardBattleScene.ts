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
    this.createBackground();
    this.createOpponentEnergyDeckDiscard(); // At the very top
    this.createOpponentHandArea(); // Below opponent energy/deck/discard
    this.createBattlefield(); // Opponent chars, then battle log, then player chars
    this.createHandArea(); // Player hand above player energy/deck/discard
    this.createPlayerEnergyDeckDiscard(); // At the bottom
    this.createEndTurnButtonAtBottom(); // At very bottom, thumb-friendly
  }

  private createBackground(): void {
    this.backgroundContainer = new Container();
    
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill(Gradients.BACKGROUND_DARK);
    
    this.backgroundContainer.addChild(bg);
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
    
    // Create energy background and label
    const energyBg = new Graphics();
    energyBg.roundRect(0, 0, elementWidth, elementHeight, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const energyLabel = new Text({
      text: 'Energy: 0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 11,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    energyLabel.anchor.set(0.5);
    energyLabel.x = elementWidth / 2;
    energyLabel.y = elementHeight / 2;
    
    containers.energy.addChild(energyBg, energyLabel);
    
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
    
    if (isPlayerDiscard) {
      // Player discard has enhanced drop target styling
      const discardLabel = new Text({
        text: 'DROP HERE',
        style: {
          fontFamily: 'Kalam',
          fontSize: 9,
          fill: Colors.TEXT_PRIMARY,
          align: 'center'
        }
      });
      discardLabel.anchor.set(0.5);
      discardLabel.x = elementWidth / 2;
      discardLabel.y = elementHeight / 2 - 8;
      
      const discardSubLabel = new Text({
        text: 'DISCARD',
        style: {
          fontFamily: 'Kalam',
          fontSize: 8,
          fill: Colors.TEXT_SECONDARY,
          align: 'center'
        }
      });
      discardSubLabel.anchor.set(0.5);
      discardSubLabel.x = elementWidth / 2;
      discardSubLabel.y = elementHeight / 2 + 8;
      
      containers.discard.addChild(discardBg, discardLabel, discardSubLabel);
    } else {
      // Opponent discard has simple styling
      const discardLabel = new Text({
        text: 'DISCARD',
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
    }
    
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

  private createOpponentEnergyDeckDiscard(): void {
    // Create containers for opponent's energy, deck, and discard at the very top
    this.opponentEnergyContainer = new Container();
    this.opponentDeckRemainingContainer = new Container();
    this.opponentDiscardPileContainer = new Container();
    
    const topY = this.STANDARD_PADDING;
    const elementHeight = 50;
    const elementWidth = 80;
    const spacing = this.STANDARD_SPACING;
    
    // Calculate total width and center horizontally
    const totalWidth = (elementWidth * 3) + (spacing * 2);
    const startX = (this.gameWidth - totalWidth) / 2;
    
    this.createEnergyDeckDiscardUI(
      { x: startX, y: topY },
      {
        energy: this.opponentEnergyContainer,
        deck: this.opponentDeckRemainingContainer,
        discard: this.opponentDiscardPileContainer
      },
      {
        elementWidth,
        elementHeight,
        spacing,
        isPlayerDiscard: false
      }
    );
  }

  private createOpponentHandArea(): void {
    this.opponentHandContainer = new Container();
    
    // Position below opponent energy/deck/discard with padding
    const opponentTopHeight = 50 + this.STANDARD_PADDING; // Height of top area
    const handY = opponentTopHeight + this.STANDARD_PADDING;
    const handHeight = 60; // Smaller height for opponent hand
    
    this.createHandAreaUI(
      this.opponentHandContainer,
      { y: handY },
      { height: handHeight }
    );
  }

  private createBattlefield(): void {
    this.battlefieldContainer = new Container();
    
    // Create containers for each player's characters
    this.player1CharactersContainer = new Container();
    this.player2CharactersContainer = new Container();
    
    // Calculate available space for battlefield layout
    const opponentTopHeight = 50 + this.STANDARD_PADDING; // Opponent energy/deck/discard
    const opponentHandHeight = 60 + this.STANDARD_PADDING; // Opponent hand
    const playerHandHeight = 80; // Player hand (larger)
    const playerBottomHeight = 50 + this.STANDARD_PADDING; // Player energy/deck/discard  
    const endTurnHeight = 50; // End turn button space
    
    const battlefieldStartY = opponentTopHeight + opponentHandHeight + this.STANDARD_PADDING;
    const availableHeight = this.gameHeight - battlefieldStartY - playerHandHeight - playerBottomHeight - endTurnHeight - (this.STANDARD_PADDING * 2);
    
    // Divide battlefield into sections: opponent chars, battle log, player chars
    const sectionHeight = availableHeight / 3;
    
    // Position opponent characters at top of battlefield
    this.player2CharactersContainer.y = battlefieldStartY;
    
    // Create and position action log in the middle section
    this.createActionLogInCenter(battlefieldStartY + sectionHeight, sectionHeight);
    
    // Position player characters at bottom of battlefield  
    this.player1CharactersContainer.y = battlefieldStartY + sectionHeight * 2;
    
    this.battlefieldContainer.addChild(this.player2CharactersContainer);
    this.battlefieldContainer.addChild(this.player1CharactersContainer);
    this.container.addChild(this.battlefieldContainer);
  }

  private createActionLogInCenter(logY: number, logHeight: number): void {
    this.actionLogContainer = new Container();
    
    // Center the action log horizontally and use provided position
    const logWidth = Math.min(300, this.gameWidth - (this.STANDARD_PADDING * 2));
    
    const logBg = new Graphics();
    logBg.roundRect(0, 0, logWidth, logHeight, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // Add title for battle log
    const logTitle = new Text({
      text: 'BATTLE LOG',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    logTitle.anchor.set(0.5, 0);
    logTitle.x = logWidth / 2;
    logTitle.y = 8;
    
    this.actionLogContainer.addChild(logBg, logTitle);
    this.actionLogContainer.x = (this.gameWidth - logWidth) / 2;
    this.actionLogContainer.y = logY;
    
    this.container.addChild(this.actionLogContainer);
  }

  private createPlayerEnergyDeckDiscard(): void {
    // Create containers for player's energy, deck, and discard at the bottom
    this.energyContainer = new Container();
    this.deckRemainingContainer = new Container();
    this.discardPileContainer = new Container();
    
    const endTurnHeight = 50; // End turn button space
    const elementHeight = 50;
    
    // Calculate responsive element width to prevent overlap
    const availableWidth = this.gameWidth - (this.STANDARD_PADDING * 2);
    const spacing = this.STANDARD_SPACING;
    const minElementWidth = 70;
    const maxElementWidth = 90;
    
    // Calculate width that fits all 3 elements with proper spacing
    let elementWidth = (availableWidth - (spacing * 2)) / 3;
    elementWidth = Math.max(minElementWidth, Math.min(maxElementWidth, elementWidth));
    
    const bottomY = this.gameHeight - endTurnHeight - elementHeight - this.STANDARD_PADDING;
    
    // Calculate total width and center horizontally
    const totalWidth = (elementWidth * 3) + (spacing * 2);
    const startX = (this.gameWidth - totalWidth) / 2;
    
    this.createEnergyDeckDiscardUI(
      { x: startX, y: bottomY },
      {
        energy: this.energyContainer,
        deck: this.deckRemainingContainer,
        discard: this.discardPileContainer
      },
      {
        elementWidth,
        elementHeight,
        spacing,
        isPlayerDiscard: true
      }
    );
  }

  private createEndTurnButtonAtBottom(): void {
    // This method creates the end turn button layout, but the actual button
    // will be created dynamically during the main phase
    // We just reserve the space at the bottom for thumb-friendly access
    
    // Initialize turn indicator container (hidden in mobile layout)
    this.turnIndicatorContainer = new Container();
    this.turnIndicatorContainer.visible = false; // Hide it in mobile layout
    this.container.addChild(this.turnIndicatorContainer);
  }

  private createHandArea(): void {
    this.handContainer = new Container();
    
    // Position hand above player energy/deck/discard with proper spacing
    const playerBottomHeight = 50 + this.STANDARD_PADDING; // Player energy/deck/discard height
    const endTurnHeight = 50; // End turn button space
    const handHeight = 80; // Player hand height
    const handY = this.gameHeight - playerBottomHeight - endTurnHeight - handHeight - this.STANDARD_PADDING;
    
    this.createHandAreaUI(
      this.handContainer,
      { y: handY },
      { height: handHeight }
    );
  }

  private createEnergyIndicator(): void {
    this.energyContainer = new Container();
    
    // Position in top-right corner with proper padding
    this.energyContainer.x = this.gameWidth - 150 - this.STANDARD_PADDING;
    this.energyContainer.y = this.STANDARD_PADDING;
    
    this.container.addChild(this.energyContainer);
  }

  private createTurnIndicator(): void {
    this.turnIndicatorContainer = new Container();
    
    // Position in top-center with proper padding
    this.turnIndicatorContainer.x = this.gameWidth / 2;
    this.turnIndicatorContainer.y = this.STANDARD_PADDING;
    
    this.container.addChild(this.turnIndicatorContainer);
  }

  private createActionLog(): void {
    this.actionLogContainer = new Container();
    
    // Position on left side with proper spacing
    const logWidth = 200;
    const logHeight = this.gameHeight * 0.4;
    
    // Calculate position to avoid overlapping with other elements
    const topUIHeight = 60; // Space for turn indicator and energy
    const handHeight = this.gameHeight * 0.2;
    const availableHeight = this.gameHeight - topUIHeight - handHeight - (this.STANDARD_PADDING * 3);
    const actualLogHeight = Math.min(logHeight, availableHeight);
    
    const logBg = new Graphics();
    logBg.roundRect(0, 0, logWidth, actualLogHeight, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    this.actionLogContainer.addChild(logBg);
    this.actionLogContainer.x = this.STANDARD_PADDING;
    this.actionLogContainer.y = topUIHeight + this.STANDARD_PADDING;
    
    this.container.addChild(this.actionLogContainer);
  }

  private createDiscardPile(): void {
    this.discardPileContainer = new Container();
    
    // Position in bottom-left corner with proper spacing from hand
    const handHeight = this.gameHeight * 0.2;
    const discardWidth = this.CARD_WIDTH + 10;
    const discardHeight = this.CARD_HEIGHT + 10;
    
    this.discardPileContainer.x = this.STANDARD_PADDING;
    this.discardPileContainer.y = this.gameHeight - handHeight - discardHeight - this.STANDARD_PADDING * 2;
    
    // Discard pile background
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, discardWidth, discardHeight, 8)
      .fill(Colors.CARD_DISCARD)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const discardLabel = new Text({
      text: 'DISCARD',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    discardLabel.anchor.set(0.5);
    discardLabel.x = discardWidth / 2;
    discardLabel.y = discardHeight / 2;
    
    this.discardPileContainer.addChild(discardBg, discardLabel);
    this.container.addChild(this.discardPileContainer);
  }

  private createDeckRemaining(): void {
    this.deckRemainingContainer = new Container();
    
    // Position next to discard pile with spacing
    const discardWidth = this.CARD_WIDTH + 10;
    const deckWidth = discardWidth;
    const deckHeight = this.CARD_HEIGHT + 10;
    const handHeight = this.gameHeight * 0.2;
    
    this.deckRemainingContainer.x = this.STANDARD_PADDING + discardWidth + this.STANDARD_SPACING;
    this.deckRemainingContainer.y = this.gameHeight - handHeight - deckHeight - this.STANDARD_PADDING * 2;
    
    // Deck remaining background
    const deckBg = new Graphics();
    deckBg.roundRect(0, 0, deckWidth, deckHeight, 8)
      .fill(Colors.CARD_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const deckLabel = new Text({
      text: 'DECK',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    deckLabel.anchor.set(0.5);
    deckLabel.x = deckWidth / 2;
    deckLabel.y = deckHeight / 2 - 10;
    
    // Remaining count will be updated in updateUI
    const countLabel = new Text({
      text: '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    countLabel.anchor.set(0.5);
    countLabel.x = deckWidth / 2;
    countLabel.y = deckHeight / 2 + 10;
    
    this.deckRemainingContainer.addChild(deckBg, deckLabel, countLabel);
    this.container.addChild(this.deckRemainingContainer);
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
      
      const aliveCharacters = player.characters.filter(c => c.current_hp > 0);
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
    this.updateDeckRemaining();
  }

  private updateEnergyIndicator(): void {
    if (!this.battleState) return;
    
    this.energyContainer.removeChildren();
    
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (!currentPlayer) return;
    
    const energyBg = new Graphics();
    energyBg.roundRect(0, 0, 140, 40, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const energyText = new Text({
      text: `Energy: ${currentPlayer.deck.current_energy}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = 70;
    energyText.y = 20;
    
    this.energyContainer.addChild(energyBg, energyText);
  }

  private updateDeckRemaining(): void {
    if (!this.battleState || !this.deckRemainingContainer) return;
    
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (!currentPlayer) return;
    
    // Calculate remaining cards (total deck minus hand and discard)
    const totalDeckCards = currentPlayer.deck.deck_cards.length;
    const handCards = currentPlayer.deck.hand_cards.length;
    const discardCards = currentPlayer.deck.discard_cards.length;
    const remainingCards = totalDeckCards - handCards - discardCards;
    
    // Update the count label (it's the third child: bg, label, count)
    const countLabel = this.deckRemainingContainer.children[2] as Text;
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

  private onCardDragStart(event: FederatedPointerEvent, cardContainer: Container, card: Card): void {
    if (this.isAnimating) return;
    
    this.dragTarget = cardContainer;
    cardContainer.alpha = 0.8;
    cardContainer.cursor = 'grabbing';
    
    // Calculate drag offset
    const globalPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    this.dragOffset = {
      x: event.global.x - (globalPos?.x || 0),
      y: event.global.y - (globalPos?.y || 0)
    };
    
    // Move to top layer for dragging (use app.stage instead of container)
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    // Use app.stage to ensure card is above all other elements
    const app = (globalThis as any).app;
    if (app && app.stage) {
      app.stage.addChild(cardContainer);
      if (globalPos) {
        cardContainer.position.set(globalPos.x, globalPos.y);
      }
    } else {
      this.container.addChild(cardContainer);
    }
    
    // Attach drag events to stage for better capture
    if (app && app.stage) {
      app.stage.on('pointermove', this.onCardDragMove, this);
      app.stage.on('pointerup', this.onCardDragEnd, this);
    } else {
      this.container.on('pointermove', this.onCardDragMove, this);
      this.container.on('pointerup', this.onCardDragEnd, this);
    }
    
    event.stopPropagation();
  }

  private onCardDragMove(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return;
    
    // Use global coordinates with proper offset calculation
    const parent = this.dragTarget.parent;
    if (parent) {
      const newPos = parent.toLocal({
        x: event.global.x - this.dragOffset.x,
        y: event.global.y - this.dragOffset.y
      });
      this.dragTarget.position.set(newPos.x, newPos.y);
    } else {
      // Fallback for direct positioning
      this.dragTarget.x = event.global.x - this.dragOffset.x;
      this.dragTarget.y = event.global.y - this.dragOffset.y;
    }
  }

  private onCardDragEnd(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return;
    
    const card = (this.dragTarget as any).card;
    const dropTarget = this.getDropTarget(event.global.x, event.global.y);
    
    // Remove drag events from both container and stage
    const app = (globalThis as any).app;
    if (app && app.stage) {
      app.stage.off('pointermove', this.onCardDragMove, this);
      app.stage.off('pointerup', this.onCardDragEnd, this);
    } else {
      this.container.off('pointermove', this.onCardDragMove, this);
      this.container.off('pointerup', this.onCardDragEnd, this);
    }
    
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
    
    // Make the button larger and more thumb-friendly
    const buttonWidth = Math.min(200, this.gameWidth - (this.STANDARD_PADDING * 2));
    const buttonHeight = 44;
    
    const buttonBg = new Graphics();
    buttonBg.roundRect(0, 0, buttonWidth, buttonHeight, 12)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const buttonText = new Text({
      text: 'END TURN',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = buttonWidth / 2;
    buttonText.y = buttonHeight / 2;
    
    endTurnButton.addChild(buttonBg, buttonText);
    
    // Position at very bottom, centered, thumb-friendly
    endTurnButton.x = (this.gameWidth - buttonWidth) / 2;
    endTurnButton.y = this.gameHeight - buttonHeight - this.STANDARD_PADDING;
    
    endTurnButton.interactive = true;
    endTurnButton.cursor = 'pointer';
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

  private async endTurn(): Promise<void> {
    // This method is now replaced by processEndTurn in the new flow
    // Keep it for backward compatibility but delegate to the new system
    if (this.mainPhaseResolve) {
      this.mainPhaseResolve();
      this.mainPhaseResolve = undefined;
    }
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