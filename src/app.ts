import { Application } from 'pixi.js';
import { initDevtools } from '@pixi/devtools';
import { navigation } from './utils/navigation';
import { HomeScene } from './scenes/HomeScene';
import { PlayerDetailScene } from './scenes/PlayerDetailScene';
import { initAssets } from "./utils/assets";
import { getUrlParam } from './utils/getUrlParams';
import { Colors } from './utils/colors';

import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import * as PIXI from "pixi.js";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

initDevtools({ app });

/** Set up a resize function for the app */
function resize() {
  const maxWidth = 375; //540;
  const windowWidth = Math.min(window.innerWidth, maxWidth);
  const windowHeight = window.innerHeight;
  const minWidth = 375;
  const minHeight = 700;

  // Calculate renderer and canvas sizes based on current dimensions
  const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
  const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
  const scale = scaleX > scaleY ? scaleX : scaleY;
  const width = windowWidth * scale;
  const height = windowHeight * scale;

  // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
  app.renderer.canvas.style.width = `${windowWidth}px`;
  app.renderer.canvas.style.height = `${windowHeight}px`;
  window.scrollTo(0, 0);

  // Update renderer  and navigation screens dimensions
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
  const canvas = document.querySelector('#game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  
  // Initialize the PixiJS application
  await app.init({
    canvas: canvas,
    backgroundColor: Colors.BACKGROUND_PRIMARY,
    antialias: true,
    resolution: Math.max(window.devicePixelRatio, 2),
    autoDensity: true
  });

  // Center the canvas in the page
  canvas.style.display = 'block';
  canvas.style.margin = 'auto';

  // Canvas is already in the HTML, no need to append it again
  // Add pixi canvas element to the document's body
  // const gameContainer = document.getElementById('game-container');
  // if (gameContainer) {
  //   gameContainer.appendChild(canvas);
  // } else {
  //   document.body.appendChild(canvas);
  // }

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
  } else if (getUrlParam("battle") !== null) {
    const { BattleScene } = await import('./scenes/BattleScene');
    await navigation.showScreen(BattleScene);
  } else if (getUrlParam("cardbattle") !== null) {
    const { CardBattleScene } = await import('./scenes/CardBattleScene');
    await navigation.showScreen(CardBattleScene);
  } else if (getUrlParam("player") !== null) {
    await navigation.showScreen(PlayerDetailScene);
  } else if (getUrlParam("home") !== null) {
    await navigation.showScreen(HomeScene);
  } else {
    // Show HomeScene by default for easier navigation
    await navigation.showScreen(HomeScene);
  }
}

// Init everything
init();