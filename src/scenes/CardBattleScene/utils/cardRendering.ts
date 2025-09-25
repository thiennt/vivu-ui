import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { Card, CardBattleCharacter } from '@/types';
import { BaseScene } from '@/utils/BaseScene';

/**
 * Card rendering utilities for CardBattleScene
 */
export class CardRenderer {
  private gameWidth: number;
  private gameHeight: number;

  constructor(gameWidth: number, gameHeight: number) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  /**
   * Update dimensions
   */
  updateDimensions(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
  }

  /**
   * Create a hand card container
   */
  createHandCard(
    card: Card, 
    x: number, 
    y: number, 
    cardWidth: number = 50,
    createDeckCardFn: (card: Card, width: number, height: number, options: any) => Container
  ): Container {
    const cardHeight = cardWidth * 1.4; // Maintain aspect ratio
    
    // Calculate appropriate font scale for smaller hand cards
    const baseFontScale = Math.min(1.0, cardWidth / 80); // Scale down for smaller cards

    const cardContainer = createDeckCardFn(card, cardWidth, cardHeight, {
      fontScale: baseFontScale,
      showDescription: false, // Don't show description in hand cards for space
      enableHover: false // We handle hover effects ourselves for drag and drop
    });
    
    cardContainer.x = x;
    cardContainer.y = y;
    
    // Store card reference
    (cardContainer as any).card = card;
    
    return cardContainer;
  }

  /**
   * Create energy/deck/discard UI elements
   */
  createEnergyDeckDiscardUI(
    position: { x: number; y: number },
    containers: { 
      energy: Container; 
      deck: Container; 
      discard: Container; 
    },
    config: {
      elementWidth: number;
      elementHeight: number;
      spacing: number;
      isPlayerDiscard?: boolean;
    }
  ): void {
    const { elementWidth, elementHeight, spacing, isPlayerDiscard = false } = config;
    const { x: startX, y: yPosition } = position;
    
    // Position energy container on the left
    containers.energy.x = startX;
    containers.energy.y = yPosition;
    
    // Create energy background and label
    const energyBg = new Graphics();
    energyBg.roundRect(0, 0, elementWidth, elementHeight, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const energyLabel = new Text({
      text: 'Energy: 0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 11,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    energyLabel.anchor.set(0.5);
    energyLabel.x = elementWidth / 2;
    energyLabel.y = elementHeight / 2;
    
    containers.energy.addChild(energyBg, energyLabel);
    
    // Position deck container in the center
    containers.deck.x = startX + elementWidth + spacing;
    containers.deck.y = yPosition;
    
    // Create deck background and label
    const deckBg = new Graphics();
    deckBg.roundRect(0, 0, elementWidth, elementHeight, 8)
      .fill(Colors.CARD_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    const deckLabel = new Text({
      text: 'DECK',
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    deckLabel.anchor.set(0.5);
    deckLabel.x = elementWidth / 2;
    deckLabel.y = elementHeight / 2 - 8;
    
    const deckCount = new Text({
      text: '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    deckCount.anchor.set(0.5);
    deckCount.x = elementWidth / 2;
    deckCount.y = elementHeight / 2 + 8;
    
    containers.deck.addChild(deckBg, deckLabel, deckCount);
    
    // Position discard container on the right
    containers.discard.x = startX + (elementWidth + spacing) * 2;
    containers.discard.y = yPosition;
    
    // Create discard background and label
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, elementWidth, elementHeight, 8)
      .fill(isPlayerDiscard ? Colors.BUTTON_PRIMARY : Colors.CARD_BACKGROUND)
      .stroke({ 
        width: 2, 
        color: isPlayerDiscard ? Colors.SUCCESS : Colors.UI_BORDER 
      });
    
    const discardLabel = new Text({
      text: isPlayerDiscard ? 'DISCARD' : 'DISCARD',
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    discardLabel.anchor.set(0.5);
    discardLabel.x = elementWidth / 2;
    discardLabel.y = elementHeight / 2 - 8;
    
    const discardCount = new Text({
      text: '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    discardCount.anchor.set(0.5);
    discardCount.x = elementWidth / 2;
    discardCount.y = elementHeight / 2 + 8;
    
    containers.discard.addChild(discardBg, discardLabel, discardCount);
  }

  /**
   * Create hand area UI
   */
  createHandAreaUI(
    container: Container,
    position: { y: number },
    config: { height: number }
  ): void {
    container.y = position.y;
    
    // Add a subtle background for the hand area
    const handBg = new Graphics();
    handBg.rect(0, 0, this.gameWidth, config.height)
      .fill(0x000000, 0.2);
    
    container.addChild(handBg);
  }

  /**
   * Create action log in center
   */
  createActionLogInCenter(logY: number, logHeight: number): Container {
    const actionLogContainer = new Container();
    actionLogContainer.y = logY;
    
    const logBg = new Graphics();
    const logWidth = Math.min(400, this.gameWidth - 40);
    const logX = (this.gameWidth - logWidth) / 2;
    
    logBg.roundRect(logX, 0, logWidth, logHeight, 8)
      .fill(Colors.UI_BACKGROUND, 0.8)
      .stroke({ width: 1, color: Colors.UI_BORDER });
    
    const logTitle = new Text({
      text: 'Battle Log',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    logTitle.anchor.set(0.5);
    logTitle.x = this.gameWidth / 2;
    logTitle.y = 15;
    
    actionLogContainer.addChild(logBg, logTitle);
    return actionLogContainer;
  }

  /**
   * Create end turn button
   */
  createEndTurnButton(
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const endTurnButton = new Container();
    
    const buttonBg = new Graphics();
    buttonBg.roundRect(0, 0, width, height, 12)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const buttonText = new Text({
      text: 'END TURN',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = width / 2;
    buttonText.y = height / 2;
    
    endTurnButton.addChild(buttonBg, buttonText);
    endTurnButton.x = x;
    endTurnButton.y = y;
    
    endTurnButton.interactive = true;
    endTurnButton.cursor = 'pointer';
    endTurnButton.on('pointertap', onClick);
    
    return endTurnButton;
  }

  /**
   * Create fallback UI when battle data is not available
   */
  createFallbackUI(
    gameWidth: number,
    gameHeight: number,
    battleId: string,
    onBackClick: () => void
  ): Container {
    const fallbackContainer = new Container();
    
    const titleText = new Text({
      text: 'Card Battle Scene',
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    titleText.anchor.set(0.5);
    titleText.x = gameWidth / 2;
    titleText.y = gameHeight / 2 - 50;
    
    const statusText = new Text({
      text: 'Waiting for battle data...\nBattle ID: ' + battleId,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    statusText.anchor.set(0.5);
    statusText.x = gameWidth / 2;
    statusText.y = gameHeight / 2;
    
    // Add back button
    const backButton = new Container();
    const backBg = new Graphics();
    backBg.roundRect(0, 0, 120, 40, 8)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const backText = new Text({
      text: 'BACK TO HOME',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    backText.anchor.set(0.5);
    backText.x = 60;
    backText.y = 20;
    
    backButton.addChild(backBg, backText);
    backButton.x = gameWidth / 2 - 60;
    backButton.y = gameHeight / 2 + 50;
    
    backButton.interactive = true;
    backButton.cursor = 'pointer';
    backButton.on('pointertap', onBackClick);
    
    fallbackContainer.addChild(titleText, statusText, backButton);
    return fallbackContainer;
  }
}