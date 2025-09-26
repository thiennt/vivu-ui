import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";

export class BattleLogZone extends Container {
  private logBg: Graphics;
  private logTitle: Text;

  constructor() {
    super();
    
    this.logBg = new Graphics();
    this.addChild(this.logBg);

    this.logTitle = new Text();
    this.addChild(this.logTitle);
  }

  resize(width: number, height: number): void {
    this.logBg.roundRect(0, 0, width, height, 8)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });

    this.logTitle.text = 'Battle Log';
    this.logTitle.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY,
      align: 'center'
    };
    this.logTitle.anchor.set(0.5);
    this.logTitle.x = width / 2;
    this.logTitle.y = height / 2;
  }
}