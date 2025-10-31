import { Graphics, Text, Container, Ticker } from 'pixi.js';
import { BaseScene } from '@/ui/BaseScene';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { StageScene } from './StageScene';
import { Colors } from '@/utils/colors';
import { dungeonsApi, isLikelyUsingMockData } from '@/services/api';
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
    // Main background with orange gradient
    const bg = new Graphics();
    const backgroundGradient = Colors.BACKGROUND_PRIMARY;
    bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(backgroundGradient);
    this.backgroundContainer.addChild(bg);

    // Add mystical atmosphere with orange theme
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
        fontFamily: 'Orbitron',
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
    
    // Responsive card height - smaller on mobile
    const cardHeight = Math.max(140, Math.min(160, this.gameHeight * 0.15));
    const startY = 150;
    
    // Calculate available height for cards to prevent overflow
    const availableHeight = this.gameHeight - startY - 100; // Leave space for back button
    const totalCardsHeight = this.dungeons.length * (cardHeight + this.STANDARD_SPACING) - this.STANDARD_SPACING;
    
    // Use smaller spacing if content doesn't fit
    const spacing = totalCardsHeight > availableHeight ? 
      Math.max(5, (availableHeight - (this.dungeons.length * cardHeight)) / (this.dungeons.length - 1)) : 
      this.STANDARD_SPACING;
    
    this.dungeons.forEach((dungeon, index) => {
      const dungeonCard = this.createDungeonCard(dungeon, index, cardWidth, cardHeight);
      dungeonCard.x = (this.gameWidth - cardWidth) / 2; // Center each card
      dungeonCard.y = startY + (index * (cardHeight + spacing));
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
    const iconSize = Math.min(60, cardHeight * 0.5, cardWidth * 0.2); // Reduced max icon size for small screens
    const iconX = this.STANDARD_PADDING;
    const iconY = (cardHeight - iconSize) / 2;
    const contentStartX = iconX + iconSize + this.STANDARD_SPACING;
    const contentWidth = cardWidth - contentStartX - this.STANDARD_PADDING;
    
    // Responsive button width - ensure minimum touch target of 80px but limit for small cards
    const buttonWidth = Math.max(60, Math.min(100, contentWidth / 3)); // Reduced from 80-120 to 60-100
    const textWidth = contentWidth - buttonWidth - this.STANDARD_SPACING;
    
    // Dungeon icon/preview
    const iconBg = new Graphics();
    
    const icon = new Text({
      text: '🏰',
      style: {
        fontSize: Math.min(32, iconSize * 0.8), // Responsive icon font size
        align: 'center'
      }
    });
    icon.anchor.set(0.5);
    icon.x = iconX + iconSize / 2;
    icon.y = iconY + iconSize / 2;
    
    // Dungeon info with responsive font sizes - improved for small screens
    const titleFontSize = this.calculateResponsiveFontSize(20, cardWidth, this.gameWidth, 12, 24); // Reduced from 24 base
    const title = new Text({
      text: dungeon.name,
      style: {
        fontFamily: 'Orbitron',
        fontSize: titleFontSize,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        wordWrap: true,
        wordWrapWidth: textWidth,
        breakWords: true // Allow breaking long words to prevent overflow
      }
    });
    title.x = contentStartX;
    title.y = cardHeight * 0.08; // Slightly adjusted for better spacing
    
    const descFontSize = this.calculateResponsiveFontSize(12, cardWidth, this.gameWidth, 9, 14); // Reduced from 14 base
    const description = new Text({
      text: dungeon.description,
      style: {
        fontFamily: 'Orbitron',
        fontSize: descFontSize,
        fill: Colors.TEXT_SECONDARY,
        wordWrap: true,
        wordWrapWidth: textWidth,
        breakWords: true // Allow breaking long words to prevent overflow
      }
    });
    description.x = contentStartX;
    description.y = Math.min(cardHeight * 0.32, title.y + title.height + 5); // Dynamic positioning to avoid overlap
    
    const levelFontSize = this.calculateResponsiveFontSize(14, cardWidth, this.gameWidth, 10, 16); // Reduced from 16 base
    const requiredLevel = new Text({
      text: `Required Level: ${dungeon.requiredLevel}`,
      style: {
        fontFamily: 'Orbitron',
        fontSize: levelFontSize,
        fontWeight: 'bold',
        fill: Colors.RARITY_LEGENDARY
      }
    });
    requiredLevel.x = contentStartX;
    requiredLevel.y = Math.min(cardHeight * 0.58, description.y + description.height + 5); // Dynamic positioning

    const stagesFontSize = this.calculateResponsiveFontSize(12, cardWidth, this.gameWidth, 9, 14); // Reduced from 14 base
    const stages = new Text({
      text: `Stages: ${dungeon.stages.length}`,
      style: {
        fontFamily: 'Orbitron',
        fontSize: stagesFontSize,
        fill: Colors.TEXT_TERTIARY
      }
    });
    stages.x = contentStartX;
    stages.y = Math.min(cardHeight * 0.78, requiredLevel.y + requiredLevel.height + 3); // Dynamic positioning
  
    // Enter button - positioned with standard padding and responsive height
    const buttonX = cardWidth - buttonWidth - this.STANDARD_PADDING;
    const buttonY = (cardHeight - Math.min(40, cardHeight * 0.35)) / 2; // Reduced from 50px max height
    const buttonHeight = Math.min(40, cardHeight * 0.35); // Reduced from 50px max height
    
    const enterButton = this.createButton(
      'Enter',
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      () => {
        navigation.showScreen(StageScene, { selectedDungeon: dungeon });
      },
      12 // Reduced base font size from 14
    );
    
    card.addChild(bg, iconBg, icon, title, description, requiredLevel, stages, enterButton);
    
    // Hover effects
    card.interactive = true;
    card.on('pointerover', () => {
      bg.tint = Colors.HOVER_LIGHTEST;
    });
    card.on('pointerout', () => {
      bg.tint = Colors.ACTIVE_WHITE;
    });
    
    return card;
  }

  private createBackButton(): void {
    // Responsive button sizing - improved for small screens
    const buttonWidth = Math.min(160, this.gameWidth - 2 * this.STANDARD_PADDING); // Reduced from 180
    const buttonHeight = Math.max(40, Math.min(46, this.gameHeight * 0.07)); // Reduced heights for small screens
    
    const backButton = this.createButton(
      '← Back to Home',
      this.STANDARD_PADDING,
      this.gameHeight - buttonHeight - this.STANDARD_PADDING,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene),
      14 // Reduced base font size from 16
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