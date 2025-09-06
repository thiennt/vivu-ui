import * as PIXI from 'pixi.js';
import { GameScene } from '@/types';

export abstract class BaseScene extends PIXI.Container {
  protected app: PIXI.Application;
  protected sceneManager: SceneManager;
  protected gameWidth: number;
  protected gameHeight: number;

  constructor(app: PIXI.Application, sceneManager: SceneManager) {
    super();
    this.app = app;
    this.sceneManager = sceneManager;
    this.gameWidth = Math.max(400, app.screen.width);
    this.gameHeight = app.screen.height;
    
    this.setupBackground();
  }

  protected setupBackground() {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x2c1810);
    bg.drawRect(0, 0, this.gameWidth, this.gameHeight);
    bg.endFill();
    this.addChild(bg);
  }

  protected createButton(
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

  protected createTitle(text: string, x: number, y: number): PIXI.Text {
    const title = new PIXI.Text(text, {
      fontFamily: 'Kalam',
      fontSize: 36,
      fontWeight: 'bold',
      fill: 0xffecb3,
      stroke: 0x3e2723,
      strokeThickness: 3,
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });
    title.anchor.set(0.5);
    title.x = x;
    title.y = y;
    return title;
  }

  protected createCard(
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

  abstract init(): void;
  abstract update(deltaTime: number): void;
  abstract destroy(): void;
}

export class SceneManager {
  private app: PIXI.Application;
  private currentScene: BaseScene | null = null;
  private scenes: Map<GameScene, () => BaseScene> = new Map();

  constructor(app: PIXI.Application) {
    this.app = app;
  }

  registerScene(sceneType: GameScene, sceneFactory: () => BaseScene) {
    this.scenes.set(sceneType, sceneFactory);
  }

  switchTo(sceneType: GameScene) {
    if (this.currentScene) {
      this.currentScene.destroy();
      this.app.stage.removeChild(this.currentScene);
    }

    const sceneFactory = this.scenes.get(sceneType);
    if (sceneFactory) {
      this.currentScene = sceneFactory();
      this.currentScene.init();
      this.app.stage.addChild(this.currentScene);
    }
  }

  getCurrentScene(): BaseScene | null {
    return this.currentScene;
  }

  update(deltaTime: number) {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }
}