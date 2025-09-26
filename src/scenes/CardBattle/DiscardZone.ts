import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";
import { VisualEffects } from "@/utils/visualEffects";

export class DiscardZone extends Container {
  private discardBg: Graphics;
  private discardLabel: Text;

  constructor() {
    super();
    
    this.discardBg = new Graphics();
    this.addChild(this.discardBg);

    this.discardBg.interactive = true;

    this.discardLabel = new Text();
    this.addChild(this.discardLabel);
  }

  resize(width: number, height: number): void {
    this.discardBg.clear();
    
    // Create enhanced frame background directly without using addChild on Graphics
    this.discardBg.roundRect(0, 0, width, height, 12)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 3, color: Colors.DECORATION_FRAME });
    
    // Add inner highlight
    const innerPadding = 3;
    this.discardBg.roundRect(innerPadding, innerPadding, width - innerPadding * 2, height - innerPadding * 2, 8)
      .stroke({ width: 1, color: Colors.DECORATION_INNER_GLOW, alpha: 0.6 });
    
    // Add darker inner area
    this.discardBg.roundRect(4, 4, width - 8, height - 8, 8)
      .fill(Colors.CARD_DISCARD)
      .stroke({ width: 1, color: Colors.UI_BORDER_GLOW, alpha: 0.5 });
  
    // Update label with enhanced styling
    this.discardLabel.text = 'DISCARD PILE';
    this.discardLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 11,
      fontWeight: 'bold',
      fill: Colors.DECORATION_FRAME,
      align: 'center',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 2,
        angle: Math.PI / 4,
        distance: 2
      }
    };
    this.discardLabel.anchor.set(0.5);
    this.discardLabel.x = width / 2;
    this.discardLabel.y = height / 2;
  }

  // Method to check if coordinates are within discard zone bounds
  isPointInside(globalX: number, globalY: number): boolean {
    const bounds = this.getBounds();
    return globalX >= bounds.x && globalX <= bounds.x + bounds.width &&
           globalY >= bounds.y && globalY <= bounds.y + bounds.height;
  }
}
