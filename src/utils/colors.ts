/**
 * Centralized color constants for the application
 * All hex color values used throughout the UI should be defined here
 * Orange theme with gradient support
 */

export const Colors = {
  // Background colors - Orange theme
  BACKGROUND_PRIMARY: '#4a1f0d',     // Very dark orange/brown
  BACKGROUND_SECONDARY: '#6b2e17',   // Dark orange

  // Text colors - High contrast for orange backgrounds
  TEXT_PRIMARY: '#fff4e0',           // Primary text (titles) - warm white
  TEXT_SECONDARY: '#ffe0b3',         // Secondary text (subtitles, stats) - light orange
  TEXT_TERTIARY: '#ffb366',          // Tertiary text (skill stats) - medium orange
  TEXT_WHITE: '#ffffff',             // White text
  TEXT_BUTTON: '#fff8e1',            // Button text - warm white

  // Button colors - Orange gradient theme
  BUTTON_PRIMARY: '#d2691e',         // Primary button background - chocolate orange
  BUTTON_BORDER: '#8b4513',          // Button border - saddle brown
  BUTTON_HOVER: '#ff8c00',           // Button hover state - dark orange

  // Card rarity colors - Updated for orange theme
  RARITY_COMMON: '#d2691e',          // Orange theme common
  RARITY_UNCOMMON: '#66bb6a',        // Keep green for contrast
  RARITY_RARE: '#42a5f5',            // Keep blue for contrast
  RARITY_EPIC: '#ab47bc',            // Keep purple for contrast
  RARITY_LEGENDARY: '#ff9800',       // Bright orange

  // Element colors - Maintain variety for gameplay
  ELEMENT_FIRE: '#ff4500',           // Orange-red for fire
  ELEMENT_WATER: '#2196f3',
  ELEMENT_EARTH: '#4caf50',
  ELEMENT_AIR: '#ffeb3b',
  ELEMENT_LIGHT: '#ffc107',
  ELEMENT_DARK: '#9c27b0',
  ELEMENT_DEFAULT: '#888888',

  // Lineup labels
  LINEUP_FRONT: '#ff6347',           // Tomato orange
  LINEUP_BACK: '#2196f3',

  // Card borders - Orange theme
  CARD_BORDER: '#6b2e17',            // Dark orange
  CARD_BACKGROUND: '#d2691e',        // Card background
  CARD_BACK: '#8b4513',             // Card back color

  // Panel and container backgrounds - Orange theme
  PANEL_BACKGROUND: '#8b4513',       // Saddle brown
  CONTAINER_BACKGROUND: '#a0522d',    // Sienna

  // UI elements
  ENERGY_ACTIVE: '#ffa500',          // Active energy color
  ENERGY_INACTIVE: '#808080',        // Inactive energy color
  HP_BAR_BACKGROUND: '#666666',      // HP bar background
  HP_BAR_FILL: '#ff4500',           // HP bar fill
  HP_BAR_BG: '#666666',              // HP bar background (alias)
  TEXT_ON_DARK: '#ffffff',          // Text on dark backgrounds
  
  // Card Battle UI colors
  UI_BACKGROUND: '#8b4513',          // UI panel background
  UI_BORDER: '#6b2e17',              // UI panel border
  UI_BORDER_GLOW: '#ff8c00',         // Glowing border effect
  CARD_DISCARD: '#654321',           // Discard pile color
  TEAM_ALLY: '#4caf50',              // Player team color (green)
  TEAM_ENEMY: '#f44336',             // Enemy team color (red)
  ENERGY_TEXT: '#ffa500',            // Energy cost text
  SUCCESS: '#4caf50',                // Success message color
  ERROR: '#f44336',                  // Error message color

  // Decorative elements - Orange theme
  DECORATION_MAGIC: '#ff8c00',       // Dark orange for magical elements
  DECORATION_FRAME: '#d4af37',       // Gold frame accents
  DECORATION_INNER_GLOW: '#ffcc66',  // Inner glow effects
  
  // Battle zone specific colors - Enhanced for epic battle feel
  BATTLEFIELD_PRIMARY: '#2d1810',    // Deep mystical brown background
  BATTLEFIELD_SECONDARY: '#1e0f08',  // Darker mystical zones
  BATTLEFIELD_ACCENT: '#ff8c00',     // Vibrant orange accents
  BATTLEFIELD_BORDER: '#d4af37',     // Golden battle borders
  BATTLEFIELD_INNER_GLOW: '#ffcc66', // Inner mystical glow

  // Enhanced battle effects
  BATTLE_MAGIC_AURA: '#ff6600',      // Magical battle aura
  BATTLE_ENERGY_GLOW: '#ffaa44',     // Energy glow effects
  BATTLE_FRAME_GOLD: '#ffd700',      // Gold frame highlights
  BATTLE_SHADOW_DEEP: '#0d0603',     // Deep shadows for depth

  // Shadow and effects
  SHADOW_COLOR: '#000000',
  GLOW_COLOR: '#ffaa00',             // Golden glow effects
  MYSTICAL_GLOW: '#ff9500',          // Mystical orange glow
  EPIC_BORDER_GLOW: '#ffcc00',       // Epic border glow effect
} as const;

// Type-safe color access
export type ColorKey = keyof typeof Colors;