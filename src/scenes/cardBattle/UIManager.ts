import { Container, Graphics, Text } from 'pixi.js';
import { Colors, Gradients } from '@/utils/colors';
import { BaseScene } from '@/utils/BaseScene';
import { CardBattleCharacter, CardInDeck } from '@/types';

/**
 * Manages UI creation and layout for the CardBattleScene
 */
export class CardBattleUIManager {
  private scene: BaseScene;

  constructor(scene: BaseScene) {
    this.scene = scene;
  }

  createBackground(container: Container, gameWidth: number, availableHeight: number): void {
    const bg = new Graphics();
    const backgroundGradient = Gradients.createBackgroundGradient(gameWidth, availableHeight);
    bg.rect(0, 0, gameWidth, availableHeight).fill(backgroundGradient);
    container.addChild(bg);
  }

  createGameLayout(
    gameContainer: Container,
    player1Container: Container,
    player2Container: Container,
    player1HandContainer: Container,
    player2HandContainer: Container,
    player1EnergyContainer: Container,
    player2EnergyContainer: Container,
    battleLogContainer: Container,
    effectsContainer: Container,
    gameWidth: number,
    availableHeight: number
  ): void {
    const padding = (this.scene as BaseScene & { STANDARD_PADDING: number }).STANDARD_PADDING;

    // Clear containers
    gameContainer.removeChildren();

    // Layout configuration
    const handHeight = 120;
    const energyAreaHeight = 60;
    const battleAreaHeight = availableHeight - 2 * handHeight - 2 * energyAreaHeight - 4 * padding;
    const battleLogHeight = Math.min(100, battleAreaHeight * 0.3);
    const characterAreaHeight = (battleAreaHeight - battleLogHeight - padding) / 2;

    // Position containers to match original layout
    // Player 2 (top)
    player2HandContainer.x = 0;
    player2HandContainer.y = padding;
    player2Container.x = 0;
    player2Container.y = player2HandContainer.y + handHeight + padding;
    player2EnergyContainer.x = 0;
    player2EnergyContainer.y = player2Container.y + characterAreaHeight + padding;

    // Battle log (center)
    battleLogContainer.x = 0;
    battleLogContainer.y = player2EnergyContainer.y + energyAreaHeight + padding;

    // Player 1 (bottom)
    player1EnergyContainer.x = 0;
    player1EnergyContainer.y = battleLogContainer.y + battleLogHeight + padding;
    player1Container.x = 0;
    player1Container.y = player1EnergyContainer.y + energyAreaHeight + padding;
    player1HandContainer.x = 0;
    player1HandContainer.y = player1Container.y + characterAreaHeight + padding;

    // Effects container overlays everything
    effectsContainer.x = 0;
    effectsContainer.y = 0;

    // Add containers to game container in proper order
    gameContainer.addChild(
      player2HandContainer,
      player2Container,
      player2EnergyContainer,
      battleLogContainer,
      player1EnergyContainer,
      player1Container,
      player1HandContainer,
      effectsContainer
    );
  }

  createEnergyArea(container: Container, playerNo: number, gameWidth: number): void {
    container.removeChildren();

    const energyValue = playerNo === 1 ? 3 : 2; // Mock values
    const maxEnergy = 5;
    const padding = (this.scene as BaseScene & { STANDARD_PADDING: number }).STANDARD_PADDING;

    // Energy title
    const energyText = new Text({
      text: `Energy: ${energyValue}/${maxEnergy}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fill: Colors.TEXT_PRIMARY,
        fontWeight: 'bold'
      }
    });
    energyText.x = padding;
    energyText.y = 10;

    // Energy orbs
    const orbSize = 20;
    const orbSpacing = 25;
    const startX = energyText.x + energyText.width + 20;

    for (let i = 0; i < maxEnergy; i++) {
      const orb = new Graphics();
      const isActive = i < energyValue;

      orb.circle(0, 0, orbSize / 2)
        .fill(isActive ? Colors.ENERGY_ACTIVE : Colors.ENERGY_INACTIVE)
        .stroke({ width: 2, color: Colors.CARD_BORDER });

      orb.x = startX + i * orbSpacing;
      orb.y = energyText.y + energyText.height / 2;

      container.addChild(orb);
    }

    container.addChild(energyText);
  }

  createPlayerArea(
    container: Container,
    playerNo: number,
    characters: CardBattleCharacter[],
    gameWidth: number
  ): void {
    container.removeChildren();

    const padding = (this.scene as BaseScene & { STANDARD_PADDING: number }).STANDARD_PADDING;
    const characterCount = characters.length;
    const maxCardWidth = 150;

    let cardWidth = Math.min(maxCardWidth, (gameWidth - 2 * padding - (characterCount - 1) * 10) / characterCount);
    cardWidth = Math.max(80, cardWidth);

    const totalWidth = characterCount * cardWidth + (characterCount - 1) * 10;
    const startX = (gameWidth - totalWidth) / 2;

    characters.forEach((character, index) => {
      const x = startX + index * (cardWidth + 10);
      const y = 0;

      const characterCard = this.createCharacterCard(character, x, y, cardWidth);
      container.addChild(characterCard);
    });
  }

  createCharacterCard(character: CardBattleCharacter, x: number, y: number, width: number): Container {
    const card = new Container();
    const height = width * 0.6;

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill(Colors.CARD_BACKGROUND)
      .stroke({ width: 2, color: Colors.CARD_BORDER });

    // Character name
    const nameText = new Text({
      text: character.name || 'Unknown',
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(10, width * 0.1),
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: width - 10
      }
    });
    nameText.anchor.set(0.5, 0);
    nameText.x = width / 2;
    nameText.y = 5;

    // HP bar
    const hpBarWidth = width - 20;
    const hpBarHeight = 8;
    const hpBarBg = new Graphics();
    hpBarBg.roundRect(0, 0, hpBarWidth, hpBarHeight, 4)
      .fill(Colors.HP_BAR_BACKGROUND);

    const hpPercentage = character.current_hp / character.max_hp;
    const hpBar = new Graphics();
    hpBar.roundRect(0, 0, hpBarWidth * hpPercentage, hpBarHeight, 4)
      .fill(Colors.HP_BAR_FILL);

    hpBarBg.x = 10;
    hpBarBg.y = height - 20;
    hpBar.x = 10;
    hpBar.y = height - 20;

    // HP text
    const hpText = new Text({
      text: `${character.current_hp}/${character.max_hp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(8, width * 0.08),
        fill: Colors.TEXT_PRIMARY,
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
  }

  createHandArea(
    container: Container,
    playerNo: number,
    showCards: boolean,
    handCards: CardInDeck[],
    gameWidth: number
  ): void {
    container.removeChildren();

    const padding = (this.scene as BaseScene & { STANDARD_PADDING: number }).STANDARD_PADDING;
    const handCount = handCards.length;

    if (handCount === 0) return;

    const maxCardWidth = 100;
    let cardWidth = Math.min(maxCardWidth, (gameWidth - 2 * padding) / Math.max(handCount, 4));
    cardWidth = Math.max(60, cardWidth);

    let cardSpacing = 10;
    let startX = padding;

    if (handCount > 1) {
      cardSpacing = (gameWidth - 2 * padding - cardWidth) / (handCount - 1);
      cardSpacing = Math.min(cardSpacing, cardWidth);
      startX = padding;
    }

    for (let index = 0; index < handCount; index++) {
      const x = startX + index * cardSpacing;
      const y = 10;
      const card = handCards[index];

      const cardContainer = showCards
        ? this.createHandCard(card, x, y, cardWidth)
        : this.createFaceDownCard(x, y, cardWidth);

      container.addChild(cardContainer);
    }
  }

  createHandCard(card: CardInDeck, x: number, y: number, width: number): Container {
    const cardContainer = new Container();
    const height = width * 1.4;

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5)
      .fill(Colors.CARD_BACKGROUND)
      .stroke({ width: 2, color: Colors.CARD_BORDER });

    // Card name
    const nameText = new Text({
      text: card.card?.name || 'Unknown Card',
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(8, width * 0.12),
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: width - 8
      }
    });
    nameText.anchor.set(0.5, 0);
    nameText.x = width / 2;
    nameText.y = 5;

    // Energy cost
    const energyCostBg = new Graphics();
    energyCostBg.circle(0, 0, 12)
      .fill(Colors.ENERGY_ACTIVE)
      .stroke({ width: 1, color: Colors.CARD_BORDER });

    const energyText = new Text({
      text: card.card?.energy_cost?.toString() || '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(8, width * 0.1),
        fill: Colors.TEXT_ON_DARK,
        fontWeight: 'bold'
      }
    });
    energyText.anchor.set(0.5);

    energyCostBg.x = width - 15;
    energyCostBg.y = 15;
    energyText.x = energyCostBg.x;
    energyText.y = energyCostBg.y;

    // Card type/group
    const groupText = new Text({
      text: card.card?.group || 'Unknown',
      style: {
        fontFamily: 'Kalam',
        fontSize: Math.max(6, width * 0.08),
        fill: Colors.TEXT_SECONDARY,
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
    (cardContainer as Container & { cardData: CardInDeck }).cardData = card;

    return cardContainer;
  }

  createFaceDownCard(x: number, y: number, width: number): Container {
    const card = new Container();
    const height = width * 1.4;

    // Background with card back design
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5)
      .fill(Colors.CARD_BACK)
      .stroke({ width: 2, color: Colors.CARD_BORDER });

    // Simple pattern
    const pattern = new Graphics();
    pattern.rect(width * 0.2, height * 0.3, width * 0.6, height * 0.4)
      .fill({ color: Colors.CARD_BORDER, alpha: 0.3 });

    card.addChild(bg, pattern);
    card.x = x;
    card.y = y;

    return card;
  }

  createDeckCard(x: number, y: number, cardCount: number): Container {
    const deck = new Container();
    const width = 60;
    const height = width * 1.4;

    // Stack effect with multiple cards
    for (let i = 0; i < Math.min(3, Math.max(1, cardCount)); i++) {
      const bg = new Graphics();
      bg.roundRect(0, 0, width, height, 5)
        .fill(Colors.CARD_BACK)
        .stroke({ width: 1, color: Colors.CARD_BORDER });

      bg.x = i * 2;
      bg.y = -i * 2;
      deck.addChild(bg);
    }

    // Card count text
    const countText = new Text({
      text: cardCount.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_ON_DARK,
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
  }

  createDiscardPile(x: number, y: number, discardedCards: CardInDeck[]): Container {
    const discard = new Container();
    const width = 60;
    const height = width * 1.4;

    if (discardedCards.length === 0) {
      // Empty discard pile
      const bg = new Graphics();
      bg.roundRect(0, 0, width, height, 5)
        .stroke({ width: 2, color: Colors.CARD_BORDER, alpha: 0.5 });

      discard.addChild(bg);
    } else {
      // Show top discarded card
      const topCard = discardedCards[discardedCards.length - 1];
      const cardVisual = this.createHandCard(topCard, 0, 0, width);
      cardVisual.alpha = 0.8;
      discard.addChild(cardVisual);

      // Count text
      const countText = new Text({
        text: discardedCards.length.toString(),
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: Colors.TEXT_PRIMARY,
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
  }

  createBattleLog(container: Container, gameWidth: number): void {
    container.removeChildren();

    const padding = (this.scene as BaseScene & { STANDARD_PADDING: number }).STANDARD_PADDING;
    const logWidth = gameWidth - 2 * padding;
    const logHeight = 80;

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, logWidth, logHeight, 5)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
      .stroke({ width: 1, color: Colors.CARD_BORDER });

    // Title
    const titleText = new Text({
      text: 'Battle Log',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        fontWeight: 'bold'
      }
    });
    titleText.x = 10;
    titleText.y = 5;

    // Sample log entry
    const logText = new Text({
      text: 'Turn started...',
      style: {
        fontFamily: 'Kalam',
        fontSize: 11,
        fill: Colors.TEXT_SECONDARY,
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
  }
}