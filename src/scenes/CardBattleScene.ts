import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { HomeScene } from './HomeScene';
import { battleApi } from '@/services/api';
import { CardBattleState, CardInDeck } from '@/types';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { Colors, Gradients } from '@/utils/colors';

import { CardBattleAnimationManager } from './cardBattle/AnimationManager';
import { CardBattlePlayerStateManager } from './cardBattle/PlayerStateManager';
import { CardBattleDragDropManager } from './cardBattle/DragDropManager';
import { CardBattleCardOperationsManager } from './cardBattle/CardOperationsManager';
import { CardBattleUIManager } from './cardBattle/UIManager';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private gameContainer!: Container;
  private player1Container!: Container;
  private player2Container!: Container;
  private player1HandContainer!: Container;
  private player2HandContainer!: Container;
  private player1EnergyContainer!: Container;
  private player2EnergyContainer!: Container;
  private battleLogContainer!: Container;
  private effectsContainer!: Container;

  private battleId: string;
  private loadingManager: LoadingStateManager;
  private battleState?: CardBattleState;

  private animationManager!: CardBattleAnimationManager;
  private playerStateManager!: CardBattlePlayerStateManager;
  private dragDropManager!: CardBattleDragDropManager;
  private cardOperationsManager!: CardBattleCardOperationsManager;
  private uiManager!: CardBattleUIManager;

  // UI state from backup
  private dropZones: { area: Container, type: 'character' | 'discard', playerId: number, characterIndex?: number }[] = [];
  private dragTarget: Container | null = null;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };

  // Note: Player state is now managed by PlayerStateManager - removed duplicate variables

  constructor(params?: { battle_id?: string }) {
    super();

    this.container = new Container();
    this.addChild(this.container);

    this.battleId = params?.battle_id || '';

    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);

    // Initialize managers
    this.initializeManagers();
  }

  private initializeManagers(): void {
    // Create containers first
    this.gameContainer = new Container();
    this.player1Container = new Container();
    this.player2Container = new Container();
    this.player1HandContainer = new Container();
    this.player2HandContainer = new Container();
    this.player1EnergyContainer = new Container();
    this.player2EnergyContainer = new Container();
    this.battleLogContainer = new Container();
    this.effectsContainer = new Container();

    this.animationManager = new CardBattleAnimationManager(this.effectsContainer, this.gameWidth, this.gameHeight);
    this.playerStateManager = new CardBattlePlayerStateManager();
    this.dragDropManager = new CardBattleDragDropManager({
      container: this.container,
      playCardOnCharacter: this.playCardOnCharacter.bind(this),
      discardCard: this.discardCard.bind(this)
    });
    this.cardOperationsManager = new CardBattleCardOperationsManager(
      this.playerStateManager,
      this.animationManager,
      this.battleId
    );
    this.uiManager = new CardBattleUIManager(this);
  }

  async prepare(): Promise<void> {
    this.loadingManager.showLoading();

    try {
      console.log('🔄 Preparing CardBattleScene...');
      
      // Load battle state from API (will use mock data if configured)
      console.log('🔄 Loading battle state...');
      const response = await battleApi.getBattleState(this.battleId);
      if (response.success && response.data) {
        this.playerStateManager.setBattleState(response.data);
        this.battleState = response.data;
        console.log(`✅ Battle state loaded: ${response.message}`);
      } else {
        console.error(`❌ Failed to load battle state: ${response.message}`);
        if (response.errors) {
          response.errors.forEach((error: unknown) => console.error(`   Error: ${error}`));
        }
        throw new Error('Failed to load battle state');
      }
      
      this.loadingManager.hideLoading();
      this.initializeUI();
      
    } catch (error) {
      console.error('❌ Error preparing battle scene:', error);
      this.loadingManager.hideLoading();
      alert('Failed to prepare battle. Please try again.');
      navigation.showScreen(HomeScene);
    }
  }

  private initializeUI(): void {
    this.createBackground();
    this.createGameLayout();
    this.createActionButtons();
    this.updateBottomNavigation();
  }

  private createGameLayout(): void {
    this.gameContainer = new Container();
    
    // Create main containers (effectsContainer already created in initializeManagers)
    this.player1Container = new Container();
    this.player2Container = new Container();
    this.player1HandContainer = new Container();
    this.player2HandContainer = new Container();
    this.player1EnergyContainer = new Container();
    this.player2EnergyContainer = new Container();
    this.battleLogContainer = new Container();

    // Layout calculations - fit all elements with proper spacing
    const availableHeight = this.getContentHeight();
    const padding = this.STANDARD_PADDING;
    const spacing = this.STANDARD_SPACING;
    
    // Calculate heights for each section
    const handHeight = 80;
    const characterAreaHeight = 100;
    const energyHeight = 35;
    const logHeight = 60;
    
    // Total required height
    const totalRequiredHeight = handHeight + characterAreaHeight + energyHeight + logHeight + energyHeight + characterAreaHeight + handHeight + (spacing * 7) + (padding * 2);
    
    // Adjust spacing if needed to fit everything
    let adjustedSpacing = spacing;
    if (totalRequiredHeight > availableHeight) {
      adjustedSpacing = Math.max(5, (availableHeight - (handHeight * 2 + characterAreaHeight * 2 + energyHeight * 2 + logHeight + padding * 2)) / 7);
    }
    
    let currentY = padding;
    
    // Layout in order according to requirements:
    // 1. Player 2 Hand Area
    this.player2HandContainer.y = currentY;
    this.createHandArea(this.player2HandContainer, 2, false);
    currentY += handHeight + adjustedSpacing;
    
    // 2. Player 2 character cards (with deck + discard pile)
    this.player2Container.y = currentY;
    this.createPlayerArea(this.player2Container, 2);
    currentY += characterAreaHeight + adjustedSpacing;
    
    // 3. Player 2 energy area
    this.player2EnergyContainer.y = currentY;
    this.createEnergyArea(this.player2EnergyContainer, 2);
    currentY += energyHeight + adjustedSpacing;

    // 4. Battle log
    this.battleLogContainer.y = currentY;
    this.createBattleLog();
    currentY += logHeight + adjustedSpacing;
    
    // 5. Player 1 energy area
    this.player1EnergyContainer.y = currentY;
    this.createEnergyArea(this.player1EnergyContainer, 1);
    currentY += energyHeight + adjustedSpacing;
    
    // 6. Player 1 character cards
    this.player1Container.y = currentY;
    this.createPlayerArea(this.player1Container, 1);
    currentY += characterAreaHeight + adjustedSpacing;
    
    // 7. Player 1 hand area
    this.player1HandContainer.y = currentY;
    this.createHandArea(this.player1HandContainer, 1, true);

    this.gameContainer.addChild(
      this.player2HandContainer,
      this.player2Container,
      this.player2EnergyContainer,
      this.battleLogContainer,
      this.player1EnergyContainer,
      this.player1Container,
      this.player1HandContainer,
      this.effectsContainer
    );

    this.container.addChild(this.gameContainer);
    this.refreshUI();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
  }

  /** Show the screen with animation */
  async show(): Promise<void> {
    this.cardOperationsManager.startBattleSequence();
    this.refreshUI();
  }

  // Delegated methods for card operations
  async playCardOnCharacter(card: CardInDeck, targetPlayerId: number, characterIndex: number): Promise<void> {
    await this.cardOperationsManager.playCardOnCharacter(card, targetPlayerId, characterIndex);
    this.refreshUI();
  }

  async discardCard(card: CardInDeck): Promise<void> {
    await this.cardOperationsManager.discardCard(card);
    this.refreshUI();
  }

  private async endTurn(): Promise<void> {
    await this.cardOperationsManager.endTurn();
    this.refreshUI();
  }

  private createActionButtons(): void {
    const buttonContainer = new Container();
    const buttonWidth = 120;
    const buttonHeight = 44;

    // End Turn button
    const endTurnButton = this.createButton(
      'End Turn',
      this.gameWidth - buttonWidth - this.STANDARD_PADDING,
      this.getContentHeight() - buttonHeight - 10,
      buttonWidth,
      buttonHeight,
      () => this.endTurn(),
      12
    );
    
    // Back button
    const backButton = this.createButton(
      '← Back',
      this.STANDARD_PADDING,
      this.getContentHeight() - buttonHeight - 10,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene),
      12
    );
    
    buttonContainer.addChild(endTurnButton, backButton);
    this.container.addChild(buttonContainer);
  }

  private refreshUI(): void {
    // Clear containers before re-adding content
    this.player1HandContainer.removeChildren();
    this.player2HandContainer.removeChildren();
    this.player1EnergyContainer.removeChildren();
    this.player2EnergyContainer.removeChildren();
    this.battleLogContainer.removeChildren();
    this.player1Container.removeChildren();
    this.player2Container.removeChildren();
    
    // Recreate all areas with current data
    this.createPlayerArea(this.player1Container, 1);
    this.createPlayerArea(this.player2Container, 2);
    this.createEnergyArea(this.player1EnergyContainer, 1);
    this.createEnergyArea(this.player2EnergyContainer, 2);
    
    // Create hand areas with proper data
    this.createHandArea(this.player1HandContainer, 1, true);
    this.createHandArea(this.player2HandContainer, 2, false);
    
    this.createBattleLog();

    // Make player 1 cards draggable
    this.setupDragAndDrop();
  }

  private setupDragAndDrop(): void {
    // Make player 1 hand cards draggable
    for (const child of this.player1HandContainer.children) {
      this.dragDropManager.makeCardDraggable(child as Container);
    }

    // Set up drop zones
    const dropZones: { area: Container, type: 'character' | 'discard', playerId: number, characterIndex?: number }[] = [];
    
    // Add character drop zones
    this.player1Container.children.forEach((child, index) => {
      dropZones.push({
        area: child as Container,
        type: 'character',
        playerId: 1,
        characterIndex: index
      });
    });
    
    this.player2Container.children.forEach((child, index) => {
      dropZones.push({
        area: child as Container,
        type: 'character',
        playerId: 2,
        characterIndex: index
      });
    });

    this.dragDropManager.setDropZones(dropZones);
  }

  // UI Creation Methods from backup

  private createBackground(): void {
    const bg = new Graphics();
    const availableHeight = this.getContentHeight();
    const backgroundGradient = Gradients.createBackgroundGradient(this.gameWidth, availableHeight);
    bg.rect(0, 0, this.gameWidth, availableHeight).fill(backgroundGradient);
    this.container.addChild(bg);
  }

  private createEnergyArea(container: Container, playerNo: number): void {
    const player = this.battleState ? this.battleState.players.find(p => p.team === playerNo) : null;

    // Energy display - centered horizontally
    const energyBg = new Graphics();
    energyBg.roundRect(0, 0, 140, 30, 8)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    const energyText = new Text({
      text: `Energy: ${player?.deck.current_energy || 0}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = 70;
    energyText.y = 15;

    container.addChild(energyBg, energyText);
    
    // Center the energy display horizontally
    container.x = (this.gameWidth - 140) / 2;
  }

  private createPlayerArea(container: Container, playerNo: number): void {
    const characterWidth = 80;
    const characterSpacing = 10;
    const padding = this.STANDARD_PADDING;

    const characters = this.playerStateManager.getPlayerCharacters(playerNo);
    const deckCards = this.playerStateManager.getPlayerDeckCards(playerNo);
    const discardCards = this.playerStateManager.getPlayerDiscardedCards(playerNo);
    
    const totalCharacterWidth = characters.length * characterWidth + Math.max(0, characters.length - 1) * characterSpacing;
    const startX = (this.gameWidth - totalCharacterWidth) / 2;

    // Create character cards (energy is now handled separately)
    characters.forEach((character, index) => {
      const x = startX + index * (characterWidth + characterSpacing);
      const y = 10; // Reduced Y offset since energy is separate
      const characterCard = this.uiManager.createCharacterCard(character, x, y, characterWidth);
      
      this.dropZones.push({
        area: characterCard,
        type: 'character',
        playerId: playerNo,
        characterIndex: index
      });
      
      container.addChild(characterCard);
    });

    // Deck and discard pile
    const deckX = padding;
    const discardX = this.gameWidth - padding - 60;
    const pileY = 10; // Reduced Y offset since energy is separate

    // Deck
    const deckCard = this.uiManager.createDeckCard(deckX, pileY, deckCards.length);
    container.addChild(deckCard);

    // Discard pile
    const discardCard = this.uiManager.createDiscardPile(discardX, pileY, discardCards);
    
    this.dropZones.push({
      area: discardCard,
      type: 'discard',
      playerId: playerNo
    });
    
    container.addChild(discardCard);
  }

  private createHandArea(container: Container, playerNo: number, showCards: boolean): void {
    const handCards = this.playerStateManager.getPlayerHandCards(playerNo);
    
    // Use UIManager to create the hand area
    this.uiManager.createHandArea(container, playerNo, showCards, handCards, this.gameWidth);

    // Make player 1 cards draggable
    if (showCards && playerNo === 1) {
      for (const child of container.children) {
        this.makeCardDraggable(child as Container);
      }
    }
  }

  private createBattleLog(): void {
    this.uiManager.createBattleLog(this.battleLogContainer, this.gameWidth);
  }

  private makeCardDraggable(cardContainer: Container): void {
    cardContainer.eventMode = 'static';
    cardContainer.cursor = 'pointer';
    
    cardContainer.on('pointerdown', () => {
      this.onDragStart();
    });
  }

  // Helper functions for card property access
  private getCurrentPlayer(): number {
    return this.battleState?.current_player || 1;
  }

  private getEnergyCost(card: { energyCost?: number; energy_cost?: number }): number {
    if ('energyCost' in card && card.energyCost !== undefined) {
      return card.energyCost;
    } else {
      return card.energy_cost || 0;
    }
  }
  
  private getCardType(card: { cardType?: string; card_type?: string }): string {
    if ('cardType' in card && card.cardType) {
      return card.cardType;
    } else {
      return card.card_type || 'special';
    }
  }

  // Drag and drop handlers (simplified for now)
  private onDragStart(): void {
    // Simplified drag start - just log for now
    console.log('Card drag started');
    // TODO: Implement full drag and drop functionality
  }
}