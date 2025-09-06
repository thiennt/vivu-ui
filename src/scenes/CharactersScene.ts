import * as PIXI from 'pixi.js';
import { BaseScene, SceneManager } from '@/utils/SceneManager';
import { GameScene } from '@/types';
import { mockCharacters } from '@/utils/mockData';

export class CharactersScene extends BaseScene {
  private scrollOffset: number = 0;
  private maxScroll: number = 0;

  constructor(app: PIXI.Application, sceneManager: SceneManager) {
    super(app, sceneManager);
  }

  init(): void {
    this.createBackground();
    this.createHeader();
    this.createCharacterGrid();
    this.createBackButton();
    this.setupScrolling();
  }

  private createBackground(): void {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x2c1810);
    bg.drawRect(0, 0, this.gameWidth, this.gameHeight);
    bg.endFill();
    this.addChildAt(bg, 0);
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
    
    this.addChild(title, subtitle);
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
    
    this.addChild(gridContainer);
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
    
    // Click handler
    card.on('pointerdown', () => {
      (this.sceneManager as any).selectedCharacter = character;
      this.sceneManager.switchTo(GameScene.CHARACTER_DETAIL);
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
    this.interactive = true;
    this.on('wheel', (event: any) => {
      const delta = event.deltaY;
      this.scrollOffset += delta * 0.5;
      this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset));
      
      const gridContainer = this.getChildByName('gridContainer');
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
      () => this.sceneManager.switchTo(GameScene.HOME)
    );
    this.addChild(backButton);
  }

  update(deltaTime: number): void {
    // No specific animations needed
  }

  destroy(): void {
    this.removeChildren();
  }
}