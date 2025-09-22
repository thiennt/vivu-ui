/**
 * API Service Layer for vivu-api integration
 * Provides TypeScript interfaces and service methods for all game data
 * Includes fallback to mock data when API calls fail
 */

import { mockPlayer, mockCharacters, mockSkills, mockDungeons, mockStages, mockCardBattleState, mockBattleRewards } from '@/utils/mockData';
import { 
  BattleApiResponse, 
  BattleMoveData, 
  BattleMoveResponse, 
  BattleMoveApiResponse,
  BattleEndData, 
  BattleRewards,
  TurnPhase, 
  BattleStageResponse,
  CardBattleState,
  DrawPhaseResult,
  BattlePhaseResult,
  BattleLogEntry,
  CardBattleLog,
  DrawPhaseResponse,
  BattlePhaseResponse
} from '@/types';
import { createRandomDeck } from '@/utils/cardData';


// Base API configuration
const API_BASE_URL = ((import.meta as unknown) as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || 'https://api.vivu.game';

// Helper function to convert BattleLogEntry to CardBattleLog
function convertToCardBattleLog(entry: BattleLogEntry, id?: string): CardBattleLog {
  return {
    id: id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    phase: 'main_phase', // Default phase
    action_type: entry.type,
    actor: {
      team: entry.player_team,
      character_id: entry.character_id,
      player_id: entry.player_team === 1 ? 'player_fc_001' : 'ai_player'
    },
    card: entry.card_id ? {
      id: entry.card_id,
      name: `Card ${entry.card_id}`,
      group: 'unknown',
      description: entry.description || '',
      card_type: 'action',
      energy_cost: 1
    } : undefined,
    targets: entry.target_ids?.map(targetId => ({
      id: targetId,
      team: entry.player_team === 1 ? 2 : 1, // Target is usually on the opposite team
      before: {
        id: targetId,
        team: entry.player_team === 1 ? 2 : 1,
        max_hp: 100,
        current_hp: 75,
        atk: 50,
        def: 30,
        agi: 20,
        crit_rate: 5,
        crit_dmg: 150,
        res: 10,
        damage: 0,
        mitigation: 0,
        hit_rate: 95,
        dodge: 5,
        has_acted: false,
        active_effects: [],
        equipped_skills: []
      },
      after: {
        id: targetId,
        team: entry.player_team === 1 ? 2 : 1,
        max_hp: 100,
        current_hp: 50, // Reduced health after action
        atk: 50,
        def: 30,
        agi: 20,
        crit_rate: 5,
        crit_dmg: 150,
        res: 10,
        damage: 0,
        mitigation: 0,
        hit_rate: 95,
        dodge: 5,
        has_acted: false,
        active_effects: [],
        equipped_skills: []
      },
      impacts: [{
        type: 'damage',
        value: 25,
        meta: { isCritical: false }
      }]
    })),
    result: {
      success: true,
      reason: undefined
    },
    created_at: entry.timestamp || new Date().toISOString(),
    animation_hint: entry.description
  };
}

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
    
    // Mock data in legacy format for backward compatibility
    const legacyMockResponse: BattleMoveResponse = {
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
    };
    
    return apiRequest(`/card-battle/${battleId}/action`, {
      method: 'POST',
      body: JSON.stringify(moveData),
    }, legacyMockResponse);
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

  // 🆕 NEW API METHODS - Use new standardized response format
  // Success: { success: true, code: 200, message: "Success", data: CardBattleLog[], errors: null, meta: {...} }
  // Error:   { success: false, code: 4xx/5xx, message: "Error", data: null, errors: [...], meta: {...} }
  
  async playActionNew(battleId: string, moveData: BattleMoveData): Promise<BattleMoveApiResponse> {
    console.log('🎮 NEW playActionNew API called for battle:', battleId, 'with data:', moveData);
    
    try {
      const response = await apiRequest(`/card-battle/${battleId}/action-new`, {
        method: 'POST',
        body: JSON.stringify(moveData),
      });
      
      let cardBattleLogs: CardBattleLog[] = [];
      
      // Check if API returned the new format (CardBattleLog array)
      if (Array.isArray(response)) {
        cardBattleLogs = response;
      }
      // If API returned legacy format, convert it
      else if ((response as any).battle_logs) {
        cardBattleLogs = (response as any).battle_logs.map((entry: BattleLogEntry) => convertToCardBattleLog(entry));
      }
      // Fallback: convert mock data
      else {
        const mockBattleLogEntry: BattleLogEntry = {
          type: moveData.action,
          player_team: 1,
          card_id: moveData.card_id,
          target_ids: moveData.target_ids,
          description: `Player action: ${moveData.action}`,
          timestamp: new Date().toISOString()
        };
        cardBattleLogs = [convertToCardBattleLog(mockBattleLogEntry)];
      }
      
      // Return success response in new standardized format
      return {
        success: true,
        code: 200,
        message: "Action executed successfully",
        data: cardBattleLogs,
        errors: null,
        meta: {
          action: moveData.action,
          battleId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      // Return error response in new standardized format
      return {
        success: false,
        code: 500,
        message: "Failed to execute action",
        data: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        meta: {
          action: moveData.action,
          battleId,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  async startTurnNew(battleId: string): Promise<DrawPhaseResponse> {
    console.log('🎯 NEW startTurnNew API called for battle:', battleId);
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    
    try {
      const response = await apiRequest(`/players/${playerId}/card-battle/${battleId}/start-turn-new`, {
        method: 'POST',
      });
      
      let cardBattleLogs: CardBattleLog[] = [];
      
      // Check if API returned the new format (CardBattleLog array)
      if (Array.isArray(response)) {
        cardBattleLogs = response;
      }
      // If API returned legacy format, convert it
      else if ((response as any).battle_logs) {
        cardBattleLogs = (response as any).battle_logs.map((entry: BattleLogEntry) => convertToCardBattleLog(entry));
      }
      // Fallback: convert mock data
      else {
        const mockBattleLogEntry: BattleLogEntry = {
          type: 'draw_phase',
          player_team: 1,
          description: 'Turn started: Player draws cards and gains energy',
          timestamp: new Date().toISOString()
        };
        cardBattleLogs = [convertToCardBattleLog(mockBattleLogEntry)];
      }
      
      // Return success response in new standardized format
      return {
        success: true,
        code: 200,
        message: "Turn started successfully",
        data: cardBattleLogs,
        errors: null,
        meta: {
          phase: 'draw_phase',
          playerId,
          battleId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.warn('New API failed, falling back to mock data:', error);
      
      // Return error response in new standardized format
      return {
        success: false,
        code: 500,
        message: "Failed to start turn",
        data: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        meta: {
          phase: 'draw_phase',
          playerId,
          battleId,
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  async endTurnNew(battleId: string): Promise<BattlePhaseResponse> {
    console.log('⏭️ NEW endTurnNew API called for battle:', battleId);
    
    try {
      const response = await apiRequest(`/card-battle/${battleId}/action-new`, {
        method: 'POST',
        body: JSON.stringify({ action: 'end_turn' }),
      });
      
      let cardBattleLogs: CardBattleLog[] = [];
      
      // Check if API returned the new format (CardBattleLog array)
      if (Array.isArray(response)) {
        cardBattleLogs = response;
      }
      // If API returned legacy format, convert it
      else {
        const allLogs: BattleLogEntry[] = [];
        
        // Add main battle logs
        if ((response as any).battle_logs) {
          allLogs.push(...(response as any).battle_logs);
        }
        
        // Add AI action battle logs
        if ((response as any).ai_actions) {
          (response as any).ai_actions.forEach((action: any) => {
            if (action.battle_logs) {
              allLogs.push(...action.battle_logs);
            }
            if (action.result && action.result.battle_logs) {
              allLogs.push(...action.result.battle_logs);
            }
          });
        }
        
        // Convert all collected logs
        if (allLogs.length > 0) {
          cardBattleLogs = allLogs.map((entry: BattleLogEntry) => convertToCardBattleLog(entry));
        } else {
          // Fallback: create mock CardBattleLog entries
          const mockBattleLogEntries: BattleLogEntry[] = [
            {
              type: 'end_turn',
              player_team: 1,
              description: 'Player ends turn, AI begins their turn',
              timestamp: new Date().toISOString()
            },
            {
              type: 'draw_phase',
              player_team: 2,
              description: 'AI draws cards and gains energy',
              timestamp: new Date().toISOString()
            },
            {
              type: 'play_card',
              player_team: 2,
              character_id: 'ai_char_001',
              card_id: 'card_003',
              target_ids: ['player_char_001'],
              description: 'AI plays card_003 targeting player character',
              timestamp: new Date().toISOString()
            }
          ];
          cardBattleLogs = mockBattleLogEntries.map((entry: BattleLogEntry) => convertToCardBattleLog(entry));
        }
      }
      
      // Return success response in new standardized format
      return {
        success: true,
        code: 200,
        message: "Turn ended successfully",
        data: cardBattleLogs,
        errors: null,
        meta: {
          phase: 'end_turn',
          battleId,
          timestamp: new Date().toISOString(),
          logCount: cardBattleLogs.length
        }
      };
    } catch (error) {
      console.warn('New API failed, falling back to mock data:', error);
      
      // Return error response in new standardized format
      return {
        success: false,
        code: 500,
        message: "Failed to end turn",
        data: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        meta: {
          phase: 'end_turn',
          battleId,
          timestamp: new Date().toISOString()
        }
      };
    }
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