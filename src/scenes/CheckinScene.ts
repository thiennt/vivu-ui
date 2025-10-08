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
  
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private rewardContainer: Container;
  private gridContainer: Container;
  private buttonContainer: Container;

  constructor() {
    super();
    
    // Create containers once
    this.container = new Container();
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.rewardContainer = new Container();
    this.gridContainer = new Container();
    this.buttonContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.rewardContainer,
      this.gridContainer,
      this.buttonContainer
    );
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    // Call checkin API and load data
    this.performCheckin();
  }
  
  private async performCheckin(): Promise<void> {
    this.loadingManager.showLoading();
    
    try {
      const response = await authApi.checkin();
      
      if (response.data) {
        this.characters = response.data.characters || [];
        this.checkinReward = response.data.checkin_reward || null;
      }
    } catch (error) {
      console.error('Checkin failed:', error);
    }
    
    this.loadingManager.hideLoading();
    
    // Show mock data indicator if we're likely using mock data
    if (isLikelyUsingMockData()) {
      this.loadingManager.showMockDataIndicator();
    }
    
    this.initializeUI();
  }
  
  private initializeUI(): void {
    this.createBackground();
    this.createHeader();
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
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
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
    const tween = { alpha: 0 };
    
    return new Promise((resolve) => {
      const animate = () => {
        tween.alpha += 0.05;
        this.alpha = tween.alpha;
        
        if (tween.alpha >= 1) {
          this.alpha = 1;
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
  }

  /** Hide the screen with animation */
  async hide(): Promise<void> {
    const tween = { alpha: 1 };
    
    return new Promise((resolve) => {
      const animate = () => {
        tween.alpha -= 0.1;
        this.alpha = tween.alpha;
        
        if (tween.alpha <= 0) {
          this.alpha = 0;
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
  }

  /** Reset screen after hidden */
  reset(): void {
    this.container.removeChildren();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(Colors.BACKGROUND_PRIMARY);
    this.backgroundContainer.addChild(bg);
  }

  private createHeader(): void {
    const title = this.createTitle('Daily Check-In', this.gameWidth / 2, 45);

    const subtitle = new Text({
      text: 'Check-in successful!',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = 75;
    
    this.headerContainer.addChild(title, subtitle);
  }

  private createRewardDisplay(): void {
    if (!this.checkinReward) return;

    const boxWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 350);
    const boxHeight = 60;
    
    // Create a container for the reward box
    const rewardBox = new Container();
    
    // Draw reward box background with border
    const rewardBg = new Graphics();
    rewardBg.fill({ color: Colors.CARD_BACKGROUND, alpha: 0.9 });
    rewardBg.roundRect(0, 0, boxWidth, boxHeight, 8);
    rewardBg.stroke({ width: 2, color: Colors.BUTTON_PRIMARY, alpha: 0.8 });
    rewardBox.addChild(rewardBg);

    const rewardText = new Text({
      text: `Rewards: 🪙 ${this.checkinReward.gold || 0} Gold  ✨ ${this.checkinReward.experience || 0} EXP`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    rewardText.anchor.set(0.5);
    rewardText.x = boxWidth / 2;
    rewardText.y = boxHeight / 2;

    rewardBox.addChild(rewardText);
    
    // Center horizontally
    rewardBox.x = (this.gameWidth - boxWidth) / 2;
    rewardBox.y = 105;

    this.rewardContainer.addChild(rewardBox);
  }

  private createCharacterGrid(): void {
    const gridTop = this.checkinReward ? 180 : 110;
    const backButtonHeight = 45;
    const backButtonMargin = 20;
    const gridHeight = this.gameHeight - gridTop - backButtonHeight - backButtonMargin - this.STANDARD_PADDING;

    // Mobile-optimized card layout
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const isMobile = this.gameWidth < 768;
    const gap = isMobile ? 6 : this.STANDARD_SPACING;
    const cardCount = 3;
    
    const cardWidth = (availableWidth - (gap * (cardCount - 1))) / cardCount;
    const cardHeight = cardWidth * 1.25;

    const layout = {
      itemsPerRow: cardCount,
      itemWidth: cardWidth,
      totalWidth: availableWidth
    };

    // Create a container for all cards
    const gridContent = new Container();

    for (let index = 0; index < this.characters.length; index++) {
      const character = this.characters[index];
      const row = Math.floor(index / layout.itemsPerRow);
      const col = index % layout.itemsPerRow;

      const x = col * (layout.itemWidth + gap);
      const y = row * (cardHeight + gap);

      const characterCard = this.createCharacterCard(character, x, y, layout.itemWidth, cardHeight);

      gridContent.addChild(characterCard);
    }

    // Position grid content
    gridContent.x = this.STANDARD_PADDING;
    gridContent.y = gridTop;

    this.gridContainer.addChild(gridContent);
  }

  private createBackButton(): void {
    const backButton = this.createButton(
      '← Back to Home',
      0,
      0,
      Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 300),
      45,
      () => navigation.showScreen(HomeScene),
      16
    );

    backButton.x = (this.gameWidth - backButton.width) / 2;
    backButton.y = this.gameHeight - backButton.height - 20;

    this.buttonContainer.addChild(backButton);
  }

  update(): void {
    // No update logic needed for static scene
  }
}
