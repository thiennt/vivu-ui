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
exports.CardBattleDragDropManager = void 0;
var CardDetailPopup_1 = require("@/popups/CardDetailPopup");
/**
 * Manages drag and drop interactions for cards in the CardBattleScene
 */
var CardBattleDragDropManager = /** @class */ (function () {
    function CardBattleDragDropManager(scene) {
        this.dragTarget = null;
        this.dragOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.dropZones = [];
        this.scene = scene;
    }
    /**
     * Set drop zones for card interactions
     */
    CardBattleDragDropManager.prototype.setDropZones = function (dropZones) {
        this.dropZones = dropZones;
    };
    /**
     * Make a card container draggable
     */
    CardBattleDragDropManager.prototype.makeCardDraggable = function (cardContainer) {
        var _this = this;
        cardContainer.interactive = true;
        cardContainer.cursor = 'pointer';
        cardContainer.on('pointerdown', function (event) { return _this.onDragStart(event, cardContainer); });
        cardContainer.on('rightclick', function () { return _this.showCardDetails(cardContainer); });
    };
    /**
     * Show card details popup
     */
    CardBattleDragDropManager.prototype.showCardDetails = function (cardContainer) {
        var cardData = cardContainer.cardData;
        if (cardData && cardData.card) {
            // Convert CardInDeck to the format expected by CardDetailPopup
            var battleCard = {
                card: {
                    id: cardData.card.id,
                    name: cardData.card.name,
                    description: cardData.card.description,
                    energyCost: cardData.card.energy_cost,
                    group: cardData.card.group,
                    rarity: cardData.card.rarity,
                    effects: [] // CardDetailPopup expects effects array
                }
            };
            var popup = new CardDetailPopup_1.CardDetailPopup(battleCard);
            // Assume popup has an open method or similar
            console.log('Card details:', cardData.card.name);
        }
    };
    /**
     * Handle drag start
     */
    CardBattleDragDropManager.prototype.onDragStart = function (event, cardContainer) {
        var cardData = cardContainer.cardData;
        if (!cardData)
            return;
        this.isDragging = true;
        this.dragTarget = cardContainer;
        // Calculate offset
        var globalPos = event.global;
        var localPos = cardContainer.toLocal(globalPos);
        this.dragOffset.x = localPos.x;
        this.dragOffset.y = localPos.y;
        // Visual feedback
        cardContainer.alpha = 0.7;
        cardContainer.scale.set(1.1);
        // Add global pointer events
        this.scene.container.on('pointermove', this.onDragMove, this);
        this.scene.container.on('pointerup', this.onDragEnd, this);
        this.scene.container.on('pointerupoutside', this.onDragEnd, this);
        console.log('🎯 Started dragging card:', cardData.card.name);
    };
    /**
     * Handle drag movement
     */
    CardBattleDragDropManager.prototype.onDragMove = function (event) {
        var _a;
        if (!this.isDragging || !this.dragTarget)
            return;
        var globalPos = event.global;
        var parentPos = (_a = this.dragTarget.parent) === null || _a === void 0 ? void 0 : _a.toLocal(globalPos);
        if (!parentPos)
            return;
        this.dragTarget.x = parentPos.x - this.dragOffset.x;
        this.dragTarget.y = parentPos.y - this.dragOffset.y;
    };
    /**
     * Handle drag end
     */
    CardBattleDragDropManager.prototype.onDragEnd = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var globalPos, dropTarget, cardData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isDragging || !this.dragTarget)
                            return [2 /*return*/];
                        globalPos = event.global;
                        dropTarget = this.getDropTarget(globalPos);
                        cardData = this.dragTarget.cardData;
                        if (!(dropTarget && cardData)) return [3 /*break*/, 5];
                        if (!(dropTarget.type === 'character')) return [3 /*break*/, 2];
                        console.log("\uD83C\uDFAF Playing card on character ".concat(dropTarget.characterIndex, " of player ").concat(dropTarget.playerId));
                        return [4 /*yield*/, this.scene.playCardOnCharacter(cardData, dropTarget.playerId, dropTarget.characterIndex || 0)];
                    case 1:
                        _a.sent();
                        this.cleanupDrag(true); // Remove card from hand
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(dropTarget.type === 'discard')) return [3 /*break*/, 4];
                        console.log('🗑️ Discarding card');
                        return [4 /*yield*/, this.scene.discardCard(cardData)];
                    case 3:
                        _a.sent();
                        this.cleanupDrag(true); // Remove card from hand
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        console.log('🚫 Invalid drop target, returning card to hand');
                        this.cleanupDrag(false); // Return card to original position
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the drop target at the given global position
     */
    CardBattleDragDropManager.prototype.getDropTarget = function (globalPos) {
        for (var _i = 0, _a = this.dropZones; _i < _a.length; _i++) {
            var zone = _a[_i];
            var bounds = zone.area.getBounds();
            if (globalPos.x >= bounds.x && globalPos.x <= bounds.x + bounds.width &&
                globalPos.y >= bounds.y && globalPos.y <= bounds.y + bounds.height) {
                return {
                    type: zone.type,
                    playerId: zone.playerId,
                    characterIndex: zone.characterIndex
                };
            }
        }
        return null;
    };
    /**
     * Clean up drag state
     */
    CardBattleDragDropManager.prototype.cleanupDrag = function (removeCard) {
        if (removeCard === void 0) { removeCard = false; }
        if (this.dragTarget) {
            // Reset visual state
            this.dragTarget.alpha = 1;
            this.dragTarget.scale.set(1);
            if (!removeCard) {
                // Return to original position if not removing
                // In a real implementation, you'd store the original position
                // For now, we'll let the UI refresh handle repositioning
            }
        }
        // Remove global event listeners
        this.scene.container.off('pointermove', this.onDragMove, this);
        this.scene.container.off('pointerup', this.onDragEnd, this);
        this.scene.container.off('pointerupoutside', this.onDragEnd, this);
        // Reset state
        this.isDragging = false;
        this.dragTarget = null;
        this.dragOffset.x = 0;
        this.dragOffset.y = 0;
    };
    /**
     * Check if currently dragging
     */
    CardBattleDragDropManager.prototype.isDraggingCard = function () {
        return this.isDragging;
    };
    /**
     * Get the currently dragged card data
     */
    CardBattleDragDropManager.prototype.getDraggedCard = function () {
        if (this.dragTarget) {
            return this.dragTarget.cardData || null;
        }
        return null;
    };
    /**
     * Cancel current drag operation
     */
    CardBattleDragDropManager.prototype.cancelDrag = function () {
        if (this.isDragging) {
            this.cleanupDrag(false);
        }
    };
    /**
     * Enable/disable drag and drop
     */
    CardBattleDragDropManager.prototype.setEnabled = function (enabled) {
        // This could be used to disable drag during AI turns or animations
        if (!enabled && this.isDragging) {
            this.cancelDrag();
        }
    };
    return CardBattleDragDropManager;
}());
exports.CardBattleDragDropManager = CardBattleDragDropManager;
