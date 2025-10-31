import { Graphics, Container, Text, Ticker } from 'pixi.js';
import { BaseScene } from '@/ui/BaseScene';
import { navigation } from '@/utils/navigation';
import { CharactersScene } from './CharactersScene';
import { CharacterDetailScene } from './CharacterDetailScene';
import { HomeScene } from './HomeScene';
import { Colors } from '@/utils/colors';
import { ScrollBox } from '@pixi/ui';
import { playerApi, ApiError, isLikelyUsingMockData } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';

export class PlayerDetailScene extends BaseScene {
  // UI containers
  public container: Container;
  private mainScrollBox: ScrollBox | null = null;
  private scrollContent: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private statsContainer: Container;
  private collectionContainer: Container;
  private buttonContainer: Container;
  private pointDistributionContainer: Container;

  // Data state
  private player: any = null;
  private characters: any[] = [];
  private loadingManager: LoadingStateManager;

  // Point distribution state
  private tempStatChanges = { sta: 0, str: 0, agi: 0 };
  private remainingPoints: number = 0;

  constructor() {
    super();
    
    // Create containers once
    this.container = new Container();
    this.scrollContent = new Container();
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.statsContainer = new Container();
    this.collectionContainer = new Container();
    this.buttonContainer = new Container();
    this.pointDistributionContainer = new Container();
    
    this.addChild(this.container);
    
    // Add background directly to main container (not scrolled)
    this.container.addChild(this.backgroundContainer);
    
    // Add scrollable content
    this.scrollContent.addChild(
      this.headerContainer,
      this.statsContainer,
      this.pointDistributionContainer,
      this.collectionContainer,
      this.buttonContainer
    );
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
  }
  
  private async loadPlayerData(): Promise<void> {
    this.loadingManager.showLoading();

    this.player = sessionStorage.getItem('player') ? JSON.parse(sessionStorage.getItem('player') as string) : null;
    this.characters = this.player?.characters || [];
    this.remainingPoints = this.player.points || 0;
    this.tempStatChanges = { sta: 0, str: 0, agi: 0 };

    this.loadingManager.hideLoading();
    
    // Show mock data indicator if we're likely using mock data
    if (isLikelyUsingMockData()) {
      this.loadingManager.showMockDataIndicator();
    }
    
    this.initializeUI();
  }

  private initializeUI(): void {
    if (!this.player) return;
    
    this.createBackground();
    this.createHeader();
    this.createPlayerStats();
    this.createPointDistributionPanel();
    //this.createCharacterCollection();
    this.createBackButton();
  }

  prepare(): void {
    this.loadPlayerData();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Update loading manager dimensions
    this.loadingManager.updateDimensions(width, height);

    // Only update layout if we have loaded data
    if (this.player) {
      this.updateLayout();
    }
  }
  
  private updateLayout(): void {
    // Clear and recreate layout
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.statsContainer.removeChildren();
    this.pointDistributionContainer.removeChildren();
    this.collectionContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Remove existing scroll box if any
    if (this.mainScrollBox) {
      this.container.removeChild(this.mainScrollBox);
      this.mainScrollBox = null;
    }
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createPlayerStats();
    this.createPointDistributionPanel();
    //this.createCharacterCollection();
    this.createBackButton();
    
    // Calculate content height for scrolling
    const contentHeight = this.calculateTotalContentHeight();
    
    // Create vertical ScrollBox for entire scene content
    if (contentHeight > this.gameHeight) {
      this.mainScrollBox = new ScrollBox({
        width: this.gameWidth,
        height: this.gameHeight,
      });
      this.mainScrollBox.addItem(this.scrollContent);
      this.container.addChild(this.mainScrollBox);
    } else {
      // If content fits, just add directly without scrolling
      this.container.addChild(this.scrollContent);
    }
  }
  
  private calculateTotalContentHeight(): number {
    let maxY = 0;
    
    this.scrollContent.children.forEach(child => {
      child.children.forEach(grandchild => {
        const bounds = grandchild.getBounds();
        const bottomY = bounds.y + bounds.height;
        if (bottomY > maxY) {
          maxY = bottomY;
        }
      });
    });
    
    return maxY + this.STANDARD_PADDING;
  }

  private createBackground(): void {
    const bg = new Graphics();
    
    // Dark fantasy background
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.BROWN_DARKEST, alpha: 1.0 });
    
    // Brown texture overlay
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.3 });
    
    this.backgroundContainer.addChild(bg);
  }

  private createHeader(): void {
    // Fantasy banner
    const bannerWidth = Math.min(320, this.gameWidth - 40);
    const bannerHeight = 48;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = 20;
    
    const banner = new Graphics();
    banner.moveTo(bannerX + 12, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 12, bannerY)
      .lineTo(bannerX + 12, bannerY)
      .fill({ color: Colors.BROWN, alpha: 0.95 })
      .stroke({ width: 2.5, color: Colors.GOLD });
    
    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });

    const title = new Text({
      text: '👤 Player Profile 👤',
      style: {
        fontFamily: 'Kalam',
        fontSize: 22,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BROWN_DARK, width: 2 },
        dropShadow: {
          color: Colors.GOLD_BRIGHT,
          blur: 3,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
        }
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = bannerY + bannerHeight / 2;
    
    this.headerContainer.addChild(banner, title);
  }

  private createPlayerStats(): void {
    if (!this.player) return;
    
    const startY = 85;
    const padding = this.STANDARD_PADDING;
    const availableWidth = this.gameWidth - 2 * padding;
    const panelWidth = Math.min(580, availableWidth);
    const panelX = (this.gameWidth - panelWidth) / 2;
    
    // Calculate current stats with changes
    const currentSta = this.player.sta + this.tempStatChanges.sta;
    const currentStr = this.player.str + this.tempStatChanges.str;
    const currentAgi = this.player.agi + this.tempStatChanges.agi;
    
    // Player info panel with avatar
    const playerInfoPanel = this.createPlayerInfoPanel(
      panelWidth,
      [
        { label: '👤 Username:', value: this.player.username },
        { label: '⭐ Level:', value: this.player.level.toString() },
        { label: '✨ Experience:', value: this.player.exp.toString() },
        { label: '🎭 Characters:', value: this.characters.length.toString() },
      ]
    );
    
    playerInfoPanel.x = panelX;
    playerInfoPanel.y = startY;
    
    // Statistics panel (below player info)
    const statsPanel = this.createStatisticsPanel(
      panelWidth,
      [
        { label: '❤️ Stamina:', value: `${currentSta}${this.tempStatChanges.sta !== 0 ? ` (+${this.tempStatChanges.sta})` : ''}` },
        { label: '💪 Strength:', value: `${currentStr}${this.tempStatChanges.str !== 0 ? ` (+${this.tempStatChanges.str})` : ''}` },
        { label: '⚡ Agility:', value: `${currentAgi}${this.tempStatChanges.agi !== 0 ? ` (+${this.tempStatChanges.agi})` : ''}` },
        { label: '🍀 Luck:', value: this.player.luck.toString() }
      ]
    );
    
    statsPanel.x = panelX;
    statsPanel.y = startY + 155; // Position below player info panel
    
    this.statsContainer.addChild(playerInfoPanel, statsPanel);
  }

  private createPlayerInfoPanel(
    width: number,
    playerInfo: Array<{label: string, value: string}>
  ): Container {
    const panel = new Container();
    const height = 145;
    
    // Parchment panel
    const bg = new Graphics();
    
    bg.roundRect(3, 3, width, height, 10)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    
    bg.roundRect(0, 0, width, height, 10)
      .fill({ color: Colors.PARCHMENT_LIGHT, alpha: 0.98 })
      .stroke({ width: 2, color: Colors.GOLD });
    
    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: Colors.PARCHMENT, alpha: 0.6 });
    
    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.5 });
    
    panel.addChild(bg);
    
    // Title
    const title = new Text({
      text: '📜 Player Info',
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.BROWN_DARK,
        stroke: { color: Colors.GOLD_BRIGHT, width: 0.5 }
      }
    });
    title.x = 12;
    title.y = 12;
    panel.addChild(title);
    
    // Avatar circle on the left
    const avatarSize = 80;
    const avatarX = 20;
    const avatarY = 50;
    
    const avatarBg = new Graphics();
    avatarBg.circle(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 3)
      .fill({ color: Colors.GOLD, alpha: 0.3 });
    avatarBg.circle(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2)
      .fill({ color: Colors.BROWN_LIGHT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD });
    
    const avatarEmoji = new Text({
      text: '👤',
      style: {
        fontSize: 48
      }
    });
    avatarEmoji.anchor.set(0.5);
    avatarEmoji.x = avatarX + avatarSize / 2;
    avatarEmoji.y = avatarY + avatarSize / 2;
    
    panel.addChild(avatarBg, avatarEmoji);
    
    // Player info on the right
    const infoStartX = avatarX + avatarSize + 20;
    playerInfo.forEach((item, index) => {
      const statText = new Text({
        text: `${item.label} ${item.value}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fill: Colors.BROWN_DARKER
        }
      });
      statText.x = infoStartX;
      statText.y = 45 + (index * 22);
      panel.addChild(statText);
    });
    
    return panel;
  }

  private createStatisticsPanel(
    width: number,
    statistics: Array<{label: string, value: string}>
  ): Container {
    const panel = new Container();
    const height = statistics.length * 22 + 60;
    
    // Parchment panel
    const bg = new Graphics();
    
    bg.roundRect(3, 3, width, height, 10)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    
    bg.roundRect(0, 0, width, height, 10)
      .fill({ color: Colors.PARCHMENT_LIGHT, alpha: 0.98 })
      .stroke({ width: 2, color: Colors.GOLD });
    
    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: Colors.PARCHMENT, alpha: 0.6 });
    
    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.5 });
    
    panel.addChild(bg);
    
    // Title
    const title = new Text({
      text: '⚔️ Statistics',
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.BROWN_DARK,
        stroke: { color: Colors.GOLD_BRIGHT, width: 0.5 }
      }
    });
    title.x = 12;
    title.y = 12;
    panel.addChild(title);
    
    // Statistics list
    statistics.forEach((item, index) => {
      const statText = new Text({
        text: `${item.label} ${item.value}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fill: Colors.BROWN_DARKER
        }
      });
      statText.x = 12;
      statText.y = 45 + (index * 22);
      panel.addChild(statText);
    });
    
    return panel;
  }

  private createPointDistributionPanel(): void {
    if (!this.player) return;

    const padding = this.STANDARD_PADDING;
    
    // Position below player info (145) + stats panel (148) + gaps
    const startY = 85 + 155 + 148 + 15;
    
    const panelWidth = Math.min(580, this.gameWidth - 2 * padding);
    const panelHeight = this.player.points <= 0 ? 90 : 190;
    const panelX = (this.gameWidth - panelWidth) / 2;

    const panel = new Container();
    
    // Fantasy parchment panel
    const bg = new Graphics();
    
    bg.roundRect(3, 3, panelWidth, panelHeight, 10)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    
    bg.roundRect(0, 0, panelWidth, panelHeight, 10)
      .fill({ color: Colors.PARCHMENT_LIGHT, alpha: 0.98 })
      .stroke({ width: 2, color: Colors.GOLD });
    
    bg.roundRect(3, 3, panelWidth - 6, panelHeight - 6, 8)
      .fill({ color: Colors.PARCHMENT, alpha: 0.6 });
    
    bg.roundRect(5, 5, panelWidth - 10, panelHeight - 10, 7)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.5 });
    
    // Title
    const titleText = new Text({
      text: '✨ Attribute Points ✨',
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.BROWN_DARK,
        stroke: { color: Colors.GOLD_BRIGHT, width: 0.5 }
      }
    });
    titleText.x = 12;
    titleText.y = 12;

    panel.addChild(bg, titleText);

    if (this.player.points <= 0) {
      const noPointsText = new Text({
        text: 'No points available to distribute',
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fill: Colors.BROWN,
          fontStyle: 'italic'
        }
      });
      noPointsText.x = 12;
      noPointsText.y = 45;
      
      panel.addChild(noPointsText);
      panel.x = panelX;
      panel.y = startY;
      this.pointDistributionContainer.addChild(panel);
      return;
    }

    // Remaining points
    const remainingText = new Text({
      text: `⭐ ${this.remainingPoints} pts`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.BROWN_DARK,
        stroke: { color: Colors.GOLD_BRIGHT, width: 0.5 }
      }
    });
    remainingText.anchor.set(1, 0);
    remainingText.x = panelWidth - 12;
    remainingText.y = 15;
    
    panel.addChild(remainingText);
    
    // Stat controls
    const stats = [
      { name: '❤️ Stamina', key: 'sta' as keyof typeof this.tempStatChanges, current: this.player.sta },
      { name: '💪 Strength', key: 'str' as keyof typeof this.tempStatChanges, current: this.player.str },
      { name: '⚡ Agility', key: 'agi' as keyof typeof this.tempStatChanges, current: this.player.agi }
    ];
    
    stats.forEach((stat, index) => {
      const yPos = 50 + (index * 36);
      
      // Stat name
      const nameText = new Text({
        text: stat.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fontWeight: 'bold',
          fill: Colors.BROWN_DARK
        }
      });
      nameText.x = 12;
      nameText.y = yPos;
      
      // Current value
      const currentValue = stat.current + this.tempStatChanges[stat.key];
      const valueText = new Text({
        text: `${currentValue}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fontWeight: 'bold',
          fill: Colors.BROWN_DARK
        }
      });
      valueText.x = 140;
      valueText.y = yPos - 2;
      
      // Buttons
      const minusButton = this.createFantasyStatButton('-', 180, yPos - 3, 30, 28, () => {
        if (this.tempStatChanges[stat.key] > 0) {
          this.tempStatChanges[stat.key]--;
          this.remainingPoints++;
          this.refreshPointDistributionPanel();
        }
      });
      
      const plusButton = this.createFantasyStatButton('+', 218, yPos - 3, 30, 28, () => {
        if (this.remainingPoints > 0) {
          this.tempStatChanges[stat.key]++;
          this.remainingPoints--;
          this.refreshPointDistributionPanel();
        }
      });
      
      panel.addChild(nameText, valueText, minusButton, plusButton);
    });

    // Action buttons
    const buttonY = panelHeight - 40;
    const buttonHeight = 34;
    
    const resetButton = this.createFantasyButton(
      'Reset',
      panelWidth - 155,
      buttonY,
      70,
      buttonHeight,
      () => {
        this.tempStatChanges = { sta: 0, str: 0, agi: 0 };
        this.remainingPoints = this.player.points;
        this.refreshPointDistributionPanel();
      }
    );
    
    const confirmButton = this.createFantasyButton(
      'Confirm',
      panelWidth - 77,
      buttonY,
      70,
      buttonHeight,
      async () => {
        try {
          const updatedStats = {
            sta_point: this.tempStatChanges.sta,
            str_point: this.tempStatChanges.str,
            agi_point: this.tempStatChanges.agi
          };
          
          this.loadingManager.showLoading();
          this.player = await playerApi.updatePlayerStats(this.player.id, updatedStats);
          
          this.tempStatChanges = { sta: 0, str: 0, agi: 0 };
          
          this.loadingManager.hideLoading();
          this.updateLayout();
        } catch (error) {
          console.error('Failed to update player stats:', error);
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Failed to update stats. Please try again.';
          this.loadingManager.showError(errorMessage);
        }
      }
    );
    
    panel.addChild(resetButton, confirmButton);
    
    panel.x = panelX;
    panel.y = startY;
    
    this.pointDistributionContainer.addChild(panel);
  }

  private createFantasyStatButton(text: string, x: number, y: number, width: number, height: number, onClick: () => void): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 6)
      .fill({ color: Colors.BROWN, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD });
    
    bg.roundRect(2, 2, width - 4, height - 4, 4)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.5 });

    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BROWN_DARK, width: 1.5 }
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
      bg.roundRect(0, 0, width, height, 6)
        .fill({ color: Colors.BROWN_LIGHT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.GOLD_BRIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 4)
        .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.8 });
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 6)
        .fill({ color: Colors.BROWN, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.GOLD });
      bg.roundRect(2, 2, width - 4, height - 4, 4)
        .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.5 });
    });
    
    button.on('pointerdown', onClick);
    
    return button;
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
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.BROWN, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD });
    
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });

    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 13,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BROWN_DARK, width: 2 }
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
        .fill({ color: Colors.BROWN_LIGHT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.GOLD_BRIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.9 });
      button.scale.set(1.02);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: Colors.BROWN, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.GOLD });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });
      button.scale.set(1.0);
    });
    
    button.on('pointerdown', onClick);
    
    return button;
  }

  private refreshPointDistributionPanel(): void {
    this.pointDistributionContainer.removeChildren();
    this.statsContainer.removeChildren();
    this.createPlayerStats();
    this.createPointDistributionPanel();
  }

  private createCharacterCollection(): void {
    if (!this.player) return;
    
    // Position after point distribution panel
    // Player info: 85 + 145 = 230
    // Stats: 230 + 10 + 148 = 388
    // Point: 388 + 15 + (90 or 190) = 493 or 593
    const pointPanelHeight = this.player.points <= 0 ? 90 : 190;
    const baseY = 85 + 155 + 148 + 15 + pointPanelHeight + 15;
    
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const gap = 10;
    const cardCount = 3;
    
    const cardWidth = (availableWidth - (gap * (cardCount - 1))) / cardCount;
    const cardHeight = cardWidth * (160 / 120); // Match CardBattleScene default ratio

    // Title
    const collectionTitle = new Text({ 
      text: '🎭 Character Collection', 
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BROWN_DARK, width: 2 },
        dropShadow: {
          color: Colors.GOLD_BRIGHT,
          blur: 3,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
        }
      }
    });
    collectionTitle.anchor.set(0.5, 0);
    collectionTitle.x = this.gameWidth / 2;
    collectionTitle.y = baseY;

    const gridContent = new Container();

    this.characters.forEach((character, index) => {
      const row = Math.floor(index / cardCount);
      const col = index % cardCount;

      const x = col * (cardWidth + gap);
      const y = row * (cardHeight + gap);

      const card = this.createCharacterPreviewCard(character, x, y, cardWidth);
      gridContent.addChild(card);
    });

    const totalRows = Math.ceil(this.characters.length / cardCount);
    const contentHeight = totalRows * (cardHeight + gap);
    const maxScrollHeight = 160;

    const scrollBox = new ScrollBox({
      width: availableWidth,
      height: Math.min(maxScrollHeight, contentHeight),
    });

    scrollBox.addItem(gridContent);
    scrollBox.x = this.STANDARD_PADDING;
    scrollBox.y = baseY + 35;

    // View all button
    const buttonWidth = 180;
    const buttonHeight = 40;
    const viewAllButton = this.createFantasyButton(
      'View All',
      (this.gameWidth - buttonWidth) / 2,
      scrollBox.y + Math.min(maxScrollHeight, contentHeight) + 12,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(CharactersScene)
    );

    this.collectionContainer.addChild(collectionTitle, scrollBox, viewAllButton);
  }

  private createCharacterPreviewCard(character: any, x: number, y: number, customWidth?: number): Container {
    const cardWidth = customWidth || 120;
    const cardHeight = cardWidth * (160 / 120); // Match CardBattleScene default ratio
    const card = this.createCharacterCard(character, x, y, cardWidth, cardHeight);
    
    card.on('pointerdown', () => {
      navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
    });
    
    return card;
  }

  private createBackButton(): void {
    const buttonWidth = Math.min(160, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = 40;
    
    const backButton = this.createFantasyButton(
      '← Back',
      this.STANDARD_PADDING,
      this.gameHeight - buttonHeight - this.STANDARD_PADDING,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );
    this.buttonContainer.addChild(backButton);
  }

  update(_time: Ticker): void {
    // No animations needed
  }
}