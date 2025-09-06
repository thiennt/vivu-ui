import * as PIXI from 'pixi.js';
import { BaseScene, SceneManager } from '@/utils/SceneManager';
import { GameScene } from '@/types';
import { mockDungeons } from '@/utils/mockData';

export class DungeonScene extends BaseScene {
  constructor(app: PIXI.Application, sceneManager: SceneManager) {
    super(app, sceneManager);
  }

  init(): void {
    this.createBackground();
    this.createHeader();
    this.createDungeonList();
    this.createBackButton();
  }

  private createBackground(): void {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x1a0e0a);
    bg.drawRect(0, 0, this.gameWidth, this.gameHeight);
    bg.endFill();
    
    // Add mystical atmosphere
    for (let i = 0; i < 15; i++) {
      const orb = new PIXI.Graphics();
      orb.beginFill(0x4a148c, 0.3);
      orb.drawCircle(
        Math.random() * this.gameWidth,
        Math.random() * this.gameHeight,
        5 + Math.random() * 10
      );
      orb.endFill();
      bg.addChild(orb);
    }
    
    this.addChildAt(bg, 0);
  }

  private createHeader(): void {
    const title = this.createTitle('Choose Your Adventure', this.gameWidth / 2, 60);
    
    const subtitle = new PIXI.Text('Select a dungeon to explore', {
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

  private createDungeonList(): void {
    const dungeonContainer = new PIXI.Container();
    
    mockDungeons.forEach((dungeon, index) => {
      const dungeonCard = this.createDungeonCard(dungeon, index);
      dungeonCard.y = 150 + (index * 180);
      dungeonContainer.addChild(dungeonCard);
    });
    
    dungeonContainer.x = (this.gameWidth - 600) / 2;
    this.addChild(dungeonContainer);
  }

  private createDungeonCard(dungeon: any, index: number): PIXI.Container {
    const card = new PIXI.Container();
    
    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x3e2723, 0.9);
    bg.lineStyle(3, 0x8d6e63);
    bg.drawRoundedRect(0, 0, 600, 160, 15);
    bg.endFill();
    
    // Dungeon icon/preview
    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(0x5d4037);
    iconBg.lineStyle(2, 0x8d6e63);
    iconBg.drawRoundedRect(20, 20, 120, 120, 10);
    iconBg.endFill();
    
    const icon = new PIXI.Text('🏰', {
      fontSize: 48,
      align: 'center'
    });
    icon.anchor.set(0.5);
    icon.x = 80;
    icon.y = 80;
    
    // Dungeon info
    const title = new PIXI.Text(dungeon.name, {
      fontFamily: 'Kalam',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0xffecb3
    });
    title.x = 160;
    title.y = 20;
    
    const description = new PIXI.Text(dungeon.description, {
      fontFamily: 'Kalam',
      fontSize: 14,
      fill: 0xd7ccc8,
      wordWrap: true,
      wordWrapWidth: 380
    });
    description.x = 160;
    description.y = 50;
    
    const requiredLevel = new PIXI.Text(`Required Level: ${dungeon.requiredLevel}`, {
      fontFamily: 'Kalam',
      fontSize: 16,
      fontWeight: 'bold',
      fill: 0xff9800
    });
    requiredLevel.x = 160;
    requiredLevel.y = 90;
    
    const chapters = new PIXI.Text(`Chapters: ${dungeon.chapters.length}`, {
      fontFamily: 'Kalam',
      fontSize: 14,
      fill: 0xa1887f
    });
    chapters.x = 160;
    chapters.y = 115;
    
    // Enter button
    const enterButton = this.createButton(
      'Enter Dungeon',
      450,
      50,
      130,
      60,
      () => {
        (this.sceneManager as any).selectedDungeon = dungeon;
        this.sceneManager.switchTo(GameScene.STAGE);
      }
    );
    
    card.addChild(bg, iconBg, icon, title, description, requiredLevel, chapters, enterButton);
    
    // Hover effects
    card.interactive = true;
    card.on('pointerover', () => {
      bg.tint = 0xe8e8e8;
    });
    card.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    return card;
  }

  private createBackButton(): void {
    const backButton = this.createButton(
      '← Back to Home',
      50,
      this.gameHeight - 80,
      200,
      50,
      () => this.sceneManager.switchTo(GameScene.HOME)
    );
    this.addChild(backButton);
  }

  update(deltaTime: number): void {
    // Animate background orbs
    if (this.children[0] && this.children[0].children) {
      this.children[0].children.forEach((child: any, index) => {
      if (child instanceof PIXI.Graphics) {
        child.alpha = 0.2 + Math.sin(Date.now() * 0.001 + index) * 0.1;
        child.x += Math.sin(Date.now() * 0.0005 + index) * 0.2;
        child.y += Math.cos(Date.now() * 0.0007 + index) * 0.15;
      }
      });
    }
  }

  destroy(): void {
    this.removeChildren();
  }
}