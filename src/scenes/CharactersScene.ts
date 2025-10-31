import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/ui/BaseScene';
import { Colors } from '@/utils/colors';
import { CharacterDetailScene } from './CharacterDetailScene';
import { ScrollBox } from '@pixi/ui';
import { charactersApi, isLikelyUsingMockData } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';

export class CharactersScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  private scrollOffset: number = 0;
  private maxScroll: number = 0;
  private characters: any[] = [];
  private loadingManager: LoadingStateManager;
  
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private gridContainer: Container;
  private buttonContainer: Container;

  constructor() {
    super();
    this.scrollOffset = 0;
    this.maxScroll = 0;
    
    // Create containers once
    this.container = new Container();
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.gridContainer = new Container();
    this.buttonContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.gridContainer,
      this.buttonContainer
    );
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    // Load data and create UI
    this.loadCharactersData();
  }
  
  private async loadCharactersData(): Promise<void> {
    this.loadingManager.showLoading();
    
    this.characters = await charactersApi.getAllCharacters();
    
    this.loadingManager.hideLoading();
    
    // Show mock data indicator if we're likely using mock data
    if (isLikelyUsingMockData()) {
      this.loadingManager.showMockDataIndicator();
    }
    
    this.initializeUI();
  }
  
  private initializeUI(): void {
    if (!this.characters.length) return;
    
    this.createBackground();
    this.createHeader();
    this.createCharacterGrid();
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
    this.gridContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createCharacterGrid();
    this.createBackButton();
  }

  /** Show the screen with animation */
  async show(): Promise<void> {
    this.alpha = 0;
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
    this.scrollOffset = 0;
    this.maxScroll = 0;
  }

  private createBackground(): void {
    const bg = new Graphics();
    
    // Dark fantasy background
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 1.0 });
    
    // Subtle brown texture
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.3 });
    
    this.backgroundContainer.addChild(bg);
  }

  private createHeader(): void {
    // Fantasy banner for title
    const bannerWidth = Math.min(340, this.gameWidth - 40);
    const bannerHeight = 50;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = 20;
    
    const banner = new Graphics();
    // Ribbon banner
    banner.moveTo(bannerX + 12, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 12, bannerY)
      .lineTo(bannerX + 12, bannerY)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2.5, color: Colors.ROBOT_CYAN });
    
    // Inner highlight
    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.6 });

    const title = new Text({
      text: '🎭 Character Gallery 🎭',
      style: {
        fontFamily: 'Orbitron',
        fontSize: 24,
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
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = bannerY + bannerHeight / 2;

    const subtitle = new Text({
      text: `${this.characters.length} Heroes`,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 14,
        fill: Colors.ROBOT_CYAN,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = bannerY + bannerHeight + 12;
    
    this.headerContainer.addChild(banner, title, subtitle);
  }

  private createCharacterGrid(): void {
    // Calculate area for grid
    const gridTop = 95;
    const backButtonHeight = 45;
    const backButtonMargin = 20;
    const gridHeight = this.gameHeight - gridTop - backButtonHeight - backButtonMargin - this.STANDARD_PADDING;

    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const gap = this.STANDARD_SPACING;
    const cardCount = 3; // Show 3 cards per row
    
    const cardWidth = 94; // Fixed width for better visibility
    const cardHeight = 114; // Match CardBattleScene default ratio

    const layout = {
      itemsPerRow: cardCount,
      itemWidth: cardWidth,
      totalWidth: availableWidth
    };

    // Create grid container
    const gridContent = new Container();

    for (let index = 0; index < this.characters.length; index++) {
      const character = this.characters[index];
      const row = Math.floor(index / layout.itemsPerRow);
      const col = index % layout.itemsPerRow;

      // Calculate position for each card in grid
      const x = col * availableWidth / layout.itemsPerRow + (availableWidth / layout.itemsPerRow - cardWidth) / 2;
      const y = row * (cardHeight + gap);

      const characterCard = this.createCharacterCard(character, x, y, cardWidth, cardHeight);

      characterCard.interactive = true;
      characterCard.cursor = 'pointer';

      characterCard.on('pointerdown', () => {
        navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
      });

      gridContent.addChild(characterCard);
    }

    // Calculate content height
    const totalRows = Math.ceil(this.characters.length / layout.itemsPerRow);
    const contentHeight = totalRows * (cardHeight + gap);

    // Create ScrollBox
    const scrollBox = new ScrollBox({
      width: availableWidth,
      height: gridHeight,
    });
    scrollBox.x = this.STANDARD_PADDING;
    scrollBox.y = gridTop;
    scrollBox.addItem(gridContent);

    gridContent.height = contentHeight;

    this.gridContainer.addChild(scrollBox);
    scrollBox.label = 'gridContainer';
  }

  private setupScrolling(): void {
    this.interactive = true;
    this.on('wheel', (event: any) => {
      const delta = event.deltaY;
      this.scrollOffset += delta * 0.5;
      this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset));

      const gridContainer = this.getChildByLabel('gridContainer');
      if (gridContainer) {
        gridContainer.y = -this.scrollOffset;
      }
    });
  }

  private createBackButton(): void {
    const buttonWidth = Math.min(120, this.gameWidth - 2 * this.STANDARD_PADDING);
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
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.6 });
    
    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_CYAN, width: 2 }
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
    
    return button;
  }

  update(): void {
    // No specific animations needed
  }
}