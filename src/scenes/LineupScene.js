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
exports.LineupScene = void 0;
var pixi_js_1 = require("pixi.js");
var ui_1 = require("@pixi/ui");
var BaseScene_1 = require("@/utils/BaseScene");
var mockData_1 = require("@/utils/mockData");
var navigation_1 = require("@/utils/navigation");
var HomeScene_1 = require("./HomeScene");
var colors_1 = require("@/utils/colors");
var app_1 = require("../app");
var LineupScene = /** @class */ (function (_super) {
    __extends(LineupScene, _super);
    function LineupScene() {
        var _this = _super.call(this) || this;
        _this.lineupPositions = [];
        _this.availableCharacters = [];
        // Drag state
        _this.dragOffset = { x: 0, y: 0 };
        _this.dragTarget = null;
        _this.isDragging = false;
        _this.lineupSlotHitBoxes = [];
        _this.lineupPositions = mockData_1.mockPlayer.lineup;
        // Get available characters (all characters not in lineup)
        _this.availableCharacters = mockData_1.mockPlayer.characters;
        // Create containers once
        _this.container = new pixi_js_1.Container();
        _this.backgroundContainer = new pixi_js_1.Container();
        _this.headerContainer = new pixi_js_1.Container();
        _this.lineupContainer = new pixi_js_1.Container();
        _this.poolContainer = new pixi_js_1.Container();
        _this.buttonContainer = new pixi_js_1.Container();
        _this.addChild(_this.container);
        _this.container.addChild(_this.backgroundContainer, _this.headerContainer, _this.lineupContainer, _this.poolContainer, _this.buttonContainer);
        // Create UI once
        _this.initializeUI();
        return _this;
    }
    // Utility: Clean up any floating/dragged card and any card that is a direct child of the scene
    LineupScene.prototype.cleanUpFloatingCards = function () {
        var _this = this;
        if (this.dragTarget && this.dragTarget.parent) {
            this.dragTarget.parent.removeChild(this.dragTarget);
            this.dragTarget.destroy({ children: true });
            this.dragTarget = null;
        }
        this.children
            .filter(function (child) {
            return child &&
                child.label === undefined &&
                typeof child.destroy === "function";
        })
            .forEach(function (child) {
            _this.removeChild(child);
            child.destroy({ children: true });
        });
    };
    LineupScene.prototype.initializeUI = function () {
        this.createBackground();
        this.createHeader();
        this.createLineupGrid();
        this.createCharacterPool();
        this.createActionButtons();
    };
    LineupScene.prototype.resize = function (width, height) {
        this.gameWidth = width;
        this.gameHeight = height;
        // Update UI layout without recreating
        this.updateLayout();
    };
    LineupScene.prototype.updateLayout = function () {
        // Clear and recreate layout - this is more efficient than destroying/recreating all elements
        this.backgroundContainer.removeChildren();
        this.headerContainer.removeChildren();
        this.lineupContainer.removeChildren();
        this.poolContainer.removeChildren();
        this.buttonContainer.removeChildren();
        // Recreate layout with current dimensions
        this.createBackground();
        this.createHeader();
        this.createLineupGrid();
        this.createCharacterPool();
        this.createActionButtons();
    };
    LineupScene.prototype.createBackground = function () {
        var bg = new pixi_js_1.Graphics();
        var backgroundGradient = colors_1.Gradients.createBackgroundGradient(this.gameWidth, this.gameHeight);
        bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(backgroundGradient);
        // Battle field grid lines with orange theme
        var gridSpacing = 40;
        var grid = new pixi_js_1.Graphics();
        grid.stroke({ width: 1, color: colors_1.Colors.BACKGROUND_SECONDARY, alpha: 0.3 });
        for (var x = 0; x <= this.gameWidth; x += gridSpacing) {
            grid.moveTo(x, 0);
            grid.lineTo(x, this.gameHeight);
        }
        for (var y = 0; y <= this.gameHeight; y += gridSpacing) {
            grid.moveTo(0, y);
            grid.lineTo(this.gameWidth, y);
        }
        this.backgroundContainer.addChild(bg, grid);
    };
    LineupScene.prototype.createHeader = function () {
        var title = this.createTitle('Battle Lineup', this.gameWidth / 2, 60);
        title.anchor.set(0.5, 0.5);
        title.x = this.gameWidth / 2;
        title.y = 60;
        var subtitle = new pixi_js_1.Text({
            text: 'Drag to swap positions in lineup. Click to move between lineup and pool.',
            style: {
                fontFamily: 'Kalam',
                fontSize: 16,
                fill: colors_1.Colors.TEXT_SECONDARY,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: this.gameWidth - 40
            }
        });
        subtitle.anchor.set(0.5, 0.5);
        subtitle.x = this.gameWidth / 2;
        subtitle.y = 100;
        this.headerContainer.addChild(title, subtitle);
    };
    LineupScene.prototype.createLineupGrid = function () {
        this.lineupContainer.label = 'lineupContainer';
        // Lineup positions (single row of 3) with standard spacing
        var cols = 3;
        var availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
        var layout = this.calculateThreeCardsLayout(availableWidth, this.STANDARD_SPACING);
        var slotSize = Math.min(layout.itemWidth, 120); // Cap at 120px to maintain reasonable size
        var gridWidth = cols * slotSize + (cols - 1) * this.STANDARD_SPACING;
        var startX = (this.gameWidth - gridWidth) / 2;
        var startY = 150;
        this.lineupSlotHitBoxes = [];
        for (var col = 0; col < cols; col++) {
            var positionIndex = col;
            var x = col * (slotSize + this.STANDARD_SPACING);
            var y = 0;
            this.lineupSlotHitBoxes.push({ index: positionIndex, x: startX + x, y: startY + y, size: slotSize });
            var slot = this.createLineupSlot(x, y, slotSize, positionIndex);
            this.lineupContainer.addChild(slot);
            // Add character if present
            var character = this.lineupPositions[positionIndex];
            if (character) {
                var characterCard = this.createLineupCharacterCard(character, x, y, slotSize, positionIndex);
                this.lineupContainer.addChild(characterCard);
            }
        }
        // Center the grid container horizontally
        this.lineupContainer.x = startX;
        this.lineupContainer.y = startY;
        app_1.app.stage.eventMode = 'static';
        app_1.app.stage.on('pointerup', this.onDragEnd, this);
        app_1.app.stage.on('pointerupoutside', this.onDragEnd, this);
        app_1.app.stage.hitArea = app_1.app.screen;
    };
    LineupScene.prototype.createLineupSlot = function (x, y, size, positionIndex) {
        var slot = new pixi_js_1.Container();
        var bg = new pixi_js_1.Graphics();
        bg.roundRect(0, 0, size, size, 8)
            .fill({ color: colors_1.Colors.BACKGROUND_SECONDARY, alpha: 0.5 })
            .stroke({ width: 2, color: colors_1.Colors.BUTTON_PRIMARY, alpha: 0.8 });
        var positionText = new pixi_js_1.Text({
            text: "".concat(positionIndex + 1),
            style: {
                fontFamily: 'Kalam',
                fontSize: 24,
                fill: colors_1.Colors.BUTTON_PRIMARY,
                align: 'center'
            }
        });
        positionText.anchor.set(0.5);
        positionText.x = size / 2;
        positionText.y = size / 2;
        slot.addChild(bg, positionText);
        slot.x = x;
        slot.y = y;
        slot.interactive = true;
        slot.zIndex = 0;
        slot.eventMode = 'static';
        return slot;
    };
    LineupScene.prototype.createLineupCharacterCard = function (character, x, y, size, positionIndex) {
        var card = this.createHeroCard(character, x, y, 'lineup', positionIndex);
        this.makeLineupCardInteractive(card, character, positionIndex);
        card.zIndex = 1;
        return card;
    };
    LineupScene.prototype.createCharacterPool = function () {
        var _this = this;
        this.poolContainer.label = 'characterPool';
        // Calculate available area - lineup is now single row instead of 2x2
        var poolTop = 150 + 120 + 2 * this.STANDARD_SPACING; // lineup grid bottom (single row height)
        var actionButtonHeight = 50;
        var actionButtonY = this.gameHeight - 80;
        var poolBottom = actionButtonY - this.STANDARD_SPACING * 2;
        var poolHeight = poolBottom - poolTop;
        var poolWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
        var cardHeight = 80;
        var spacing = this.STANDARD_SPACING;
        var padding = this.STANDARD_PADDING; // Use for left/right padding
        var marginTop = 45;
        // Calculate cards per row - force 3 cards per row for character pool
        var layout = this.calculateThreeCardsLayout(poolWidth - 2 * padding, spacing);
        var cardWidth = layout.itemWidth;
        var cardsPerRow = layout.itemsPerRow;
        // Background
        var poolBg = new pixi_js_1.Graphics();
        poolBg.roundRect(0, 0, poolWidth, poolHeight, 12)
            .fill({ color: colors_1.Colors.PANEL_BACKGROUND, alpha: 0.8 })
            .stroke({ width: 2, color: colors_1.Colors.BUTTON_PRIMARY });
        // Title
        var poolTitle = new pixi_js_1.Text({
            text: 'Available Characters',
            style: {
                fontFamily: 'Kalam',
                fontSize: 18,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY
            }
        });
        poolTitle.x = padding;
        poolTitle.y = 15;
        // ScrollBox for vertical scrolling
        var scrollBox = new ui_1.ScrollBox({
            width: poolWidth,
            height: poolHeight - marginTop,
        });
        scrollBox.x = 0;
        scrollBox.y = marginTop;
        // Content container for cards
        var content = new pixi_js_1.Container();
        this.availableCharacters.forEach(function (character, index) {
            var col = index % cardsPerRow;
            var row = Math.floor(index / cardsPerRow);
            // Start from left padding
            var x = padding + col * (cardWidth + spacing);
            var y = row * (cardHeight + spacing);
            var characterCard = _this.createPoolCharacterCard(character, x, y);
            characterCard.width = cardWidth;
            characterCard.height = cardHeight;
            content.addChild(characterCard);
        });
        // Set content height for scrolling
        var totalRows = Math.ceil(this.availableCharacters.length / cardsPerRow);
        content.height = totalRows * (cardHeight + spacing);
        scrollBox.addItem(content);
        this.poolContainer.addChild(poolBg, poolTitle, scrollBox);
        // Align pool to fit screen
        this.poolContainer.x = this.STANDARD_PADDING;
        this.poolContainer.y = poolTop;
    };
    LineupScene.prototype.createPoolCharacterCard = function (character, x, y) {
        var _this = this;
        var card = this.createHeroCard(character, x, y, 'pool');
        card.interactive = true;
        card.cursor = 'pointer';
        card.on('pointertap', function () {
            _this.cleanUpFloatingCards();
            var emptyIndex = _this.lineupPositions.findIndex(function (pos) { return pos === null; });
            if (emptyIndex !== -1) {
                _this.lineupPositions[emptyIndex] = character;
                _this.availableCharacters = _this.availableCharacters.filter(function (c) { return c !== character; });
                _this.refreshLineup();
            }
            else {
                alert('No available slot in lineup!');
            }
        });
        return card;
    };
    LineupScene.prototype.makeLineupCardInteractive = function (card, character, currentPosition) {
        var _this = this;
        card.interactive = true;
        card.cursor = 'pointer';
        card.on('pointerdown', function (event) { return _this.onDragStart(event, card, character, currentPosition); });
    };
    LineupScene.prototype.onDragStart = function (event, card, character, currentPosition) {
        var _a, _b;
        card.alpha = 0.5;
        this.dragTarget = card;
        // Calculate and store drag offset
        var globalCardPos = (_a = card.parent) === null || _a === void 0 ? void 0 : _a.toGlobal({ x: card.x, y: card.y });
        this.dragOffset = {
            x: event.global.x - ((globalCardPos === null || globalCardPos === void 0 ? void 0 : globalCardPos.x) || 0),
            y: event.global.y - ((globalCardPos === null || globalCardPos === void 0 ? void 0 : globalCardPos.y) || 0)
        };
        // Move card to top layer (app.stage) for dragging above all
        var globalPos = (_b = card.parent) === null || _b === void 0 ? void 0 : _b.toGlobal({ x: card.x, y: card.y });
        if (card.parent) {
            card.parent.removeChild(card);
        }
        app_1.app.stage.addChild(card);
        if (globalPos) {
            card.position.set(globalPos.x, globalPos.y);
        }
        // Attach pointermove to stage
        app_1.app.stage.on('pointermove', this.onDragMove, this);
    };
    LineupScene.prototype.onDragMove = function (event) {
        if (this.dragTarget) {
            // Use dragOffset to keep the pointer at the same relative position on the card
            var parent_1 = this.dragTarget.parent;
            if (parent_1) {
                var newPos = parent_1.toLocal({
                    x: event.global.x - this.dragOffset.x,
                    y: event.global.y - this.dragOffset.y
                });
                this.dragTarget.position.set(newPos.x, newPos.y);
                this.isDragging = true;
            }
        }
    };
    LineupScene.prototype.onDragEnd = function (event) {
        var _this = this;
        var _a, _b;
        if (!this.dragTarget)
            return;
        // Restore card appearance
        this.dragTarget.alpha = 1;
        // Get pointer position
        var pointer = (_a = event === null || event === void 0 ? void 0 : event.global) !== null && _a !== void 0 ? _a : app_1.app.renderer.events.pointer.global;
        // Find which slot (if any) the pointer is over
        var targetSlotIndex = null;
        for (var _i = 0, _c = this.lineupSlotHitBoxes; _i < _c.length; _i++) {
            var slot = _c[_i];
            if (pointer.x >= slot.x && pointer.x <= slot.x + slot.size &&
                pointer.y >= slot.y && pointer.y <= slot.y + slot.size) {
                targetSlotIndex = slot.index;
                break;
            }
        }
        // Find the original slot index of the dragged card
        var originalSlotIndex = null;
        for (var i = 0; i < this.lineupPositions.length; i++) {
            var slotChar = this.lineupPositions[i];
            if (slotChar &&
                this.dragTarget &&
                slotChar.id === ((_b = this.dragTarget.character) === null || _b === void 0 ? void 0 : _b.id)) {
                originalSlotIndex = i;
                break;
            }
        }
        if (this.isDragging) {
            // If dropped on a different slot, swap
            if (targetSlotIndex !== null &&
                originalSlotIndex !== null &&
                targetSlotIndex !== originalSlotIndex) {
                var temp = this.lineupPositions[originalSlotIndex];
                this.lineupPositions[originalSlotIndex] = this.lineupPositions[targetSlotIndex];
                this.lineupPositions[targetSlotIndex] = temp;
                this.refreshLineup();
            }
            else {
                // Snap back to original position if not swapped
                if (this.dragTarget.parent) {
                    this.refreshLineup();
                }
            }
        }
        else if (originalSlotIndex !== null) {
            // Not a drag: treat as click, move to Character pool
            this.lineupPositions[originalSlotIndex] = null;
            if (!this.availableCharacters.find(function (c) { var _a; return c.id === ((_a = _this.dragTarget.character) === null || _a === void 0 ? void 0 : _a.id); })) {
                this.availableCharacters.push(this.dragTarget.character);
            }
            this.refreshLineup();
        }
        this.isDragging = false;
        app_1.app.stage.off('pointermove', this.onDragMove, this);
        this.dragTarget = null;
    };
    LineupScene.prototype.refreshLineup = function () {
        this.cleanUpFloatingCards();
        // Clear and recreate only lineup and pool containers
        this.lineupContainer.removeChildren();
        this.poolContainer.removeChildren();
        this.createLineupGrid();
        this.createCharacterPool();
    };
    LineupScene.prototype.createActionButtons = function () {
        var _this = this;
        var buttonWidth = Math.min(130, (this.gameWidth - 4 * this.STANDARD_PADDING) / 3); // Reduced from 150 and made responsive
        var buttonHeight = Math.max(40, Math.min(46, this.gameHeight * 0.07)); // Responsive height
        var buttonCount = 3;
        // Calculate total width for all buttons with standard spacing
        var totalWidth = buttonWidth * buttonCount + this.STANDARD_SPACING * (buttonCount - 1);
        var startX = (this.gameWidth - totalWidth) / 2;
        var y = this.gameHeight - buttonHeight - this.STANDARD_PADDING; // Use calculated height
        // Back button - positioned separately at left with standard padding
        var backButton = this.createButton('← Back to Home', this.STANDARD_PADDING, y, buttonWidth, buttonHeight, function () { return navigation_1.navigation.showScreen(HomeScene_1.HomeScene); }, 14 // Added base font size
        );
        // Save button - centered
        var saveButton = this.createButton('Save Lineup', startX + buttonWidth + this.STANDARD_SPACING, y, buttonWidth, buttonHeight, function () {
            // Convert Character objects back to string IDs for saving
            alert('Lineup saved successfully!');
        }, 14 // Added base font size
        );
        // Auto button - centered
        var autoButton = this.createButton('Auto', startX + (buttonWidth + this.STANDARD_SPACING) * 2, y, buttonWidth, buttonHeight, function () {
            // Fill empty slots in lineup with available characters
            var available = __spreadArray([], _this.availableCharacters, true);
            _this.lineupPositions = _this.lineupPositions.map(function (pos) {
                if (pos)
                    return pos;
                return available.shift() || null;
            });
            _this.refreshLineup();
        });
        this.buttonContainer.addChild(backButton, saveButton, autoButton);
    };
    return LineupScene;
}(BaseScene_1.BaseScene));
exports.LineupScene = LineupScene;
