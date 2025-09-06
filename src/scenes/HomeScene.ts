import * as PIXI from 'pixi.js';
import { BaseScene, SceneManager } from '@/utils/SceneManager';
import { GameScene } from '@/types';
import { mockPlayer } from '@/utils/mockData';

export class HomeScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = ['home', 'common'];
  
  private decorativeElements: PIXI.Container[] = [];

  constructor(app: PIXI.Application, sceneManager: SceneManager) {
    super(app, sceneManager);
    this.decorativeElements = [];
  }

  /** Initialize the screen */
  init(): void {
    // Set up screen dimensions
    this.createBackground();
    this.createHomeTitle();
    this.createPlayerInfo();
    this.createMenuButtons();
    this.createDecorations();
  }

  private createBackground(): void {
    // Create a mystical gradient background
    const bgContainer = new PIXI.Container();
    
    // Main background with gradient effect
    const bg = new PIXI.Graphics();
    bg.fill(0x1a0e0a).rect(0, 0, this.gameWidth, this.gameHeight);
    bgContainer.addChild(bg);
    
    // Add some mystical patterns
    for (let i = 0; i < 15; i++) {
      const star = new PIXI.Graphics();
      star.fill({ color: 0x4a90e2, alpha: 0.3 + Math.random() * 0.4 })
        .circle(0, 0, 2 + Math.random() * 3);
      star.x = Math.random() * this.gameWidth;
      star.y = Math.random() * this.gameHeight;
      bgContainer.addChild(star);
    }
    
    this.addChild(bgContainer);
  }

  private createHomeTitle(): void {
    const title = new PIXI.Text({
      text: 'VIVU',
      style: {
        fontFamily: 'Kalam',
        fontSize: 72,
        fontWeight: 'bold',
        fill: 0xffecb3,
        stroke: {
          color: 0x3e2723,
          width: 4,
        },
        dropShadow: {
          color: 0x000000,
          blur: 8,
          angle: Math.PI / 6,
          distance: 8,
          alpha: 0.5,
        },
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = 100;
    
    const subtitle = new PIXI.Text({
      text: 'Crypto Card Adventures',
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontStyle: 'italic',
        fill: 0xd7ccc8,
        align: 'center'
      }
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
    bg.fill({ color: 0x3e2723, alpha: 0.8 })
      .stroke({ width: 2, color: 0x8d6e63 })
      .roundRect(0, 0, 300, 100, 12);
    
    // Player info text
    const playerName = new PIXI.Text({
      text: `Welcome, ${mockPlayer.username}!`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffecb3
      }
    });
    playerName.x = 15;
    playerName.y = 15;
    
    const playerLevel = new PIXI.Text({
      text: `Level: ${mockPlayer.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: 0xd7ccc8
      }
    });
    playerLevel.x = 15;
    playerLevel.y = 45;
    
    const playerExp = new PIXI.Text({
      text: `EXP: ${mockPlayer.experience}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: 0xd7ccc8
      }
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
      decoration.fill({ color: 0x4fc3f7, alpha: 0.6 })
        .circle(0, 0, 3 + Math.random() * 5);
      
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