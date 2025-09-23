import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { HomeScene } from './HomeScene';
import { battleApi } from '@/services/api';
import { CardBattleState, CardBattleCharacter, CardInDeck } from '@/types';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { Colors, Gradients } from '@/utils/colors';

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
  private battleState?: CardBattleState;

  private animationManager!: CardBattleAnimationManager;
  private playerStateManager!: CardBattlePlayerStateManager;
  private dragDropManager!: CardBattleDragDropManager;
  private cardOperationsManager!: CardBattleCardOperationsManager;

  // UI state from backup
  private dropZones: { area: Container, type: 'character' | 'discard', playerId: number, characterIndex?: number }[] = [];
  private dragTarget: Container | null = null;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };

  // Player state arrays from backup
  private player1Characters: CardBattleCharacter[] = [];
  private player1HandCards: CardInDeck[] = [];
  private player1DeckCards: CardInDeck[] = [];
  private player1DiscardedCards: CardInDeck[] = [];
  private player2Characters: CardBattleCharacter[] = [];
  private player2HandCards: CardInDeck[] = [];
  private player2DeckCards: CardInDeck[] = [];
  private player2DiscardedCards: CardInDeck[] = [];

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
        this.updateFixedVariables(); // Update fixed variables when battle state loads
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
    
    // Create main containers
    this.player1Container = new Container();
    this.player2Container = new Container();
    this.player1HandContainer = new Container();
    this.player2HandContainer = new Container();
    this.player1EnergyContainer = new Container();
    this.player2EnergyContainer = new Container();
    this.battleLogContainer = new Container();
    this.effectsContainer = new Container();

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

    const characters = this.getPlayerCharacters(playerNo);
    const deckCards = this.getPlayerDeckCards(playerNo);
    const discardCards = this.getPlayerDiscardedCards(playerNo);
    
    const totalCharacterWidth = characters.length * characterWidth + Math.max(0, characters.length - 1) * characterSpacing;
    const startX = (this.gameWidth - totalCharacterWidth) / 2;

    // Create character cards (energy is now handled separately)
    characters.forEach((character, index) => {
      const x = startX + index * (characterWidth + characterSpacing);
      const y = 10; // Reduced Y offset since energy is separate
      const characterCard = this.createCharacterCard(character, x, y, characterWidth);
      
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
    const deckCard = this.createDeckCard(deckX, pileY, deckCards.length);
    container.addChild(deckCard);

    // Discard pile
    const discardCard = this.createDiscardPile(discardX, pileY, discardCards);
    
    this.dropZones.push({
      area: discardCard,
      type: 'discard',
      playerId: playerNo
    });
    
    container.addChild(discardCard);
  }

  private createHandArea(container: Container, playerNo: number, showCards: boolean): void {
    const player = this.battleState ? this.battleState.players.find(p => p.team === playerNo) : null;
    const handCards = this.getPlayerHandCards(playerNo);

    if (!player) return;

    const cardWidth = 60;
    const handCount = handCards.length;
    const padding = this.STANDARD_PADDING;
    const maxVisible = 5;
    let cardSpacing: number;
    let totalWidth: number;
    let startX: number;

    if (handCount <= maxVisible) {
      // Fixed spacing, center the hand
      cardSpacing = cardWidth + 12; // 12px gap between cards
      totalWidth = cardWidth + (handCount - 1) * cardSpacing;
      startX = (this.gameWidth - totalWidth) / 2;
    } else {
      // Overlap so all cards fit between paddings
      cardSpacing = (this.gameWidth - 2 * padding - cardWidth) / (handCount - 1);
      cardSpacing = Math.min(cardSpacing, cardWidth); // Prevent negative/too much overlap
      startX = padding;
    }

    for (let index = 0; index < handCount; index++) {
      const x = startX + index * cardSpacing;
      const y = 10;

      const card = handCards[index];

      const cardContainer = showCards
        ? this.createHandCard(card, x, y, cardWidth)
        : this.createFaceDownCard(x, y, cardWidth);

      // Make player 1 cards draggable
      if (showCards && playerNo === 1) {
        this.makeCardDraggable(cardContainer);
      }

      container.addChild(cardContainer);
    }
  }

  private createCharacterCard(character: CardBattleCharacter, x: number, y: number, width: number): Container {
    const card = new Container();
    const height = 90;
    
    // Background based on rarity
    const rarityColors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill(rarityColors.common)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Character name/ticker
    const nameText = new Text({
      text: character.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = width / 2;
    nameText.y = 12;
    
    // HP Bar
    const hpBarBg = new Graphics();
    hpBarBg.roundRect(5, 25, width - 10, 8, 4)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 1, color: Colors.CARD_BORDER });

    const hpPercentage = character.current_hp / character.max_hp;
    const hpBarFill = new Graphics();
    hpBarFill.roundRect(6, 26, (width - 12) * hpPercentage, 6, 3)
      .fill(hpPercentage > 0.5 ? 0x4caf50 : hpPercentage > 0.25 ? 0xff9800 : 0xf44336);
    
    // HP Text
    const hpText = new Text({
      text: `${character.current_hp}/${character.max_hp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    hpText.anchor.set(0.5);
    hpText.x = width / 2;
    hpText.y = 42;
    
    // Stats
    const statsText = new Text({
      text: `ATK:${character.atk} DEF:${character.def}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 7,
        fill: Colors.TEXT_TERTIARY,
        align: 'center'
      }
    });
    statsText.anchor.set(0.5);
    statsText.x = width / 2;
    statsText.y = 55;

    // Add avatar if available
    if (character.avatar_url) {
      this.createAvatar(character, width, height).then(avatarIcon => {
        avatarIcon.y = 65;
        card.addChild(avatarIcon);
      });
    }
    
    card.addChild(bg, nameText, hpBarBg, hpBarFill, hpText, statsText);
    card.x = x;
    card.y = y;
    
    return card;
  }

  private createHandCard(card: CardInDeck, x: number, y: number, width: number): Container {
    const container = new Container();
    const height = 70;

    if (!card) {
      // Empty card slot
      return container;
    }

    // Card background based on rarity
    const rarityColors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    
    const bg = new Graphics();
    const rarity = card.card?.rarity ?? 'common';
    bg.roundRect(0, 0, width, height, 5)
      .fill(rarityColors[rarity] || rarityColors.common)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    // Energy cost (top left corner)
    const costBg = new Graphics();
    costBg.circle(10, 10, 8)
      .fill(Colors.BACKGROUND_PRIMARY)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    const costText = new Text({
      text: card.card ? this.getEnergyCost(card.card).toString() : '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    costText.anchor.set(0.5);
    costText.x = 10;
    costText.y = 10;
    
    // Card name
    const nameText = new Text({
      text: card.card?.name || 'Unknown',
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = width / 2;
    nameText.y = 25;
    
    // Card type indicator
    const typeText = new Text({
      text: card.card ? this.getCardType(card.card).toUpperCase() : 'UNKNOWN',
      style: {
        fontFamily: 'Kalam',
        fontSize: 6,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    typeText.anchor.set(0.5);
    typeText.x = width / 2;
    typeText.y = 40;

    // Description text
    const descText = new Text({
      text: card.card?.description || '',
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    descText.anchor.set(0.5);
    descText.x = width / 2;
    descText.y = 55;

    container.addChild(bg, costBg, costText, nameText, typeText, descText);
    container.x = x;
    container.y = y;
    
    // Store card reference for drag operations
    (container as Container & { cardData: CardInDeck }).cardData = card;
    
    return container;
  }

  private createFaceDownCard(x: number, y: number, width: number): Container {
    const container = new Container();
    const height = 70;
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    const backText = new Text({
      text: 'CARD',
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    backText.anchor.set(0.5);
    backText.x = width / 2;
    backText.y = height / 2;
    
    container.addChild(bg, backText);
    container.x = x;
    container.y = y;
    
    return container;
  }

  private createDeckCard(x: number, y: number, cardCount: number): Container {
    const container = new Container();
    const width = 50;
    const height = 70;
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    const deckText = new Text({
      text: 'DECK',
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    deckText.anchor.set(0.5);
    deckText.x = width / 2;
    deckText.y = height / 2 - 8;
    
    const countText = new Text({
      text: cardCount.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    countText.anchor.set(0.5);
    countText.x = width / 2;
    countText.y = height / 2 + 8;
    
    container.addChild(bg, deckText, countText);
    container.x = x;
    container.y = y;
    
    return container;
  }

  private createDiscardPile(x: number, y: number, discardedCards: CardInDeck[]): Container {
    const container = new Container();
    const width = 50;
    const height = 70;
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    const discardText = new Text({
      text: 'DISCARD',
      style: {
        fontFamily: 'Kalam',
        fontSize: 7,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    discardText.anchor.set(0.5);
    discardText.x = width / 2;
    discardText.y = height / 2 - 8;
    
    const countText = new Text({
      text: discardedCards.length.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    countText.anchor.set(0.5);
    countText.x = width / 2;
    countText.y = height / 2 + 8;
    
    // Show top card if any
    if (discardedCards.length > 0) {
      const topCard = discardedCards[discardedCards.length - 1];
      const cardPreview = new Text({
        text: topCard.card?.name.slice(0, 8),
        style: {
          fontFamily: 'Kalam',
          fontSize: 6,
          fill: Colors.TEXT_SECONDARY,
          align: 'center'
        }
      });
      cardPreview.anchor.set(0.5);
      cardPreview.x = width / 2;
      cardPreview.y = 15;
      container.addChild(cardPreview);
    }
    
    container.addChild(bg, discardText, countText);
    container.x = x;
    container.y = y;
    
    return container;
  }

  private createBattleLog(): void {
    const width = this.gameWidth - 2 * this.STANDARD_PADDING;
    const height = 60;
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    const titleText = new Text({
      text: `Turn ${this.battleState?.current_turn} - Player ${this.battleState?.current_player}'s Turn`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    titleText.x = 10;
    titleText.y = 10;
    
    const phaseText = new Text({
      text: `Phase: ${this.battleState?.phase}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY
      }
    });
    phaseText.x = 10;
    phaseText.y = 30;
    
    this.battleLogContainer.addChild(bg, titleText, phaseText);
    this.battleLogContainer.x = this.STANDARD_PADDING;
  }

  private makeCardDraggable(cardContainer: Container): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'pointer';

    cardContainer.on('pointerdown', (event) => {
      this.onDragStart(event, cardContainer);
    });
  }

  // Helper methods from backup

  /**
   * Update fixed variables from the current battle state
   */
  private updateFixedVariables(): void {
    if (!this.battleState) return;

    // Clear existing state
    this.player1Characters = [];
    this.player1HandCards = [];
    this.player1DeckCards = [];
    this.player1DiscardedCards = [];
    this.player2Characters = [];
    this.player2HandCards = [];
    this.player2DeckCards = [];
    this.player2DiscardedCards = [];

    // Update from battle state players
    this.battleState.players.forEach(player => {
      if (player.team === 1) {
        this.player1Characters = [...player.characters];
        this.player1HandCards = [...player.deck.hand_cards];
        this.player1DeckCards = [...player.deck.deck_cards];
        this.player1DiscardedCards = [...player.deck.discard_cards];
      } else if (player.team === 2) {
        this.player2Characters = [...player.characters];
        this.player2HandCards = [...player.deck.hand_cards];
        this.player2DeckCards = [...player.deck.deck_cards];
        this.player2DiscardedCards = [...player.deck.discard_cards];
      }
    });

    console.log('🔄 Fixed variables updated:', {
      player1: {
        characters: this.player1Characters.length,
        hand: this.player1HandCards.length,
        deck: this.player1DeckCards.length,
        discard: this.player1DiscardedCards.length
      },
      player2: {
        characters: this.player2Characters.length,
        hand: this.player2HandCards.length,
        deck: this.player2DeckCards.length,
        discard: this.player2DiscardedCards.length
      }
    });
  }

  /**
   * Get characters for a specific player
   */
  private getPlayerCharacters(playerTeam: number): CardBattleCharacter[] {
    return playerTeam === 1 ? this.player1Characters : this.player2Characters;
  }

  /**
   * Get hand cards for a specific player
   */
  private getPlayerHandCards(playerTeam: number): CardInDeck[] {
    return playerTeam === 1 ? this.player1HandCards : this.player2HandCards;
  }

  /**
   * Get deck cards for a specific player
   */
  private getPlayerDeckCards(playerTeam: number): CardInDeck[] {
    return playerTeam === 1 ? this.player1DeckCards : this.player2DeckCards;
  }

  /**
   * Get discarded cards for a specific player
   */
  private getPlayerDiscardedCards(playerTeam: number): CardInDeck[] {
    return playerTeam === 1 ? this.player1DiscardedCards : this.player2DiscardedCards;
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
  private onDragStart(_event: unknown, _cardContainer: Container): void {
    // Simplified drag start - just log for now
    console.log('Card drag started');
    // TODO: Implement full drag and drop functionality
    // Currently simplified to avoid unused parameter warnings
  }
}