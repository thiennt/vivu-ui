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
import { 
  BattleController,
  BattleHand,
  BattleEnergyDisplay,
  BattleField,
  TurnIndicator,
  EndTurnButton
} from '@/ui/battle';
import { app } from '../app';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  /** Main container for all battle elements */
  public readonly gameContainer: Container;
  
  /** Battle game controller */
  public readonly battleController: BattleController;
  
  /** Player's hand display */
  public readonly playerHand: BattleHand;
  
  /** Opponent's hand display */
  public readonly opponentHand: BattleHand;
  
  /** Player's energy, deck, and discard display */
  public readonly playerEnergyDisplay: BattleEnergyDisplay;
  
  /** Opponent's energy, deck, and discard display */
  public readonly opponentEnergyDisplay: BattleEnergyDisplay;
  
  /** Main battlefield with characters and action log */
  public readonly battlefield: BattleField;
  
  /** Turn and phase indicator */
  public readonly turnIndicator: TurnIndicator;
  
  /** End turn button */
  public readonly endTurnButton: EndTurnButton;
  
  // Card interaction state
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };

  constructor(battleId?: string) {
    super();
    
    const id = battleId || 'mock-battle-001';
    
    // Initialize main container
    this.gameContainer = new Container();
    this.addChild(this.gameContainer);
    
    // Initialize battle controller with event handlers
    this.battleController = new BattleController(id, {
      onStateChange: this.onBattleStateChange.bind(this),
      onPhaseChange: this.onPhaseChange.bind(this),
      onCardDrawn: this.onCardDrawn.bind(this),
      onCardPlayed: this.onCardPlayed.bind(this),
      onCharacterDamaged: this.onCharacterDamaged.bind(this),
      onTurnEnd: this.onTurnEnd.bind(this),
      onGameEnd: this.onGameEnd.bind(this)
    });
    
    // Initialize UI components with placeholder dimensions (will be set in resize)
    this.playerHand = new BattleHand(
      { width: 400, height: 80, cardWidth: 50, cardHeight: 70 },
      {
        onCardDragStart: this.onCardDragStart.bind(this),
        onCardHover: this.onCardHover.bind(this),
        onCardOut: this.onCardOut.bind(this)
      }
    );
    
    this.opponentHand = new BattleHand(
      { width: 400, height: 80, cardWidth: 50, cardHeight: 70, isOpponent: true }
    );
    
    this.playerEnergyDisplay = new BattleEnergyDisplay(
      { width: 400, height: 50 }
    );
    
    this.opponentEnergyDisplay = new BattleEnergyDisplay(
      { width: 400, height: 50, isOpponent: true }
    );
    
    this.battlefield = new BattleField(
      { width: 600, height: 300, characterCardWidth: 100, characterCardHeight: 140 },
      {
        onCharacterClick: this.onCharacterClick.bind(this),
        onCharacterHover: this.onCharacterHover.bind(this)
      }
    );
    
    this.turnIndicator = new TurnIndicator(
      { width: 150, height: 70 }
    );
    
    this.endTurnButton = new EndTurnButton(
      { width: 120, height: 40 },
      {
        onEndTurn: this.onEndTurnClick.bind(this)
      }
    );
    
    // Add components to game container
    this.gameContainer.addChild(
      this.opponentEnergyDisplay,
      this.opponentHand,
      this.battlefield,
      this.playerHand,
      this.playerEnergyDisplay,
      this.turnIndicator,
      this.endTurnButton
    );
    
    this.setupDragAndDrop();
  }

  /** Prepare the screen just before showing */
  public prepare(): void {
    // Reset any previous state
    this.dragTarget = null;
    this.endTurnButton.setEnabled(false);
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    // Initialize battle
    await this.battleController.initializeBattle();
    
    // Show UI components with staggered animations
    await this.turnIndicator.show();
    await Promise.all([
      this.playerEnergyDisplay.show?.(),
      this.opponentEnergyDisplay.show?.()
    ]);
    await Promise.all([
      this.playerHand.show?.(),
      this.opponentHand.show?.()
    ]);
    await this.battlefield.show?.();
    await this.endTurnButton.show();
    
    // Start the game loop
    this.battleController.startGameLoop();
  }

  /** Hide screen with animations */
  public async hide(): Promise<void> {
    await Promise.all([
      this.endTurnButton.hide(),
      this.battlefield.hide?.(),
      this.playerHand.hide?.(),
      this.opponentHand.hide?.(),
      this.playerEnergyDisplay.hide?.(),
      this.opponentEnergyDisplay.hide?.(),
      this.turnIndicator.hide()
    ]);
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause(): Promise<void> {
    this.gameContainer.interactiveChildren = false;
  }

  /** Resume gameplay */
  public async resume(): Promise<void> {
    this.gameContainer.interactiveChildren = true;
  }

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    this.layoutComponents();
  }

  /** Update the screen */
  public update(): void {
    // Update logic can be added here if needed
  }

  private layoutComponents(): void {
    const padding = this.STANDARD_PADDING * 2;
    const spacing = this.STANDARD_SPACING * 2;
    
    // Calculate component heights
    const energyHeight = 50;
    const handHeight = 80;
    const turnIndicatorHeight = 70;
    const endTurnHeight = 40;
    
    const totalFixedHeight = energyHeight * 2 + handHeight * 2 + padding * 2 + spacing * 4;
    const battlefieldHeight = this.gameHeight - totalFixedHeight;
    
    // Position components vertically
    let currentY = padding;
    
    // Opponent energy display
    this.opponentEnergyDisplay.x = (this.gameWidth - (this.opponentEnergyDisplay as any).options.width) / 2;
    this.opponentEnergyDisplay.y = currentY;
    currentY += energyHeight + spacing;
    
    // Opponent hand
    this.opponentHand.x = (this.gameWidth - (this.opponentHand as any).options.width) / 2;
    this.opponentHand.y = currentY;
    currentY += handHeight + spacing;
    
    // Battlefield
    this.battlefield.x = (this.gameWidth - (this.battlefield as any).options.width) / 2;
    this.battlefield.y = currentY;
    currentY += battlefieldHeight + spacing;
    
    // Player hand
    this.playerHand.x = (this.gameWidth - (this.playerHand as any).options.width) / 2;
    this.playerHand.y = currentY;
    currentY += handHeight + spacing;
    
    // Player energy display
    this.playerEnergyDisplay.x = (this.gameWidth - (this.playerEnergyDisplay as any).options.width) / 2;
    this.playerEnergyDisplay.y = currentY;
    
    // Turn indicator (top right)
    this.turnIndicator.x = this.gameWidth - (this.turnIndicator as any).options.width - padding;
    this.turnIndicator.y = padding;
    
    // End turn button (bottom right)
    this.endTurnButton.x = this.gameWidth - (this.endTurnButton as any).options.width - padding;
    this.endTurnButton.y = this.gameHeight - (this.endTurnButton as any).options.height - padding;
  }

  private setupDragAndDrop(): void {
    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onCardDragEnd, this);
    app.stage.on('pointerupoutside', this.onCardDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  // Event handlers for battle controller
  private onBattleStateChange(state: CardBattleState): void {
    // Update UI components based on new battle state
    const player = state.players.find(p => p.team === 1);
    const opponent = state.players.find(p => p.team === 2);
    
    if (player) {
      const handCards = player.deck.hand_cards.map(cardInDeck => cardInDeck.card).filter(card => card != null) as Card[];
      this.playerHand.setCards(handCards);
      this.playerEnergyDisplay.updateEnergy(player.deck.current_energy, 10); // Assuming max energy is 10
      this.playerEnergyDisplay.updateDeckCount(player.deck.deck_cards.length);
      this.playerEnergyDisplay.updateDiscardCount(player.deck.discard_cards.length);
      this.battlefield.setPlayerCharacters(player.characters);
    }
    
    if (opponent) {
      // For opponent, we don't show actual cards, just count
      const hiddenCards = Array(opponent.deck.hand_cards.length).fill({ 
        id: 'hidden', 
        name: 'Hidden', 
        energy_cost: 0, 
        type: 'unknown', 
        effects: [] 
      });
      this.opponentHand.setCards(hiddenCards);
      this.opponentEnergyDisplay.updateEnergy(opponent.deck.current_energy, 10); // Assuming max energy is 10
      this.opponentEnergyDisplay.updateDeckCount(opponent.deck.deck_cards.length);
      this.opponentEnergyDisplay.updateDiscardCount(opponent.deck.discard_cards.length);
      this.battlefield.setOpponentCharacters(opponent.characters);
    }
    
    this.turnIndicator.updateTurn(state.current_turn, state.current_player);
    this.endTurnButton.setEnabled(state.current_player === 1 && this.battleController.getCurrentPhase() === 'main_phase');
  }

  private onPhaseChange(phase: BattlePhaseName): void {
    this.turnIndicator.updatePhase(phase);
    this.endTurnButton.setEnabled(phase === 'main_phase' && this.battleController.isPlayerTurn());
    
    // Add phase-specific logic here
    if (phase === 'main_phase' && this.battleController.isPlayerTurn()) {
      this.endTurnButton.pulse();
    }
  }

  private onCardDrawn(playerId: number, card: Card): void {
    this.battlefield.addLogEntry(`Player ${playerId} drew a card`);
  }

  private onCardPlayed(playerId: number, card: Card, target?: CardBattleCharacter): void {
    const targetText = target ? ` targeting ${target.name}` : '';
    this.battlefield.addLogEntry(`Player ${playerId} played ${card.name}${targetText}`);
  }

  private onCharacterDamaged(character: CardBattleCharacter, damage: number): void {
    this.battlefield.addLogEntry(`${character.name} takes ${damage} damage`);
  }

  private onTurnEnd(playerId: number): void {
    this.battlefield.addLogEntry(`Player ${playerId} ends their turn`);
  }

  private onGameEnd(winnerId: number): void {
    this.battlefield.addLogEntry(`Game Over! Player ${winnerId} wins!`);
    // Could show game over screen here
  }

  // Event handlers for UI components
  private onCardDragStart(card: Card, cardContainer: Container): void {
    if (!this.battleController.isPlayerTurn() || this.battleController.getCurrentPhase() !== 'main_phase') {
      return;
    }
    
    this.dragTarget = cardContainer;
    
    // Setup drag data
    const globalPos = cardContainer.getGlobalPosition();
    this.dragOffset.x = (app.stage as any).eventData?.global.x - globalPos.x || 0;
    this.dragOffset.y = (app.stage as any).eventData?.global.y - globalPos.y || 0;
    
    // Visual feedback
    cardContainer.alpha = 0.8;
    cardContainer.cursor = 'grabbing';
    (cardContainer as any).zIndex = 1000;
    
    // Move to stage for unrestricted movement
    if (cardContainer.parent) {
      const newPos = cardContainer.parent.toGlobal(cardContainer.position);
      cardContainer.parent.removeChild(cardContainer);
      this.addChild(cardContainer);
      cardContainer.position.set(newPos.x, newPos.y);
    }
    
    // Attach pointermove to stage
    app.stage.on('pointermove', this.onCardDragMove, this);
  }

  private onCardDragMove = (event: FederatedPointerEvent): void => {
    if (!this.dragTarget) return;
    
    this.dragTarget.position.set(
      event.global.x - this.dragOffset.x,
      event.global.y - this.dragOffset.y
    );
  };

  private onCardDragEnd(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return;
    
    const card = (this.dragTarget as any).card;
    const dropTarget = this.getDropTarget(event.global.x, event.global.y);
    
    // Remove drag events from stage
    app.stage.off('pointermove', this.onCardDragMove, this);
    
    if (dropTarget && card) {
      this.handleCardDrop(card, dropTarget);
    } else {
      // Return card to hand
      this.returnCardToHand(this.dragTarget);
    }
    
    this.dragTarget.alpha = 1.0;
    this.dragTarget.cursor = 'grab';
    this.dragTarget = null;
  }

  private getDropTarget(x: number, y: number): CardBattleCharacter | null {
    // Check if dropped on opponent character
    const opponentCharacters = this.battlefield.getOpponentCharacters();
    for (const character of opponentCharacters) {
      // This is a simplified hit test - in a real implementation, 
      // you'd check against the actual character containers
      if (character.hp > 0) {
        return character;
      }
    }
    return null;
  }

  private async handleCardDrop(card: Card, target: CardBattleCharacter): Promise<void> {
    const success = await this.battleController.playCard(1, card, target);
    if (success && this.dragTarget) {
      // Remove card from display
      this.dragTarget.destroy({ children: true });
    }
  }

  private returnCardToHand(cardContainer: Container): void {
    if (!cardContainer) return;
    
    // Animate card back to hand
    const handBounds = this.playerHand.getBounds();
    gsap.to(cardContainer, {
      x: handBounds.x + handBounds.width / 2,
      y: handBounds.y + handBounds.height / 2,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        if (cardContainer.parent) {
          cardContainer.parent.removeChild(cardContainer);
        }
        // The hand component will handle redisplaying the card
      }
    });
  }

  private onCardHover(card: Card, cardContainer: Container): void {
    // Could show card details popup here
  }

  private onCardOut(card: Card, cardContainer: Container): void {
    // Hide card details popup here
  }

  private onCharacterClick(character: CardBattleCharacter, cardContainer: Container): void {
    console.log('Character clicked:', character.name);
  }

  private onCharacterHover(character: CardBattleCharacter, cardContainer: Container): void {
    // Could show character details here
  }

  private onEndTurnClick(): void {
    if (this.battleController.isPlayerTurn()) {
      console.log('Ending player turn...');
      // The battle controller will handle the actual turn end logic
    }
  }
}