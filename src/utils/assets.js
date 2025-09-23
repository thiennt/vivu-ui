"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBundles = loadBundles;
exports.areBundlesLoaded = areBundlesLoaded;
exports.initAssets = initAssets;
var pixi_js_1 = require("pixi.js");
/** List of assets grouped in bundles, for dynamic loading */
var assetsManifest = { bundles: [] };
/** Store bundles already loaded */
var loadedBundles = [];
/** Check if a bundle exists in assetManifest  */
function checkBundleExists(bundle) {
    return !!assetsManifest.bundles.find(function (b) { return b.name === bundle; });
}
/** Load assets bundles that have nott been loaded yet */
function loadBundles(bundles) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, bundles_1, bundle, loadList;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof bundles === "string")
                        bundles = [bundles];
                    // Check bundles requested if they exists
                    for (_i = 0, bundles_1 = bundles; _i < bundles_1.length; _i++) {
                        bundle = bundles_1[_i];
                        if (!checkBundleExists(bundle)) {
                            throw new Error("[Assets] Invalid bundle: ".concat(bundle));
                        }
                    }
                    loadList = bundles.filter(function (bundle) { return !loadedBundles.includes(bundle); });
                    // Skip if there is no bundle left to be loaded
                    if (!loadList.length)
                        return [2 /*return*/];
                    // Load bundles
                    console.log("[Assets] Load:", loadList.join(", "));
                    return [4 /*yield*/, pixi_js_1.Assets.loadBundle(loadList)];
                case 1:
                    _a.sent();
                    // Append loaded bundles to the loaded list
                    loadedBundles.push.apply(loadedBundles, loadList);
                    return [2 /*return*/];
            }
        });
    });
}
/** Check if all bundles are loaded, return false if any of them is not loaded yet  */
function areBundlesLoaded(bundles) {
    for (var _i = 0, bundles_2 = bundles; _i < bundles_2.length; _i++) {
        var name_1 = bundles_2[_i];
        // Return false if a single bundle is not present in the loaded list
        if (!loadedBundles.includes(name_1)) {
            return false;
        }
    }
    // All provided bundles are loaded
    return true;
}
/** Initialise and start background loading of all assets */
function initAssets() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Temporarily bypass asset loading to test screen functionality
                    console.log("[Assets] Skipping asset loading for testing");
                    // Create a minimal manifest to avoid errors
                    assetsManifest = { bundles: [{ name: "default", assets: [] }] };
                    // Initialize PixiJS Assets with minimal setup
                    return [4 /*yield*/, pixi_js_1.Assets.init({ manifest: assetsManifest })];
                case 1:
                    // Initialize PixiJS Assets with minimal setup
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
