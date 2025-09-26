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
    this.discardBg.roundRect(0, 0, width, height, 8)
      .fill(Colors.CARD_DISCARD)
      .stroke({ width: 2, color: Colors.UI_BORDER });
  
    // Update label instead of creating new one
    this.discardLabel.text = 'DISCARD PILE';
    this.discardLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 10,
      fill: Colors.TEXT_PRIMARY,
      align: 'center'
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
