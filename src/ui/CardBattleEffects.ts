/**
 * CardBattleEffects - Handles all animation effects for card battle scenes
 * Provides reusable animation methods for character skills, target effects, and visual feedback
 * Uses Graphics overlays and standard GSAP properties instead of PixiPlugin for tint effects
 * 
 * Enhanced with particle effects, screen shake, radial glows, and impact waves
 */

import { Container, Text, Graphics, Sprite } from 'pixi.js';
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
  private static createColorOverlay(container: Container, color: number, initialAlpha: number = 0): Graphics {
    const bounds = container.getLocalBounds();
    const overlay = new Graphics();
    overlay.rect(0, 0, bounds.width, bounds.height);
    overlay.fill({ color: color });
    overlay.alpha = initialAlpha;

    overlay.x = bounds.x;
    overlay.y = bounds.y;

    // Always add overlay as the top child for visibility
    container.addChild(overlay);

    return overlay;
  }

  /**
   * Create a radial glow effect around a container
   */
  private static createRadialGlow(container: Container, color: number, radius: number = 50): Graphics {
    const glow = new Graphics();
    glow.circle(0, 0, radius);
    glow.fill({ color: color, alpha: 0 });
    
    // Center the glow on the container
    const bounds = container.getLocalBounds();
    glow.x = bounds.x + bounds.width / 2;
    glow.y = bounds.y + bounds.height / 2;
    
    container.addChildAt(glow, 0); // Add behind other elements
    return glow;
  }

  /**
   * Create particle burst effect
   */
  private static createParticleBurst(
    container: Container,
    color: number,
    particleCount: number = 8
  ): Graphics[] {
    const particles: Graphics[] = [];
    const bounds = container.getLocalBounds();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    for (let i = 0; i < particleCount; i++) {
      const particle = new Graphics();
      const size = 4 + Math.random() * 4;
      particle.circle(0, 0, size);
      particle.fill({ color: color, alpha: 0.8 });
      particle.x = centerX;
      particle.y = centerY;
      
      container.addChild(particle);
      particles.push(particle);
    }

    return particles;
  }

  /**
   * Create an impact wave effect
   */
  private static createImpactWave(container: Container, color: number): Graphics {
    const bounds = container.getLocalBounds();
    const wave = new Graphics();
    wave.circle(0, 0, 20);
    wave.stroke({ width: 3, color: color, alpha: 0 });
    
    wave.x = bounds.x + bounds.width / 2;
    wave.y = bounds.y + bounds.height / 2;
    
    container.addChild(wave);
    return wave;
  }

  /**
   * Animate screen shake effect (container shake)
   */
  private static async animateScreenShake(
    container: Container,
    intensity: number = 5,
    duration: number = 0.3
  ): Promise<void> {
    const originalX = container.x;
    const originalY = container.y;
    
    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: () => {
          container.x = originalX;
          container.y = originalY;
          resolve();
        }
      })
      .to(container, {
        duration: duration / 6,
        x: originalX + intensity,
        y: originalY + intensity * 0.5,
        ease: 'power2.out'
      })
      .to(container, {
        duration: duration / 6,
        x: originalX - intensity,
        y: originalY - intensity * 0.5,
        ease: 'power2.inOut'
      })
      .to(container, {
        duration: duration / 6,
        x: originalX + intensity * 0.5,
        y: originalY + intensity * 0.3,
        ease: 'power2.inOut'
      })
      .to(container, {
        duration: duration / 6,
        x: originalX - intensity * 0.5,
        y: originalY - intensity * 0.3,
        ease: 'power2.inOut'
      })
      .to(container, {
        duration: duration / 3,
        x: originalX,
        y: originalY,
        ease: 'power2.inOut'
      });
    });
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
   * High Damage animation: aggressive forward lunge with enhanced effects
   */
  private static animateDamageSkill(characterCard: Container, timeline: gsap.core.Timeline): void {
    const originalX = characterCard.x;
    const overlay = this.createColorOverlay(characterCard, 0xFF4444, 0);
    const glow = this.createRadialGlow(characterCard, 0xFF0000, 60);
    
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
      .to(glow, {
        alpha: 0.4,
        scale: 1.5,
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
      }, '-=0.3')
      .to(glow, {
        alpha: 0,
        scale: 2,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => glow.destroy()
      }, '-=0.3');
  }

  /**
   * Healing & Support animation: gentle glow and pulse with sparkle particles
   */
  private static animateHealingSkill(characterCard: Container, timeline: gsap.core.Timeline): void {
    const overlay = this.createColorOverlay(characterCard, 0x44FF44, 0);
    const glow = this.createRadialGlow(characterCard, 0x44FF88, 70);
    const particles = this.createParticleBurst(characterCard, 0x88FFAA, 10);
    
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
      .to(glow, {
        alpha: 0.6,
        scale: 1.8,
        duration: 0.3,
        ease: 'sine.out'
      }, 0)
      // Animate particles outward
      .add(() => {
        particles.forEach((particle, index) => {
          const angle = (index / particles.length) * Math.PI * 2;
          const distance = 40 + Math.random() * 20;
          gsap.timeline()
            .to(particle, {
              x: particle.x + Math.cos(angle) * distance,
              y: particle.y + Math.sin(angle) * distance,
              alpha: 0,
              duration: 0.6,
              ease: 'power2.out',
              onComplete: () => particle.destroy()
            });
        });
      }, 0.2)
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
      }, '-=0.4')
      .to(glow, {
        alpha: 0,
        scale: 2.5,
        duration: 0.4,
        ease: 'sine.inOut',
        onComplete: () => glow.destroy()
      }, '-=0.4');
  }

  /**
   * Control & Debuff animation: dark energy waves and shake
   */
  private static animateDebuffSkill(characterCard: Container, timeline: gsap.core.Timeline): void {
    const originalX = characterCard.x;
    const overlay = this.createColorOverlay(characterCard, 0x8844FF, 0);
    const wave1 = this.createImpactWave(characterCard, 0x8844FF);
    const wave2 = this.createImpactWave(characterCard, 0x6622DD);
    
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
      // Animate waves
      .to(wave1, {
        alpha: 0.8,
        scale: 3,
        duration: 0.4,
        ease: 'power2.out'
      }, 0)
      .to(wave2, {
        alpha: 0.6,
        scale: 4,
        duration: 0.5,
        ease: 'power2.out'
      }, 0.1)
      .to(wave1, {
        alpha: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => wave1.destroy()
      }, 0.4)
      .to(wave2, {
        alpha: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => wave2.destroy()
      }, 0.5)
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
   * Apply damage effect with recoil, shake, and impact waves
   */
  private static applyDamageEffect(
    targetCard: Container,
    timeline: gsap.core.Timeline,
    damage: number,
    isCritical: boolean
  ): void {
    const originalX = targetCard.x;
    const overlay = this.createColorOverlay(targetCard, 0xFF3333, 0);
    const impactWave = this.createImpactWave(targetCard, 0xFF0000);
    const particles = isCritical ? this.createParticleBurst(targetCard, 0xFF6666, 12) : [];
    
    timeline
      .to(overlay, {
        duration: 0.08,
        alpha: 0.7,
        ease: 'power2.out',
      })
      // Impact wave effect
      .to(impactWave, {
        alpha: isCritical ? 0.9 : 0.7,
        scale: isCritical ? 4 : 3,
        duration: 0.3,
        ease: 'power2.out'
      }, 0)
      .to(impactWave, {
        alpha: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => impactWave.destroy()
      }, 0.3)
      // Strong recoil effect
      .to(targetCard, {
        duration: isCritical ? 0.15 : 0.12,
        scale: isCritical ? 0.8 : 0.85,
        rotation: isCritical ? 0.15 : 0.08,
        ease: 'power2.out'
      }, 0)
      // Animate critical particles
      .add(() => {
        if (isCritical) {
          particles.forEach((particle, index) => {
            const angle = (index / particles.length) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            gsap.timeline()
              .to(particle, {
                x: particle.x + Math.cos(angle) * distance,
                y: particle.y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 0.5,
                ease: 'power2.out',
                onComplete: () => particle.destroy()
              });
          });
        }
      }, 0.1)
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
   * Apply healing effect with gentle restore, sparkle, and radial glow
   */
  private static applyHealingEffect(targetCard: Container, timeline: gsap.core.Timeline): void {
    const overlay = this.createColorOverlay(targetCard, 0x44FF88, 0);
    const glow = this.createRadialGlow(targetCard, 0x44FF88, 80);
    const particles = this.createParticleBurst(targetCard, 0xAAFFCC, 8);
    
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
      .to(glow, {
        alpha: 0.7,
        scale: 2,
        duration: 0.25,
        ease: 'sine.out'
      }, 0)
      // Animate particles upward
      .add(() => {
        particles.forEach((particle) => {
          const xOffset = (Math.random() - 0.5) * 40;
          gsap.timeline()
            .to(particle, {
              x: particle.x + xOffset,
              y: particle.y - 50 - Math.random() * 30,
              alpha: 0,
              duration: 0.7,
              ease: 'power1.out',
              onComplete: () => particle.destroy()
            });
        });
      }, 0.1)
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
      }, '-=0.4')
      .to(glow, {
        alpha: 0,
        scale: 3,
        duration: 0.4,
        ease: 'sine.inOut',
        onComplete: () => glow.destroy()
      }, '-=0.4');
  }

  /**
   * Apply debuff effect with pulsing dark energy and waves
   */
  private static applyDebuffEffect(
    targetCard: Container,
    timeline: gsap.core.Timeline,
    isDebuff: boolean
  ): void {
    const effectColor = isDebuff ? 0x8844FF : 0x44AAFF; // Purple for debuff, blue for effect/status
    const overlay = this.createColorOverlay(targetCard, effectColor, 0);
    const wave = this.createImpactWave(targetCard, effectColor);
    const glow = this.createRadialGlow(targetCard, effectColor, 60);
    
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
      .to(wave, {
        alpha: 0.6,
        scale: 3.5,
        duration: 0.5,
        ease: 'power2.out'
      }, 0)
      .to(wave, {
        alpha: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => wave.destroy()
      }, 0.5)
      .to(glow, {
        alpha: 0.5,
        scale: 1.5,
        duration: 0.3,
        ease: 'sine.inOut'
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
      }, '-=0.4')
      .to(glow, {
        alpha: 0,
        scale: 2.5,
        duration: 0.4,
        ease: 'sine.inOut',
        onComplete: () => glow.destroy()
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

    // Center of the card
    damageText.x = targetCard.width / 2;
    damageText.y = targetCard.height / 2 - 30;
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

    healingText.x = targetCard.width / 2;
    healingText.y = targetCard.height / 2 - 30;

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
   * Animate energy increase on energy text with enhanced glow
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
      
      // Create outer glow ring
      const outerGlow = new Graphics();
      outerGlow.circle(0, 0, 30);
      outerGlow.stroke({ width: 2, color: 0xFFDD00, alpha: 0 });
      outerGlow.x = energyText.width / 2;
      outerGlow.y = energyText.height / 2;
      energyText.addChildAt(outerGlow, 0);
      
      gsap.timeline({
        onComplete: () => {
          glowCircle.destroy();
          outerGlow.destroy();
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
      // Outer glow expansion
      .to(outerGlow, {
        alpha: 0.8,
        scale: 1.5,
        duration: 0.3,
        ease: 'power2.out'
      }, 0)
      .to(outerGlow, {
        alpha: 0,
        scale: 2,
        duration: 0.2,
        ease: 'power2.in'
      }, 0.3)
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

  /**
   * Screen flash effect for dramatic moments (e.g., critical hits)
   * Can be called on the scene's main container for full-screen effect
   */
  static async animateScreenFlash(
    container: Container,
    color: number = 0xFFFFFF,
    intensity: number = 0.6,
    duration: number = 0.2
  ): Promise<void> {
    // Create a full-screen flash overlay
    const flash = new Graphics();
    flash.rect(0, 0, 10000, 10000); // Large enough to cover screen
    flash.fill({ color: color, alpha: 0 });
    flash.x = -5000;
    flash.y = -5000;
    
    container.addChild(flash);
    
    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: () => {
          flash.destroy();
          resolve();
        }
      })
      .to(flash, {
        alpha: intensity,
        duration: duration * 0.3,
        ease: 'power2.out'
      })
      .to(flash, {
        alpha: 0,
        duration: duration * 0.7,
        ease: 'power2.in'
      });
    });
  }

  /**
   * Public screen shake method for dramatic impact
   */
  static async shakeScreen(
    container: Container,
    intensity: number = 5
  ): Promise<void> {
    return this.animateScreenShake(container, intensity, 0.3);
  }

  /**
   * Find and extract avatar sprite from a character card
   */
  private static findAvatarSprite(characterCard: Container): Sprite | null {
    // Search through children to find the avatar sprite
    for (const child of characterCard.children) {
      if (child instanceof Sprite && child.texture) {
        // Avatar sprites typically have anchor at (0.5, 0.5) and are positioned at the card center
        if (child.anchor && Math.abs(child.anchor.x - 0.5) < 0.01 && Math.abs(child.anchor.y - 0.5) < 0.01) {
          return child;
        }
      }
    }
    return null;
  }

  /**
   * Animate avatar as a flying projectile skill effect
   * Creates a clone of the character's avatar that flies from attacker to target
   * 
   * @param effectsContainer - Container to add the effect to (should be above cards)
   * @param attackerCard - The attacking character's card
   * @param targetCard - The target character's card
   * @param cardGroup - Type of skill effect (damage/healing/debuff/other)
   * @returns Promise that resolves when animation completes
   */
  static async animateAvatarSkillEffect(
    effectsContainer: Container,
    attackerCard: Container,
    targetCard: Container,
    cardGroup: CardGroup = 'other'
  ): Promise<void> {
    // Find avatar sprite in the attacker card
    const avatarSprite = this.findAvatarSprite(attackerCard);
    if (!avatarSprite || !avatarSprite.texture) {
      console.warn('Avatar sprite not found in character card');
      return;
    }

    // Create a clone of the avatar for the projectile effect
    const avatarClone = new Sprite(avatarSprite.texture);
    avatarClone.anchor.set(0.5);
    avatarClone.width = avatarSprite.width;
    avatarClone.height = avatarSprite.height;
    
    // Get world positions of attacker and target
    const attackerPos = attackerCard.toGlobal({ x: attackerCard.width / 2, y: attackerCard.height / 2 });
    const targetPos = targetCard.toGlobal({ x: targetCard.width / 2, y: targetCard.height / 2 });
    
    // Convert to local coordinates of effects container
    const startPos = effectsContainer.toLocal(attackerPos);
    const endPos = effectsContainer.toLocal(targetPos);
    
    avatarClone.x = startPos.x;
    avatarClone.y = startPos.y;
    avatarClone.alpha = 0;
    avatarClone.scale.set(0.8);
    
    effectsContainer.addChild(avatarClone);

    // Create glow effect based on card group
    const glowColor = this.getGlowColorForCardGroup(cardGroup);
    const glow = new Graphics();
    glow.circle(0, 0, Math.max(avatarClone.width, avatarClone.height) * 0.8);
    glow.fill({ color: glowColor, alpha: 0 });
    avatarClone.addChild(glow);

    // Create trail particles
    const trailParticles: Graphics[] = [];
    
    return new Promise((resolve) => {
      const duration = 0.6;
      const timeline = gsap.timeline({
        onComplete: () => {
          avatarClone.destroy({ children: true });
          trailParticles.forEach(p => p.destroy());
          resolve();
        }
      });

      // Phase 1: Fade in and scale up
      timeline
        .to(avatarClone, {
          alpha: 1,
          scale: 1.2,
          duration: 0.15,
          ease: 'power2.out'
        })
        // Phase 2: Fly to target with rotation
        .to(avatarClone, {
          x: endPos.x,
          y: endPos.y,
          rotation: Math.PI * 2,
          duration: duration,
          ease: 'power2.inOut',
          onUpdate: () => {
            // Create trail particles during flight
            if (Math.random() > 0.7) {
              const particle = new Graphics();
              particle.circle(0, 0, 3 + Math.random() * 3);
              particle.fill({ color: glowColor, alpha: 0.8 });
              particle.x = avatarClone.x;
              particle.y = avatarClone.y;
              effectsContainer.addChild(particle);
              trailParticles.push(particle);
              
              gsap.to(particle, {
                alpha: 0,
                scale: 0.5,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => {
                  particle.destroy();
                  const index = trailParticles.indexOf(particle);
                  if (index > -1) {
                    trailParticles.splice(index, 1);
                  }
                }
              });
            }
          }
        }, 0.15)
        // Animate glow during flight
        .to(glow, {
          alpha: 0.6,
          scale: 1.3,
          duration: duration * 0.5,
          ease: 'power2.out'
        }, 0.15)
        .to(glow, {
          alpha: 0,
          scale: 1.8,
          duration: duration * 0.5,
          ease: 'power2.in'
        }, 0.15 + duration * 0.5)
        // Phase 3: Impact - scale up and fade out
        .to(avatarClone, {
          scale: 1.5,
          alpha: 0,
          duration: 0.2,
          ease: 'power2.out'
        });
    });
  }

  /**
   * Get glow color based on card group type
   */
  private static getGlowColorForCardGroup(cardGroup: CardGroup): number {
    switch (cardGroup) {
      case 'damage':
        return 0xFF4444;
      case 'healing':
        return 0x44FF88;
      case 'debuff':
        return 0x8844FF;
      default:
        return 0x66CCFF;
    }
  }
}