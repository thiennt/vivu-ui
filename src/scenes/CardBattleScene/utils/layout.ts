/**
 * Layout calculation utilities for CardBattleScene
 */
export class LayoutCalculator {
  readonly STANDARD_PADDING = 10;
  readonly STANDARD_SPACING = 10;

  /**
   * Calculate responsive layout for the battle scene
   */
  static calculateBattleLayout(gameWidth: number, gameHeight: number): {
    areas: {
      opponentEnergy: { y: number; height: number };
      opponentHand: { y: number; height: number };
      battlefield: { y: number; height: number };
      playerHand: { y: number; height: number };
      playerEnergy: { y: number; height: number };
      endTurn: { y: number; height: number };
    };
    paddings: {
      top: number;
      between: number;
      bottom: number;
    };
  } {
    // Define vertical paddings for each area
    const TOP_PADDING = 20;
    const BETWEEN_AREAS = 20;
    const BOTTOM_PADDING = 20;

    // Calculate available height for all areas
    const totalVerticalPadding = TOP_PADDING + BETWEEN_AREAS * 4 + BOTTOM_PADDING;
    const availableHeight = gameHeight - totalVerticalPadding;

    // Assign heights for each area proportionally
    const opponentEnergyHeight = 50;
    const opponentHandHeight = 80;
    const playerHandHeight = 80;
    const playerEnergyHeight = 50;
    const endTurnHeight = 50;
    const battlefieldHeight = availableHeight - (opponentEnergyHeight + opponentHandHeight + playerHandHeight + playerEnergyHeight + endTurnHeight);

    // Y positions for each area
    let currentY = TOP_PADDING;

    const opponentEnergy = { y: currentY, height: opponentEnergyHeight };
    currentY += opponentEnergyHeight + BETWEEN_AREAS;

    const opponentHand = { y: currentY, height: opponentHandHeight };
    currentY += opponentHandHeight + BETWEEN_AREAS;

    const battlefield = { y: currentY, height: battlefieldHeight };
    currentY += battlefieldHeight + BETWEEN_AREAS;

    const playerHand = { y: currentY, height: playerHandHeight };
    currentY += playerHandHeight + BETWEEN_AREAS;

    const playerEnergy = { y: currentY, height: playerEnergyHeight };
    currentY += playerEnergyHeight + BETWEEN_AREAS;

    const endTurn = { y: currentY, height: endTurnHeight };

    return {
      areas: {
        opponentEnergy,
        opponentHand,
        battlefield,
        playerHand,
        playerEnergy,
        endTurn
      },
      paddings: {
        top: TOP_PADDING,
        between: BETWEEN_AREAS,
        bottom: BOTTOM_PADDING
      }
    };
  }

  /**
   * Calculate character card layout
   */
  static calculateCharacterLayout(
    gameWidth: number,
    maxCharacters: number,
    standardPadding: number,
    standardSpacing: number
  ): {
    cardWidth: number;
    cardHeight: number;
    totalWidth: number;
    startX: number;
    spacing: number;
  } {
    const availableWidth = gameWidth - (standardPadding * 2);
    const minCardWidth = 80;
    const maxCardWidth = 120;
    const spacing = standardSpacing;

    // Calculate card width that fits all characters with proper spacing
    let cardWidth = (availableWidth - (spacing * (maxCharacters - 1))) / maxCharacters;
    cardWidth = Math.max(minCardWidth, Math.min(maxCardWidth, cardWidth));

    const cardHeight = cardWidth * 1.4; // Maintain aspect ratio
    const totalWidth = (cardWidth * maxCharacters) + (spacing * (maxCharacters - 1));
    const startX = (gameWidth - totalWidth) / 2;

    return {
      cardWidth,
      cardHeight,
      totalWidth,
      startX,
      spacing
    };
  }

  /**
   * Calculate energy/deck/discard layout
   */
  static calculateEnergyDeckDiscardLayout(
    gameWidth: number,
    standardSpacing: number
  ): {
    elementWidth: number;
    totalWidth: number;
    startX: number;
    spacing: number;
  } {
    const elementWidth = 80;
    const spacing = standardSpacing;
    const totalWidth = (elementWidth * 3) + (spacing * 2);
    const startX = (gameWidth - totalWidth) / 2;

    return {
      elementWidth,
      totalWidth,
      startX,
      spacing
    };
  }

  /**
   * Calculate hand card layout
   */
  static calculateHandLayout(
    cards: any[],
    gameWidth: number,
    handCardWidth: number,
    handCardHeight: number,
    maxVisibleCards: number = 6,
    standardPadding: number = 10
  ): {
    cardPositions: { x: number; y: number }[];
    visibleCards: any[];
  } {
    // Show only the first few cards if hand is too large
    const visibleCards = cards.slice(0, maxVisibleCards);
    const cardCount = visibleCards.length;
    
    if (cardCount === 0) {
      return { cardPositions: [], visibleCards: [] };
    }

    const availableWidth = gameWidth - (standardPadding * 2);
    const spacing = Math.min(handCardWidth + 5, availableWidth / cardCount);
    const totalWidth = (cardCount - 1) * spacing + handCardWidth;
    const startX = (gameWidth - totalWidth) / 2;

    const cardPositions = visibleCards.map((_, index) => ({
      x: startX + index * spacing,
      y: standardPadding
    }));

    return {
      cardPositions,
      visibleCards
    };
  }

  /**
   * Calculate battlefield sections layout
   */
  static calculateBattlefieldSections(
    y: number,
    height: number
  ): {
    opponentCharacters: { y: number; height: number };
    actionLog: { y: number; height: number };
    playerCharacters: { y: number; height: number };
  } {
    const sectionHeight = height / 3;
    
    return {
      opponentCharacters: {
        y: y,
        height: sectionHeight
      },
      actionLog: {
        y: y + sectionHeight,
        height: sectionHeight - 20
      },
      playerCharacters: {
        y: y + sectionHeight * 2,
        height: sectionHeight
      }
    };
  }

  /**
   * Calculate button layout
   */
  static calculateButtonLayout(
    gameWidth: number,
    gameHeight: number,
    buttonWidth: number = 200,
    buttonHeight: number = 44,
    standardPadding: number = 10
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const adjustedWidth = Math.min(buttonWidth, gameWidth - (standardPadding * 2));
    
    return {
      x: (gameWidth - adjustedWidth) / 2,
      y: gameHeight - buttonHeight - standardPadding,
      width: adjustedWidth,
      height: buttonHeight
    };
  }
}