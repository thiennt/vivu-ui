import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { mockCharacters } from '@/utils/mockData';
import { mockCards, createRandomDeck, drawCards } from '@/utils/cardData';
import { BaseScene } from '@/utils/BaseScene';
import { HomeScene } from './HomeScene';
import { StageScene } from './StageScene';
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

interface CardBattleSceneParams {
  stage?: any;
  playerDeck?: BattleCard[];
  battleId?: string;
  battleData?: any;
}

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

  private battleStarted = false;
  private stageInfo: any;
  private providedDeck?: BattleCard[];
  private battleId?: string;

  constructor(params?: CardBattleSceneParams) {
    super();

    this.container = new Container();
    this.addChild(this.container);
    
    this.stageInfo = params?.stage;
    this.providedDeck = params?.playerDeck;
    this.battleId = params?.battleId;
    
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
    this.createActionButtons();
  }

  /** Prepare the screen before showing */
  prepare(): void {
    this.createGameLayout();
    this.refreshUI();
  }

  /** Show the screen with animation */
  async show(): Promise<void> {
    this.container.alpha = 0;
    const tween = { alpha: 0 };
    
    return new Promise((resolve) => {
      const animate = () => {
        tween.alpha += 0.05;
        this.container.alpha = tween.alpha;
        
        if (tween.alpha >= 1) {
          this.container.alpha = 1;
          // Start the battle sequence automatically
          this.startBattleSequence();
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
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

  private async startBattleSequence(): Promise<void> {
    console.log('🎯 Starting battle sequence...');
    
    // Step 3: Show characters, decks, discard piles, energy, empty hands
    this.battleStarted = false; // Start with setup view
    this.refreshUI();
    
    // Give a moment to see the initial setup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 4: Player Turn - Draw phase
    await this.startPlayerTurn();
  }

  private async startPlayerTurn(): Promise<void> {
    console.log('🎯 Starting player turn...');
    this.battleState.turnPhase = TurnPhase.DRAW;
    this.battleState.activePlayer = 1;
    
    // Show "Your Turn" message
    await this.showTurnMessage('Your Turn!');
    
    // Animate drawing cards to hand
    this.battleStarted = true;
    await this.animateInitialDraw();
    
    // Step 5: Enter main phase
    this.battleState.turnPhase = TurnPhase.MAIN;
    this.refreshUI();
    
    console.log('🎯 Player turn: Main phase - you can now play cards');
  }

  private async showTurnMessage(message: string): Promise<void> {
    const messageContainer = new Container();
    
    const bg = new Graphics()
      .roundRect(0, 0, 300, 80, 15)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY });
    
    const text = new Text({
      text: message,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    text.anchor.set(0.5);
    text.x = 150;
    text.y = 40;
    
    messageContainer.addChild(bg, text);
    messageContainer.x = (this.gameWidth - 300) / 2;
    messageContainer.y = (this.gameHeight - 80) / 2;
    messageContainer.alpha = 0;
    
    this.container.addChild(messageContainer);
    
    // Fade in
    const fadeIn = { alpha: 0 };
    return new Promise(resolve => {
      const animate = () => {
        fadeIn.alpha += 0.05;
        messageContainer.alpha = fadeIn.alpha;
        
        if (fadeIn.alpha >= 1) {
          // Hold for a moment, then fade out
          setTimeout(() => {
            const fadeOut = { alpha: 1 };
            const animateOut = () => {
              fadeOut.alpha -= 0.05;
              messageContainer.alpha = fadeOut.alpha;
              
              if (fadeOut.alpha <= 0) {
                this.container.removeChild(messageContainer);
                resolve();
              } else {
                requestAnimationFrame(animateOut);
              }
            };
            animateOut();
          }, 1500);
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
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
    
    // Player 2 hand at top (face down)
    this.player2HandContainer.y = padding;
    this.createHandArea(this.player2HandContainer, this.battleState.player2, false);
    
    // Player 2 (AI) characters
    this.player2Container.y = this.player2HandContainer.y + handHeight + 10;
    this.createPlayerArea(this.player2Container, this.battleState.player2, false);
    
    // Battle log in middle
    this.battleLogContainer.y = this.player2Container.y + characterAreaHeight + 10;
    this.createBattleLog();
    
    // Player 1 (human) characters - above hand cards
    this.player1Container.y = this.battleLogContainer.y + logHeight + 10;
    this.createPlayerArea(this.player1Container, this.battleState.player1, true);
    
    // Player 1 hand at bottom
    this.player1HandContainer.y = this.player1Container.y + characterAreaHeight + 10;
    this.createHandArea(this.player1HandContainer, this.battleState.player1, true);

    this.gameContainer.addChild(
      this.player2HandContainer,
      this.player2Container,
      this.battleLogContainer,
      this.player1Container,
      this.player1HandContainer
    );

    this.container.addChild(this.gameContainer);

    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onDragEnd, this);
    app.stage.on('pointerupoutside', this.onDragEnd, this);
    app.stage.hitArea = app.screen;
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
      text: `Energy: ${player.energy}`,
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
      
      this.dropZones.push({
        area: characterCard,
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
    
    this.dropZones.push({
      area: discardCard,
      type: 'discard',
      playerId: player.id === 'player1' ? 1 : 2
    });
    
    container.addChild(discardCard);
  }

  private createHandArea(container: Container, player: CardBattlePlayer, showCards: boolean): void {
    // Do not show hand cards until battle has started
    if (!this.battleStarted) return;

    const cardWidth = 60;
    const handCount = player.hand.length;
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

      const cardContainer = showCards
        ? this.createHandCard(player.hand[index], x, y, cardWidth)
        : this.createFaceDownCard(x, y, cardWidth);

      // Make player 1 cards draggable
      if (showCards && player.id === 'player1') {
        this.makeCardDraggable(cardContainer, player.hand[index]);
      }

      container.addChild(cardContainer);
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

  private createActionButtons(): void {
    const buttonContainer = new Container();
    const buttonWidth = 120;
    const buttonHeight = 44;

    if (!this.battleStarted) {
      // Start Battle button
      const startButton = this.createButton(
        'Start Battle',
        (this.gameWidth - buttonWidth) / 2,
        this.getContentHeight() - buttonHeight - 10,
        buttonWidth,
        buttonHeight,
        async () => {
          this.battleStarted = true;
          this.container.removeChild(buttonContainer);
          await this.animateInitialDraw();
          this.refreshUI();
        },
        14
      );
      buttonContainer.addChild(startButton);
    } else {
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
    }

    this.container.addChild(buttonContainer);
  }

  private async animateInitialDraw(): Promise<void> {
    // Remove all cards from player1's hand and put them back to deck
    const player = this.battleState.player1;
    player.deck = [...player.hand, ...player.deck];
    player.hand = [];

    // Draw and animate 5 cards
    for (let i = 0; i < 5; i++) {
      if (player.deck.length > 0) {
        const card = player.deck.shift()!;
        player.hand.push(card);
        await this.animateDrawCard(card, player);
        this.refreshUI();
      }
    }
  }

  private makeCardDraggable(cardContainer: Container, card: BattleCard): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'pointer';

    cardContainer.on('pointerdown', (event) => {
      this.onDragStart(event, cardContainer, card);
    });
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

    if (this.isDragging) {
      // Check if dropped on a valid target
      const dropTarget = this.getDropTarget(event.global);

      if (dropTarget) {
        if (dropTarget.type === 'character') {
          this.playCardOnCharacter(card, dropTarget.playerId, dropTarget.characterIndex!);
          this.refreshUI();
        } else if (dropTarget.type === 'discard') {
          this.discardCard(card);
        }
        // Clean up after successful action
        this.cleanupDrag(true);
      } else {
        // No valid drop target - return card to original position
        this.cleanupDrag(false);
        this.refreshUI();
      }
    } else {
      this.showCardDetails(card);
      // Clean up after showing card details
      this.cleanupDrag(false);
      this.refreshUI();
    }
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

    // Check if player has enough energy
    if (targetPlayer.energy < card.energyCost) {
      alert('Not enough energy to play this card.');
      return; // Can't afford this card
    }

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
  }

  private discardCard(card: BattleCard): void {
    // Gain 1 energy for discarding
    this.battleState.player1.energy += 1;

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
        targetPlayer.energy += effect.value;
        break;
      // Add more effect types as needed
    }
  }

  private cleanupDrag(removeCard: boolean = false): void {
    if (this.dragTarget) {
      // Always remove the dragged card from its parent to prevent duplicates
      if (this.dragTarget.parent) {
        this.dragTarget.parent.removeChild(this.dragTarget);
      }
      if (removeCard) {
        // Destroy the card if it was played/discarded
        this.dragTarget.destroy();
      }
    }

    this.dragTarget = null;
    this.isDragging = false;

    // Remove event listeners
    app.stage.off('pointermove', this.onDragMove, this);
    app.stage.off('pointerup', this.onDragEnd, this);
    app.stage.off('pointerupoutside', this.onDragEnd, this);
  }

  private async endTurn(): Promise<void> {
    console.log('🎯 Ending player turn...');
    
    // Step 6: End Turn - animate turn end, process backend state
    this.battleState.turnPhase = TurnPhase.END;
    await this.showTurnMessage('Turn Ending...');
    
    // Check for win/loss conditions
    if (this.checkBattleEnd()) {
      return;
    }
    
    // Step 7: AI Turn (if PvE)
    this.battleState.activePlayer = 2;
    this.battleState.currentTurn++;
    
    await this.handleAITurn();
    
    // Step 8: Repeat cycle - back to player turn
    await this.startPlayerTurn();
  }

  private checkBattleEnd(): boolean {
    // Check if all characters of player 1 are defeated
    const player1Alive = this.battleState.player1.characters.some(char => char.hp > 0);
    const player2Alive = this.battleState.player2.characters.some(char => char.hp > 0);
    
    if (!player1Alive) {
      this.battleState.winner = 2;
      this.showBattleEnd(false);
      return true;
    }
    
    if (!player2Alive) {
      this.battleState.winner = 1;
      this.showBattleEnd(true);
      return true;
    }
    
    return false;
  }

  private async showBattleEnd(playerWon: boolean): Promise<void> {
    console.log('🎯 Battle ended!', playerWon ? 'Player wins!' : 'Player loses!');
    
    const message = playerWon ? 'Victory!' : 'Defeat!';
    const color = playerWon ? Colors.RARITY_LEGENDARY : Colors.ELEMENT_FIRE;
    
    const endContainer = new Container();
    
    const bg = new Graphics()
      .roundRect(0, 0, 400, 200, 20)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.95 })
      .stroke({ width: 3, color });
    
    const titleText = new Text({
      text: message,
      style: {
        fontFamily: 'Kalam',
        fontSize: 36,
        fontWeight: 'bold',
        fill: color
      }
    });
    titleText.anchor.set(0.5);
    titleText.x = 200;
    titleText.y = 60;
    
    const rewardsText = new Text({
      text: playerWon ? 'You earned rewards!\n+100 Gold\n+50 EXP' : 'Better luck next time!',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    rewardsText.anchor.set(0.5);
    rewardsText.x = 200;
    rewardsText.y = 120;
    
    const continueButton = this.createButton(
      'Continue',
      150,
      150,
      100,
      30,
      () => {
        navigation.showScreen(this.stageInfo ? StageScene : HomeScene);
      }
    );
    
    endContainer.addChild(bg, titleText, rewardsText, continueButton);
    endContainer.x = (this.gameWidth - 400) / 2;
    endContainer.y = (this.gameHeight - 200) / 2;
    endContainer.alpha = 0;
    
    this.container.addChild(endContainer);
    
    // Fade in
    const fadeIn = { alpha: 0 };
    return new Promise(resolve => {
      const animate = () => {
        fadeIn.alpha += 0.03;
        endContainer.alpha = fadeIn.alpha;
        
        if (fadeIn.alpha >= 1) {
          endContainer.alpha = 1;
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
  }

  private async drawCardsToFive(player: CardBattlePlayer): Promise<void> {
    const handCount = player.hand.length;
    if (handCount >= 5) {
      // Draw only 1 card if hand already has 5 or more
      if (player.deck.length > 0) {
        const card = player.deck.shift()!;
        player.hand.push(card);
        await this.animateDrawCard(card, player);
      }
    } else {
      // Draw up to 5 cards
      const cardsToDraw = Math.min(5 - handCount, player.deck.length);
      for (let i = 0; i < cardsToDraw; i++) {
        const card = player.deck.shift()!;
        player.hand.push(card);
        await this.animateDrawCard(card, player);
      }
    }
  }

  private async animateDrawCard(card: BattleCard, player: CardBattlePlayer): Promise<void> {
    // Find the deck position (where the card should fly from)
    const isPlayer1 = player.id === 'player1';
    const deckContainer = isPlayer1 ? this.player1Container : this.player2Container;
    const deckX = this.STANDARD_PADDING + 25; // Center of deck card
    const deckY = 35 + 35; // Y of deck + half height

    // Create a temporary card sprite at the deck position
    const tempCard = this.createHandCard(card, deckX, deckY, 60);
    tempCard.alpha = 0.8;
    this.container.addChild(tempCard);

    // Calculate target position in hand
    // After pushing to hand, the card will be at the end
    const handIndex = player.hand.length - 1;
    const handCount = player.hand.length;
    const padding = this.STANDARD_PADDING;
    const maxVisible = 5;
    let cardSpacing: number;
    let totalWidth: number;
    let startX: number;

    if (handCount <= maxVisible) {
      cardSpacing = 60 + 12;
      totalWidth = 60 + (handCount - 1) * cardSpacing;
      startX = (this.gameWidth - totalWidth) / 2;
    } else {
      cardSpacing = (this.gameWidth - 2 * padding - 60) / (handCount - 1);
      cardSpacing = Math.min(cardSpacing, 60);
      startX = padding;
    }
    const targetX = startX + handIndex * cardSpacing;
    const targetY = isPlayer1
      ? this.player1HandContainer.y + 10
      : this.player2HandContainer.y + 10;

    // Animate the card flying to the hand
    await gsap.to(tempCard, {
      x: targetX,
      y: targetY,
      alpha: 1,
      duration: 0.4,
      ease: 'power2.out'
    });

    // Remove the temp card (the real card will be rendered in refreshUI)
    this.container.removeChild(tempCard);
  }

  private async handleAITurn(): Promise<void> {
    console.log('🎯 AI Turn starting...');
    
    // Show AI turn message
    await this.showTurnMessage('AI Turn');
    
    // Draw cards for AI
    await this.drawCardsToFive(this.battleState.player2);
    this.refreshUI();
    
    // AI thinks for a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple AI: play a random affordable card on a random target
    const ai = this.battleState.player2;
    const affordableCards = ai.hand.filter(card => card.energyCost <= ai.energy);

    if (affordableCards.length > 0) {
      const randomCard = affordableCards[Math.floor(Math.random() * affordableCards.length)];
      const targetCharacterIndex = Math.floor(Math.random() * this.battleState.player1.characters.length);

      console.log(`🎯 AI plays: ${randomCard.name} on target ${targetCharacterIndex}`);
      
      // Show what AI is doing
      await this.showTurnMessage(`AI plays: ${randomCard.name}`);

      // Apply effects (simplified)
      ai.energy -= randomCard.energyCost;
      ai.hand = ai.hand.filter(c => c.id !== randomCard.id);
      ai.discardPile.push(randomCard);

      // Apply to target
      for (const effect of randomCard.effects) {
        this.applyCardEffect(effect, this.battleState.player1.characters[targetCharacterIndex], this.battleState.player1);
      }
      
      this.refreshUI();
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      console.log('🎯 AI has no playable cards');
      await this.showTurnMessage('AI passes turn');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🎯 AI Turn ended');
  }

  private refreshUI(): void {
    // Recreate the entire game layout
    this.gameContainer.removeChildren();
    this.dropZones = [];

    // Clear hand containers before re-adding cards
    this.player1HandContainer.removeChildren();
    this.player2HandContainer.removeChildren();
    
    // Recreate player areas
    this.createPlayerArea(this.player1Container, this.battleState.player1, true);
    this.createPlayerArea(this.player2Container, this.battleState.player2, false);
    this.createHandArea(this.player1HandContainer, this.battleState.player1, true);
    this.createHandArea(this.player2HandContainer, this.battleState.player2, false);
    this.battleLogContainer.removeChildren();
    this.createBattleLog();

    this.gameContainer.addChild(
      this.player2HandContainer,
      this.player2Container,
      this.battleLogContainer,
      this.player1Container,
      this.player1HandContainer
    );

    this.createActionButtons();
  }

  public update(_time: Ticker): void {
    // Update animations or game state if needed
  }
}