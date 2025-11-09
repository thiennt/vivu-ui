/**
 * Application Configuration
 * Contains global configuration flags and settings
 */

export interface AppConfig {
  /** Whether to use mock data instead of real API calls */
  useMockData: boolean;
  /** API base URL */
  apiBaseUrl: string;
  /** Whether running in development mode */
  isDevelopment: boolean;
}

// Default configuration
const defaultConfig: AppConfig = {
  useMockData: ((import.meta as unknown) as { env?: { VITE_USE_MOCK_DATA?: string } }).env?.VITE_USE_MOCK_DATA === 'true' || ((import.meta as unknown) as { env?: { VITE_USE_MOCK_DATA?: string } }).env?.VITE_USE_MOCK_DATA === undefined, // Default to true for development/testing when env var is not set
  apiBaseUrl: ((import.meta as unknown) as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || 'https://api.vivu.game',
  isDevelopment: ((import.meta as unknown) as { env?: { MODE?: string } }).env?.MODE === 'development' || ((import.meta as unknown) as { env?: { NODE_ENV?: string } }).env?.NODE_ENV === 'development'
};

// Global configuration instance
export const config: AppConfig = { ...defaultConfig };

/**
 * Update configuration at runtime
 */
export function updateConfig(updates: Partial<AppConfig>): void {
  Object.assign(config, updates);
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  Object.assign(config, defaultConfig);
}