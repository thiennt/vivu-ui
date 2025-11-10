/**
 * API Service Layer for vivu-api integration
 * Provides TypeScript interfaces and service methods for all game data
 * All methods now use real API calls only
 */

import { config } from '@/config';
import { TurnAction, NFT, AvatarUpdateResponse } from '@/types';

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
  async getPlayer(playerId: string): Promise<any> {
    return apiRequest(`/players/${playerId}`);
  },

  async updatePlayerStats(playerId: string, stats: any): Promise<any> {
    return apiRequest(`/players/${playerId}/stats`, {
      method: 'PUT',
      body: JSON.stringify(stats),
    });
  },

  async updateLineup(playerId: string, lineup: any[]): Promise<any> {
    return apiRequest(`/players/${playerId}/lineup`, {
      method: 'POST',
      body: JSON.stringify(lineup),
    });
  },
};

// Characters API methods
export const charactersApi = {
  async getAllCharacters(): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/characters`);
  },

  async getCharacter(characterId: string): Promise<any> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    const characters = await this.getAllCharacters();
    return characters.find(char => char.id === characterId) || null;
  },

  async getCharacterSkills(characterId: string): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/characters/${characterId}/skills`);
  },
};

// Dungeons API methods
export const dungeonsApi = {
  async getAllDungeons(): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/stages`);
  },

  async getDungeonStages(dungeonId: string): Promise<any[]> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/stages/${dungeonId}/stages`);
  },
};

// Skills API methods
export const skillsApi = {
  async getAllSkills(): Promise<any[]> {
    return apiRequest('/skills');
  },

  async getSkill(skillId: string): Promise<any> {
    return apiRequest(`/skills/${skillId}`);
  },

  /**
   * Get available skills by type for a character
   * GET /skills?skill_type={skillType}
   */
  async getAvailableSkills(skillType?: string): Promise<any[]> {
    const endpoint = skillType ? `/skills?skill_type=${skillType}` : '/skills';
    return apiRequest(endpoint);
  },

  /**
   * Learn/equip a skill to a character
   * POST /players/:playerId/characters/:characterId/skills
   */
  async learnSkill(characterId: string, skillId: string, playerId?: string): Promise<any> {
    const pid = playerId || sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${pid}/characters/${characterId}/skills`, {
      method: 'POST',
      body: JSON.stringify({ skill_id: skillId })
    });
  },

  /**
   * Change an equipped skill on a character
   * PUT /players/:playerId/characters/:characterId/skills/:oldSkillId
   */
  async changeSkill(characterId: string, oldSkillId: string, newSkillId: string, playerId?: string): Promise<any> {
    const pid = playerId || sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${pid}/characters/${characterId}/skills/${oldSkillId}`, {
      method: 'PUT',
      body: JSON.stringify({ new_skill_id: newSkillId })
    });
  },

  /**
   * Remove a skill from a character
   * DELETE /players/:playerId/characters/:characterId/skills/:skillId
   */
  async removeSkill(characterId: string, skillId: string, playerId?: string): Promise<any> {
    const pid = playerId || sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${pid}/characters/${characterId}/skills/${skillId}`, {
      method: 'DELETE'
    });
  }
};

// Battle API methods
export const battleApi = {
  async getAvailableStages(): Promise<any> {
    const playerId = sessionStorage.getItem('playerId');
    return apiRequest(`/players/${playerId}/card-battle/stages`);
  },

  async getStageEnemies(stage_id: string): Promise<any> {
    const playerId = sessionStorage.getItem('playerId');
    return apiRequest(`/players/${playerId}/card-battle/stages/${stage_id}/enemies`);
  },

  async createBattleStage(stage_id: string): Promise<any> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/stages/${stage_id}`, {
      method: 'POST'
    });
  },

  async startBattle(battleId: string): Promise<any> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/start`, {
      method: 'POST',
    });
  },

  async getBattleState(battleId: string): Promise<any> {
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/state`);
  },

  async startTurn(battleId: string): Promise<any> {
    console.log('🎯 startTurn API called for battle:', battleId);
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';

    return apiRequest(`/players/${playerId}/card-battle/${battleId}/start-turn`, {
      method: 'POST',
    });
  },

  async drawCards(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 drawCards API called for battle:', battleId, 'with data:', turnAction);

    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/draw-card`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    });
  },

  async discardCard(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 discardCard API called for battle:', battleId, 'with data:', turnAction);

    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/discard-card`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    });
  },

  async playCard(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 playCard API called for battle:', battleId, 'with data:', turnAction);

    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/play-card`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    });
  },

  async endTurn(battleId: string, turnAction: TurnAction): Promise<any> {
    console.log('🎮 endTurn API called for battle:', battleId, 'with data:', turnAction);

    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/end-turn`, {
      method: 'POST',
      body: JSON.stringify(turnAction),
    });
  },

  async aiTurn(battleId: string): Promise<any> {
    console.log('🤖 aiTurn API called for battle:', battleId);
    const playerId = sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${playerId}/card-battle/${battleId}/ai-turn`, {
      method: 'POST',
    });
  },

  async getBattleLogs(battleId: string, turn?: number): Promise<any> {
    console.log('📋 getBattleLogs API called for battle:', battleId, 'turn:', turn);
    const endpoint = turn ? `/card-battle/${battleId}/logs?turn=${turn}` : `/card-battle/${battleId}/logs`;
    return apiRequest(endpoint);
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

// Equipment API methods
export const equipmentApi = {
  /**
   * List all available equipment
   * GET /players/equipment
   */
  async getAllEquipment(playerId?: string): Promise<any[]> {
    const pid = playerId || sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${pid}/equipments`);
  },

  /**
   * Get player's inventory
   * GET /players/:playerId/equipment
   */
  async getPlayerInventory(playerId?: string): Promise<any> {
    const pid = playerId || sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${pid}/equipment`);
  },

  /**
   * Get character's equipped items
   * GET /players/:playerId/characters/:characterId/equipment
   */
  async getCharacterEquipment(characterId: string, playerId?: string): Promise<any> {
    const pid = playerId || sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${pid}/characters/${characterId}/equipment`);
  },

  /**
   * Equip item to character
   * POST /players/:playerId/characters/:characterId/equipment
   */
  async equipItem(characterId: string, equipmentId: string, slot: string, playerId?: string): Promise<any> {
    const pid = playerId || sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${pid}/characters/${characterId}/equipment`, {
      method: 'POST',
      body: JSON.stringify({ equipment_id: equipmentId, slot })
    });
  },

  /**
   * Unequip item from character
   * DELETE /players/:playerId/characters/:characterId/equipment/:slot
   */
  async unequipItem(characterId: string, slot: string, playerId?: string): Promise<any> {
    const pid = playerId || sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${pid}/characters/${characterId}/equipment/${slot}`, {
      method: 'DELETE'
    });
  }
};

// NFT API methods
export const nftApi = {
  /**
   * Get player's NFT collection
   * GET /players/:playerId/nfts
   */
  async getPlayerNFTs(playerId?: string): Promise<NFT[]> {
    const pid = playerId || sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${pid}/nfts`);
  },

  /**
   * Update character avatar with NFT
   * PUT /players/:playerId/characters/:characterId/avatar
   */
  async updateCharacterAvatar(characterId: string, nftId: string, playerId?: string): Promise<AvatarUpdateResponse> {
    const pid = playerId || sessionStorage.getItem('playerId') || 'player_fc_001';
    return apiRequest(`/players/${pid}/characters/${characterId}/avatar`, {
      method: 'PUT',
      body: JSON.stringify({ nft_id: nftId })
    });
  }
};

// Utility function to check if we're using mock data (always false now)
export function isLikelyUsingMockData(): boolean {
  return false;
}