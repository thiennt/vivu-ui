import { Container } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { HomeScene } from './HomeScene';
import { battleApi } from '@/services/api';
import { CardInDeck } from '@/types';
import { LoadingStateManager } from '@/utils/loadingStateManager';

// Import the new managers
import { CardBattleUIManager } from './cardBattle/UIManager';
import { CardBattleAnimationManager } from './cardBattle/AnimationManager';
import { CardBattlePlayerStateManager } from './cardBattle/PlayerStateManager';
import { CardBattleDragDropManager } from './cardBattle/DragDropManager';
import { CardBattleCardOperationsManager } from './cardBattle/CardOperationsManager';

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

  // Manager instances
  private uiManager!: CardBattleUIManager;
  private animationManager!: CardBattleAnimationManager;
  private playerStateManager!: CardBattlePlayerStateManager;
  private dragDropManager!: CardBattleDragDropManager;
  private cardOperationsManager!: CardBattleCardOperationsManager;

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

    // Initialize managers
    this.uiManager = new CardBattleUIManager(this);
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
    this.uiManager.createBackground(this.container, this.gameWidth, this.getContentHeight());
    this.createGameLayout();
    this.createActionButtons();
    this.updateBottomNavigation();
  }

  private createGameLayout(): void {
    this.uiManager.createGameLayout(
      this.gameContainer,
      this.player1Container,
      this.player2Container,
      this.player1HandContainer,
      this.player2HandContainer,
      this.player1EnergyContainer,
      this.player2EnergyContainer,
      this.battleLogContainer,
      this.effectsContainer,
      this.gameWidth,
      this.getContentHeight()
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
    this.uiManager.createPlayerArea(
      this.player1Container, 
      1, 
      this.playerStateManager.getPlayerCharacters(1), 
      this.gameWidth
    );
    this.uiManager.createPlayerArea(
      this.player2Container, 
      2, 
      this.playerStateManager.getPlayerCharacters(2), 
      this.gameWidth
    );
    this.uiManager.createEnergyArea(this.player1EnergyContainer, 1);
    this.uiManager.createEnergyArea(this.player2EnergyContainer, 2);
    
    // Create hand areas with proper data
    this.uiManager.createHandArea(
      this.player1HandContainer, 
      1, 
      true, 
      this.playerStateManager.getPlayerHandCards(1), 
      this.gameWidth
    );
    this.uiManager.createHandArea(
      this.player2HandContainer, 
      2, 
      false, 
      this.playerStateManager.getPlayerHandCards(2), 
      this.gameWidth
    );

    // Make player 1 cards draggable
    this.setupDragAndDrop();
    
    this.uiManager.createBattleLog(this.battleLogContainer, this.gameWidth);
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
}