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
exports.app = void 0;
var pixi_js_1 = require("pixi.js");
var devtools_1 = require("@pixi/devtools");
var navigation_1 = require("./utils/navigation");
var HomeScene_1 = require("./scenes/HomeScene");
var PlayerDetailScene_1 = require("./scenes/PlayerDetailScene");
var assets_1 = require("./utils/assets");
var getUrlParams_1 = require("./utils/getUrlParams");
var colors_1 = require("./utils/colors");
/** The PixiJS app Application instance, shared across the project */
exports.app = new pixi_js_1.Application();
(0, devtools_1.initDevtools)({ app: exports.app });
/** Set up a resize function for the app */
function resize() {
    var maxWidth = 375; //540;
    var windowWidth = Math.min(window.innerWidth, maxWidth);
    var windowHeight = window.innerHeight;
    var minWidth = 375;
    var minHeight = 700;
    // Calculate renderer and canvas sizes based on current dimensions
    var scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
    var scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
    var scale = scaleX > scaleY ? scaleX : scaleY;
    var width = windowWidth * scale;
    var height = windowHeight * scale;
    // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
    exports.app.renderer.canvas.style.width = "".concat(windowWidth, "px");
    exports.app.renderer.canvas.style.height = "".concat(windowHeight, "px");
    window.scrollTo(0, 0);
    // Update renderer  and navigation screens dimensions
    exports.app.renderer.resize(width, height);
    navigation_1.navigation.resize(width, height);
}
/** Fire when document visibility changes - lose or regain focus */
function visibilityChange() {
    if (document.hidden) {
        navigation_1.navigation.blur();
    }
    else {
        navigation_1.navigation.focus();
    }
}
/** Setup app and initialise assets */
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var canvas, BattleScene, CardBattleScene;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    canvas = document.querySelector('#game-canvas');
                    if (!canvas) {
                        console.error('Canvas element not found!');
                        return [2 /*return*/];
                    }
                    // Initialize the PixiJS application
                    return [4 /*yield*/, exports.app.init({
                            canvas: canvas,
                            backgroundColor: colors_1.Colors.BACKGROUND_PRIMARY,
                            antialias: true,
                            resolution: Math.max(window.devicePixelRatio, 2),
                            autoDensity: true
                        })];
                case 1:
                    // Initialize the PixiJS application
                    _a.sent();
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
                    return [4 /*yield*/, (0, assets_1.initAssets)()];
                case 2:
                    // Setup assets bundles (see assets.ts) and start up loading everything in background
                    _a.sent();
                    if (!((0, getUrlParams_1.getUrlParam)("combat") !== null)) return [3 /*break*/, 3];
                    return [3 /*break*/, 15];
                case 3:
                    if (!((0, getUrlParams_1.getUrlParam)("battle") !== null)) return [3 /*break*/, 6];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./scenes/BattleScene'); })];
                case 4:
                    BattleScene = (_a.sent()).BattleScene;
                    return [4 /*yield*/, navigation_1.navigation.showScreen(BattleScene)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 15];
                case 6:
                    if (!((0, getUrlParams_1.getUrlParam)("cardbattle") !== null)) return [3 /*break*/, 9];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./scenes/CardBattleScene'); })];
                case 7:
                    CardBattleScene = (_a.sent()).CardBattleScene;
                    return [4 /*yield*/, navigation_1.navigation.showScreen(CardBattleScene)];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 15];
                case 9:
                    if (!((0, getUrlParams_1.getUrlParam)("player") !== null)) return [3 /*break*/, 11];
                    return [4 /*yield*/, navigation_1.navigation.showScreen(PlayerDetailScene_1.PlayerDetailScene)];
                case 10:
                    _a.sent();
                    return [3 /*break*/, 15];
                case 11:
                    if (!((0, getUrlParams_1.getUrlParam)("home") !== null)) return [3 /*break*/, 13];
                    return [4 /*yield*/, navigation_1.navigation.showScreen(HomeScene_1.HomeScene)];
                case 12:
                    _a.sent();
                    return [3 /*break*/, 15];
                case 13: 
                // Show HomeScene by default for easier navigation
                return [4 /*yield*/, navigation_1.navigation.showScreen(HomeScene_1.HomeScene)];
                case 14:
                    // Show HomeScene by default for easier navigation
                    _a.sent();
                    _a.label = 15;
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Init everything
init();
