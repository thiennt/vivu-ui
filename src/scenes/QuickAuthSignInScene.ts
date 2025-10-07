import { Container, Graphics, Text } from 'pixi.js';
import { BaseScene } from '@/ui/BaseScene';
import { Button } from '@/ui/Button';
import { Colors } from '@/utils/colors';
import { authApi } from '@/services/api';
import { farcasterQuickAuth } from '@/services/farcasterQuickAuth';
import { farcasterAuth } from '@/services/farcaster';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { LoadingStateManager } from '@/utils/loadingStateManager';

/**
 * Quick Auth Sign-In Scene
 * 
 * This scene provides two authentication methods:
 * 1. Quick Auth - For users inside Farcaster clients (seamless, one-click)
 * 2. SIWF - For users on regular web browsers (QR code flow)
 */
export class QuickAuthSignInScene extends BaseScene {
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
    // Check if running in Farcaster client
    const initialized = await farcasterQuickAuth.initialize();
    this.isInFarcasterClient = initialized;
    
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

    if (this.isInFarcasterClient) {
      // Show Quick Auth option (primary method when in Farcaster client)
      this.createQuickAuthSection(formContainer, formX, formWidth, currentY);
      currentY += 180;
      
      // Divider
      this.createDivider(formContainer, formX, formWidth, currentY);
      currentY += 40;
      
      // Show SIWF as alternative
      this.createSIWFSection(formContainer, formX, formWidth, currentY, true);
    } else {
      // Show SIWF as primary method when not in Farcaster client
      this.createSIWFSection(formContainer, formX, formWidth, currentY, false);
    }

    this.container.addChild(formContainer);
  }

  private createQuickAuthSection(container: Container, formX: number, formWidth: number, startY: number): void {
    // Quick Auth badge
    const badgeText = new Text({
      text: '⚡ QUICK AUTH',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.BUTTON_PRIMARY,
        align: 'center'
      }
    });
    badgeText.anchor.set(0.5, 0);
    badgeText.x = this.gameWidth / 2;
    badgeText.y = startY;
    container.addChild(badgeText);

    // Description
    const descText = new Text({
      text: 'You\'re using Farcaster!\nSign in with one click.',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: formWidth - 40
      }
    });
    descText.anchor.set(0.5, 0);
    descText.x = this.gameWidth / 2;
    descText.y = startY + 35;
    container.addChild(descText);

    // Quick Auth button
    const quickAuthButton = new Button({
      text: 'Sign In Instantly',
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

  private createDivider(container: Container, formX: number, formWidth: number, y: number): void {
    const line1 = new Graphics();
    line1.fill({ color: Colors.TEXT_SECONDARY, alpha: 0.3 })
      .rect(formX + 20, y, formWidth / 2 - 60, 2);
    container.addChild(line1);

    const orText = new Text({
      text: 'OR',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    orText.anchor.set(0.5);
    orText.x = this.gameWidth / 2;
    orText.y = y + 1;
    container.addChild(orText);

    const line2 = new Graphics();
    line2.fill({ color: Colors.TEXT_SECONDARY, alpha: 0.3 })
      .rect(formX + formWidth / 2 + 40, y, formWidth / 2 - 60, 2);
    container.addChild(line2);
  }

  private createSIWFSection(container: Container, formX: number, formWidth: number, startY: number, isAlternative: boolean): void {
    if (isAlternative) {
      // Alternative method label
      const altText = new Text({
        text: 'Alternative Method',
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fill: Colors.TEXT_SECONDARY,
          align: 'center'
        }
      });
      altText.anchor.set(0.5, 0);
      altText.x = this.gameWidth / 2;
      altText.y = startY;
      container.addChild(altText);
      startY += 30;
    } else {
      // Primary method description
      const descText = new Text({
        text: 'Sign in with your Farcaster wallet app',
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fill: Colors.TEXT_PRIMARY,
          align: 'center',
          wordWrap: true,
          wordWrapWidth: formWidth - 40
        }
      });
      descText.anchor.set(0.5, 0);
      descText.x = this.gameWidth / 2;
      descText.y = startY;
      container.addChild(descText);

      // QR code placeholder
      const qrPlaceholder = new Graphics();
      qrPlaceholder.fill({ color: 0xFFFFFF })
        .stroke({ width: 2, color: Colors.BUTTON_BORDER })
        .rect(formX + (formWidth - 200) / 2, startY + 40, 200, 200);
      container.addChild(qrPlaceholder);

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
      qrText.y = startY + 140;
      container.addChild(qrText);

      startY += 260;
    }

    // SIWF button
    const siwfButton = new Button({
      text: isAlternative ? 'Use QR Code Instead' : 'Sign In with Farcaster',
      width: formWidth - 40,
      height: 45,
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      onClick: () => this.handleSIWF()
    });
    siwfButton.x = formX + 20;
    siwfButton.y = startY;
    container.addChild(siwfButton);
  }

  private async handleQuickAuth(): Promise<void> {
    try {
      this.loadingManager.showLoading();
      console.log('Attempting Quick Auth...');

      // Authenticate using Quick Auth
      const user = await farcasterQuickAuth.authenticate();

      if (!user) {
        throw new Error('Quick Auth failed. Please try the QR code method.');
      }

      console.log('✅ Quick Auth successful:', user);

      // Call backend API with Farcaster data
      const response = await authApi.signIn({
        fid: user.fid.toString(),
        username: user.username || `user${user.fid}`,
        custody_address: undefined // Quick Auth doesn't provide custody address
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
        error instanceof Error ? error.message : 'Quick Auth failed. Please try the QR code method.'
      );
      console.error('❌ Quick Auth error:', error);
    }
  }

  private async handleSIWF(): Promise<void> {
    try {
      this.loadingManager.showLoading();
      console.log('Creating sign-in channel...');

      // Create authentication channel
      const { channel, waitForAuth } = await farcasterAuth.authenticate();

      console.log('✅ Auth channel created:', channel.url);
      
      // Update UI to show the sign-in URL
      this.loadingManager.hideLoading();
      this.showAuthChannel(channel);

      // Wait for user to authenticate via their Farcaster wallet
      this.loadingManager.showLoading();
      console.log('Waiting for authentication... Please sign in with your Farcaster wallet');
      
      const farcasterUser = await waitForAuth();

      console.log('✅ Farcaster authentication successful:', farcasterUser);

      // Then, call the auth API with Farcaster data
      console.log('Completing sign in...');
      
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
