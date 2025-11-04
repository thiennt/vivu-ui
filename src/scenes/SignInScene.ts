import { Container, Graphics, Text } from 'pixi.js';
import { BaseScene } from '@/ui/BaseScene';
import { Button } from '@/ui/Button';
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
 * This scene provides two authentication methods:
 * 1. Quick Auth - For users inside Farcaster clients (seamless, one-click)
 * 2. SIWF - For users on regular web browsers (QR code flow)
 */
export class SignInScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  private container: Container;
  private loadingManager: LoadingStateManager;
  private isInFarcasterClient: boolean = false;

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
  }

  private createUI(): void {
    this.createBackground();
    this.createTitleSection();
    this.createSignInOptions();
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
      text: 'Welcome to Vivu',
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

  private createSignInOptions(): void {
    const formContainer = new Container();
    
    // Form background
    const formBg = new Graphics();
    const formWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 400);
    const formHeight = this.isInFarcasterClient ? 280 : 420;
    const formX = (this.gameWidth - formWidth) / 2;
    const formY = this.gameHeight * 0.35;
    
    formBg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY })
      .roundRect(formX, formY, formWidth, formHeight, 12);
    formContainer.addChild(formBg);

    let currentY = formY + 30;

    // Show Quick Auth option (primary method when in Farcaster client)
    this.createQuickAuthSection(formContainer, formX, formWidth, currentY);
    currentY += 180;

    this.container.addChild(formContainer);
  }

  private createQuickAuthSection(container: Container, formX: number, formWidth: number, startY: number): void {
    // Quick Auth button
    const quickAuthButton = new Button({
      text: 'Sign In With Farcaster',
      width: formWidth - 40,
      height: 50,
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      onClick: () => this.handleQuickAuth()
    });
    quickAuthButton.x = formX + 20;
    quickAuthButton.y = startY + 100;
    container.addChild(quickAuthButton);
  }

  private async handleQuickAuth(): Promise<void> {
    try {
      this.loadingManager.showLoading();
      console.log('Attempting Quick Auth...');

      const { token } = await sdk.quickAuth.getToken();
      //let token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjM1NWQ0M2JmLWM0YjQtNDVlMy04MmNhLThlYjI4YzY3MDllNSJ9.eyJpYXQiOjE3NTk5MjAxNTAsImlzcyI6Imh0dHBzOi8vYXV0aC5mYXJjYXN0ZXIueHl6IiwiZXhwIjoxNzU5OTIzNzUwLCJzdWIiOjE5MTIzMSwiYXVkIjoiY2YwOGRjNDgwMjUwLm5ncm9rLWZyZWUuYXBwIn0.Jrx-iGIfsESH5ea3s0bCabDYrKWl-AFx1t1toeCWIs94jRG-OekCuf5jxRcjvSFOENtwECMHpJI6E9jA7QoKoF1cirbw8wszpb1ouXIuIsBYdgZVZZc6lvSDn2XZsJZvBXnJ85S2s9TOq57pVCotfHX_EGO6VITbtoOAw9DkiesfSv9xjtXmvVUpgjSnmqIH7imMZ8veAkVVvnELvsCkQPTk2qgOtjAp1jyRM7GUoSnzpEeTs0NXjOOI6UiESogR4OqGrtmp5YQyY1yjl4RkAIviojinvxO_f3DZYLMgcrk_IRQHWSaGCc1YYZ1kbmdTgKK1RhDFnzPr0p9YxfP8Dw';
      //token = 'MK-QRFtFkKWj3+fvyB5HjYetJ2FNts2zCq09uAlEMlDOhTyV967NjAOrZJbQPgxaTqlZaaC9y9MVEv3bkU0SiaKig=='

      console.log('Quick Auth token received:', token);
      if (!token) {
        throw new Error("Failed to get Farcaster Quick Auth token.");
      }

      console.log('Token acquired. Sending to backend...', token);

      // Call backend API with Farcaster data
      const player = await authApi.signIn(token);

      // Store auth token and player data
      if (player) {
        sessionStorage.setItem('player', JSON.stringify(player));
        sessionStorage.setItem('playerId', player.id);

        console.log('✅ Sign in successful:', player.username);
        
        this.loadingManager.hideLoading();

        // Navigate to HomeScene
        await navigation.showScreen(HomeScene);
      }
    } catch (error) {
      this.loadingManager.hideLoading();
      this.loadingManager.showError(
        error instanceof Error ? error.message : 'Quick Auth failed. Please try the QR code method.'
      );
      console.error('❌ Quick Auth error:', error);
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
