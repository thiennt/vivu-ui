/**
 * Application Configuration
 * Contains global configuration flags and settings
 */

export interface AppConfig {
  /** API base URL */
  apiBaseUrl: string;
}

// Default configuration
const defaultConfig: AppConfig = {
  apiBaseUrl: ((import.meta as unknown) as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || 'https://api.vivu.game',
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