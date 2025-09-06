import * as PIXI from 'pixi.js';
import { initDevtools } from '@pixi/devtools';
import { navigation } from './utils/navigation';
import { HomeScene } from './scenes/HomeScene';

/** The PixiJS app Application instance, shared across the project */
export const app = new PIXI.Application();

/** Set up a resize function for the app */
function resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const minWidth = 400;
    const minHeight = 600;

    // Calculate renderer and canvas sizes based on current dimensions
    const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
    const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
    const scale = scaleX > scaleY ? scaleX : scaleY;
    const width = windowWidth * scale;
    const height = windowHeight * scale;

    // Update renderer and navigation screens dimensions
    app.renderer.resize(width, height);
    navigation.resize(width, height);
}

/** Fire when document visibility changes - lose or regain focus */
function visibilityChange() {
    if (document.hidden) {
        navigation.blur();
    } else {
        navigation.focus();
    }
}

class Game {
  constructor() {
    this.init();
  }

  /** Setup app and initialise */
  private async init() {
    // Initialize the PixiJS application
    await app.init({
      width: Math.max(400, window.innerWidth * 0.8),
      height: window.innerHeight * 0.9,
      backgroundColor: 0x2c1810,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    // Add pixi canvas element to the document's body
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(app.canvas);
    } else {
      document.body.appendChild(app.canvas);
    }

    // Center the canvas
    const canvas = app.canvas;
    canvas.style.display = 'block';
    canvas.style.margin = 'auto';

    // Whenever the window resizes, call the 'resize' function
    window.addEventListener('resize', resize);

    // Trigger the first resize
    resize();

    // Add a visibility listener, so the app can pause screens
    document.addEventListener('visibilitychange', visibilityChange);

    // Show initial home screen
    await navigation.showScreen(HomeScene);

    // Initialize PIXI devtools
    initDevtools({ app });
  }

  // Public methods for debugging
  public async switchToScreen(ScreenClass: any): Promise<void> {
    await navigation.showScreen(ScreenClass);
  }

  public getCurrentScreen(): string {
    return navigation.currentScreen ? navigation.currentScreen.constructor.name : 'None';
  }
}

// Initialize and start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  
  // Expose game instance globally for debugging
  (window as any).game = game;
  
  console.log('🎮 Vivu - Fantasy Card Game loaded!');
  console.log('Use game.switchToScreen(ScreenClass) to navigate');
});

export default Game;