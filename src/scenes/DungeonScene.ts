import { Graphics, Text, Container, Ticker } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { StageScene } from './StageScene';
import { Colors } from '@/utils/colors';
import { dungeonsApi, ApiError, isLikelyUsingMockData } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';

export class DungeonScene extends BaseScene {
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private listContainer: Container;
  private buttonContainer: Container;
  
  // Data state
  private dungeons: any[] = [];
  private loadingManager: LoadingStateManager;

  constructor() {
    super();
    
    // Create containers once
    this.container = new Container();
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.listContainer = new Container();
    this.buttonContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.listContainer,
      this.buttonContainer
    );
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    // Load data and create UI
    this.loadDungeonsData();
  }
  
  private async loadDungeonsData(): Promise<void> {
    this.loadingManager.showLoading();
    
    this.dungeons = await dungeonsApi.getAllDungeons();
    
    this.loadingManager.hideLoading();
    
    // Show mock data indicator if we're likely using mock data
    if (isLikelyUsingMockData()) {
      this.loadingManager.showMockDataIndicator();
    }
    
    this.initializeUI();
  }
  
  private initializeUI(): void {
    if (!this.dungeons.length) return;
    
    this.createBackground();
    this.createHeader();
    this.createDungeonList();
    this.createBackButton();
  }

  /** Resize the screen */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;

    // Update loading manager dimensions
    this.loadingManager.updateDimensions(width, height);

    // Only update layout if we have loaded data
    if (this.dungeons.length > 0) {
      this.updateLayout();
    }
  }
  
  private updateLayout(): void {
    // Clear and recreate layout - this is more efficient than destroying/recreating all elements
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.listContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createDungeonList();
    this.createBackButton();
  }

  private createBackground(): void {
    const bg = new Graphics();
    // bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(0x1a0e0a);

    // bgContainer.addChild(bg);

    // Add mystical atmosphere
    for (let i = 0; i < 15; i++) {
      const orb = new Graphics();
      orb.circle(
          Math.random() * this.gameWidth,
          Math.random() * this.gameHeight,
          5 + Math.random() * 10
      ).fill({ color: Colors.DECORATION_MAGIC, alpha: 0.3 });
      this.backgroundContainer.addChild(orb);
    }
  }

  private createHeader(): void {
    const title = this.createTitle('Choose Your Adventure', this.gameWidth / 2, 60);
    
    const subtitle = new Text({
      text: 'Select a dungeon to explore',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = 100;
    
    this.headerContainer.addChild(title, subtitle);
  }

  private createDungeonList(): void {
    // Calculate responsive card dimensions with standard padding
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const cardWidth = Math.min(availableWidth, 500); // Limit max width but use available space
    const cardHeight = 160;
    const startY = 150;
    
    this.dungeons.forEach((dungeon, index) => {
      const dungeonCard = this.createDungeonCard(dungeon, index, cardWidth, cardHeight);
      dungeonCard.x = (this.gameWidth - cardWidth) / 2; // Center each card
      dungeonCard.y = startY + (index * (cardHeight + this.STANDARD_SPACING));
      this.listContainer.addChild(dungeonCard);
    });
  }

  private createDungeonCard(dungeon: any, index: number, cardWidth: number, cardHeight: number): Container {
    const card = new Container();
    
    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, cardWidth, cardHeight, 15)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    // Calculate responsive sizes with standard padding
    const iconSize = 100;
    const iconX = this.STANDARD_PADDING;
    const iconY = 30;
    const contentStartX = iconX + iconSize + this.STANDARD_SPACING;
    const contentWidth = cardWidth - contentStartX - this.STANDARD_PADDING;
    const buttonWidth = Math.min(140, contentWidth / 3);
    
    // Dungeon icon/preview
    const iconBg = new Graphics();
    
    const icon = new Text({
      text: '🏰',
      style: {
        fontSize: 48,
        align: 'center'
      }
    });
    icon.anchor.set(0.5);
    icon.x = iconX + iconSize / 2;
    icon.y = iconY + iconSize / 2;
    
    // Dungeon info
    const title = new Text({
      text: dungeon.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    title.x = contentStartX;
    title.y = 20;
    
    const description = new Text({
      text: dungeon.description,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        wordWrap: true,
        wordWrapWidth: contentWidth - buttonWidth - this.STANDARD_SPACING
      }
    });
    description.x = contentStartX;
    description.y = 50;
    
    const requiredLevel = new Text({
      text: `Required Level: ${dungeon.requiredLevel}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.RARITY_LEGENDARY
      }
    });
    requiredLevel.x = contentStartX;
    requiredLevel.y = 100;

    const stages = new Text({
      text: `Stages: ${dungeon.stages.length}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_TERTIARY
      }
    });
    stages.x = contentStartX;
    stages.y = 120;
  
    // Enter button - positioned with standard padding
    const buttonX = cardWidth - buttonWidth - this.STANDARD_PADDING;
    const buttonY = (cardHeight - 60) / 2;
    
    const enterButton = this.createButton(
      'Enter Dungeon',
      buttonX,
      buttonY,
      buttonWidth,
      60,
      () => {
        navigation.showScreen(StageScene, { selectedDungeon: dungeon });
      }
    );
    
    card.addChild(bg, iconBg, icon, title, description, requiredLevel, stages, enterButton);
    
    // Hover effects
    card.interactive = true;
    card.on('pointerover', () => {
      bg.tint = 0xe8e8e8;
    });
    card.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    return card;
  }

  private createBackButton(): void {
    const backButton = this.createButton(
      '← Back to Home',
      this.STANDARD_PADDING,
      this.gameHeight - 80,
      200,
      50,
      () => navigation.showScreen(HomeScene)
    );
    this.buttonContainer.addChild(backButton);
  }

  update(time: Ticker): void {
    // Animate background orbs
    this.backgroundContainer.children.forEach((child: any, index) => {
      if (child instanceof Graphics) {
        child.alpha = 0.2 + Math.sin(Date.now() * 0.001 + index) * 0.1;
        child.x += Math.sin(Date.now() * 0.0005 + index) * 0.2;
        child.y += Math.cos(Date.now() * 0.0007 + index) * 0.15;
      }
    });
  }
}