import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/ui/BaseScene';
import { Colors } from '@/utils/colors';
import { authApi, isLikelyUsingMockData } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';

export class CheckinScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  private characters: any[] = [];
  private loadingManager: LoadingStateManager;
  private checkinReward: any = null;
  private hasCheckedInToday: boolean = false;
  
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private rewardContainer: Container;
  private gridContainer: Container;
  private buttonContainer: Container;
  private checkinButtonContainer: Container;

  constructor() {
    super();
    
    // Create containers once
    this.container = new Container();
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.rewardContainer = new Container();
    this.gridContainer = new Container();
    this.buttonContainer = new Container();
    this.checkinButtonContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.rewardContainer,
      this.gridContainer,
      this.checkinButtonContainer,
      this.buttonContainer
    );
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    // Check if user has already checked in today
    this.checkTodayCheckinStatus();
    
    this.checkTodayCheckinStatus().then(() => {
      // Initialize UI without performing checkin
      this.initializeUI();
    });
  }
  
  private async checkTodayCheckinStatus(): Promise<void> {
    try {
      const response = await authApi.getCheckinStatus();
      if (response) {
        this.hasCheckedInToday = response.isCheckedInToday || false;
        this.characters = response.characters || [];
        console.log('Check-in status response:', this.hasCheckedInToday, this.characters);
      }
    } catch (error) {
      console.error('Error checking check-in status:', error);
    }
  }

  private async performCheckin(): Promise<void> {
    if (this.hasCheckedInToday) {
      return;
    }
    
    this.loadingManager.showLoading();
    
    try {
      const response = await authApi.checkin();
      
      console.log('Check-in response:', response);
      if (response) {
        this.characters = response.characters || [];
        this.checkinReward = response.checkin_reward || null;

        // Mark as checked in today
        this.hasCheckedInToday = true;
      }
    } catch (error) {
      console.error('Checkin failed:', error);
    }
    
    this.loadingManager.hideLoading();
    
    // Show mock data indicator if we're likely using mock data
    if (isLikelyUsingMockData()) {
      this.loadingManager.showMockDataIndicator();
    }
    
    // Refresh UI to show the results and disable button
    this.updateLayout();
  }
  
  private initializeUI(): void {
    console.log('Initializing Check-in UI. Has checked in today:', this.hasCheckedInToday);
    this.createBackground();
    this.createHeader();
    this.createCheckinButton();
    if (this.checkinReward) {
      this.createRewardDisplay();
    }
    if (this.characters.length > 0) {
      this.createCharacterGrid();
    }
    this.createBackButton();
  }

  /** Resize the screen */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Update loading manager dimensions
    this.loadingManager.updateDimensions(width, height);
    
    // Only update layout if we have loaded data
    if (this.characters.length > 0) {
      this.updateLayout();
    }
  }
  
  private updateLayout(): void {
    // Clear and recreate layout
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.rewardContainer.removeChildren();
    this.gridContainer.removeChildren();
    this.checkinButtonContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createCheckinButton();
    if (this.checkinReward) {
      this.createRewardDisplay();
    }
    if (this.characters.length > 0) {
      this.createCharacterGrid();
    }
    this.createBackButton();
  }

  /** Show the screen with animation */
  async show(): Promise<void> {
  }

  async hide(): Promise<void> {
  }

  /** Reset screen after hidden */
  reset(): void {
    this.container.removeChildren();
  }

  private createBackground(): void {
    const bg = new Graphics();
    this.backgroundContainer.addChild(bg);
    
    // Dark fantasy background
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 1.0 });
    
    // Brown texture overlay
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.3 });
    
    // Add mystical golden particles
    for (let i = 0; i < 20; i++) {
      const particle = new Graphics();
      const size = 1 + Math.random() * 2;
      particle.circle(Math.random() * this.gameWidth, Math.random() * this.gameHeight, size)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.3 + Math.random() * 0.3 });
      this.backgroundContainer.addChild(particle);
    }
  }

  private createHeader(): void {
    // Fantasy banner
    const bannerWidth = Math.min(340, this.gameWidth - 40);
    const bannerHeight = 50;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = 18;
    
    const banner = new Graphics();
    banner.moveTo(bannerX + 12, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 12, bannerY)
      .lineTo(bannerX + 12, bannerY)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2.5, color: Colors.ROBOT_CYAN });
    
    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.6 });

    const title = new Text({
      text: '📅 Daily Check-In 📅',
      style: {
        fontFamily: 'Orbitron',
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_CYAN, width: 2 },
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 4,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
        }
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = bannerY + bannerHeight / 2;

    // Update subtitle based on check-in status
    const subtitleText = this.hasCheckedInToday 
      ? '✨ Already checked in today! ✨'
      : '✨ Click button below to check in ✨';
    
    const subtitle = new Text({
      text: subtitleText,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 14,
        fill: this.hasCheckedInToday ? Colors.GREEN_LIGHT : Colors.ROBOT_CYAN,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = bannerY + bannerHeight + 12;
    
    this.headerContainer.addChild(banner, title, subtitle);
  }

  private createRewardDisplay(): void {
    if (!this.checkinReward) return;

    const boxWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 360);
    const boxHeight = 80;
    
    // Create a container for the reward box
    const rewardBox = new Container();
    
    // Fantasy treasure chest style reward box
    const rewardBg = new Graphics();
    
    // Shadow
    rewardBg.roundRect(3, 3, boxWidth, boxHeight, 10)
      .fill({ color: Colors.BLACK, alpha: 0.5 });
    
    // Main chest background - golden
    rewardBg.roundRect(0, 0, boxWidth, boxHeight, 10)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.3 })
      .stroke({ width: 3, color: Colors.ROBOT_CYAN });
    
    // Inner glow
    rewardBg.roundRect(3, 3, boxWidth - 6, boxHeight - 6, 8)
      .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.8 });
    
    // Ornate corners
    this.drawRewardCorners(rewardBg, 0, 0, boxWidth, boxHeight, Colors.ROBOT_CYAN);
    
    rewardBox.addChild(rewardBg);

    // Reward title
    const rewardTitle = new Text({
      text: '🎁 Rewards Received',
      style: {
        fontFamily: 'Orbitron',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN,
        stroke: { color: Colors.ROBOT_CYAN, width: 0.5 }
      }
    });
    rewardTitle.anchor.set(0.5, 0);
    rewardTitle.x = boxWidth / 2;
    rewardTitle.y = 12;
    rewardBox.addChild(rewardTitle);

    const rewardText = new Text({
      text: `x${this.checkinReward.dice || 0} 🎟️`,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN,
        align: 'center'
      }
    });
    rewardText.anchor.set(0.5);
    rewardText.x = boxWidth / 2;
    rewardText.y = boxHeight / 2 + 8;

    rewardBox.addChild(rewardText);
    
    // Center horizontally - position after check-in button
    rewardBox.x = (this.gameWidth - boxWidth) / 2;
    rewardBox.y = 155;

    this.rewardContainer.addChild(rewardBox);
  }

  private createCheckinButton(): void {
    const buttonWidth = Math.min(220, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = 50;
        
    const buttonText = this.hasCheckedInToday ? '✓ Checked In Today' : '🎁 Check In Now';
    
    const checkinButton = this.createFantasyButton(
      buttonText,
      (this.gameWidth - buttonWidth) / 2,
      90,
      buttonWidth,
      buttonHeight,
      () => {
        if (!this.hasCheckedInToday) {
          this.performCheckin();
        }
      },
      this.hasCheckedInToday // disabled state
    );

    this.checkinButtonContainer.addChild(checkinButton);
  }

  private drawRewardCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: string): void {
    const cornerSize = 12;
    
    // Top-left
    graphics.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 2, color: color, alpha: 1 });
    
    graphics.circle(x + 4, y + 4, 2)
      .fill({ color: color, alpha: 1 });
    
    // Top-right
    graphics.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 2, color: color, alpha: 1 });
    
    graphics.circle(x + width - 4, y + 4, 2)
      .fill({ color: color, alpha: 1 });
    
    // Bottom-left
    graphics.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 2, color: color, alpha: 1 });
    
    graphics.circle(x + 4, y + height - 4, 2)
      .fill({ color: color, alpha: 1 });
    
    // Bottom-right
    graphics.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 2, color: color, alpha: 1 });
    
    graphics.circle(x + width - 4, y + height - 4, 2)
      .fill({ color: color, alpha: 1 });
  }

  private createCharacterGrid(): void {
    const gridTop = this.checkinReward ? 255 : 160;
    const backButtonHeight = 45;
    const backButtonMargin = 20;
    const gridHeight = this.gameHeight - gridTop - backButtonHeight - backButtonMargin - this.STANDARD_PADDING;

    // Mobile-optimized card layout
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const isMobile = this.gameWidth < 768;
    const gap = isMobile ? 6 : this.STANDARD_SPACING;
    const cardCount = 3;
    
    const cardWidth = 94;
    const cardHeight = 114;

    const layout = {
      itemsPerRow: cardCount,
      itemWidth: cardWidth,
      totalWidth: availableWidth
    };

    // Section title
    const sectionTitle = new Text({
      text: '🎭 Unlocked Characters',
      style: {
        fontFamily: 'Orbitron',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_CYAN, width: 2 },
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 3,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
        }
      }
    });
    sectionTitle.anchor.set(0.5, 0);
    sectionTitle.x = this.gameWidth / 2;
    sectionTitle.y = gridTop;
    this.gridContainer.addChild(sectionTitle);

    // Create a container for all cards
    const gridContent = new Container();

    for (let index = 0; index < this.characters.length; index++) {
      const character = this.characters[index];
      const row = Math.floor(index / layout.itemsPerRow);
      const col = index % layout.itemsPerRow;

      const x = col * availableWidth / layout.itemsPerRow + (availableWidth / layout.itemsPerRow - cardWidth) / 2;
      const y = row * (cardHeight + gap);
      
      const characterCard = this.createCharacterCard(character, x, y, cardWidth, cardHeight);

      gridContent.addChild(characterCard);
    }

    // Position grid content
    gridContent.x = this.STANDARD_PADDING;
    gridContent.y = gridTop + 35;

    this.gridContainer.addChild(gridContent);
  }

  private createBackButton(): void {
    const buttonWidth = Math.min(180, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = 45;
    
    const backButton = this.createFantasyButton(
      '← Back',
      (this.gameWidth - buttonWidth) / 2,
      this.gameHeight - buttonHeight - 20,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );

    this.buttonContainer.addChild(backButton);
  }

  private createFantasyButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void,
    disabled: boolean = false
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    
    // Determine colors based on disabled state
    const mainColor = disabled ? Colors.GRAY : Colors.ROBOT_ELEMENT;
    const strokeColor = disabled ? Colors.GRAY_MID : Colors.ROBOT_CYAN;
    const highlightColor = disabled ? Colors.GRAY_LIGHT : Colors.ROBOT_CYAN;
    const textColor = disabled ? Colors.GRAY_LIGHTER : Colors.WHITE;
    
    bg.roundRect(2, 2, width, height, 8)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: mainColor, alpha: 0.95 })
      .stroke({ width: 2, color: strokeColor });
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: highlightColor, alpha: 0.6 });

    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 16,
        fontWeight: 'bold',
        fill: textColor,
        stroke: { color: Colors.ROBOT_CYAN, width: 2 }
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = width / 2;
    buttonText.y = height / 2;
    
    button.addChild(bg, buttonText);
    button.x = x;
    button.y = y;
    
    if (!disabled) {
      button.interactive = true;
      button.cursor = 'pointer';
      
      button.on('pointerover', () => {
        bg.clear();
        bg.roundRect(2, 2, width, height, 8)
          .fill({ color: Colors.BLACK, alpha: 0.4 });
        bg.roundRect(0, 0, width, height, 8)
          .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.95 })
          .stroke({ width: 2, color: Colors.ROBOT_CYAN });
        bg.roundRect(2, 2, width - 4, height - 4, 6)
          .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.9 });
        button.scale.set(1.02);
      });
      
      button.on('pointerout', () => {
        bg.clear();
        bg.roundRect(2, 2, width, height, 8)
          .fill({ color: Colors.BLACK, alpha: 0.4 });
        bg.roundRect(0, 0, width, height, 8)
          .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
          .stroke({ width: 2, color: Colors.ROBOT_CYAN });
        bg.roundRect(2, 2, width - 4, height - 4, 6)
          .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.6 });
        button.scale.set(1.0);
      });
      
      button.on('pointerdown', onClick);
    }
    
    return button;
  }

  update(): void {
    // No update logic needed for static scene
  }
}