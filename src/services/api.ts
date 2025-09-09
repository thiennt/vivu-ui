/**
 * API Service Layer for vivu-api integration
 * Provides TypeScript interfaces and service methods for all game data
 */

// Base API configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://api.vivu.game';

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

// Generic API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
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

  async getPlayerCharacters(playerId: string): Promise<any[]> {
    return apiRequest(`/players/${playerId}/characters`);
  },
};

// Characters API methods
export const charactersApi = {
  async getAllCharacters(): Promise<any[]> {
    return apiRequest('/characters');
  },

  async getCharacter(characterId: string): Promise<any> {
    return apiRequest(`/characters/${characterId}`);
  },

  async getCharacterSkills(characterId: string): Promise<any[]> {
    return apiRequest(`/characters/${characterId}/skills`);
  },
};

// Dungeons API methods
export const dungeonsApi = {
  async getAllDungeons(): Promise<any[]> {
    return apiRequest('/dungeons');
  },

  async getDungeon(dungeonId: string): Promise<any> {
    return apiRequest(`/dungeons/${dungeonId}`);
  },

  async getDungeonStages(dungeonId: string): Promise<any[]> {
    return apiRequest(`/dungeons/${dungeonId}/stages`);
  },
};

// Stages API methods
export const stagesApi = {
  async getStage(stageId: string): Promise<any> {
    return apiRequest(`/stages/${stageId}`);
  },

  async getStageRewards(stageId: string): Promise<any[]> {
    return apiRequest(`/stages/${stageId}/rewards`);
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
};

// Export the ApiError class and LoadingState interface for use in components
export { ApiError };
export type { LoadingState };

// Export API base URL for potential configuration needs
export { API_BASE_URL };