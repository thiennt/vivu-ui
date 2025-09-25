import { 
  CardBattleState, 
  CardBattlePlayerState, 
  CardBattleCharacter, 
  TurnAction,
  BattlePhaseName,
  Card
} from '@/types';
import { battleApi } from '@/services/api';

export interface BattleControllerEvents {
  onStateChange?: (state: CardBattleState) => void;
  onPhaseChange?: (phase: BattlePhaseName) => void;
  onCardDrawn?: (playerId: number, card: Card) => void;
  onCardPlayed?: (playerId: number, card: Card, target?: CardBattleCharacter) => void;
  onCharacterDamaged?: (character: CardBattleCharacter, damage: number) => void;
  onTurnEnd?: (playerId: number) => void;
  onGameEnd?: (winnerId: number) => void;
}

export class BattleController {
  private battleState: CardBattleState | null = null;
  private battleId: string;
  private currentPhase: BattlePhaseName = 'start_turn';
  private animationInProgress: boolean = false;
  private events: BattleControllerEvents;

  constructor(battleId: string, events: BattleControllerEvents = {}) {
    this.battleId = battleId;
    this.events = events;
  }

  public async initializeBattle(): Promise<void> {
    try {
      // Load initial battle state without starting a turn
      const response = await battleApi.getBattleState(this.battleId);
      this.battleState = response.data;
      
      console.log('Battle initialized with state:', this.battleState);
      
      if (this.battleState) {
        this.events.onStateChange?.(this.battleState);
      }
    } catch (error) {
      console.error('Failed to initialize battle:', error);
      throw error;
    }
  }

  public async startGameLoop(): Promise<void> {
    if (!this.battleState || this.battleState.status !== 'ongoing') {
      console.warn('Cannot start game loop - battle not ready');
      return;
    }

    // Main game loop following the requested flow
    while (this.battleState && this.battleState.status === 'ongoing') {
      try {
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
      } catch (error) {
        console.error('Error in game loop:', error);
        break;
      }
    }
  }

  private async processTurnStart(): Promise<void> {
    this.currentPhase = 'start_turn';
    this.events.onPhaseChange?.(this.currentPhase);
    
    if (!this.battleState) return;

    console.log(`Turn ${this.battleState.current_turn} - Player ${this.battleState.current_player} turn start`);
    
    // Apply start-of-turn effects
    await this.animateTurnStartEffects();
    
    // Refresh energy for current player
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (currentPlayer) {
      const maxEnergy = 10; // Assuming max energy is 10
      currentPlayer.deck.current_energy = Math.min(maxEnergy, currentPlayer.deck.current_energy + 1);
      this.events.onStateChange?.(this.battleState);
    }
  }

  private async processDrawPhase(): Promise<void> {
    this.currentPhase = 'draw_phase';
    this.events.onPhaseChange?.(this.currentPhase);
    
    if (!this.battleState) return;

    console.log('Draw Phase');
    
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (currentPlayer && currentPlayer.deck.deck_cards.length > 0) {
      // Draw a card (simplified - in real implementation would handle proper card drawing)
      const drawnCardInDeck = currentPlayer.deck.deck_cards.pop();
      if (drawnCardInDeck && drawnCardInDeck.card && currentPlayer.deck.hand_cards.length < 7) { // Max hand size
        currentPlayer.deck.hand_cards.push(drawnCardInDeck);
        this.events.onCardDrawn?.(currentPlayer.team, drawnCardInDeck.card);
        this.events.onStateChange?.(this.battleState);
      }
    }

    // Small delay for animation
    await this.delay(500);
  }

  private async processMainPhase(): Promise<void> {
    this.currentPhase = 'main_phase';
    this.events.onPhaseChange?.(this.currentPhase);
    
    if (!this.battleState) return;

    console.log('Main Phase - Player can take actions');
    
    // If it's player 1's turn, wait for player input
    if (this.battleState.current_player === 1) {
      // This would be handled by UI interactions
      // For now, just wait a bit and proceed
      await this.delay(1000);
    }
  }

  private async processEndTurn(): Promise<void> {
    this.currentPhase = 'end_turn';
    this.events.onPhaseChange?.(this.currentPhase);
    
    if (!this.battleState) return;

    console.log('End Turn');
    
    // Apply end-of-turn effects
    await this.delay(300);
    
    // Switch to next player
    this.battleState.current_player = this.battleState.current_player === 1 ? 2 : 1;
    
    // Increment turn if back to player 1
    if (this.battleState.current_player === 1) {
      this.battleState.current_turn += 1;
    }
    
    this.events.onTurnEnd?.(this.battleState.current_player);
    this.events.onStateChange?.(this.battleState);
  }

  private async processAITurn(): Promise<void> {
    console.log('AI Turn - Processing AI actions');
    
    if (!this.battleState) return;

    // Simulate AI thinking time
    await this.delay(1000);
    
    // Simple AI logic - could be enhanced
    await this.simulateAIActions();
  }

  private async simulateAIActions(): Promise<void> {
    if (!this.battleState) return;

    const aiPlayer = this.battleState.players.find(p => p.team === 2);
    if (!aiPlayer || aiPlayer.deck.hand_cards.length === 0) return;

    // AI plays a random card if it has enough energy
    const playableCardInDecks = aiPlayer.deck.hand_cards.filter(cardInDeck => 
      cardInDeck.card && cardInDeck.card.energy_cost <= aiPlayer.deck.current_energy
    );
    if (playableCardInDecks.length > 0) {
      const randomCardInDeck = playableCardInDecks[Math.floor(Math.random() * playableCardInDecks.length)];
      if (randomCardInDeck.card) {
        await this.playCard(2, randomCardInDeck.card);
      }
    }
  }

  public async playCard(playerId: number, card: Card, target?: CardBattleCharacter): Promise<boolean> {
    if (!this.battleState) return false;

    const player = this.battleState.players.find(p => p.team === playerId);
    if (!player) return false;

    // Check if player has enough energy
    if (player.deck.current_energy < card.energy_cost) {
      console.log('Not enough energy to play card');
      return false;
    }

    // Remove card from hand
    const cardIndex = player.deck.hand_cards.findIndex(cardInDeck => cardInDeck.card?.id === card.id);
    if (cardIndex === -1) return false;
    
    const removedCardInDeck = player.deck.hand_cards.splice(cardIndex, 1)[0];
    player.deck.current_energy -= card.energy_cost;
    
    // Add to discard pile
    if (removedCardInDeck) {
      player.deck.discard_cards.push(removedCardInDeck);
    }

    // Apply card effects
    await this.applyCardEffects(card, target, playerId);
    
    this.events.onCardPlayed?.(playerId, card, target);
    this.events.onStateChange?.(this.battleState);
    
    return true;
  }

  private async applyCardEffects(card: Card, target?: CardBattleCharacter, playerId?: number): Promise<void> {
    if (!this.battleState || !card.actions) return;

    // Simple card effect application - could be more sophisticated
    // For now, assume actions contain damage effects (this would need proper implementation)
    if (target) {
      const damage = 1; // Default damage - would come from card actions
      target.hp = Math.max(0, target.hp - damage);
      this.events.onCharacterDamaged?.(target, damage);
      
      if (target.hp <= 0) {
        console.log(`${target.name} was defeated!`);
      }
    }

    await this.delay(500); // Animation time
  }

  private checkGameEnd(): boolean {
    if (!this.battleState) return false;

    // Check if any player has all characters defeated
    for (const player of this.battleState.players) {
      const aliveCharacters = player.characters.filter(c => c.hp > 0);
      if (aliveCharacters.length === 0) {
        const winnerId = player.team === 1 ? 2 : 1;
        console.log(`Game Over! Player ${winnerId} wins!`);
        this.battleState.status = 'completed';
        this.events.onGameEnd?.(winnerId);
        return true;
      }
    }

    return false;
  }

  private async animateTurnStartEffects(): Promise<void> {
    // Placeholder for turn start animations
    await this.delay(300);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public getters
  public getBattleState(): CardBattleState | null {
    return this.battleState;
  }

  public getCurrentPhase(): BattlePhaseName {
    return this.currentPhase;
  }

  public getCurrentPlayer(): CardBattlePlayerState | null {
    if (!this.battleState) return null;
    return this.battleState.players.find(p => p.team === this.battleState!.current_player) || null;
  }

  public getOpponent(): CardBattlePlayerState | null {
    if (!this.battleState) return null;
    const opponentTeam = this.battleState.current_player === 1 ? 2 : 1;
    return this.battleState.players.find(p => p.team === opponentTeam) || null;
  }

  public isPlayerTurn(): boolean {
    return this.battleState?.current_player === 1;
  }

  public isAnimating(): boolean {
    return this.animationInProgress;
  }

  public setAnimating(animating: boolean): void {
    this.animationInProgress = animating;
  }
}