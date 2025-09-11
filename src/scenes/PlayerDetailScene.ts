import { Graphics, Container, Text, Ticker } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
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
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.statsContainer = new Container();
    this.collectionContainer = new Container();
    this.buttonContainer = new Container();
    this.pointDistributionContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.statsContainer,
      this.pointDistributionContainer,
      this.collectionContainer,
      this.buttonContainer
    );
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    // Load data and create UI
    //this.loadPlayerData();
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
    
    //this.initializeUI();
  }

  private initializeUI(): void {
    if (!this.player) return;
    
    this.createBackground();
    this.createHeader();
    this.createPlayerStats();
    this.createPointDistributionPanel();
    this.createCharacterCollection();
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
    // Clear and recreate layout - this is more efficient than destroying/recreating all elements
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.statsContainer.removeChildren();
    this.pointDistributionContainer.removeChildren();
    this.collectionContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createPlayerStats();
    this.createPointDistributionPanel();
    this.createCharacterCollection();
    this.createBackButton();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.fill(Colors.BACKGROUND_PRIMARY).rect(0, 0, this.gameWidth, this.gameHeight);
    this.backgroundContainer.addChild(bg);
  }

  private createHeader(): void {
    const title = this.createTitle('Player Profile', this.gameWidth / 2, 60);
    this.headerContainer.addChild(title);
  }

  private createPlayerStats(): void {
    if (!this.player) return;
    
    // Calculate responsive panel sizes with standard padding
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const panelWidth = Math.min(280, (availableWidth - this.STANDARD_SPACING) / 2);
    const totalWidth = (panelWidth * 2) + this.STANDARD_SPACING;
    const startX = (this.gameWidth - totalWidth) / 2;
    
    // Main info panel
    const mainPanel = this.createStatsPanel(
      'Player Information',
      [
        `Username: ${this.player.username}`,
        `Level: ${this.player.level}`,
        `Experience: ${this.player.exp}`,
        `Characters: ${this.characters.length}`
      ],
      panelWidth, 160
    );
    
    // Stats panel with temporary changes applied
    const currentSta = this.player.sta + this.tempStatChanges.sta;
    const currentStr = this.player.str + this.tempStatChanges.str;
    const currentAgi = this.player.agi + this.tempStatChanges.agi;
    
    const statsText = [
      `Stamina: ${currentSta}${this.tempStatChanges.sta !== 0 ? ` (${this.tempStatChanges.sta > 0 ? '+' : ''}${this.tempStatChanges.sta})` : ''}`,
      `Strength: ${currentStr}${this.tempStatChanges.str !== 0 ? ` (${this.tempStatChanges.str > 0 ? '+' : ''}${this.tempStatChanges.str})` : ''}`,
      `Agility: ${currentAgi}${this.tempStatChanges.agi !== 0 ? ` (${this.tempStatChanges.agi > 0 ? '+' : ''}${this.tempStatChanges.agi})` : ''}`,
      `Luck: ${this.player.luck}`
    ];
    
    const statsPanel = this.createStatsPanel(
      'Statistics',
      statsText,
      panelWidth, 200
    );
    
    // Center both panels horizontally
    mainPanel.x = startX;
    mainPanel.y = 120;
    
    statsPanel.x = startX + panelWidth + this.STANDARD_SPACING;
    statsPanel.y = 120;
    
    this.statsContainer.addChild(mainPanel, statsPanel);
  }

  private createStatsPanel(title: string, stats: string[], width: number, height: number): Container {
    const panel = new Container();
    
    // Background
    const bg = new Graphics();
    bg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY })
      .roundRect(0, 0, width, height, 12);
    
    // Title
    const titleText = new Text({text: title, style: {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY
    }});
    titleText.x = 15;
    titleText.y = 15;
    
    panel.addChild(bg, titleText);
    
    // Stats
    stats.forEach((stat, index) => {
      const statText = new Text({text: stat, style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY
      }});
      statText.x = 15;
      statText.y = 50 + (index * 22);
      panel.addChild(statText);
    });
    
    return panel;
  }

  private createPointDistributionPanel(): void {
    if (!this.player) return;
    
    // Only show the panel if the player has points to distribute
    if (this.player.points <= 0) {
      return;
    }

    const panelWidth = Math.min(600, this.gameWidth - 2 * this.STANDARD_PADDING);
    const panelHeight = 200;
    const startX = (this.gameWidth - panelWidth) / 2;
    const startY = 340; // Position below the stats panels

    const panel = new Container();
    
    // Background
    const bg = new Graphics();
    bg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY })
      .roundRect(0, 0, panelWidth, panelHeight, 12);
    
    // Title
    const titleText = new Text({text: 'Distribute Attribute Points', style: {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY
    }});
    titleText.x = 15;
    titleText.y = 15;

    // Remaining points display
    const remainingText = new Text({text: `Remaining Points: ${this.remainingPoints}`, style: {
      fontFamily: 'Kalam',
      fontSize: 16,
      fill: Colors.TEXT_SECONDARY
    }});
    remainingText.x = panelWidth - 200;
    remainingText.y = 20;
    
    panel.addChild(bg, titleText, remainingText);
    
    // Stat controls
    const stats = [
      { name: 'Stamina', key: 'sta' as keyof typeof this.tempStatChanges, current: this.player.sta },
      { name: 'Strength', key: 'str' as keyof typeof this.tempStatChanges, current: this.player.str },
      { name: 'Agility', key: 'agi' as keyof typeof this.tempStatChanges, current: this.player.agi }
    ];
    
    stats.forEach((stat, index) => {
      const yPos = 60 + (index * 40);
      
      // Stat name
      const nameText = new Text({text: stat.name, style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_PRIMARY
      }});
      nameText.x = 20;
      nameText.y = yPos;
      
      // Current value display
      const currentValue = stat.current + this.tempStatChanges[stat.key];
      const valueText = new Text({text: `${currentValue}`, style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }});
      valueText.x = 150;
      valueText.y = yPos;
      
      // Minus button
      const minusButton = this.createStatButton('-', 200, yPos - 5, 30, 30, () => {
        if (this.tempStatChanges[stat.key] > 0) {
          this.tempStatChanges[stat.key]--;
          this.remainingPoints++;
          this.refreshPointDistributionPanel();
        }
      });
      
      // Plus button
      const plusButton = this.createStatButton('+', 240, yPos - 5, 30, 30, () => {
        if (this.remainingPoints > 0) {
          this.tempStatChanges[stat.key]++;
          this.remainingPoints--;
          this.refreshPointDistributionPanel();
        }
      });
      
      panel.addChild(nameText, valueText, minusButton, plusButton);
    });

    // Action buttons
    const resetButton = this.createButton(
      'Reset',
      panelWidth - 280,
      panelHeight - 50,
      80,
      40,
      () => {
        this.tempStatChanges = { sta: 0, str: 0, agi: 0 };
        this.remainingPoints = this.player.points;
        this.refreshPointDistributionPanel();
      }
    );
    
    const confirmButton = this.createButton(
      'Confirm',
      panelWidth - 190,
      panelHeight - 50,
      100,
      40,
      async () => {
        try {
          // Apply changes to player data via API
          const updatedStats = {
            sta_point: this.tempStatChanges.sta,
            str_point: this.tempStatChanges.str,
            agi_point: this.tempStatChanges.agi
          };
          
          this.loadingManager.showLoading();
          this.player = await playerApi.updatePlayerStats(this.player.id, updatedStats);
          
          // Reset temporary changes
          this.tempStatChanges = { sta: 0, str: 0, agi: 0 };
          
          this.loadingManager.hideLoading();
          // Refresh the entire UI
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
    
    panel.x = startX;
    panel.y = startY;
    
    this.pointDistributionContainer.addChild(panel);
  }

  private createStatButton(text: string, x: number, y: number, width: number, height: number, onClick: () => void): Container {
    const button = new Container();
    
    // Button background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 4)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });

    // Button text
    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON,
        align: 'center'
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
    
    // Hover effects
    button.on('pointerover', () => {
      bg.tint = Colors.BUTTON_HOVER;
    });
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    button.on('pointerdown', onClick);
    
    return button;
  }

  private refreshPointDistributionPanel(): void {
    // Clear and recreate just the point distribution panel and stats
    this.pointDistributionContainer.removeChildren();
    this.statsContainer.removeChildren();
    this.createPlayerStats();
    this.createPointDistributionPanel();
  }

  private createCharacterCollection(): void {
    if (!this.player) return;
    
    // Card layout with standard spacing
    const cardWidth = 120;
    const cardHeight = 140;
    const totalCards = this.characters.length;

    // Calculate Y position based on whether point distribution panel is shown
    const baseY = this.player.points > 0 ? 560 : 360; // Add 200px offset if point panel is shown

    // Title - centered
    const collectionTitle = new Text({ text: 'Character Collection', style: {
      fontFamily: 'Kalam',
      fontSize: 24,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY
    }});
    collectionTitle.anchor.set(0.5, 0);
    collectionTitle.x = this.gameWidth / 2;
    collectionTitle.y = baseY;

    // ScrollBox setup (no padding/overflow/verticalScroll/horizontalScroll options)
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const visibleCards = Math.min(Math.floor(availableWidth / (cardWidth + this.STANDARD_SPACING)), totalCards);
    const scrollBoxWidth = (cardWidth * visibleCards) + (this.STANDARD_SPACING * (visibleCards - 1));
    const scrollBoxHeight = cardHeight;
    const scrollBox = new ScrollBox({
      width: scrollBoxWidth,
      height: scrollBoxHeight,
    });

    // Add cards to ScrollBox viewport, always from left (no marginLeft)
    this.characters.forEach((character, index) => {
      const card = this.createCharacterPreviewCard(character, this.STANDARD_PADDING + index * (cardWidth + this.STANDARD_SPACING), 0);
      // Position cards horizontally with spacing, always from left
      card.x = index * (cardWidth + this.STANDARD_SPACING);
      card.y = 0;
      scrollBox.addItem(card);
    });

    // Set viewport width for scrolling (include padding)
    scrollBox.width = this.STANDARD_PADDING + totalCards * cardWidth + (totalCards - 1) * this.STANDARD_SPACING + this.STANDARD_PADDING;

    // Position ScrollBox centered horizontally
    scrollBox.x = this.STANDARD_PADDING;
    scrollBox.y = baseY + 40;

    // View all button - responsive width
    const buttonWidth = Math.min(250, this.gameWidth - 2 * this.STANDARD_PADDING);
    const viewAllButton = this.createButton(
      'View All Characters',
      (this.gameWidth - buttonWidth) / 2,
      scrollBox.y + cardHeight + this.STANDARD_SPACING * 2,
      buttonWidth,
      50,
      () => navigation.showScreen(CharactersScene)
    );

    this.collectionContainer.addChild(collectionTitle, scrollBox, viewAllButton);
  }

  private createCharacterPreviewCard(character: any, x: number, y: number): Container {
    const card = this.createHeroCard(character, x, y, 'preview');
    
    // Click handler
    card.on('pointerdown', () => {
      navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
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

  update(_time: Ticker): void {
    // No animations needed for this scene
  }
}