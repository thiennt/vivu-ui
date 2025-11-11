import { Container, Graphics, Text } from 'pixi.js';
import { BaseScene } from '@/ui/BaseScene';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { authApi } from '@/services/api';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { config } from '@/config';
import { sdk } from '@farcaster/miniapp-sdk';

/**
 * Quick Auth Sign-In Scene
 * 
 * This scene automatically authenticates users:
 * - In production mode: Uses Farcaster Quick Auth (handleQuickAuth)
 * - In development mode: Uses a mock token for testing
 * 
 * Shows a "Syncing players" screen while authentication is in progress
 */
export class SignInScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  private container: Container;
  private loadingManager: LoadingStateManager;

  constructor() {
    super();

    this.container = new Container();
    this.addChild(this.container);
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    this.initializeAndCreateUI();
  }

  private async initializeAndCreateUI(): Promise<void> {
    this.createUI();
    // Automatically start authentication process
    await this.handleQuickAuth();
  }

  private createUI(): void {
    this.createBackground();
    this.createTitleSection();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.fill({ color: Colors.BACKGROUND_PRIMARY })
      .rect(0, 0, this.gameWidth, this.gameHeight);
    this.container.addChild(bg);

    // Add decorative gradient overlay
    const overlay = new Graphics();
    overlay.fill({ color: Colors.BLACK, alpha: 0.1 })
      .rect(0, 0, this.gameWidth, this.gameHeight);
    this.container.addChild(overlay);
  }

  private createTitleSection(): void {
    const titleText = new Text({
      text: 'Syncing players',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 32,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    
    titleText.anchor.set(0.5);
    titleText.x = this.gameWidth / 2;
    titleText.y = this.gameHeight * 0.2;
    this.container.addChild(titleText);
  }

  private async handleQuickAuth(): Promise<void> {
    let token: string = 'mockToken';

    try {
      this.loadingManager.showLoading();

      console.log('🚀 Getting token from Farcaster SDK');
      const result = await sdk.quickAuth.getToken();
      token = result.token;

      console.log('Quick Auth token received:', token);
      if (!token) {
        throw new Error("Failed to get Farcaster Quick Auth token.");
      }

      console.log('Token acquired. Sending to backend...', token);
    } catch (error) {
      this.loadingManager.hideLoading();
      this.loadingManager.showError(
        error instanceof Error ? error.message : 'Quick Auth failed. Please try again.'
      );
      console.error('❌ Quick Auth error:', error);
    }

    // Store auth token for API requests
    sessionStorage.setItem('authToken', token);

    // Call backend API with Farcaster data
    const player = await authApi.signIn(token);

    // Store player data
    if (player) {
      sessionStorage.setItem('player', JSON.stringify(player));

      console.log('✅ Sign in successful:', player.username);
      
      this.loadingManager.hideLoading();

      // Navigate to HomeScene
      await navigation.showScreen(HomeScene);
    }
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Clear and recreate UI
    this.container.removeChildren();
    this.loadingManager = new LoadingStateManager(this.container, width, height);
    this.createUI();
  }

  /** Show the screen with animation */
  async show(): Promise<void> {
    // Fade in animation can be added here if needed
  }

  /** Hide the screen with animation */
  async hide(): Promise<void> {
    // Fade out animation can be added here if needed
  }

  /** Reset screen after hidden */
  reset(): void {
    this.container.removeChildren();
  }
}
