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
exports.TowerScene = void 0;
var pixi_js_1 = require("pixi.js");
var navigation_1 = require("@/utils/navigation");
var BaseScene_1 = require("@/utils/BaseScene");
var HomeScene_1 = require("./HomeScene");
var colors_1 = require("@/utils/colors");
var api_1 = require("@/services/api");
var loadingStateManager_1 = require("@/utils/loadingStateManager");
var TowerFloorPopup_1 = require("@/popups/TowerFloorPopup");
var ui_1 = require("@pixi/ui");
var TowerScene = /** @class */ (function (_super) {
    __extends(TowerScene, _super);
    function TowerScene(params) {
        var _this = _super.call(this) || this;
        _this.dungeon = null;
        _this.selectedFloor = 0;
        _this.stages = [];
        _this.dungeon = (params === null || params === void 0 ? void 0 : params.selectedDungeon) || null;
        // Create containers once
        _this.container = new pixi_js_1.Container();
        _this.backgroundContainer = new pixi_js_1.Container();
        _this.headerContainer = new pixi_js_1.Container();
        _this.towerContainer = new pixi_js_1.Container();
        _this.buttonContainer = new pixi_js_1.Container();
        _this.addChild(_this.container);
        _this.container.addChild(_this.backgroundContainer, _this.headerContainer, _this.towerContainer, _this.buttonContainer);
        _this.loadingManager = new loadingStateManager_1.LoadingStateManager(_this.container, _this.gameWidth, _this.gameHeight);
        return _this;
    }
    TowerScene.prototype.prepare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.loadingManager.showLoading();
                        return [4 /*yield*/, api_1.battleApi.getAvailableStages()];
                    case 1:
                        response = _a.sent();
                        if (response.success && response.data) {
                            this.stages = response.data;
                            console.log("\u2705 Stages loaded successfully: ".concat(response.message));
                        }
                        else {
                            console.error("\u274C Failed to load stages: ".concat(response.message));
                            if (response.errors) {
                                response.errors.forEach(function (error) { return console.error("   Error: ".concat(error)); });
                            }
                            this.stages = []; // Use empty array as fallback
                        }
                        this.loadingManager.hideLoading();
                        // Show mock data indicator if we're likely using mock data
                        if ((0, api_1.isLikelyUsingMockData)()) {
                            this.loadingManager.showMockDataIndicator();
                        }
                        this.initializeUI();
                        return [2 /*return*/];
                }
            });
        });
    };
    TowerScene.prototype.initializeUI = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.stages.length)
                    return [2 /*return*/];
                this.createBackground();
                this.createHeader();
                this.createTowerList();
                this.createBackButton();
                return [2 /*return*/];
            });
        });
    };
    TowerScene.prototype.resize = function (width, height) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.gameWidth = width;
                this.gameHeight = height;
                // Update loading manager dimensions
                this.loadingManager.updateDimensions(width, height);
                // Only update layout if we have loaded data
                if (this.dungeon) {
                    this.updateLayout();
                }
                return [2 /*return*/];
            });
        });
    };
    TowerScene.prototype.updateLayout = function () {
        // Clear and recreate layout
        this.backgroundContainer.removeChildren();
        this.headerContainer.removeChildren();
        this.towerContainer.removeChildren();
        this.buttonContainer.removeChildren();
        // Recreate layout with current dimensions
        this.createBackground();
        this.createHeader();
        this.createTowerList();
        this.createBackButton();
    };
    TowerScene.prototype.createBackground = function () {
        // Create a mystical tower-themed background
        var bgContainer = new pixi_js_1.Container();
        var availableHeight = this.getContentHeight();
        // Dark tower background with purple/blue gradient
        var bg = new pixi_js_1.Graphics();
        var towerGradient = colors_1.Gradients.createBackgroundGradient(this.gameWidth, availableHeight);
        bg.fill(towerGradient).rect(0, 0, this.gameWidth, availableHeight);
        bgContainer.addChild(bg);
        // Add tower-themed decorative elements
        for (var i = 0; i < 20; i++) {
            var star = new pixi_js_1.Graphics();
            star.fill({ color: colors_1.Colors.DECORATION_MAGIC, alpha: 0.2 + Math.random() * 0.4 })
                .circle(0, 0, 1 + Math.random() * 3);
            star.x = Math.random() * this.gameWidth;
            star.y = Math.random() * availableHeight;
            bgContainer.addChild(star);
        }
        this.backgroundContainer.addChild(bgContainer);
    };
    TowerScene.prototype.createHeader = function () {
        var title = new pixi_js_1.Text({
            text: '🗼 Battle Tower',
            style: {
                fontFamily: 'Kalam',
                fontSize: 32,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY,
                stroke: {
                    color: colors_1.Colors.BACKGROUND_SECONDARY,
                    width: 2,
                },
                dropShadow: {
                    color: colors_1.Colors.SHADOW_COLOR,
                    blur: 4,
                    angle: Math.PI / 6,
                    distance: 4,
                    alpha: 0.5,
                },
            }
        });
        title.anchor.set(0.5);
        title.x = this.gameWidth / 2;
        title.y = 40;
        this.headerContainer.addChild(title);
    };
    TowerScene.prototype.createTowerList = function () {
        var _this = this;
        this.towerContainer.label = 'towerContainer';
        var stages = this.stages;
        // Calculate responsive tower layout with updated card dimensions
        var cardWidth = Math.min(200, this.gameWidth - 60); // Updated to match new card width
        var cardHeight = 120;
        var floorSpacing = 50; // Space between tower floors
        var firstFloorY = 0; // To track the Y position of the first floor for scrolling
        if (stages.length > 0) {
            // Calculate total tower height and starting position
            var totalHeight = stages.length * cardHeight + (stages.length - 1) * floorSpacing;
            var availableHeight = this.gameHeight - 220; // Leave space for header and back button
            var startY_1 = Math.max(20, (availableHeight - totalHeight) / 2);
            stages.forEach(function (stage, index) {
                var floorCard = _this.createFloorCard(stage, index);
                // Position cards vertically - bottom to top (like climbing a tower)
                // Reverse the order so first stage (floor 1) is at the bottom
                var reverseIndex = stages.length - 1 - index;
                floorCard.x = 0; // Centered horizontally
                floorCard.y = startY_1 + reverseIndex * (cardHeight + floorSpacing);
                // Set firstFloorY to the first (bottom-most) not completed stage only once
                if (stage.is_current) {
                    firstFloorY = floorCard.y;
                }
                // Add tower floor connecting line
                if (index < stages.length) {
                    var connectionLine = _this.createTowerConnection(cardWidth, cardHeight);
                    connectionLine.x = cardWidth / 2 - 2; // Center the line
                    connectionLine.y = floorCard.y + cardHeight;
                    _this.towerContainer.addChild(connectionLine);
                }
                _this.towerContainer.addChild(floorCard);
            });
        }
        var scrollBoxWidth = cardWidth + 40; // Add some padding
        var scrollBoxHeight = this.gameHeight - 180;
        this.towerContainer.width = scrollBoxWidth;
        // Create ScrollBox for vertical scrolling
        var scrollBox = new ui_1.ScrollBox({
            width: scrollBoxWidth,
            height: scrollBoxHeight
        });
        scrollBox.x = (this.gameWidth - scrollBoxWidth) / 2;
        scrollBox.y = 60;
        var maxScrollY = Math.max(this.towerContainer.height - scrollBoxHeight, 0);
        var targetY = Math.min(Math.max(firstFloorY - (scrollBoxHeight - cardHeight), 0), maxScrollY);
        // scroll to the first uncompleted floor, ensuring we don't exceed scroll bounds
        scrollBox.scrollToPosition({ x: 0, y: targetY });
        scrollBox.addItem(this.towerContainer);
        this.addChild(scrollBox);
    };
    TowerScene.prototype.createTowerConnection = function (cardWidth, cardHeight) {
        var connection = new pixi_js_1.Container();
        // Vertical connecting line with tower theme
        var line = new pixi_js_1.Graphics();
        line.moveTo(0, 0)
            .lineTo(0, 50) // Height of the floor spacing
            .stroke({ width: 6, color: colors_1.Colors.BUTTON_PRIMARY, alpha: 0.7 });
        // Decorative tower nodes at top and bottom
        var topNode = new pixi_js_1.Graphics();
        topNode.circle(0, 0, 4)
            .fill({ color: colors_1.Colors.BUTTON_PRIMARY, alpha: 0.9 });
        var bottomNode = new pixi_js_1.Graphics();
        bottomNode.circle(0, 50, 4)
            .fill({ color: colors_1.Colors.BUTTON_PRIMARY, alpha: 0.9 });
        // Add mystical energy effect
        var energy = new pixi_js_1.Graphics();
        energy.circle(0, 25, 6)
            .fill({ color: colors_1.Colors.DECORATION_MAGIC, alpha: 0.3 });
        connection.addChild(line, topNode, bottomNode, energy);
        return connection;
    };
    TowerScene.prototype.createFloorCard = function (stage, index) {
        var _this = this;
        var card = new pixi_js_1.Container();
        // Simplified dimensions for tower layout - smaller cards with just floor number and icon
        var cardWidth = Math.min(200, this.gameWidth - 60);
        var cardHeight = 120;
        // Choose color based on completion
        var bgColor = stage.is_completed ? colors_1.Colors.ELEMENT_DEFAULT : colors_1.Colors.BACKGROUND_SECONDARY;
        // Background with tower floor styling
        var bg = new pixi_js_1.Graphics();
        bg.roundRect(0, 0, cardWidth, cardHeight, 12)
            .fill({ color: bgColor, alpha: 0.95 })
            .stroke({ width: 4, color: colors_1.Colors.BUTTON_PRIMARY });
        // Floor number at the top
        var floorNumber = new pixi_js_1.Text({
            text: stage.name,
            style: {
                fontFamily: 'Kalam',
                fontSize: 16,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY,
                align: 'center'
            }
        });
        floorNumber.anchor.set(0.5, 0);
        floorNumber.x = cardWidth / 2;
        floorNumber.y = 15;
        // Tower icon: locked if not completed and not current
        var towerIcon;
        if (!stage.is_completed && !stage.is_current) {
            towerIcon = new pixi_js_1.Text({
                text: '🔒',
                style: {
                    fontFamily: 'Kalam',
                    fontSize: 48,
                    fill: colors_1.Colors.BUTTON_PRIMARY
                }
            });
        }
        else {
            towerIcon = new pixi_js_1.Text({
                text: '🗼',
                style: {
                    fontFamily: 'Kalam',
                    fontSize: 48,
                    fill: colors_1.Colors.BUTTON_PRIMARY
                }
            });
        }
        towerIcon.anchor.set(0.5);
        towerIcon.x = cardWidth / 2;
        towerIcon.y = cardHeight / 2 + 5;
        card.addChild(bg, floorNumber, towerIcon);
        // Only allow click/hover for completed or current stage
        var isClickable = stage.is_completed || stage.is_current;
        card.interactive = isClickable;
        card.cursor = isClickable ? 'pointer' : 'not-allowed';
        if (isClickable) {
            card.on('pointerover', function () {
                bg.tint = 0xe0e0ff;
                towerIcon.scale.set(1.1);
            });
            card.on('pointerout', function () {
                bg.tint = 0xffffff;
                towerIcon.scale.set(1.0);
            });
            card.on('pointerdown', function () {
                _this.showFloorPopup(stage);
            });
        }
        return card;
    };
    TowerScene.prototype.createBackButton = function () {
        // Responsive button sizing
        var buttonWidth = Math.min(180, this.gameWidth - 2 * this.STANDARD_PADDING);
        var buttonHeight = Math.max(40, Math.min(50, this.gameHeight * 0.07));
        var backButton = this.createButton('← Back to Home', this.STANDARD_PADDING, this.gameHeight - buttonHeight - this.STANDARD_PADDING, buttonWidth, buttonHeight, function () { return navigation_1.navigation.showScreen(HomeScene_1.HomeScene); }, 14);
        this.buttonContainer.addChild(backButton);
    };
    TowerScene.prototype.showFloorPopup = function (stage) {
        navigation_1.navigation.presentPopup(TowerFloorPopup_1.TowerFloorPopup, { stage: stage });
    };
    TowerScene.prototype.update = function (time) {
        // Tower-specific animations could go here
        // For example, subtle floating animations for the magical energy effects
    };
    return TowerScene;
}(BaseScene_1.BaseScene));
exports.TowerScene = TowerScene;
