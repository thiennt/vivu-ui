import { Colors } from "@/utils/colors";
import { Container, Graphics, Text, FederatedPointerEvent } from "pixi.js";

export class ButtonZone extends Container {
  private zoneBg: Graphics;
  private endTurnButton: Container;
  private endTurnBg: Graphics;
  private endTurnText: Text;

  constructor() {
    super();
    
    this.zoneBg = new Graphics();
    this.addChild(this.zoneBg);

    // Create End Turn button
    this.endTurnButton = new Container();
    this.endTurnBg = new Graphics();
    this.endTurnText = new Text();
    
    this.endTurnButton.addChild(this.endTurnBg);
    this.endTurnButton.addChild(this.endTurnText);
    this.addChild(this.endTurnButton);

    this.setupEndTurnButton();
  }

  private setupEndTurnButton(): void {
    this.endTurnButton.interactive = true;
    this.endTurnButton.cursor = 'pointer';

    this.endTurnButton.on('pointerdown', this.onEndTurnClick.bind(this));
    this.endTurnButton.on('pointerover', this.onEndTurnHover.bind(this));
    this.endTurnButton.on('pointerout', this.onEndTurnOut.bind(this));
  }

  private onEndTurnClick(event: FederatedPointerEvent): void {
    console.log('End Turn clicked');
    // TODO: Implement end turn logic
    event.stopPropagation();
  }

  private onEndTurnHover(): void {
    this.endTurnBg.clear()
      .roundRect(0, 0, this.endTurnButton.width, this.endTurnButton.height, 8)
      .fill(Colors.BUTTON_HOVER)
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY });
  }

  private onEndTurnOut(): void {
    this.endTurnBg.clear()
      .roundRect(0, 0, this.endTurnButton.width, this.endTurnButton.height, 8)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.UI_BORDER });
  }

  resize(width: number, height: number): void {
    this.zoneBg.roundRect(0, 0, width, height, 10)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // Size and position End Turn button
    const buttonWidth = Math.min(200, width - 40);
    const buttonHeight = Math.min(40, height - 20);
    
    this.endTurnBg.clear()
      .roundRect(0, 0, buttonWidth, buttonHeight, 8)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.UI_BORDER });

    this.endTurnText.text = 'End Turn';
    this.endTurnText.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fill: Colors.TEXT_PRIMARY,
      align: 'center',
      fontWeight: 'bold'
    };
    this.endTurnText.anchor.set(0.5);
    this.endTurnText.x = buttonWidth / 2;
    this.endTurnText.y = buttonHeight / 2;

    // Center the button in the zone
    this.endTurnButton.x = (width - buttonWidth) / 2;
    this.endTurnButton.y = (height - buttonHeight) / 2;
  }

  setEndTurnCallback(callback: () => void): void {
    this.endTurnButton.removeAllListeners('pointerdown');
    this.endTurnButton.on('pointerdown', (event: FederatedPointerEvent) => {
      callback();
      event.stopPropagation();
    });
  }
}