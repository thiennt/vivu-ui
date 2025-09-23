"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardBattleCardOperationsManager = void 0;
var api_1 = require("@/services/api");
/**
 * Manages card operations and battle actions for the CardBattleScene
 */
var CardBattleCardOperationsManager = /** @class */ (function () {
    function CardBattleCardOperationsManager(playerStateManager, animationManager, battleId) {
        this.playerStateManager = playerStateManager;
        this.animationManager = animationManager;
        this.battleId = battleId;
    }
    /**
     * Draw cards for the current player
     */
    CardBattleCardOperationsManager.prototype.drawCards = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentPlayer, action, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentPlayer = this.playerStateManager.getCurrentPlayer();
                        console.log("\uD83C\uDCCF Drawing cards for player ".concat(currentPlayer));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        action = {
                            type: 'draw_card',
                            player_team: currentPlayer
                        };
                        return [4 /*yield*/, api_1.battleApi.drawCards(this.battleId, action)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, this.processCardBattleApiResponse(response)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('❌ Error drawing cards:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Play a card on a character
     */
    CardBattleCardOperationsManager.prototype.playCardOnCharacter = function (card, targetPlayerId, characterIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var currentPlayer, action, response, currentEnergy, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentPlayer = this.playerStateManager.getCurrentPlayer();
                        if (currentPlayer !== 1) {
                            console.log('🚫 Not player turn');
                            return [2 /*return*/];
                        }
                        if (!this.playerStateManager.canPlayCard(currentPlayer, card)) {
                            console.log('🚫 Not enough energy to play card');
                            return [2 /*return*/];
                        }
                        console.log("\uD83C\uDFAF Playing card ".concat(card.card.name, " on character ").concat(characterIndex, " of player ").concat(targetPlayerId));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        action = {
                            type: 'play_card',
                            player_team: currentPlayer,
                            card_id: card.card_id,
                            target_ids: [this.getTargetCharacterId(targetPlayerId, characterIndex)]
                        };
                        return [4 /*yield*/, api_1.battleApi.playAction(this.battleId, action)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, this.processCardBattleApiResponse(response)];
                    case 3:
                        _a.sent();
                        // Remove card from hand locally
                        this.playerStateManager.removeCardFromHand(currentPlayer, card.card_id);
                        currentEnergy = this.playerStateManager.getPlayerEnergy(currentPlayer);
                        this.playerStateManager.updatePlayerEnergy(currentPlayer, currentEnergy - card.card.energy_cost);
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('❌ Error playing card:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Discard a card
     */
    CardBattleCardOperationsManager.prototype.discardCard = function (card) {
        return __awaiter(this, void 0, void 0, function () {
            var currentPlayer, action, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentPlayer = this.playerStateManager.getCurrentPlayer();
                        if (currentPlayer !== 1) {
                            console.log('🚫 Not player turn');
                            return [2 /*return*/];
                        }
                        console.log("\uD83D\uDDD1\uFE0F Discarding card: ".concat(card.card.name));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        action = {
                            type: 'discard_card',
                            player_team: currentPlayer,
                            card_id: card.card_id
                        };
                        return [4 /*yield*/, api_1.battleApi.playAction(this.battleId, action)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, this.processCardBattleApiResponse(response)];
                    case 3:
                        _a.sent();
                        // Move card from hand to discard locally
                        this.playerStateManager.removeCardFromHand(currentPlayer, card.card_id);
                        this.playerStateManager.addCardToDiscard(currentPlayer, card);
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error('❌ Error discarding card:', error_3);
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * End the current player's turn
     */
    CardBattleCardOperationsManager.prototype.endTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentPlayer, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentPlayer = this.playerStateManager.getCurrentPlayer();
                        if (currentPlayer !== 1) {
                            console.log('🚫 Not player turn');
                            return [2 /*return*/];
                        }
                        console.log('🔚 Ending player turn');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, api_1.battleApi.startTurn(this.battleId)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, this.processCardBattleApiResponse(response)];
                    case 3:
                        _a.sent();
                        console.log('✅ Player turn ended successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        console.error('❌ Error ending turn:', error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle AI turn
     */
    CardBattleCardOperationsManager.prototype.handleAITurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🤖 AI Turn started');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.animationManager.showTurnMessage('AI is thinking...')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, api_1.battleApi.startTurn(this.battleId)];
                    case 3:
                        response = _a.sent();
                        return [4 /*yield*/, this.processCardBattleApiResponse(response)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1500); })];
                    case 5:
                        _a.sent();
                        console.log('🎯 AI Turn ended');
                        return [3 /*break*/, 7];
                    case 6:
                        error_5 = _a.sent();
                        console.error('❌ Error during AI turn:', error_5);
                        throw error_5;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if the battle has ended
     */
    CardBattleCardOperationsManager.prototype.checkBattleEnd = function () {
        var player1Lost = this.playerStateManager.hasPlayerLost(1);
        var player2Lost = this.playerStateManager.hasPlayerLost(2);
        if (player1Lost || player2Lost) {
            console.log("\uD83C\uDFC1 Battle ended! Player ".concat(player1Lost ? 2 : 1, " wins!"));
            return true;
        }
        return false;
    };
    /**
     * Show battle end screen
     */
    CardBattleCardOperationsManager.prototype.showBattleEnd = function (playerWon) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = playerWon ?
                            '🎉 Victory! You defeated all enemy characters!' :
                            '💀 Defeat! All your characters have been defeated.';
                        return [4 /*yield*/, this.animationManager.showTurnMessage(message)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process CardBattle API response and trigger animations
     */
    CardBattleCardOperationsManager.prototype.processCardBattleApiResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(response.success && response.data)) return [3 /*break*/, 2];
                        console.log("\u2705 API call successful: ".concat(response.message));
                        return [4 /*yield*/, this.processCardBattleLogs(response.data)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        console.error("\u274C API call failed (".concat(response.code, "): ").concat(response.message));
                        if (response.errors) {
                            response.errors.forEach(function (error) { return console.error("   Error: ".concat(error)); });
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Centralized method to process CardBattleLogs for animations
     */
    CardBattleCardOperationsManager.prototype.processCardBattleLogs = function (battleLogs) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, battleLogs_1, log;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🎬 Processing CardBattle logs for animation:', battleLogs);
                        _i = 0, battleLogs_1 = battleLogs;
                        _a.label = 1;
                    case 1:
                        if (!(_i < battleLogs_1.length)) return [3 /*break*/, 5];
                        log = battleLogs_1[_i];
                        return [4 /*yield*/, this.animationManager.animateCardBattleLogEntry(log)];
                    case 2:
                        _a.sent();
                        // Small delay between log animations for better visual flow
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 300); })];
                    case 3:
                        // Small delay between log animations for better visual flow
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get target character ID for card targeting
     */
    CardBattleCardOperationsManager.prototype.getTargetCharacterId = function (targetPlayerId, characterIndex) {
        var characters = this.playerStateManager.getPlayerCharacters(targetPlayerId);
        if (characterIndex < characters.length) {
            return characters[characterIndex].character_id;
        }
        return '';
    };
    /**
     * Start a new battle sequence
     */
    CardBattleCardOperationsManager.prototype.startBattleSequence = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('⚔️ Starting battle sequence');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.animationManager.showTurnMessage('Battle begins!')];
                    case 2:
                        _a.sent();
                        // Start the first turn
                        return [4 /*yield*/, this.startPlayerTurn()];
                    case 3:
                        // Start the first turn
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        console.error('❌ Error starting battle:', error_6);
                        throw error_6;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start a player turn
     */
    CardBattleCardOperationsManager.prototype.startPlayerTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentPlayer, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentPlayer = this.playerStateManager.getCurrentPlayer();
                        console.log("\uD83C\uDFAE Starting turn for player ".concat(currentPlayer));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        if (!(currentPlayer === 1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.animationManager.showTurnMessage('Your turn!')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.drawCards()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.handleAITurn()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_7 = _a.sent();
                        console.error('❌ Error starting player turn:', error_7);
                        throw error_7;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current game state summary
     */
    CardBattleCardOperationsManager.prototype.getGameStateSummary = function () {
        return this.playerStateManager.getGameStateSummary();
    };
    return CardBattleCardOperationsManager;
}());
exports.CardBattleCardOperationsManager = CardBattleCardOperationsManager;
