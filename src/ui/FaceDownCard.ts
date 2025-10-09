import { Container, Graphics } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { gsap } from 'gsap';

const defaultFaceDownCardOptions = {
  width: 70,
  height: 100,
};

export type FaceDownCardOptions = typeof defaultFaceDownCardOptions;

/**
 * A face-down card with decorative pattern
 */
export class FaceDownCard extends Container {
  constructor(options: Partial<FaceDownCardOptions> = {}) {
    super();
    
    const opts = { ...defaultFaceDownCardOptions, ...options };
    const { width, height } = opts;

    // Card shadow for depth
    const bg = new Graphics();
    bg.roundRect(3, 3, width, height, 8)
      .fill({ color: Colors.SHADOW_COLOR, alpha: 0.3 });
    
    // Main card background - use a darker color for card back
    bg.roundRect(0, 0, width, height, 8)
      .fill(Colors.CARD_BACK_DARK) // Dark blue-gray for card back
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Inner card frame
    bg.roundRect(4, 4, width - 8, height - 8, 4)
      .stroke({ width: 1, color: Colors.CARD_BORDER, alpha: 0.5 });
    
    // Decorative pattern in center - a simple diamond/star pattern
    const centerX = width / 2;
    const centerY = height / 2;
    const patternSize = Math.min(width, height) * 0.4;
    
    const pattern = new Graphics();
    // Draw a decorative diamond pattern
    pattern.poly([
      centerX, centerY - patternSize / 2,
      centerX + patternSize / 4, centerY,
      centerX, centerY + patternSize / 2,
      centerX - patternSize / 4, centerY
    ])
      .fill({ color: Colors.CARD_BACK_PATTERN_1, alpha: 0.5 })
      .stroke({ width: 1, color: Colors.CARD_BORDER, alpha: 0.3 });
    
    // Add a smaller inner diamond
    pattern.poly([
      centerX, centerY - patternSize / 4,
      centerX + patternSize / 8, centerY,
      centerX, centerY + patternSize / 4,
      centerX - patternSize / 8, centerY
    ])
      .fill({ color: Colors.CARD_BACK_PATTERN_2, alpha: 0.5 });

    this.addChild(bg, pattern);
  }

  /** Show the card with optional animation */
  public async show(animated = true) {
    gsap.killTweensOf(this);
    this.visible = true;
    if (animated) {
      this.alpha = 0;
      this.scale.set(0.5);
      await gsap.to(this, { alpha: 1, duration: 0.3, ease: 'power2.out' });
      await gsap.to(this.scale, { x: 1, y: 1, duration: 0.3, ease: 'back.out' });
    } else {
      this.alpha = 1;
      this.scale.set(1);
    }
  }

  /** Hide the card with optional animation */
  public async hide(animated = true) {
    gsap.killTweensOf(this);
    if (animated) {
      await gsap.to(this.scale, { x: 0.5, y: 0.5, duration: 0.2, ease: 'back.in' });
      await gsap.to(this, { alpha: 0, duration: 0.2, ease: 'power2.in' });
    } else {
      this.alpha = 0;
      this.scale.set(0.5);
    }
    this.visible = false;
  }
}
