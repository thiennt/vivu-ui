import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { equipmentApi } from '@/services/api';

interface Equipment {
  id?: string;
  name: string;
  description: string;
  slot?: string;
}

export class EquipmentChangePopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private equipmentType: string;
  private slotName: string;
  private currentItem: string;
  private characterId: string;
  private onEquipmentSelected: (equipmentType: string, slotName: string, equipment: Equipment) => void;
  private gameWidth: number;
  private gameHeight: number;
  private availableEquipment: Equipment[] = [];

  constructor(params: { 
    equipmentType: string;
    slotName: string;
    currentItem: string;
    characterId: string;
    onEquipmentSelected: (equipmentType: string, slotName: string, equipment: Equipment) => void 
  }) {
    super();
    this.equipmentType = params.equipmentType;
    this.slotName = params.slotName;
    this.currentItem = params.currentItem;
    this.characterId = params.characterId;
    this.onEquipmentSelected = params.onEquipmentSelected;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.loadEquipmentAndCreateDialog();
  }

  private async loadEquipmentAndCreateDialog(): Promise<void> {
    try {
      // Fetch player inventory
      const inventory = await equipmentApi.getPlayerInventory();
      
      // Filter equipment by slot type
      this.availableEquipment = (inventory.equipment || []).filter(
        (eq: Equipment) => eq.slot === this.equipmentType
      );
      
      // Add empty option for unequipping
      if (this.currentItem !== '(empty)') {
        this.availableEquipment.push({
          id: undefined,
          name: '(empty)',
          description: 'Unequip current item.',
          slot: this.equipmentType
        });
      }
      
      this.createDialog();
    } catch (error) {
      console.error('Failed to load equipment:', error);
      this.createDialog(); // Create dialog even if API fails
    }
  }

  private createDialog(): void {
    // Dark overlay
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x000000, alpha: 0.85 });
    
    const dialogWidth = Math.min(500, this.gameWidth - 40);
    const dialogHeight = 500;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Fantasy parchment panel
    this.dialogPanel = new Graphics();
    
    // Shadow
    this.dialogPanel.roundRect(dialogX + 4, dialogY + 4, dialogWidth, dialogHeight, 12)
      .fill({ color: 0x000000, alpha: 0.6 });
    
    // Main parchment
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: 0xf5e6d3, alpha: 0.98 })
      .stroke({ width: 3, color: 0xd4af37 });
    
    // Inner layer
    this.dialogPanel.roundRect(dialogX + 4, dialogY + 4, dialogWidth - 8, dialogHeight - 8, 10)
      .fill({ color: 0xe8d4b8, alpha: 0.6 });
    
    // Golden highlight
    this.dialogPanel.roundRect(dialogX + 6, dialogY + 6, dialogWidth - 12, dialogHeight - 12, 9)
      .stroke({ width: 1, color: 0xffd700, alpha: 0.5 });
    
    // Decorative corners
    this.drawPanelCorners(this.dialogPanel, dialogX, dialogY, dialogWidth, dialogHeight, 0xffd700);

    // Title banner
    const bannerWidth = dialogWidth - 80;
    const bannerHeight = 40;
    const bannerX = dialogX + 40;
    const bannerY = dialogY + 20;
    
    const titleBanner = new Graphics();
    titleBanner.moveTo(bannerX + 10, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 10, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 10, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 10, bannerY)
      .lineTo(bannerX + 10, bannerY)
      .fill({ color: 0x8b4513, alpha: 0.95 })
      .stroke({ width: 2, color: 0xd4af37 });

    const dialogTitle = new Text({
      text: `⚔️ Change ${this.slotName}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x2a1810, width: 2 },
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = bannerY + bannerHeight / 2;

    // Current equipment
    const currentText = new Text({
      text: `Current: ${this.currentItem}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: 0x8b4513,
        align: 'center'
      }
    });
    currentText.anchor.set(0.5, 0);
    currentText.x = this.gameWidth / 2;
    currentText.y = dialogY + 75;

    // Available equipment options
    let optionY = dialogY + 105;

    const equipmentOptions: Container[] = [];

    this.availableEquipment.forEach((equipment) => {
      const optionContainer = new Container();
      
      const isCurrentItem = equipment.name === this.currentItem;
      
      // Equipment option card
      const optionBg = new Graphics();
      
      if (isCurrentItem) {
        // Highlight current item
        optionBg.roundRect(0, 0, dialogWidth - 40, 55, 6)
          .fill({ color: 0xffd700, alpha: 0.3 })
          .stroke({ width: 2, color: 0xd4af37 });
        
        optionBg.roundRect(2, 2, dialogWidth - 44, 51, 5)
          .stroke({ width: 1, color: 0xffd700, alpha: 0.6 });
      } else {
        // Regular equipment card
        optionBg.roundRect(0, 0, dialogWidth - 40, 55, 6)
          .fill({ color: 0xe8d4b8, alpha: 0.5 })
          .stroke({ width: 2, color: 0xd4af37, alpha: 0.5 });
      }
      
      const equipmentName = new Text({
        text: equipment.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fontWeight: 'bold',
          fill: isCurrentItem ? 0x2a1810 : 0x3d2817,
          stroke: isCurrentItem ? { color: 0xffd700, width: 0.5 } : undefined
        }
      });
      equipmentName.x = 10;
      equipmentName.y = 8;
      
      const equipmentDescription = new Text({
        text: equipment.description,
        style: {
          fontFamily: 'Kalam',
          fontSize: 11,
          fill: 0x5d4b37,
          wordWrap: true,
          wordWrapWidth: dialogWidth - 60
        }
      });
      equipmentDescription.x = 10;
      equipmentDescription.y = 28;
      
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
        
        optionContainer.on('pointerover', () => {
          optionBg.clear();
          optionBg.roundRect(0, 0, dialogWidth - 40, 55, 6)
            .fill({ color: 0xffd700, alpha: 0.4 })
            .stroke({ width: 2, color: 0xd4af37 });
          optionBg.roundRect(2, 2, dialogWidth - 44, 51, 5)
            .stroke({ width: 1, color: 0xffd700, alpha: 0.8 });
        });
        
        optionContainer.on('pointerout', () => {
          optionBg.clear();
          optionBg.roundRect(0, 0, dialogWidth - 40, 55, 6)
            .fill({ color: 0xe8d4b8, alpha: 0.5 })
            .stroke({ width: 2, color: 0xd4af37, alpha: 0.5 });
        });
      }
      
      equipmentOptions.push(optionContainer);
      optionY += 60;
    });

    const closeButton = this.createFantasyButton(
      'Close',
      dialogX + (dialogWidth - 120) / 2,
      dialogY + dialogHeight - 60,
      120,
      40,
      () => navigation.dismissPopup()
    );

    // Make background clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.on('pointerdown', () => {
      navigation.dismissPopup();
    });
    
    this.addChild(this.dialogBg, this.dialogPanel, titleBanner, dialogTitle, currentText, ...equipmentOptions, closeButton);
  }

  private drawPanelCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: number): void {
    const cornerSize = 12;
    
    graphics.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + 4, y + 4, 2).fill({ color: color, alpha: 0.9 });
    
    graphics.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + width - 4, y + 4, 2).fill({ color: color, alpha: 0.9 });
    
    graphics.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + 4, y + height - 4, 2).fill({ color: color, alpha: 0.9 });
    
    graphics.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + width - 4, y + height - 4, 2).fill({ color: color, alpha: 0.9 });
  }

  private createFantasyButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(2, 2, width, height, 8)
      .fill({ color: 0x000000, alpha: 0.4 });
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: 0x8b4513, alpha: 0.95 })
      .stroke({ width: 2, color: 0xd4af37 });
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: 0xffd700, alpha: 0.6 });
    
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x2a1810, width: 2 }
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
    
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.4 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: 0xa0632a, alpha: 0.95 })
        .stroke({ width: 2, color: 0xffd700 });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: 0xffd700, alpha: 0.9 });
      button.scale.set(1.02);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.4 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x8b4513, alpha: 0.95 })
        .stroke({ width: 2, color: 0xd4af37 });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: 0xffd700, alpha: 0.6 });
      button.scale.set(1.0);
    });
    
    return button;
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.removeChildren();
    this.createDialog();
  }
}