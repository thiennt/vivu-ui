/**
 * API Service Layer for vivu-api integration
 * Provides TypeScript interfaces and service methods for all game data
 * Uses configuration to determine whether to use mock data or real API calls
 */

import { config } from '@/config';
import {
  mockPlayer, mockSkills, mockDungeons, mockStages, mockCardBattleState,
  mockBattleStage, mockPlayer1Characters, mockActionResult, mockDrawCardResult,
  mockPlayCardResult, mockEndTurnResult,
  mockAiTurnResult
} from '@/utils/mockData';
import {
  TurnAction,
} from '@/types';

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
  if (config.useMockData) {
    console.log(`🧪 Using mock data for ${endpoint}`)
    if (fallbackData !== undefined) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(fallbackData), 500); // Simulate network delay
      });
    } else {
      throw new ApiError(`No mock data available for ${endpoint}`);
    }
  }

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
  async getPlayer(playerId: string): Promise<any> {
    return apiRequest(`/players/${playerId}`, {}, mockPlayer);
  },

  async updatePlayerStats(playerId: string, stats: any): Promise<any> {
    return apiRequest(`/players/${playerId}/stats`, {
      method: 'PUT',
      body: JSON.stringify(stats),
    }, { ...mockPlayer, ...stats });
  },

  async updateLineup(playerId: string, lineup: any[]): Promise<any> {
    return apiRequest(`/players/${playerId}/lineup`, {
      method: 'POST',
      body: JSON.stringify(lineup),
    }, { success: true, lineup });
  },
};

// Characters API methods
export const charactersApi = {
  async getAllCharacters(): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/characters`, {}, mockPlayer1Characters);
  },

  async getCharacter(characterId: string): Promise<any> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    const characters = await this.getAllCharacters();
    return characters.find(char => char.id === characterId) || null;
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

  async drawCards(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 drawCards API called for battle:', battleId, 'with data:', turnAction);

    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/draw-card`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    }, mockDrawCardResult);
  },

  async discardCard(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 discardCard API called for battle:', battleId, 'with data:', turnAction);

    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/discard-card`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    }, mockActionResult);
  },

  async playCard(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 playCard API called for battle:', battleId, 'with data:', turnAction);

    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/play-card`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    }, mockPlayCardResult);
  },

  async endTurn(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 endTurn API called for battle:', battleId, 'with data:', turnAction);

    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/end-turn`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    }, mockEndTurnResult);
  },

  async aiTurn(battleId: string): Promise<any> {
    console.log('🤖 aiTurn API called for battle:', battleId);
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/ai-turn`, {
      method: 'POST',
    }, mockAiTurnResult);
  },

  async getBattleLogs(battleId: string, turn?: number): Promise<any> {
    console.log('📋 getBattleLogs API called for battle:', battleId, 'turn:', turn);
    const endpoint = turn ? `/card-battle/${battleId}/logs?turn=${turn}` : `/card-battle/${battleId}/logs`;
    return apiRequest(endpoint, {}, []);
  },


};


// Auth API methods
export const authApi = {
  async signIn(token: string): Promise<any> {
    return apiRequest('/auth/signin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, mockPlayer);
  },
};

// Export the ApiError class and LoadingState interface for use in components
export { ApiError };
export type { LoadingState };

// Utility function to check if we're using mock data (now based on configuration)
export function isLikelyUsingMockData(): boolean {
  return config.useMockData;
}