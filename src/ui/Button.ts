import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { gsap } from 'gsap';

const defaultButtonOptions = {
  text: '',
  width: 200,
  height: 50,
  baseFontSize: 16, // Reduced from 18 for 400x700
  gameWidth: 800,
  gameHeight: 600,
  standardPadding: 8, // Reduced from 10
  disabled: false,
};

export type ButtonOptions = typeof defaultButtonOptions;

/**
 * A styled button with responsive sizing and hover effects
 */
export class Button extends Container {
  private bg: Graphics;
  private buttonText: Text;
  private adjustedWidth: number;
  private adjustedHeight: number;
  private onClick?: () => void;
  private disabled: boolean;

  constructor(options: Partial<ButtonOptions> & { onClick?: () => void } = {}) {
    super();
    
    const opts = { ...defaultButtonOptions, ...options };
    this.onClick = options.onClick;
    this.disabled = opts.disabled;
    
    // Ensure minimum touch target for mobile but more compact for 400x700
    const minHeight = Math.min(40, opts.gameHeight * 0.07); // Reduced from 44 and 0.08
    this.adjustedHeight = Math.max(minHeight, opts.height);
    
    // Adjust width for small screens - ensure it doesn't exceed available space
    const maxWidth = opts.gameWidth - (2 * opts.standardPadding);
    this.adjustedWidth = Math.min(opts.width, maxWidth);
    
    // Button background with fantasy button styling
    this.bg = new Graphics();
    this.drawButton();
    
    this.addChild(this.bg);

    // Calculate responsive font size - more compact for 400x700
    const responsiveFontSize = this.calculateResponsiveFontSize(
      opts.baseFontSize,
      this.adjustedWidth,
      opts.gameWidth,
      Math.max(10, this.adjustedHeight * 0.25),
      Math.min(18, this.adjustedHeight * 0.45) // Reduced max from 20 to 18
    );

    // Button text with fantasy button styling
    const textColor = this.disabled ? Colors.GRAY_LIGHTER : Colors.WHITE;
    const strokeColor = this.disabled ? Colors.ROBOT_BG_DARK : Colors.ROBOT_CYAN;
    this.buttonText = new Text({
      text: opts.text,
      style: {
        fontFamily: 'Orbitron',
        fontSize: responsiveFontSize,
        fontWeight: 'bold',
        fill: textColor,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.adjustedWidth * 0.9,
        stroke: {
          color: strokeColor,
          width: 2
        }
      }
    });
    this.buttonText.anchor.set(0.5);
    this.buttonText.x = this.adjustedWidth / 2;
    this.buttonText.y = this.adjustedHeight / 2;
    
    this.addChild(this.buttonText);
    
    if (!this.disabled) {
      this.interactive = true;
      this.cursor = 'pointer';
      
      // Hover effects
      this.on('pointerover', this.handleHover.bind(this));
      this.on('pointerout', this.handleOut.bind(this));
      
      if (this.onClick) {
        this.on('pointerdown', this.onClick);
      }
    }
  }

  private drawButton(hovered: boolean = false) {
    this.bg.clear();
    
    // Drop shadow effect
    this.bg.roundRect(2, 2, this.adjustedWidth, this.adjustedHeight, 8)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    
    // Determine colors based on disabled state
    const mainColor = this.disabled ? Colors.GRAY : (hovered ? Colors.ROBOT_BG_MID : Colors.ROBOT_ELEMENT);
    const strokeColor = this.disabled ? Colors.GRAY_MID : Colors.ROBOT_CYAN;
    const highlightColor = this.disabled ? Colors.GRAY_LIGHT : Colors.ROBOT_CYAN;
    const innerAlpha = this.disabled ? 0.6 : (hovered ? 0.9 : 0.6);
    
    // Main button background
    this.bg.roundRect(0, 0, this.adjustedWidth, this.adjustedHeight, 8)
      .fill({ color: mainColor, alpha: 0.95 })
      .stroke({ width: 2, color: strokeColor });
    
    // Inner highlight border
    this.bg.roundRect(2, 2, this.adjustedWidth - 4, this.adjustedHeight - 4, 6)
      .stroke({ width: 1, color: highlightColor, alpha: innerAlpha });
  }

  private handleHover() {
    this.drawButton(true);
    this.scale.set(1.02);
  }

  private handleOut() {
    this.drawButton(false);
    this.scale.set(1.0);
  }

  /**
   * Calculates responsive font size based on dimensions
   */
  private calculateResponsiveFontSize(
    baseSize: number,
    cardWidth: number,
    screenWidth: number,
    minSize: number = 8,
    maxSize: number = 24
  ): number {
    const baseCardWidth = 120;
    const cardScale = cardWidth / baseCardWidth;
    
    const baseScreenWidth = 800;
    const screenScale = Math.min(screenWidth / baseScreenWidth, 1.2);
    
    const scaledSize = baseSize * cardScale * screenScale;
    
    return Math.max(minSize, Math.min(maxSize, scaledSize));
  }

  /** Show the button with optional animation */
  public async show(animated = true) {
    gsap.killTweensOf(this);
    this.visible = true;
    if (animated) {
      this.alpha = 0;
      await gsap.to(this, { alpha: 1, duration: 0.3, ease: 'power2.out' });
    } else {
      this.alpha = 1;
    }
  }

  /** Hide the button with optional animation */
  public async hide(animated = true) {
    gsap.killTweensOf(this);
    if (animated) {
      await gsap.to(this, { alpha: 0, duration: 0.3, ease: 'power2.in' });
    } else {
      this.alpha = 0;
    }
    this.visible = false;
  }
}
