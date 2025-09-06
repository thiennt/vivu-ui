import * as PIXI from 'pixi.js';
import { AppScreen, navigation } from '@/utils/navigation';
import { mockCharacters } from '@/utils/mockData';
import { HomeScene } from './HomeScene';

export class CharactersScene implements AppScreen {
  /** Assets bundles required by this screen */
  public static assetBundles = ['characters', 'common'];
  
  public container: PIXI.Container;
  private scrollOffset: number = 0;
  private maxScroll: number = 0;
  private gameWidth: number;
  private gameHeight: number;

  constructor() {
    this.container = new PIXI.Container();
    this.scrollOffset = 0;
    this.maxScroll = 0;
    this.gameWidth = 0;
    this.gameHeight = 0;
  }

  /** Prepare screen, before showing */
  prepare(): void {
    this.gameWidth = Math.max(400, window.innerWidth);
    this.gameHeight = window.innerHeight;
    
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

  /** Resize the screen */
  resize(width: number, height: number): void {
    this.gameWidth = Math.max(400, width);
    this.gameHeight = height;
    
    this.reset();
    this.prepare();
  }

  private createBackground(): void {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x2c1810);
    bg.drawRect(0, 0, this.gameWidth, this.gameHeight);
    bg.endFill();
    this.container.addChildAt(bg, 0);
  }

  private createHeader(): void {
    const title = this.createTitle('Character Collection', this.gameWidth / 2, 60);
    
    const subtitle = new PIXI.Text(`${mockCharacters.length} Characters`, {
      fontFamily: 'Kalam',
      fontSize: 18,
      fill: 0xd7ccc8,
      align: 'center'
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = 100;
    
    this.container.addChild(title, subtitle);
  }

  private createCharacterGrid(): void {
    const gridContainer = new PIXI.Container();
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
    gridContainer.name = 'gridContainer';
  }

  private createDetailedCharacterCard(character: any, x: number, y: number): PIXI.Container {
    const card = this.createCard(x, y, 140, 180, character.rarity);
    
    // Character symbol (crypto token)
    const symbolText = new PIXI.Text(character.tokenSymbol, {
      fontFamily: 'Kalam',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center'
    });
    symbolText.anchor.set(0.5);
    symbolText.x = 70;
    symbolText.y = 25;
    
    // Character name
    const nameText = new PIXI.Text(character.name, {
      fontFamily: 'Kalam',
      fontSize: 12,
      fontWeight: 'bold',
      fill: 0xffecb3,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 120
    });
    nameText.anchor.set(0.5);
    nameText.x = 70;
    nameText.y = 50;
    
    // Level and experience
    const levelText = new PIXI.Text(`Level ${character.level}`, {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: 0xd7ccc8,
      align: 'center'
    });
    levelText.anchor.set(0.5);
    levelText.x = 70;
    levelText.y = 80;
    
    const expText = new PIXI.Text(`EXP: ${character.experience}`, {
      fontFamily: 'Kalam',
      fontSize: 10,
      fill: 0xd7ccc8,
      align: 'center'
    });
    expText.anchor.set(0.5);
    expText.x = 70;
    expText.y = 100;
    
    // Stats
    const statsContainer = new PIXI.Container();
    
    const stats = [
      `HP: ${character.stats.health}`,
      `ATK: ${character.stats.attack}`,
      `DEF: ${character.stats.defense}`,
      `SPD: ${character.stats.speed}`
    ];
    
    stats.forEach((stat, index) => {
      const statText = new PIXI.Text(stat, {
        fontFamily: 'Kalam',
        fontSize: 9,
        fill: 0xd7ccc8
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
    
    const elementIndicator = new PIXI.Graphics();
    elementIndicator.beginFill(elementColors[character.element] || 0x888888);
    elementIndicator.drawCircle(120, 20, 8);
    elementIndicator.endFill();
    
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
      
      const gridContainer = this.container.getChildByName('gridContainer');
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

  update(deltaTime: number): void {
    // No specific animations needed
  }

  private createButton(
    text: string, 
    x: number, 
    y: number, 
    width: number = 200, 
    height: number = 50,
    onClick?: () => void
  ): PIXI.Container {
    const button = new PIXI.Container();
    
    // Button background with fantasy styling
    const bg = new PIXI.Graphics();
    bg.beginFill(0x8d6e63);
    bg.lineStyle(3, 0x5d4037);
    bg.drawRoundedRect(0, 0, width, height, 8);
    bg.endFill();
    
    // Button text
    const buttonText = new PIXI.Text(text, {
      fontFamily: 'Kalam',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0xfff8e1,
      align: 'center'
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
      bg.tint = 0xa1887f;
    });
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    if (onClick) {
      button.on('pointerdown', onClick);
    }
    
    return button;
  }

  private createCard(
    x: number, 
    y: number, 
    width: number = 120, 
    height: number = 160,
    rarity: string = 'common'
  ): PIXI.Container {
    const card = new PIXI.Container();
    
    const rarityColors: { [key: string]: number } = {
      common: 0x8d6e63,
      uncommon: 0x66bb6a,
      rare: 0x42a5f5,
      epic: 0xab47bc,
      legendary: 0xff9800
    };
    
    const bg = new PIXI.Graphics();
    bg.beginFill(rarityColors[rarity] || rarityColors.common);
    bg.lineStyle(2, 0x3e2723);
    bg.drawRoundedRect(0, 0, width, height, 8);
    bg.endFill();
    
    card.addChild(bg);
    card.x = x;
    card.y = y;
    card.interactive = true;
    card.cursor = 'pointer';
    
    return card;
  }

  private createTitle(text: string, x: number, y: number): PIXI.Text {
    const title = new PIXI.Text(text, {
      fontFamily: 'Kalam',
      fontSize: 36,
      fontWeight: 'bold',
      fill: 0xffecb3,
      stroke: {
        color: 0x3e2723,
        width: 3,
      },
      dropShadow: {
        color: 0x000000,
        blur: 4,
        angle: Math.PI / 6,
        distance: 6,
        alpha: 0.5,
      },
    });
    title.anchor.set(0.5);
    title.x = x;
    title.y = y;
    return title;
  }

  destroy(): void {
    this.container.removeChildren();
  }
}