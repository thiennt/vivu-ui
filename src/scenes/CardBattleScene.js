"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.CardBattleScene = void 0;
var pixi_js_1 = require("pixi.js");
var navigation_1 = require("@/utils/navigation");
var BaseScene_1 = require("@/utils/BaseScene");
var HomeScene_1 = require("./HomeScene");
var api_1 = require("@/services/api");
var loadingStateManager_1 = require("@/utils/loadingStateManager");
// Import the new managers
var UIManager_1 = require("./cardBattle/UIManager");
var AnimationManager_1 = require("./cardBattle/AnimationManager");
var PlayerStateManager_1 = require("./cardBattle/PlayerStateManager");
var DragDropManager_1 = require("./cardBattle/DragDropManager");
var CardOperationsManager_1 = require("./cardBattle/CardOperationsManager");
var CardBattleScene = /** @class */ (function (_super) {
    __extends(CardBattleScene, _super);
    function CardBattleScene(params) {
        var _this = _super.call(this) || this;
        _this.container = new pixi_js_1.Container();
        _this.addChild(_this.container);
        _this.battleId = (params === null || params === void 0 ? void 0 : params.battle_id) || '';
        _this.loadingManager = new loadingStateManager_1.LoadingStateManager(_this.container, _this.gameWidth, _this.gameHeight);
        // Initialize managers
        _this.initializeManagers();
        return _this;
    }
    CardBattleScene.prototype.initializeManagers = function () {
        // Create containers first
        this.gameContainer = new pixi_js_1.Container();
        this.player1Container = new pixi_js_1.Container();
        this.player2Container = new pixi_js_1.Container();
        this.player1HandContainer = new pixi_js_1.Container();
        this.player2HandContainer = new pixi_js_1.Container();
        this.player1EnergyContainer = new pixi_js_1.Container();
        this.player2EnergyContainer = new pixi_js_1.Container();
        this.battleLogContainer = new pixi_js_1.Container();
        this.effectsContainer = new pixi_js_1.Container();
        // Initialize managers
        this.uiManager = new UIManager_1.CardBattleUIManager(this);
        this.animationManager = new AnimationManager_1.CardBattleAnimationManager(this.effectsContainer, this.gameWidth, this.gameHeight);
        this.playerStateManager = new PlayerStateManager_1.CardBattlePlayerStateManager();
        this.dragDropManager = new DragDropManager_1.CardBattleDragDropManager({
            container: this.container,
            playCardOnCharacter: this.playCardOnCharacter.bind(this),
            discardCard: this.discardCard.bind(this)
        });
        this.cardOperationsManager = new CardOperationsManager_1.CardBattleCardOperationsManager(this.playerStateManager, this.animationManager, this.battleId);
    };
    CardBattleScene.prototype.prepare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.loadingManager.showLoading();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        console.log('🔄 Preparing CardBattleScene...');
                        // Load battle state from API (will use mock data if configured)
                        console.log('🔄 Loading battle state...');
                        return [4 /*yield*/, api_1.battleApi.getBattleState(this.battleId)];
                    case 2:
                        response = _a.sent();
                        if (response.success && response.data) {
                            this.playerStateManager.setBattleState(response.data);
                            console.log("\u2705 Battle state loaded: ".concat(response.message));
                        }
                        else {
                            console.error("\u274C Failed to load battle state: ".concat(response.message));
                            if (response.errors) {
                                response.errors.forEach(function (error) { return console.error("   Error: ".concat(error)); });
                            }
                            throw new Error('Failed to load battle state');
                        }
                        this.loadingManager.hideLoading();
                        this.initializeUI();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ Error preparing battle scene:', error_1);
                        this.loadingManager.hideLoading();
                        alert('Failed to prepare battle. Please try again.');
                        navigation_1.navigation.showScreen(HomeScene_1.HomeScene);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CardBattleScene.prototype.initializeUI = function () {
        this.uiManager.createBackground(this.container, this.gameWidth, this.getContentHeight());
        this.createGameLayout();
        this.createActionButtons();
        this.updateBottomNavigation();
    };
    CardBattleScene.prototype.createGameLayout = function () {
        this.uiManager.createGameLayout(this.gameContainer, this.player1Container, this.player2Container, this.player1HandContainer, this.player2HandContainer, this.player1EnergyContainer, this.player2EnergyContainer, this.battleLogContainer, this.effectsContainer, this.gameWidth, this.getContentHeight());
        this.container.addChild(this.gameContainer);
        this.refreshUI();
    };
    CardBattleScene.prototype.resize = function (width, height) {
        this.gameWidth = width;
        this.gameHeight = height;
    };
    /** Show the screen with animation */
    CardBattleScene.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.cardOperationsManager.startBattleSequence();
                return [2 /*return*/];
            });
        });
    };
    // Delegated methods for card operations
    CardBattleScene.prototype.playCardOnCharacter = function (card, targetPlayerId, characterIndex) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cardOperationsManager.playCardOnCharacter(card, targetPlayerId, characterIndex)];
                    case 1:
                        _a.sent();
                        this.refreshUI();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleScene.prototype.discardCard = function (card) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cardOperationsManager.discardCard(card)];
                    case 1:
                        _a.sent();
                        this.refreshUI();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleScene.prototype.endTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cardOperationsManager.endTurn()];
                    case 1:
                        _a.sent();
                        this.refreshUI();
                        return [2 /*return*/];
                }
            });
        });
    };
    CardBattleScene.prototype.createActionButtons = function () {
        var _this = this;
        var buttonContainer = new pixi_js_1.Container();
        var buttonWidth = 120;
        var buttonHeight = 44;
        // End Turn button
        var endTurnButton = this.createButton('End Turn', this.gameWidth - buttonWidth - this.STANDARD_PADDING, this.getContentHeight() - buttonHeight - 10, buttonWidth, buttonHeight, function () { return _this.endTurn(); }, 12);
        // Back button
        var backButton = this.createButton('← Back', this.STANDARD_PADDING, this.getContentHeight() - buttonHeight - 10, buttonWidth, buttonHeight, function () { return navigation_1.navigation.showScreen(HomeScene_1.HomeScene); }, 12);
        buttonContainer.addChild(endTurnButton, backButton);
        this.container.addChild(buttonContainer);
    };
    CardBattleScene.prototype.refreshUI = function () {
        // Clear containers before re-adding content
        this.player1HandContainer.removeChildren();
        this.player2HandContainer.removeChildren();
        this.player1EnergyContainer.removeChildren();
        this.player2EnergyContainer.removeChildren();
        this.battleLogContainer.removeChildren();
        this.player1Container.removeChildren();
        this.player2Container.removeChildren();
        // Recreate all areas with current data
        this.uiManager.createPlayerArea(this.player1Container, 1, this.playerStateManager.getPlayerCharacters(1), this.gameWidth);
        this.uiManager.createPlayerArea(this.player2Container, 2, this.playerStateManager.getPlayerCharacters(2), this.gameWidth);
        this.uiManager.createEnergyArea(this.player1EnergyContainer, 1, this.gameWidth);
        this.uiManager.createEnergyArea(this.player2EnergyContainer, 2, this.gameWidth);
        // Create hand areas with proper data
        this.uiManager.createHandArea(this.player1HandContainer, 1, true, this.playerStateManager.getPlayerHandCards(1), this.gameWidth);
        this.uiManager.createHandArea(this.player2HandContainer, 2, false, this.playerStateManager.getPlayerHandCards(2), this.gameWidth);
        // Make player 1 cards draggable
        this.setupDragAndDrop();
        this.uiManager.createBattleLog(this.battleLogContainer, this.gameWidth);
    };
    CardBattleScene.prototype.setupDragAndDrop = function () {
        // Make player 1 hand cards draggable
        for (var _i = 0, _a = this.player1HandContainer.children; _i < _a.length; _i++) {
            var child = _a[_i];
            this.dragDropManager.makeCardDraggable(child);
        }
        // Set up drop zones
        var dropZones = [];
        // Add character drop zones
        this.player1Container.children.forEach(function (child, index) {
            dropZones.push({
                area: child,
                type: 'character',
                playerId: 1,
                characterIndex: index
            });
        });
        this.player2Container.children.forEach(function (child, index) {
            dropZones.push({
                area: child,
                type: 'character',
                playerId: 2,
                characterIndex: index
            });
        });
        this.dragDropManager.setDropZones(dropZones);
    };
    /** Assets bundles required by this screen */
    CardBattleScene.assetBundles = [];
    return CardBattleScene;
}(BaseScene_1.BaseScene));
exports.CardBattleScene = CardBattleScene;
