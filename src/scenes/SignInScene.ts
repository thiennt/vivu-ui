import { Container, Graphics, Text } from 'pixi.js';
import { BaseScene } from '@/ui/BaseScene';
import { Button } from '@/ui/Button';
import { Colors } from '@/utils/colors';
import { authApi } from '@/services/api';
import { farcasterAuth } from '@/services/farcaster';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { LoadingStateManager } from '@/utils/loadingStateManager';

export class SignInScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  private container: Container;
  private loadingManager: LoadingStateManager;
  private farcasterIdInput: string = '';
  private usernameInput: string = '';

  constructor() {
    super();

    this.container = new Container();
    this.addChild(this.container);
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    this.createUI();
  }

  private createUI(): void {
    this.createBackground();
    this.createTitleSection();
    this.createSignInForm();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.fill({ color: Colors.BACKGROUND_PRIMARY })
      .rect(0, 0, this.gameWidth, this.gameHeight);
    this.container.addChild(bg);

    // Add decorative gradient overlay
    const overlay = new Graphics();
    overlay.fill({ color: 0x000000, alpha: 0.1 })
      .rect(0, 0, this.gameWidth, this.gameHeight);
    this.container.addChild(overlay);
  }

  private createTitleSection(): void {
    const titleText = new Text({
      text: 'Welcome to Vivu',
      style: {
        fontFamily: 'Kalam',
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

    const subtitleText = new Text({
      text: 'Sign in with Farcaster',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    
    subtitleText.anchor.set(0.5);
    subtitleText.x = this.gameWidth / 2;
    subtitleText.y = this.gameHeight * 0.25;
    this.container.addChild(subtitleText);
  }

  private createSignInForm(): void {
    const formContainer = new Container();
    
    // Form background
    const formBg = new Graphics();
    const formWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 300);
    const formHeight = 250;
    const formX = (this.gameWidth - formWidth) / 2;
    const formY = this.gameHeight * 0.35;
    
    formBg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY })
      .roundRect(formX, formY, formWidth, formHeight, 12);
    formContainer.addChild(formBg);

    // Input instruction text
    const instructionText = new Text({
      text: 'Enter your Farcaster details',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    instructionText.anchor.set(0.5, 0);
    instructionText.x = this.gameWidth / 2;
    instructionText.y = formY + 20;
    formContainer.addChild(instructionText);

    // Farcaster ID label
    const fidLabel = new Text({
      text: 'Farcaster ID:',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY
      }
    });
    fidLabel.x = formX + 20;
    fidLabel.y = formY + 55;
    formContainer.addChild(fidLabel);

    // Farcaster ID input box (simulated)
    const fidInputBg = new Graphics();
    fidInputBg.fill({ color: 0xFFFFFF })
      .stroke({ width: 1, color: Colors.BUTTON_BORDER })
      .roundRect(formX + 20, formY + 75, formWidth - 40, 35, 5);
    formContainer.addChild(fidInputBg);

    const fidInputText = new Text({
      text: 'player_fc_001',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: 0x333333
      }
    });
    fidInputText.x = formX + 30;
    fidInputText.y = formY + 85;
    formContainer.addChild(fidInputText);
    this.farcasterIdInput = 'player_fc_001';

    // Username label
    const usernameLabel = new Text({
      text: 'Username:',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY
      }
    });
    usernameLabel.x = formX + 20;
    usernameLabel.y = formY + 120;
    formContainer.addChild(usernameLabel);

    // Username input box (simulated)
    const usernameInputBg = new Graphics();
    usernameInputBg.fill({ color: 0xFFFFFF })
      .stroke({ width: 1, color: Colors.BUTTON_BORDER })
      .roundRect(formX + 20, formY + 140, formWidth - 40, 35, 5);
    formContainer.addChild(usernameInputBg);

    const usernameInputText = new Text({
      text: 'PlayerOne',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: 0x333333
      }
    });
    usernameInputText.x = formX + 30;
    usernameInputText.y = formY + 150;
    formContainer.addChild(usernameInputText);
    this.usernameInput = 'PlayerOne';

    // Sign In button
    const signInButton = new Button({
      text: 'Sign In',
      width: formWidth - 40,
      height: 45,
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      onClick: () => this.handleSignIn()
    });
    signInButton.x = formX + 20;
    signInButton.y = formY + 195;
    formContainer.addChild(signInButton);

    this.container.addChild(formContainer);
  }

  private async handleSignIn(): Promise<void> {
    try {
      this.loadingManager.showLoading();

      // First, authenticate with Farcaster service
      const farcasterUser = await farcasterAuth.authenticate(
        this.farcasterIdInput,
        this.usernameInput
      );

      console.log('✅ Farcaster authentication successful:', farcasterUser);

      // Then, call the auth API with Farcaster data
      const response = await authApi.signIn({
        fid: this.farcasterIdInput,
        username: this.usernameInput,
        custody_address: farcasterUser.custody_address
      });

      // Store auth token and player data
      if (response.success && response.data) {
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('player', JSON.stringify(response.data.player));
        sessionStorage.setItem('playerId', response.data.player.id);
        
        console.log('✅ Sign in successful:', response.data.player.username);
        
        this.loadingManager.hideLoading();

        // Navigate to HomeScene
        await navigation.showScreen(HomeScene);
      } else {
        throw new Error(response.message || 'Sign in failed');
      }
    } catch (error) {
      this.loadingManager.hideLoading();
      this.loadingManager.showError(
        error instanceof Error ? error.message : 'Sign in failed. Please try again.'
      );
      console.error('❌ Sign in error:', error);
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
