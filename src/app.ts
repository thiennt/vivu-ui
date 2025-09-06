import { Application } from 'pixi.js';
import { initDevtools } from '@pixi/devtools';
import { SceneManager } from './utils/SceneManager';
import { GameScene } from './types';
import { HomeScene } from './scenes/HomeScene';
import { CharactersScene } from './scenes/CharactersScene';
import { CharacterDetailScene } from './scenes/CharacterDetailScene';
import { DungeonScene } from './scenes/DungeonScene';
import { StageScene } from './scenes/StageScene';
import { FormationScene } from './scenes/FormationScene';
import { PlayerDetailScene } from './scenes/PlayerDetailScene';
import { initAssets } from "./utils/assets";
import { getUrlParam } from './utils/getUrlParams';


/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

/** The scene manager for handling navigation */
export const sceneManager = new SceneManager(app);

initDevtools({ app });

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

    // Update renderer dimensions
    app.renderer.resize(width, height);
    
    // Update current scene if it exists
    const currentScene = sceneManager.getCurrentScene();
    if (currentScene) {
        currentScene.gameWidth = width;
        currentScene.gameHeight = height;
        // Refresh the scene by recreating it
        currentScene.removeChildren();
        currentScene.init();
    }
}

/** Fire when document visibility changes - lose or regain focus */
function visibilityChange() {
    // We can add scene-specific focus/blur logic here if needed
    if (document.hidden) {
        // Scene is now hidden
    } else {
        // Scene is now visible
    }
}

/** Setup app and initialise assets */
async function init() {
    // Initialize the PixiJS application
  await app.init({
    width: Math.max(400, window.innerWidth * 0.8),
    height: window.innerHeight * 0.9,
    backgroundColor: 0x2c1810,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
  });

  // Center the canvas
  const canvas = app.canvas;
  canvas.style.display = 'block';
  canvas.style.margin = 'auto';

  // Add pixi canvas element to the document's body
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.appendChild(app.canvas);
  } else {
    document.body.appendChild(app.canvas);
  }

  // Whenever the window resizes, call the 'resize' function
  window.addEventListener("resize", resize);

  // Trigger the first resize
  resize();

  // Add a visibility listener, so the app can pause sounds and screens
  document.addEventListener("visibilitychange", visibilityChange);

  // Setup assets bundles (see assets.ts) and start up loading everything in background
  await initAssets();

  // Register all scenes with the scene manager
  sceneManager.registerScene(GameScene.HOME, () => new HomeScene(app, sceneManager));
  sceneManager.registerScene(GameScene.CHARACTERS, () => new CharactersScene(app, sceneManager));
  sceneManager.registerScene(GameScene.CHARACTER_DETAIL, () => new CharacterDetailScene(app, sceneManager));
  sceneManager.registerScene(GameScene.DUNGEON, () => new DungeonScene(app, sceneManager));
  sceneManager.registerScene(GameScene.STAGE, () => new StageScene(app, sceneManager));
  sceneManager.registerScene(GameScene.FORMATION, () => new FormationScene(app, sceneManager));
  sceneManager.registerScene(GameScene.PLAYER_DETAIL, () => new PlayerDetailScene(app, sceneManager));

  // Start the update loop
  app.ticker.add(() => {
    sceneManager.update(app.ticker.deltaMS);
  });

  // Show initial screen or navigate based on URL params
  if (getUrlParam("combat") !== null) {
    sceneManager.switchTo(GameScene.STAGE);
  } else {
    sceneManager.switchTo(GameScene.HOME);
  }
}

// Init everything
init();