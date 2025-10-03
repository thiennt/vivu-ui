/**
 * CardBattleEffects - Handles all animation effects for card battle scenes
 * Provides reusable animation methods for character skills, target effects, and visual feedback
 */

import { Container, Text } from 'pixi.js';
import { gsap } from 'gsap';
import { CardBattleLogTarget } from '@/types';

export type CardGroup = 'damage' | 'healing' | 'debuff' | 'other';

/**
 * Centralized effect animations for card battles
 */
export class CardBattleEffects {
  /**
   * Animate character performing a skill based on card group
   */
  static async animateCharacterSkill(
    characterCard: Container,
    cardGroup: CardGroup = 'other'
  ): Promise<void> {
    return new Promise((resolve) => {
      const timeline = gsap.timeline({
        onComplete: resolve
      });

      switch (cardGroup) {
        case 'damage':
          this.animateDamageSkill(characterCard, timeline);
          break;
        case 'healing':
          this.animateHealingSkill(characterCard, timeline);
          break;
        case 'debuff':
          this.animateDebuffSkill(characterCard, timeline);
          break;
        default:
          this.animateDefaultSkill(characterCard, timeline);
      }
    });
  }

  /**
   * High Damage animation: aggressive forward lunge
   */
  private static animateDamageSkill(characterCard: Container, timeline: gsap.core.Timeline): void {
    const originalX = characterCard.x;
    
    timeline
      .to(characterCard, {
        duration: 0.15,
        scale: 1.2,
        tint: 0xFF4444, // Red tint for attack
        ease: 'power2.out'
      })
      // Forward thrust
      .to(characterCard, {
        duration: 0.15,
        x: originalX + 15,
        rotation: 0.1,
        ease: 'power2.out'
      })
      .to(characterCard, {
        duration: 0.1,
        x: originalX + 10,
        ease: 'power2.inOut'
      })
      // Return to position
      .to(characterCard, {
        duration: 0.3,
        x: originalX,
        rotation: 0,
        scale: 1.0,
        tint: 0xFFFFFF,
        ease: 'power2.inOut'
      });
  }

  /**
   * Healing & Support animation: gentle glow and pulse
   */
  private static animateHealingSkill(characterCard: Container, timeline: gsap.core.Timeline): void {
    timeline
      .to(characterCard, {
        duration: 0.3,
        scale: 1.1,
        tint: 0x44FF44, // Green tint for healing
        ease: 'sine.inOut'
      })
      // Gentle pulse
      .to(characterCard, {
        duration: 0.2,
        scale: 1.15,
        ease: 'sine.inOut'
      })
      .to(characterCard, {
        duration: 0.2,
        scale: 1.1,
        ease: 'sine.inOut'
      })
      // Return to normal
      .to(characterCard, {
        duration: 0.4,
        scale: 1.0,
        tint: 0xFFFFFF,
        ease: 'sine.inOut'
      });
  }

  /**
   * Control & Debuff animation: dark energy and shake
   */
  private static animateDebuffSkill(characterCard: Container, timeline: gsap.core.Timeline): void {
    const originalX = characterCard.x;
    
    timeline
      .to(characterCard, {
        duration: 0.2,
        scale: 1.15,
        tint: 0x8844FF, // Purple tint for debuff
        ease: 'power2.out'
      })
      // Shake effect
      .to(characterCard, {
        duration: 0.08,
        x: originalX - 6,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.08,
        x: originalX + 6,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.08,
        x: originalX - 4,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.08,
        x: originalX + 4,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.08,
        x: originalX,
        ease: 'power2.inOut'
      })
      // Return to normal
      .to(characterCard, {
        duration: 0.3,
        scale: 1.0,
        tint: 0xFFFFFF,
        ease: 'power2.inOut'
      });
  }

  /**
   * Default animation: simple glow + scale + brief movement
   */
  private static animateDefaultSkill(characterCard: Container, timeline: gsap.core.Timeline): void {
    const originalX = characterCard.x;
    
    timeline
      .to(characterCard, {
        duration: 0.2,
        scale: 1.15,
        ease: 'power2.out'
      })
      .to(characterCard, {
        duration: 0.1,
        x: originalX + 5,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.1,
        x: originalX - 5,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.1,
        x: originalX,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.3,
        scale: 1.0,
        ease: 'power2.inOut'
      });
  }

  /**
   * Apply effect animation to a target based on card group and impact data
   */
  static async applyTargetEffect(
    targetCard: Container,
    target: CardBattleLogTarget,
    cardGroup: CardGroup = 'other'
  ): Promise<void> {
    // Extract impact types from impacts
    const damageImpact = target.impacts?.find(impact => impact.type === 'damage');
    const healImpact = target.impacts?.find(impact => impact.type === 'heal');
    const effectImpact = target.impacts?.find(impact => impact.type === 'effect');
    const statusImpact = target.impacts?.find(impact => impact.type === 'status');
    
    const damage = typeof damageImpact?.value === 'number' ? damageImpact.value : 0;
    const healing = typeof healImpact?.value === 'number' ? healImpact.value : 0;
    const isCritical = (damageImpact?.meta as { isCritical?: boolean })?.isCritical || false;

    return new Promise((resolve) => {
      const timeline = gsap.timeline({
        onComplete: resolve
      });

      if (cardGroup === 'damage' || damage > 0) {
        this.applyDamageEffect(targetCard, timeline, damage, isCritical);
        if (damage > 0) {
          this.showFloatingDamage(targetCard, damage, isCritical);
        }
      } else if (cardGroup === 'healing' || healing > 0) {
        this.applyHealingEffect(targetCard, timeline);
        if (healing > 0) {
          this.showFloatingHealing(targetCard, healing);
        }
      } else if (cardGroup === 'debuff' || effectImpact || statusImpact) {
        const isDebuff = cardGroup === 'debuff';
        this.applyDebuffEffect(targetCard, timeline, isDebuff);
      } else {
        this.applyDefaultEffect(targetCard, timeline);
      }
    });
  }

  /**
   * Apply damage effect with recoil and shake
   */
  private static applyDamageEffect(
    targetCard: Container,
    timeline: gsap.core.Timeline,
    damage: number,
    isCritical: boolean
  ): void {
    const originalX = targetCard.x;
    
    timeline
      .to(targetCard, {
        duration: 0.08,
        tint: 0xFF3333, // Bright red tint for damage
        ease: 'power2.out'
      })
      // Strong recoil effect
      .to(targetCard, {
        duration: isCritical ? 0.15 : 0.12,
        scale: isCritical ? 0.8 : 0.85,
        rotation: isCritical ? 0.15 : 0.08,
        ease: 'power2.out'
      })
      // Intense shake effect
      .to(targetCard, {
        duration: 0.04,
        x: originalX + (isCritical ? 10 : 6),
        ease: 'power2.inOut'
      })
      .to(targetCard, {
        duration: 0.04,
        x: originalX - (isCritical ? 10 : 6),
        ease: 'power2.inOut'
      })
      .to(targetCard, {
        duration: 0.04,
        x: originalX + (isCritical ? 6 : 3),
        ease: 'power2.inOut'
      })
      .to(targetCard, {
        duration: 0.04,
        x: originalX - (isCritical ? 6 : 3),
        ease: 'power2.inOut'
      })
      .to(targetCard, {
        duration: 0.04,
        x: originalX,
        ease: 'power2.inOut'
      })
      // Return to normal
      .to(targetCard, {
        duration: 0.3,
        tint: 0xFFFFFF,
        scale: 1.0,
        rotation: 0,
        ease: 'elastic.out(1, 0.5)'
      });
  }

  /**
   * Apply healing effect with gentle restore and sparkle
   */
  private static applyHealingEffect(targetCard: Container, timeline: gsap.core.Timeline): void {
    timeline
      .to(targetCard, {
        duration: 0.25,
        tint: 0x44FF88, // Bright green tint for healing
        scale: 1.15,
        ease: 'sine.out'
      })
      // Gentle pulse for healing energy
      .to(targetCard, {
        duration: 0.2,
        scale: 1.2,
        ease: 'sine.inOut'
      })
      .to(targetCard, {
        duration: 0.2,
        scale: 1.15,
        ease: 'sine.inOut'
      })
      // Return to normal
      .to(targetCard, {
        duration: 0.4,
        tint: 0xFFFFFF,
        scale: 1.0,
        ease: 'sine.inOut'
      });
  }

  /**
   * Apply debuff effect with pulsing dark energy
   */
  private static applyDebuffEffect(
    targetCard: Container,
    timeline: gsap.core.Timeline,
    isDebuff: boolean
  ): void {
    const effectColor = isDebuff ? 0x8844FF : 0x44AAFF; // Purple for debuff, blue for effect/status
    
    timeline
      .to(targetCard, {
        duration: 0.2,
        tint: effectColor,
        scale: 1.08,
        ease: 'power2.out'
      })
      // Subtle oscillation for control effect
      .to(targetCard, {
        duration: 0.15,
        rotation: 0.05,
        ease: 'sine.inOut'
      })
      .to(targetCard, {
        duration: 0.15,
        rotation: -0.05,
        ease: 'sine.inOut'
      })
      .to(targetCard, {
        duration: 0.15,
        rotation: 0.03,
        ease: 'sine.inOut'
      })
      .to(targetCard, {
        duration: 0.15,
        rotation: -0.03,
        ease: 'sine.inOut'
      })
      .to(targetCard, {
        duration: 0.1,
        rotation: 0,
        ease: 'sine.inOut'
      })
      // Return to normal
      .to(targetCard, {
        duration: 0.4,
        tint: 0xFFFFFF,
        scale: 1.0,
        ease: 'power2.inOut'
      });
  }

  /**
   * Apply default effect with gentle glow
   */
  private static applyDefaultEffect(targetCard: Container, timeline: gsap.core.Timeline): void {
    timeline
      .to(targetCard, {
        duration: 0.2,
        tint: 0x66CCFF, // Cyan tint for neutral effects
        scale: 1.1,
        ease: 'power2.out'
      })
      .to(targetCard, {
        duration: 0.4,
        tint: 0xFFFFFF,
        scale: 1.0,
        ease: 'power2.inOut'
      });
  }

  /**
   * Show floating damage number
   */
  static showFloatingDamage(targetCard: Container, damage: number, isCritical: boolean): void {
    const damageText = new Text({
      text: `-${damage}`,
      style: {
        fontFamily: 'Arial',
        fontSize: isCritical ? 20 : 16,
        fill: isCritical ? 0xFF3333 : 0xFF6666,
        fontWeight: isCritical ? 'bold' : 'normal',
        stroke: { color: 0x000000, width: 2 }
      }
    });

    damageText.x = targetCard.x;
    damageText.y = targetCard.y - 30;
    damageText.anchor.set(0.5);
    damageText.alpha = 0;

    targetCard.addChild(damageText);

    gsap.timeline()
      .to(damageText, {
        duration: 0.2,
        alpha: 1,
        y: damageText.y - 20,
        scale: isCritical ? 1.2 : 1.0,
        ease: 'power2.out'
      })
      .to(damageText, {
        duration: 0.8,
        alpha: 0,
        y: damageText.y - 40,
        ease: 'power2.in',
        onComplete: () => {
          damageText.destroy();
        }
      });
  }

  /**
   * Show floating healing number
   */
  static showFloatingHealing(targetCard: Container, healing: number): void {
    const healingText = new Text({
      text: `+${healing}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0x44FF88,
        fontWeight: 'bold',
        stroke: { color: 0x006633, width: 2 }
      }
    });

    healingText.x = targetCard.x;
    healingText.y = targetCard.y - 30;
    healingText.anchor.set(0.5);
    healingText.alpha = 0;

    targetCard.addChild(healingText);

    gsap.timeline()
      .to(healingText, {
        duration: 0.2,
        alpha: 1,
        y: healingText.y - 20,
        scale: 1.2,
        ease: 'power2.out'
      })
      .to(healingText, {
        duration: 0.8,
        alpha: 0,
        y: healingText.y - 40,
        ease: 'power2.in',
        onComplete: () => {
          healingText.destroy();
        }
      });
  }

  /**
   * Simple character effect animation (fallback)
   */
  static async animateSimpleEffect(characterCard: Container): Promise<void> {
    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: resolve
      })
      .to(characterCard, {
        duration: 0.2,
        scale: 1.1,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.2,
        scale: 1.0,
        ease: 'power2.inOut'
      });
    });
  }

  /**
   * Animate energy increase on energy text
   */
  static async animateEnergyIncrease(energyText: Text): Promise<void> {
    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: resolve
      })
      // Bounce effect
      .to(energyText, {
        scale: 1.4,
        duration: 0.2,
        ease: 'back.out(2)'
      })
      // Glow effect by changing tint
      .to(energyText, {
        tint: 0xFFFF00, // Yellow glow
        duration: 0.2,
        ease: 'power2.out'
      }, 0)
      // Return to normal scale
      .to(energyText, {
        scale: 1.0,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)'
      })
      // Return to normal color
      .to(energyText, {
        tint: 0xFFFFFF,
        duration: 0.3,
        ease: 'power2.inOut'
      }, '-=0.3');
    });
  }
}
