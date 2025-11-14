import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/ui/BaseScene';
import { CharactersScene } from './CharactersScene';
import { LineupScene } from './LineupScene';
import { CardBattleScene } from './CardBattleScene';
import { CheckinScene } from './CheckinScene';
import { LootBoxScene } from './LootBoxScene';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { checkinStatusManager } from '@/utils/checkinStatusManager';

export class HomeScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private decorativeElements: Container[] = [];
  private player: any = null;
  private loadingManager: LoadingStateManager;
  private hasCheckedInToday: boolean = false;

  constructor() {
    super();

    this.container = new Container();
    this.addChild(this.container);
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    // Load player data
    this.loadPlayerData();
  }

  private async loadPlayerData(): Promise<void> {
    this.loadingManager.showLoading();
    
    const player = sessionStorage.getItem('player');
    this.player = player ? JSON.parse(player) : null;

    // Check today's check-in status using shared manager
    this.hasCheckedInToday = await checkinStatusManager.getCheckinStatus();

    this.loadingManager.hideLoading();
    
    this.createUI();
  }

  private createUI(): void {
    if (!this.player) return;
    
    this.container.removeChildren();
    this.createBackground();
    this.createTopLeftPlayerInfo();
    this.createTopRightGold();
    this.createMenuButtons();
    this.createDecorations();
    
    // Ensure bottom navigation is created and visible
    this.createBottomNavigation();
    
    // Animate decorative elements
    this.decorativeElements.forEach((element, index) => {
      element.alpha = 0;
      const delay = index * 0.2;
      
      setTimeout(() => {
        const animate = () => {
          element.alpha += 0.02;
          if (element.alpha < 1) {
            requestAnimationFrame(animate);
          }
        };
        animate();
      }, delay * 1000);
    });
  }

  resize(width: number, height: number): void {
    this.gameWidth = width
    this.gameHeight = height;

    // Update loading manager dimensions
    this.loadingManager.updateDimensions(width, height);
    
    // Create/update bottom navigation
    this.updateBottomNavigation();
    
    // Only update layout if we have loaded data
    if (this.player) {
      this.createUI();
    }
  }

  /** Reset screen after hidden */
  reset(): void {
    this.container.removeChildren();
    this.decorativeElements = [];
  }

  private createBackground(): void {
    const bgContainer = new Container();
    
    const availableHeight = this.getContentHeight();
    
    // Robot dark background
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, availableHeight)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 1.0 });
    
    // Add subtle overlay
    bg.rect(0, 0, this.gameWidth, availableHeight)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.3 });
    
    bgContainer.addChild(bg);
    
    // Add mystical floating particles (cyan theme)
    for (let i = 0; i < 20; i++) {
      const particle = new Graphics();
      const size = 1 + Math.random() * 2;
      particle.circle(0, 0, size)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.2 + Math.random() * 0.3 });
      particle.x = Math.random() * this.gameWidth;
      particle.y = Math.random() * availableHeight;
      bgContainer.addChild(particle);
    }
    
    this.container.addChild(bgContainer);
  }

  private createTopLeftPlayerInfo(): void {
    const playerPanel = new Container();
    const padding = this.STANDARD_PADDING;
    
    // Avatar circle
    const avatarSize = 60;
    const avatarX = 0;
    const avatarY = 0;
    
    const avatarBg = new Graphics();
    avatarBg.circle(avatarSize / 2, avatarSize / 2, avatarSize / 2 + 2)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.3 });
    avatarBg.circle(avatarSize / 2, avatarSize / 2, avatarSize / 2)
      .fill({ color: Colors.ROBOT_CONTAINER, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });
    
    const avatarEmoji = new Text({
      text: '👤',
      style: {
        fontSize: 28
      }
    });
    avatarEmoji.anchor.set(0.5);
    avatarEmoji.x = avatarSize / 2;
    avatarEmoji.y = avatarSize / 2;
    
    // Player info text to the right of avatar
    const infoStartX = avatarSize + 10;
    
    const playerName = new Text({
      text: `${this.player.username}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 0.5 }
      }
    });
    playerName.x = infoStartX;
    playerName.y = 5;
    
    const playerLevel = new Text({
      text: `LV: ${this.player.level}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 14,
        fill: Colors.ROBOT_CYAN_MID
      }
    });
    playerLevel.x = infoStartX;
    playerLevel.y = 28;
    
    const playerExp = new Text({
      text: `XP: ${this.player.exp}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 14,
        fill: Colors.ROBOT_CYAN_MID
      }
    });
    playerExp.x = infoStartX;
    playerExp.y = 46;
    
    playerPanel.addChild(avatarBg, avatarEmoji, playerName, playerLevel, playerExp);
    playerPanel.x = padding;
    playerPanel.y = padding;
    
    this.container.addChild(playerPanel);
  }

  private createTopRightGold(): void {
    const goldPanel = new Container();
    const padding = this.STANDARD_PADDING;
    
    const goldAmount = this.player.gold ?? 100;
    const goldText = new Text({
      text: `🪙${goldAmount}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 0.5 }
      }
    });
    goldText.anchor.set(1, 0);

    goldPanel.addChild(goldText);
    goldPanel.x = this.gameWidth - padding;
    goldPanel.y = padding;
    
    this.container.addChild(goldPanel);
  }

  private drawPanelCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: string): void {
    const cornerSize = 10;
    
    // Top-left
    graphics.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    
    // Top-right
    graphics.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    
    // Bottom-left
    graphics.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    
    // Bottom-right
    graphics.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.8 });
  }

  private createMenuButtons(): void {
    const buttonContainer = new Container();
    
    const buttons = [
      { text: '📅 Daily Check-In', screen: CheckinScene, isCheckIn: true },
      { text: '🎁 Loot Box', screen: LootBoxScene, isCheckIn: false, isDisabled: true },
      { text: '👥 Characters', screen: CharactersScene, isCheckIn: false },
      { text: '🃏 Ongoing Battle', screen: CardBattleScene, isCheckIn: false },
      { text: '🧑‍🤝‍🧑 Lineup', screen: LineupScene, isCheckIn: false }
    ];
    
    const buttonWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 400);
    const buttonHeight = 48;
    
    // Position buttons in the middle of the screen
    const headerHeight = 70; // Space for top-left and top-right info
    const availableHeight = this.gameHeight - headerHeight - this.STANDARD_PADDING;
    const totalButtonHeight = buttons.length * buttonHeight + (buttons.length - 1) * this.STANDARD_SPACING;
    
    const spacing = totalButtonHeight > availableHeight ? 
      Math.max(4, (availableHeight - (buttons.length * buttonHeight)) / (buttons.length - 1)) : 
      this.STANDARD_SPACING;
    
    buttons.forEach((buttonData, index) => {
      // Disable all buttons except check-in if user hasn't checked in today
      let isDisabled = !this.hasCheckedInToday && !buttonData.isCheckIn;
      if (buttonData.isDisabled !== undefined) {
        isDisabled = buttonData.isDisabled;
      }

      const button = this.createButton(
        buttonData.text,
        0,
        index * (buttonHeight + spacing),
        buttonWidth,
        buttonHeight,
        () => {
          if (!isDisabled) {
            navigation.showScreen(buttonData.screen);
          }
        },
        18,
        isDisabled
      );
      buttonContainer.addChild(button);
    });
    
    // Center vertically
    buttonContainer.x = (this.gameWidth - buttonWidth) / 2;
    buttonContainer.y = headerHeight + (availableHeight - totalButtonHeight) / 2;
    
    this.container.addChild(buttonContainer);
  }



  private createDecorations(): void {
    // Add floating cyan particles
    for (let i = 0; i < 12; i++) {
      const decoration = new Graphics();
      const size = 2 + Math.random() * 3;
      decoration.circle(0, 0, size)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.4 + Math.random() * 0.3 });
      
      decoration.x = Math.random() * this.gameWidth;
      decoration.y = Math.random() * this.gameHeight;
      
      this.decorativeElements.push(decoration);
      this.container.addChild(decoration);
    }
  }

  public update(time: Ticker): void {
    // Animate decorative elements
    this.decorativeElements.forEach((element, index) => {
      element.y += Math.sin(Date.now() * 0.001 + index) * 0.5;
      element.x += Math.cos(Date.now() * 0.0008 + index) * 0.3;
      element.alpha = 0.3 + Math.sin(Date.now() * 0.002 + index) * 0.3;

      // Wrap around screen
      if (element.x > this.gameWidth + 20) element.x = -20;
      if (element.x < -20) element.x = this.gameWidth + 20;
      if (element.y > this.gameHeight + 20) element.y = -20;
      if (element.y < -20) element.y = this.gameHeight + 20;
    });
  }

}