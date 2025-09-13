import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { mockCharacters } from '@/utils/mockData';
import { mockCards, createRandomDeck, drawCards } from '@/utils/cardData';
import { BaseScene } from '@/utils/BaseScene';
import { HomeScene } from './HomeScene';
import { Colors, Gradients } from '@/utils/colors';
import { gsap } from 'gsap';
import { app } from '@/app';
import { CardDetailPopup } from '@/popups/CardDetailPopup';
import { 
  BattleCard, 
  BattleCharacter, 
  CardBattlePlayer, 
  CardBattleState, 
  TurnPhase,
  CardEffectType,
  CardTarget 
} from '@/types';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private battleState!: CardBattleState;
  private gameContainer!: Container;
  private player1Container!: Container;
  private player2Container!: Container;
  private player1HandContainer!: Container;
  private player2HandContainer!: Container;
  private battleLogContainer!: Container;
  private uiContainer!: Container;
  
  // Drag and drop
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  private isDragging = false;
  private dropZones: { area: Container, type: 'character' | 'discard', playerId: number, characterIndex?: number }[] = [];

  // Hold detection for card details
  private holdTimer: NodeJS.Timeout | null = null;
  private holdThreshold = 800; // 800ms hold to show details
  private isHolding = false;

  constructor() {
    super();

    this.container = new Container();
    this.addChild(this.container);
    
    this.initializeBattleState();
  }

  private initializeBattleState(): void {
    // Select 3 characters for each player
    const player1Characters: BattleCharacter[] = mockCharacters.slice(0, 3).map(char => ({
      id: char.id,
      name: char.name,
      ticker: char.name.slice(0, 3).toUpperCase(),
      level: char.level,
      rarity: char.rarity,
      hp: char.hp,
      maxHp: char.hp,
      atk: char.atk,
      def: char.def,
      agi: char.agi,
      currentBuffs: [],
      avatar_url: char.avatar_url
    }));

    const player2Characters: BattleCharacter[] = mockCharacters.slice(3, 6).map(char => ({
      id: char.id + '_p2',
      name: char.name,
      ticker: char.name.slice(0, 3).toUpperCase(),
      level: char.level,
      rarity: char.rarity,
      hp: char.hp,
      maxHp: char.hp,
      atk: char.atk,
      def: char.def,
      agi: char.agi,
      currentBuffs: [],
      avatar_url: char.avatar_url
    }));

    // Create decks for both players
    const player1Deck = createRandomDeck(30);
    const player2Deck = createRandomDeck(30);

    // Draw initial hands (5 cards each)
    const { drawnCards: p1Hand, remainingDeck: p1Remaining } = drawCards(player1Deck, 5);
    const { drawnCards: p2Hand, remainingDeck: p2Remaining } = drawCards(player2Deck, 5);

    this.battleState = {
      player1: {
        id: 'player1',
        name: 'Player 1',
        energy: 3,
        maxEnergy: 10,
        characters: player1Characters,
        deck: p1Remaining,
        hand: p1Hand,
        discardPile: []
      },
      player2: {
        id: 'player2',
        name: 'Player 2 (AI)',
        energy: 3,
        maxEnergy: 10,
        characters: player2Characters,
        deck: p2Remaining,
        hand: p2Hand,
        discardPile: []
      },
      currentTurn: 1,
      activePlayer: 1,
      turnPhase: TurnPhase.MAIN
    };
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;

    // Create/update bottom navigation first
    this.updateBottomNavigation();

    // Clear and recreate layout
    this.container.removeChildren();
    this.createBackground();
    this.createGameLayout();
    this.createUI();
  }

  /** Show the screen with animation */
  async show(): Promise<void> {
    this.container.alpha = 1;
    return Promise.resolve();
  }

  /** Hide the screen with animation */
  async hide(): Promise<void> {
    this.container.alpha = 0;
    return Promise.resolve();
  }

  /** Reset screen after hidden */
  reset(): void {
    this.container.removeChildren();
    this.initializeBattleState();
  }

  private createBackground(): void {
    const bg = new Graphics();
    const availableHeight = this.getContentHeight();
    const backgroundGradient = Gradients.createBackgroundGradient(this.gameWidth, availableHeight);
    bg.rect(0, 0, this.gameWidth, availableHeight).fill(backgroundGradient);
    this.container.addChild(bg);
  }

  private createGameLayout(): void {
    this.gameContainer = new Container();
    
    // Create main containers
    this.player1Container = new Container();
    this.player2Container = new Container();
    this.player1HandContainer = new Container();
    this.player2HandContainer = new Container();
    this.battleLogContainer = new Container();
    this.uiContainer = new Container();

    // Layout calculations
    const availableHeight = this.getContentHeight();
    const padding = this.STANDARD_PADDING;
    const handHeight = 80;
    const characterAreaHeight = 100;
    const logHeight = 60;
    
    // Player 2 (AI) at top
    this.player2Container.y = padding;
    this.createPlayerArea(this.player2Container, this.battleState.player2, false);
    
    // Player 2 hand (face down)
    this.player2HandContainer.y = this.player2Container.y + characterAreaHeight + 10;
    this.createHandArea(this.player2HandContainer, this.battleState.player2, false);
    
    // Battle log in middle
    this.battleLogContainer.y = this.player2HandContainer.y + handHeight + 10;
    this.createBattleLog();
    
    // Player 1 (human) characters - above hand cards
    this.player1Container.y = this.battleLogContainer.y + logHeight + 10;
    this.createPlayerArea(this.player1Container, this.battleState.player1, true);
    
    // Player 1 hand at bottom
    this.player1HandContainer.y = this.player1Container.y + characterAreaHeight + 10;
    this.createHandArea(this.player1HandContainer, this.battleState.player1, true);

    this.gameContainer.addChild(
      this.player2Container,
      this.player2HandContainer,
      this.battleLogContainer,
      this.player1Container,
      this.player1HandContainer
    );

    this.container.addChild(this.gameContainer);
  }

  private createPlayerArea(container: Container, player: CardBattlePlayer, isBottomPlayer: boolean): void {
    const padding = this.STANDARD_PADDING;
    const characterWidth = 80;
    const characterSpacing = 10;
    const totalCharacterWidth = player.characters.length * characterWidth + (player.characters.length - 1) * characterSpacing;
    const startX = (this.gameWidth - totalCharacterWidth) / 2;

    // Energy display
    const energyBg = new Graphics();
    energyBg.roundRect(padding, 5, 120, 25, 5)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    const energyText = new Text({
      text: `Energy: ${player.energy}/${player.maxEnergy}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY
      }
    });
    energyText.x = padding + 10;
    energyText.y = 12;

    container.addChild(energyBg, energyText);

    // Create character cards
    player.characters.forEach((character, index) => {
      const x = startX + index * (characterWidth + characterSpacing);
      const y = 35;
      const characterCard = this.createCharacterCard(character, x, y, characterWidth);
      
      // Create drop zone for this character
      const dropZone = new Container();
      dropZone.x = x;
      dropZone.y = y;
      this.dropZones.push({
        area: dropZone,
        type: 'character',
        playerId: player.id === 'player1' ? 1 : 2,
        characterIndex: index
      });
      
      container.addChild(characterCard);
    });

    // Deck and discard pile
    const deckX = padding;
    const discardX = this.gameWidth - padding - 60;
    const pileY = 35;

    // Deck
    const deckCard = this.createDeckCard(deckX, pileY, player.deck.length);
    container.addChild(deckCard);

    // Discard pile
    const discardCard = this.createDiscardPile(discardX, pileY, player.discardPile);
    
    // Create drop zone for discard pile
    const discardDropZone = new Container();
    discardDropZone.x = discardX;
    discardDropZone.y = pileY;
    this.dropZones.push({
      area: discardDropZone,
      type: 'discard',
      playerId: player.id === 'player1' ? 1 : 2
    });
    
    container.addChild(discardCard);
  }

  private createHandArea(container: Container, player: CardBattlePlayer, showCards: boolean): void {
    const cardWidth = 60;
    const cardSpacing = 5;
    const maxCards = 7; // Maximum cards to display
    const visibleCards = Math.min(player.hand.length, maxCards);
    const totalWidth = visibleCards * cardWidth + (visibleCards - 1) * cardSpacing;
    const startX = (this.gameWidth - totalWidth) / 2;

    player.hand.slice(0, maxCards).forEach((card, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const y = 10;
      
      const cardContainer = showCards 
        ? this.createHandCard(card, x, y, cardWidth)
        : this.createFaceDownCard(x, y, cardWidth);
      
      // Make player 1 cards draggable
      if (showCards && player.id === 'player1') {
        this.makeCardDraggable(cardContainer, card);
      }
      
      container.addChild(cardContainer);
    });

    // Show hand count if there are more cards
    if (player.hand.length > maxCards) {
      const overflowText = new Text({
        text: `+${player.hand.length - maxCards} more`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: Colors.TEXT_SECONDARY
        }
      });
      overflowText.x = startX + totalWidth + 10;
      overflowText.y = 25;
      container.addChild(overflowText);
    }
  }

  private createCharacterCard(character: BattleCharacter, x: number, y: number, width: number): Container {
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
      .fill(rarityColors[character.rarity] || rarityColors.common)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Character name/ticker
    const nameText = new Text({
      text: character.ticker,
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
    
    const hpPercentage = character.hp / character.maxHp;
    const hpBarFill = new Graphics();
    hpBarFill.roundRect(6, 26, (width - 12) * hpPercentage, 6, 3)
      .fill(hpPercentage > 0.5 ? 0x4caf50 : hpPercentage > 0.25 ? 0xff9800 : 0xf44336);
    
    // HP Text
    const hpText = new Text({
      text: `${character.hp}/${character.maxHp}`,
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

    // Add avatar if available (commented out due to CORS issues)
    /*
    if (character.avatar_url) {
      this.createAvatar(character, width, height).then(avatarIcon => {
        avatarIcon.y = 65;
        card.addChild(avatarIcon);
      });
    }
    */
    
    card.addChild(bg, nameText, hpBarBg, hpBarFill, hpText, statsText);
    card.x = x;
    card.y = y;
    
    return card;
  }

  private createHandCard(card: BattleCard, x: number, y: number, width: number): Container {
    const container = new Container();
    const height = 70;
    
    // Card background based on rarity
    const rarityColors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5)
      .fill(rarityColors[card.rarity] || rarityColors.common)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    // Energy cost (top left corner)
    const costBg = new Graphics();
    costBg.circle(10, 10, 8)
      .fill(Colors.BACKGROUND_PRIMARY)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    const costText = new Text({
      text: card.energyCost.toString(),
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
      text: card.name,
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
      text: card.cardType.toUpperCase(),
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
    
    // Effect value (simplified)
    const effectValue = card.effects[0]?.value || 0;
    const effectText = new Text({
      text: effectValue.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    effectText.anchor.set(0.5);
    effectText.x = width / 2;
    effectText.y = 55;
    
    container.addChild(bg, costBg, costText, nameText, typeText, effectText);
    container.x = x;
    container.y = y;
    
    // Store card reference for drag operations
    (container as any).cardData = card;
    
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

  private createDiscardPile(x: number, y: number, discardedCards: BattleCard[]): Container {
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
        text: topCard.name.slice(0, 8),
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
      text: `Turn ${this.battleState.currentTurn} - Player ${this.battleState.activePlayer}'s Turn`,
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
      text: `Phase: ${this.battleState.turnPhase}`,
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

  private createUI(): void {
    const buttonContainer = new Container();
    
    const buttonWidth = 100;
    const buttonHeight = 40;
    
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

  private makeCardDraggable(cardContainer: Container, card: BattleCard): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'pointer';

    cardContainer.on('pointerdown', (event) => {
      // Check if player has enough energy
      if (this.battleState.player1.energy < card.energyCost) {
        return; // Can't afford this card
      }

      // Start hold timer
      this.isHolding = false;
      this.holdTimer = setTimeout(() => {
        this.isHolding = true;
        this.showCardDetails(card);
      }, this.holdThreshold);

      this.onDragStart(event, cardContainer, card);
    });

    // Clean up hold timer on pointer up
    cardContainer.on('pointerup', () => {
      this.clearHoldTimer();
    });

    cardContainer.on('pointerupoutside', () => {
      this.clearHoldTimer();
    });
  }

  private clearHoldTimer(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  }

  private showCardDetails(card: BattleCard): void {
    navigation.presentPopup(class extends CardDetailPopup {
      constructor() {
        super({ card });
      }
    });
  }

  private onDragStart(event: any, cardContainer: Container, card: BattleCard): void {
    cardContainer.alpha = 0.8;
    this.dragTarget = cardContainer;

    // Calculate and store drag offset
    const globalCardPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    this.dragOffset = {
      x: event.global.x - (globalCardPos?.x || 0),
      y: event.global.y - (globalCardPos?.y || 0)
    };

    // Move card to top layer for dragging
    const globalPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    app.stage.addChild(cardContainer);
    if (globalPos) {
      cardContainer.position.set(globalPos.x, globalPos.y);
    }

    // Attach event listeners
    app.stage.on('pointermove', this.onDragMove, this);
    app.stage.on('pointerup', this.onDragEnd, this);
    app.stage.on('pointerupoutside', this.onDragEnd, this);
  }

  private onDragMove(event: any): void {
    if (this.dragTarget) {
      // Clear hold timer if user starts dragging
      if (!this.isDragging && !this.isHolding) {
        this.clearHoldTimer();
      }
      
      const parent = this.dragTarget.parent;
      if (parent) {
        const newPos = parent.toLocal({
          x: event.global.x - this.dragOffset.x,
          y: event.global.y - this.dragOffset.y
        });
        this.dragTarget.position.set(newPos.x, newPos.y);
        this.isDragging = true;
      }
    }
  }

  private onDragEnd(event: any): void {
    if (!this.dragTarget) return;

    this.dragTarget.alpha = 1;
    const card = (this.dragTarget as any).cardData as BattleCard;

    // Check if dropped on a valid target
    const dropTarget = this.getDropTarget(event.global);
    
    if (dropTarget && this.isDragging) {
      if (dropTarget.type === 'character') {
        this.playCardOnCharacter(card, dropTarget.playerId, dropTarget.characterIndex!);
      } else if (dropTarget.type === 'discard') {
        this.discardCard(card);
      }
    }

    // Clean up
    this.cleanupDrag();
  }

  private getDropTarget(globalPos: { x: number, y: number }): { type: 'character' | 'discard', playerId: number, characterIndex?: number } | null {
    // Simple collision detection with drop zones
    for (const zone of this.dropZones) {
      const bounds = zone.area.getBounds();
      if (globalPos.x >= bounds.x && globalPos.x <= bounds.x + bounds.width &&
          globalPos.y >= bounds.y && globalPos.y <= bounds.y + bounds.height) {
        return zone;
      }
    }
    return null;
  }

  private playCardOnCharacter(card: BattleCard, targetPlayerId: number, characterIndex: number): void {
    // Apply card effects
    const targetPlayer = targetPlayerId === 1 ? this.battleState.player1 : this.battleState.player2;
    const targetCharacter = targetPlayer.characters[characterIndex];

    // Deduct energy cost
    this.battleState.player1.energy -= card.energyCost;

    // Apply card effects
    for (const effect of card.effects) {
      this.applyCardEffect(effect, targetCharacter, targetPlayer);
    }

    // Move card to discard pile
    this.battleState.player1.hand = this.battleState.player1.hand.filter(c => c.id !== card.id);
    this.battleState.player1.discardPile.push(card);

    // Refresh UI
    this.refreshUI();
  }

  private discardCard(card: BattleCard): void {
    // Gain 1 energy for discarding
    this.battleState.player1.energy = Math.min(this.battleState.player1.maxEnergy, this.battleState.player1.energy + 1);

    // Move card to discard pile
    this.battleState.player1.hand = this.battleState.player1.hand.filter(c => c.id !== card.id);
    this.battleState.player1.discardPile.push(card);

    // Refresh UI
    this.refreshUI();
  }

  private applyCardEffect(effect: any, targetCharacter: BattleCharacter, targetPlayer: CardBattlePlayer): void {
    switch (effect.type) {
      case CardEffectType.DAMAGE:
        targetCharacter.hp = Math.max(0, targetCharacter.hp - effect.value);
        break;
      case CardEffectType.HEAL:
        targetCharacter.hp = Math.min(targetCharacter.maxHp, targetCharacter.hp + effect.value);
        break;
      case CardEffectType.ENERGY_GAIN:
        targetPlayer.energy = Math.min(targetPlayer.maxEnergy, targetPlayer.energy + effect.value);
        break;
      // Add more effect types as needed
    }
  }

  private cleanupDrag(): void {
    if (this.dragTarget) {
      // Remove card from stage and destroy it (it will be recreated in refreshUI)
      if (this.dragTarget.parent) {
        this.dragTarget.parent.removeChild(this.dragTarget);
      }
      this.dragTarget.destroy();
    }

    this.dragTarget = null;
    this.isDragging = false;
    this.isHolding = false;
    this.clearHoldTimer();
    
    // Remove event listeners
    app.stage.off('pointermove', this.onDragMove, this);
    app.stage.off('pointerup', this.onDragEnd, this);
    app.stage.off('pointerupoutside', this.onDragEnd, this);
  }

  private endTurn(): void {
    // Switch to other player
    this.battleState.activePlayer = this.battleState.activePlayer === 1 ? 2 : 1;
    
    if (this.battleState.activePlayer === 1) {
      this.battleState.currentTurn++;
      // Player gains 1 energy per turn
      this.battleState.player1.energy = Math.min(this.battleState.player1.maxEnergy, this.battleState.player1.energy + 1);
    }

    // Simple AI turn for player 2
    if (this.battleState.activePlayer === 2) {
      this.handleAITurn();
    }

    this.refreshUI();
  }

  private handleAITurn(): void {
    // Simple AI: play a random affordable card on a random target
    const ai = this.battleState.player2;
    const affordableCards = ai.hand.filter(card => card.energyCost <= ai.energy);

    if (affordableCards.length > 0) {
      const randomCard = affordableCards[Math.floor(Math.random() * affordableCards.length)];
      const targetCharacterIndex = Math.floor(Math.random() * this.battleState.player1.characters.length);

      // Apply effects (simplified)
      ai.energy -= randomCard.energyCost;
      ai.hand = ai.hand.filter(c => c.id !== randomCard.id);
      ai.discardPile.push(randomCard);

      // Apply to target
      for (const effect of randomCard.effects) {
        this.applyCardEffect(effect, this.battleState.player1.characters[targetCharacterIndex], this.battleState.player1);
      }
    }

    // End AI turn after a delay
    setTimeout(() => {
      this.endTurn();
    }, 1000);
  }

  private refreshUI(): void {
    // Recreate the entire game layout
    this.gameContainer.removeChildren();
    this.dropZones = [];
    
    // Recreate player areas
    this.createPlayerArea(this.player1Container, this.battleState.player1, true);
    this.createPlayerArea(this.player2Container, this.battleState.player2, false);
    this.createHandArea(this.player1HandContainer, this.battleState.player1, true);
    this.createHandArea(this.player2HandContainer, this.battleState.player2, false);
    this.battleLogContainer.removeChildren();
    this.createBattleLog();

    this.gameContainer.addChild(
      this.player2Container,
      this.player2HandContainer,
      this.battleLogContainer,
      this.player1Container,
      this.player1HandContainer
    );
  }

  public update(_time: Ticker): void {
    // Update animations or game state if needed
  }
}