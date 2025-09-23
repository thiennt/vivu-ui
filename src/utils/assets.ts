import { Assets, AssetsManifest } from "pixi.js";

/** List of assets grouped in bundles, for dynamic loading */
let assetsManifest: AssetsManifest = { bundles: [] };

/** Store bundles already loaded */
const loadedBundles: string[] = [];

/** Check if a bundle exists in assetManifest  */
function checkBundleExists(bundle: string) {
  return !!assetsManifest.bundles.find((b) => b.name === bundle);
}

/** Load assets bundles that have nott been loaded yet */
export async function loadBundles(bundles: string | string[]) {
  if (typeof bundles === "string") bundles = [bundles];

  // Check bundles requested if they exists
  for (const bundle of bundles) {
    if (!checkBundleExists(bundle)) {
      throw new Error(`[Assets] Invalid bundle: ${bundle}`);
    }
  }

  // Filter out bundles already loaded
  const loadList = bundles.filter((bundle) => !loadedBundles.includes(bundle));

  // Skip if there is no bundle left to be loaded
  if (!loadList.length) return;

  // Load bundles
  console.log("[Assets] Load:", loadList.join(", "));
  await Assets.loadBundle(loadList);

  // Append loaded bundles to the loaded list
  loadedBundles.push(...loadList);
}

/** Check if all bundles are loaded, return false if any of them is not loaded yet  */
export function areBundlesLoaded(bundles: string[]) {
  for (const name of bundles) {
    // Return false if a single bundle is not present in the loaded list
    if (!loadedBundles.includes(name)) {
      return false;
    }
  }

  // All provided bundles are loaded
  return true;
}

/** Initialise and start background loading of all assets */
export async function initAssets() {
  // Temporarily bypass asset loading to test screen functionality
  console.log("[Assets] Skipping asset loading for testing");
  
  // Create a minimal manifest to avoid errors
  assetsManifest = { bundles: [{ name: "default", assets: [] }] };
  
  // Initialize PixiJS Assets with minimal setup
  await Assets.init({ manifest: assetsManifest });
}
