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
exports.navigation = void 0;
var pixi_js_1 = require("pixi.js");
var assets_1 = require("./assets");
var app_1 = require("../app");
var pool_1 = require("./pool");
var Navigation = /** @class */ (function () {
    function Navigation() {
        /** Container for screens */
        this.container = new pixi_js_1.Container();
        /** Application width */
        this.width = 0;
        /** Application height */
        this.height = 0;
    }
    /** Set the  default load screen */
    Navigation.prototype.setBackground = function (ctor) {
        this.background = new ctor();
        this.addAndShowScreen(this.background);
    };
    /** Add screen to the stage, link update & resize functions */
    Navigation.prototype.addAndShowScreen = function (screen) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Add navigation container to stage if it's not already there
                        if (!app_1.app.stage.children.includes(this.container)) {
                            // Remove from current parent if any
                            if (this.container.parent) {
                                this.container.parent.removeChild(this.container);
                            }
                            app_1.app.stage.addChild(this.container);
                        }
                        // Add screen to stage
                        this.container.addChild(screen);
                        // Setup things and pre-organise screen before showing
                        if (screen.prepare) {
                            screen.prepare();
                        }
                        // Add screen's resize handler, if available
                        if (screen.resize) {
                            // Trigger a first resize
                            screen.resize(this.width, this.height);
                        }
                        // Add update function if available
                        if (screen.update) {
                            app_1.app.ticker.add(screen.update, screen);
                        }
                        if (!screen.show) return [3 /*break*/, 2];
                        screen.interactiveChildren = false;
                        return [4 /*yield*/, screen.show()];
                    case 1:
                        _a.sent();
                        screen.interactiveChildren = true;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /** Remove screen from the stage, unlink update & resize functions */
    Navigation.prototype.hideAndRemoveScreen = function (screen) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Prevent interaction in the screen
                        screen.interactiveChildren = false;
                        if (!screen.hide) return [3 /*break*/, 2];
                        return [4 /*yield*/, screen.hide()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // Unlink update function if method is available
                        if (screen.update) {
                            app_1.app.ticker.remove(screen.update, screen);
                        }
                        // Remove screen from its parent (usually app.stage, if not changed)
                        if (screen.parent) {
                            screen.parent.removeChild(screen);
                        }
                        // Clean up the screen so that instance can be reused again later
                        if (screen.reset) {
                            screen.reset();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Hide current screen (if there is one) and present a new screen.
     * Any class that matches AppScreen interface can be used here.
     */
    Navigation.prototype.showScreen = function (ctor, params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Block interactivity in current screen
                        if (this.currentScreen) {
                            this.currentScreen.interactiveChildren = false;
                        }
                        if (!(ctor.assetBundles && !(0, assets_1.areBundlesLoaded)(ctor.assetBundles))) return [3 /*break*/, 2];
                        // Load all assets required by this new screen
                        return [4 /*yield*/, (0, assets_1.loadBundles)(ctor.assetBundles)];
                    case 1:
                        // Load all assets required by this new screen
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.currentScreen) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.hideAndRemoveScreen(this.currentScreen)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        // Create the new screen and add that to the stage
                        this.currentScreen = pool_1.pool.get(ctor, params);
                        return [4 /*yield*/, this.addAndShowScreen(this.currentScreen)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resize screens
     * @param width Viewport width
     * @param height Viewport height
     */
    Navigation.prototype.resize = function (width, height) {
        var _a, _b, _c, _d, _e, _f;
        this.width = width;
        this.height = height;
        (_b = (_a = this.currentScreen) === null || _a === void 0 ? void 0 : _a.resize) === null || _b === void 0 ? void 0 : _b.call(_a, width, height);
        (_d = (_c = this.currentPopup) === null || _c === void 0 ? void 0 : _c.resize) === null || _d === void 0 ? void 0 : _d.call(_c, width, height);
        (_f = (_e = this.background) === null || _e === void 0 ? void 0 : _e.resize) === null || _f === void 0 ? void 0 : _f.call(_e, width, height);
    };
    /**
     * Show up a popup over current screen
     */
    Navigation.prototype.presentPopup = function (ctor, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.currentScreen) return [3 /*break*/, 2];
                        this.currentScreen.interactiveChildren = false;
                        return [4 /*yield*/, ((_b = (_a = this.currentScreen).pause) === null || _b === void 0 ? void 0 : _b.call(_a))];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!this.currentPopup) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.hideAndRemoveScreen(this.currentPopup)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        this.currentPopup = new ctor(params);
                        return [4 /*yield*/, this.addAndShowScreen(this.currentPopup)];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dismiss current popup, if there is one
     */
    Navigation.prototype.dismissPopup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var popup;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.currentPopup)
                            return [2 /*return*/];
                        popup = this.currentPopup;
                        this.currentPopup = undefined;
                        return [4 /*yield*/, this.hideAndRemoveScreen(popup)];
                    case 1:
                        _c.sent();
                        if (this.currentScreen) {
                            this.currentScreen.interactiveChildren = true;
                            (_b = (_a = this.currentScreen).resume) === null || _b === void 0 ? void 0 : _b.call(_a);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Blur screens when lose focus
     */
    Navigation.prototype.blur = function () {
        var _a, _b, _c, _d, _e, _f;
        (_b = (_a = this.currentScreen) === null || _a === void 0 ? void 0 : _a.blur) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this.currentPopup) === null || _c === void 0 ? void 0 : _c.blur) === null || _d === void 0 ? void 0 : _d.call(_c);
        (_f = (_e = this.background) === null || _e === void 0 ? void 0 : _e.blur) === null || _f === void 0 ? void 0 : _f.call(_e);
    };
    /**
     * Focus screens
     */
    Navigation.prototype.focus = function () {
        var _a, _b, _c, _d, _e, _f;
        (_b = (_a = this.currentScreen) === null || _a === void 0 ? void 0 : _a.focus) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this.currentPopup) === null || _c === void 0 ? void 0 : _c.focus) === null || _d === void 0 ? void 0 : _d.call(_c);
        (_f = (_e = this.background) === null || _e === void 0 ? void 0 : _e.focus) === null || _f === void 0 ? void 0 : _f.call(_e);
    };
    return Navigation;
}());
/** Shared navigation instance */
exports.navigation = new Navigation();
