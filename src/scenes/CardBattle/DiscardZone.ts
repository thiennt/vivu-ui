import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";

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
    
    // Create enhanced mystical discard pile with depth
    // Deep shadow for depth
    this.discardBg.roundRect(2, 2, width, height, 12)
      .fill({ color: Colors.BATTLE_SHADOW_DEEP, alpha: 0.7 });
    
    // Main frame with battle styling
    this.discardBg.roundRect(0, 0, width, height, 12)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 3, color: Colors.BATTLE_FRAME_GOLD });
    
    // Mystical inner glow
    this.discardBg.roundRect(2, 2, width - 4, height - 4, 10)
      .stroke({ width: 1, color: Colors.MYSTICAL_GLOW, alpha: 0.8 });
    
    // Discard pile area with enhanced mystical look
    this.discardBg.roundRect(4, 4, width - 8, height - 8, 8)
      .fill(Colors.CARD_DISCARD)
      .stroke({ width: 2, color: Colors.BATTLE_MAGIC_AURA, alpha: 0.7 });
    
    // Add energy orb indicators in corners
    const orbSize = 2;
    const orbOffset = 8;
    
    this.discardBg.circle(orbOffset, orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.9 });
    
    this.discardBg.circle(width - orbOffset, orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.9 });
    
    this.discardBg.circle(orbOffset, height - orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.9 });
    
    this.discardBg.circle(width - orbOffset, height - orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.9 });
  
    // Update label with enhanced styling
    this.discardLabel.text = '🔥 DISCARD 🔥';
    this.discardLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 11,
      fontWeight: 'bold',
      fill: Colors.BATTLE_FRAME_GOLD,
      align: 'center',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 3,
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
