/**
 * API Service Layer for vivu-api integration
 * Provides TypeScript interfaces and service methods for all game data
 * Includes fallback to mock data when API calls fail
 */

import { mockPlayer, mockCharacters, mockSkills, mockDungeons, mockStages } from '@/utils/mockData';
import { 
  BattleApiResponse, 
  BattleStateResponse, 
  BattleMoveData, 
  BattleMoveResponse, 
  BattleEndData, 
  BattleRewards,
  TurnPhase, 
  BattleStageResponse
} from '@/types';
import { createRandomDeck } from '@/utils/cardData';


// Base API configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.vivu.game';

// API Response wrapper interface
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Loading state interface
interface LoadingState {
  isLoading: boolean;
  error: string | null;
  usingMockData?: boolean;
}

// API Error class
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request helper with fallback support
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // If fallback data is provided, use it instead of throwing an error
    if (fallbackData !== undefined) {
      console.warn(`API call to ${endpoint} failed, using fallback data:`, error);
      return fallbackData;
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Player API methods
export const playerApi = {
  async getPlayer(playerId: string): Promise<any> {
    return apiRequest(`/players/${playerId}`, {}, mockPlayer);
  },

  async updatePlayerStats(playerId: string, stats: any): Promise<any> {
    return apiRequest(`/players/${playerId}/stats`, {
      method: 'PUT',
      body: JSON.stringify(stats),
    }, { ...mockPlayer, ...stats });
  },

  async getPlayerCharacters(playerId: string): Promise<any[]> {
    // Return character objects based on mockPlayer's character IDs
    const playerCharacterIds = mockPlayer.characters || [];
    const playerCharacters = mockCharacters.filter(char => 
      playerCharacterIds.includes(char.id)
    );
    return apiRequest(`/players/${playerId}/characters`, {}, playerCharacters);
  },
};

// Characters API methods
export const charactersApi = {
  async getAllCharacters(): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/characters`, {}, mockCharacters);
  },

  async getCharacter(characterId: string): Promise<any> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    const character = mockCharacters.find(char => char.id === characterId);
    return apiRequest(`/players/${playerId}/characters/${characterId}`, {}, character);
  },

  async getCharacterSkills(characterId: string): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/characters/${characterId}/skills`, {}, mockSkills);
  },
};

// Dungeons API methods
export const dungeonsApi = {
  async getAllDungeons(): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/stages`, {}, mockDungeons);
  },

  async getDungeonStages(dungeonId: string): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    const dungeon = mockDungeons.find(d => d.id === dungeonId);
    return apiRequest(`/players/${playerId}/stages/${dungeonId}/stages`, {}, dungeon?.stages || []);
  },
};

// Skills API methods
export const skillsApi = {
  async getAllSkills(): Promise<any[]> {
    return apiRequest('/skills', {}, mockSkills);
  },

  async getSkill(skillId: string): Promise<any> {
    const skill = mockSkills.find(s => (s as any).id === skillId);
    return apiRequest(`/skills/${skillId}`, {}, skill);
  },
};

// Battle API methods
export const battleApi = {
  async getAvailableStages(): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId');
    return apiRequest(`/players/${playerId}/card-battle/stages`, {}, mockStages);
  },

  async createBattleStage(stage_id: string): Promise<BattleStageResponse> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/stages/${stage_id}`, {
      method: 'POST'
    });
  },

  async startBattle(battleId: string): Promise<BattleApiResponse> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/start`, {
      method: 'POST',
    }, { battleId, status: 'ongoing' });
  },

  async getBattleState(battleId: string): Promise<BattleStateResponse> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/state`);
  },

  async playCard(battleId: string, moveData: BattleMoveData): Promise<BattleMoveResponse> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/moves`, {
      method: 'POST',
      body: JSON.stringify(moveData),
    }, { 
      success: true, 
      newState: {},
      result: 'move_applied'
    });
  },

  async endTurn(battleId: string): Promise<BattleMoveResponse> {
    console.log('⏭️ endTurn API called for battle:', battleId);
    return apiRequest(`/battles/${battleId}/end-turn`, {
      method: 'POST',
    }, { 
      success: true,
      newState: {},
      result: 'turn_ended'
    });
  },

  async endBattle(battleId: string, battleResult: BattleEndData): Promise<BattleApiResponse & { rewards?: BattleRewards }> {
    console.log('🏁 endBattle API called for battle:', battleId, 'with result:', battleResult);
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/battles/${battleId}/end`, {
      method: 'POST',
      body: JSON.stringify(battleResult),
    }, {
      battleId,
      status: 'completed',
      rewards: battleResult.winner === 1 ? {
        gold: 100,
        experience: 50,
        items: []
      } : undefined
    });
  },

  async getBattleRewards(battleId: string): Promise<BattleRewards> {
    console.log('🎁 getBattleRewards API called for battle:', battleId);
    return apiRequest(`/battles/${battleId}/rewards`, {}, {
      gold: 100,
      experience: 50,
      items: [],
      newLevel: false
    });
  },
};

// Export the ApiError class and LoadingState interface for use in components
export { ApiError };
export type { LoadingState };

// Export API base URL for potential configuration needs
export { API_BASE_URL };

// Utility function to check if we're likely using mock data
// This is a heuristic based on whether the API base URL is the default one
export function isLikelyUsingMockData(): boolean {
  return API_BASE_URL === 'https://api.vivu.game';
}