import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';

interface Equipment {
  name: string;
  description: string;
}

export class EquipmentChangePopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private equipmentType: string;
  private slotName: string;
  private currentItem: string;
  private onEquipmentSelected: (equipmentType: string, slotName: string, equipment: Equipment) => void;
  private gameWidth: number;
  private gameHeight: number;

  constructor(params: { 
    equipmentType: string;
    slotName: string;
    currentItem: string;
    onEquipmentSelected: (equipmentType: string, slotName: string, equipment: Equipment) => void 
  }) {
    super();
    this.equipmentType = params.equipmentType;
    this.slotName = params.slotName;
    this.currentItem = params.currentItem;
    this.onEquipmentSelected = params.onEquipmentSelected;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.createDialog();
  }

  private createDialog(): void {
    // Create semi-transparent background
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.OVERLAY_DARK, alpha: 0.7 });
    
    const dialogWidth = Math.min(500, this.gameWidth - 40);
    const dialogHeight = 400;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Create dialog panel
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    // Dialog title
    const dialogTitle = new Text({
      text: `Change ${this.slotName}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5, 0);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = dialogY + 20;

    // Current equipment
    const currentText = new Text({
      text: `Current: ${this.currentItem}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    currentText.anchor.set(0.5, 0);
    currentText.x = this.gameWidth / 2;
    currentText.y = dialogY + 55;

    // Available equipment options
    const availableEquipment = this.getAvailableEquipment(this.equipmentType);
    let optionY = dialogY + 90;

    const equipmentOptions: Container[] = [];

    availableEquipment.forEach((equipment) => {
      const optionContainer = new Container();
      
      const optionBg = new Graphics();
      const isCurrentItem = equipment.name === this.currentItem;
      optionBg.roundRect(0, 0, dialogWidth - 40, 40, 6)
        .fill({ color: isCurrentItem ? Colors.BUTTON_PRIMARY : Colors.CONTAINER_BACKGROUND, alpha: 0.8 })
        .stroke({ width: 1, color: Colors.BUTTON_BORDER });
      
      const equipmentName = new Text({
        text: equipment.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fontWeight: 'bold',
          fill: isCurrentItem ? Colors.TEXT_BUTTON : Colors.TEXT_PRIMARY
        }
      });
      equipmentName.x = 10;
      equipmentName.y = 5;
      
      const equipmentDescription = new Text({
        text: equipment.description,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: isCurrentItem ? Colors.TEXT_BUTTON : Colors.TEXT_SECONDARY,
          wordWrap: true,
          wordWrapWidth: dialogWidth - 60
        }
      });
      equipmentDescription.x = 10;
      equipmentDescription.y = 20;
      
      optionContainer.addChild(optionBg, equipmentName, equipmentDescription);
      optionContainer.x = dialogX + 20;
      optionContainer.y = optionY;
      
      // Make option interactive (except current item)
      if (!isCurrentItem) {
        optionContainer.interactive = true;
        optionContainer.cursor = 'pointer';
        optionContainer.on('pointerdown', () => {
          this.onEquipmentSelected(this.equipmentType, this.slotName, equipment);
          navigation.dismissPopup();
        });
        
        // Add hover effect
        optionContainer.on('pointerover', () => {
          optionBg.tint = Colors.HOVER_LIGHT;
        });
        optionContainer.on('pointerout', () => {
          optionBg.tint = Colors.ACTIVE_WHITE;
        });
      }
      
      equipmentOptions.push(optionContainer);
      optionY += 50;
    });

    const closeButton = this.createButton(
      'Close',
      dialogX + (dialogWidth - 100) / 2,
      dialogY + dialogHeight - 60,
      100,
      40,
      () => {
        navigation.dismissPopup();
      }
    );

    // Make background clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.on('pointerdown', () => {
      navigation.dismissPopup();
    });
    
    this.addChild(this.dialogBg, this.dialogPanel, dialogTitle, currentText, ...equipmentOptions, closeButton);
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
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON
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
      bg.tint = Colors.HOVER_TINT;
    });
    button.on('pointerout', () => {
      bg.tint = Colors.ACTIVE_WHITE;
    });
    
    return button;
  }

  private getAvailableEquipment(equipmentType: string): Array<{name: string, description: string}> {
    // Mock available equipment data - this could be fetched from API later
    const equipmentData: Record<string, Array<{name: string, description: string}>> = {
      weapon: [
        { name: 'Sword', description: '+10 Attack. Balanced weapon for versatile combat.' },
        { name: 'Axe', description: '+15 Attack, -2 Speed. Heavy weapon with high damage.' },
        { name: 'Bow', description: '+8 Attack, +3 Speed. Ranged weapon for quick strikes.' },
        { name: 'Staff', description: '+5 Attack, +10 Magic. Magical weapon for spellcasters.' },
        { name: 'Dagger', description: '+6 Attack, +5 Speed. Fast weapon for critical hits.' }
      ],
      armor: [
        { name: 'Plate', description: '+15 Defense, -3 Speed. Heavy armor with maximum protection.' },
        { name: 'Chain Mail', description: '+10 Defense, -1 Speed. Balanced armor for most situations.' },
        { name: 'Leather', description: '+5 Defense, +2 Speed. Light armor for mobility.' },
        { name: 'Robe', description: '+3 Defense, +5 Magic. Magical robes for spellcasters.' },
        { name: 'Scale Mail', description: '+12 Defense, -2 Speed. Durable armor with good protection.' }
      ],
      accessory: [
        { name: 'Power Ring', description: '+5 Attack. Increases physical damage output.' },
        { name: 'Shield Ring', description: '+5 Defense. Reduces incoming damage.' },
        { name: 'Speed Boots', description: '+5 Speed. Increases movement and attack speed.' },
        { name: 'Magic Amulet', description: '+8 Magic. Enhances magical abilities.' },
        { name: 'Health Pendant', description: '+20 HP. Increases maximum health points.' },
        { name: '(empty)', description: 'No accessory equipped.' }
      ]
    };
    
    return equipmentData[equipmentType] || [];
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    // Recreate dialog with new dimensions
    this.removeChildren();
    this.createDialog();
  }
}