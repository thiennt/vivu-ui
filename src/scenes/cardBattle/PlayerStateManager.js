"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardBattlePlayerStateManager = void 0;
/**
 * Manages player state data for the CardBattleScene
 */
var CardBattlePlayerStateManager = /** @class */ (function () {
    function CardBattlePlayerStateManager() {
        // Fixed variables for each player's game state
        this.player1Characters = [];
        this.player1HandCards = [];
        this.player1DeckCards = [];
        this.player1DiscardedCards = [];
        this.player2Characters = [];
        this.player2HandCards = [];
        this.player2DeckCards = [];
        this.player2DiscardedCards = [];
        this.battleState = null;
    }
    /**
     * Initialize state from battle data
     */
    CardBattlePlayerStateManager.prototype.setBattleState = function (battleState) {
        this.battleState = battleState;
        this.updateFixedVariables();
    };
    /**
     * Update fixed variables from the current battle state
     */
    CardBattlePlayerStateManager.prototype.updateFixedVariables = function () {
        var _this = this;
        if (!this.battleState)
            return;
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
        this.battleState.players.forEach(function (player) {
            if (player.team === 1) {
                _this.player1Characters = __spreadArray([], player.characters, true);
                _this.player1HandCards = __spreadArray([], player.deck.hand_cards, true);
                _this.player1DeckCards = __spreadArray([], player.deck.deck_cards, true);
                _this.player1DiscardedCards = __spreadArray([], player.deck.discard_cards, true);
            }
            else if (player.team === 2) {
                _this.player2Characters = __spreadArray([], player.characters, true);
                _this.player2HandCards = __spreadArray([], player.deck.hand_cards, true);
                _this.player2DeckCards = __spreadArray([], player.deck.deck_cards, true);
                _this.player2DiscardedCards = __spreadArray([], player.deck.discard_cards, true);
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
    };
    /**
     * Get characters for a specific player
     */
    CardBattlePlayerStateManager.prototype.getPlayerCharacters = function (playerTeam) {
        return playerTeam === 1 ? this.player1Characters : this.player2Characters;
    };
    /**
     * Get hand cards for a specific player
     */
    CardBattlePlayerStateManager.prototype.getPlayerHandCards = function (playerTeam) {
        return playerTeam === 1 ? this.player1HandCards : this.player2HandCards;
    };
    /**
     * Get deck cards for a specific player
     */
    CardBattlePlayerStateManager.prototype.getPlayerDeckCards = function (playerTeam) {
        return playerTeam === 1 ? this.player1DeckCards : this.player2DeckCards;
    };
    /**
     * Get discarded cards for a specific player
     */
    CardBattlePlayerStateManager.prototype.getPlayerDiscardedCards = function (playerTeam) {
        return playerTeam === 1 ? this.player1DiscardedCards : this.player2DiscardedCards;
    };
    /**
     * Get the current player number
     */
    CardBattlePlayerStateManager.prototype.getCurrentPlayer = function () {
        var _a;
        return ((_a = this.battleState) === null || _a === void 0 ? void 0 : _a.current_player) || 1;
    };
    /**
     * Get current battle state
     */
    CardBattlePlayerStateManager.prototype.getBattleState = function () {
        return this.battleState;
    };
    /**
     * Add a card to player's hand
     */
    CardBattlePlayerStateManager.prototype.addCardToHand = function (playerTeam, card) {
        var handCards = playerTeam === 1 ? this.player1HandCards : this.player2HandCards;
        handCards.push(card);
    };
    /**
     * Remove a card from player's hand
     */
    CardBattlePlayerStateManager.prototype.removeCardFromHand = function (playerTeam, cardId) {
        var handCards = playerTeam === 1 ? this.player1HandCards : this.player2HandCards;
        var cardIndex = handCards.findIndex(function (card) { return card.card_id === cardId; });
        if (cardIndex >= 0) {
            return handCards.splice(cardIndex, 1)[0];
        }
        return null;
    };
    /**
     * Add a card to player's discard pile
     */
    CardBattlePlayerStateManager.prototype.addCardToDiscard = function (playerTeam, card) {
        var discardCards = playerTeam === 1 ? this.player1DiscardedCards : this.player2DiscardedCards;
        discardCards.push(card);
    };
    /**
     * Draw cards from deck to hand
     */
    CardBattlePlayerStateManager.prototype.drawCardsFromDeck = function (playerTeam, count) {
        var deckCards = playerTeam === 1 ? this.player1DeckCards : this.player2DeckCards;
        var handCards = playerTeam === 1 ? this.player1HandCards : this.player2HandCards;
        var drawnCards = [];
        var cardsToDraw = Math.min(count, deckCards.length);
        for (var i = 0; i < cardsToDraw; i++) {
            var card = deckCards.shift();
            if (card) {
                handCards.push(card);
                drawnCards.push(card);
            }
        }
        return drawnCards;
    };
    /**
     * Update character HP
     */
    CardBattlePlayerStateManager.prototype.updateCharacterHP = function (playerTeam, characterId, newHP) {
        var characters = playerTeam === 1 ? this.player1Characters : this.player2Characters;
        var character = characters.find(function (char) { return char.character_id === characterId; });
        if (character) {
            character.current_hp = Math.max(0, Math.min(newHP, character.max_hp));
        }
    };
    /**
     * Check if a player has lost (all characters defeated)
     */
    CardBattlePlayerStateManager.prototype.hasPlayerLost = function (playerTeam) {
        var characters = this.getPlayerCharacters(playerTeam);
        return characters.every(function (character) { return character.current_hp <= 0; });
    };
    /**
     * Get player energy
     */
    CardBattlePlayerStateManager.prototype.getPlayerEnergy = function (playerTeam) {
        if (!this.battleState)
            return 0;
        var player = this.battleState.players.find(function (p) { return p.team === playerTeam; });
        return (player === null || player === void 0 ? void 0 : player.current_energy) || 0;
    };
    /**
     * Get player max energy
     */
    CardBattlePlayerStateManager.prototype.getPlayerMaxEnergy = function (playerTeam) {
        if (!this.battleState)
            return 5;
        var player = this.battleState.players.find(function (p) { return p.team === playerTeam; });
        return (player === null || player === void 0 ? void 0 : player.max_energy) || 5;
    };
    /**
     * Update player energy
     */
    CardBattlePlayerStateManager.prototype.updatePlayerEnergy = function (playerTeam, newEnergy) {
        if (!this.battleState)
            return;
        var player = this.battleState.players.find(function (p) { return p.team === playerTeam; });
        if (player) {
            player.current_energy = Math.max(0, Math.min(newEnergy, player.max_energy));
        }
    };
    /**
     * Check if player can afford to play a card
     */
    CardBattlePlayerStateManager.prototype.canPlayCard = function (playerTeam, card) {
        var playerEnergy = this.getPlayerEnergy(playerTeam);
        return playerEnergy >= card.card.energy_cost;
    };
    /**
     * Get a summary of current game state
     */
    CardBattlePlayerStateManager.prototype.getGameStateSummary = function () {
        return {
            currentPlayer: this.getCurrentPlayer(),
            player1: {
                characters: this.player1Characters.length,
                charactersAlive: this.player1Characters.filter(function (c) { return c.current_hp > 0; }).length,
                handSize: this.player1HandCards.length,
                deckSize: this.player1DeckCards.length,
                discardSize: this.player1DiscardedCards.length,
                energy: this.getPlayerEnergy(1),
                maxEnergy: this.getPlayerMaxEnergy(1)
            },
            player2: {
                characters: this.player2Characters.length,
                charactersAlive: this.player2Characters.filter(function (c) { return c.current_hp > 0; }).length,
                handSize: this.player2HandCards.length,
                deckSize: this.player2DeckCards.length,
                discardSize: this.player2DiscardedCards.length,
                energy: this.getPlayerEnergy(2),
                maxEnergy: this.getPlayerMaxEnergy(2)
            }
        };
    };
    return CardBattlePlayerStateManager;
}());
exports.CardBattlePlayerStateManager = CardBattlePlayerStateManager;
