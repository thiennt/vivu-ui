import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/ui/BaseScene';
import { CharactersScene } from './CharactersScene';
import { LineupScene } from './LineupScene';
import { BattleScene } from './BattleScene';
import { CardBattleScene } from './CardBattleScene';
import { TowerScene } from './TowerScene';
import { CheckinScene } from './CheckinScene';
import { Colors } from '@/utils/colors';
import { playerApi, isLikelyUsingMockData } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';


export class HomeScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private decorativeElements: Container[] = [];
  private player: any = null;
  private loadingManager: LoadingStateManager;

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
    
    const playerId = 'player_fc_001';
    this.player = await playerApi.getPlayer(playerId);
    sessionStorage.setItem('player', JSON.stringify(this.player));
    sessionStorage.setItem('playerId', this.player.id);

    this.loadingManager.hideLoading();

    // Show mock data indicator if we're likely using mock data
    if (isLikelyUsingMockData()) {
      this.loadingManager.showMockDataIndicator();
    }
    
    this.createUI();
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

  /** Show the screen with animation */
  async show(): Promise<void> {
    // Animate elements in
    this.container.alpha = 1;
    const tween = { alpha: 0 };
    
    return new Promise((resolve) => {
      const animate = () => {
        tween.alpha += 0.05;
        this.container.alpha = tween.alpha;
        
        if (tween.alpha >= 1) {
          this.container.alpha = 1;
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
        this.container.alpha = tween.alpha;
        
        if (tween.alpha <= 0) {
          this.container.alpha = 0;
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
    this.decorativeElements = [];
  }

  private createBackground(): void {
    const bgContainer = new Container();
    
    const availableHeight = this.getContentHeight();
    
    // Fantasy dark background with texture
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, availableHeight)
      .fill({ color: 0x1a0f0a, alpha: 1.0 });
    
    // Add subtle brown texture overlay
    bg.rect(0, 0, this.gameWidth, availableHeight)
      .fill({ color: 0x2a1810, alpha: 0.3 });
    
    bgContainer.addChild(bg);
    
    // Add mystical floating particles (golden theme)
    for (let i = 0; i < 20; i++) {
      const particle = new Graphics();
      const size = 1 + Math.random() * 2;
      particle.circle(0, 0, size)
        .fill({ color: 0xffd700, alpha: 0.2 + Math.random() * 0.3 });
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
      .fill({ color: 0x8b4513, alpha: 0.95 })
      .stroke({ width: 3, color: 0xd4af37 });
    
    // Inner golden highlight
    banner.moveTo(bannerX + 18, bannerY + 4)
      .lineTo(bannerX + bannerWidth - 18, bannerY + 4)
      .lineTo(bannerX + bannerWidth - 5, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 18, bannerY + bannerHeight - 4)
      .lineTo(bannerX + 18, bannerY + bannerHeight - 4)
      .lineTo(bannerX + 5, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 18, bannerY + 4)
      .stroke({ width: 1, color: 0xffd700, alpha: 0.6 });
    
    const title = new Text({
      text: '⚔️ VIVU ⚔️',
      style: {
        fontFamily: 'Kalam',
        fontSize: 38,
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
      text: 'Crypto Card Adventures',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontStyle: 'italic',
        fill: 0xd4af37,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = bannerY + bannerHeight + 15;
    
    this.container.addChild(banner, title, subtitle);
  }

  private createPlayerInfo(): void {
    const playerPanel = new Container();
    
    const panelWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 380);
    const panelHeight = 90;
    
    // Fantasy parchment panel
    const bg = new Graphics();
    
    // Shadow
    bg.roundRect(3, 3, panelWidth, panelHeight, 10)
      .fill({ color: 0x000000, alpha: 0.4 });
    
    // Main parchment
    bg.roundRect(0, 0, panelWidth, panelHeight, 10)
      .fill({ color: 0xf5e6d3, alpha: 0.98 })
      .stroke({ width: 2, color: 0xd4af37 });
    
    // Inner layer
    bg.roundRect(3, 3, panelWidth - 6, panelHeight - 6, 8)
      .fill({ color: 0xe8d4b8, alpha: 0.6 });
    
    // Golden highlight
    bg.roundRect(5, 5, panelWidth - 10, panelHeight - 10, 7)
      .stroke({ width: 1, color: 0xffd700, alpha: 0.5 });
    
    // Decorative corners
    this.drawPanelCorners(bg, 0, 0, panelWidth, panelHeight, 0xffd700);
    
    // Player info text
    const playerName = new Text({
      text: `👑 Welcome, ${this.player.username}!`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0x2a1810,
        stroke: { color: 0xffd700, width: 0.5 }
      }
    });
    playerName.x = 12;
    playerName.y = 12;
    
    const playerLevel = new Text({
      text: `⭐ Level: ${this.player.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: 0x3d2817
      }
    });
    playerLevel.x = 12;
    playerLevel.y = 38;
    
    const playerExp = new Text({
      text: `✨ EXP: ${this.player.exp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: 0x3d2817
      }
    });
    playerExp.x = 12;
    playerExp.y = 60;
    
    playerPanel.addChild(bg, playerName, playerLevel, playerExp);
    playerPanel.x = (this.gameWidth - panelWidth) / 2;
    playerPanel.y = 135;
    
    this.container.addChild(playerPanel);
  }

  private drawPanelCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: number): void {
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
      { text: '📅 Daily Check-In', screen: CheckinScene },
      { text: '🗼 Tower (Card Battle)', screen: TowerScene },
      { text: '👥 Characters', screen: CharactersScene },
      { text: '🃏 Card Battle', screen: CardBattleScene },
      { text: '🧑‍🤝‍🧑 Lineup', screen: LineupScene },
    ];
    
    const buttonWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 380);
    const buttonHeight = 50;
    
    const headerHeight = 240;
    const availableHeight = this.gameHeight - headerHeight - this.STANDARD_PADDING;
    const totalButtonHeight = buttons.length * buttonHeight + (buttons.length - 1) * this.STANDARD_SPACING;
    
    const spacing = totalButtonHeight > availableHeight ? 
      Math.max(6, (availableHeight - (buttons.length * buttonHeight)) / (buttons.length - 1)) : 
      this.STANDARD_SPACING;
    
    buttons.forEach((buttonData, index) => {
      const button = this.createFantasyButton(
        buttonData.text,
        0,
        index * (buttonHeight + spacing),
        buttonWidth,
        buttonHeight,
        () => navigation.showScreen(buttonData.screen)
      );
      buttonContainer.addChild(button);
    });
    
    buttonContainer.x = (this.gameWidth - buttonWidth) / 2;
    buttonContainer.y = headerHeight;
    
    this.container.addChild(buttonContainer);
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
    
    // Shadow
    bg.roundRect(3, 3, width, height, 8)
      .fill({ color: 0x000000, alpha: 0.4 });
    
    // Main button - wooden style
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: 0x8b4513, alpha: 0.95 })
      .stroke({ width: 2, color: 0xd4af37 });
    
    // Inner highlight
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
      bg.roundRect(3, 3, width, height, 8)
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
      bg.roundRect(3, 3, width, height, 8)
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

  private createDecorations(): void {
    // Add floating golden particles
    for (let i = 0; i < 12; i++) {
      const decoration = new Graphics();
      const size = 2 + Math.random() * 3;
      decoration.circle(0, 0, size)
        .fill({ color: 0xffd700, alpha: 0.4 + Math.random() * 0.3 });
      
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