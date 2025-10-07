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
    const formWidth = Math.min(this.gameWidth - 2 * this.STANDARD_PADDING, 400);
    const formHeight = 320;
    const formX = (this.gameWidth - formWidth) / 2;
    const formY = this.gameHeight * 0.35;
    
    formBg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY })
      .roundRect(formX, formY, formWidth, formHeight, 12);
    formContainer.addChild(formBg);

    // Instruction text
    const instructionText = new Text({
      text: 'Click the button below to sign in with Farcaster',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: formWidth - 40
      }
    });
    instructionText.anchor.set(0.5, 0);
    instructionText.x = this.gameWidth / 2;
    instructionText.y = formY + 20;
    formContainer.addChild(instructionText);

    // QR Code placeholder (will be populated after channel creation)
    const qrPlaceholder = new Graphics();
    qrPlaceholder.fill({ color: 0xFFFFFF })
      .stroke({ width: 2, color: Colors.BUTTON_BORDER })
      .rect(formX + (formWidth - 200) / 2, formY + 60, 200, 200);
    formContainer.addChild(qrPlaceholder);

    const qrText = new Text({
      text: 'QR code will appear here',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 180
      }
    });
    qrText.anchor.set(0.5);
    qrText.x = this.gameWidth / 2;
    qrText.y = formY + 160;
    formContainer.addChild(qrText);

    // Sign In button
    const signInButton = new Button({
      text: 'Sign In with Farcaster',
      width: formWidth - 40,
      height: 45,
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      onClick: () => this.handleSignIn()
    });
    signInButton.x = formX + 20;
    signInButton.y = formY + 270;
    formContainer.addChild(signInButton);

    this.container.addChild(formContainer);
  }

  private async handleSignIn(): Promise<void> {
    try {
      this.loadingManager.showLoading('Creating sign-in channel...');

      // Create authentication channel
      const { channel, waitForAuth } = await farcasterAuth.authenticate();

      console.log('✅ Auth channel created:', channel.url);
      
      // Update UI to show the sign-in URL
      this.loadingManager.hideLoading();
      this.showAuthChannel(channel);

      // Wait for user to authenticate via their Farcaster wallet
      this.loadingManager.showLoading('Waiting for authentication...\nPlease sign in with your Farcaster wallet');
      
      const farcasterUser = await waitForAuth();

      console.log('✅ Farcaster authentication successful:', farcasterUser);

      // Then, call the auth API with Farcaster data
      this.loadingManager.showLoading('Completing sign in...');
      
      const response = await authApi.signIn({
        fid: farcasterUser.fid.toString(),
        username: farcasterUser.username,
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

  private showAuthChannel(channel: { url: string; channelToken: string }): void {
    // Log the URL to console for users to access
    console.log('🔗 Sign in URL:', channel.url);
    console.log('📱 Scan QR code or visit the URL above with your Farcaster wallet');
    
    // In a production app, you would:
    // 1. Generate a QR code from channel.url
    // 2. Display it in the UI
    // 3. Show the URL as a clickable link
    
    // For now, we'll show a message to check the console
    alert(`Sign in URL created!\n\nPlease check the browser console for the authentication URL.\n\nOpen this URL in your Farcaster wallet to sign in:\n${channel.url}`);
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
