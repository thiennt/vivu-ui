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
exports.PlayerDetailScene = void 0;
var pixi_js_1 = require("pixi.js");
var BaseScene_1 = require("@/utils/BaseScene");
var navigation_1 = require("@/utils/navigation");
var CharactersScene_1 = require("./CharactersScene");
var CharacterDetailScene_1 = require("./CharacterDetailScene");
var HomeScene_1 = require("./HomeScene");
var colors_1 = require("@/utils/colors");
var ui_1 = require("@pixi/ui");
var api_1 = require("@/services/api");
var loadingStateManager_1 = require("@/utils/loadingStateManager");
var PlayerDetailScene = /** @class */ (function (_super) {
    __extends(PlayerDetailScene, _super);
    function PlayerDetailScene() {
        var _this = _super.call(this) || this;
        _this.mainScrollBox = null;
        // Data state
        _this.player = null;
        _this.characters = [];
        // Point distribution state
        _this.tempStatChanges = { sta: 0, str: 0, agi: 0 };
        _this.remainingPoints = 0;
        // Create containers once
        _this.container = new pixi_js_1.Container();
        _this.scrollContent = new pixi_js_1.Container();
        _this.backgroundContainer = new pixi_js_1.Container();
        _this.headerContainer = new pixi_js_1.Container();
        _this.statsContainer = new pixi_js_1.Container();
        _this.collectionContainer = new pixi_js_1.Container();
        _this.buttonContainer = new pixi_js_1.Container();
        _this.pointDistributionContainer = new pixi_js_1.Container();
        _this.addChild(_this.container);
        // Add background directly to main container (not scrolled)
        _this.container.addChild(_this.backgroundContainer);
        // Add scrollable content
        _this.scrollContent.addChild(_this.headerContainer, _this.statsContainer, _this.pointDistributionContainer, _this.collectionContainer, _this.buttonContainer);
        // Initialize loading manager
        _this.loadingManager = new loadingStateManager_1.LoadingStateManager(_this.container, _this.gameWidth, _this.gameHeight);
        return _this;
        // Load data and create UI
        //this.loadPlayerData();
    }
    PlayerDetailScene.prototype.loadPlayerData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                this.loadingManager.showLoading();
                this.player = sessionStorage.getItem('player') ? JSON.parse(sessionStorage.getItem('player')) : null;
                this.characters = ((_a = this.player) === null || _a === void 0 ? void 0 : _a.characters) || [];
                this.remainingPoints = this.player.points || 0;
                this.tempStatChanges = { sta: 0, str: 0, agi: 0 };
                this.loadingManager.hideLoading();
                // Show mock data indicator if we're likely using mock data
                if ((0, api_1.isLikelyUsingMockData)()) {
                    this.loadingManager.showMockDataIndicator();
                }
                return [2 /*return*/];
            });
        });
    };
    PlayerDetailScene.prototype.initializeUI = function () {
        if (!this.player)
            return;
        this.createBackground();
        this.createHeader();
        this.createPlayerStats();
        this.createPointDistributionPanel();
        this.createCharacterCollection();
        this.createBackButton();
    };
    PlayerDetailScene.prototype.prepare = function () {
        this.loadPlayerData();
    };
    PlayerDetailScene.prototype.resize = function (width, height) {
        this.gameWidth = width;
        this.gameHeight = height;
        // Update loading manager dimensions
        this.loadingManager.updateDimensions(width, height);
        // Only update layout if we have loaded data
        if (this.player) {
            this.updateLayout();
        }
    };
    PlayerDetailScene.prototype.updateLayout = function () {
        // Clear and recreate layout - this is more efficient than destroying/recreating all elements
        this.backgroundContainer.removeChildren();
        this.headerContainer.removeChildren();
        this.statsContainer.removeChildren();
        this.pointDistributionContainer.removeChildren();
        this.collectionContainer.removeChildren();
        this.buttonContainer.removeChildren();
        // Remove existing scroll box if any
        if (this.mainScrollBox) {
            this.container.removeChild(this.mainScrollBox);
            this.mainScrollBox = null;
        }
        // Recreate layout with current dimensions
        this.createBackground();
        this.createHeader();
        this.createPlayerStats();
        this.createPointDistributionPanel();
        this.createCharacterCollection();
        this.createBackButton();
        // Add non-scrollable content directly to container
        this.container.addChild(this.scrollContent);
    };
    PlayerDetailScene.prototype.createBackground = function () {
        var bg = new pixi_js_1.Graphics();
        bg.fill(colors_1.Colors.BACKGROUND_PRIMARY).rect(0, 0, this.gameWidth, this.gameHeight);
        this.backgroundContainer.addChild(bg);
    };
    PlayerDetailScene.prototype.createHeader = function () {
        var title = this.createTitle('Player Profile', this.gameWidth / 2, 60);
        this.headerContainer.addChild(title);
    };
    PlayerDetailScene.prototype.createPlayerStats = function () {
        if (!this.player)
            return;
        // Calculate responsive panel sizes with standard padding
        var availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
        var panelWidth = Math.min(280, (availableWidth - this.STANDARD_SPACING) / 2);
        var totalWidth = (panelWidth * 2) + this.STANDARD_SPACING;
        var startX = (this.gameWidth - totalWidth) / 2;
        // Main info panel
        var mainPanel = this.createStatsPanel('Player Information', [
            "Username: ".concat(this.player.username),
            "Level: ".concat(this.player.level),
            "Experience: ".concat(this.player.exp),
            "Characters: ".concat(this.characters.length)
        ], panelWidth, 160);
        // Stats panel with temporary changes applied
        var currentSta = this.player.sta + this.tempStatChanges.sta;
        var currentStr = this.player.str + this.tempStatChanges.str;
        var currentAgi = this.player.agi + this.tempStatChanges.agi;
        var statsText = [
            "Stamina: ".concat(currentSta).concat(this.tempStatChanges.sta !== 0 ? " (".concat(this.tempStatChanges.sta > 0 ? '+' : '').concat(this.tempStatChanges.sta, ")") : ''),
            "Strength: ".concat(currentStr).concat(this.tempStatChanges.str !== 0 ? " (".concat(this.tempStatChanges.str > 0 ? '+' : '').concat(this.tempStatChanges.str, ")") : ''),
            "Agility: ".concat(currentAgi).concat(this.tempStatChanges.agi !== 0 ? " (".concat(this.tempStatChanges.agi > 0 ? '+' : '').concat(this.tempStatChanges.agi, ")") : ''),
            "Luck: ".concat(this.player.luck)
        ];
        var statsPanel = this.createStatsPanel('Statistics', statsText, panelWidth, 200);
        // Center both panels horizontally
        mainPanel.x = startX;
        mainPanel.y = 120;
        statsPanel.x = startX + panelWidth + this.STANDARD_SPACING;
        statsPanel.y = 120;
        this.statsContainer.addChild(mainPanel, statsPanel);
    };
    PlayerDetailScene.prototype.createStatsPanel = function (title, stats, width, height) {
        var panel = new pixi_js_1.Container();
        // Background
        var bg = new pixi_js_1.Graphics();
        bg.fill({ color: colors_1.Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
            .stroke({ width: 3, color: colors_1.Colors.BUTTON_PRIMARY })
            .roundRect(0, 0, width, height, 12);
        // Title
        var titleText = new pixi_js_1.Text({ text: title, style: {
                fontFamily: 'Kalam',
                fontSize: 20,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY
            } });
        titleText.x = 15;
        titleText.y = 15;
        panel.addChild(bg, titleText);
        // Stats
        stats.forEach(function (stat, index) {
            var statText = new pixi_js_1.Text({ text: stat, style: {
                    fontFamily: 'Kalam',
                    fontSize: 16,
                    fill: colors_1.Colors.TEXT_SECONDARY
                } });
            statText.x = 15;
            statText.y = 50 + (index * 22);
            panel.addChild(statText);
        });
        return panel;
    };
    PlayerDetailScene.prototype.createPointDistributionPanel = function () {
        var _this = this;
        if (!this.player)
            return;
        // Always show the panel - this meets the requirement to always display it
        var panelWidth = Math.min(600, this.gameWidth - 2 * this.STANDARD_PADDING);
        var panelHeight = 200;
        var startX = (this.gameWidth - panelWidth) / 2;
        var startY = 340; // Position below the stats panels
        var panel = new pixi_js_1.Container();
        // Background
        var bg = new pixi_js_1.Graphics();
        bg.fill({ color: colors_1.Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
            .stroke({ width: 3, color: colors_1.Colors.BUTTON_PRIMARY })
            .roundRect(0, 0, panelWidth, panelHeight, 12);
        // Title
        var titleText = new pixi_js_1.Text({ text: 'Distribute Attribute Points', style: {
                fontFamily: 'Kalam',
                fontSize: 20,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY
            } });
        titleText.x = 15;
        titleText.y = 15;
        // Show different message if no points available
        if (this.player.points <= 0) {
            var noPointsText = new pixi_js_1.Text({ text: 'No points available to distribute', style: {
                    fontFamily: 'Kalam',
                    fontSize: 16,
                    fill: colors_1.Colors.TEXT_SECONDARY,
                    fontStyle: 'italic'
                } });
            noPointsText.x = 15;
            noPointsText.y = 50;
            panel.addChild(bg, titleText, noPointsText);
            panel.x = startX;
            panel.y = startY;
            this.pointDistributionContainer.addChild(panel);
            return;
        }
        // Remaining points display
        var remainingText = new pixi_js_1.Text({ text: "Remaining Points: ".concat(this.remainingPoints), style: {
                fontFamily: 'Kalam',
                fontSize: 16,
                fill: colors_1.Colors.TEXT_SECONDARY
            } });
        remainingText.x = panelWidth - 200;
        remainingText.y = 20;
        panel.addChild(bg, titleText, remainingText);
        // Stat controls
        var stats = [
            { name: 'Stamina', key: 'sta', current: this.player.sta },
            { name: 'Strength', key: 'str', current: this.player.str },
            { name: 'Agility', key: 'agi', current: this.player.agi }
        ];
        stats.forEach(function (stat, index) {
            var yPos = 60 + (index * 40);
            // Stat name
            var nameText = new pixi_js_1.Text({ text: stat.name, style: {
                    fontFamily: 'Kalam',
                    fontSize: 16,
                    fill: colors_1.Colors.TEXT_PRIMARY
                } });
            nameText.x = 20;
            nameText.y = yPos;
            // Current value display
            var currentValue = stat.current + _this.tempStatChanges[stat.key];
            var valueText = new pixi_js_1.Text({ text: "".concat(currentValue), style: {
                    fontFamily: 'Kalam',
                    fontSize: 16,
                    fontWeight: 'bold',
                    fill: colors_1.Colors.TEXT_PRIMARY
                } });
            valueText.x = 150;
            valueText.y = yPos;
            // Minus button
            var minusButton = _this.createStatButton('-', 200, yPos - 5, 30, 30, function () {
                if (_this.tempStatChanges[stat.key] > 0) {
                    _this.tempStatChanges[stat.key]--;
                    _this.remainingPoints++;
                    _this.refreshPointDistributionPanel();
                }
            });
            // Plus button
            var plusButton = _this.createStatButton('+', 240, yPos - 5, 30, 30, function () {
                if (_this.remainingPoints > 0) {
                    _this.tempStatChanges[stat.key]++;
                    _this.remainingPoints--;
                    _this.refreshPointDistributionPanel();
                }
            });
            panel.addChild(nameText, valueText, minusButton, plusButton);
        });
        // Action buttons - responsive sizing
        var buttonHeight = Math.min(35, panelHeight * 0.15); // Responsive button height
        var resetButtonWidth = Math.min(70, panelWidth * 0.15);
        var confirmButtonWidth = Math.min(90, panelWidth * 0.2);
        var resetButton = this.createButton('Reset', panelWidth - resetButtonWidth - confirmButtonWidth - 20, panelHeight - buttonHeight - 10, resetButtonWidth, buttonHeight, function () {
            _this.tempStatChanges = { sta: 0, str: 0, agi: 0 };
            _this.remainingPoints = _this.player.points;
            _this.refreshPointDistributionPanel();
        }, 12 // Base font size
        );
        var confirmButton = this.createButton('Confirm', panelWidth - confirmButtonWidth - 10, panelHeight - buttonHeight - 10, confirmButtonWidth, buttonHeight, function () { return __awaiter(_this, void 0, void 0, function () {
            var updatedStats, _a, error_1, errorMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        updatedStats = {
                            sta_point: this.tempStatChanges.sta,
                            str_point: this.tempStatChanges.str,
                            agi_point: this.tempStatChanges.agi
                        };
                        this.loadingManager.showLoading();
                        _a = this;
                        return [4 /*yield*/, api_1.playerApi.updatePlayerStats(this.player.id, updatedStats)];
                    case 1:
                        _a.player = _b.sent();
                        // Reset temporary changes
                        this.tempStatChanges = { sta: 0, str: 0, agi: 0 };
                        this.loadingManager.hideLoading();
                        // Refresh the entire UI
                        this.updateLayout();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Failed to update player stats:', error_1);
                        errorMessage = error_1 instanceof api_1.ApiError
                            ? error_1.message
                            : 'Failed to update stats. Please try again.';
                        this.loadingManager.showError(errorMessage);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, 12 // Base font size
        );
        panel.addChild(resetButton, confirmButton);
        panel.x = startX;
        panel.y = startY;
        this.pointDistributionContainer.addChild(panel);
    };
    PlayerDetailScene.prototype.createStatButton = function (text, x, y, width, height, onClick) {
        var button = new pixi_js_1.Container();
        // Button background
        var bg = new pixi_js_1.Graphics();
        bg.roundRect(0, 0, width, height, 4)
            .fill(colors_1.Colors.BUTTON_PRIMARY)
            .stroke({ width: 2, color: colors_1.Colors.BUTTON_BORDER });
        // Button text
        var buttonText = new pixi_js_1.Text({
            text: text,
            style: {
                fontFamily: 'Kalam',
                fontSize: 16,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_BUTTON,
                align: 'center'
            }
        });
        buttonText.anchor.set(0.5);
        buttonText.x = width / 2;
        buttonText.y = height / 2;
        button.addChild(bg, buttonText);
        button.x = x;
        button.y = y;
        button.interactive = true;
        button.cursor = 'pointer';
        // Hover effects
        button.on('pointerover', function () {
            bg.tint = colors_1.Colors.BUTTON_HOVER;
        });
        button.on('pointerout', function () {
            bg.tint = 0xffffff;
        });
        button.on('pointerdown', onClick);
        return button;
    };
    PlayerDetailScene.prototype.refreshPointDistributionPanel = function () {
        // Clear and recreate just the point distribution panel and stats
        this.pointDistributionContainer.removeChildren();
        this.statsContainer.removeChildren();
        this.createPlayerStats();
        this.createPointDistributionPanel();
    };
    PlayerDetailScene.prototype.createCharacterCollection = function () {
        var _this = this;
        if (!this.player)
            return;
        // Mobile-optimized card layout using the specified formula
        var availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
        var isMobile = this.gameWidth < 768; // Mobile detection
        var gap = isMobile ? 8 : this.STANDARD_SPACING; // Use 8px gap on mobile
        var cardCount = 3; // Force 3 cards per row
        // Apply mobile formula: card_width = (screen_width - (gap * (card_count - 1))) / card_count
        var cardWidth = (availableWidth - (gap * (cardCount - 1))) / cardCount;
        // Use 4:5 aspect ratio for card height
        var cardHeight = cardWidth * 1.25;
        var layout = {
            itemsPerRow: cardCount,
            itemWidth: cardWidth,
            totalWidth: availableWidth
        };
        // Calculate Y position - always account for point distribution panel since it's always shown
        var baseY = 560; // Always add offset since point panel is always shown
        // Title - centered
        var collectionTitle = new pixi_js_1.Text({ text: 'Character Collection', style: {
                fontFamily: 'Kalam',
                fontSize: 24,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY
            } });
        collectionTitle.anchor.set(0.5, 0);
        collectionTitle.x = this.gameWidth / 2;
        collectionTitle.y = baseY;
        // Create a container for all cards
        var gridContent = new pixi_js_1.Container();
        this.characters.forEach(function (character, index) {
            var row = Math.floor(index / layout.itemsPerRow);
            var col = index % layout.itemsPerRow;
            var x = col * (layout.itemWidth + gap);
            var y = row * (cardHeight + gap);
            var card = _this.createCharacterPreviewCard(character, x, y, cardWidth);
            gridContent.addChild(card);
        });
        // Set content height for scrolling
        var totalRows = Math.ceil(this.characters.length / layout.itemsPerRow);
        var contentHeight = totalRows * (cardHeight + gap);
        // Calculate available height for scrolling (remaining screen space)
        var titleHeight = 40;
        var footerButtonHeight = 50; // Renamed to avoid conflict
        var buttonMargin = this.STANDARD_SPACING * 2;
        var maxScrollHeight = 150;
        // Create ScrollBox for vertical scrolling (only for character collection)
        var scrollBox = new ui_1.ScrollBox({
            width: availableWidth,
            height: Math.min(maxScrollHeight, contentHeight), // Limit height to available space
        });
        scrollBox.addItem(gridContent);
        // Position ScrollBox centered horizontally
        scrollBox.x = this.STANDARD_PADDING;
        scrollBox.y = baseY + titleHeight;
        // View all button - responsive sizing
        var buttonWidth = Math.min(200, this.gameWidth - 2 * this.STANDARD_PADDING); // Reduced from 250
        var buttonHeight = Math.max(40, Math.min(46, this.gameHeight * 0.07));
        var viewAllButton = this.createButton('View All Characters', (this.gameWidth - buttonWidth) / 2, scrollBox.y + Math.min(maxScrollHeight, contentHeight) + this.STANDARD_SPACING, buttonWidth, buttonHeight, function () { return navigation_1.navigation.showScreen(CharactersScene_1.CharactersScene); }, 14 // Base font size
        );
        this.collectionContainer.addChild(collectionTitle, scrollBox, viewAllButton);
    };
    PlayerDetailScene.prototype.createCharacterPreviewCard = function (character, x, y, customWidth) {
        var card = this.createHeroCard(character, x, y, 'preview', undefined, customWidth);
        // Click handler
        card.on('pointerdown', function () {
            navigation_1.navigation.showScreen(CharacterDetailScene_1.CharacterDetailScene, { selectedCharacter: character });
        });
        return card;
    };
    PlayerDetailScene.prototype.createBackButton = function () {
        // Responsive button sizing - improved for small screens
        var buttonWidth = Math.min(160, this.gameWidth - 2 * this.STANDARD_PADDING);
        var buttonHeight = Math.max(40, Math.min(46, this.gameHeight * 0.07));
        var backButton = this.createButton('← Back to Home', this.STANDARD_PADDING, this.gameHeight - buttonHeight - this.STANDARD_PADDING, buttonWidth, buttonHeight, function () { return navigation_1.navigation.showScreen(HomeScene_1.HomeScene); }, 14 // Added base font size
        );
        this.buttonContainer.addChild(backButton);
    };
    PlayerDetailScene.prototype.update = function (_time) {
        // No animations needed for this scene
    };
    return PlayerDetailScene;
}(BaseScene_1.BaseScene));
exports.PlayerDetailScene = PlayerDetailScene;
