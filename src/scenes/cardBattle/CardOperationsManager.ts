import { 
  CardInDeck, 
  CardBattleApiResponse, 
  CardBattleLog,
  CardBattleLogTarget,
  TurnAction
} from '@/types';
import { battleApi } from '@/services/api';
import { CardBattlePlayerStateManager } from './PlayerStateManager';
import { CardBattleAnimationManager } from './AnimationManager';

/**
 * Manages card operations and battle actions for the CardBattleScene
 */
export class CardBattleCardOperationsManager {
  private playerStateManager: CardBattlePlayerStateManager;
  private animationManager: CardBattleAnimationManager;
  private battleId: string;

  constructor(
    playerStateManager: CardBattlePlayerStateManager,
    animationManager: CardBattleAnimationManager,
    battleId: string
  ) {
    this.playerStateManager = playerStateManager;
    this.animationManager = animationManager;
    this.battleId = battleId;
  }

  /**
   * Draw cards for the current player
   */
  async drawCards(): Promise<void> {
    const currentPlayer = this.playerStateManager.getCurrentPlayer();
    console.log(`🃏 Drawing cards for player ${currentPlayer}`);

    try {
      const action: TurnAction = {
        type: 'draw_card',
        player_team: currentPlayer
      };
      const response = await battleApi.drawCards(this.battleId, action);
      await this.processCardBattleApiResponse(response);
    } catch (error) {
      console.error('❌ Error drawing cards:', error);
      throw error;
    }
  }

  /**
   * Play a card on a character
   */
  async playCardOnCharacter(card: CardInDeck, targetPlayerId: number, characterIndex: number): Promise<void> {
    const currentPlayer = this.playerStateManager.getCurrentPlayer();
    
    if (currentPlayer !== 1) {
      console.log('🚫 Not player turn');
      return;
    }

    if (!card.card || !this.playerStateManager.canPlayCard(currentPlayer, card)) {
      console.log('🚫 Not enough energy to play card or invalid card');
      return;
    }

    console.log(`🎯 Playing card ${card.card.name} on character ${characterIndex} of player ${targetPlayerId}`);

    try {
      const action: TurnAction = {
        type: 'play_card',
        player_team: currentPlayer,
        card_id: card.card_id || '',
        target_ids: [this.getTargetCharacterId(targetPlayerId, characterIndex)]
      };

      const response = await battleApi.playAction(this.battleId, action);
      await this.processCardBattleApiResponse(response);

      // Remove card from hand locally
      this.playerStateManager.removeCardFromHand(currentPlayer, card.card_id || '');
      
      // Deduct energy locally
      const currentEnergy = this.playerStateManager.getPlayerEnergy(currentPlayer);
      this.playerStateManager.updatePlayerEnergy(currentPlayer, currentEnergy - card.card.energy_cost);

    } catch (error) {
      console.error('❌ Error playing card:', error);
      throw error;
    }
  }

  /**
   * Discard a card
   */
  async discardCard(card: CardInDeck): Promise<void> {
    const currentPlayer = this.playerStateManager.getCurrentPlayer();
    
    if (currentPlayer !== 1) {
      console.log('🚫 Not player turn');
      return;
    }

    console.log(`🗑️ Discarding card: ${card.card?.name || 'Unknown card'}`);

    try {
      const action: TurnAction = {
        type: 'discard_card',
        player_team: currentPlayer,
        card_id: card.card_id || ''
      };

      const response = await battleApi.playAction(this.battleId, action);
      await this.processCardBattleApiResponse(response);

      // Move card from hand to discard locally
      this.playerStateManager.removeCardFromHand(currentPlayer, card.card_id || '');
      this.playerStateManager.addCardToDiscard(currentPlayer, card);

    } catch (error) {
      console.error('❌ Error discarding card:', error);
      throw error;
    }
  }

  /**
   * End the current player's turn
   */
  async endTurn(): Promise<void> {
    const currentPlayer = this.playerStateManager.getCurrentPlayer();
    
    if (currentPlayer !== 1) {
      console.log('🚫 Not player turn');
      return;
    }

    console.log('🔚 Ending player turn');

    try {
      // Use startTurn API as endPlayerTurn may not exist
      const response = await battleApi.startTurn(this.battleId);
      await this.processCardBattleApiResponse(response);

      console.log('✅ Player turn ended successfully');
    } catch (error) {
      console.error('❌ Error ending turn:', error);
      throw error;
    }
  }

  /**
   * Handle AI turn
   */
  async handleAITurn(): Promise<void> {
    console.log('🤖 AI Turn started');

    try {
      await this.animationManager.showTurnMessage('AI is thinking...');
      
      // Use startTurn API as processAITurn may not exist
      const response = await battleApi.startTurn(this.battleId);
      await this.processCardBattleApiResponse(response);

      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('🎯 AI Turn ended');
    } catch (error) {
      console.error('❌ Error during AI turn:', error);
      throw error;
    }
  }

  /**
   * Check if the battle has ended
   */
  checkBattleEnd(): boolean {
    const player1Lost = this.playerStateManager.hasPlayerLost(1);
    const player2Lost = this.playerStateManager.hasPlayerLost(2);

    if (player1Lost || player2Lost) {
      console.log(`🏁 Battle ended! Player ${player1Lost ? 2 : 1} wins!`);
      return true;
    }

    return false;
  }

  /**
   * Show battle end screen
   */
  async showBattleEnd(playerWon: boolean): Promise<void> {
    const message = playerWon ? 
      '🎉 Victory! You defeated all enemy characters!' : 
      '💀 Defeat! All your characters have been defeated.';
    
    await this.animationManager.showTurnMessage(message);
    
    // Additional battle end logic could go here
    // For example, showing rewards, experience gained, etc.
  }

  /**
   * Process CardBattle API response and trigger animations
   */
  private async processCardBattleApiResponse(response: CardBattleApiResponse<CardBattleLog[]>): Promise<void> {
    if (response.success && response.data) {
      console.log(`✅ API call successful: ${response.message}`);
      await this.processCardBattleLogs(response.data);
    } else {
      console.error(`❌ API call failed (${response.code}): ${response.message}`);
      if (response.errors) {
        response.errors.forEach((error: unknown) => console.error(`   Error: ${error}`));
      }
    }
  }

  /**
   * Update local game state based on a CardBattleLog entry
   */
  private updateGameStateFromLog(log: CardBattleLog): void {
    console.log(`🔄 Updating game state for action: ${log.action_type}`, log);

    switch (log.action_type) {
      case 'draw_card':
        this.handleDrawCardStateUpdate(log);
        break;
      case 'play_card':
        this.handlePlayCardStateUpdate(log);
        break;
      case 'discard_card':
        this.handleDiscardCardStateUpdate(log);
        break;
      default:
        // Handle other action types like character effects, status changes
        this.handleGenericStateUpdate(log);
        break;
    }
  }

  /**
   * Handle state update for draw card action
   */
  private handleDrawCardStateUpdate(log: CardBattleLog): void {
    if (!log.drawn_cards || log.drawn_cards.length === 0) {
      return;
    }

    const playerTeam = log.actor.team;
    console.log(`🃏 Adding ${log.drawn_cards.length} cards to player ${playerTeam} hand`);

    // Add drawn cards to hand
    for (const drawnCard of log.drawn_cards) {
      const cardInDeck: CardInDeck = {
        card_id: drawnCard.id,
        card: drawnCard
      };
      this.playerStateManager.addCardToHand(playerTeam, cardInDeck);
    }

    // Remove cards from deck (we can't know exactly which cards were removed,
    // but we know the count, so remove the same number from the top)
    this.playerStateManager.removeCardsFromDeck(playerTeam, log.drawn_cards.length);
  }

  /**
   * Handle state update for play card action
   */
  private handlePlayCardStateUpdate(log: CardBattleLog): void {
    if (!log.card) {
      return;
    }

    const playerTeam = log.actor.team;
    console.log(`🎯 Removing played card ${log.card.name} from player ${playerTeam} hand`);

    // Remove card from hand
    this.playerStateManager.removeCardFromHand(playerTeam, log.card.id);

    // Update character states if targets are affected
    if (log.targets && log.targets.length > 0) {
      this.updateCharacterStatesFromTargets(log.targets);
    }

    // Deduct energy cost
    const currentEnergy = this.playerStateManager.getPlayerEnergy(playerTeam);
    this.playerStateManager.updatePlayerEnergy(playerTeam, currentEnergy - log.card.energy_cost);
  }

  /**
   * Handle state update for discard card action
   */
  private handleDiscardCardStateUpdate(log: CardBattleLog): void {
    if (!log.card) {
      return;
    }

    const playerTeam = log.actor.team;
    console.log(`🗑️ Moving discarded card ${log.card.name} from hand to discard pile`);

    // Remove card from hand
    const removedCard = this.playerStateManager.removeCardFromHand(playerTeam, log.card.id);
    
    // Add to discard pile if successfully removed
    if (removedCard) {
      this.playerStateManager.addCardToDiscard(playerTeam, removedCard);
    }
  }

  /**
   * Handle generic state updates for other action types
   */
  private handleGenericStateUpdate(log: CardBattleLog): void {
    // Update character states if targets are affected
    if (log.targets && log.targets.length > 0) {
      this.updateCharacterStatesFromTargets(log.targets);
    }

    // Handle energy changes from impacts
    if (log.impacts) {
      for (const impact of log.impacts) {
        if (impact.type === 'energy') {
          const playerTeam = log.actor.team;
          const currentEnergy = this.playerStateManager.getPlayerEnergy(playerTeam);
          const energyChange = typeof impact.value === 'number' ? impact.value : 0;
          this.playerStateManager.updatePlayerEnergy(playerTeam, currentEnergy + energyChange);
        }
      }
    }
  }

  /**
   * Update character states based on target information from log
   */
  private updateCharacterStatesFromTargets(targets: CardBattleLogTarget[]): void {
    for (const target of targets) {
      if (target.after && target.after.characterId) {
        console.log(`⚡ Updating character ${target.after.characterId} state`);
        this.playerStateManager.updateCharacterState(target.after);
      }
    }
  }

  /**
   * Centralized method to process CardBattleLogs for animations
   */
  private async processCardBattleLogs(battleLogs: CardBattleLog[]): Promise<void> {
    console.log('🎬 Processing CardBattle logs for animation:', battleLogs);
    
    for (const log of battleLogs) {
      // First update the game state based on the log entry
      this.updateGameStateFromLog(log);
      
      // Then animate the action
      await this.animationManager.animateCardBattleLogEntry(log);
      
      // Small delay between log animations for better visual flow
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  /**
   * Get target character ID for card targeting
   */
  private getTargetCharacterId(targetPlayerId: number, characterIndex: number): string {
    const characters = this.playerStateManager.getPlayerCharacters(targetPlayerId);
    if (characterIndex < characters.length) {
      return characters[characterIndex].character_id;
    }
    return '';
  }

  /**
   * Start a new battle sequence
   */
  async startBattleSequence(): Promise<void> {
    console.log('⚔️ Starting battle sequence');

    try {
      await this.animationManager.showTurnMessage('Battle begins!');
      
      // Start the first turn
      await this.startPlayerTurn();
    } catch (error) {
      console.error('❌ Error starting battle:', error);
      throw error;
    }
  }

  /**
   * Start a player turn
   */
  private async startPlayerTurn(): Promise<void> {
    const currentPlayer = this.playerStateManager.getCurrentPlayer();
    console.log(`🎮 Starting turn for player ${currentPlayer}`);

    try {
      if (currentPlayer === 1) {
        await this.animationManager.showTurnMessage('Your turn!');
        await this.drawCards();
      } else {
        await this.handleAITurn();
      }
    } catch (error) {
      console.error('❌ Error starting player turn:', error);
      throw error;
    }
  }

  /**
   * Get current game state summary
   */
  getGameStateSummary(): {
    currentPlayer: number;
    player1: {
      characters: number;
      charactersAlive: number;
      handSize: number;
      deckSize: number;
      discardSize: number;
      energy: number;
      maxEnergy: number;
    };
    player2: {
      characters: number;
      charactersAlive: number;
      handSize: number;
      deckSize: number;
      discardSize: number;
      energy: number;
      maxEnergy: number;
    };
  } {
    return this.playerStateManager.getGameStateSummary();
  }
}