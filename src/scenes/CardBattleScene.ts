import { Container, Graphics, Text, FederatedPointerEvent, Sprite } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { Colors, Gradients } from '@/utils/colors';
import { HomeScene } from './HomeScene';
import { gsap } from 'gsap';
import { 
  CardBattleState, 
  CardBattlePlayerState, 
  CardBattleCharacter, 
  CardInDeck, 
  TurnPhase,
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
  private discardPileContainer!: Container;
  private energyContainer!: Container;
  private turnIndicatorContainer!: Container;
  private actionLogContainer!: Container;
  
  // Card interaction
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  private handCards: Container[] = [];
  private characterCards: Map<string, Container> = new Map();
  
  // Layout constants
  private readonly CARD_WIDTH = 80;
  private readonly CARD_HEIGHT = 110;
  private readonly CHARACTER_CARD_WIDTH = 120;
  private readonly CHARACTER_CARD_HEIGHT = 160;
  private readonly HAND_CARD_WIDTH = 60;
  private readonly HAND_CARD_HEIGHT = 80;

  constructor(battleId: string) {
    super();
    
    this.battleId = battleId;
    this.container = new Container();
    this.addChild(this.container);
    
    this.setupLayout();
    this.initializeBattle();
  }

  private setupLayout(): void {
    this.createBackground();
    this.createBattlefield();
    this.createHandArea();
    this.createEnergyIndicator();
    this.createTurnIndicator();
    this.createActionLog();
    this.createDiscardPile();
  }

  private createBackground(): void {
    this.backgroundContainer = new Container();
    
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill(Gradients.BACKGROUND_DARK);
    
    this.backgroundContainer.addChild(bg);
    this.container.addChild(this.backgroundContainer);
  }

  private createBattlefield(): void {
    this.battlefieldContainer = new Container();
    
    // Create containers for each player's characters
    this.player1CharactersContainer = new Container();
    this.player2CharactersContainer = new Container();
    
    // Position player areas (vertical layout)
    const battlefieldHeight = this.gameHeight * 0.6;
    const battlefieldY = this.gameHeight * 0.1;
    
    // Player 2 (opponent) at top
    this.player2CharactersContainer.y = battlefieldY;
    
    // Player 1 (current player) at bottom
    this.player1CharactersContainer.y = battlefieldY + battlefieldHeight * 0.5;
    
    this.battlefieldContainer.addChild(this.player2CharactersContainer);
    this.battlefieldContainer.addChild(this.player1CharactersContainer);
    this.container.addChild(this.battlefieldContainer);
  }

  private createHandArea(): void {
    this.handContainer = new Container();
    
    // Position hand at bottom of screen
    const handY = this.gameHeight * 0.8;
    const handHeight = this.gameHeight * 0.2;
    
    // Hand background
    const handBg = new Graphics();
    handBg.roundRect(0, handY, this.gameWidth, handHeight, 10)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    this.handContainer.addChild(handBg);
    this.handContainer.y = handY;
    
    this.container.addChild(this.handContainer);
  }

  private createEnergyIndicator(): void {
    this.energyContainer = new Container();
    
    // Position in top-right corner
    this.energyContainer.x = this.gameWidth - 150;
    this.energyContainer.y = 10;
    
    this.container.addChild(this.energyContainer);
  }

  private createTurnIndicator(): void {
    this.turnIndicatorContainer = new Container();
    
    // Position in top-center
    this.turnIndicatorContainer.x = this.gameWidth / 2;
    this.turnIndicatorContainer.y = 10;
    
    this.container.addChild(this.turnIndicatorContainer);
  }

  private createActionLog(): void {
    this.actionLogContainer = new Container();
    
    // Position on left side
    const logWidth = 200;
    const logHeight = this.gameHeight * 0.4;
    
    const logBg = new Graphics();
    logBg.roundRect(0, 0, logWidth, logHeight, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    this.actionLogContainer.addChild(logBg);
    this.actionLogContainer.x = 10;
    this.actionLogContainer.y = this.gameHeight * 0.3;
    
    this.container.addChild(this.actionLogContainer);
  }

  private createDiscardPile(): void {
    this.discardPileContainer = new Container();
    
    // Position in bottom-left corner
    this.discardPileContainer.x = 10;
    this.discardPileContainer.y = this.gameHeight * 0.7;
    
    // Discard pile background
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, this.CARD_WIDTH + 10, this.CARD_HEIGHT + 10, 8)
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
    discardLabel.x = (this.CARD_WIDTH + 10) / 2;
    discardLabel.y = (this.CARD_HEIGHT + 10) / 2;
    
    this.discardPileContainer.addChild(discardBg, discardLabel);
    this.container.addChild(this.discardPileContainer);
  }

  private async initializeBattle(): Promise<void> {
    try {
      // Start the battle and get initial state
      const response = await battleApi.startTurn(this.battleId);
      this.battleState = response.data;
      
      if (this.battleState) {
        this.setupCharacters();
        this.updateUI();
        this.startTurnPhase();
      }
    } catch (error) {
      console.error('Failed to initialize battle:', error);
    }
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
    const characterSpacing = this.gameWidth / 4;
    
    player.characters.forEach((character, index) => {
      if (index < 3) { // Only show first 3 characters
        const x = characterSpacing * (index + 0.5);
        const y = 0;
        
        const characterCard = this.createCharacterCard(character, x, y, isOpponent);
        container.addChild(characterCard);
        this.characterCards.set(character.id, characterCard);
      }
    });
  }

  private createCharacterCard(character: CardBattleCharacter, x: number, y: number, isOpponent: boolean): Container {
    const card = new Container();
    
    // Background
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
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = this.CHARACTER_CARD_WIDTH / 2;
    nameText.y = 15;
    
    // HP Bar
    const hpBarBg = new Graphics();
    hpBarBg.roundRect(10, 130, this.CHARACTER_CARD_WIDTH - 20, 12, 6)
      .fill(Colors.HP_BAR_BG);
    
    const hpBarFill = new Graphics();
    const hpPercent = character.current_hp / character.max_hp;
    hpBarFill.roundRect(10, 130, (this.CHARACTER_CARD_WIDTH - 20) * hpPercent, 12, 6)
      .fill(Colors.HP_BAR_FILL);
    
    // HP Text
    const hpText = new Text({
      text: `${character.current_hp}/${character.max_hp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    hpText.anchor.set(0.5);
    hpText.x = this.CHARACTER_CARD_WIDTH / 2;
    hpText.y = 150;
    
    card.addChild(bg, nameText, hpBarBg, hpBarFill, hpText);
    card.x = x - this.CHARACTER_CARD_WIDTH / 2;
    card.y = y;
    
    // Store character reference
    (card as any).character = character;
    
    // Make interactive for targeting
    if (!isOpponent) {
      this.makeCharacterCardInteractive(card, character);
    }
    
    return card;
  }

  private makeCharacterCardInteractive(card: Container, character: CardBattleCharacter): void {
    card.interactive = true;
    card.cursor = 'pointer';
    
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

  private updateTurnIndicator(): void {
    if (!this.battleState) return;
    
    this.turnIndicatorContainer.removeChildren();
    
    const isPlayerTurn = this.battleState.current_player === 1;
    const turnText = new Text({
      text: isPlayerTurn ? 'YOUR TURN' : 'OPPONENT TURN',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: isPlayerTurn ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY,
        align: 'center'
      }
    });
    turnText.anchor.set(0.5);
    
    // Phase indicator
    const phaseText = new Text({
      text: `Phase: ${this.currentPhase.replace('_', ' ').toUpperCase()}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    phaseText.anchor.set(0.5);
    phaseText.y = 25;
    
    this.turnIndicatorContainer.addChild(turnText, phaseText);
  }

  private updateHandCards(): void {
    if (!this.battleState) return;
    
    // Clear existing hand cards
    this.handCards.forEach(card => card.destroy());
    this.handCards = [];
    
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (!currentPlayer || this.battleState.current_player !== 1) return; // Only show player 1's hand
    
    const handCards = currentPlayer.deck.hand_cards;
    const cardSpacing = Math.min(80, (this.gameWidth - 40) / Math.max(handCards.length, 1));
    
    handCards.forEach((cardInDeck, index) => {
      if (cardInDeck.card) {
        const x = 20 + (index * cardSpacing);
        const y = 10;
        
        const handCard = this.createHandCard(cardInDeck.card, x, y);
        this.handContainer.addChild(handCard);
        this.handCards.push(handCard);
      }
    });
  }

  private createHandCard(card: Card, x: number, y: number): Container {
    const cardContainer = new Container();
    
    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, this.HAND_CARD_WIDTH, this.HAND_CARD_HEIGHT, 6)
      .fill(Colors.CARD_BACKGROUND)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Card name
    const nameText = new Text({
      text: card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.HAND_CARD_WIDTH - 10
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = this.HAND_CARD_WIDTH / 2;
    nameText.y = 15;
    
    // Energy cost
    const costText = new Text({
      text: card.energy_cost?.toString() || '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.ENERGY_TEXT,
        align: 'center'
      }
    });
    costText.anchor.set(0.5);
    costText.x = this.HAND_CARD_WIDTH / 2;
    costText.y = this.HAND_CARD_HEIGHT - 15;
    
    cardContainer.addChild(bg, nameText, costText);
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
    
    // Move to top layer for dragging
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    this.container.addChild(cardContainer);
    
    // Attach drag events
    this.container.on('pointermove', this.onCardDragMove, this);
    this.container.on('pointerup', this.onCardDragEnd, this);
    
    event.stopPropagation();
  }

  private onCardDragMove(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return;
    
    this.dragTarget.x = event.global.x - this.dragOffset.x;
    this.dragTarget.y = event.global.y - this.dragOffset.y;
  }

  private onCardDragEnd(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return;
    
    const card = (this.dragTarget as any).card;
    const dropTarget = this.getDropTarget(event.global.x, event.global.y);
    
    // Remove drag events
    this.container.off('pointermove', this.onCardDragMove, this);
    this.container.off('pointerup', this.onCardDragEnd, this);
    
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
        this.battleState = response.data;
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
        this.battleState = response.data;
        this.updateUI();
        this.animateCardPlay(characterId);
      }
    } catch (error) {
      console.error('Failed to play card:', error);
    }
  }

  private returnCardToHand(cardContainer: Container): void {
    // Animate card back to hand
    gsap.to(cardContainer, {
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        this.updateHandCards(); // Refresh hand display
      }
    });
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

  private async startTurnPhase(): Promise<void> {
    this.currentPhase = 'start_turn';
    this.updateTurnIndicator();
    
    // Auto-proceed to draw phase
    setTimeout(() => {
      this.startDrawPhase();
    }, 1000);
  }

  private async startDrawPhase(): Promise<void> {
    if (!this.battleState) return;
    
    this.currentPhase = 'draw_phase';
    this.updateTurnIndicator();
    
    const turnAction: TurnAction = {
      type: 'draw_card',
      player_team: this.battleState.current_player
    };
    
    try {
      const response = await battleApi.drawCards(this.battleId, turnAction);
      if (response.success && response.data) {
        this.battleState = response.data;
        this.updateUI();
        this.animateCardDraw();
      }
    } catch (error) {
      console.error('Failed to draw cards:', error);
    }
    
    // Proceed to main phase
    setTimeout(() => {
      this.startMainPhase();
    }, 1500);
  }

  private animateCardDraw(): void {
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
  }

  private startMainPhase(): void {
    this.currentPhase = 'main_phase';
    this.updateTurnIndicator();
    
    // Player can now interact with cards
    // Create end turn button
    this.createEndTurnButton();
  }

  private createEndTurnButton(): void {
    const endTurnButton = new Container();
    
    const buttonBg = new Graphics();
    buttonBg.roundRect(0, 0, 120, 40, 8)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const buttonText = new Text({
      text: 'END TURN',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = 60;
    buttonText.y = 20;
    
    endTurnButton.addChild(buttonBg, buttonText);
    endTurnButton.x = this.gameWidth - 140;
    endTurnButton.y = this.gameHeight - 60;
    
    endTurnButton.interactive = true;
    endTurnButton.cursor = 'pointer';
    endTurnButton.on('pointertap', () => {
      this.endTurn();
    });
    
    this.container.addChild(endTurnButton);
  }

  private async endTurn(): Promise<void> {
    if (!this.battleState || this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentPhase = 'end_turn';
    this.updateTurnIndicator();
    
    const turnAction: TurnAction = {
      type: 'end_turn',
      player_team: this.battleState.current_player
    };
    
    try {
      const response = await battleApi.endTurn(this.battleId, turnAction);
      if (response.success && response.data) {
        this.battleState = response.data;
        this.updateUI();
        
        // Check for victory/defeat
        if (this.battleState && this.battleState.status === 'completed') {
          this.showBattleResult();
        } else {
          // Continue to next turn
          setTimeout(() => {
            this.startTurnPhase();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to end turn:', error);
    }
    
    this.isAnimating = false;
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