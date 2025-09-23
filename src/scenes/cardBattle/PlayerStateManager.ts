import { 
  CardBattleState, 
  CardBattleCharacter, 
  CardInDeck 
} from '@/types';

/**
 * Manages player state data for the CardBattleScene
 */
export class CardBattlePlayerStateManager {
  private battleState: CardBattleState | null = null;

  // References to CardBattleScene's state arrays (passed from CardBattleScene)
  private player1Characters: CardBattleCharacter[] = [];
  private player1HandCards: CardInDeck[] = [];
  private player1DeckCards: CardInDeck[] = [];
  private player1DiscardedCards: CardInDeck[] = [];
  
  private player2Characters: CardBattleCharacter[] = [];
  private player2HandCards: CardInDeck[] = [];
  private player2DeckCards: CardInDeck[] = [];
  private player2DiscardedCards: CardInDeck[] = [];

  /**
   * Initialize state from battle data
   */
  setBattleState(battleState: CardBattleState): void {
    this.battleState = battleState;
  }

  /**
   * Update player state arrays (called from CardBattleScene)
   */
  updatePlayerState(
    player1Characters: CardBattleCharacter[],
    player1HandCards: CardInDeck[],
    player1DeckCards: CardInDeck[],
    player1DiscardedCards: CardInDeck[],
    player2Characters: CardBattleCharacter[],
    player2HandCards: CardInDeck[],
    player2DeckCards: CardInDeck[],
    player2DiscardedCards: CardInDeck[]
  ): void {
    this.player1Characters = player1Characters;
    this.player1HandCards = player1HandCards;
    this.player1DeckCards = player1DeckCards;
    this.player1DiscardedCards = player1DiscardedCards;
    this.player2Characters = player2Characters;
    this.player2HandCards = player2HandCards;
    this.player2DeckCards = player2DeckCards;
    this.player2DiscardedCards = player2DiscardedCards;
  }

  /**
   * Get characters for a specific player
   */
  getPlayerCharacters(playerTeam: number): CardBattleCharacter[] {
    return playerTeam === 1 ? this.player1Characters : this.player2Characters;
  }

  /**
   * Get hand cards for a specific player
   */
  getPlayerHandCards(playerTeam: number): CardInDeck[] {
    return playerTeam === 1 ? this.player1HandCards : this.player2HandCards;
  }

  /**
   * Get deck cards for a specific player
   */
  getPlayerDeckCards(playerTeam: number): CardInDeck[] {
    return playerTeam === 1 ? this.player1DeckCards : this.player2DeckCards;
  }

  /**
   * Get discarded cards for a specific player
   */
  getPlayerDiscardedCards(playerTeam: number): CardInDeck[] {
    return playerTeam === 1 ? this.player1DiscardedCards : this.player2DiscardedCards;
  }

  /**
   * Get the current player number
   */
  getCurrentPlayer(): number {
    return this.battleState?.current_player || 1;
  }

  /**
   * Get current battle state
   */
  getBattleState(): CardBattleState | null {
    return this.battleState;
  }

  /**
   * Add a card to player's hand
   */
  addCardToHand(playerTeam: number, card: CardInDeck): void {
    const handCards = playerTeam === 1 ? this.player1HandCards : this.player2HandCards;
    handCards.push(card);
  }

  /**
   * Remove a card from player's hand
   */
  removeCardFromHand(playerTeam: number, cardId: string): CardInDeck | null {
    const handCards = playerTeam === 1 ? this.player1HandCards : this.player2HandCards;
    const cardIndex = handCards.findIndex(card => card.card_id === cardId);
    
    if (cardIndex >= 0) {
      return handCards.splice(cardIndex, 1)[0];
    }
    
    return null;
  }

  /**
   * Add a card to player's discard pile
   */
  addCardToDiscard(playerTeam: number, card: CardInDeck): void {
    const discardCards = playerTeam === 1 ? this.player1DiscardedCards : this.player2DiscardedCards;
    discardCards.push(card);
  }

  /**
   * Draw cards from deck to hand
   */
  drawCardsFromDeck(playerTeam: number, count: number): CardInDeck[] {
    const deckCards = playerTeam === 1 ? this.player1DeckCards : this.player2DeckCards;
    const handCards = playerTeam === 1 ? this.player1HandCards : this.player2HandCards;
    
    const drawnCards: CardInDeck[] = [];
    const cardsToDraw = Math.min(count, deckCards.length);
    
    for (let i = 0; i < cardsToDraw; i++) {
      const card = deckCards.shift();
      if (card) {
        handCards.push(card);
        drawnCards.push(card);
      }
    }
    
    return drawnCards;
  }

  /**
   * Update character HP
   */
  updateCharacterHP(playerTeam: number, characterId: string, newHP: number): void {
    const characters = playerTeam === 1 ? this.player1Characters : this.player2Characters;
    const character = characters.find(char => char.character_id === characterId);
    
    if (character) {
      character.current_hp = Math.max(0, Math.min(newHP, character.max_hp));
    }
  }

  /**
   * Check if a player has lost (all characters defeated)
   */
  hasPlayerLost(playerTeam: number): boolean {
    const characters = this.getPlayerCharacters(playerTeam);
    return characters.every(character => character.current_hp <= 0);
  }

  /**
   * Get player energy
   */
  getPlayerEnergy(playerTeam: number): number {
    if (!this.battleState) return 0;
    
    const player = this.battleState.players.find(p => p.team === playerTeam);
    // Use deck's current_energy as fallback since PlayerState doesn't have it
    return player?.deck?.current_energy || 0;
  }

  /**
   * Get player max energy
   */
  getPlayerMaxEnergy(playerTeam: number): number {
    // Return a default max energy since it's not in the standard interface
    return 5;
  }

  /**
   * Update player energy
   */
  updatePlayerEnergy(playerTeam: number, newEnergy: number): void {
    if (!this.battleState) return;
    
    const player = this.battleState.players.find(p => p.team === playerTeam);
    if (player && player.deck) {
      player.deck.current_energy = Math.max(0, Math.min(newEnergy, this.getPlayerMaxEnergy(playerTeam)));
    }
  }

  /**
   * Check if player can afford to play a card
   */
  canPlayCard(playerTeam: number, card: CardInDeck): boolean {
    const playerEnergy = this.getPlayerEnergy(playerTeam);
    return card.card ? playerEnergy >= card.card.energy_cost : false;
  }

  /**
   * Get a summary of current game state
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
    return {
      currentPlayer: this.getCurrentPlayer(),
      player1: {
        characters: this.player1Characters.length,
        charactersAlive: this.player1Characters.filter(c => c.current_hp > 0).length,
        handSize: this.player1HandCards.length,
        deckSize: this.player1DeckCards.length,
        discardSize: this.player1DiscardedCards.length,
        energy: this.getPlayerEnergy(1),
        maxEnergy: this.getPlayerMaxEnergy(1)
      },
      player2: {
        characters: this.player2Characters.length,
        charactersAlive: this.player2Characters.filter(c => c.current_hp > 0).length,
        handSize: this.player2HandCards.length,
        deckSize: this.player2DeckCards.length,
        discardSize: this.player2DiscardedCards.length,
        energy: this.getPlayerEnergy(2),
        maxEnergy: this.getPlayerMaxEnergy(2)
      }
    };
  }
}