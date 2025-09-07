import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { mockCharacters } from '@/utils/mockData';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/utils/BaseScene';

export class CharactersScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private scrollOffset: number = 0;
  private maxScroll: number = 0;

  constructor() {
    super();

    this.container = new Container();
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
    this.container.alpha = 0;
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
    this.scrollOffset = 0;
    this.maxScroll = 0;
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.fill(0x2c1810).rect(0, 0, this.gameWidth, this.gameHeight);
    this.container.addChildAt(bg, 0);
  }

  private createHeader(): void {
    const title = this.createTitle('Character Collection', this.gameWidth / 2, 60);

    const subtitle = new Text({
      text: `${mockCharacters.length} Characters`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fill: 0xd7ccc8,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = 100;
    
    this.container.addChild(title, subtitle);
  }

  private createCharacterGrid(): void {
    const gridContainer = new Container();
    const cardsPerRow = Math.floor((this.gameWidth - 100) / 150);
    const cardWidth = 140;
    const cardHeight = 180;
    const spacing = 10;
    
    mockCharacters.forEach((character, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      
      const x = 50 + col * (cardWidth + spacing);
      const y = 140 + row * (cardHeight + spacing);
      
      const characterCard = this.createDetailedCharacterCard(character, x, y);
      gridContainer.addChild(characterCard);
    });
    
    // Calculate max scroll
    const totalRows = Math.ceil(mockCharacters.length / cardsPerRow);
    this.maxScroll = Math.max(0, (totalRows * (cardHeight + spacing)) - (this.gameHeight - 200));
    
    this.container.addChild(gridContainer);
    gridContainer.label = 'gridContainer';
  }

  private createDetailedCharacterCard(character: any, x: number, y: number): Container {
    const card = this.createCard(x, y, 140, 180, character.rarity);
    
    // Character symbol (crypto token)
    const symbolText = new Text({
      text: character.tokenSymbol,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center'
      }
    });
    symbolText.anchor.set(0.5);
    symbolText.x = 70;
    symbolText.y = 25;
    
    // Character name
    const nameText = new Text({
      text: character.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: 0xffecb3,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 120
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = 70;
    nameText.y = 50;
    
    // Level and experience
    const levelText = new Text({
      text: `Level ${character.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xd7ccc8,
        align: 'center'
      }
    });
    levelText.anchor.set(0.5);
    levelText.x = 70;
    levelText.y = 80;

    const expText = new Text({
      text: `EXP: ${character.experience}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: 0xd7ccc8,
        align: 'center'
      }
    });
    expText.anchor.set(0.5);
    expText.x = 70;
    expText.y = 100;
    
    // Stats
    const statsContainer = new Container();
    
    const stats = [
      `HP: ${character.stats.health}`,
      `ATK: ${character.stats.attack}`,
      `DEF: ${character.stats.defense}`,
      `SPD: ${character.stats.speed}`
    ];
    
    stats.forEach((stat, index) => {
      const statText = new Text({
        text: stat,
        style: {
          fontFamily: 'Kalam',
          fontSize: 9,
          fill: 0xd7ccc8
        }
      });
      statText.x = 10 + (index % 2) * 60;
      statText.y = 115 + Math.floor(index / 2) * 15;
      statsContainer.addChild(statText);
    });
    
    // Element indicator
    const elementColors: { [key: string]: number } = {
      fire: 0xff5722,
      water: 0x2196f3,
      earth: 0x4caf50,
      air: 0xffeb3b,
      light: 0xffc107,
      dark: 0x9c27b0
    };
    
    const elementIndicator = new Graphics();
    elementIndicator.fill(elementColors[character.element] || 0x888888)
      .circle(120, 20, 8);
    
    card.addChild(symbolText, nameText, levelText, expText, statsContainer, elementIndicator);
    
    // Click handler - for now just show an alert, will implement character detail screen later
    card.on('pointerdown', () => {
      console.log('Character clicked:', character.name);
      // TODO: Implement character detail navigation
    });
    
    // Hover effects
    card.on('pointerover', () => {
      card.scale.set(1.05);
    });
    card.on('pointerout', () => {
      card.scale.set(1.0);
    });
    
    return card;
  }

  private setupScrolling(): void {
    this.container.interactive = true;
    this.container.on('wheel', (event: any) => {
      const delta = event.deltaY;
      this.scrollOffset += delta * 0.5;
      this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset));

      const gridContainer = this.container.getChildByLabel('gridContainer');
      if (gridContainer) {
        gridContainer.y = -this.scrollOffset;
      }
    });
  }

  private createBackButton(): void {
    const backButton = this.createButton(
      '← Back',
      50,
      this.gameHeight - 80,
      150,
      50,
      () => navigation.showScreen(HomeScene)
    );
    this.container.addChild(backButton);
  }

  update(time: Ticker): void {
    // No specific animations needed
  }
}