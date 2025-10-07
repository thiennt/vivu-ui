/**
 * Farcaster Authentication Service
 * 
 * Integrates with @farcaster/auth-client for Farcaster authentication.
 * Reference: https://github.com/farcasterxyz/protocol/discussions/110
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
   * Authenticate a user with Farcaster
   * This is a simplified mock implementation as the full Farcaster auth
   * requires a backend channel for the sign-in flow
   * 
   * @param fid Farcaster ID
   * @param username Farcaster username
   * @returns FarcasterUser object
   */
  async authenticate(fid: string, username: string): Promise<FarcasterUser> {
    // In a production environment, this would:
    // 1. Use the Farcaster auth client to generate a sign-in request
    // 2. Show a QR code or deeplink for the user to sign with their Farcaster wallet
    // 3. Poll for the signature from the Farcaster network
    // 4. Verify the signature and return user data
    
    // For now, return mock data that matches the existing flow
    return {
      fid: parseInt(fid.replace(/\D/g, '')) || 1,
      username: username,
      displayName: username,
      custody_address: undefined
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
