import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { mockPlayer } from '@/utils/mockData';
import { BaseScene } from '@/utils/BaseScene';
import { CharactersScene } from './CharactersScene';
import { DungeonScene } from './DungeonScene';
import { PlayerDetailScene } from './PlayerDetailScene';
import { FormationScene } from './FormationScene';
import { app } from '@/app';
import { Colors } from '@/utils/colors';


export class HomeScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private decorativeElements: Container[] = [];

  constructor() {
    super();

    this.container = new Container();
    this.addChild(this.container);
  }

  resize(width: number, height: number): void {
    this.gameWidth = width
    this.gameHeight = height;

    // Update the container to match the new dimensions
    this.container.removeChildren();
    this.createBackground();
    this.createHomeTitle();
    this.createPlayerInfo();
    this.createMenuButtons();
    this.createDecorations();
    

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

  /** Show the screen with animation */
  async show(): Promise<void> {
    // Animate elements in
    this.container.alpha = 1;
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

  private createBackground(): void {
    // Create a mystical gradient background
    const bgContainer = new Container();
    
    // Main background with gradient effect
    const bg = new Graphics();
    bg.fill(Colors.BACKGROUND_PRIMARY).rect(0, 0, this.gameWidth, this.gameHeight);
    bgContainer.addChild(bg);
    
    // Add some mystical patterns
    for (let i = 0; i < 15; i++) {
      const star = new Graphics();
      star.fill({ color: Colors.DECORATION_MAGIC, alpha: 0.3 + Math.random() * 0.4 })
        .circle(0, 0, 2 + Math.random() * 3);
      star.x = Math.random() * this.gameWidth;
      star.y = Math.random() * this.gameHeight;
      bgContainer.addChild(star);
    }
    
    this.container.addChild(bgContainer);
  }

  private createHomeTitle(): void {
    const title = new Text({
      text: 'VIVU',
      style: {
        fontFamily: 'Kalam',
        fontSize: 72,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        stroke: {
          color: Colors.BACKGROUND_SECONDARY,
          width: 4,
        },
        dropShadow: {
          color: Colors.SHADOW_COLOR,
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
    
    const subtitle = new Text({
      text: 'Crypto Card Adventures',
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontStyle: 'italic',
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = 150;
    
    this.container.addChild(title, subtitle);
  }

  private createPlayerInfo(): void {
    const playerPanel = new Container();
    
    // Make panel wider to utilize more screen width
    const panelWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 350);
    
    // Background panel
    const bg = new Graphics();
    bg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY })
      .roundRect(0, 0, panelWidth, 100, 12);
    
    // Player info text
    const playerName = new Text({
      text: `Welcome, ${mockPlayer.username}!`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    playerName.x = 15;
    playerName.y = 15;
    
    const playerLevel = new Text({
      text: `Level: ${mockPlayer.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY
      }
    });
    playerLevel.x = 15;
    playerLevel.y = 45;
    
    const playerExp = new Text({
      text: `EXP: ${mockPlayer.experience}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY
      }
    });
    playerExp.x = 15;
    playerExp.y = 65;
    
    playerPanel.addChild(bg, playerName, playerLevel, playerExp);
    // Center the panel with standard padding consideration
    playerPanel.x = (this.gameWidth - panelWidth) / 2;
    playerPanel.y = 200;
    
    this.container.addChild(playerPanel);
  }

  private createMenuButtons(): void {
    const buttonContainer = new Container();
    
    const buttons = [
      { text: 'Adventure', screen: DungeonScene },
      { text: 'Characters', screen: CharactersScene },
      { text: 'Player Profile', screen: PlayerDetailScene },
      { text: 'Formation', screen: FormationScene },
    ];
    
    // Make buttons wider to utilize more screen space
    const buttonWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 280);
    
    buttons.forEach((buttonData, index) => {
      const button = this.createButton(
        buttonData.text,
        0,
        index * (60 + this.STANDARD_SPACING), // Use standard spacing between buttons
        buttonWidth,
        60,
        () => navigation.showScreen(buttonData.screen)
      );
      buttonContainer.addChild(button);
    });
    
    // Center horizontally with standard padding consideration
    buttonContainer.x = (this.gameWidth - buttonWidth) / 2;
    buttonContainer.y = Math.max(350, this.gameHeight * 0.55);
    
    this.container.addChild(buttonContainer);
  }

  private createDecorations(): void {
    // Add some floating magical elements
    for (let i = 0; i < 8; i++) {
      const decoration = new Graphics();
      decoration.fill({ color: Colors.DECORATION_MAGIC, alpha: 0.6 })
        .circle(0, 0, 3 + Math.random() * 5);
      
      decoration.x = Math.random() * this.gameWidth;
      decoration.y = Math.random() * this.gameHeight;
      
      this.decorativeElements.push(decoration);
      this.container.addChild(decoration);
    }
  }

  public update(time: Ticker): void {
  }

}