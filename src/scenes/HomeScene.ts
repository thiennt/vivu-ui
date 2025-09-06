import * as PIXI from 'pixi.js';
import { AppScreen, navigation } from '@/utils/navigation';
import { mockPlayer } from '@/utils/mockData';
import { CharactersScene } from './CharactersScene';

// Placeholder scenes for other buttons - these would be implemented similarly
export class PlayerDetailScene implements AppScreen {
  container = new PIXI.Container();
  static assetBundles = ['player'];
  prepare() { 
    const text = new PIXI.Text({
      text: 'Player Detail Scene - Coming Soon!',
      style: { 
        fill: 0xffffff, 
        fontSize: 24,
        fontFamily: 'Kalam'
      }
    });
    text.anchor.set(0.5);
    text.x = 400;
    text.y = 300;
    this.container.addChild(text);
    
    const backBtn = this.createButton('← Back to Home', 50, 500, 200, 50, () => {
      navigation.showScreen(HomeScene);
    });
    this.container.addChild(backBtn);
  }
  async show() { this.container.alpha = 1; }
  async hide() { this.container.alpha = 0; }
  reset() { this.container.removeChildren(); }
  resize() {}
  
  private createButton(
    text: string, 
    x: number, 
    y: number, 
    width: number = 200, 
    height: number = 50,
    onClick?: () => void
  ): PIXI.Container {
    const button = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.fill(0x8d6e63)
      .stroke({ width: 3, color: 0x5d4037 })
      .roundRect(0, 0, width, height, 8);
    
    const buttonText = new PIXI.Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xfff8e1,
        align: 'center'
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
}

export class FormationScene implements AppScreen {
  container = new PIXI.Container();
  static assetBundles = ['formation'];
  prepare() { 
    const text = new PIXI.Text({
      text: 'Formation Scene - Coming Soon!',
      style: { 
        fill: 0xffffff, 
        fontSize: 24,
        fontFamily: 'Kalam'
      }
    });
    text.anchor.set(0.5);
    text.x = 400;
    text.y = 300;
    this.container.addChild(text);
    
    const backBtn = this.createButton('← Back to Home', 50, 500, 200, 50, () => {
      navigation.showScreen(HomeScene);
    });
    this.container.addChild(backBtn);
  }
  async show() { this.container.alpha = 1; }
  async hide() { this.container.alpha = 0; }
  reset() { this.container.removeChildren(); }
  resize() {}
  
  private createButton(
    text: string, 
    x: number, 
    y: number, 
    width: number = 200, 
    height: number = 50,
    onClick?: () => void
  ): PIXI.Container {
    const button = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.fill(0x8d6e63)
      .stroke({ width: 3, color: 0x5d4037 })
      .roundRect(0, 0, width, height, 8);
    
    const buttonText = new PIXI.Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xfff8e1,
        align: 'center'
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
}

export class DungeonScene implements AppScreen {
  container = new PIXI.Container();
  static assetBundles = ['dungeon'];
  prepare() { 
    const text = new PIXI.Text({
      text: 'Dungeon Scene - Coming Soon!',
      style: { 
        fill: 0xffffff, 
        fontSize: 24,
        fontFamily: 'Kalam'
      }
    });
    text.anchor.set(0.5);
    text.x = 400;
    text.y = 300;
    this.container.addChild(text);
    
    const backBtn = this.createButton('← Back to Home', 50, 500, 200, 50, () => {
      navigation.showScreen(HomeScene);
    });
    this.container.addChild(backBtn);
  }
  async show() { this.container.alpha = 1; }
  async hide() { this.container.alpha = 0; }
  reset() { this.container.removeChildren(); }
  resize() {}
  
  private createButton(
    text: string, 
    x: number, 
    y: number, 
    width: number = 200, 
    height: number = 50,
    onClick?: () => void
  ): PIXI.Container {
    const button = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.fill(0x8d6e63)
      .stroke({ width: 3, color: 0x5d4037 })
      .roundRect(0, 0, width, height, 8);
    
    const buttonText = new PIXI.Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xfff8e1,
        align: 'center'
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
}

export class HomeScene implements AppScreen {
  /** Assets bundles required by this screen */
  public static assetBundles = ['home', 'common'];
  
  public container: PIXI.Container;
  private decorativeElements: PIXI.Container[] = [];
  private gameWidth: number;
  private gameHeight: number;

  constructor() {
    this.container = new PIXI.Container();
    this.gameWidth = 0;
    this.gameHeight = 0;
  }

  /** Prepare screen, before showing */
  prepare(): void {
    // Set up screen dimensions
    this.gameWidth = Math.max(400, window.innerWidth);
    this.gameHeight = window.innerHeight;
    
    this.createBackground();
    this.createHomeTitle();
    this.createPlayerInfo();
    this.createMenuButtons();
    this.createDecorations();
  }

  /** Show the screen with animation */
  async show(): Promise<void> {
    // Animate elements in
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
    this.decorativeElements = [];
  }

  /** Resize the screen */
  resize(width: number, height: number): void {
    this.gameWidth = Math.max(400, width);
    this.gameHeight = height;
    
    // Reset and recreate with new dimensions
    this.reset();
    this.prepare();
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
    
    this.container.addChild(bgContainer);
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
    
    this.container.addChild(title, subtitle);
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
    
    this.container.addChild(playerPanel);
  }

  private createMenuButtons(): void {
    const buttonContainer = new PIXI.Container();
    
    const buttons = [
      { text: 'Adventure', screen: DungeonScene },
      { text: 'Characters', screen: CharactersScene },
      { text: 'Player Profile', screen: PlayerDetailScene },
      { text: 'Formation', screen: FormationScene }
    ];
    
    buttons.forEach((buttonData, index) => {
      const button = this.createButton(
        buttonData.text,
        0,
        index * 70,
        250,
        60,
        () => navigation.showScreen(buttonData.screen)
      );
      buttonContainer.addChild(button);
    });
    
    buttonContainer.x = (this.gameWidth - 250) / 2;
    buttonContainer.y = 350;
    
    this.container.addChild(buttonContainer);
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
    bg.fill(0x8d6e63)
      .stroke({ width: 3, color: 0x5d4037 })
      .roundRect(0, 0, width, height, 8);
    
    // Button text
    const buttonText = new PIXI.Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xfff8e1,
        align: 'center'
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

  private createDecorations(): void {
    // Add some floating magical elements
    for (let i = 0; i < 8; i++) {
      const decoration = new PIXI.Graphics();
      decoration.fill({ color: 0x4fc3f7, alpha: 0.6 })
        .circle(0, 0, 3 + Math.random() * 5);
      
      decoration.x = Math.random() * this.gameWidth;
      decoration.y = Math.random() * this.gameHeight;
      
      this.decorativeElements.push(decoration);
      this.container.addChild(decoration);
    }
  }

  update(time: PIXI.Ticker): void {
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
    this.container.removeChildren();
  }
}