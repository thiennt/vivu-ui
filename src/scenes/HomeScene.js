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
exports.HomeScene = void 0;
var pixi_js_1 = require("pixi.js");
var navigation_1 = require("@/utils/navigation");
var BaseScene_1 = require("@/utils/BaseScene");
var CharactersScene_1 = require("./CharactersScene");
var LineupScene_1 = require("./LineupScene");
var BattleScene_1 = require("./BattleScene");
var CardBattleScene_1 = require("./CardBattleScene");
var TowerScene_1 = require("./TowerScene");
var colors_1 = require("@/utils/colors");
var api_1 = require("@/services/api");
var loadingStateManager_1 = require("@/utils/loadingStateManager");
var HomeScene = /** @class */ (function (_super) {
    __extends(HomeScene, _super);
    function HomeScene() {
        var _this = _super.call(this) || this;
        _this.decorativeElements = [];
        _this.player = null;
        _this.container = new pixi_js_1.Container();
        _this.addChild(_this.container);
        // Initialize loading manager
        _this.loadingManager = new loadingStateManager_1.LoadingStateManager(_this.container, _this.gameWidth, _this.gameHeight);
        // Load player data
        _this.loadPlayerData();
        return _this;
    }
    HomeScene.prototype.loadPlayerData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.loadingManager.showLoading();
                        playerId = 'player_fc_001';
                        _a = this;
                        return [4 /*yield*/, api_1.playerApi.getPlayer(playerId)];
                    case 1:
                        _a.player = _b.sent();
                        sessionStorage.setItem('player', JSON.stringify(this.player));
                        sessionStorage.setItem('playerId', this.player.id);
                        this.loadingManager.hideLoading();
                        // Show mock data indicator if we're likely using mock data
                        if ((0, api_1.isLikelyUsingMockData)()) {
                            this.loadingManager.showMockDataIndicator();
                        }
                        this.createUI();
                        return [2 /*return*/];
                }
            });
        });
    };
    HomeScene.prototype.createUI = function () {
        if (!this.player)
            return;
        this.container.removeChildren();
        this.createBackground();
        this.createHomeTitle();
        this.createPlayerInfo();
        this.createMenuButtons();
        this.createDecorations();
        // Ensure bottom navigation is created and visible
        this.createBottomNavigation();
        // Animate decorative elements
        this.decorativeElements.forEach(function (element, index) {
            element.alpha = 0;
            var delay = index * 0.2;
            setTimeout(function () {
                var animate = function () {
                    element.alpha += 0.02;
                    if (element.alpha < 1) {
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }, delay * 1000);
        });
    };
    HomeScene.prototype.resize = function (width, height) {
        this.gameWidth = width;
        this.gameHeight = height;
        // Update loading manager dimensions
        this.loadingManager.updateDimensions(width, height);
        // Create/update bottom navigation
        this.updateBottomNavigation();
        // Only update layout if we have loaded data
        if (this.player) {
            this.createUI();
        }
    };
    /** Show the screen with animation */
    HomeScene.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tween;
            var _this = this;
            return __generator(this, function (_a) {
                // Animate elements in
                this.container.alpha = 1;
                tween = { alpha: 0 };
                return [2 /*return*/, new Promise(function (resolve) {
                        var animate = function () {
                            tween.alpha += 0.05;
                            _this.container.alpha = tween.alpha;
                            if (tween.alpha >= 1) {
                                _this.container.alpha = 1;
                                resolve();
                            }
                            else {
                                requestAnimationFrame(animate);
                            }
                        };
                        animate();
                    })];
            });
        });
    };
    /** Hide the screen with animation */
    HomeScene.prototype.hide = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tween;
            var _this = this;
            return __generator(this, function (_a) {
                tween = { alpha: 1 };
                return [2 /*return*/, new Promise(function (resolve) {
                        var animate = function () {
                            tween.alpha -= 0.1;
                            _this.container.alpha = tween.alpha;
                            if (tween.alpha <= 0) {
                                _this.container.alpha = 0;
                                resolve();
                            }
                            else {
                                requestAnimationFrame(animate);
                            }
                        };
                        animate();
                    })];
            });
        });
    };
    /** Reset screen after hidden */
    HomeScene.prototype.reset = function () {
        this.container.removeChildren();
        this.decorativeElements = [];
    };
    HomeScene.prototype.createBackground = function () {
        // Create an orange gradient background
        var bgContainer = new pixi_js_1.Container();
        // Get available height excluding bottom navigation
        var availableHeight = this.getContentHeight();
        // Main background with orange gradient effect - only cover available height
        var bg = new pixi_js_1.Graphics();
        var backgroundGradient = colors_1.Gradients.createBackgroundGradient(this.gameWidth, availableHeight);
        bg.fill(backgroundGradient).rect(0, 0, this.gameWidth, availableHeight);
        bgContainer.addChild(bg);
        // Add some mystical patterns with orange theme
        for (var i = 0; i < 15; i++) {
            var star = new pixi_js_1.Graphics();
            star.fill({ color: colors_1.Colors.DECORATION_MAGIC, alpha: 0.3 + Math.random() * 0.4 })
                .circle(0, 0, 2 + Math.random() * 3);
            star.x = Math.random() * this.gameWidth;
            star.y = Math.random() * availableHeight; // Only within available height
            bgContainer.addChild(star);
        }
        this.container.addChild(bgContainer);
    };
    HomeScene.prototype.createHomeTitle = function () {
        var title = new pixi_js_1.Text({
            text: 'VIVU',
            style: {
                fontFamily: 'Kalam',
                fontSize: 72,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY,
                stroke: {
                    color: colors_1.Colors.BACKGROUND_SECONDARY,
                    width: 4,
                },
                dropShadow: {
                    color: colors_1.Colors.SHADOW_COLOR,
                    blur: 8,
                    angle: Math.PI / 6,
                    distance: 8,
                    alpha: 0.5,
                },
            }
        });
        title.anchor.set(0.5);
        title.x = this.gameWidth / 2;
        title.y = 100;
        var subtitle = new pixi_js_1.Text({
            text: 'Crypto Card Adventures',
            style: {
                fontFamily: 'Kalam',
                fontSize: 24,
                fontStyle: 'italic',
                fill: colors_1.Colors.TEXT_SECONDARY,
                align: 'center'
            }
        });
        subtitle.anchor.set(0.5);
        subtitle.x = this.gameWidth / 2;
        subtitle.y = 150;
        this.container.addChild(title, subtitle);
    };
    HomeScene.prototype.createPlayerInfo = function () {
        var playerPanel = new pixi_js_1.Container();
        // Make panel wider to utilize more screen width
        var panelWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 350);
        // Background panel
        var bg = new pixi_js_1.Graphics();
        bg.fill({ color: colors_1.Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
            .stroke({ width: 2, color: colors_1.Colors.BUTTON_PRIMARY })
            .roundRect(0, 0, panelWidth, 100, 12);
        // Player info text
        var playerName = new pixi_js_1.Text({
            text: "Welcome, ".concat(this.player.username, "!"),
            style: {
                fontFamily: 'Kalam',
                fontSize: 20,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY
            }
        });
        playerName.x = 15;
        playerName.y = 15;
        var playerLevel = new pixi_js_1.Text({
            text: "Level: ".concat(this.player.level),
            style: {
                fontFamily: 'Kalam',
                fontSize: 16,
                fill: colors_1.Colors.TEXT_SECONDARY
            }
        });
        playerLevel.x = 15;
        playerLevel.y = 45;
        var playerExp = new pixi_js_1.Text({
            text: "EXP: ".concat(this.player.exp),
            style: {
                fontFamily: 'Kalam',
                fontSize: 16,
                fill: colors_1.Colors.TEXT_SECONDARY
            }
        });
        playerExp.x = 15;
        playerExp.y = 65;
        playerPanel.addChild(bg, playerName, playerLevel, playerExp);
        // Center the panel with standard padding consideration
        playerPanel.x = (this.gameWidth - panelWidth) / 2;
        playerPanel.y = 200;
        this.container.addChild(playerPanel);
    };
    HomeScene.prototype.createMenuButtons = function () {
        var _this = this;
        var buttonContainer = new pixi_js_1.Container();
        var buttons = [
            { text: '🗼 Tower (Card Battle)', screen: TowerScene_1.TowerScene },
            { text: '👥 Characters', screen: CharactersScene_1.CharactersScene },
            { text: '⚔️ Battle Arena', screen: BattleScene_1.BattleScene },
            { text: '🃏 Card Battle', screen: CardBattleScene_1.CardBattleScene },
            { text: '🧑‍🤝‍🧑 Lineup', screen: LineupScene_1.LineupScene },
        ];
        // Make buttons wider to utilize more screen space
        var buttonWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 280);
        // Calculate button spacing based on available space
        var headerHeight = 320; // Approximate height used by title and player info
        var availableHeight = this.gameHeight - headerHeight - this.STANDARD_PADDING;
        var totalButtonHeight = buttons.length * 60 + (buttons.length - 1) * this.STANDARD_SPACING;
        // Use smaller spacing if content doesn't fit
        var spacing = totalButtonHeight > availableHeight ?
            Math.max(5, (availableHeight - (buttons.length * 60)) / (buttons.length - 1)) :
            this.STANDARD_SPACING;
        buttons.forEach(function (buttonData, index) {
            var button = _this.createButton(buttonData.text, 0, index * (60 + spacing), buttonWidth, 60, function () { return navigation_1.navigation.showScreen(buttonData.screen); }, 18 // Base font size for responsive scaling
            );
            buttonContainer.addChild(button);
        });
        // Center horizontally and position based on content
        buttonContainer.x = (this.gameWidth - buttonWidth) / 2;
        buttonContainer.y = Math.min(350, headerHeight);
        this.container.addChild(buttonContainer);
    };
    HomeScene.prototype.createDecorations = function () {
        // Add some floating magical elements
        for (var i = 0; i < 8; i++) {
            var decoration = new pixi_js_1.Graphics();
            decoration.fill({ color: colors_1.Colors.DECORATION_MAGIC, alpha: 0.6 })
                .circle(0, 0, 3 + Math.random() * 5);
            decoration.x = Math.random() * this.gameWidth;
            decoration.y = Math.random() * this.gameHeight;
            this.decorativeElements.push(decoration);
            this.container.addChild(decoration);
        }
    };
    HomeScene.prototype.update = function (time) {
        var _this = this;
        // Animate decorative elements
        this.decorativeElements.forEach(function (element, index) {
            element.y += Math.sin(Date.now() * 0.001 + index) * 0.5;
            element.x += Math.cos(Date.now() * 0.0008 + index) * 0.3;
            element.alpha = 0.3 + Math.sin(Date.now() * 0.002 + index) * 0.3;
            // Wrap around screen
            if (element.x > _this.gameWidth + 20)
                element.x = -20;
            if (element.x < -20)
                element.x = _this.gameWidth + 20;
            if (element.y > _this.gameHeight + 20)
                element.y = -20;
            if (element.y < -20)
                element.y = _this.gameHeight + 20;
        });
    };
    /** Assets bundles required by this screen */
    HomeScene.assetBundles = [];
    return HomeScene;
}(BaseScene_1.BaseScene));
exports.HomeScene = HomeScene;
