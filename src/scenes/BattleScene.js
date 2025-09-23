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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.BattleScene = void 0;
var pixi_js_1 = require("pixi.js");
var navigation_1 = require("@/utils/navigation");
var mockData_1 = require("@/utils/mockData");
var BaseScene_1 = require("@/utils/BaseScene");
var HomeScene_1 = require("./HomeScene");
var colors_1 = require("@/utils/colors");
var gsap_1 = require("gsap");
var BattleScene = /** @class */ (function (_super) {
    __extends(BattleScene, _super);
    function BattleScene() {
        var _this = _super.call(this) || this;
        _this.team1 = [];
        _this.team2 = [];
        _this.battleLog = [];
        _this.currentTurn = 0;
        _this.isAnimating = false;
        _this.container = new pixi_js_1.Container();
        _this.addChild(_this.container);
        // Initialize battle teams (4v4)
        _this.initializeTeams();
        return _this;
    }
    BattleScene.prototype.initializeTeams = function () {
        // Select first 4 characters for team 1
        this.team1 = mockData_1.mockCharacters.slice(0, 4).map(function (char) { return (__assign(__assign({}, char), { current_hp: char.hp, current_energy: 50, team: 1 })); });
        // Select next 4 characters for team 2 (or duplicate if not enough)
        this.team2 = mockData_1.mockCharacters.slice(4, 8).map(function (char) { return (__assign(__assign({}, char), { current_hp: char.hp, current_energy: 50, team: 2 })); });
        // If we don't have 8 characters, duplicate some
        while (this.team2.length < 4) {
            var char = mockData_1.mockCharacters[this.team2.length % mockData_1.mockCharacters.length];
            this.team2.push(__assign(__assign({}, char), { id: "".concat(char.id, "_copy"), current_hp: char.hp, current_energy: 50, team: 2 }));
        }
    };
    BattleScene.prototype.resize = function (width, height) {
        this.gameWidth = width;
        this.gameHeight = height;
        // Create/update bottom navigation first
        this.updateBottomNavigation();
        // Clear and recreate layout
        this.container.removeChildren();
        this.createBackground();
        this.createBattleLayout();
        this.createEffectsContainer();
        this.createBattleLog();
        this.createActionButtons();
    };
    /** Show the screen with animation */
    BattleScene.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.container.alpha = 1;
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    /** Hide the screen with animation */
    BattleScene.prototype.hide = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.container.alpha = 0;
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    /** Reset screen after hidden */
    BattleScene.prototype.reset = function () {
        this.container.removeChildren();
        this.battleLog = [];
        this.currentTurn = 0;
        this.isAnimating = false;
    };
    BattleScene.prototype.createBackground = function () {
        var bg = new pixi_js_1.Graphics();
        // Use content height to avoid covering bottom navigation
        var availableHeight = this.getContentHeight();
        var backgroundGradient = colors_1.Gradients.createBackgroundGradient(this.gameWidth, availableHeight);
        bg.rect(0, 0, this.gameWidth, availableHeight).fill(backgroundGradient);
        this.container.addChild(bg);
    };
    BattleScene.prototype.createEffectsContainer = function () {
        // Container for visual effects and animations
        this.effectsContainer = new pixi_js_1.Container();
        this.container.addChild(this.effectsContainer);
    };
    BattleScene.prototype.createBattleLayout = function () {
        var _this = this;
        // Create containers for each team
        this.team1Container = new pixi_js_1.Container();
        this.team2Container = new pixi_js_1.Container();
        // Calculate layout for 3 cards per row
        var availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
        var layout = this.calculateThreeCardsLayout(availableWidth, this.STANDARD_SPACING);
        var cardWidth = layout.itemWidth;
        var teamWidth = layout.totalWidth;
        var cardHeight = 120;
        var teamBlockHeight = cardHeight; // Single row now
        // Battle log height (should match createBattleLog)
        var logHeight = 80;
        var logMargin = 30;
        // Calculate vertical positions
        var totalUsedHeight = teamBlockHeight * 2 + logHeight + logMargin * 2 + 5;
        var verticalPadding = Math.max(0, (this.gameHeight - totalUsedHeight) / 2);
        // Team 1 (enemies) at the top
        var team1X = this.gameWidth / 2 - teamWidth / 2;
        var team1Y = verticalPadding;
        // Battle log in the center
        var logY = team1Y + teamBlockHeight + logMargin;
        // Team 2 (allies) at the bottom
        var team2X = this.gameWidth / 2 - teamWidth / 2;
        var team2Y = logY + logHeight + logMargin;
        // Single row of 4 cards for each team
        this.team1.forEach(function (character, index) {
            var x = index * (cardWidth + _this.STANDARD_SPACING);
            var y = 0;
            var card = _this.createBattleCard(character, x, y, cardWidth);
            _this.team1Container.addChild(card);
        });
        this.team2.forEach(function (character, index) {
            var x = index * (cardWidth + _this.STANDARD_SPACING);
            var y = 0;
            var card = _this.createBattleCard(character, x, y, cardWidth);
            _this.team2Container.addChild(card);
        });
        this.team1Container.x = team1X;
        this.team1Container.y = team1Y;
        this.team2Container.x = team2X;
        this.team2Container.y = team2Y;
        // Add team labels
        var team1Label = new pixi_js_1.Text({
            text: 'Enemies',
            style: {
                fontFamily: 'Kalam',
                fontSize: 18,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY
            }
        });
        team1Label.anchor.set(0.5);
        team1Label.x = this.gameWidth / 2;
        team1Label.y = team1Y - 30;
        var team2Label = new pixi_js_1.Text({
            text: 'Allies',
            style: {
                fontFamily: 'Kalam',
                fontSize: 18,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY
            }
        });
        team2Label.anchor.set(0.5);
        team2Label.x = this.gameWidth / 2;
        team2Label.y = team2Y - 30;
        this.container.addChild(this.team1Container, this.team2Container, team1Label, team2Label);
        // Store for use in createBattleLog
        this._battleLogY = logY;
    };
    BattleScene.prototype.createBattleCard = function (character, x, y, cardWidth) {
        if (cardWidth === void 0) { cardWidth = 100; }
        var cardHeight = 120;
        var card = new pixi_js_1.Container();
        // Rarity colors
        var rarityColors = {
            common: colors_1.Colors.RARITY_COMMON,
            uncommon: colors_1.Colors.RARITY_UNCOMMON,
            rare: colors_1.Colors.RARITY_RARE,
            epic: colors_1.Colors.RARITY_EPIC,
            legendary: colors_1.Colors.RARITY_LEGENDARY
        };
        // Card background
        var bg = new pixi_js_1.Graphics();
        bg.roundRect(0, 0, cardWidth, cardHeight, 8)
            .fill(rarityColors[character.rarity] || rarityColors.common)
            .stroke({ width: 2, color: colors_1.Colors.CARD_BORDER });
        // Character ticker/symbol
        var symbolText = new pixi_js_1.Text({
            text: character.ticker,
            style: {
                fontFamily: 'Kalam',
                fontSize: 14,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_WHITE,
                align: 'center'
            }
        });
        symbolText.anchor.set(0.5);
        symbolText.x = cardWidth / 2;
        symbolText.y = 15;
        // Level
        var levelText = new pixi_js_1.Text({
            text: "Lv.".concat(character.level),
            style: {
                fontFamily: 'Kalam',
                fontSize: 10,
                fill: colors_1.Colors.TEXT_SECONDARY,
                align: 'center'
            }
        });
        levelText.anchor.set(0.5);
        levelText.x = cardWidth / 2;
        levelText.y = 30;
        // HP Bar
        var hpBarBg = new pixi_js_1.Graphics();
        hpBarBg.roundRect(5, 45, cardWidth - 10, 8, 4)
            .fill(colors_1.Colors.BACKGROUND_SECONDARY)
            .stroke({ width: 1, color: colors_1.Colors.CARD_BORDER });
        var hpPercentage = character.current_hp / character.hp;
        var hpBarFill = new pixi_js_1.Graphics();
        hpBarFill.roundRect(6, 46, (cardWidth - 12) * hpPercentage, 6, 3)
            .fill(hpPercentage > 0.5 ? 0x4caf50 : hpPercentage > 0.25 ? 0xff9800 : 0xf44336);
        // HP Text
        var hpText = new pixi_js_1.Text({
            text: "HP: ".concat(character.current_hp, "/").concat(character.hp),
            style: {
                fontFamily: 'Kalam',
                fontSize: 8,
                fill: colors_1.Colors.TEXT_SECONDARY,
                align: 'center'
            }
        });
        hpText.anchor.set(0.5);
        hpText.x = cardWidth / 2;
        hpText.y = 58;
        // Energy Bar
        var energyBarBg = new pixi_js_1.Graphics();
        energyBarBg.roundRect(5, 70, cardWidth - 10, 8, 4)
            .fill(colors_1.Colors.BACKGROUND_SECONDARY)
            .stroke({ width: 1, color: colors_1.Colors.CARD_BORDER });
        var maxEnergy = 100; // Assuming max energy is 100
        var energyPercentage = character.current_energy / maxEnergy;
        var energyBarFill = new pixi_js_1.Graphics();
        energyBarFill.roundRect(6, 71, (cardWidth - 12) * energyPercentage, 6, 3)
            .fill(0x2196f3); // Blue for energy
        // Energy Text
        var energyText = new pixi_js_1.Text({
            text: "EN: ".concat(character.current_energy, "/").concat(maxEnergy),
            style: {
                fontFamily: 'Kalam',
                fontSize: 8,
                fill: colors_1.Colors.TEXT_SECONDARY,
                align: 'center'
            }
        });
        energyText.anchor.set(0.5);
        energyText.x = cardWidth / 2;
        energyText.y = 83;
        // Attack and Defense stats
        var statsText = new pixi_js_1.Text({
            text: "ATK: ".concat(character.atk, " DEF: ").concat(character.def),
            style: {
                fontFamily: 'Kalam',
                fontSize: 7,
                fill: colors_1.Colors.TEXT_TERTIARY,
                align: 'center'
            }
        });
        statsText.anchor.set(0.5);
        statsText.x = cardWidth / 2;
        statsText.y = 95;
        // Add avatar/logo
        this.createAvatar(character, cardWidth, cardHeight).then(function (avatarIcon) {
            card.addChild(avatarIcon);
        });
        card.addChild(bg, symbolText, levelText, hpBarBg, hpBarFill, hpText, energyBarBg, energyBarFill, energyText, statsText);
        card.x = x;
        card.y = y;
        // Store character reference and card dimensions for updates
        card.character = character;
        card.cardWidth = cardWidth;
        card.cardHeight = cardHeight;
        return card;
    };
    BattleScene.prototype.createBattleLog = function () {
        var _a;
        this.logContainer = new pixi_js_1.Container();
        // Log background
        var logBg = new pixi_js_1.Graphics();
        var logWidth = this.gameWidth - 40;
        var logHeight = 80;
        logBg.roundRect(0, 0, logWidth, logHeight, 8)
            .fill({ color: colors_1.Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
            .stroke({ width: 2, color: colors_1.Colors.CARD_BORDER });
        // Log title
        var logTitle = new pixi_js_1.Text({
            text: 'Battle Log',
            style: {
                fontFamily: 'Kalam',
                fontSize: 14,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY
            }
        });
        logTitle.x = 10;
        logTitle.y = 5;
        this.logContainer.addChild(logBg, logTitle);
        this.logContainer.x = 20;
        // Use the calculated Y from createBattleLayout
        this.logContainer.y = (_a = this._battleLogY) !== null && _a !== void 0 ? _a : (this.gameHeight / 2 - logHeight / 2);
        this.container.addChild(this.logContainer);
    };
    BattleScene.prototype.createActionButtons = function () {
        var _this = this;
        var _a, _b, _c;
        var buttonContainer = new pixi_js_1.Container();
        // Responsive button sizing
        var buttonWidth = Math.min(100, (this.gameWidth - 3 * this.STANDARD_PADDING) / 2);
        var buttonHeight = Math.max(44, Math.min(40, this.gameHeight * 0.08));
        // Start Battle button
        var startButton = this.createButton('Start Battle', (this.gameWidth - buttonWidth) / 2, 0, buttonWidth, buttonHeight, function () { return _this.startBattle(); }, 14 // Base font size for responsive scaling
        );
        // Back button
        var backButton = this.createButton('← Back to Home', this.STANDARD_PADDING, 0, buttonWidth, buttonHeight, function () { return navigation_1.navigation.showScreen(HomeScene_1.HomeScene); }, 14 // Base font size for responsive scaling
        );
        buttonContainer.addChild(backButton, startButton);
        // Get bottom navigation height (default to 60 if not available)
        var navHeight = (_c = (_b = (_a = this.bottomNavigation) === null || _a === void 0 ? void 0 : _a.getMenuHeight) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : 60;
        // Position above the bottom navigation
        buttonContainer.y = this.gameHeight - navHeight - buttonHeight - this.STANDARD_PADDING;
        this.container.addChild(buttonContainer);
    };
    BattleScene.prototype.animateAction = function (attacker, target, actionType, damage) {
        return __awaiter(this, void 0, void 0, function () {
            var attackerCard, targetCard;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attackerCard = this.findCharacterCard(attacker);
                        targetCard = this.findCharacterCard(target);
                        if (!attackerCard || !targetCard)
                            return [2 /*return*/];
                        // Attacker animation
                        return [4 /*yield*/, this.animateAttackerCard(attackerCard, actionType)];
                    case 1:
                        // Attacker animation
                        _a.sent();
                        // Action effect animation
                        return [4 /*yield*/, this.animateActionEffect(targetCard, actionType)];
                    case 2:
                        // Action effect animation
                        _a.sent();
                        // Target hit animation
                        return [4 /*yield*/, this.animateTargetHit(targetCard, damage)];
                    case 3:
                        // Target hit animation
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BattleScene.prototype.findCharacterCard = function (character) {
        var isTeam1 = character.team === 1;
        var teamContainer = isTeam1 ? this.team1Container : this.team2Container;
        var team = isTeam1 ? this.team1 : this.team2;
        var index = team.findIndex(function (char) { return char.id === character.id; });
        if (index >= 0 && index < teamContainer.children.length) {
            return teamContainer.children[index];
        }
        return null;
    };
    BattleScene.prototype.animateAttackerCard = function (card, actionType) {
        return __awaiter(this, void 0, void 0, function () {
            var originalX, originalY, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        originalX = card.x;
                        originalY = card.y;
                        _a = actionType;
                        switch (_a) {
                            case 'slash': return [3 /*break*/, 1];
                            case 'fire': return [3 /*break*/, 4];
                            case 'ice': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 1: 
                    // Quick forward dash and back
                    return [4 /*yield*/, gsap_1.gsap.to(card, {
                            x: card.x + 20,
                            duration: 0.1,
                            ease: 'power2.out'
                        })];
                    case 2:
                        // Quick forward dash and back
                        _b.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(card, {
                                x: card.x,
                                duration: 0.2,
                                ease: 'power2.inOut'
                            })];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 4: 
                    // Glow and shake effect
                    return [4 /*yield*/, gsap_1.gsap.to(card.scale, {
                            x: 1.1,
                            y: 1.1,
                            duration: 0.15,
                            ease: 'power2.inOut'
                        })];
                    case 5:
                        // Glow and shake effect
                        _b.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(card, {
                                rotation: 0.1,
                                duration: 0.15,
                                yoyo: true,
                                repeat: 1,
                                ease: 'power2.inOut'
                            })];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(card.scale, {
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
                    return [4 /*yield*/, gsap_1.gsap.to(card, {
                            y: card.y - 10,
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
                    // Default punch animation
                    return [4 /*yield*/, gsap_1.gsap.to(card.scale, {
                            x: 1.05,
                            y: 1.05,
                            duration: 0.075,
                            yoyo: true,
                            repeat: 1,
                            ease: 'power2.inOut'
                        })];
                    case 11:
                        // Default punch animation
                        _b.sent();
                        _b.label = 12;
                    case 12:
                        card.x = originalX;
                        card.y = originalY;
                        return [2 /*return*/];
                }
            });
        });
    };
    BattleScene.prototype.animateActionEffect = function (targetCard, actionType) {
        return __awaiter(this, void 0, void 0, function () {
            var effect, targetX, targetY;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        effect = new pixi_js_1.Graphics();
                        effect.zIndex = 1000; // Ensure effect is on top
                        targetX = targetCard.x + (((_a = targetCard.parent) === null || _a === void 0 ? void 0 : _a.x) || 0) + 50;
                        targetY = targetCard.y + (((_b = targetCard.parent) === null || _b === void 0 ? void 0 : _b.y) || 0) + 60;
                        switch (actionType) {
                            case 'slash': {
                                // Slash effect - diagonal line
                                effect.rect(-2, -20, 4, 40).fill(0xFFFFFF);
                                effect.rect(-1, -20, 2, 40).fill(0xFFAA00);
                                effect.rotation = Math.PI / 4;
                                break;
                            }
                            case 'fire': {
                                // Fire burst effect
                                effect.circle(0, 0, 25).fill(0xFF4444);
                                effect.circle(0, 0, 15).fill(0xFF8800);
                                effect.circle(0, 0, 8).fill(0xFFDD00);
                                break;
                            }
                            case 'ice': {
                                // Ice shard effect
                                effect.moveTo(0, -15)
                                    .lineTo(10, 15)
                                    .lineTo(-10, 15)
                                    .closePath()
                                    .fill(0x88DDFF);
                                effect.circle(0, 0, 8).fill(0xAAEEFF);
                                break;
                            }
                            default: {
                                // Default impact effect
                                effect.circle(0, 0, 20).fill(0xFFFFFF);
                                effect.circle(0, 0, 12).fill(0xFFDD00);
                            }
                        }
                        effect.x = targetX;
                        effect.y = targetY;
                        effect.alpha = 0;
                        effect.scale.set(0.5);
                        this.effectsContainer.addChild(effect);
                        // Animate effect
                        return [4 /*yield*/, gsap_1.gsap.to(effect, {
                                alpha: 1,
                                scale: 1.2,
                                duration: 0.2,
                                ease: 'power2.out'
                            })];
                    case 1:
                        // Animate effect
                        _c.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(effect, {
                                alpha: 0,
                                scale: 0.8,
                                duration: 0.3,
                                ease: 'power2.in'
                            })];
                    case 2:
                        _c.sent();
                        this.effectsContainer.removeChild(effect);
                        return [2 /*return*/];
                }
            });
        });
    };
    BattleScene.prototype.animateTargetHit = function (targetCard, damage) {
        return __awaiter(this, void 0, void 0, function () {
            var originalX;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        originalX = targetCard.x;
                        return [4 /*yield*/, gsap_1.gsap.to(targetCard, {
                                x: originalX - 5,
                                duration: 0.05
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(targetCard, {
                                x: originalX + 5,
                                duration: 0.05
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, gsap_1.gsap.to(targetCard, {
                                x: originalX,
                                duration: 0.05
                            })];
                    case 3:
                        _a.sent();
                        // Damage number animation
                        return [4 /*yield*/, this.showDamageNumber(targetCard, damage)];
                    case 4:
                        // Damage number animation
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BattleScene.prototype.showDamageNumber = function (targetCard, damage) {
        return __awaiter(this, void 0, void 0, function () {
            var damageText;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        damageText = new pixi_js_1.Text({
                            text: "-".concat(damage),
                            style: {
                                fontFamily: 'Kalam',
                                fontSize: 20,
                                fontWeight: 'bold',
                                fill: 0xFF4444,
                                stroke: { color: 0xFFFFFF, width: 2 }
                            }
                        });
                        damageText.anchor.set(0.5);
                        damageText.x = targetCard.x + (((_a = targetCard.parent) === null || _a === void 0 ? void 0 : _a.x) || 0) + 50;
                        damageText.y = targetCard.y + (((_b = targetCard.parent) === null || _b === void 0 ? void 0 : _b.y) || 0) + 30;
                        this.effectsContainer.addChild(damageText);
                        // Animate damage number floating up and fading
                        return [4 /*yield*/, gsap_1.gsap.to(damageText, {
                                y: damageText.y - 50,
                                alpha: 0,
                                scale: 1.5,
                                duration: 1,
                                ease: 'power2.out'
                            })];
                    case 1:
                        // Animate damage number floating up and fading
                        _c.sent();
                        this.effectsContainer.removeChild(damageText);
                        return [2 /*return*/];
                }
            });
        });
    };
    BattleScene.prototype.startBattle = function () {
        // Note: The createBattle API method doesn't exist in the new specification
        // battleApi.createBattle({
        //   team1: this.team1.map(char => ({ id: char.id, name: char.name, level: char.level })),
        //   team2: this.team2.map(char => ({ id: char.id, name: char.name, level: char.level })),
        //   battleType: '4v4',
        //   timestamp: Date.now()
        // });
        this.battleLog = ['Battle Started!'];
        this.currentTurn = 1;
        this.updateBattleLog();
        this.processTurn();
    };
    BattleScene.prototype.processTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var team1Alive, team2Alive, allAlive, _i, allAlive_1, attacker, targets, target, actionType, baseDamage, defense, critChance, isCrit, damage, actionEmoji, critText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isAnimating)
                            return [2 /*return*/];
                        this.isAnimating = true;
                        team1Alive = this.team1.filter(function (char) { return char.current_hp > 0; });
                        team2Alive = this.team2.filter(function (char) { return char.current_hp > 0; });
                        // Check for battle end conditions
                        if (team1Alive.length === 0) {
                            this.battleLog.push('Allies Win!');
                            this.updateBattleLog();
                            this.isAnimating = false;
                            return [2 /*return*/];
                        }
                        if (team2Alive.length === 0) {
                            this.battleLog.push('Enemies Win!');
                            this.updateBattleLog();
                            this.isAnimating = false;
                            return [2 /*return*/];
                        }
                        allAlive = __spreadArray(__spreadArray([], team1Alive.map(function (c) { return (__assign(__assign({}, c), { team: 1 })); }), true), team2Alive.map(function (c) { return (__assign(__assign({}, c), { team: 2 })); }), true);
                        allAlive.sort(function (a, b) { return b.agi - a.agi; });
                        _i = 0, allAlive_1 = allAlive;
                        _a.label = 1;
                    case 1:
                        if (!(_i < allAlive_1.length)) return [3 /*break*/, 5];
                        attacker = allAlive_1[_i];
                        if (attacker.current_hp <= 0)
                            return [3 /*break*/, 4]; // Skip if character died this turn
                        targets = attacker.team === 1 ?
                            this.team2.filter(function (char) { return char.current_hp > 0; }) :
                            this.team1.filter(function (char) { return char.current_hp > 0; });
                        if (targets.length === 0)
                            return [3 /*break*/, 5]; // No targets available
                        target = targets[Math.floor(Math.random() * targets.length)];
                        actionType = this.chooseActionType(attacker);
                        baseDamage = attacker.atk;
                        defense = target.def;
                        critChance = attacker.crit_rate / 100;
                        isCrit = Math.random() < critChance;
                        damage = Math.max(1, baseDamage - defense + Math.floor(Math.random() * 5) - 2);
                        // Apply action type modifiers
                        switch (actionType) {
                            case 'fire':
                                damage = Math.floor(damage * 1.2); // Fire does more damage
                                break;
                            case 'ice':
                                damage = Math.floor(damage * 0.9); // Ice does less damage but could have other effects
                                break;
                            case 'slash':
                                // Slash has higher crit chance
                                if (!isCrit && Math.random() < 0.2) {
                                    damage = Math.floor(damage * (attacker.crit_dmg / 100));
                                    this.battleLog.push("\uD83D\uDCA5 Slash Critical Hit!");
                                }
                                break;
                        }
                        if (isCrit) {
                            damage = Math.floor(damage * (attacker.crit_dmg / 100));
                            this.battleLog.push("\uD83D\uDCA5 Critical Hit!");
                        }
                        // Apply damage
                        target.current_hp = Math.max(0, target.current_hp - damage);
                        // Gain energy for attacking
                        attacker.current_energy = Math.min(100, attacker.current_energy + 15);
                        // Animate the action
                        return [4 /*yield*/, this.animateAction(attacker, target, actionType, damage)];
                    case 2:
                        // Animate the action
                        _a.sent();
                        actionEmoji = this.getActionEmoji(actionType);
                        critText = isCrit ? ' (CRIT)' : '';
                        this.battleLog.push("".concat(attacker.ticker, " ").concat(actionEmoji, " ").concat(actionType, "s ").concat(target.ticker, " for ").concat(damage, " damage").concat(critText));
                        if (target.current_hp === 0) {
                            this.battleLog.push("".concat(target.ticker, " is defeated!"));
                            // Attacker gains bonus energy for defeating enemy
                            attacker.current_energy = Math.min(100, attacker.current_energy + 25);
                        }
                        // Update UI after each action
                        this.updateBattleCards();
                        this.updateBattleLog();
                        // Small delay between actions for better visual flow
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 3:
                        // Small delay between actions for better visual flow
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        this.currentTurn++;
                        this.isAnimating = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    BattleScene.prototype.chooseActionType = function (character) {
        var actions = ['slash', 'fire', 'ice', 'punch'];
        // Simple logic based on character stats or random
        if (character.atk > 80) {
            // High attack characters prefer slash
            return Math.random() < 0.4 ? 'slash' : actions[Math.floor(Math.random() * actions.length)];
        }
        else if (character.agi > 70) {
            // Fast characters prefer ice
            return Math.random() < 0.4 ? 'ice' : actions[Math.floor(Math.random() * actions.length)];
        }
        else {
            // Others prefer fire or random
            return Math.random() < 0.3 ? 'fire' : actions[Math.floor(Math.random() * actions.length)];
        }
    };
    BattleScene.prototype.getActionEmoji = function (actionType) {
        switch (actionType) {
            case 'slash': return '⚔️';
            case 'fire': return '🔥';
            case 'ice': return '❄️';
            default: return '👊';
        }
    };
    BattleScene.prototype.updateBattleCards = function () {
        var _this = this;
        // Update team 1 cards
        this.team1Container.children.forEach(function (cardContainer, index) {
            if (index < _this.team1.length) {
                _this.updateCardBars(cardContainer, _this.team1[index]);
            }
        });
        // Update team 2 cards
        this.team2Container.children.forEach(function (cardContainer, index) {
            if (index < _this.team2.length) {
                _this.updateCardBars(cardContainer, _this.team2[index]);
            }
        });
    };
    BattleScene.prototype.updateCardBars = function (cardContainer, character) {
        // Get card dimensions from stored properties
        var cardWidth = cardContainer.cardWidth || 100;
        var cardHeight = cardContainer.cardHeight || 120;
        // Find and update HP bar
        var hpBarFill = cardContainer.children[4]; // HP bar fill
        var hpText = cardContainer.children[5]; // HP text
        var energyBarFill = cardContainer.children[7]; // Energy bar fill
        var energyText = cardContainer.children[8]; // Energy text
        if (hpBarFill && hpText) {
            var hpPercentage = character.current_hp / character.hp;
            hpBarFill.clear();
            hpBarFill.roundRect(6, 46, (cardWidth - 12) * hpPercentage, 6, 3)
                .fill(hpPercentage > 0.5 ? 0x4caf50 : hpPercentage > 0.25 ? 0xff9800 : 0xf44336);
            hpText.text = "HP: ".concat(character.current_hp, "/").concat(character.hp);
        }
        if (energyBarFill && energyText) {
            var energyPercentage = character.current_energy / 100;
            energyBarFill.clear();
            energyBarFill.roundRect(6, 71, (cardWidth - 12) * energyPercentage, 6, 3)
                .fill(0x2196f3);
            energyText.text = "EN: ".concat(character.current_energy, "/100");
        }
        // Add visual effect for defeated characters
        if (character.current_hp === 0) {
            cardContainer.alpha = 0.5; // Make defeated characters semi-transparent
            // Add "DEFEATED" overlay if not already present
            if (!cardContainer.children.find(function (child) { return child.isDefeatedOverlay; })) {
                var defeatedOverlay = new pixi_js_1.Graphics();
                defeatedOverlay.roundRect(0, 0, cardWidth, cardHeight, 8)
                    .fill({ color: 0x000000, alpha: 0.6 });
                var defeatedText = new pixi_js_1.Text({
                    text: 'DEFEATED',
                    style: {
                        fontFamily: 'Kalam',
                        fontSize: 10,
                        fontWeight: 'bold',
                        fill: 0xff4444,
                        align: 'center'
                    }
                });
                defeatedText.anchor.set(0.5);
                defeatedText.x = cardWidth / 2;
                defeatedText.y = cardHeight / 2;
                defeatedOverlay.isDefeatedOverlay = true;
                defeatedText.isDefeatedOverlay = true;
                cardContainer.addChild(defeatedOverlay, defeatedText);
            }
        }
        else {
            cardContainer.alpha = 1; // Ensure living characters are fully visible
        }
    };
    BattleScene.prototype.updateBattleLog = function () {
        var _this = this;
        // Clear existing log text
        var logChildren = this.logContainer.children.slice(2); // Keep background and title
        logChildren.forEach(function (child) { return _this.logContainer.removeChild(child); });
        // Show last 3 log entries
        var recentLogs = this.battleLog.slice(-3);
        recentLogs.forEach(function (log, index) {
            var logText = new pixi_js_1.Text({
                text: log,
                style: {
                    fontFamily: 'Kalam',
                    fontSize: 10,
                    fill: colors_1.Colors.TEXT_SECONDARY
                }
            });
            logText.x = 10;
            logText.y = 22 + index * 15;
            _this.logContainer.addChild(logText);
        });
    };
    BattleScene.prototype.update = function () {
        // Animation updates can be added here
    };
    /** Assets bundles required by this screen */
    BattleScene.assetBundles = [];
    return BattleScene;
}(BaseScene_1.BaseScene));
exports.BattleScene = BattleScene;
