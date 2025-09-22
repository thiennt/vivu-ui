/**
 * API Service Layer for vivu-api integration
 * Provides TypeScript interfaces and service methods for all game data
 * Includes fallback to mock data when API calls fail
 */

import { mockPlayer, mockCharacters, mockSkills, mockDungeons, mockStages, mockCardBattleState, mockBattleRewards } from '@/utils/mockData';
import { 
  BattleApiResponse, 
  BattleStateResponse, 
  BattleMoveData, 
  BattleMoveResponse, 
  BattleEndData, 
  BattleRewards,
  TurnPhase, 
  BattleStageResponse,
  CardBattleState,
  DrawPhaseResult,
  BattlePhaseResult,
  BattleLogEntry
} from '@/types';
import { createRandomDeck } from '@/utils/cardData';


// Base API configuration
const API_BASE_URL = ((import.meta as unknown) as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || 'https://api.vivu.game';

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
    public response?: unknown
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
    }, {
      battle_id: 'battle_mock_001',
      stage_id: stage_id,
      player1_id: playerId,
      status: 'created',
      cards: []
    });
  },

  async startBattle(battleId: string): Promise<void> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/start`, {
      method: 'POST',
    }, undefined);
  },

  async getBattleState(battleId: string): Promise<CardBattleState> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/state`, {}, mockCardBattleState);
  },

  async startTurn(battleId: string): Promise<DrawPhaseResult> {
    console.log('🎯 startTurn API called for battle:', battleId);
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/start-turn`, {
      method: 'POST',
    }, {
      success: true,
      drawn_cards: [],
      updated_hand: [],
      energy: 3,
      status_effects: [],
      actions_performed: [{
        type: 'draw_phase',
        player_team: 1,
        description: 'Turn started, cards drawn'
      }],
      battle_logs: [{
        type: 'draw_phase',
        player_team: 1,
        description: 'Turn started: Player draws cards and gains energy',
        timestamp: new Date().toISOString()
      }]
    });
  },

  async playAction(battleId: string, moveData: BattleMoveData): Promise<BattleMoveResponse> {
    console.log('🎮 playAction API called for battle:', battleId, 'with data:', moveData);
    return apiRequest(`/card-battle/${battleId}/action`, {
      method: 'POST',
      body: JSON.stringify(moveData),
    }, { 
      success: true, 
      result: {
        success: true,
        damage_dealt: moveData.action === 'play_card' ? 25 : undefined,
        actions_performed: [{
          type: moveData.action,
          player_team: 1,
          card_id: moveData.card_id,
          target_ids: moveData.target_ids,
          description: `${moveData.action} executed`
        }],
        battle_logs: [{
          type: moveData.action,
          player_team: 1,
          card_id: moveData.card_id,
          target_ids: moveData.target_ids,
          description: `Player performs ${moveData.action}${moveData.card_id ? ` with ${moveData.card_id}` : ''}`,
          timestamp: new Date().toISOString()
        }]
      },
      battle_logs: [{
        type: moveData.action,
        player_team: 1,
        card_id: moveData.card_id,
        target_ids: moveData.target_ids,
        description: `Player action: ${moveData.action}`,
        timestamp: new Date().toISOString()
      }]
    });
  },

  async getBattleLogs(battleId: string, turn?: number): Promise<BattleLogEntry[]> {
    console.log('📋 getBattleLogs API called for battle:', battleId, 'turn:', turn);
    const endpoint = turn ? `/card-battle/${battleId}/logs?turn=${turn}` : `/card-battle/${battleId}/logs`;
    return apiRequest(endpoint, {}, []);
  },

  async endTurn(battleId: string): Promise<BattlePhaseResult> {
    console.log('⏭️ endTurn API called for battle:', battleId);
    return apiRequest(`/card-battle/${battleId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'end_turn' }),
    }, { 
      success: true,
      phase: 'ai_turn',
      current_turn: 2,
      current_player: 2,
      ai_actions: [
        {
          type: 'draw_phase',
          player_team: 2,
          actions_performed: [{
            type: 'draw_phase',
            player_team: 2,
            description: 'AI drew cards'
          }],
          battle_logs: [{
            type: 'draw_phase',
            player_team: 2,
            description: 'AI draws cards and gains energy',
            timestamp: new Date().toISOString()
          }]
        },
        {
          type: 'play_card',
          player_team: 2,
          character_id: 'ai_char_001',
          card_id: 'card_003',
          target_ids: ['player_char_001'],
          result: {
            success: true,
            damage_dealt: 30,
            actions_performed: [{
              type: 'play_card',
              player_team: 2,
              character_id: 'ai_char_001',
              card_id: 'card_003',
              target_ids: ['player_char_001'],
              description: 'AI played attack card'
            }],
            battle_logs: [{
              type: 'play_card',
              player_team: 2,
              character_id: 'ai_char_001',
              card_id: 'card_003',
              target_ids: ['player_char_001'],
              description: 'AI casts attack card dealing 30 damage',
              timestamp: new Date().toISOString()
            }, {
              type: 'damage',
              player_team: 2,
              target_ids: ['player_char_001'],
              description: 'Player character takes 30 damage from AI attack',
              timestamp: new Date().toISOString()
            }]
          },
          actions_performed: [{
            type: 'play_card',
            player_team: 2,
            character_id: 'ai_char_001',
            card_id: 'card_003',
            target_ids: ['player_char_001'],
            description: 'AI played attack card'
          }],
          battle_logs: [{
            type: 'play_card',
            player_team: 2,
            character_id: 'ai_char_001',
            card_id: 'card_003',
            target_ids: ['player_char_001'],
            description: 'AI plays card_003 targeting player character',
            timestamp: new Date().toISOString()
          }]
        }
      ],
      actions_performed: [{
        type: 'end_turn',
        player_team: 1,
        description: 'Player turn ended'
      }],
      battle_logs: [{
        type: 'end_turn',
        player_team: 1,
        description: 'Player ends turn, AI begins their turn',
        timestamp: new Date().toISOString()
      }]
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
      rewards: battleResult.winner === 1 ? mockBattleRewards : undefined
    });
  },

  async getBattleRewards(battleId: string): Promise<BattleRewards> {
    console.log('🎁 getBattleRewards API called for battle:', battleId);
    return apiRequest(`/battles/${battleId}/rewards`, {}, mockBattleRewards);
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