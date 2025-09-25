/**
 * Simple utilities for the SimpleCardBattleScene
 * Contains only the essential helper functions without over-engineering
 */

import { gsap } from 'gsap';
import { Container } from 'pixi.js';

/**
 * Simple animation helpers
 */
export const SimpleAnimations = {
  /**
   * Animate cards being drawn
   */
  animateCardDraw: (cards: Container[]): Promise<void> => {
    return new Promise((resolve) => {
      if (cards.length === 0) {
        resolve();
        return;
      }
      
      gsap.from(cards, {
        y: '-=100',
        alpha: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        onComplete: resolve
      });
    });
  },

  /**
   * Animate card play
   */
  animateCardPlay: (card: Container, targetX: number, targetY: number): Promise<void> => {
    return new Promise((resolve) => {
      gsap.to(card, {
        x: targetX,
        y: targetY,
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(card, {
            scale: 0,
            alpha: 0,
            duration: 0.2,
            onComplete: resolve
          });
        }
      });
    });
  },

  /**
   * Animate character taking damage
   */
  animateCharacterHit: (character: Container): Promise<void> => {
    return new Promise((resolve) => {
      gsap.to(character, {
        x: character.x + 10,
        duration: 0.1,
        yoyo: true,
        repeat: 3,
        ease: 'power2.inOut',
        onComplete: resolve
      });
    });
  },

  /**
   * Simple pulse animation for emphasis
   */
  pulse: (element: Container, scale: number = 1.1): Promise<void> => {
    return new Promise((resolve) => {
      gsap.to(element.scale, {
        x: scale,
        y: scale,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: resolve
      });
    });
  }
};

/**
 * Simple layout calculations
 */
export const SimpleLayout = {
  /**
   * Calculate card positions in a row
   */
  calculateCardRow: (
    cardCount: number, 
    cardWidth: number, 
    containerWidth: number, 
    maxSpacing: number = 10
  ) => {
    if (cardCount === 0) return [];
    
    const spacing = Math.min(maxSpacing, (containerWidth - cardWidth) / Math.max(cardCount - 1, 1));
    const totalWidth = (cardCount - 1) * spacing + cardWidth;
    const startX = (containerWidth - totalWidth) / 2;
    
    return Array.from({ length: cardCount }, (_, index) => ({
      x: startX + index * spacing,
      y: 0
    }));
  },

  /**
   * Calculate responsive layout areas
   */
  calculateBattleAreas: (gameWidth: number, gameHeight: number, padding: number = 10) => {
    const handHeight = 90; // card height + padding
    const infoHeight = 60;
    const logHeight = 80;
    const buttonHeight = 54; // button + padding
    const bottomUI = handHeight + infoHeight + logHeight + buttonHeight;
    
    return {
      opponentHand: { 
        y: padding, 
        height: handHeight 
      },
      opponentCharacters: { 
        y: handHeight + padding * 2, 
        height: Math.max(160, (gameHeight - bottomUI - handHeight - padding * 4) / 2)
      },
      playerCharacters: { 
        y: gameHeight - bottomUI - 160 + padding, 
        height: 160 
      },
      playerHand: { 
        y: gameHeight - bottomUI + padding, 
        height: handHeight 
      },
      info: { 
        y: gameHeight - infoHeight - logHeight - buttonHeight - padding * 2, 
        height: infoHeight 
      },
      log: { 
        y: gameHeight - logHeight - buttonHeight - padding, 
        height: logHeight 
      },
      button: { 
        y: gameHeight - buttonHeight, 
        height: buttonHeight - padding 
      }
    };
  }
};

/**
 * Simple drag and drop helpers
 */
export const SimpleDragDrop = {
  /**
   * Check if point is inside container bounds
   */
  isPointInContainer: (x: number, y: number, container: Container): boolean => {
    const bounds = container.getBounds();
    return x >= bounds.x && 
           x <= bounds.x + bounds.width && 
           y >= bounds.y && 
           y <= bounds.y + bounds.height;
  },

  /**
   * Find the closest drop target
   */
  findDropTarget: (
    x: number, 
    y: number, 
    dropTargets: { id: string; container: Container }[]
  ): string | null => {
    for (const target of dropTargets) {
      if (SimpleDragDrop.isPointInContainer(x, y, target.container)) {
        return target.id;
      }
    }
    return null;
  }
};

/**
 * Simple card creation helpers
 */
export const SimpleCardHelpers = {
  /**
   * Get contrasting text color for background
   */
  getTextColor: (backgroundColor: number): number => {
    // Simple contrast logic
    const r = (backgroundColor >> 16) & 255;
    const g = (backgroundColor >> 8) & 255;
    const b = backgroundColor & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 0x000000 : 0xFFFFFF;
  },

  /**
   * Truncate text to fit width
   */
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  /**
   * Format health display
   */
  formatHealth: (current: number, max: number): string => {
    return `${Math.max(0, current)}/${max}`;
  }
};