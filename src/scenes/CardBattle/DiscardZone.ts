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
    this.discardBg.roundRect(0, 0, width, height, 8)
      .fill(Colors.CARD_DISCARD)
      .stroke({ width: 2, color: Colors.UI_BORDER });
  
    const discardLabel = new Text({
      text: 'DISCARD PILE',
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    discardLabel.anchor.set(0.5);
    discardLabel.x = width / 2;
    discardLabel.y = height / 2;
  }
}
