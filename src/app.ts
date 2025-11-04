import { Application } from 'pixi.js';
import { initDevtools } from '@pixi/devtools';
import { navigation } from './utils/navigation';
import { HomeScene } from './scenes/HomeScene';
import { initAssets } from "./utils/assets";
import { getUrlParam } from './utils/getUrlParams';
import { Colors } from './utils/cssStyles';
import { sdk } from '@farcaster/miniapp-sdk';
import { Sign } from 'crypto';
import { SignInScene } from './scenes/SignInScene';

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

initDevtools({ app });

/** Set up a resize function for the app */
function resize() {
  const maxWidth = 400; //540;
  const maxHeight = 700;
  const windowWidth = Math.min(window.innerWidth, maxWidth);
  const windowHeight = Math.min(window.innerHeight, maxHeight);
  const minWidth = 400;
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

  // Whenever the window resizes, call the 'resize' function
  window.addEventListener("resize", resize);

  // Trigger the first resize
  resize();

  // Add a visibility listener, so the app can pause sounds and screens
  document.addEventListener("visibilitychange", visibilityChange);

  // Notify Farcaster client that the app is ready
  // This should be called early in the app lifecycle for Farcaster Mini Apps
  try {
    await sdk.actions.ready();
    console.log('✅ Farcaster Mini App SDK notified: app ready');
  } catch (error) {
    // Silently fail if not in a Farcaster client
    console.debug('Not running in Farcaster client or SDK initialization failed');
  }

  // Setup assets bundles (see assets.ts) and start up loading everything in background
  await initAssets();

  // Add a persisting background shared by all screens
  //navigation.setBackground(TiledBackground);

  // Show initial loading screen
  //await navigation.showScreen(HomeScene);

  //Go to one of the screens if a shortcut is present in url params, otherwise go to home screen
  if (getUrlParam("signin") !== null) {
    await navigation.showScreen(SignInScene);
  } else {
    await navigation.showScreen(HomeScene);
  }
}

// Init everything
init();