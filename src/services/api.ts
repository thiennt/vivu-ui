/**
 * API Service Layer for vivu-api integration
 * Provides TypeScript interfaces and service methods for all game data
 * Uses configuration to determine whether to use mock data or real API calls
 */

import { config } from '@/config';
import { mockPlayer, mockSkills, mockDungeons, mockStages, mockCardBattleState,  mockBattleStage, mockPlayer1Characters, mockActionResult, mockDrawCardResult } from '@/utils/mockData';
import { 
  TurnAction, 
} from '@/types';
import { drawCards } from '@/utils/cardData';



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
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request helper with configuration-based mock support
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<T> {
  // If using mock data, return fallback data immediately without making API calls
  if (config.useMockData) {
    if (fallbackData !== undefined) {
      console.log(`🎭 Using mock data for ${endpoint}`);
      return fallbackData;
    }
    throw new ApiError(`Mock data not available for endpoint: ${endpoint}`);
  }

  // Make real API call
  const url = `${config.apiBaseUrl}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🌐 Making real API call to ${endpoint}`);
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
};

// Characters API methods
export const charactersApi = {
  async getAllCharacters(): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/characters`, {}, mockPlayer1Characters);
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
  async getAvailableStages(): Promise<any> {
    const playerId = sessionStorage.getItem('playerId');
    return apiRequest(`/players/${playerId}/card-battle/stages`, {}, {
      success: true,
      code: 200,
      message: "Stages retrieved successfully",
      data: mockStages,
      errors: null,
      meta: {
        playerId,
        timestamp: new Date().toISOString()
      }
    });
  },

  async createBattleStage(stage_id: string): Promise<any> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/stages/${stage_id}`, {
      method: 'POST'
    }, {
      success: true,
      code: 200,
      message: "Battle stage created successfully",
      data: mockBattleStage,
      errors: null,
      meta: {}
    });
  },

  async startBattle(battleId: string): Promise<any> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/start`, {
      method: 'POST',
    }, {
      success: true,
      code: 200,
      message: "Battle started successfully",
      data: null,
      errors: null,
      meta: {
        playerId,
        battleId,
        timestamp: new Date().toISOString()
      }
    });
  },

  async getBattleState(battleId: string): Promise<any> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/state`, {}, {
      success: true,
      code: 200,
      message: "Battle state retrieved successfully",
      data: mockCardBattleState,
      errors: null,
      meta: {
        playerId,
        battleId,
        timestamp: new Date().toISOString()
      }
    });
  },

  async startTurn(battleId: string): Promise<any> {
    console.log('🎯 startTurn API called for battle:', battleId);
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/start-turn`, {
      method: 'POST',
    }, mockActionResult);
  },

  async playAction(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 playAction API called for battle:', battleId, 'with data:', turnAction);
    
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/action`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    }, mockActionResult);
  },

  async drawCards(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 drawCards API called for battle:', battleId, 'with data:', turnAction);

    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/action`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    }, mockDrawCardResult);
  },
  

  async getBattleLogs(battleId: string, turn?: number): Promise<any> {
    console.log('📋 getBattleLogs API called for battle:', battleId, 'turn:', turn);
    const endpoint = turn ? `/card-battle/${battleId}/logs?turn=${turn}` : `/card-battle/${battleId}/logs`;
    return apiRequest(endpoint, {}, []);
  },


};


// Export the ApiError class and LoadingState interface for use in components
export { ApiError };
export type { LoadingState };

// Utility function to check if we're using mock data (now based on configuration)
export function isLikelyUsingMockData(): boolean {
  return config.useMockData;
}