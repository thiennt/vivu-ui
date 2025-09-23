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
exports.CharacterDetailScene = void 0;
var pixi_js_1 = require("pixi.js");
var navigation_1 = require("@/utils/navigation");
var HomeScene_1 = require("./HomeScene");
var BaseScene_1 = require("@/utils/BaseScene");
var CharactersScene_1 = require("./CharactersScene");
var api_1 = require("@/services/api");
var loadingStateManager_1 = require("@/utils/loadingStateManager");
var colors_1 = require("@/utils/colors");
var LearnSkillPopup_1 = require("@/popups/LearnSkillPopup");
var SkillChangePopup_1 = require("@/popups/SkillChangePopup");
var EquipmentChangePopup_1 = require("@/popups/EquipmentChangePopup");
var SkillDetailPopup_1 = require("@/popups/SkillDetailPopup");
var CharacterDetailScene = /** @class */ (function (_super) {
    __extends(CharacterDetailScene, _super);
    function CharacterDetailScene(params) {
        var _this = _super.call(this) || this;
        _this.character = null;
        _this.characterSkills = [];
        _this.character = (params === null || params === void 0 ? void 0 : params.selectedCharacter) || null;
        // Create containers once
        _this.container = new pixi_js_1.Container();
        _this.backgroundContainer = new pixi_js_1.Container();
        _this.headerContainer = new pixi_js_1.Container();
        _this.infoContainer = new pixi_js_1.Container();
        _this.statsContainer = new pixi_js_1.Container();
        _this.skillsContainer = new pixi_js_1.Container();
        _this.equipmentContainer = new pixi_js_1.Container();
        _this.buttonContainer = new pixi_js_1.Container();
        _this.addChild(_this.container);
        _this.container.addChild(_this.backgroundContainer, _this.headerContainer, _this.infoContainer, _this.statsContainer, _this.skillsContainer, _this.equipmentContainer, _this.buttonContainer);
        // Initialize loading manager
        _this.loadingManager = new loadingStateManager_1.LoadingStateManager(_this.container, _this.gameWidth, _this.gameHeight);
        // Load character data and create UI
        _this.loadCharacterData();
        return _this;
    }
    CharacterDetailScene.prototype.loadCharacterData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.character) {
                            navigation_1.navigation.showScreen(HomeScene_1.HomeScene);
                            return [2 /*return*/];
                        }
                        this.loadingManager.showLoading();
                        // Load character skills
                        _a = this;
                        return [4 /*yield*/, api_1.charactersApi.getCharacter(this.character.id)];
                    case 1:
                        // Load character skills
                        _a.character = _b.sent();
                        this.characterSkills = this.character.character_skills || [];
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
    CharacterDetailScene.prototype.initializeUI = function () {
        if (!this.character) {
            navigation_1.navigation.showScreen(HomeScene_1.HomeScene);
            return;
        }
        this.createBackground();
        this.createHeader();
        this.createCharacterInfo();
        this.createStatsDisplay();
        this.createSkillsDisplay();
        this.createEquipmentDisplay();
        this.createBackButton();
    };
    CharacterDetailScene.prototype.resize = function (width, height) {
        this.gameWidth = width;
        this.gameHeight = height;
        // Update loading manager dimensions
        this.loadingManager.updateDimensions(width, height);
        if (!this.character) {
            navigation_1.navigation.showScreen(HomeScene_1.HomeScene);
            return;
        }
        // Update UI layout without recreating
        this.updateLayout();
    };
    CharacterDetailScene.prototype.updateLayout = function () {
        // Clear and recreate layout - this is more efficient than destroying/recreating all elements
        this.backgroundContainer.removeChildren();
        this.headerContainer.removeChildren();
        this.infoContainer.removeChildren();
        this.statsContainer.removeChildren();
        this.skillsContainer.removeChildren();
        this.equipmentContainer.removeChildren();
        this.buttonContainer.removeChildren();
        // Recreate layout with current dimensions
        this.createBackground();
        this.createHeader();
        this.createCharacterInfo();
        this.createStatsDisplay();
        this.createSkillsDisplay();
        this.createEquipmentDisplay();
        this.createBackButton();
    };
    CharacterDetailScene.prototype.createBackground = function () {
        var bg = new pixi_js_1.Graphics();
        bg.fill(colors_1.Colors.BACKGROUND_PRIMARY).rect(0, 0, this.gameWidth, this.gameHeight);
        this.backgroundContainer.addChild(bg);
    };
    CharacterDetailScene.prototype.createHeader = function () {
        var title = this.createTitle(this.character.name, this.gameWidth / 2, 60);
        this.headerContainer.addChild(title);
    };
    CharacterDetailScene.prototype.createCharacterInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var padding, panelWidth, headerPanelContainer, headerPanel, avatarSize, avatar, avatarTexture, avatarIcon, nameText, coreStats, statWidth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        padding = 15;
                        panelWidth = this.gameWidth - 2 * padding;
                        headerPanelContainer = new pixi_js_1.Container();
                        headerPanel = new pixi_js_1.Graphics();
                        headerPanel.roundRect(0, 0, panelWidth, 120, 12)
                            .fill({ color: colors_1.Colors.PANEL_BACKGROUND, alpha: 0.9 })
                            .stroke({ width: 3, color: colors_1.Colors.BUTTON_PRIMARY });
                        avatarSize = 80;
                        avatar = new pixi_js_1.Graphics();
                        avatar.roundRect(padding, 20, avatarSize, avatarSize, 8)
                            .fill({ color: this.getRarityColor(this.character.rarity), alpha: 0.8 })
                            .stroke({ width: 2, color: colors_1.Colors.BUTTON_PRIMARY });
                        return [4 /*yield*/, pixi_js_1.Assets.load(this.character.avatar_url || 'https://pixijs.com/assets/bunny.png')];
                    case 1:
                        avatarTexture = _a.sent();
                        avatarIcon = new pixi_js_1.Sprite(avatarTexture);
                        avatarIcon.width = avatarSize - 10;
                        avatarIcon.height = avatarSize - 10;
                        avatarIcon.anchor.set(0.5);
                        avatarIcon.x = padding + avatarSize / 2;
                        avatarIcon.y = 20 + avatarSize / 2;
                        nameText = new pixi_js_1.Text({
                            text: this.character.name,
                            style: {
                                fontFamily: 'Kalam',
                                fontSize: 28,
                                fontWeight: 'bold',
                                fill: colors_1.Colors.TEXT_PRIMARY
                            }
                        });
                        nameText.x = padding + avatarSize + 20;
                        nameText.y = 25;
                        headerPanelContainer.addChild(headerPanel, avatar, avatarIcon, nameText);
                        coreStats = [
                            { name: '❤️', value: this.character.hp, color: 0x4caf50 },
                            { name: '⚔️', value: this.character.atk, color: 0xf44336 },
                            { name: '🛡️', value: this.character.def, color: 0x2196f3 },
                            { name: '⚡', value: this.character.agi, color: 0xffeb3b }
                        ];
                        statWidth = (panelWidth - 2 * padding - avatar.width) / 4;
                        coreStats.forEach(function (stat, index) {
                            var x = padding + avatarSize + 20 + (index * statWidth);
                            // Stat name
                            var statNameText = new pixi_js_1.Text({
                                text: stat.name,
                                style: {
                                    fontFamily: 'Kalam',
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    fill: colors_1.Colors.TEXT_SECONDARY
                                }
                            });
                            statNameText.x = x;
                            statNameText.y = 60;
                            // Stat value
                            var valueText = new pixi_js_1.Text({
                                text: stat.value.toString(),
                                style: {
                                    fontFamily: 'Kalam',
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                    fill: stat.color
                                }
                            });
                            valueText.x = x;
                            valueText.y = 80;
                            headerPanelContainer.addChild(statNameText, valueText);
                        });
                        this.infoContainer.x = padding;
                        this.infoContainer.y = 120;
                        this.infoContainer.addChild(headerPanelContainer);
                        return [2 /*return*/];
                }
            });
        });
    };
    CharacterDetailScene.prototype.createStatsDisplay = function () {
        var padding = 15;
        var panelWidth = this.gameWidth - 2 * padding;
        // Other Stats Section
        var otherStatsContainer = new pixi_js_1.Container();
        var otherStatsHeight = 120;
        var otherStatsPanel = new pixi_js_1.Graphics();
        otherStatsPanel.roundRect(0, 0, panelWidth, otherStatsHeight, 12)
            .fill({ color: colors_1.Colors.PANEL_BACKGROUND, alpha: 0.9 })
            .stroke({ width: 3, color: colors_1.Colors.BUTTON_PRIMARY });
        otherStatsContainer.addChild(otherStatsPanel);
        // Other stats in grid layout
        var otherStats = [
            { name: 'CritRate', value: this.character.crit_rate + '%', color: 0xff9800 },
            { name: 'CritDmg', value: this.character.crit_dmg + '%', color: 0x9c27b0 },
            { name: 'Res', value: this.character.res, color: 0x607d8b },
            { name: 'Damage', value: this.character.damage, color: 0xff5722 },
            { name: 'Mitig', value: this.character.mitigation, color: 0x795548 },
            { name: 'Hit', value: this.character.hit_rate, color: 0x4caf50 },
            { name: 'Dodge', value: this.character.dodge, color: 0x9e9e9e }
        ];
        var colWidth = (panelWidth - 2 * padding) / 3;
        var rowHeight = 35;
        otherStats.forEach(function (stat, index) {
            var col = index % 3;
            var row = Math.floor(index / 3);
            var x = padding + (col * colWidth);
            var y = 20 + (row * rowHeight);
            // Stat name and value on same line
            var statText = new pixi_js_1.Text({
                text: "".concat(stat.name, ": ").concat(stat.value),
                style: {
                    fontFamily: 'Kalam',
                    fontSize: 14,
                    fill: stat.color
                }
            });
            statText.x = x;
            statText.y = y;
            otherStatsContainer.addChild(statText);
        });
        // Position both panels vertically
        var startY = 260; // Below info panel
        this.statsContainer.x = padding;
        this.statsContainer.y = startY;
        this.statsContainer.addChild(otherStatsContainer);
    };
    CharacterDetailScene.prototype.createSkillsDisplay = function () {
        var _this = this;
        var padding = 15;
        var panelWidth = this.gameWidth - 2 * padding;
        var panelHeight = 180; // Reduced height since we're only showing skill names
        // Skills panel background
        var skillsPanel = new pixi_js_1.Graphics();
        skillsPanel.roundRect(0, 0, panelWidth, panelHeight, 12)
            .fill({ color: colors_1.Colors.PANEL_BACKGROUND, alpha: 0.9 })
            .stroke({ width: 3, color: colors_1.Colors.BUTTON_PRIMARY });
        // Title
        var title = new pixi_js_1.Text({
            text: 'Skills:',
            style: {
                fontFamily: 'Kalam',
                fontSize: 18,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY
            }
        });
        title.x = padding;
        title.y = 15;
        this.skillsContainer.addChild(skillsPanel, title);
        // Define all skill types that should always be shown
        var skillTypes = [
            { type: 'normal_attack', label: 'Normal', color: 0x9e9e9e },
            { type: 'active_skill', label: 'Active', color: 0x2196f3 },
            { type: 'passive_skill', label: 'Passive', color: 0x4caf50 }
        ];
        // Skills layout - always show 3 skill types
        var y = 50;
        skillTypes.forEach(function (skillType) {
            // Find existing skill of this type
            var charSkill = _this.characterSkills.find(function (cs) {
                return cs && cs.skill && cs.skill.skill_type === skillType.type;
            });
            // Badge background
            var badge = new pixi_js_1.Graphics();
            badge.roundRect(padding, y - 5, 70, 20, 4)
                .fill({ color: skillType.color, alpha: 0.8 })
                .stroke({ width: 1, color: colors_1.Colors.TEXT_WHITE });
            // Badge text
            var badgeText = new pixi_js_1.Text({
                text: skillType.label,
                style: {
                    fontFamily: 'Kalam',
                    fontSize: 10,
                    fontWeight: 'bold',
                    fill: colors_1.Colors.TEXT_WHITE
                }
            });
            badgeText.anchor.set(0.5);
            badgeText.x = padding + 35;
            badgeText.y = y + 5;
            if (charSkill && charSkill.skill) {
                // Skill exists - show skill name only (no description)
                var skill_1 = charSkill.skill;
                // Create a container for the skill to make it clickable
                var skillContainer = new pixi_js_1.Container();
                // Skill name - made clickable to show details
                var skillName_1 = new pixi_js_1.Text({
                    text: skill_1.name,
                    style: {
                        fontFamily: 'Kalam',
                        fontSize: 14,
                        fontWeight: 'bold',
                        fill: colors_1.Colors.TEXT_PRIMARY
                    }
                });
                skillName_1.x = padding + 80;
                skillName_1.y = y;
                // Make skill name clickable to show detail popup
                skillName_1.interactive = true;
                skillName_1.cursor = 'pointer';
                skillName_1.on('pointerdown', function () {
                    _this.showSkillDetailPopup(skill_1);
                });
                // Add hover effect for skill name
                skillName_1.on('pointerover', function () {
                    skillName_1.style.fill = colors_1.Colors.BUTTON_PRIMARY;
                });
                skillName_1.on('pointerout', function () {
                    skillName_1.style.fill = colors_1.Colors.TEXT_PRIMARY;
                });
                // Add change skill button for active and passive skills
                if (skillType.type === 'active_skill' || skillType.type === 'passive_skill') {
                    var changeButton = new pixi_js_1.Container();
                    var buttonBg = new pixi_js_1.Graphics();
                    buttonBg.roundRect(0, 0, 60, 18, 4) // Reduced button size
                        .fill({ color: colors_1.Colors.BUTTON_HOVER, alpha: 0.7 })
                        .stroke({ width: 1, color: colors_1.Colors.BUTTON_BORDER });
                    var buttonText = new pixi_js_1.Text({
                        text: 'Change',
                        style: {
                            fontFamily: 'Kalam',
                            fontSize: 9, // Reduced font size
                            fill: colors_1.Colors.TEXT_BUTTON
                        }
                    });
                    buttonText.anchor.set(0.5);
                    buttonText.x = 30;
                    buttonText.y = 9;
                    changeButton.addChild(buttonBg, buttonText);
                    changeButton.x = panelWidth - padding - 70;
                    changeButton.y = y - 1;
                    // Make change button interactive
                    changeButton.interactive = true;
                    changeButton.cursor = 'pointer';
                    changeButton.on('pointerdown', function () {
                        _this.showSkillChangeDialog(skillType.type, skill_1);
                    });
                    skillContainer.addChild(changeButton);
                }
                skillContainer.addChild(skillName_1);
                _this.skillsContainer.addChild(badge, badgeText, skillContainer);
            }
            else {
                // Skill slot is empty - show learn option
                var emptyText = new pixi_js_1.Text({
                    text: '(Empty)',
                    style: {
                        fontFamily: 'Kalam',
                        fontSize: 14,
                        fontStyle: 'italic',
                        fill: colors_1.Colors.TEXT_TERTIARY
                    }
                });
                emptyText.x = padding + 80;
                emptyText.y = y;
                // Learn skill button
                var learnButton = new pixi_js_1.Container();
                var buttonBg = new pixi_js_1.Graphics();
                buttonBg.roundRect(0, 0, 70, 18, 4) // Reduced button size
                    .fill({ color: colors_1.Colors.BUTTON_PRIMARY, alpha: 0.7 })
                    .stroke({ width: 1, color: colors_1.Colors.BUTTON_BORDER });
                var buttonText = new pixi_js_1.Text({
                    text: 'Learn Skill',
                    style: {
                        fontFamily: 'Kalam',
                        fontSize: 9, // Reduced font size
                        fill: colors_1.Colors.TEXT_BUTTON
                    }
                });
                buttonText.anchor.set(0.5);
                buttonText.x = 35;
                buttonText.y = 9;
                learnButton.addChild(buttonBg, buttonText);
                learnButton.x = padding + 80 + emptyText.width + 10;
                learnButton.y = y - 1;
                // Make learn button interactive
                learnButton.interactive = true;
                learnButton.cursor = 'pointer';
                learnButton.on('pointerdown', function () {
                    _this.showLearnSkillDialog(skillType.type);
                });
                _this.skillsContainer.addChild(badge, badgeText, emptyText, learnButton);
            }
            y += 40; // Reduced spacing since we removed descriptions
        });
        this.skillsContainer.x = padding;
        this.skillsContainer.y = 400; // Below stats sections
    };
    CharacterDetailScene.prototype.showSkillDetailPopup = function (skill) {
        navigation_1.navigation.presentPopup(/** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super.call(this, {
                    skill: skill
                }) || this;
            }
            return class_1;
        }(SkillDetailPopup_1.SkillDetailPopup)));
    };
    CharacterDetailScene.prototype.showLearnSkillDialog = function (skillType) {
        var self = this;
        navigation_1.navigation.presentPopup(/** @class */ (function (_super) {
            __extends(class_2, _super);
            function class_2() {
                return _super.call(this, {
                    skillType: skillType,
                    onSkillSelected: function (skillType, skill) {
                        self.learnSkill(skillType, skill);
                    }
                }) || this;
            }
            return class_2;
        }(LearnSkillPopup_1.LearnSkillPopup)));
    };
    CharacterDetailScene.prototype.learnSkill = function (skillType, skill) {
        // This is where you would add the skill to the character
        // For now, just log and refresh the display
        console.log("Learned ".concat(skillType, ": ").concat(skill.name));
        // Update the skills display
        this.skillsContainer.removeChildren();
        this.createSkillsDisplay();
    };
    CharacterDetailScene.prototype.showSkillChangeDialog = function (skillType, currentSkill) {
        var self = this;
        navigation_1.navigation.presentPopup(/** @class */ (function (_super) {
            __extends(class_3, _super);
            function class_3() {
                return _super.call(this, {
                    skillType: skillType,
                    currentSkill: currentSkill,
                    onSkillSelected: function (skillType, skill) {
                        self.changeSkill(skillType, skill);
                    }
                }) || this;
            }
            return class_3;
        }(SkillChangePopup_1.SkillChangePopup)));
    };
    CharacterDetailScene.prototype.changeSkill = function (skillType, skill) {
        // This is where you would update the character's skill
        // For now, just log and refresh the display
        console.log("Changed ".concat(skillType, " to ").concat(skill.name));
        // Update the skills display
        this.skillsContainer.removeChildren();
        this.createSkillsDisplay();
    };
    CharacterDetailScene.prototype.createEquipmentDisplay = function () {
        var _this = this;
        var padding = 15;
        var panelWidth = this.gameWidth - 2 * padding;
        var panelHeight = 100;
        // Equipment panel background
        var equipmentPanel = new pixi_js_1.Graphics();
        equipmentPanel.roundRect(0, 0, panelWidth, panelHeight, 12)
            .fill({ color: colors_1.Colors.PANEL_BACKGROUND, alpha: 0.9 })
            .stroke({ width: 3, color: colors_1.Colors.BUTTON_PRIMARY });
        // Title
        var title = new pixi_js_1.Text({
            text: 'Equipment:',
            style: {
                fontFamily: 'Kalam',
                fontSize: 18,
                fontWeight: 'bold',
                fill: colors_1.Colors.TEXT_PRIMARY
            }
        });
        title.x = padding;
        title.y = 15;
        this.equipmentContainer.addChild(equipmentPanel, title);
        // Equipment slots
        var equipmentSlots = [
            { name: 'Weapon', item: 'Sword', type: 'weapon' },
            { name: 'Armor', item: 'Plate', type: 'armor' },
            { name: 'Accessory', item: '(empty)', type: 'accessory' }
        ];
        var slotWidth = (panelWidth - 2 * padding) / 3;
        equipmentSlots.forEach(function (slot, index) {
            var x = padding + (index * slotWidth);
            var y = 45;
            // Create equipment slot container for click handling
            var slotContainer = new pixi_js_1.Container();
            // Slot background
            var slotBg = new pixi_js_1.Graphics();
            slotBg.roundRect(0, 0, slotWidth - 10, 40, 6)
                .fill({ color: slot.item === '(empty)' ? 0x424242 : colors_1.Colors.BUTTON_BORDER, alpha: 0.8 })
                .stroke({ width: 1, color: colors_1.Colors.BUTTON_PRIMARY });
            // Slot type label
            var slotLabel = new pixi_js_1.Text({
                text: "[".concat(slot.name, "]"),
                style: {
                    fontFamily: 'Kalam',
                    fontSize: 12,
                    fontWeight: 'bold',
                    fill: colors_1.Colors.TEXT_SECONDARY
                }
            });
            slotLabel.x = 5;
            slotLabel.y = 5;
            // Item name
            var itemText = new pixi_js_1.Text({
                text: slot.item,
                style: {
                    fontFamily: 'Kalam',
                    fontSize: 14,
                    fill: slot.item === '(empty)' ? colors_1.Colors.TEXT_TERTIARY : colors_1.Colors.TEXT_PRIMARY
                }
            });
            itemText.x = 5;
            itemText.y = 22;
            slotContainer.addChild(slotBg, slotLabel, itemText);
            slotContainer.x = x;
            slotContainer.y = y;
            // Make equipment slot interactive
            slotContainer.interactive = true;
            slotContainer.cursor = 'pointer';
            slotContainer.on('pointerdown', function () {
                _this.showEquipmentChangeDialog(slot.type, slot.name, slot.item);
            });
            // Add hover effect
            slotContainer.on('pointerover', function () {
                slotBg.tint = 0xcccccc;
            });
            slotContainer.on('pointerout', function () {
                slotBg.tint = 0xffffff;
            });
            _this.equipmentContainer.addChild(slotContainer);
        });
        this.equipmentContainer.x = padding;
        this.equipmentContainer.y = 600; // Adjusted for smaller skills panel (reduced from 655)
    };
    CharacterDetailScene.prototype.showEquipmentChangeDialog = function (equipmentType, slotName, currentItem) {
        var self = this;
        navigation_1.navigation.presentPopup(/** @class */ (function (_super) {
            __extends(class_4, _super);
            function class_4() {
                return _super.call(this, {
                    equipmentType: equipmentType,
                    slotName: slotName,
                    currentItem: currentItem,
                    onEquipmentSelected: function (equipmentType, slotName, equipment) {
                        self.equipItem(equipmentType, equipment);
                    }
                }) || this;
            }
            return class_4;
        }(EquipmentChangePopup_1.EquipmentChangePopup)));
    };
    CharacterDetailScene.prototype.equipItem = function (equipmentType, equipment) {
        // This is where you would update the character's equipment
        // For now, just refresh the display
        console.log("Equipped ".concat(equipment.name, " in ").concat(equipmentType, " slot"));
        // Update the equipment display
        this.equipmentContainer.removeChildren();
        this.createEquipmentDisplay();
    };
    CharacterDetailScene.prototype.getRarityColor = function (rarity) {
        var colors = {
            common: colors_1.Colors.RARITY_COMMON,
            uncommon: colors_1.Colors.RARITY_UNCOMMON,
            rare: colors_1.Colors.RARITY_RARE,
            epic: colors_1.Colors.RARITY_EPIC,
            legendary: colors_1.Colors.RARITY_LEGENDARY
        };
        return colors[rarity] || colors.common;
    };
    CharacterDetailScene.prototype.createBackButton = function () {
        // Responsive button sizing - improved for small screens
        var buttonWidth = Math.min(180, this.gameWidth - 2 * this.STANDARD_PADDING);
        var buttonHeight = Math.max(40, Math.min(46, this.gameHeight * 0.07));
        var backButton = this.createButton('← Back to Characters', this.STANDARD_PADDING, this.gameHeight - buttonHeight - this.STANDARD_PADDING, buttonWidth, buttonHeight, function () { return navigation_1.navigation.showScreen(CharactersScene_1.CharactersScene); }, 14 // Reduced base font size
        );
        this.buttonContainer.addChild(backButton);
    };
    CharacterDetailScene.prototype.update = function () {
        // No specific animations needed
    };
    /** Assets bundles required by this screen */
    CharacterDetailScene.assetBundles = [];
    return CharacterDetailScene;
}(BaseScene_1.BaseScene));
exports.CharacterDetailScene = CharacterDetailScene;
