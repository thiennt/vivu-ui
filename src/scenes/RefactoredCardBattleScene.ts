import { Container, Graphics, Text, FederatedPointerEvent } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { Colors, Gradients } from '@/utils/colors';
import { HomeScene } from './HomeScene';
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

// Import new components and utilities
import {
  HandComponent,
  CharacterRowComponent,
  EnergyDeckDiscardComponent,
  BattleLogComponent,
  EndTurnButtonComponent,
  BattleOverlayComponent,
  type HandComponentConfig,
  type CharacterRowConfig,
  type EnergyDeckDiscardConfig,
  type BattleLogConfig,
  type EndTurnButtonConfig,
  type BattleOverlayConfig
} from './CardBattleScene/components';

import {
  BattleAnimations,
  DragDropManager,
  LayoutCalculator,
  type DragDropTarget
} from './CardBattleScene/utils';

/**
 * Refactored CardBattleScene using modular components
 * This demonstrates the new architecture with clear separation of concerns:
 * - High-level composition and state management
 * - Delegated UI rendering to specialized components  
 * - Isolated utility functions
 * - Preserved business logic
 */
export class RefactoredCardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  
  // Battle state - core business logic remains unchanged
  private battleState: CardBattleState | null = null;
  private battleId: string;
  private currentPhase: BattlePhaseName = 'start_turn';
  private isAnimating: boolean = false;
  
  // Components - UI concerns delegated to specialized components
  private backgroundContainer!: Container;
  private playerHandComponent!: HandComponent;
  private opponentHandComponent!: HandComponent;
  private playerCharacterRowComponent!: CharacterRowComponent;
  private opponentCharacterRowComponent!: CharacterRowComponent;
  private playerEnergyDeckDiscardComponent!: EnergyDeckDiscardComponent;
  private opponentEnergyDeckDiscardComponent!: EnergyDeckDiscardComponent;
  private battleLogComponent!: BattleLogComponent;
  private endTurnButtonComponent!: EndTurnButtonComponent;
  private battleOverlayComponent!: BattleOverlayComponent;
  
  // Utilities - extracted for reusability and testability
  private dragDropManager!: DragDropManager;
  
  // Game flow control - business logic preserved
  private mainPhaseResolve?: () => void;
  
  // Layout constants
  private readonly HAND_CARD_WIDTH = 50;
  private readonly HAND_CARD_HEIGHT = 70;

  constructor(battleId?: string) {
    super();
    
    this.battleId = battleId || 'mock-battle-001';
    this.container = new Container();
    this.addChild(this.container);
    
    this.initializeComponents();
    this.initializeBattle();
  }

  /**
   * Initialize all UI components - High-level composition
   */
  private initializeComponents(): void {
    // Calculate responsive layout
    const layout = LayoutCalculator.calculateBattleLayout(this.gameWidth, this.gameHeight);

    // Setup background
    this.createBackground();

    // Initialize drag and drop manager for card interactions
    this.dragDropManager = new DragDropManager((card: Card, dropTarget: string | null) => {
      if (dropTarget) {
        this.handleCardDrop(card, dropTarget);
      } else {
        this.returnCardToHand(card);
      }
    });
    this.dragDropManager.setupDragEndHandlers();

    // Setup all UI components with their configurations
    this.setupHandComponents(layout);
    this.setupCharacterRowComponents(layout);  
    this.setupEnergyDeckDiscardComponents(layout);
    this.setupBattleLogComponent(layout);
    this.setupEndTurnButtonComponent();
    this.setupBattleOverlayComponent();
  }

  /**
   * Setup hand components for player and opponent
   */
  private setupHandComponents(layout: any): void {
    // Player hand component
    const playerHandConfig: HandComponentConfig = {
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      position: { y: layout.areas.playerHand.y },
      dimensions: { height: layout.areas.playerHand.height },
      cardDimensions: {
        width: this.HAND_CARD_WIDTH,
        height: this.HAND_CARD_HEIGHT
      },
      isOpponent: false
    };
    this.playerHandComponent = new HandComponent(this, playerHandConfig, this.dragDropManager);
    this.container.addChild(this.playerHandComponent.getContainer());

    // Opponent hand component
    const opponentHandConfig: HandComponentConfig = {
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      position: { y: layout.areas.opponentHand.y },
      dimensions: { height: layout.areas.opponentHand.height },
      cardDimensions: {
        width: this.HAND_CARD_WIDTH,
        height: this.HAND_CARD_HEIGHT
      },
      isOpponent: true
    };
    this.opponentHandComponent = new HandComponent(this, opponentHandConfig);
    this.container.addChild(this.opponentHandComponent.getContainer());
  }

  /**
   * Setup character row components for battlefield
   */
  private setupCharacterRowComponents(layout: any): void {
    const battlefieldSections = LayoutCalculator.calculateBattlefieldSections(
      layout.areas.battlefield.y,
      layout.areas.battlefield.height
    );

    // Player characters (team 1)
    const playerCharacterConfig: CharacterRowConfig = {
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      position: { y: battlefieldSections.playerCharacters.y },
      dimensions: { height: battlefieldSections.playerCharacters.height },
      isOpponent: false,
      maxCharacters: 3
    };
    this.playerCharacterRowComponent = new CharacterRowComponent(this, playerCharacterConfig);
    this.container.addChild(this.playerCharacterRowComponent.getContainer());

    // Opponent characters (team 2)
    const opponentCharacterConfig: CharacterRowConfig = {
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      position: { y: battlefieldSections.opponentCharacters.y },
      dimensions: { height: battlefieldSections.opponentCharacters.height },
      isOpponent: true,
      maxCharacters: 3
    };
    this.opponentCharacterRowComponent = new CharacterRowComponent(this, opponentCharacterConfig);
    this.container.addChild(this.opponentCharacterRowComponent.getContainer());
  }

  /**
   * Setup energy, deck, and discard components
   */
  private setupEnergyDeckDiscardComponents(layout: any): void {
    const energyLayout = LayoutCalculator.calculateEnergyDeckDiscardLayout(this.gameWidth, 10);

    // Player energy/deck/discard
    const playerEnergyConfig: EnergyDeckDiscardConfig = {
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      position: { x: energyLayout.startX, y: layout.areas.playerEnergy.y },
      dimensions: { height: layout.areas.playerEnergy.height },
      isPlayer: true
    };
    this.playerEnergyDeckDiscardComponent = new EnergyDeckDiscardComponent(this, playerEnergyConfig);
    const playerContainers = this.playerEnergyDeckDiscardComponent.getContainers();
    this.container.addChild(playerContainers.energy);
    this.container.addChild(playerContainers.deck);
    this.container.addChild(playerContainers.discard);

    // Opponent energy/deck/discard
    const opponentEnergyConfig: EnergyDeckDiscardConfig = {
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      position: { x: energyLayout.startX, y: layout.areas.opponentEnergy.y },
      dimensions: { height: layout.areas.opponentEnergy.height },
      isPlayer: false
    };
    this.opponentEnergyDeckDiscardComponent = new EnergyDeckDiscardComponent(this, opponentEnergyConfig);
    const opponentContainers = this.opponentEnergyDeckDiscardComponent.getContainers();
    this.container.addChild(opponentContainers.energy);
    this.container.addChild(opponentContainers.deck);
    this.container.addChild(opponentContainers.discard);
  }

  /**
   * Setup battle log component
   */
  private setupBattleLogComponent(layout: any): void {
    const battlefieldSections = LayoutCalculator.calculateBattlefieldSections(
      layout.areas.battlefield.y,
      layout.areas.battlefield.height
    );

    const battleLogConfig: BattleLogConfig = {
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      position: { y: battlefieldSections.actionLog.y },
      dimensions: { height: battlefieldSections.actionLog.height }
    };
    this.battleLogComponent = new BattleLogComponent(battleLogConfig);
    this.container.addChild(this.battleLogComponent.getContainer());
  }

  /**
   * Setup end turn button component
   */
  private setupEndTurnButtonComponent(): void {
    const endTurnConfig: EndTurnButtonConfig = {
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      onEndTurn: () => {
        if (this.mainPhaseResolve) {
          this.mainPhaseResolve();
          this.mainPhaseResolve = undefined;
        }
      }
    };
    this.endTurnButtonComponent = new EndTurnButtonComponent(endTurnConfig);
  }

  /**
   * Setup battle overlay component
   */
  private setupBattleOverlayComponent(): void {
    const overlayConfig: BattleOverlayConfig = {
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      onBackClick: () => {
        navigation.showScreen(HomeScene);
      }
    };
    this.battleOverlayComponent = new BattleOverlayComponent(overlayConfig);
  }

  /**
   * Create background - kept simple and focused
   */
  private createBackground(): void {
    this.backgroundContainer = new Container();
    
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill(Gradients.BACKGROUND_DARK);
    
    this.backgroundContainer.addChild(bg);
    this.container.addChild(this.backgroundContainer);
  }

  // ===== BUSINESS LOGIC METHODS - Preserved unchanged =====

  /**
   * Initialize battle - Core business logic preserved
   */
  private async initializeBattle(): Promise<void> {
    try {
      const response = await battleApi.getBattleState(this.battleId);
      
      if (response.success && response.data) {
        this.battleState = response.data;
        this.setupCharacters();
        this.updateUI();
        this.startGameLoop();
      } else {
        console.error('Failed to load battle data:', response.message);
        this.showFallbackUI();
      }
    } catch (error) {
      console.error('Error initializing battle:', error);
      this.showFallbackUI();
    }
  }

  /**
   * Setup characters using components
   */
  private setupCharacters(): void {
    if (!this.battleState) return;
    
    const player1 = this.battleState.players.find(p => p.team === 1);
    const player2 = this.battleState.players.find(p => p.team === 2);
    
    if (player1) {
      this.playerCharacterRowComponent.setupCharacters(player1);
    }
    
    if (player2) {
      this.opponentCharacterRowComponent.setupCharacters(player2);
    }
  }

  /**
   * Update UI using components - Delegated to specialized components
   */
  private updateUI(): void {
    if (!this.battleState) return;

    const player1 = this.battleState.players.find(p => p.team === 1);
    const player2 = this.battleState.players.find(p => p.team === 2);

    // Update hands
    if (player1?.deck.hand_cards) {
      this.playerHandComponent.updateHandCards(player1.deck.hand_cards);
    }
    if (player2?.deck.hand_cards) {
      this.opponentHandComponent.updateHandCards(player2.deck.hand_cards);
    }

    // Update energy/deck/discard indicators
    if (player1) {
      this.playerEnergyDeckDiscardComponent.updateAll(player1);
    }
    if (player2) {
      this.opponentEnergyDeckDiscardComponent.updateAll(player2);
    }

    // Update character states
    if (player1) {
      this.playerCharacterRowComponent.updateCharacterStates(player1);
    }
    if (player2) {
      this.opponentCharacterRowComponent.updateCharacterStates(player2);
    }
  }

  /**
   * Start game loop - Business logic preserved
   */
  private async startGameLoop(): Promise<void> {
    while (this.battleState && this.battleState.status === 'ongoing') {
      this.currentPhase = 'start_turn';
      await this.processTurnStart();
      
      this.currentPhase = 'draw_phase';
      await this.processDrawPhase();
      
      this.currentPhase = 'main_phase';
      await this.processMainPhase();
      
      this.currentPhase = 'end_turn';
      await this.processEndTurn();
      
      if (this.checkGameEnd()) {
        break;
      }
      
      // Switch to opponent turn
      await this.processAITurn();
      
      if (this.checkGameEnd()) {
        break;
      }
    }
  }

  /**
   * Process main phase - Shows end turn button using component
   */
  private async processMainPhase(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mainPhaseResolve = resolve;
      
      // Show end turn button using component
      const button = this.endTurnButtonComponent.showEndTurnButton();
      this.container.addChild(button);
    });
  }

  /**
   * Handle card drop - Business logic preserved, uses components for UI updates
   */
  private async handleCardDrop(card: Card, dropTarget: string): Promise<void> {
    if (!this.battleState) return;
    
    this.isAnimating = true;
    
    try {
      if (dropTarget === 'discard') {
        await this.discardCardForEnergy(card);
      } else if (dropTarget.startsWith('character:')) {
        const characterId = dropTarget.replace('character:', '');
        await this.playCardOnCharacter(card, characterId);
      }
    } catch (error) {
      console.error('Error handling card drop:', error);
    }
    
    this.isAnimating = false;
  }

  /**
   * Return card to hand - Uses component methods
   */
  private returnCardToHand(card: Card): void {
    // Component handles the UI aspect
    // Business logic can be added here if needed
    console.log('Card returned to hand:', card.name);
  }

  /**
   * Show fallback UI using overlay component
   */
  private showFallbackUI(): void {
    const overlay = this.battleOverlayComponent.showFallbackUI(this.battleId);
    this.container.addChild(overlay);
  }

  /**
   * Show battle result using overlay component  
   */
  private showBattleResult(): void {
    if (!this.battleState) return;
    
    const isVictory = this.battleState.winner_team === 1;
    const overlay = this.battleOverlayComponent.showBattleResult(isVictory);
    this.container.addChild(overlay);
  }

  // ===== LIFECYCLE METHODS - Focused and clean =====

  /**
   * Resize handler - Delegates to components
   */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Resize all components
    this.playerHandComponent?.resize(width, height);
    this.opponentHandComponent?.resize(width, height);
    this.playerCharacterRowComponent?.resize(width, height);
    this.opponentCharacterRowComponent?.resize(width, height);
    this.playerEnergyDeckDiscardComponent?.resize(width, height);
    this.opponentEnergyDeckDiscardComponent?.resize(width, height);
    this.battleLogComponent?.resize(width, height);
    this.endTurnButtonComponent?.resize(width, height);
    this.battleOverlayComponent?.resize(width, height);
    
    // Recreate background for new dimensions
    this.backgroundContainer?.destroy();
    this.createBackground();
  }

  /**
   * Update method - Can be used for animations or real-time updates
   */
  public update(): void {
    // Game loop and animation updates can be added here
    // Components handle their own update logic
  }

  /**
   * Destroy method - Clean up components
   */
  destroy(): void {
    // Clean up components
    this.playerHandComponent?.destroy();
    this.opponentHandComponent?.destroy();
    this.playerCharacterRowComponent?.destroy();
    this.opponentCharacterRowComponent?.destroy();
    this.playerEnergyDeckDiscardComponent?.destroy();
    this.opponentEnergyDeckDiscardComponent?.destroy();
    this.battleLogComponent?.destroy();
    this.endTurnButtonComponent?.destroy();
    this.battleOverlayComponent?.destroy();
    this.dragDropManager?.destroy();
    
    super.destroy();
  }

  // ===== SIMPLIFIED STUB METHODS FOR DEMONSTRATION =====
  // These would contain the full business logic from the original file

  private async processTurnStart(): Promise<void> {
    if (this.playerCharacterRowComponent) {
      const characterCards = this.playerCharacterRowComponent.getCharacterCardsArray();
      await BattleAnimations.animateTurnStartEffects(characterCards);
    }
  }

  private async processDrawPhase(): Promise<void> {
    // Draw cards logic would be here
    // Update UI through components
    this.updateUI();
  }

  private async processEndTurn(): Promise<void> {
    if (this.playerCharacterRowComponent && this.opponentCharacterRowComponent) {
      const allCards = [
        ...this.playerCharacterRowComponent.getCharacterCardsArray(),
        ...this.opponentCharacterRowComponent.getCharacterCardsArray()
      ];
      await BattleAnimations.animateEndTurnEffects(allCards);
    }
  }

  private async processAITurn(): Promise<void> {
    // AI logic would be here
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI thinking
    this.updateUI();
  }

  private checkGameEnd(): boolean {
    if (!this.battleState) return false;
    
    if (this.battleState.status === 'completed') {
      this.showBattleResult();
      return true;
    }
    return false;
  }

  private async discardCardForEnergy(card: Card): Promise<void> {
    // Discard logic would be here
    console.log('Discarded card for energy:', card.name);
    this.updateUI();
  }

  private async playCardOnCharacter(card: Card, characterId: string): Promise<void> {
    // Play card logic would be here  
    console.log('Played card on character:', card.name, characterId);
    this.updateUI();
  }
}