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
exports.CharactersScene = void 0;
var pixi_js_1 = require("pixi.js");
var navigation_1 = require("@/utils/navigation");
var HomeScene_1 = require("./HomeScene");
var BaseScene_1 = require("@/utils/BaseScene");
var colors_1 = require("@/utils/colors");
var CharacterDetailScene_1 = require("./CharacterDetailScene");
var ui_1 = require("@pixi/ui");
var api_1 = require("@/services/api");
var loadingStateManager_1 = require("@/utils/loadingStateManager");
var CharactersScene = /** @class */ (function (_super) {
    __extends(CharactersScene, _super);
    function CharactersScene() {
        var _this = _super.call(this) || this;
        _this.scrollOffset = 0;
        _this.maxScroll = 0;
        _this.characters = [];
        _this.scrollOffset = 0;
        _this.maxScroll = 0;
        // Create containers once
        _this.container = new pixi_js_1.Container();
        _this.backgroundContainer = new pixi_js_1.Container();
        _this.headerContainer = new pixi_js_1.Container();
        _this.gridContainer = new pixi_js_1.Container();
        _this.buttonContainer = new pixi_js_1.Container();
        _this.addChild(_this.container);
        _this.container.addChild(_this.backgroundContainer, _this.headerContainer, _this.gridContainer, _this.buttonContainer);
        // Initialize loading manager
        _this.loadingManager = new loadingStateManager_1.LoadingStateManager(_this.container, _this.gameWidth, _this.gameHeight);
        // Load data and create UI
        _this.loadCharactersData();
        return _this;
    }
    CharactersScene.prototype.loadCharactersData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.loadingManager.showLoading();
                        _a = this;
                        return [4 /*yield*/, api_1.charactersApi.getAllCharacters()];
                    case 1:
                        _a.characters = _b.sent();
                        this.loadingManager.hideLoading();
                        // Show mock data indicator if we're likely using mock data
                        if ((0, api_1.isLikelyUsingMockData)()) {
                            this.loadingManager.showMockDataIndicator();
                        }
                        return [4 /*yield*/, this.initializeUI()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CharactersScene.prototype.initializeUI = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.characters.length)
                            return [2 /*return*/];
                        this.createBackground();
                        this.createHeader();
                        return [4 /*yield*/, this.createCharacterGrid()];
                    case 1:
                        _a.sent();
                        this.createBackButton();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Resize the screen */
    CharactersScene.prototype.resize = function (width, height) {
        this.gameWidth = width;
        this.gameHeight = height;
        // Update loading manager dimensions
        this.loadingManager.updateDimensions(width, height);
        // Only update layout if we have loaded data
        if (this.characters.length > 0) {
            this.updateLayout();
        }
    };
    CharactersScene.prototype.updateLayout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Clear and recreate layout - this is more efficient than destroying/recreating all elements
                        this.backgroundContainer.removeChildren();
                        this.headerContainer.removeChildren();
                        this.gridContainer.removeChildren();
                        this.buttonContainer.removeChildren();
                        // Recreate layout with current dimensions
                        this.createBackground();
                        this.createHeader();
                        return [4 /*yield*/, this.createCharacterGrid()];
                    case 1:
                        _a.sent();
                        this.createBackButton();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Show the screen with animation */
    CharactersScene.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tween;
            var _this = this;
            return __generator(this, function (_a) {
                this.alpha = 0;
                tween = { alpha: 0 };
                return [2 /*return*/, new Promise(function (resolve) {
                        var animate = function () {
                            tween.alpha += 0.05;
                            _this.alpha = tween.alpha;
                            if (tween.alpha >= 1) {
                                _this.alpha = 1;
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
    CharactersScene.prototype.hide = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tween;
            var _this = this;
            return __generator(this, function (_a) {
                tween = { alpha: 1 };
                return [2 /*return*/, new Promise(function (resolve) {
                        var animate = function () {
                            tween.alpha -= 0.1;
                            _this.alpha = tween.alpha;
                            if (tween.alpha <= 0) {
                                _this.alpha = 0;
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
    CharactersScene.prototype.reset = function () {
        this.container.removeChildren();
        this.scrollOffset = 0;
        this.maxScroll = 0;
    };
    CharactersScene.prototype.createBackground = function () {
        var bg = new pixi_js_1.Graphics();
        bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(colors_1.Colors.BACKGROUND_PRIMARY);
        this.backgroundContainer.addChild(bg);
    };
    CharactersScene.prototype.createHeader = function () {
        var title = this.createTitle('Character Collection', this.gameWidth / 2, 60);
        var subtitle = new pixi_js_1.Text({
            text: "".concat(this.characters.length, " Characters"),
            style: {
                fontFamily: 'Kalam',
                fontSize: 18,
                fill: colors_1.Colors.TEXT_SECONDARY,
                align: 'center'
            }
        });
        subtitle.anchor.set(0.5);
        subtitle.x = this.gameWidth / 2;
        subtitle.y = 100;
        this.headerContainer.addChild(title, subtitle);
    };
    CharactersScene.prototype.createCharacterGrid = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gridTop, backButtonHeight, backButtonMargin, gridHeight, availableWidth, isMobile, gap, cardCount, cardWidth, cardHeight, layout, gridContent, _loop_1, this_1, index, totalRows, contentHeight, scrollBox;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gridTop = 140;
                        backButtonHeight = 50;
                        backButtonMargin = 30;
                        gridHeight = this.gameHeight - gridTop - backButtonHeight - backButtonMargin - this.STANDARD_PADDING;
                        availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
                        isMobile = this.gameWidth < 768;
                        gap = isMobile ? 8 : this.STANDARD_SPACING;
                        cardCount = 3;
                        cardWidth = (availableWidth - (gap * (cardCount - 1))) / cardCount;
                        cardHeight = cardWidth * 1.25;
                        layout = {
                            itemsPerRow: cardCount,
                            itemWidth: cardWidth,
                            totalWidth: availableWidth
                        };
                        gridContent = new pixi_js_1.Container();
                        _loop_1 = function (index) {
                            var character, row, col, x, y, characterCard;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        character = this_1.characters[index];
                                        row = Math.floor(index / layout.itemsPerRow);
                                        col = index % layout.itemsPerRow;
                                        x = col * (layout.itemWidth + gap);
                                        y = row * (cardHeight + gap);
                                        return [4 /*yield*/, this_1.createHeroCard(character, x, y, 'detailed', undefined, cardWidth)];
                                    case 1:
                                        characterCard = _b.sent();
                                        characterCard.width = layout.itemWidth;
                                        characterCard.height = cardHeight;
                                        characterCard.on('pointerdown', function () {
                                            navigation_1.navigation.showScreen(CharacterDetailScene_1.CharacterDetailScene, { selectedCharacter: character });
                                        });
                                        gridContent.addChild(characterCard);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        index = 0;
                        _a.label = 1;
                    case 1:
                        if (!(index < this.characters.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(index)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        index++;
                        return [3 /*break*/, 1];
                    case 4:
                        totalRows = Math.ceil(this.characters.length / layout.itemsPerRow);
                        contentHeight = totalRows * (cardHeight + gap);
                        scrollBox = new ui_1.ScrollBox({
                            width: availableWidth,
                            height: gridHeight,
                        });
                        scrollBox.x = this.STANDARD_PADDING;
                        scrollBox.y = gridTop;
                        scrollBox.addItem(gridContent);
                        // Set gridContent height for proper scrolling
                        gridContent.height = contentHeight;
                        this.gridContainer.addChild(scrollBox);
                        scrollBox.label = 'gridContainer';
                        return [2 /*return*/];
                }
            });
        });
    };
    // private createDetailedCharacterCard(character: any, x: number, y: number): Container {
    //   const card = this.createHeroCard(character, x, y, 'detailed');
    //   // Click handler
    //   card.on('pointerdown', () => {
    //     navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
    //   });
    //   // Hover effects
    //   // card.on('pointerover', () => {
    //   //   card.scale.set(1.05);
    //   // });
    //   // card.on('pointerout', () => {
    //   //   card.scale.set(1.0);
    //   // });
    //   return card;
    // }
    CharactersScene.prototype.setupScrolling = function () {
        var _this = this;
        this.interactive = true;
        this.on('wheel', function (event) {
            var delta = event.deltaY;
            _this.scrollOffset += delta * 0.5;
            _this.scrollOffset = Math.max(0, Math.min(_this.maxScroll, _this.scrollOffset));
            var gridContainer = _this.getChildByLabel('gridContainer');
            if (gridContainer) {
                gridContainer.y = -_this.scrollOffset;
            }
        });
    };
    CharactersScene.prototype.createBackButton = function () {
        // Responsive button sizing
        var buttonWidth = Math.min(140, this.gameWidth - 2 * this.STANDARD_PADDING); // Reduced from 150
        var buttonHeight = Math.max(40, Math.min(46, this.gameHeight * 0.07)); // Reduced heights for small screens
        var backButton = this.createButton('← Back', this.STANDARD_PADDING, this.gameHeight - buttonHeight - this.STANDARD_PADDING, buttonWidth, buttonHeight, function () { return navigation_1.navigation.showScreen(HomeScene_1.HomeScene); }, 14 // Reduced base font size from 16
        );
        this.buttonContainer.addChild(backButton);
    };
    CharactersScene.prototype.update = function () {
        // No specific animations needed
    };
    /** Assets bundles required by this screen */
    CharactersScene.assetBundles = [];
    return CharactersScene;
}(BaseScene_1.BaseScene));
exports.CharactersScene = CharactersScene;
