import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';

export class UIButton {
  /**
   * Creates a styled button with responsive sizing
   */
  public static create(
    text: string, 
    x: number, 
    y: number, 
    width: number = 200, 
    height: number = 50,
    onClick?: () => void,
    baseFontSize: number = 18,
    gameWidth: number = 800,
    gameHeight: number = 600,
    standardPadding: number = 10
  ): Container {
    const button = new Container();
    
    // Ensure minimum touch target for mobile (44px) but scale down for small screens
    const minHeight = Math.min(44, gameHeight * 0.08);
    const adjustedHeight = Math.max(minHeight, height);
    
    // Adjust width for small screens - ensure it doesn't exceed available space
    const maxWidth = gameWidth - (2 * standardPadding);
    const adjustedWidth = Math.min(width, maxWidth);
    
    // Button background with orange gradient styling
    const bg = new Graphics();
    const buttonGradient = Colors.BUTTON_PRIMARY;
    bg.roundRect(0, 0, adjustedWidth, adjustedHeight, 8)
      .fill(buttonGradient)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });

    // Calculate responsive font size
    const responsiveFontSize = UIButton.calculateResponsiveFontSize(
      baseFontSize,
      adjustedWidth,
      gameWidth,
      Math.max(10, adjustedHeight * 0.25),
      Math.min(20, adjustedHeight * 0.5)
    );

    // Button text
    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: responsiveFontSize,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: adjustedWidth * 0.9
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = adjustedWidth / 2;
    buttonText.y = adjustedHeight / 2;
    
    button.addChild(bg, buttonText);
    button.x = x;
    button.y = y;
    button.interactive = true;
    button.cursor = 'pointer';
    
    // Hover effects
    button.on('pointerover', () => {
      bg.tint = Colors.BUTTON_HOVER;
    });
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    if (onClick) {
      button.on('pointerdown', onClick);
    }
    
    return button;
  }

  /**
   * Calculates responsive font size based on dimensions
   */
  private static calculateResponsiveFontSize(
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
}
