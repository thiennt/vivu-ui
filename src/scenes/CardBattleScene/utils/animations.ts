import { Container } from 'pixi.js';
import { gsap } from 'gsap';

/**
 * Animation utilities for CardBattleScene
 */
export class BattleAnimations {
  /**
   * Animate turn start effects on character cards
   */
  static async animateTurnStartEffects(characterCards: Container[]): Promise<void> {
    for (const card of characterCards) {
      // Animate a gentle glow to indicate turn start
      await gsap.to(card, {
        alpha: 0.7,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  }

  /**
   * Animate end turn effects on character cards
   */
  static async animateEndTurnEffects(characterCards: Container[]): Promise<void> {
    for (const card of characterCards) {
      // Animate a subtle pulse to indicate end turn processing
      await gsap.to(card.scale, {
        x: 1.05,
        y: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  }

  /**
   * Animate card being discarded
   */
  static animateCardToDiscard(
    card: Container,
    targetX: number,
    targetY: number,
    cardWidth: number,
    cardHeight: number,
    onComplete?: () => void
  ): void {
    gsap.to(card, {
      x: targetX + cardWidth / 2,
      y: targetY + cardHeight / 2,
      scale: 0.8,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        card.destroy();
        onComplete?.();
      }
    });
  }

  /**
   * Animate card being played on a character
   */
  static animateCardPlay(
    card: Container,
    characterCard: Container,
    characterCardWidth: number,
    characterCardHeight: number,
    onComplete?: () => void
  ): void {
    gsap.to(card, {
      x: characterCard.x + characterCardWidth / 2,
      y: characterCard.y + characterCardHeight / 2,
      scale: 0,
      rotation: Math.PI,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        card.destroy();
        onComplete?.();
        BattleAnimations.animateCharacterEffect(characterCard);
      }
    });
  }

  /**
   * Animate character effect when card is played
   */
  static animateCharacterEffect(characterCard: Container): void {
    gsap.to(characterCard.scale, {
      x: 1.1,
      y: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  }

  /**
   * Animate cards being drawn from deck
   */
  static async animateCardDraw(handCards: Container[]): Promise<void> {
    handCards.forEach((card, index) => {
      card.alpha = 0;
      card.scale.set(0);
      
      gsap.to(card, {
        alpha: 1,
        scale: 1,
        duration: 0.4,
        delay: index * 0.1,
        ease: 'back.out(1.7)'
      });
    });
    
    // Return promise that resolves when animation completes
    return new Promise(resolve => {
      const longestDelay = (handCards.length - 1) * 0.1 + 0.4;
      setTimeout(resolve, longestDelay * 1000);
    });
  }

  /**
   * Animate card returning to hand
   */
  static returnCardToHand(cardContainer: Container, onComplete?: () => void): void {
    gsap.to(cardContainer, {
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        onComplete?.();
      }
    });
  }
}