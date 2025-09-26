import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";

export class BattleLogZone extends Container {
  private logBg: Graphics;
  private logTitle: Text;
  private logContent: Container;
  private logMessages: Text[] = [];

  constructor() {
    super();
    
    this.logBg = new Graphics();
    this.addChild(this.logBg);

    this.logTitle = new Text();
    this.addChild(this.logTitle);

    this.logContent = new Container();
    this.addChild(this.logContent);
  }

  resize(width: number, height: number): void {
    this.logBg.roundRect(0, 0, width, height, 10)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    this.logTitle.text = 'Battle Log';
    this.logTitle.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fill: Colors.TEXT_PRIMARY,
      align: 'center',
      fontWeight: 'bold'
    };
    this.logTitle.anchor.set(0.5);
    this.logTitle.x = width / 2;
    this.logTitle.y = 15;

    this.logContent.x = 10;
    this.logContent.y = 35;
    this.logContent.width = width - 20;
    this.logContent.height = height - 45;
  }

  addLogMessage(message: string): void {
    const messageText = new Text({
      text: message,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_SECONDARY,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: this.logContent.width
      }
    });

    // Position new message at the top
    messageText.y = this.logMessages.length * 18;
    
    this.logContent.addChild(messageText);
    this.logMessages.push(messageText);

    // Keep only last 5 messages
    if (this.logMessages.length > 5) {
      const oldMessage = this.logMessages.shift();
      if (oldMessage) {
        this.logContent.removeChild(oldMessage);
      }
      
      // Adjust positions of remaining messages
      this.logMessages.forEach((msg, index) => {
        msg.y = index * 18;
      });
    }
  }

  clearLog(): void {
    this.logContent.removeChildren();
    this.logMessages = [];
  }
}