import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { nftApi } from '@/services/api';
import { ScrollBox } from '@pixi/ui';

interface NFT {
  id: string;
  name: string;
  image_url: string;
  collection?: string;
  rarity?: string;
}

export class AvatarChangePopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private currentAvatarUrl: string;
  private characterId: string;
  private onAvatarSelected: (nftId: string, avatarUrl: string) => void;
  private gameWidth: number;
  private gameHeight: number;
  private availableNFTs: NFT[] = [];

  constructor(params: { 
    currentAvatarUrl: string;
    characterId: string;
    onAvatarSelected: (nftId: string, avatarUrl: string) => void 
  }) {
    super();
    this.currentAvatarUrl = params.currentAvatarUrl;
    this.characterId = params.characterId;
    this.onAvatarSelected = params.onAvatarSelected;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.loadNFTsAndCreateDialog();
  }

  private async loadNFTsAndCreateDialog(): Promise<void> {
    try {
      // Fetch player's NFT collection
      this.availableNFTs = await nftApi.getPlayerNFTs();
      this.createDialog();
    } catch (error) {
      console.error('Failed to load NFTs:', error);
      this.createDialog(); // Create dialog even if API fails
    }
  }

  private createDialog(): void {
    // Dark overlay
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.BLACK, alpha: 0.85 });
    
    const dialogWidth = Math.min(500, this.gameWidth - 40);
    const dialogHeight = 550;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Robot theme panel
    this.dialogPanel = new Graphics();
    
    // Shadow
    this.dialogPanel.roundRect(dialogX + 4, dialogY + 4, dialogWidth, dialogHeight, 12)
      .fill({ color: Colors.BLACK, alpha: 0.6 });
    
    // Main panel
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 3, color: Colors.ROBOT_CYAN });
    
    // Inner layer
    this.dialogPanel.roundRect(dialogX + 4, dialogY + 4, dialogWidth - 8, dialogHeight - 8, 10)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.6 });
    
    // Cyan highlight
    this.dialogPanel.roundRect(dialogX + 6, dialogY + 6, dialogWidth - 12, dialogHeight - 12, 9)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.5 });
    
    // Decorative corners
    this.drawPanelCorners(this.dialogPanel, dialogX, dialogY, dialogWidth, dialogHeight, Colors.ROBOT_CYAN);

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
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });

    const dialogTitle = new Text({
      text: '🖼️ Change Avatar',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_CYAN, width: 2 },
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = bannerY + bannerHeight / 2;

    // Instructions
    const instructionsText = new Text({
      text: 'Select an NFT from your collection:',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 14,
        fill: Colors.ROBOT_CYAN_LIGHT,
        align: 'center'
      }
    });
    instructionsText.anchor.set(0.5, 0);
    instructionsText.x = this.gameWidth / 2;
    instructionsText.y = dialogY + 75;

    // NFT grid container
    const gridContainer = new Container();
    const contentY = 110;
    const contentHeight = 360;
    
    if (this.availableNFTs.length > 0) {
      this.createNFTGrid(gridContainer, dialogWidth - 40);
    } else {
      // Empty state
      const emptyText = new Text({
        text: 'No NFTs available',
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 16,
          fill: Colors.ROBOT_CYAN_MID,
          fontStyle: 'italic'
        }
      });
      emptyText.anchor.set(0.5);
      emptyText.x = dialogWidth / 2;
      emptyText.y = contentHeight / 2;
      gridContainer.addChild(emptyText);
    }

    // Create ScrollBox for NFT grid
    const scrollBox = new ScrollBox({
      width: dialogWidth - 40,
      height: contentHeight,
    });
    scrollBox.x = dialogX + 20;
    scrollBox.y = dialogY + contentY;
    scrollBox.addItem(gridContainer);

    // Close button
    const closeButton = this.createCloseButton(
      dialogX + dialogWidth / 2 - 60,
      dialogY + dialogHeight - 55,
      120,
      40
    );

    this.addChild(
      this.dialogBg,
      this.dialogPanel,
      titleBanner,
      dialogTitle,
      instructionsText,
      scrollBox,
      closeButton
    );

    // Make overlay clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.cursor = 'pointer';
    this.dialogBg.on('pointerdown', () => this.closeDialog());
  }

  private createNFTGrid(container: Container, width: number): void {
    const nftSize = 100;
    const padding = 10;
    const columns = Math.floor((width - padding) / (nftSize + padding));
    
    this.availableNFTs.forEach((nft, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = col * (nftSize + padding);
      const y = row * (nftSize + padding);
      
      const nftCard = this.createNFTCard(nft, x, y, nftSize);
      container.addChild(nftCard);
    });
  }

  private createNFTCard(nft: NFT, x: number, y: number, size: number): Container {
    const card = new Container();
    card.x = x;
    card.y = y;
    
    const isCurrentAvatar = nft.image_url === this.currentAvatarUrl;
    
    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, size, size + 30, 8)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: isCurrentAvatar ? Colors.GREEN_MINT : Colors.ROBOT_CYAN, alpha: isCurrentAvatar ? 1 : 0.6 });
    
    // Inner frame
    bg.roundRect(2, 2, size - 4, size - 4, 6)
      .stroke({ width: 1, color: isCurrentAvatar ? Colors.GREEN_MINT : Colors.ROBOT_CYAN, alpha: 0.4 });
    
    card.addChild(bg);
    
    // NFT image placeholder (will be loaded async)
    const imageBg = new Graphics();
    imageBg.roundRect(5, 5, size - 10, size - 10, 6)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.8 });
    card.addChild(imageBg);
    
    // Load NFT image
    this.loadNFTImage(nft.image_url, card, size);
    
    // NFT name
    const nameText = new Text({
      text: nft.name.length > 12 ? nft.name.substring(0, 11) + '...' : nft.name,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 10,
        fill: Colors.WHITE,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: size - 10
      }
    });
    nameText.anchor.set(0.5, 0);
    nameText.x = size / 2;
    nameText.y = size + 5;
    card.addChild(nameText);
    
    // Current indicator
    if (isCurrentAvatar) {
      const currentBadge = new Graphics();
      currentBadge.roundRect(5, size - 20, size - 10, 15, 7)
        .fill({ color: Colors.GREEN_MINT, alpha: 0.95 });
      
      const currentText = new Text({
        text: 'CURRENT',
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 8,
          fontWeight: 'bold',
          fill: Colors.ROBOT_BG_DARK
        }
      });
      currentText.anchor.set(0.5);
      currentText.x = size / 2;
      currentText.y = size - 12.5;
      
      card.addChild(currentBadge, currentText);
    }
    
    // Make card interactive
    if (!isCurrentAvatar) {
      card.interactive = true;
      card.cursor = 'pointer';
      
      card.on('pointerover', () => {
        bg.clear();
        bg.roundRect(0, 0, size, size + 30, 8)
          .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
          .stroke({ width: 3, color: Colors.ROBOT_CYAN_LIGHT });
        bg.roundRect(2, 2, size - 4, size - 4, 6)
          .stroke({ width: 1, color: Colors.ROBOT_CYAN_LIGHT, alpha: 0.8 });
        card.scale.set(1.05);
      });
      
      card.on('pointerout', () => {
        bg.clear();
        bg.roundRect(0, 0, size, size + 30, 8)
          .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
          .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.6 });
        bg.roundRect(2, 2, size - 4, size - 4, 6)
          .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.4 });
        card.scale.set(1.0);
      });
      
      card.on('pointerdown', () => {
        this.selectNFT(nft);
      });
    }
    
    return card;
  }

  private async loadNFTImage(url: string, container: Container, size: number): Promise<void> {
    try {
      const texture = await Assets.load(url);
      const sprite = new Sprite(texture);
      sprite.width = size - 10;
      sprite.height = size - 10;
      sprite.anchor.set(0.5);
      sprite.x = size / 2;
      sprite.y = (size - 10) / 2 + 5;
      container.addChild(sprite);
    } catch (error) {
      console.error('Failed to load NFT image:', url, error);
      // Show placeholder icon if image fails to load
      const placeholderText = new Text({
        text: '🖼️',
        style: { fontSize: 40 }
      });
      placeholderText.anchor.set(0.5);
      placeholderText.x = size / 2;
      placeholderText.y = size / 2;
      container.addChild(placeholderText);
    }
  }

  private selectNFT(nft: NFT): void {
    console.log('Selected NFT:', nft.name);
    this.onAvatarSelected(nft.id, nft.image_url);
    this.closeDialog();
  }

  private createCloseButton(x: number, y: number, width: number, height: number): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
    
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.6 });
    
    const buttonText = new Text({
      text: 'Close',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 1.5 }
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
    
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.9 });
      button.scale.set(1.03);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.6 });
      button.scale.set(1.0);
    });
    
    button.on('pointerdown', () => this.closeDialog());
    
    return button;
  }

  private drawPanelCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: string): void {
    const cornerSize = 15;
    const cornerThickness = 3;
    
    // Top-left corner
    graphics.moveTo(x + 10, y + cornerThickness)
      .lineTo(x + cornerSize, y + cornerThickness)
      .stroke({ width: cornerThickness, color: color });
    graphics.moveTo(x + cornerThickness, y + 10)
      .lineTo(x + cornerThickness, y + cornerSize)
      .stroke({ width: cornerThickness, color: color });
    
    // Top-right corner
    graphics.moveTo(x + width - 10, y + cornerThickness)
      .lineTo(x + width - cornerSize, y + cornerThickness)
      .stroke({ width: cornerThickness, color: color });
    graphics.moveTo(x + width - cornerThickness, y + 10)
      .lineTo(x + width - cornerThickness, y + cornerSize)
      .stroke({ width: cornerThickness, color: color });
    
    // Bottom-left corner
    graphics.moveTo(x + 10, y + height - cornerThickness)
      .lineTo(x + cornerSize, y + height - cornerThickness)
      .stroke({ width: cornerThickness, color: color });
    graphics.moveTo(x + cornerThickness, y + height - 10)
      .lineTo(x + cornerThickness, y + height - cornerSize)
      .stroke({ width: cornerThickness, color: color });
    
    // Bottom-right corner
    graphics.moveTo(x + width - 10, y + height - cornerThickness)
      .lineTo(x + width - cornerSize, y + height - cornerThickness)
      .stroke({ width: cornerThickness, color: color });
    graphics.moveTo(x + width - cornerThickness, y + height - 10)
      .lineTo(x + width - cornerThickness, y + height - cornerSize)
      .stroke({ width: cornerThickness, color: color });
  }

  private closeDialog(): void {
    navigation.dismissPopup();
  }
}
