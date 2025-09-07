import { Application } from 'pixi.js';
import { initDevtools } from '@pixi/devtools';
import { navigation } from './utils/navigation';
import { HomeScene } from './scenes/HomeScene';
import { initAssets } from "./utils/assets";
import { getUrlParam } from './utils/getUrlParams';


/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

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

  // Add a persisting background shared by all screens
  //navigation.setBackground(TiledBackground);

  // Show initial loading screen
  //await navigation.showScreen(HomeScene);

  //Go to one of the screens if a shortcut is present in url params, otherwise go to home screen
  if (getUrlParam("combat") !== null) {
    //await navigation.showScreen(CombatScreen);
  } else {
    await navigation.showScreen(HomeScene);
  }
}

// Init everything
init();