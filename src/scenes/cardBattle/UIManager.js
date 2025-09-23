"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardBattleUIManager = void 0;
var pixi_js_1 = require("pixi.js");
var colors_1 = require("@/utils/colors");
/**
 * Manages UI creation and layout for the CardBattleScene
 */
var CardBattleUIManager = /** @class */ (function () {
    function CardBattleUIManager(scene) {
        this.scene = scene;
    }
    CardBattleUIManager.prototype.createBackground = function (container, gameWidth, availableHeight) {
        var bg = new pixi_js_1.Graphics();
        var backgroundGradient = colors_1.Gradients.createBackgroundGradient(gameWidth, availableHeight);
        bg.rect(0, 0, gameWidth, availableHeight).fill(backgroundGradient);
        container.addChild(bg);
    };
    CardBattleUIManager.prototype.createGameLayout = function (gameContainer, player1Container, player2Container, player1HandContainer, player2HandContainer, player1EnergyContainer, player2EnergyContainer, battleLogContainer, effectsContainer, gameWidth, availableHeight) {
        var padding = this.scene.STANDARD_PADDING;
        // Clear containers
        gameContainer.removeChildren();
        // Layout configuration
        var handHeight = 120;
        var energyAreaHeight = 60;
        var battleAreaHeight = availableHeight - 2 * handHeight - 2 * energyAreaHeight - 4 * padding;
        var battleLogHeight = Math.min(100, battleAreaHeight * 0.3);
        var characterAreaHeight = (battleAreaHeight - battleLogHeight - padding) / 2;
        // Position containers
        // Player 2 (top)
        player2HandContainer.x = 0;
        player2HandContainer.y = padding;
        player2EnergyContainer.x = 0;
        player2EnergyContainer.y = player2HandContainer.y + handHeight + padding;
        player2Container.x = 0;
        player2Container.y = player2EnergyContainer.y + energyAreaHeight + padding;
        // Battle log (center)
        battleLogContainer.x = 0;
        battleLogContainer.y = player2Container.y + characterAreaHeight + padding;
        // Player 1 (bottom)
        player1Container.x = 0;
        player1Container.y = battleLogContainer.y + battleLogHeight + padding;
        player1EnergyContainer.x = 0;
        player1EnergyContainer.y = player1Container.y + characterAreaHeight + padding;
        player1HandContainer.x = 0;
        player1HandContainer.y = player1EnergyContainer.y + energyAreaHeight + padding;
        // Effects container overlays everything
        effectsContainer.x = 0;
        effectsContainer.y = 0;
        // Add containers to game container
        gameContainer.addChild(player2HandContainer, player2Container, player2EnergyContainer, battleLogContainer, player1EnergyContainer, player1Container, player1HandContainer, effectsContainer);
    };
    CardBattleUIManager.prototype.createEnergyArea = function (container, playerNo, gameWidth) {
        container.removeChildren();
        var energyValue = playerNo === 1 ? 3 : 2; // Mock values
        var maxEnergy = 5;
        var padding = this.scene.STANDARD_PADDING;
        // Energy title
        var energyText = new pixi_js_1.Text({
            text: "Energy: ".concat(energyValue, "/").concat(maxEnergy),
            style: {
                fontFamily: 'Kalam',
                fontSize: 18,
                fill: colors_1.Colors.TEXT_PRIMARY,
                fontWeight: 'bold'
            }
        });
        energyText.x = padding;
        energyText.y = 10;
        // Energy orbs
        var orbSize = 20;
        var orbSpacing = 25;
        var startX = energyText.x + energyText.width + 20;
        for (var i = 0; i < maxEnergy; i++) {
            var orb = new pixi_js_1.Graphics();
            var isActive = i < energyValue;
            orb.circle(0, 0, orbSize / 2)
                .fill(isActive ? colors_1.Colors.ENERGY_ACTIVE : colors_1.Colors.ENERGY_INACTIVE)
                .stroke({ width: 2, color: colors_1.Colors.CARD_BORDER });
            orb.x = startX + i * orbSpacing;
            orb.y = energyText.y + energyText.height / 2;
            container.addChild(orb);
        }
        container.addChild(energyText);
    };
    CardBattleUIManager.prototype.createPlayerArea = function (container, playerNo, characters, gameWidth) {
        var _this = this;
        container.removeChildren();
        var padding = this.scene.STANDARD_PADDING;
        var characterCount = characters.length;
        var maxCardWidth = 150;
        var cardHeight = 90;
        var cardWidth = Math.min(maxCardWidth, (gameWidth - 2 * padding - (characterCount - 1) * 10) / characterCount);
        cardWidth = Math.max(80, cardWidth);
        var totalWidth = characterCount * cardWidth + (characterCount - 1) * 10;
        var startX = (gameWidth - totalWidth) / 2;
        characters.forEach(function (character, index) {
            var x = startX + index * (cardWidth + 10);
            var y = 0;
            var characterCard = _this.createCharacterCard(character, x, y, cardWidth);
            container.addChild(characterCard);
        });
    };
    CardBattleUIManager.prototype.createCharacterCard = function (character, x, y, width) {
        var card = new pixi_js_1.Container();
        var height = width * 0.6;
        // Background
        var bg = new pixi_js_1.Graphics();
        bg.roundRect(0, 0, width, height, 8)
            .fill(colors_1.Colors.CARD_BACKGROUND)
            .stroke({ width: 2, color: colors_1.Colors.CARD_BORDER });
        // Character name
        var nameText = new pixi_js_1.Text({
            text: character.character_name || character.name || 'Unknown',
            style: {
                fontFamily: 'Kalam',
                fontSize: Math.max(10, width * 0.1),
                fill: colors_1.Colors.TEXT_PRIMARY,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: width - 10
            }
        });
        nameText.anchor.set(0.5, 0);
        nameText.x = width / 2;
        nameText.y = 5;
        // HP bar
        var hpBarWidth = width - 20;
        var hpBarHeight = 8;
        var hpBarBg = new pixi_js_1.Graphics();
        hpBarBg.roundRect(0, 0, hpBarWidth, hpBarHeight, 4)
            .fill(colors_1.Colors.HP_BAR_BACKGROUND);
        var hpPercentage = character.current_hp / character.max_hp;
        var hpBar = new pixi_js_1.Graphics();
        hpBar.roundRect(0, 0, hpBarWidth * hpPercentage, hpBarHeight, 4)
            .fill(colors_1.Colors.HP_BAR_FILL);
        hpBarBg.x = 10;
        hpBarBg.y = height - 20;
        hpBar.x = 10;
        hpBar.y = height - 20;
        // HP text
        var hpText = new pixi_js_1.Text({
            text: "".concat(character.current_hp, "/").concat(character.max_hp),
            style: {
                fontFamily: 'Kalam',
                fontSize: Math.max(8, width * 0.08),
                fill: colors_1.Colors.TEXT_PRIMARY,
                align: 'center'
            }
        });
        hpText.anchor.set(0.5);
        hpText.x = width / 2;
        hpText.y = height - 30;
        card.addChild(bg, nameText, hpBarBg, hpBar, hpText);
        card.x = x;
        card.y = y;
        return card;
    };
    CardBattleUIManager.prototype.createHandArea = function (container, playerNo, showCards, handCards, gameWidth) {
        container.removeChildren();
        var padding = this.scene.STANDARD_PADDING;
        var handCount = handCards.length;
        if (handCount === 0)
            return;
        var maxCardWidth = 100;
        var cardWidth = Math.min(maxCardWidth, (gameWidth - 2 * padding) / Math.max(handCount, 4));
        cardWidth = Math.max(60, cardWidth);
        var cardSpacing = 10;
        var startX = padding;
        if (handCount > 1) {
            cardSpacing = (gameWidth - 2 * padding - cardWidth) / (handCount - 1);
            cardSpacing = Math.min(cardSpacing, cardWidth);
            startX = padding;
        }
        for (var index = 0; index < handCount; index++) {
            var x = startX + index * cardSpacing;
            var y = 10;
            var card = handCards[index];
            var cardContainer = showCards
                ? this.createHandCard(card, x, y, cardWidth)
                : this.createFaceDownCard(x, y, cardWidth);
            container.addChild(cardContainer);
        }
    };
    CardBattleUIManager.prototype.createHandCard = function (card, x, y, width) {
        var cardContainer = new pixi_js_1.Container();
        var height = width * 1.4;
        // Background
        var bg = new pixi_js_1.Graphics();
        bg.roundRect(0, 0, width, height, 5)
            .fill(colors_1.Colors.CARD_BACKGROUND)
            .stroke({ width: 2, color: colors_1.Colors.CARD_BORDER });
        // Card name
        var nameText = new pixi_js_1.Text({
            text: card.card.name,
            style: {
                fontFamily: 'Kalam',
                fontSize: Math.max(8, width * 0.12),
                fill: colors_1.Colors.TEXT_PRIMARY,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: width - 8
            }
        });
        nameText.anchor.set(0.5, 0);
        nameText.x = width / 2;
        nameText.y = 5;
        // Energy cost
        var energyCostBg = new pixi_js_1.Graphics();
        energyCostBg.circle(0, 0, 12)
            .fill(colors_1.Colors.ENERGY_ACTIVE)
            .stroke({ width: 1, color: colors_1.Colors.CARD_BORDER });
        var energyText = new pixi_js_1.Text({
            text: card.card.energy_cost.toString(),
            style: {
                fontFamily: 'Kalam',
                fontSize: Math.max(8, width * 0.1),
                fill: colors_1.Colors.TEXT_ON_DARK,
                fontWeight: 'bold'
            }
        });
        energyText.anchor.set(0.5);
        energyCostBg.x = width - 15;
        energyCostBg.y = 15;
        energyText.x = energyCostBg.x;
        energyText.y = energyCostBg.y;
        // Card type/group
        var groupText = new pixi_js_1.Text({
            text: card.card.group,
            style: {
                fontFamily: 'Kalam',
                fontSize: Math.max(6, width * 0.08),
                fill: colors_1.Colors.TEXT_SECONDARY,
                align: 'center'
            }
        });
        groupText.anchor.set(0.5);
        groupText.x = width / 2;
        groupText.y = height - 15;
        cardContainer.addChild(bg, nameText, energyCostBg, energyText, groupText);
        cardContainer.x = x;
        cardContainer.y = y;
        // Store card data for interactions
        cardContainer.cardData = card;
        return cardContainer;
    };
    CardBattleUIManager.prototype.createFaceDownCard = function (x, y, width) {
        var card = new pixi_js_1.Container();
        var height = width * 1.4;
        // Background with card back design
        var bg = new pixi_js_1.Graphics();
        bg.roundRect(0, 0, width, height, 5)
            .fill(colors_1.Colors.CARD_BACK)
            .stroke({ width: 2, color: colors_1.Colors.CARD_BORDER });
        // Simple pattern
        var pattern = new pixi_js_1.Graphics();
        pattern.rect(width * 0.2, height * 0.3, width * 0.6, height * 0.4)
            .fill({ color: colors_1.Colors.CARD_BORDER, alpha: 0.3 });
        card.addChild(bg, pattern);
        card.x = x;
        card.y = y;
        return card;
    };
    CardBattleUIManager.prototype.createDeckCard = function (x, y, cardCount) {
        var deck = new pixi_js_1.Container();
        var width = 60;
        var height = width * 1.4;
        // Stack effect with multiple cards
        for (var i = 0; i < Math.min(3, Math.max(1, cardCount)); i++) {
            var bg = new pixi_js_1.Graphics();
            bg.roundRect(0, 0, width, height, 5)
                .fill(colors_1.Colors.CARD_BACK)
                .stroke({ width: 1, color: colors_1.Colors.CARD_BORDER });
            bg.x = i * 2;
            bg.y = -i * 2;
            deck.addChild(bg);
        }
        // Card count text
        var countText = new pixi_js_1.Text({
            text: cardCount.toString(),
            style: {
                fontFamily: 'Kalam',
                fontSize: 12,
                fill: colors_1.Colors.TEXT_ON_DARK,
                fontWeight: 'bold'
            }
        });
        countText.anchor.set(0.5);
        countText.x = width / 2;
        countText.y = height / 2;
        deck.addChild(countText);
        deck.x = x;
        deck.y = y;
        return deck;
    };
    CardBattleUIManager.prototype.createDiscardPile = function (x, y, discardedCards) {
        var discard = new pixi_js_1.Container();
        var width = 60;
        var height = width * 1.4;
        if (discardedCards.length === 0) {
            // Empty discard pile
            var bg = new pixi_js_1.Graphics();
            bg.roundRect(0, 0, width, height, 5)
                .stroke({ width: 2, color: colors_1.Colors.CARD_BORDER, alpha: 0.5 });
            discard.addChild(bg);
        }
        else {
            // Show top discarded card
            var topCard = discardedCards[discardedCards.length - 1];
            var cardVisual = this.createHandCard(topCard, 0, 0, width);
            cardVisual.alpha = 0.8;
            discard.addChild(cardVisual);
            // Count text
            var countText = new pixi_js_1.Text({
                text: discardedCards.length.toString(),
                style: {
                    fontFamily: 'Kalam',
                    fontSize: 10,
                    fill: colors_1.Colors.TEXT_PRIMARY,
                    fontWeight: 'bold'
                }
            });
            countText.anchor.set(0.5);
            countText.x = width - 10;
            countText.y = 10;
            discard.addChild(countText);
        }
        discard.x = x;
        discard.y = y;
        return discard;
    };
    CardBattleUIManager.prototype.createBattleLog = function (container, gameWidth) {
        container.removeChildren();
        var padding = this.scene.STANDARD_PADDING;
        var logWidth = gameWidth - 2 * padding;
        var logHeight = 80;
        // Background
        var bg = new pixi_js_1.Graphics();
        bg.roundRect(0, 0, logWidth, logHeight, 5)
            .fill({ color: colors_1.Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
            .stroke({ width: 1, color: colors_1.Colors.CARD_BORDER });
        // Title
        var titleText = new pixi_js_1.Text({
            text: 'Battle Log',
            style: {
                fontFamily: 'Kalam',
                fontSize: 14,
                fill: colors_1.Colors.TEXT_PRIMARY,
                fontWeight: 'bold'
            }
        });
        titleText.x = 10;
        titleText.y = 5;
        // Sample log entry
        var logText = new pixi_js_1.Text({
            text: 'Turn started...',
            style: {
                fontFamily: 'Kalam',
                fontSize: 11,
                fill: colors_1.Colors.TEXT_SECONDARY,
                wordWrap: true,
                wordWrapWidth: logWidth - 20
            }
        });
        logText.x = 10;
        logText.y = 25;
        bg.x = padding;
        titleText.x = padding + 10;
        logText.x = padding + 10;
        container.addChild(bg, titleText, logText);
    };
    return CardBattleUIManager;
}());
exports.CardBattleUIManager = CardBattleUIManager;
