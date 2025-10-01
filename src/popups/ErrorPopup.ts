import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';

export class ErrorPopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private message: string;
  private onRetry?: () => void;
  private gameWidth: number;
  private gameHeight: number;

  constructor(params: { message: string; onRetry?: () => void }) {
    super();
    this.message = params.message;
    this.onRetry = params.onRetry;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.createDialog();
  }

  private createDialog(): void {
    // Create semi-transparent background
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x000000, alpha: 0.7 });
    
    const dialogWidth = Math.min(400, this.gameWidth - 40);
    const dialogHeight = 200;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Create dialog panel
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 10)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.95 })
      .stroke({ width: 3, color: 0xff4444 });

    // Error title
    const errorTitle = new Text({
      text: 'Error',
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xff4444,
        align: 'center'
      }
    });
    errorTitle.anchor.set(0.5);
    errorTitle.x = this.gameWidth / 2;
    errorTitle.y = dialogY + 40;

    // Error message
    const errorMessage = new Text({
      text: this.message,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: dialogWidth - 40
      }
    });
    errorMessage.anchor.set(0.5);
    errorMessage.x = this.gameWidth / 2;
    errorMessage.y = dialogY + 80;

    // Retry button
    const retryButton = this.createButton(
      'Retry',
      dialogX + 20,
      dialogY + dialogHeight - 60,
      dialogWidth - 40,
      40,
      () => {
        navigation.dismissPopup();
        if (this.onRetry) {
          this.onRetry();
        }
      }
    );

    this.addChild(this.dialogBg, this.dialogPanel, errorTitle, errorMessage, retryButton);
  }

  private createButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5);
    bg.fill({ color: Colors.BUTTON_PRIMARY });
    bg.stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = width / 2;
    buttonText.y = height / 2;
    
    button.addChild(bg, buttonText);
    button.x = x;
    button.y = y;
    
    button.interactive = true;
    button.cursor = 'pointer';
    button.on('pointerdown', onClick);
    
    // Add hover effect
    button.on('pointerover', () => {
      bg.tint = 0xcccccc;
    });
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    return button;
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    // Recreate dialog with new dimensions
    this.removeChildren();
    this.createDialog();
  }
}
