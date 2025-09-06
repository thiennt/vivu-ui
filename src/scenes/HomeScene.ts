import * as PIXI from 'pixi.js';
import { BaseScene, SceneManager } from '@/utils/SceneManager';
import { GameScene } from '@/types';
import { mockPlayer } from '@/utils/mockData';

export class HomeScene extends BaseScene {
  private decorativeElements: PIXI.Container[] = [];

  constructor(app: PIXI.Application, sceneManager: SceneManager) {
    super(app, sceneManager);
  }

  init(): void {
    this.createBackground();
    this.createHomeTitle();
    this.createPlayerInfo();
    this.createMenuButtons();
    this.createDecorations();
  }

  private createBackground(): void {
    // Create a mystical gradient background
    const bg = new PIXI.Graphics();
    
    // Main background with gradient effect
    bg.beginFill(0x1a0e0a);
    bg.drawRect(0, 0, this.gameWidth, this.gameHeight);
    bg.endFill();
    
    // Add some mystical patterns
    for (let i = 0; i < 20; i++) {
      const star = new PIXI.Graphics();
      star.beginFill(0xffecb3, 0.3);
      star.drawPolygon([
        Math.cos(0) * 8, Math.sin(0) * 8,
        Math.cos(Math.PI * 0.4) * 4, Math.sin(Math.PI * 0.4) * 4,
        Math.cos(Math.PI * 0.8) * 8, Math.sin(Math.PI * 0.8) * 8,
        Math.cos(Math.PI * 1.2) * 4, Math.sin(Math.PI * 1.2) * 4,
        Math.cos(Math.PI * 1.6) * 8, Math.sin(Math.PI * 1.6) * 8,
        Math.cos(Math.PI * 2.0) * 4, Math.sin(Math.PI * 2.0) * 4
      ]);
      star.x = Math.random() * this.gameWidth;
      star.y = Math.random() * this.gameHeight;
      star.endFill();
      bg.addChild(star);
    }
    
    this.addChildAt(bg, 0);
  }

  private createHomeTitle(): void {
    const title = new PIXI.Text('VIVU', {
      fontFamily: 'Kalam',
      fontSize: 72,
      fontWeight: 'bold',
      fill: ['#ffecb3', '#ff8f00'],
      stroke: 0x3e2723,
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowBlur: 8,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 8,
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = 100;
    
    const subtitle = new PIXI.Text('Crypto Card Adventures', {
      fontFamily: 'Kalam',
      fontSize: 24,
      fontStyle: 'italic',
      fill: 0xd7ccc8,
      align: 'center'
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = 150;
    
    this.addChild(title, subtitle);
  }

  private createPlayerInfo(): void {
    const playerPanel = new PIXI.Container();
    
    // Background panel
    const bg = new PIXI.Graphics();
    bg.beginFill(0x3e2723, 0.8);
    bg.lineStyle(2, 0x8d6e63);
    bg.drawRoundedRect(0, 0, 300, 100, 12);
    bg.endFill();
    
    // Player info text
    const playerName = new PIXI.Text(`Welcome, ${mockPlayer.username}!`, {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xffecb3
    });
    playerName.x = 15;
    playerName.y = 15;
    
    const playerLevel = new PIXI.Text(`Level: ${mockPlayer.level}`, {
      fontFamily: 'Kalam',
      fontSize: 16,
      fill: 0xd7ccc8
    });
    playerLevel.x = 15;
    playerLevel.y = 45;
    
    const playerExp = new PIXI.Text(`EXP: ${mockPlayer.experience}`, {
      fontFamily: 'Kalam',
      fontSize: 16,
      fill: 0xd7ccc8
    });
    playerExp.x = 15;
    playerExp.y = 65;
    
    playerPanel.addChild(bg, playerName, playerLevel, playerExp);
    playerPanel.x = (this.gameWidth - 300) / 2;
    playerPanel.y = 200;
    
    this.addChild(playerPanel);
  }

  private createMenuButtons(): void {
    const buttonContainer = new PIXI.Container();
    
    const buttons = [
      { text: 'Adventure', scene: GameScene.DUNGEON },
      { text: 'Characters', scene: GameScene.CHARACTERS },
      { text: 'Player Profile', scene: GameScene.PLAYER_DETAIL },
      { text: 'Formation', scene: GameScene.FORMATION }
    ];
    
    buttons.forEach((buttonData, index) => {
      const button = this.createButton(
        buttonData.text,
        0,
        index * 70,
        250,
        60,
        () => this.sceneManager.switchTo(buttonData.scene)
      );
      buttonContainer.addChild(button);
    });
    
    buttonContainer.x = (this.gameWidth - 250) / 2;
    buttonContainer.y = 350;
    
    this.addChild(buttonContainer);
  }

  private createDecorations(): void {
    // Add some floating magical elements
    for (let i = 0; i < 8; i++) {
      const decoration = new PIXI.Graphics();
      decoration.beginFill(0x4fc3f7, 0.6);
      decoration.drawCircle(0, 0, 3 + Math.random() * 5);
      decoration.endFill();
      
      decoration.x = Math.random() * this.gameWidth;
      decoration.y = Math.random() * this.gameHeight;
      
      this.decorativeElements.push(decoration);
      this.addChild(decoration);
    }
  }

  update(deltaTime: number): void {
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

  destroy(): void {
    this.decorativeElements = [];
    this.removeChildren();
  }
}