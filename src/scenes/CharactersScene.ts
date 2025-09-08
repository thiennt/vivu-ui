import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { mockCharacters } from '@/utils/mockData';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/utils/BaseScene';
import { Colors } from '@/utils/colors';
import { CharacterDetailScene } from './CharacterDetailScene';

export class CharactersScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  private scrollOffset: number = 0;
  private maxScroll: number = 0;

  constructor() {
    super();
    this.scrollOffset = 0;
    this.maxScroll = 0;
  }

  /** Resize the screen */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    this.createBackground();
    this.createHeader();
    this.createCharacterGrid();
    this.createBackButton();
    this.setupScrolling();
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
    this.removeChildren();
    this.scrollOffset = 0;
    this.maxScroll = 0;
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.fill(Colors.BACKGROUND_PRIMARY).rect(0, 0, this.gameWidth, this.gameHeight);
    this.addChildAt(bg, 0);
  }

  private createHeader(): void {
    const title = this.createTitle('Character Collection', this.gameWidth / 2, 60);

    const subtitle = new Text({
      text: `${mockCharacters.length} Characters`,
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
    
    this.addChild(title, subtitle);
  }

  private createCharacterGrid(): void {
    const gridContainer = new Container();
    
    // Use standard padding and improved layout calculations
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const minCardWidth = 120;
    const maxCardWidth = 180;
    
    const layout = this.calculateGridLayout(
      availableWidth, 
      minCardWidth, 
      maxCardWidth, 
      this.STANDARD_SPACING
    );
    
    const cardHeight = 180;

    // Center the grid container horizontally
    const gridStartX = (this.gameWidth - layout.totalWidth) / 2;
    gridContainer.x = gridStartX;

    // Layout cards
    mockCharacters.forEach((character, index) => {
      const row = Math.floor(index / layout.itemsPerRow);
      const col = index % layout.itemsPerRow;

      const x = col * (layout.itemWidth + this.STANDARD_SPACING);
      const y = 140 + row * (cardHeight + this.STANDARD_SPACING);

      const characterCard = this.createHeroCard(character, x, y, 'detailed');
      characterCard.width = layout.itemWidth;
      characterCard.height = cardHeight;

      characterCard.on('pointerdown', () => {
        navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
      });

      gridContainer.addChild(characterCard);
    });

    const totalRows = Math.ceil(mockCharacters.length / layout.itemsPerRow);
    this.maxScroll = Math.max(0, (totalRows * (cardHeight + this.STANDARD_SPACING)) - (this.gameHeight - 200));

    this.addChild(gridContainer);
    gridContainer.label = 'gridContainer';
  }

  private createDetailedCharacterCard(character: any, x: number, y: number): Container {
    const card = this.createHeroCard(character, x, y, 'detailed');
    
    // Click handler
    card.on('pointerdown', () => {
      navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
    });
    
    // Hover effects
    // card.on('pointerover', () => {
    //   card.scale.set(1.05);
    // });
    // card.on('pointerout', () => {
    //   card.scale.set(1.0);
    // });
    
    return card;
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
    const backButton = this.createButton(
      '← Back',
      this.STANDARD_PADDING,
      this.gameHeight - 80,
      150,
      50,
      () => navigation.showScreen(HomeScene)
    );
    this.addChild(backButton);
  }

  update(time: Ticker): void {
    // No specific animations needed
  }
}