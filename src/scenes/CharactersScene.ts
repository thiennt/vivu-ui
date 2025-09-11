import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/utils/BaseScene';
import { Colors } from '@/utils/colors';
import { CharacterDetailScene } from './CharacterDetailScene';
import { ScrollBox } from '@pixi/ui';
import { charactersApi, ApiError, isLikelyUsingMockData } from '@/services/api';
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
    
    await this.initializeUI();
  }
  
  private async initializeUI(): Promise<void> {
    if (!this.characters.length) return;
    
    this.createBackground();
    this.createHeader();
    await this.createCharacterGrid();
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
  
  private async updateLayout(): Promise<void> {
    // Clear and recreate layout - this is more efficient than destroying/recreating all elements
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.gridContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    await this.createCharacterGrid();
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
    bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(Colors.BACKGROUND_PRIMARY);
    this.backgroundContainer.addChild(bg);
  }

  private createHeader(): void {
    const title = this.createTitle('Character Collection', this.gameWidth / 2, 60);

    const subtitle = new Text({
      text: `${this.characters.length} Characters`,
      style: {
        fontFamily: 'Kalam',
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

  private async createCharacterGrid(): Promise<void> {
    // Calculate area for grid (leave space for back button)
    const gridTop = 140;
    const backButtonHeight = 50;
    const backButtonMargin = 30;
    const gridHeight = this.gameHeight - gridTop - backButtonHeight - backButtonMargin - this.STANDARD_PADDING;

    // Card layout
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const minCardWidth = 120;
    const maxCardWidth = 180;
    const cardHeight = 180;

    const layout = this.calculateGridLayout(
      availableWidth,
      minCardWidth,
      maxCardWidth,
      this.STANDARD_SPACING
    );

    // Create a container for all cards
    const gridContent = new Container();

    for (let index = 0; index < this.characters.length; index++) {
      const character = this.characters[index];
      const row = Math.floor(index / layout.itemsPerRow);
      const col = index % layout.itemsPerRow;

      const x = col * (layout.itemWidth + this.STANDARD_SPACING);
      const y = row * (cardHeight + this.STANDARD_SPACING);

      const characterCard = await this.createHeroCard(character, x, y, 'detailed');
      characterCard.width = layout.itemWidth;
      characterCard.height = cardHeight;

      characterCard.on('pointerdown', () => {
        navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
      });

      gridContent.addChild(characterCard);
    }

    // Set content height for scrolling
    const totalRows = Math.ceil(this.characters.length / layout.itemsPerRow);
    const contentHeight = totalRows * (cardHeight + this.STANDARD_SPACING);

    // Create ScrollBox for vertical scrolling
    const scrollBox = new ScrollBox({
      width: availableWidth,
      height: gridHeight,
    });
    scrollBox.x = this.STANDARD_PADDING;
    scrollBox.y = gridTop;
    scrollBox.addItem(gridContent);

    // Set gridContent height for proper scrolling
    gridContent.height = contentHeight;

    this.gridContainer.addChild(scrollBox);
    scrollBox.label = 'gridContainer';
  }

  // private createDetailedCharacterCard(character: any, x: number, y: number): Container {
  //   const card = this.createHeroCard(character, x, y, 'detailed');
    
  //   // Click handler
  //   card.on('pointerdown', () => {
  //     navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
  //   });
    
  //   // Hover effects
  //   // card.on('pointerover', () => {
  //   //   card.scale.set(1.05);
  //   // });
  //   // card.on('pointerout', () => {
  //   //   card.scale.set(1.0);
  //   // });
    
  //   return card;
  // }

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
    const backButton = this.createButton(
      '← Back',
      this.STANDARD_PADDING,
      this.gameHeight - 80,
      150,
      50,
      () => navigation.showScreen(HomeScene)
    );
    this.buttonContainer.addChild(backButton);
  }

  update(time: Ticker): void {
    // No specific animations needed
  }
}