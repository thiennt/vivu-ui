/**
 * API Service Layer for vivu-api integration
 * Provides TypeScript interfaces and service methods for all game data
 * All methods now use real API calls only
 */

import { config } from '@/config';
import { TurnAction, NFT, NFTApiResponse, AvatarUpdateResponse } from '@/types';
import { get } from 'http';

// Loading state interface
interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// API Error class
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request helper - makes real API calls only
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.apiBaseUrl}${endpoint}`;

  // Get the auth token from sessionStorage
  const authToken = sessionStorage.getItem('authToken');

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🌐 Making API call to ${endpoint}`);
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message;
      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Player API methods
export const playerApi = {
  async updatePlayerStats(stats: any): Promise<any> {
    return apiRequest(`/players/stats`, {
      method: 'PUT',
      body: JSON.stringify(stats),
    });
  },

  async updateLineup(lineup: any[]): Promise<any> {
    return apiRequest(`/players/lineup`, {
      method: 'POST',
      body: JSON.stringify(lineup),
    });
  },
};

// Characters API methods
export const charactersApi = {
  async getAllCharacters(): Promise<any[]> {
    return apiRequest(`/players/characters`);
  },

  async getCharacter(characterId: string): Promise<any> {
    return apiRequest(`/players/characters/${characterId}`);
  },
};

// Dungeons API methods
export const dungeonsApi = {
  async getAllDungeons(): Promise<any[]> {
    return apiRequest(`/players/stages`);
  },

  async getDungeonStages(dungeonId: string): Promise<any[]> {
    return apiRequest(`/players/stages/${dungeonId}/stages`);
  },
};

// Battle API methods
export const battleApi = {
  async getAvailableStages(): Promise<any> {
    return apiRequest(`/card-battle/stages`);
  },

  async getStageEnemies(stage_id: string): Promise<any> {
    return apiRequest(`/card-battle/stages/${stage_id}/enemies`);
  },

  async createBattleStage(stage_id: string): Promise<any> {
    return apiRequest(`/card-battle/stages/${stage_id}`, {
      method: 'POST'
    });
  },

  async startBattle(battleId: string): Promise<any> {
    return apiRequest(`/card-battle/${battleId}/start`, {
      method: 'POST',
    });
  },

  async getBattleState(battleId: string): Promise<any> {
    return apiRequest(`/card-battle/${battleId}/state`);
  },

  async startTurn(battleId: string): Promise<any> {
    console.log('🎯 startTurn API called for battle:', battleId);

    return apiRequest(`/card-battle/${battleId}/start-turn`, {
      method: 'POST',
    });
  },

  async drawCards(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 drawCards API called for battle:', battleId, 'with data:', turnAction);

    return apiRequest(`/card-battle/${battleId}/draw-card`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    });
  },

  async playCard(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 playCard API called for battle:', battleId, 'with data:', turnAction);

    return apiRequest(`/card-battle/${battleId}/play-card`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    });
  },

  async endTurn(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 endTurn API called for battle:', battleId, 'with data:', turnAction);

    return apiRequest(`/card-battle/${battleId}/end-turn`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    });
  },

  async aiTurn(battleId: string): Promise<any> {
    console.log('🤖 aiTurn API called for battle:', battleId);
    return apiRequest(`/card-battle/${battleId}/ai-turn`, {
      method: 'POST',
    });
  },
};


// Auth API methods
export const authApi = {
  async signIn(token: string): Promise<any> {
    // For signIn, we need to override the default token with the provided one
    return apiRequest('/auth/signin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  async getCheckinStatus(): Promise<any> {
    return apiRequest('/auth/checkin/status', {
      method: 'GET'
    });
  },

  async checkin(): Promise<any> {
    return apiRequest('/auth/checkin', {
      method: 'POST'
    });
  },
};

// Export the ApiError class and LoadingState interface for use in components
export { ApiError };
export type { LoadingState };

// Warpcast NFT response interfaces
interface WarpcastNFT {
  chain: string;
  tokenId: string;
  contractAddress: string;
  interface: string;
  amount: string;
  collection: {
    collectionId: string;
    name: string;
  };
  name: string;
  chainId: number;
  previewUrl: string;
  imageUrl: string;
  usdPrice: number;
  externalUrls: {
    openseaUrl: string;
  };
}

interface WarpcastNFTResponse {
  result: {
    nfts: WarpcastNFT[];
  };
  next?: {
    cursor: string;
  };
}

// NFT API methods
export const nftApi = {
  /**
   * Get character skins from NFT API
   * Fetches NFTs from the backend API
   * Returns array of NFTs with blockchain metadata
   */
  async getCharacterSkins(characterId: string): Promise<NFT[]> {
    const response: NFTApiResponse = await apiRequest(`/players/characters/${characterId}/skins`, {
      method: 'GET'
    });
    
    // Return the nfts array from the response
    return response.nfts || [];
  },

  async getCharacterSkinsByWarpcast(characterId: string): Promise<NFT[]> {
    try {
      // Get FID from player data in sessionStorage
      const playerData = sessionStorage.getItem('player');
      if (!playerData) {
        console.warn('No player data found in sessionStorage');
        return [];
      }

      const player = JSON.parse(playerData);
      const fid = player.farcaster_id;
      
      if (!fid) {
        console.warn('No farcaster_id found in player data');
        return [];
      }

      // Get the auth token from sessionStorage
      const authToken = sessionStorage.getItem('authToken');
      
      // Call Warpcast API
      const warpcastUrl = `https://client.warpcast.com/v2/wallet/nfts?fid=${fid}&limit=100`;
      
      console.log(`🌐 Fetching NFTs from Warpcast for FID ${fid}`);
      
      const response = await fetch(warpcastUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      });

      if (!response.ok) {
        throw new ApiError(
          `Warpcast API error: ${response.statusText}`,
          response.status
        );
      }

      const data: WarpcastNFTResponse = await response.json();
      
      // Filter for Base chain only and transform to NFT format
      const baseChainNFTs = data.result.nfts
        .filter((nft) => nft.chain === 'base')
        .map((nft) => ({
          contract_address: nft.contractAddress,
          token_id: nft.tokenId,
          name: nft.name,
          description: '',
          image: nft.imageUrl,
          token_uri: '',
          attributes: [],
          collection_name: nft.collection.name,
          owner: '',
        }));

      console.log(`✅ Retrieved ${baseChainNFTs.length} Base chain NFTs from Warpcast`);
      
      return baseChainNFTs;
    } catch (error) {
      console.error('Failed to fetch NFTs from Warpcast:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch NFTs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Update character avatar with NFT
   * PUT /players/characters/:characterId/avatar
   */
  async updateCharacterAvatar(characterId: string, nftId: string): Promise<AvatarUpdateResponse> {
    return apiRequest(`/players/characters/${characterId}/avatar`, {
      method: 'PUT',
      body: JSON.stringify({ nft_id: nftId })
    });
  }
};