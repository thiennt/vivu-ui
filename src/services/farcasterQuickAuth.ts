/**
 * Farcaster Quick Auth Service
 * 
 * Integrates with @farcaster/frame-sdk for quick authentication in Farcaster Mini Apps.
 * Reference: https://miniapps.farcaster.xyz/docs/sdk/quick-auth
 * 
 * This service is designed for apps running inside Farcaster clients (like Warpcast).
 * For standalone web apps, use the SIWF flow in farcaster.ts instead.
 */

import sdk from '@farcaster/frame-sdk';

export interface QuickAuthUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  location?: {
    placeId: string;
    description: string;
  };
}

export interface QuickAuthContext {
  user: QuickAuthUser;
  location?: {
    type: string;
    context?: any;
  };
}

/**
 * Farcaster Quick Auth Service
 * Provides simplified authentication for apps running inside Farcaster clients
 */
export class FarcasterQuickAuthService {
  private isInitialized: boolean = false;
  private context: QuickAuthContext | null = null;

  /**
   * Initialize the Frame SDK
   * This must be called before any other methods
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize the Frame SDK
      await sdk.actions.ready();
      
      // Check if we're in a mini app
      const isInMiniApp = await sdk.isInMiniApp();
      
      if (isInMiniApp) {
        this.isInitialized = true;
        console.log('✅ Farcaster Frame SDK initialized');
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Failed to initialize Farcaster Frame SDK:', error);
      return false;
    }
  }

  /**
   * Check if the app is running inside a Farcaster client
   */
  isInFarcasterClient(): boolean {
    return this.isInitialized;
  }

  /**
   * Get the current context from the Farcaster client
   * This includes user information if the user is authenticated
   */
  async getContext(): Promise<QuickAuthContext | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const context = await sdk.context;
      
      if (context && context.user) {
        this.context = {
          user: {
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
            location: context.user.location,
          },
          location: context.location,
        };
        
        return this.context;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get context:', error);
      return null;
    }
  }

  /**
   * Authenticate the user using Quick Auth
   * This method attempts to get the user's information from the Farcaster client
   * 
   * @returns User information if authenticated, null if not in Farcaster client or not authenticated
   */
  async authenticate(): Promise<QuickAuthUser | null> {
    const context = await this.getContext();
    
    if (context && context.user) {
      console.log('✅ Quick Auth successful:', context.user);
      return context.user;
    }
    
    console.log('ℹ️ Not running in Farcaster client or user not authenticated');
    return null;
  }

  /**
   * Open a URL in the Farcaster client
   * Useful for redirecting after authentication or opening external links
   */
  async openUrl(url: string): Promise<void> {
    if (!this.isInitialized) {
      window.open(url, '_blank');
      return;
    }

    try {
      await sdk.actions.openUrl(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
      window.open(url, '_blank');
    }
  }

  /**
   * Close the mini app
   * This will close the app within the Farcaster client
   */
  async close(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await sdk.actions.close();
    } catch (error) {
      console.error('Failed to close mini app:', error);
    }
  }
}

// Export a singleton instance
export const farcasterQuickAuth = new FarcasterQuickAuthService();
