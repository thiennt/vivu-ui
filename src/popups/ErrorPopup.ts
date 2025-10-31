import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { Button } from '@/ui/Button';

export class ErrorPopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private message: string;
  private gameWidth: number;
  private gameHeight: number;

  constructor(params: { message: string }) {
    super();
    this.message = params.message;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.createDialog();
  }

  private createDialog(): void {
    // Create semi-transparent background
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.OVERLAY_DARK, alpha: 0.7 });
    
    const dialogWidth = Math.min(400, this.gameWidth - 40);
    const dialogHeight = 200;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Create dialog panel
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 10)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.95 })
      .stroke({ width: 3, color: Colors.MODAL_BORDER });

    // Error title
    const errorTitle = new Text({
      text: 'Error',
      style: {
        fontFamily: 'Orbitron',
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.MODAL_BORDER,
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
        fontFamily: 'Orbitron',
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

    // Close button
    const closeButton = new Button({
      text: 'Close',
      width: 100,
      height: 40,
      onClick: () => {
        navigation.dismissPopup();
      }
    });
    closeButton.position.set(
      dialogX + (dialogWidth - closeButton.width) / 2,
      dialogY + dialogHeight - 60
    );

    this.addChild(this.dialogBg, this.dialogPanel, errorTitle, errorMessage, closeButton);
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    // Recreate dialog with new dimensions
    this.removeChildren();
    this.createDialog();
  }
}
