import { Container, Graphics, Text, FederatedPointerEvent } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { Colors } from '@/utils/colors';
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

/**
 * Simple CardBattleScene - A cleaner, easier-to-understand version
 * 
 * This scene demonstrates a better balance between:
 * - Organization without over-engineering
 * - Simple, readable code structure  
 * - Essential separation of concerns
 * - Easy-to-follow game flow
 */
export class SimpleCardBattleScene extends BaseScene {
  public static assetBundles = [];
  
  public container: Container;
  
  // Core battle state - same as original
  private battleState: CardBattleState | null = null;
  private battleId: string;
  private currentPhase: BattlePhaseName = 'start_turn';
  private isAnimating: boolean = false;
  
  // UI containers - organized but not over-abstracted
  private backgroundContainer!: Container;
  private playerHandContainer!: Container;
  private opponentHandContainer!: Container;
  private playerCharactersContainer!: Container;
  private opponentCharactersContainer!: Container;
  private infoContainer!: Container; // Energy, deck, discard info
  private logContainer!: Container;
  private buttonContainer!: Container;
  
  // Simple UI data
  private playerHandCards: Container[] = [];
  private opponentHandCards: Container[] = [];
  private characterCards: Map<string, Container> = new Map();
  
  // Drag and drop - simplified
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  
  // Game flow control
  private mainPhaseResolve?: () => void;
  
  // Simple constants - use parent's STANDARD_PADDING
  private readonly HAND_CARD_WIDTH = 50;
  private readonly HAND_CARD_HEIGHT = 70;
  private readonly CHARACTER_CARD_WIDTH = 100;
  private readonly CHARACTER_CARD_HEIGHT = 140;

  constructor(battleId?: string) {
    super();
    
    this.battleId = battleId || 'mock-battle-001';
    this.container = new Container();
    this.addChild(this.container);
    
    // Simple initialization
    this.createContainers();
    this.createBackground();
    this.setupDragAndDrop();
    this.initializeBattle();
  }

  // =================================================================
  // SETUP METHODS - Simple and clear
  // =================================================================

  /**
   * Create all the UI containers we need
   */
  private createContainers(): void {
    this.backgroundContainer = new Container();
    this.playerHandContainer = new Container();
    this.opponentHandContainer = new Container();
    this.playerCharactersContainer = new Container();
    this.opponentCharactersContainer = new Container();
    this.infoContainer = new Container();
    this.logContainer = new Container();
    this.buttonContainer = new Container();
    
    // Add them in the right order
    this.container.addChild(
      this.backgroundContainer,
      this.opponentHandContainer,
      this.opponentCharactersContainer,
      this.playerCharactersContainer,
      this.playerHandContainer,
      this.infoContainer,
      this.logContainer,
      this.buttonContainer
    );
  }

  /**
   * Simple background creation
   */
  private createBackground(): void {
    this.backgroundContainer.removeChildren();
    
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill(Colors.BACKGROUND_PRIMARY);
    
    // Simple battlefield area
    const battlefield = new Graphics();
    battlefield.roundRect(
      this.STANDARD_PADDING, 
      this.gameHeight * 0.25, 
      this.gameWidth - (this.STANDARD_PADDING * 2),
      this.gameHeight * 0.4,
      8
    ).fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.3 })
     .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    this.backgroundContainer.addChild(bg, battlefield);
  }

  /**
   * Simple drag and drop setup
   */
  private setupDragAndDrop(): void {
    // Enable global pointer events
    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onGlobalPointerUp, this);
    app.stage.on('pointerupoutside', this.onGlobalPointerUp, this);
    app.stage.hitArea = app.screen;
  }

  // =================================================================
  // BATTLE INITIALIZATION - Core business logic
  // =================================================================

  /**
   * Initialize the battle - same business logic as original
   */
  private async initializeBattle(): Promise<void> {
    try {
      const response = await battleApi.getBattleState(this.battleId);
      if (response.success) {
        this.battleState = response.data;
        this.setupInitialUI();
        this.startGameLoop();
      } else {
        this.showFallbackUI();
      }
    } catch (error) {
      console.error('Failed to initialize battle:', error);
      this.showFallbackUI();
    }
  }

  /**
   * Setup initial UI based on battle state
   */
  private setupInitialUI(): void {
    if (!this.battleState) return;
    
    this.layoutContainers();
    this.setupCharacters();
    this.updateHandCards();
    this.updateInfoDisplay();
    this.updateLogDisplay();
    this.createEndTurnButton();
  }

  // =================================================================
  // LAYOUT METHODS - Simple positioning logic
  // =================================================================

  /**
   * Position all containers - simple layout calculation
   */
  private layoutContainers(): void {
    const padding = this.STANDARD_PADDING;
    const handHeight = this.HAND_CARD_HEIGHT + (padding * 2);
    const infoHeight = 60;
    const logHeight = 80;
    const buttonHeight = 44;
    
    // Opponent hand at top
    this.opponentHandContainer.y = padding;
    
    // Opponent characters 
    this.opponentCharactersContainer.y = handHeight + padding;
    
    // Player characters
    this.playerCharactersContainer.y = this.gameHeight * 0.6;
    
    // Player hand at bottom
    this.playerHandContainer.y = this.gameHeight - handHeight - infoHeight - logHeight - buttonHeight - (padding * 3);
    
    // Info panel above player hand
    this.infoContainer.y = this.playerHandContainer.y - infoHeight - padding;
    
    // Log above info
    this.logContainer.y = this.infoContainer.y - logHeight - padding;
    
    // Button at bottom
    this.buttonContainer.y = this.gameHeight - buttonHeight - padding;
  }

  // =================================================================
  // CHARACTER SETUP - Simple character display
  // =================================================================

  /**
   * Setup characters on the battlefield
   */
  private setupCharacters(): void {
    if (!this.battleState) return;
    
    const player1 = this.battleState.players.find(p => p.team === 1);
    const player2 = this.battleState.players.find(p => p.team === 2);
    
    if (player1) this.createCharacterRow(player1, this.playerCharactersContainer, false);
    if (player2) this.createCharacterRow(player2, this.opponentCharactersContainer, true);
  }

  /**
   * Create a row of character cards
   */
  private createCharacterRow(player: CardBattlePlayerState, container: Container, isOpponent: boolean): void {
    container.removeChildren();
    
    const characters = player.characters || [];
    const cardWidth = this.CHARACTER_CARD_WIDTH;
    const spacing = 10;
    const totalWidth = (characters.length * cardWidth) + ((characters.length - 1) * spacing);
    const startX = (this.gameWidth - totalWidth) / 2;
    
    characters.forEach((character, index) => {
      const x = startX + (index * (cardWidth + spacing));
      const card = this.createCharacterCard(character, x, 0, isOpponent);
      container.addChild(card);
      this.characterCards.set(character.id, card);
    });
  }

  /**
   * Create a single character card - simple but complete
   */
  private createCharacterCard(character: CardBattleCharacter, x: number, y: number, isOpponent: boolean): Container {
    const card = new Container();
    card.x = x;
    card.y = y;
    
    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, this.CHARACTER_CARD_WIDTH, this.CHARACTER_CARD_HEIGHT, 8)
      .fill(isOpponent ? Colors.TEAM_ENEMY : Colors.TEAM_ALLY)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Character name
    const nameText = new Text({
      text: character.name || 'Character',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        wordWrap: true,
        wordWrapWidth: this.CHARACTER_CARD_WIDTH - 10
      }
    });
    nameText.x = 5;
    nameText.y = 5;
    
    // Health display
    const healthText = new Text({
      text: `${character.hp}/${character.max_hp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY
      }
    });
    healthText.x = 5;
    healthText.y = this.CHARACTER_CARD_HEIGHT - 20;
    
    card.addChild(bg, nameText, healthText);
    
    // Make interactive for targeting (if not opponent)
    if (!isOpponent) {
      card.eventMode = 'static';
      card.cursor = 'pointer';
      card.on('pointerover', () => {
        gsap.to(card.scale, { x: 1.05, y: 1.05, duration: 0.1 });
      });
      card.on('pointerout', () => {
        gsap.to(card.scale, { x: 1, y: 1, duration: 0.1 });
      });
    }
    
    return card;
  }

  // =================================================================
  // HAND CARD METHODS - Simple hand management
  // =================================================================

  /**
   * Update hand cards display
   */
  private updateHandCards(): void {
    if (!this.battleState) return;
    
    const player1 = this.battleState.players.find(p => p.team === 1);
    const player2 = this.battleState.players.find(p => p.team === 2);
    
    if (player1?.deck.hand_cards) {
      this.updatePlayerHandCards(player1.deck.hand_cards, this.playerHandContainer, this.playerHandCards, false);
    }
    
    if (player2?.deck.hand_cards) {
      this.updatePlayerHandCards(player2.deck.hand_cards, this.opponentHandContainer, this.opponentHandCards, true);
    }
  }

  /**
   * Update a specific player's hand
   */
  private updatePlayerHandCards(handCards: any[], container: Container, cardArray: Container[], isOpponent: boolean): void {
    // Clear existing cards
    container.removeChildren();
    cardArray.length = 0;
    
    if (handCards.length === 0) return;
    
    // Simple hand layout
    const maxCards = 6;
    const visibleCards = handCards.slice(0, maxCards);
    const cardWidth = this.HAND_CARD_WIDTH;
    const spacing = Math.min(cardWidth + 5, this.gameWidth / visibleCards.length);
    const totalWidth = (visibleCards.length - 1) * spacing + cardWidth;
    const startX = (this.gameWidth - totalWidth) / 2;
    
    visibleCards.forEach((handCard, index) => {
      const x = startX + (index * spacing);
      const card = this.createHandCard(handCard.card, x, this.STANDARD_PADDING, isOpponent);
      container.addChild(card);
      cardArray.push(card);
    });
  }

  /**
   * Create a hand card - simple and functional
   */
  private createHandCard(card: Card, x: number, y: number, isOpponent: boolean): Container {
    const cardContainer = new Container();
    cardContainer.x = x;
    cardContainer.y = y;
    
    // Store card data
    (cardContainer as any).cardData = card;
    
    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, this.HAND_CARD_WIDTH, this.HAND_CARD_HEIGHT, 6)
      .fill(isOpponent ? Colors.CARD_BACK : Colors.CARD_BACKGROUND)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    if (!isOpponent) {
      // Show card details for player
      const nameText = new Text({
        text: card.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 8,
          fontWeight: 'bold',
          fill: Colors.TEXT_PRIMARY,
          wordWrap: true,
          wordWrapWidth: this.HAND_CARD_WIDTH - 4
        }
      });
      nameText.x = 2;
      nameText.y = 2;
      
      // Cost
      const costText = new Text({
        text: card.energy_cost?.toString() || '0',
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fontWeight: 'bold',
          fill: Colors.ENERGY_TEXT
        }
      });
      costText.x = this.HAND_CARD_WIDTH - 12;
      costText.y = 2;
      
      cardContainer.addChild(bg, nameText, costText);
      
      // Make draggable
      this.makeCardDraggable(cardContainer);
    } else {
      // Just show card back for opponent
      cardContainer.addChild(bg);
    }
    
    return cardContainer;
  }

  /**
   * Make a card draggable - simple drag implementation
   */
  private makeCardDraggable(card: Container): void {
    card.eventMode = 'static';
    card.cursor = 'grab';
    
    card.on('pointerdown', (event: FederatedPointerEvent) => {
      this.dragTarget = card;
      this.dragOffset.x = event.globalX - card.x;
      this.dragOffset.y = event.globalY - card.y;
      card.cursor = 'grabbing';
      
      // Bring to front
      if (card.parent) {
        card.parent.addChild(card);
      }
      
      // Start tracking global move
      app.stage.on('pointermove', this.onGlobalPointerMove, this);
    });
  }

  /**
   * Handle global pointer move for dragging
   */
  private onGlobalPointerMove(event: FederatedPointerEvent): void {
    if (this.dragTarget) {
      this.dragTarget.x = event.globalX - this.dragOffset.x;
      this.dragTarget.y = event.globalY - this.dragOffset.y;
    }
  }

  /**
   * Handle global pointer up - end dragging
   */
  private onGlobalPointerUp(event: FederatedPointerEvent): void {
    if (this.dragTarget) {
      // Check for drop targets
      const dropTarget = this.getDropTarget(event.globalX, event.globalY);
      
      if (dropTarget) {
        this.handleCardDrop((this.dragTarget as any).cardData, dropTarget);
      } else {
        // Return to hand
        this.returnCardToHand(this.dragTarget);
      }
      
      this.dragTarget.cursor = 'grab';
      this.dragTarget = null;
      
      // Stop tracking move
      app.stage.off('pointermove', this.onGlobalPointerMove, this);
    }
  }

  /**
   * Simple drop target detection
   */
  private getDropTarget(x: number, y: number): string | null {
    // Check if over discard area (info container)
    if (this.isPointInContainer(x, y, this.infoContainer)) {
      return 'discard';
    }
    
    // Check if over character
    for (const [characterId, charCard] of this.characterCards) {
      if (this.isPointInContainer(x, y, charCard)) {
        return `character:${characterId}`;
      }
    }
    
    return null;
  }

  /**
   * Simple point-in-container check
   */
  private isPointInContainer(x: number, y: number, container: Container): boolean {
    const bounds = container.getBounds();
    return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
  }

  /**
   * Return card to original position with animation
   */
  private returnCardToHand(card: Container): void {
    const originalIndex = this.playerHandCards.indexOf(card);
    if (originalIndex !== -1) {
      const maxCards = 6;
      const cardWidth = this.HAND_CARD_WIDTH;
      const spacing = Math.min(cardWidth + 5, this.gameWidth / Math.min(this.playerHandCards.length, maxCards));
      const totalWidth = (Math.min(this.playerHandCards.length, maxCards) - 1) * spacing + cardWidth;
      const startX = (this.gameWidth - totalWidth) / 2;
      const targetX = startX + (originalIndex * spacing);
      const targetY = this.STANDARD_PADDING;
      
      gsap.to(card, {
        x: targetX,
        y: targetY,
        duration: 0.3,
        ease: 'back.out(1.7)'
      });
    }
  }

  // =================================================================
  // INFO AND UI METHODS - Simple information display
  // =================================================================

  /**
   * Update info display (energy, deck, discard)
   */
  private updateInfoDisplay(): void {
    this.infoContainer.removeChildren();
    
    if (!this.battleState) return;
    
    const player1 = this.battleState.players.find(p => p.team === 1);
    if (!player1) return;
    
    // Simple info background
    const bg = new Graphics();
    bg.roundRect(0, 0, this.gameWidth, 60, 8)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
      .stroke({ width: 1, color: Colors.UI_BORDER });
    
    // Energy display
    const energyText = new Text({
      text: `Energy: ${player1.deck.current_energy || 0}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.ENERGY_TEXT
      }
    });
    energyText.x = 20;
    energyText.y = 20;
    
    // Deck count
    const deckCount = player1.deck.deck_cards?.length || 0;
    const deckText = new Text({
      text: `Deck: ${deckCount}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_SECONDARY
      }
    });
    deckText.x = 150;
    deckText.y = 22;
    
    // Discard count  
    const discardCount = player1.deck.discard_cards?.length || 0;
    const discardText = new Text({
      text: `Discard: ${discardCount}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_SECONDARY
      }
    });
    discardText.x = 250;
    discardText.y = 22;
    
    this.infoContainer.addChild(bg, energyText, deckText, discardText);
  }

  /**
   * Update battle log display
   */
  private updateLogDisplay(): void {
    this.logContainer.removeChildren();
    
    // Simple log background
    const bg = new Graphics();
    bg.roundRect(0, 0, this.gameWidth, 80, 8)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.6 })
      .stroke({ width: 1, color: Colors.UI_BORDER });
    
    // Log title
    const titleText = new Text({
      text: 'Battle Log',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    titleText.x = 10;
    titleText.y = 5;
    
    // Recent action (simplified)
    const actionText = new Text({
      text: 'Turn started. Draw your cards!',
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY,
        wordWrap: true,
        wordWrapWidth: this.gameWidth - 20
      }
    });
    actionText.x = 10;
    actionText.y = 25;
    
    this.logContainer.addChild(bg, titleText, actionText);
  }

  /**
   * Create end turn button
   */
  private createEndTurnButton(): void {
    this.buttonContainer.removeChildren();
    
    const buttonWidth = Math.min(200, this.gameWidth - 40);
    const buttonHeight = 44;
    
    const button = new Container();
    button.x = (this.gameWidth - buttonWidth) / 2;
    
    // Button background
    const bg = new Graphics();
    bg.roundRect(0, 0, buttonWidth, buttonHeight, 22)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    // Button text
    const text = new Text({
      text: 'End Turn',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON
      }
    });
    text.x = (buttonWidth - text.width) / 2;
    text.y = (buttonHeight - text.height) / 2;
    
    button.addChild(bg, text);
    
    // Make interactive
    button.eventMode = 'static';
    button.cursor = 'pointer';
    button.on('pointerdown', this.onEndTurnClick, this);
    
    // Hover effect
    button.on('pointerover', () => {
      gsap.to(button.scale, { x: 1.05, y: 1.05, duration: 0.1 });
    });
    button.on('pointerout', () => {
      gsap.to(button.scale, { x: 1, y: 1, duration: 0.1 });
    });
    
    this.buttonContainer.addChild(button);
  }

  // =================================================================
  // GAME FLOW - Core business logic preserved but simplified
  // =================================================================

  /**
   * Start the game loop - same logic, cleaner flow
   */
  private async startGameLoop(): Promise<void> {
    while (this.battleState && this.battleState.status === 'ongoing') {
      // Turn phases
      this.currentPhase = 'start_turn';
      await this.processTurnStart();
      
      this.currentPhase = 'draw_phase';
      await this.processDrawPhase();
      
      this.currentPhase = 'main_phase';
      await this.processMainPhase();
      
      this.currentPhase = 'end_turn';
      await this.processEndTurn();
      
      if (this.checkGameEnd()) break;
      
      // AI turn
      await this.processAITurn();
    }
  }

  private async processTurnStart(): Promise<void> {
    console.log('Turn started');
    // Simple turn start effects
    const characterContainers = Array.from(this.characterCards.values());
    if (characterContainers.length > 0) {
      gsap.from(characterContainers, {
        scale: 0.9,
        duration: 0.3,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      });
    }
  }

  private async processDrawPhase(): Promise<void> {
    try {
      const response = await battleApi.drawCards(this.battleId, {
        type: 'draw_card',
        player_team: 1
      });
      
      if (response.success) {
        this.battleState = response.data;
        this.updateHandCards();
        this.updateInfoDisplay();
        
        // Simple draw animation
        const newCards = this.playerHandCards.slice(-2);
        if (newCards.length > 0) {
          gsap.from(newCards, {
            y: '-=100',
            alpha: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'back.out(1.7)'
          });
        }
      }
    } catch (error) {
      console.error('Draw phase error:', error);
    }
  }

  private async processMainPhase(): Promise<void> {
    // Wait for player to end turn
    return new Promise<void>((resolve) => {
      this.mainPhaseResolve = resolve;
    });
  }

  private async processEndTurn(): Promise<void> {
    try {
      const response = await battleApi.endTurn(this.battleId, {
        type: 'end_turn',
        player_team: 1
      });
      
      if (response.success) {
        this.battleState = response.data;
        this.updateHandCards();
        this.updateInfoDisplay();
      }
    } catch (error) {
      console.error('End turn error:', error);
    }
  }

  private async processAITurn(): Promise<void> {
    console.log('AI thinking...');
    // Simple AI delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update UI after AI turn
    this.updateHandCards();
    this.updateInfoDisplay();
  }

  private checkGameEnd(): boolean {
    if (!this.battleState) return false;
    
    if (this.battleState.status === 'completed') {
      this.showBattleResult();
      return true;
    }
    return false;
  }

  // =================================================================
  // EVENT HANDLERS - Simple and clear
  // =================================================================

  /**
   * Handle end turn button click
   */
  private onEndTurnClick(): void {
    if (this.mainPhaseResolve) {
      this.mainPhaseResolve();
      this.mainPhaseResolve = undefined;
    }
  }

  /**
   * Handle card drop on targets
   */
  private async handleCardDrop(card: Card, dropTarget: string): Promise<void> {
    if (!this.battleState || this.isAnimating) return;
    
    this.isAnimating = true;
    
    try {
      if (dropTarget === 'discard') {
        await this.discardCardForEnergy(card);
      } else if (dropTarget.startsWith('character:')) {
        const characterId = dropTarget.replace('character:', '');
        await this.playCardOnCharacter(card, characterId);
      }
    } catch (error) {
      console.error('Card drop error:', error);
    } finally {
      this.isAnimating = false;
    }
  }

  private async discardCardForEnergy(card: Card): Promise<void> {
    try {
      const response = await battleApi.discardCard(this.battleId, {
        type: 'discard_card',
        player_team: 1,
        card_id: card.id
      });
      
      if (response.success) {
        this.battleState = response.data;
        this.updateHandCards();
        this.updateInfoDisplay();
        console.log(`Discarded ${card.name} for energy`);
      }
    } catch (error) {
      console.error('Discard error:', error);
    }
  }

  private async playCardOnCharacter(card: Card, characterId: string): Promise<void> {
    try {
      const response = await battleApi.playCard(this.battleId, {
        type: 'play_card',
        player_team: 1,
        card_id: card.id,
        target_ids: [characterId]
      });
      
      if (response.success) {
        this.battleState = response.data;
        this.updateHandCards();
        this.updateInfoDisplay();
        this.updateCharacterStates();
        console.log(`Played ${card.name} on character ${characterId}`);
      }
    } catch (error) {
      console.error('Play card error:', error);
    }
  }

  /**
   * Update character states after actions
   */
  private updateCharacterStates(): void {
    if (!this.battleState) return;
    
    // Simple character state updates
    this.battleState.players.forEach(player => {
      player.characters?.forEach(character => {
        const card = this.characterCards.get(character.id);
        if (card) {
          // Find and update health text
          const healthText = card.children.find(child => 
            child instanceof Text && child.text.includes('/')
          ) as Text;
          
          if (healthText) {
            healthText.text = `${character.hp}/${character.max_hp}`;
          }
        }
      });
    });
  }

  // =================================================================
  // FALLBACK AND RESULTS - Simple UI
  // =================================================================

  private showFallbackUI(): void {
    const overlay = new Container();
    
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x000000, alpha: 0.8 });
    
    const text = new Text({
      text: 'Battle could not be loaded.\nPlease try again.',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    text.x = (this.gameWidth - text.width) / 2;
    text.y = (this.gameHeight - text.height) / 2;
    
    overlay.addChild(bg, text);
    this.container.addChild(overlay);
  }

  private showBattleResult(): void {
    if (!this.battleState) return;
    
    const overlay = new Container();
    
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x000000, alpha: 0.8 });
    
    const isVictory = this.battleState.winner_team === 1;
    const text = new Text({
      text: isVictory ? 'Victory!' : 'Defeat!',
      style: {
        fontFamily: 'Kalam',
        fontSize: 32,
        fontWeight: 'bold',
        fill: isVictory ? Colors.SUCCESS : Colors.ERROR,
        align: 'center'
      }
    });
    text.x = (this.gameWidth - text.width) / 2;
    text.y = (this.gameHeight - text.height) / 2;
    
    overlay.addChild(bg, text);
    this.container.addChild(overlay);
  }

  // =================================================================
  // LIFECYCLE METHODS - Simple cleanup
  // =================================================================

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Recreate layout
    this.createBackground();
    this.layoutContainers();
    this.updateHandCards();
    this.updateInfoDisplay();
    this.updateLogDisplay();
    this.createEndTurnButton();
  }

  public update(): void {
    // Simple update loop - can add real-time updates here
  }

  destroy(): void {
    // Clean up event listeners
    app.stage.off('pointerup', this.onGlobalPointerUp, this);
    app.stage.off('pointerupoutside', this.onGlobalPointerUp, this);
    app.stage.off('pointermove', this.onGlobalPointerMove, this);
    
    super.destroy();
  }
}