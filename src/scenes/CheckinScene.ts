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
    
    // Dark fantasy background
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x1a0f0a, alpha: 1.0 });
    
    // Brown texture overlay
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x2a1810, alpha: 0.3 });
    
    // Add mystical golden particles
    for (let i = 0; i < 20; i++) {
      const particle = new Graphics();
      const size = 1 + Math.random() * 2;
      particle.circle(Math.random() * this.gameWidth, Math.random() * this.gameHeight, size)
        .fill({ color: 0xffd700, alpha: 0.3 + Math.random() * 0.3 });
      bg.addChild(particle);
    }
    
    this.backgroundContainer.addChild(bg);
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
      .fill({ color: 0x8b4513, alpha: 0.95 })
      .stroke({ width: 2.5, color: 0xd4af37 });
    
    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: 0xffd700, alpha: 0.6 });

    const title = new Text({
      text: '📅 Daily Check-In 📅',
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x2a1810, width: 2 },
        dropShadow: {
          color: 0xffd700,
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

    const subtitle = new Text({
      text: '✨ Check-in successful! ✨',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: 0xd4af37,
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
      .fill({ color: 0x000000, alpha: 0.5 });
    
    // Main chest background - golden
    rewardBg.roundRect(0, 0, boxWidth, boxHeight, 10)
      .fill({ color: 0xffd700, alpha: 0.3 })
      .stroke({ width: 3, color: 0xd4af37 });
    
    // Inner glow
    rewardBg.roundRect(3, 3, boxWidth - 6, boxHeight - 6, 8)
      .stroke({ width: 2, color: 0xffd700, alpha: 0.8 });
    
    // Ornate corners
    this.drawRewardCorners(rewardBg, 0, 0, boxWidth, boxHeight, 0xffd700);
    
    rewardBox.addChild(rewardBg);

    // Reward title
    const rewardTitle = new Text({
      text: '🎁 Rewards Received',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0x2a1810,
        stroke: { color: 0xffd700, width: 0.5 }
      }
    });
    rewardTitle.anchor.set(0.5, 0);
    rewardTitle.x = boxWidth / 2;
    rewardTitle.y = 12;
    rewardBox.addChild(rewardTitle);

    const rewardText = new Text({
      text: `🪙 ${this.checkinReward.gold || 0} Gold  •  ✨ ${this.checkinReward.experience || 0} EXP`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0x2a1810,
        align: 'center'
      }
    });
    rewardText.anchor.set(0.5);
    rewardText.x = boxWidth / 2;
    rewardText.y = boxHeight / 2 + 8;

    rewardBox.addChild(rewardText);
    
    // Center horizontally
    rewardBox.x = (this.gameWidth - boxWidth) / 2;
    rewardBox.y = 95;

    this.rewardContainer.addChild(rewardBox);
  }

  private drawRewardCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: number): void {
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
    const gridTop = this.checkinReward ? 195 : 110;
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

    // Section title
    const sectionTitle = new Text({
      text: '🎭 Unlocked Characters',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x2a1810, width: 2 },
        dropShadow: {
          color: 0xffd700,
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

      const x = col * (layout.itemWidth + gap);
      const y = row * (cardHeight + gap);

      const characterCard = this.createCharacterCard(character, x, y, layout.itemWidth, cardHeight);

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
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
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
    
    button.on('pointerdown', onClick);
    
    return button;
  }

  update(): void {
    // No update logic needed for static scene
  }
}