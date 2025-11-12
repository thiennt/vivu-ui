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
import { authApi } from '@/services/api';

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

    // Check today's check-in status
    await this.checkTodayCheckinStatus();

    this.loadingManager.hideLoading();
    
    this.createUI();
  }

  private async checkTodayCheckinStatus(): Promise<void> {
    try {
      const response = await authApi.getCheckinStatus();
      if (response) {
        this.hasCheckedInToday = response.isCheckedInToday || false;
        console.log('Check-in status in HomeScene:', this.hasCheckedInToday);
      }
    } catch (error) {
      console.error('Error checking check-in status in HomeScene:', error);
      // Default to false if there's an error
      this.hasCheckedInToday = false;
    }
  }

  private createUI(): void {
    if (!this.player) return;
    
    this.container.removeChildren();
    this.createBackground();
    this.createHomeTitle();
    this.createPlayerInfo();
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

  private createHomeTitle(): void {
    // Fantasy banner for title
    const bannerWidth = Math.min(350, this.gameWidth - 40);
    const bannerHeight = 60;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = 30;
    
    const banner = new Graphics();
    // Ribbon/banner shape
    banner.moveTo(bannerX + 15, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY)
      .lineTo(bannerX + 15, bannerY)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 3, color: Colors.ROBOT_CYAN });
    
    // Inner cyan highlight
    banner.moveTo(bannerX + 18, bannerY + 4)
      .lineTo(bannerX + bannerWidth - 18, bannerY + 4)
      .lineTo(bannerX + bannerWidth - 5, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 18, bannerY + bannerHeight - 4)
      .lineTo(bannerX + 18, bannerY + bannerHeight - 4)
      .lineTo(bannerX + 5, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 18, bannerY + 4)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.6 });
    
    const title = new Text({
      text: '⚔️ VIVU ⚔️',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 38,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 2 },
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 6,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.8
        }
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = bannerY + bannerHeight / 2;
    
    this.container.addChild(banner, title);
  }

  private createPlayerInfo(): void {
    const playerPanel = new Container();
    
    const panelWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 400);
    const panelHeight = 100;
    
    // Robot panel
    const bg = new Graphics();
    
    // Outer glow
    bg.roundRect(-2, -2, panelWidth + 4, panelHeight + 4, 12)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.2 });
    
    // Shadow
    bg.roundRect(3, 3, panelWidth, panelHeight, 10)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    
    // Main panel
    bg.roundRect(0, 0, panelWidth, panelHeight, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });
    
    // Inner layer
    bg.roundRect(3, 3, panelWidth - 6, panelHeight - 6, 8)
      .fill({ color: Colors.ROBOT_CONTAINER, alpha: 0.6 });
    
    // Cyan highlight
    bg.roundRect(5, 5, panelWidth - 10, panelHeight - 10, 7)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.5 });
    
    // Decorative corners
    this.drawPanelCorners(bg, 0, 0, panelWidth, panelHeight, Colors.ROBOT_CYAN);
    
    // Avatar circle on the left
    const avatarSize = 65;
    const avatarX = 15;
    const avatarY = (panelHeight - avatarSize) / 2;
    
    const avatarBg = new Graphics();
    avatarBg.circle(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 3)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.3 });
    avatarBg.circle(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2)
      .fill({ color: Colors.ROBOT_CONTAINER, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });
    
    const avatarEmoji = new Text({
      text: '👤',
      style: {
        fontSize: 38
      }
    });
    avatarEmoji.anchor.set(0.5);
    avatarEmoji.x = avatarX + avatarSize / 2;
    avatarEmoji.y = avatarY + avatarSize / 2;
    
    // Player info text on the right
    const infoStartX = avatarX + avatarSize + 20;
    
    const playerName = new Text({
      text: `${this.player.username}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 0.5 }
      }
    });
    playerName.x = infoStartX;
    playerName.y = 20;
    
    const playerLevel = new Text({
      text: `⭐ Level: ${this.player.level}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 17,
        fill: Colors.ROBOT_CYAN_MID
      }
    });
    playerLevel.x = infoStartX;
    playerLevel.y = 48;
    
    const playerExp = new Text({
      text: `✨ EXP: ${this.player.exp}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 17,
        fill: Colors.ROBOT_CYAN_MID
      }
    });
    playerExp.x = infoStartX;
    playerExp.y = 72;
    
    playerPanel.addChild(bg, avatarBg, avatarEmoji, playerName, playerLevel, playerExp);
    playerPanel.x = (this.gameWidth - panelWidth) / 2;
    playerPanel.y = 115;
    
    this.container.addChild(playerPanel);
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
      { text: '🎁 Loot Box', screen: LootBoxScene, isCheckIn: false },
      { text: '👥 Characters', screen: CharactersScene, isCheckIn: false },
      { text: '🃏 Card Battle', screen: CardBattleScene, isCheckIn: false },
      { text: '🧑‍🤝‍🧑 Lineup', screen: LineupScene, isCheckIn: false }
    ];
    
    const buttonWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 400);
    const buttonHeight = 48;
    
    const headerHeight = 235;
    const availableHeight = this.gameHeight - headerHeight - this.STANDARD_PADDING;
    const totalButtonHeight = buttons.length * buttonHeight + (buttons.length - 1) * this.STANDARD_SPACING;
    
    const spacing = totalButtonHeight > availableHeight ? 
      Math.max(4, (availableHeight - (buttons.length * buttonHeight)) / (buttons.length - 1)) : 
      this.STANDARD_SPACING;
    
    buttons.forEach((buttonData, index) => {
      // Disable all buttons except check-in if user hasn't checked in today
      const isDisabled = !this.hasCheckedInToday && !buttonData.isCheckIn;
      
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
    
    buttonContainer.x = (this.gameWidth - buttonWidth) / 2;
    buttonContainer.y = headerHeight;
    
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