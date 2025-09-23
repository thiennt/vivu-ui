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
exports.CardBattleAnimationManager = void 0;
var pixi_js_1 = require("pixi.js");
var gsap_1 = require("gsap");
var colors_1 = require("@/utils/colors");
/**
 * Manages all battle animations for the CardBattleScene
 */
var CardBattleAnimationManager = /** @class */ (function () {
    function CardBattleAnimationManager(effectsContainer, gameWidth, gameHeight) {
        this.effectsContainer = effectsContainer;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
    }
    CardBattleAnimationManager.prototype.animateActionResult = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🎨 Animating action result:', result);
                        if (!(result.damage_dealt && result.damage_dealt > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.animateDamage(result.damage_dealt)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(result.healing_done && result.healing_done > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.animateHealing(result.healing_done)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(result.status_effects_applied && result.status_effects_applied.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.animateStatusEffects(result.status_effects_applied)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        // Log the actions performed (fallback for compatibility)
                        result.actions_performed.forEach(function (action) {
                            console.log("\uD83D\uDCDD Action: ".concat(action.description));
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Animate a single CardBattleLog entry
     */
    CardBattleAnimationManager.prototype.animateCardBattleLogEntry = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("\uD83C\uDFAD Animating CardBattle log entry: ".concat(logEntry.action_type, " - ").concat(logEntry.animation_hint));
                        _a = logEntry.action_type;
                        switch (_a) {
                            case 'start_turn': return [3 /*break*/, 1];
                            case 'draw_card': return [3 /*break*/, 3];
                            case 'draw_phase': return [3 /*break*/, 3];
                            case 'play_card': return [3 /*break*/, 5];
                            case 'discard_card': return [3 /*break*/, 7];
                            case 'damage': return [3 /*break*/, 9];
                            case 'heal': return [3 /*break*/, 11];
                            case 'effect_trigger': return [3 /*break*/, 13];
                            case 'status_effect': return [3 /*break*/, 13];
                            case 'energy': return [3 /*break*/, 15];
                            case 'energy_update': return [3 /*break*/, 15];
                            case 'end_turn': return [3 /*break*/, 17];
                        }
                        return [3 /*break*/, 19];
                    case 1: return [4 /*yield*/, this.animateStartTurn(logEntry)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 3: return [4 /*yield*/, this.animateDrawPhase(logEntry)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 5: return [4 /*yield*/, this.animatePlayCard(logEntry)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 7: return [4 /*yield*/, this.animateDiscardCard(logEntry)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 9: return [4 /*yield*/, this.animateDamageAction(logEntry)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 11: return [4 /*yield*/, this.animateHealAction(logEntry)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 13: return [4 /*yield*/, this.animateStatusEffect(logEntry)];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 15: return [4 /*yield*/, this.animateEnergyUpdate(logEntry)];
                    case 16:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 17: return [4 /*yield*/, this.animateEndTurn(logEntry)];
                    case 18:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 19:
                        console.log("\u26A0\uFE0F Unknown CardBattle log entry type: ".concat(logEntry.action_type));
                        // Show generic message for unknown types
                        return [4 /*yield*/, this.showTurnMessage(logEntry.animation_hint || 'Unknown action')];
                    case 20:
                        // Show generic message for unknown types
                        _b.sent();
                        _b.label = 21;
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateDrawPhase = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var drawnCards, _i, drawnCards_1, drawnCard, cardInDeck;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        drawnCards = logEntry.drawn_cards || [];
                        _i = 0, drawnCards_1 = drawnCards;
                        _a.label = 1;
                    case 1:
                        if (!(_i < drawnCards_1.length)) return [3 /*break*/, 4];
                        drawnCard = drawnCards_1[_i];
                        cardInDeck = {
                            card_id: drawnCard.id,
                            card: {
                                id: drawnCard.id,
                                name: drawnCard.name,
                                description: drawnCard.description,
                                icon_url: drawnCard.icon_url,
                                card_type: drawnCard.card_type,
                                energy_cost: drawnCard.energy_cost,
                                rarity: drawnCard.rarity,
                                group: drawnCard.group,
                                actions: drawnCard.actions || []
                            }
                        };
                        return [4 /*yield*/, this.animateDrawCard(cardInDeck, logEntry.actor.team)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animatePlayCard = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var playerText, cardName;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        playerText = logEntry.actor.team === 1 ? 'Player' : 'AI';
                        cardName = ((_a = logEntry.card) === null || _a === void 0 ? void 0 : _a.name) || 'a card';
                        // Show card play message
                        return [4 /*yield*/, this.showTurnMessage("".concat(playerText, ": Played ").concat(cardName))];
                    case 1:
                        // Show card play message
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateCharacterCardPlay = function (characterCard, cardType) {
        return __awaiter(this, void 0, void 0, function () {
            var originalX, originalY, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        originalX = characterCard.x;
                        originalY = characterCard.y;
                        _a = cardType.toLowerCase();
                        switch (_a) {
                            case 'attack': return [3 /*break*/, 1];
                            case 'offensive': return [3 /*break*/, 1];
                            case 'magic': return [3 /*break*/, 4];
                            case 'spell': return [3 /*break*/, 4];
                            case 'support': return [3 /*break*/, 8];
                            case 'heal': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 1: 
                    // Quick forward dash animation
                    return [4 /*yield*/, gsap_1.gsap.to(characterCard, {
                            x: originalX + 20,
                            duration: 0.1,
                            ease: 'power2.out'
                        })];
                    case 2:
                        // Quick forward dash animation
                        _b.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(characterCard, {
                                x: originalX,
                                duration: 0.2,
                                ease: 'power2.inOut'
                            })];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 4: 
                    // Glow and scale effect
                    return [4 /*yield*/, gsap_1.gsap.to(characterCard.scale, {
                            x: 1.1,
                            y: 1.1,
                            duration: 0.15,
                            ease: 'power2.inOut'
                        })];
                    case 5:
                        // Glow and scale effect
                        _b.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(characterCard, {
                                rotation: 0.1,
                                duration: 0.15,
                                yoyo: true,
                                repeat: 1,
                                ease: 'power2.inOut'
                            })];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(characterCard.scale, {
                                x: 1,
                                y: 1,
                                duration: 0.15,
                                ease: 'power2.inOut'
                            })];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 8: 
                    // Vertical bob effect
                    return [4 /*yield*/, gsap_1.gsap.to(characterCard, {
                            y: originalY - 10,
                            duration: 0.2,
                            yoyo: true,
                            repeat: 1,
                            ease: 'power2.inOut'
                        })];
                    case 9:
                        // Vertical bob effect
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 10: 
                    // Default card play animation
                    return [4 /*yield*/, gsap_1.gsap.to(characterCard.scale, {
                            x: 1.05,
                            y: 1.05,
                            duration: 0.075,
                            yoyo: true,
                            repeat: 1,
                            ease: 'power2.inOut'
                        })];
                    case 11:
                        // Default card play animation
                        _b.sent();
                        _b.label = 12;
                    case 12:
                        // Reset position in case of any drift
                        characterCard.x = originalX;
                        characterCard.y = originalY;
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateDiscardCard = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var playerText, cardName;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        playerText = logEntry.actor.team === 1 ? 'Player' : 'AI';
                        cardName = ((_a = logEntry.card) === null || _a === void 0 ? void 0 : _a.name) || 'a card';
                        if (!logEntry.card) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.animateCardToDiscardPile(logEntry.card, logEntry.actor.team)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.showTurnMessage("".concat(playerText, ": Discarded ").concat(cardName))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateCardToDiscardPile = function (card, team) {
        return __awaiter(this, void 0, void 0, function () {
            var tempCard, discardX, discardY;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tempCard = new pixi_js_1.Graphics();
                        tempCard.roundRect(0, 0, 50, 70, 5)
                            .fill({ color: colors_1.Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
                            .stroke({ width: 2, color: colors_1.Colors.CARD_BORDER });
                        // Start from hand area
                        tempCard.x = this.gameWidth / 2;
                        tempCard.y = team === 1 ? this.gameHeight - 150 : 50;
                        tempCard.alpha = 0.8;
                        this.effectsContainer.addChild(tempCard);
                        discardX = 10 + 80;
                        discardY = team === 1 ? this.gameHeight - 250 : 150;
                        // Animate card flying to discard pile
                        return [4 /*yield*/, gsap_1.gsap.to(tempCard, {
                                x: discardX,
                                y: discardY,
                                alpha: 0.5,
                                scale: 0.8,
                                duration: 0.5,
                                ease: 'power2.out'
                            })];
                    case 1:
                        // Animate card flying to discard pile
                        _a.sent();
                        this.effectsContainer.removeChild(tempCard);
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateDamageAction = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var damage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        damage = logEntry.animation_hint || 'Damage dealt';
                        return [4 /*yield*/, this.showTurnMessage(damage)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateHealAction = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var healing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        healing = logEntry.animation_hint || 'Healing applied';
                        return [4 /*yield*/, this.showTurnMessage(healing)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateTargetHit = function (targetCard, damage) {
        return __awaiter(this, void 0, void 0, function () {
            var originalX, tint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        originalX = targetCard.x;
                        // Shake effect
                        return [4 /*yield*/, gsap_1.gsap.to(targetCard, {
                                x: originalX + 5,
                                duration: 0.05,
                                ease: 'power2.inOut',
                                yoyo: true,
                                repeat: 3
                            })];
                    case 1:
                        // Shake effect
                        _a.sent();
                        tint = new pixi_js_1.Graphics();
                        tint.rect(0, 0, targetCard.width, targetCard.height)
                            .fill({ color: 0xFF0000, alpha: 0.3 });
                        targetCard.addChild(tint);
                        return [4 /*yield*/, gsap_1.gsap.to(tint, {
                                alpha: 0,
                                duration: 0.3,
                                ease: 'power2.out'
                            })];
                    case 2:
                        _a.sent();
                        targetCard.removeChild(tint);
                        // Show damage number
                        return [4 /*yield*/, this.showDamageNumber(targetCard, damage)];
                    case 3:
                        // Show damage number
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateTargetHeal = function (targetCard, healing) {
        return __awaiter(this, void 0, void 0, function () {
            var tint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Scale up slightly
                    return [4 /*yield*/, gsap_1.gsap.to(targetCard.scale, {
                            x: 1.1,
                            y: 1.1,
                            duration: 0.15,
                            ease: 'power2.inOut'
                        })];
                    case 1:
                        // Scale up slightly
                        _a.sent();
                        tint = new pixi_js_1.Graphics();
                        tint.rect(0, 0, targetCard.width, targetCard.height)
                            .fill({ color: 0x00FF00, alpha: 0.3 });
                        targetCard.addChild(tint);
                        return [4 /*yield*/, gsap_1.gsap.to(tint, {
                                alpha: 0,
                                duration: 0.3,
                                ease: 'power2.out'
                            })];
                    case 2:
                        _a.sent();
                        targetCard.removeChild(tint);
                        // Scale back
                        return [4 /*yield*/, gsap_1.gsap.to(targetCard.scale, {
                                x: 1,
                                y: 1,
                                duration: 0.15,
                                ease: 'power2.inOut'
                            })];
                    case 3:
                        // Scale back
                        _a.sent();
                        // Show healing number
                        return [4 /*yield*/, this.showHealingNumber(targetCard, healing)];
                    case 4:
                        // Show healing number
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.showDamageNumber = function (targetCard, damage) {
        return __awaiter(this, void 0, void 0, function () {
            var damageText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        damageText = new pixi_js_1.Text({
                            text: "-".concat(damage),
                            style: {
                                fontFamily: 'Kalam',
                                fontSize: 24,
                                fill: 0xFF0000,
                                fontWeight: 'bold',
                                stroke: { color: 0xFFFFFF, width: 2 }
                            }
                        });
                        damageText.anchor.set(0.5);
                        damageText.x = targetCard.x + targetCard.width / 2;
                        damageText.y = targetCard.y + targetCard.height / 2;
                        damageText.alpha = 0;
                        this.effectsContainer.addChild(damageText);
                        // Animate damage number
                        return [4 /*yield*/, gsap_1.gsap.to(damageText, {
                                alpha: 1,
                                y: damageText.y - 30,
                                scale: 1.2,
                                duration: 0.5,
                                ease: 'power2.out'
                            })];
                    case 1:
                        // Animate damage number
                        _a.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(damageText, {
                                alpha: 0,
                                duration: 0.3,
                                ease: 'power2.in'
                            })];
                    case 2:
                        _a.sent();
                        this.effectsContainer.removeChild(damageText);
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.showHealingNumber = function (targetCard, healing) {
        return __awaiter(this, void 0, void 0, function () {
            var healText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        healText = new pixi_js_1.Text({
                            text: "+".concat(healing),
                            style: {
                                fontFamily: 'Kalam',
                                fontSize: 24,
                                fill: 0x00FF00,
                                fontWeight: 'bold',
                                stroke: { color: 0xFFFFFF, width: 2 }
                            }
                        });
                        healText.anchor.set(0.5);
                        healText.x = targetCard.x + targetCard.width / 2;
                        healText.y = targetCard.y + targetCard.height / 2;
                        healText.alpha = 0;
                        this.effectsContainer.addChild(healText);
                        // Animate healing number
                        return [4 /*yield*/, gsap_1.gsap.to(healText, {
                                alpha: 1,
                                y: healText.y - 30,
                                scale: 1.2,
                                duration: 0.5,
                                ease: 'power2.out'
                            })];
                    case 1:
                        // Animate healing number
                        _a.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(healText, {
                                alpha: 0,
                                duration: 0.3,
                                ease: 'power2.in'
                            })];
                    case 2:
                        _a.sent();
                        this.effectsContainer.removeChild(healText);
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateStatusEffect = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var effect;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        effect = logEntry.animation_hint || 'Status effect applied';
                        return [4 /*yield*/, this.showTurnMessage(effect)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateEndTurn = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.showTurnMessage('Turn ended')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateStartTurn = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var playerText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerText = logEntry.actor.team === 1 ? 'Player' : 'AI';
                        return [4 /*yield*/, this.showTurnMessage("".concat(playerText, " turn started"))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateEnergyUpdate = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var energy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        energy = logEntry.animation_hint || 'Energy updated';
                        return [4 /*yield*/, this.showTurnMessage(energy)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateDrawCard = function (cardInDeck, playerNo) {
        return __awaiter(this, void 0, void 0, function () {
            var tempCard, deckX, deckY, handX, handY;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tempCard = new pixi_js_1.Graphics();
                        tempCard.roundRect(0, 0, 60, 84, 5)
                            .fill(colors_1.Colors.CARD_BACKGROUND)
                            .stroke({ width: 2, color: colors_1.Colors.CARD_BORDER });
                        deckX = 10;
                        deckY = playerNo === 1 ? this.gameHeight - 250 : 150;
                        tempCard.x = deckX;
                        tempCard.y = deckY;
                        tempCard.alpha = 0.8;
                        this.effectsContainer.addChild(tempCard);
                        handX = this.gameWidth / 2;
                        handY = playerNo === 1 ? this.gameHeight - 120 : 50;
                        return [4 /*yield*/, gsap_1.gsap.to(tempCard, {
                                x: handX,
                                y: handY,
                                scale: 1.2,
                                duration: 0.5,
                                ease: 'power2.out'
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(tempCard, {
                                alpha: 0,
                                scale: 1,
                                duration: 0.2,
                                ease: 'power2.in'
                            })];
                    case 2:
                        _a.sent();
                        this.effectsContainer.removeChild(tempCard);
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.showTurnMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var messageText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messageText = new pixi_js_1.Text({
                            text: message,
                            style: {
                                fontFamily: 'Kalam',
                                fontSize: 20,
                                fill: colors_1.Colors.TEXT_PRIMARY,
                                fontWeight: 'bold',
                                stroke: { color: colors_1.Colors.BACKGROUND_PRIMARY, width: 3 },
                                align: 'center'
                            }
                        });
                        messageText.anchor.set(0.5);
                        messageText.x = this.gameWidth / 2;
                        messageText.y = this.gameHeight / 2;
                        messageText.alpha = 0;
                        messageText.scale.set(0.5);
                        this.effectsContainer.addChild(messageText);
                        // Animate message appearance
                        return [4 /*yield*/, gsap_1.gsap.to(messageText, {
                                alpha: 1,
                                scale: 1,
                                duration: 0.3,
                                ease: 'back.out(1.7)'
                            })];
                    case 1:
                        // Animate message appearance
                        _a.sent();
                        // Hold for a moment
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1200); })];
                    case 2:
                        // Hold for a moment
                        _a.sent();
                        // Animate message disappearance
                        return [4 /*yield*/, gsap_1.gsap.to(messageText, {
                                alpha: 0,
                                scale: 0.8,
                                duration: 0.3,
                                ease: 'power2.in'
                            })];
                    case 3:
                        // Animate message disappearance
                        _a.sent();
                        this.effectsContainer.removeChild(messageText);
                        return [2 /*return*/];
                }
            });
        });
    };
    // Legacy methods for compatibility
    CardBattleAnimationManager.prototype.animateDamage = function (damage) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.showTurnMessage("".concat(damage, " damage dealt!"))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateHealing = function (healing) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.showTurnMessage("".concat(healing, " HP restored!"))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleAnimationManager.prototype.animateStatusEffects = function (effects) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, effects_1, effect;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, effects_1 = effects;
                        _a.label = 1;
                    case 1:
                        if (!(_i < effects_1.length)) return [3 /*break*/, 4];
                        effect = effects_1[_i];
                        return [4 /*yield*/, this.showTurnMessage("".concat(effect.type || 'Effect', " applied!"))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CardBattleAnimationManager;
}());
exports.CardBattleAnimationManager = CardBattleAnimationManager;
