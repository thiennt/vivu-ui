import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { Button } from '@/ui/Button';

export type MessageType = 'success' | 'error' | 'info';

export class MessagePopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private message: string;
  private messageType: MessageType;
  private gameWidth: number;
  private gameHeight: number;

  constructor(params: { message: string; type?: MessageType }) {
    super();
    this.message = params.message;
    this.messageType = params.type || 'info';
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
    
    // Determine colors based on message type
    let borderColor: string;
    let iconText: string;
    let titleText: string;
    
    switch (this.messageType) {
      case 'success':
        borderColor = Colors.GREEN_DARK;
        iconText = '✓';
        titleText = 'Success';
        break;
      case 'error':
        borderColor = Colors.MODAL_BORDER;
        iconText = '✕';
        titleText = 'Error';
        break;
      default:
        borderColor = Colors.ROBOT_CYAN;
        iconText = 'ℹ';
        titleText = 'Information';
    }
    
    // Create dialog panel
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 10)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.95 })
      .stroke({ width: 3, color: borderColor });

    // Icon and title container
    const iconSize = 24;
    const icon = new Text({
      text: iconText,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: iconSize,
        fontWeight: 'bold',
        fill: borderColor,
        align: 'center'
      }
    });
    icon.anchor.set(0.5);
    icon.x = dialogX + 30;
    icon.y = dialogY + 35;

    const title = new Text({
      text: titleText,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 20,
        fontWeight: 'bold',
        fill: borderColor,
        align: 'center'
      }
    });
    title.anchor.set(0, 0.5);
    title.x = dialogX + 50;
    title.y = dialogY + 35;

    // Message text
    const messageText = new Text({
      text: this.message,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: dialogWidth - 40
      }
    });
    messageText.anchor.set(0.5);
    messageText.x = this.gameWidth / 2;
    messageText.y = dialogY + 95;

    // Close button
    const closeButton = new Button({
      text: 'OK',
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

    this.addChild(this.dialogBg, this.dialogPanel, icon, title, messageText, closeButton);
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    // Recreate dialog with new dimensions
    this.removeChildren();
    this.createDialog();
  }
}
