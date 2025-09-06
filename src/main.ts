import * as PIXI from 'pixi.js';
import { SceneManager } from '@/utils/SceneManager';
import { GameScene } from '@/types';

// Import all scenes
import { HomeScene } from '@/scenes/HomeScene';
import { PlayerDetailScene } from '@/scenes/PlayerDetailScene';
import { CharactersScene } from '@/scenes/CharactersScene';
import { CharacterDetailScene } from '@/scenes/CharacterDetailScene';
import { DungeonScene } from '@/scenes/DungeonScene';
import { StageScene } from '@/scenes/StageScene';
import { FormationScene } from '@/scenes/FormationScene';

class Game {
  private app: PIXI.Application;
  private sceneManager: SceneManager;

  constructor() {
    // Initialize PIXI Application
    this.app = new PIXI.Application({
      width: Math.max(400, window.innerWidth * 0.8),
      height: window.innerHeight * 0.9,
      backgroundColor: 0x2c1810,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    // Add canvas to DOM
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(this.app.view as HTMLCanvasElement);
    }

    // Center the game canvas
    this.centerCanvas();

    // Initialize scene manager
    this.sceneManager = new SceneManager(this.app);
    this.registerScenes();

    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Start the game
    this.start();
  }

  private centerCanvas(): void {
    const canvas = this.app.view as HTMLCanvasElement;
    canvas.style.display = 'block';
    canvas.style.margin = 'auto';
  }

  private handleResize(): void {
    const newWidth = Math.max(400, window.innerWidth * 0.8);
    const newHeight = window.innerHeight * 0.9;
    
    this.app.renderer.resize(newWidth, newHeight);
    this.centerCanvas();
  }

  private registerScenes(): void {
    // Register all game scenes
    this.sceneManager.registerScene(GameScene.HOME, () => 
      new HomeScene(this.app, this.sceneManager)
    );
    
    this.sceneManager.registerScene(GameScene.PLAYER_DETAIL, () => 
      new PlayerDetailScene(this.app, this.sceneManager)
    );
    
    this.sceneManager.registerScene(GameScene.CHARACTERS, () => 
      new CharactersScene(this.app, this.sceneManager)
    );
    
    this.sceneManager.registerScene(GameScene.CHARACTER_DETAIL, () => 
      new CharacterDetailScene(this.app, this.sceneManager)
    );
    
    this.sceneManager.registerScene(GameScene.DUNGEON, () => 
      new DungeonScene(this.app, this.sceneManager)
    );
    
    this.sceneManager.registerScene(GameScene.STAGE, () => 
      new StageScene(this.app, this.sceneManager)
    );
    
    this.sceneManager.registerScene(GameScene.FORMATION, () => 
      new FormationScene(this.app, this.sceneManager)
    );
  }

  private start(): void {
    // Start with the home scene
    this.sceneManager.switchTo(GameScene.HOME);

    // Start the game loop
    this.app.ticker.add((deltaTime) => {
      this.update(deltaTime);
    });

    // Enable PIXI dev tools if available
    if ((window as any).__PIXI_DEVTOOLS__) {
      (window as any).__PIXI_DEVTOOLS__.app = this.app;
    }
  }

  private update(deltaTime: number): void {
    this.sceneManager.update(deltaTime);
  }

  // Public method to switch scenes (useful for debugging)
  public switchToScene(scene: GameScene): void {
    this.sceneManager.switchTo(scene);
  }

  // Get current scene (useful for debugging)
  public getCurrentScene(): string {
    const scene = this.sceneManager.getCurrentScene();
    return scene ? scene.constructor.name : 'None';
  }
}

// Initialize and start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  
  // Expose game instance globally for debugging
  (window as any).game = game;
  
  console.log('🎮 Vivu - Fantasy Card Game loaded!');
  console.log('Available scenes:', Object.values(GameScene));
  console.log('Use game.switchToScene(GameScene.SCENE_NAME) to navigate');
});

export default Game;