import { Colors } from "@/utils/colors";
import { Container, Graphics } from "pixi.js";
import { CardInDeck } from "@/types";


export class HandZone extends Container {
  private handBg: Graphics;

  private handCards: CardInDeck[] = [];

  constructor() {
    super();
    
    this.handBg = new Graphics();
    this.addChild(this.handBg);
  }

  resize(width: number, height: number): void {
    this.handBg.roundRect(0, 0, width, height, 10)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
  }

}
