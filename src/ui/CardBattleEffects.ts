/**
 * CardBattleEffects - Handles all animation effects for card battle scenes
 * Provides reusable animation methods for character skills, target effects, and visual feedback
 * Uses Graphics overlays and standard GSAP properties instead of PixiPlugin for tint effects
 */

import { Container, Text, Graphics } from 'pixi.js';
import { gsap } from 'gsap';
import { CardBattleLogTarget } from '@/types';

export type CardGroup = 'damage' | 'healing' | 'debuff' | 'other';

/**
 * Centralized effect animations for card battles
 */
export class CardBattleEffects {
  /**
   * Create a color overlay for visual effects (replacement for tint)
   */
  private static createColorOverlay(container: Container, color: number, alpha: number = 0): Graphics {
    let bounds = container.getLocalBounds();
    const overlay = new Graphics();
    overlay.rect(0, 0, bounds.width, bounds.height);
    overlay.fill({ color: color });

    overlay.x = bounds.x;
    overlay.y = bounds.y;

    // Always add overlay as the top child for visibility
    container.addChild(overlay);

    return overlay;
  }

  /**
   * Animate a color flash effect using an overlay
   */
  private static async animateColorFlash(
    container: Container,
    color: number,
    duration: number = 0.3,
    maxAlpha: number = 0.5
  ): Promise<void> {
    const overlay = this.createColorOverlay(container, color, 1);
    
    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: () => {
          overlay.destroy();
          resolve();
        }
      })
      .to(overlay, {
        alpha: maxAlpha,
        duration: duration * 0.4,
        ease: 'power2.out'
      })
      .to(overlay, {
        alpha: 0,
        duration: duration * 0.6,
        ease: 'power2.inOut'
      });
    });
  }
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
    const overlay = this.createColorOverlay(characterCard, 0xFF4444, 0);
    
    timeline
      .to([characterCard], {
        duration: 0.15,
        scale: 1.2,
        ease: 'power2.out'
      })
      .to(overlay, {
        alpha: 0.6,
        duration: 0.15,
        ease: 'power2.out'
      }, 0)
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
        ease: 'power2.inOut',
      })
      .to(overlay, {
        alpha: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => overlay.destroy()
      }, '-=0.3');
  }

  /**
   * Healing & Support animation: gentle glow and pulse
   */
  private static animateHealingSkill(characterCard: Container, timeline: gsap.core.Timeline): void {
    const overlay = this.createColorOverlay(characterCard, 0x44FF44, 0);
    
    timeline
      .to(characterCard, {
        duration: 0.3,
        scale: 1.1,
        ease: 'sine.inOut',
      })
      .to(overlay, {
        alpha: 0.5,
        duration: 0.3,
        ease: 'sine.inOut',
      }, 0)
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
        ease: 'sine.inOut',
      })
      .to(overlay, {
        alpha: 0,
        duration: 0.4,
        ease: 'sine.inOut',
        onComplete: () => overlay.destroy()
      }, '-=0.4');
  }

  /**
   * Control & Debuff animation: dark energy and shake
   */
  private static animateDebuffSkill(characterCard: Container, timeline: gsap.core.Timeline): void {
    const originalX = characterCard.x;
    const overlay = this.createColorOverlay(characterCard, 0x8844FF, 0);
    
    timeline
      .to(characterCard, {
        duration: 0.2,
        scale: 1.15,
        ease: 'power2.out',
      })
      .to(overlay, {
        alpha: 0.5,
        duration: 0.2,
        ease: 'power2.out',
      }, 0)
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
        ease: 'power2.inOut',
      })
      .to(overlay, {
        alpha: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => overlay.destroy()
      }, '-=0.3');
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
    const overlay = this.createColorOverlay(targetCard, 0xFF3333, 0);
    
    timeline
      .to(overlay, {
        duration: 0.08,
        alpha: 0.7,
        ease: 'power2.out',
      })
      // Strong recoil effect
      .to(targetCard, {
        duration: isCritical ? 0.15 : 0.12,
        scale: isCritical ? 0.8 : 0.85,
        rotation: isCritical ? 0.15 : 0.08,
        ease: 'power2.out'
      }, 0)
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
        scale: 1.0,
        rotation: 0,
        ease: 'elastic.out(1, 0.5)',
      })
      .to(overlay, {
        alpha: 0,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)',
        onComplete: () => overlay.destroy()
      }, '-=0.3');
  }

  /**
   * Apply healing effect with gentle restore and sparkle
   */
  private static applyHealingEffect(targetCard: Container, timeline: gsap.core.Timeline): void {
    const overlay = this.createColorOverlay(targetCard, 0x44FF88, 0);
    
    timeline
      .to(targetCard, {
        duration: 0.25,
        scale: 1.15,
        ease: 'sine.out',
      })
      .to(overlay, {
        alpha: 0.5,
        duration: 0.25,
        ease: 'sine.out',
      }, 0)
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
        scale: 1.0,
        ease: 'sine.inOut',
      })
      .to(overlay, {
        alpha: 0,
        duration: 0.4,
        ease: 'sine.inOut',
        onComplete: () => overlay.destroy()
      }, '-=0.4');
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
    const overlay = this.createColorOverlay(targetCard, effectColor, 0);
    
    timeline
      .to(targetCard, {
        duration: 0.2,
        scale: 1.08,
        ease: 'power2.out',
      })
      .to(overlay, {
        alpha: 0.5,
        duration: 0.2,
        ease: 'power2.out',
      }, 0)
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
        scale: 1.0,
        ease: 'power2.inOut',
      })
      .to(overlay, {
        alpha: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => overlay.destroy()
      }, '-=0.4');
  }

  /**
   * Apply default effect with gentle glow
   */
  private static applyDefaultEffect(targetCard: Container, timeline: gsap.core.Timeline): void {
    const overlay = this.createColorOverlay(targetCard, 0x66CCFF, 0);
    
    timeline
      .to(targetCard, {
        duration: 0.2,
        scale: 1.1,
        ease: 'power2.out',
      })
      .to(overlay, {
        alpha: 0.4,
        duration: 0.2,
        ease: 'power2.out',
      }, 0)
      .to(targetCard, {
        duration: 0.4,
        scale: 1.0,
        ease: 'power2.inOut',
      })
      .to(overlay, {
        alpha: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => overlay.destroy()
      }, '-=0.4');
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
      // Create a glow effect using a Graphics object behind the text
      const glowCircle = new Graphics();
      glowCircle.circle(0, 0, 20);
      glowCircle.fill({ color: 0xFFFF00, alpha: 0 });
      glowCircle.x = energyText.width / 2;
      glowCircle.y = energyText.height / 2;
      
      // Add glow behind text
      energyText.addChildAt(glowCircle, 0);
      
      gsap.timeline({
        onComplete: () => {
          glowCircle.destroy();
          resolve();
        }
      })
      // Bounce effect
      .to(energyText, {
        scale: 1.4,
        duration: 0.2,
        ease: 'back.out(2)'
      })
      // Glow effect
      .to(glowCircle, {
        alpha: 0.6,
        duration: 0.2,
        ease: 'power2.out',
      }, 0)
      // Return to normal scale
      .to(energyText, {
        scale: 1.0,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)'
      })
      // Fade glow
      .to(glowCircle, {
        alpha: 0,
        duration: 0.3,
        ease: 'power2.inOut',
      }, '-=0.3');
    });
  }
}