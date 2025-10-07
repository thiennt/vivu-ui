/**
 * Farcaster Authentication Service
 * 
 * Integrates with @farcaster/auth-client for Farcaster authentication.
 * Reference: https://docs.farcaster.xyz/developers/siwf/
 */

import { createAppClient, viemConnector } from '@farcaster/auth-client';

export interface FarcasterAuthConfig {
  domain?: string;
  siweUri?: string;
  rpcUrl?: string;
}

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  custody_address?: string;
  bio?: string;
  verifications?: string[];
}

export interface AuthChannel {
  channelToken: string;
  url: string;
  nonce: string;
}

/**
 * Farcaster authentication service
 * Provides methods for authenticating users via Farcaster
 */
export class FarcasterAuthService {
  private appClient: any;
  private config: FarcasterAuthConfig;

  constructor(config: FarcasterAuthConfig = {}) {
    this.config = {
      domain: config.domain || window.location.hostname,
      siweUri: config.siweUri || window.location.origin,
      rpcUrl: config.rpcUrl || 'https://mainnet.optimism.io',
      ...config
    };

    // Initialize the Farcaster auth client
    try {
      this.appClient = createAppClient({
        ethereum: viemConnector(),
      });
    } catch (error) {
      console.warn('Failed to initialize Farcaster client:', error);
      this.appClient = null;
    }
  }

  /**
   * Check if Farcaster authentication is available
   */
  isAvailable(): boolean {
    return this.appClient !== null;
  }

  /**
   * Create a Farcaster Auth channel for sign-in
   * Returns a channel with URL to display as QR code or link
   */
  async createChannel(): Promise<AuthChannel> {
    if (!this.appClient) {
      throw new Error('Farcaster client not initialized');
    }

    const response = await this.appClient.createChannel({
      siweUri: this.config.siweUri,
      domain: this.config.domain,
    });

    if (response.isError) {
      throw new Error(`Failed to create auth channel: ${response.error.message}`);
    }

    return {
      channelToken: response.data.channelToken,
      url: response.data.url,
      nonce: response.data.nonce,
    };
  }

  /**
   * Poll for authentication status on a channel
   * Returns user data when authentication is complete
   * 
   * @param channelToken - Channel token from createChannel
   * @param timeout - Timeout in milliseconds (default: 300000 = 5 minutes)
   * @param interval - Polling interval in milliseconds (default: 1500)
   * @param onResponse - Callback for each polling response
   */
  async watchStatus(
    channelToken: string,
    timeout: number = 300000,
    interval: number = 1500,
    onResponse?: (data: any) => void
  ): Promise<FarcasterUser> {
    if (!this.appClient) {
      throw new Error('Farcaster client not initialized');
    }

    const response = await this.appClient.watchStatus({
      channelToken,
      timeout,
      interval,
      onResponse: onResponse ? ({ data }: { data: any }) => onResponse(data) : undefined,
    });

    if (response.isError) {
      throw new Error(`Authentication failed: ${response.error.message}`);
    }

    if (response.data.state !== 'completed') {
      throw new Error('Authentication not completed');
    }

    return {
      fid: response.data.fid || 0,
      username: response.data.username || '',
      displayName: response.data.displayName,
      pfpUrl: response.data.pfpUrl,
      custody_address: response.data.custody,
      bio: response.data.bio,
      verifications: response.data.verifications,
    };
  }

  /**
   * Authenticate a user with Farcaster using the Sign In With Farcaster (SIWF) flow
   * 
   * @returns Promise with authentication channel info and user data
   */
  async authenticate(): Promise<{ channel: AuthChannel; waitForAuth: () => Promise<FarcasterUser> }> {
    // Create a new auth channel
    const channel = await this.createChannel();

    // Return channel info and a function to wait for authentication
    return {
      channel,
      waitForAuth: () => this.watchStatus(channel.channelToken),
    };
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    // Clear any cached auth data
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('player');
    sessionStorage.removeItem('playerId');
  }

  /**
   * Get the current authenticated user from session storage
   */
  getCurrentUser(): FarcasterUser | null {
    const playerData = sessionStorage.getItem('player');
    if (!playerData) return null;

    try {
      const player = JSON.parse(playerData);
      return {
        fid: parseInt(player.farcaster_id?.replace(/\D/g, '')) || 0,
        username: player.username,
        displayName: player.username,
        custody_address: player.custody_address
      };
    } catch (error) {
      console.error('Failed to parse player data:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const farcasterAuth = new FarcasterAuthService();
