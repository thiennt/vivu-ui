/**
 * Centralized color constants for the application
 * All hex color values used throughout the UI should be defined here
 * Orange theme with gradient support
 */

import { FillGradient } from 'pixi.js';

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
  CARD_DISCARD: '#654321',           // Discard pile color
  TEAM_ALLY: '#4caf50',              // Player team color (green)
  TEAM_ENEMY: '#f44336',             // Enemy team color (red)
  ENERGY_TEXT: '#ffa500',            // Energy cost text
  SUCCESS: '#4caf50',                // Success message color
  ERROR: '#f44336',                  // Error message color

  // Decorative elements - Orange theme
  DECORATION_MAGIC: '#ff8c00',       // Dark orange for magical elements

  // Shadow and effects
  SHADOW_COLOR: '#000000',

  // High contrast colors for UI improvements
  ACCENT_PRIMARY: '#00d4ff',       // Bright cyan for important elements
  ACCENT_SECONDARY: '#ff6b35',     // Bright orange-red for warnings/actions
  ACCENT_SUCCESS: '#00ff88',       // Bright green for positive actions
  ACCENT_WARNING: '#ffaa00',       // Bright amber for warnings
  
  // Card interaction states
  CARD_SELECTED: '#00d4ff',        // Bright cyan for selected cards
  CARD_HOVER: '#ff8c00',          // Orange for hover state
  CARD_DISABLED: '#666666',        // Gray for disabled cards
  CARD_AVAILABLE: '#00ff88',       // Green for available/affordable cards
  
  // Background zones for player distinction
  ZONE_PLAYER: '#4a1f0d',         // Player zone (original dark brown)
  ZONE_OPPONENT: '#2d1810',       // Opponent zone (darker brown)
  
  // Enhanced stat colors
  STAT_HEALTH: '#ff4444',         // Red for health
  STAT_ATTACK: '#ff8800',         // Orange for attack
  STAT_DEFENSE: '#4488ff',        // Blue for defense
  STAT_ENERGY: '#44ff88',         // Green for energy
} as const;

// Type-safe color access
export type ColorKey = keyof typeof Colors;

/**
 * Gradient utilities for orange theme
 */
export const Gradients = {
  /**
   * Create a background gradient for panels and containers
   */
  createBackgroundGradient: (width: number, height: number): FillGradient => {
    const gradient = new FillGradient({
      start: { x: 0, y: 0 },
      end: { x: 1, y: height },
      type: "linear",  
      colorStops: [
        { offset: 0, color: Colors.BACKGROUND_PRIMARY },   // Very dark orange at top
        { offset: 1, color: Colors.BACKGROUND_SECONDARY }  // Dark orange at bottom
      ]
    });
    return gradient;
  },

  /**
   * Create a button gradient
   */
  createButtonGradient: (width: number, height: number): FillGradient => {
    const gradient = new FillGradient({
      start: { x: 0, y: 0 },
      end: { x: 0, y: height },
      type: 'linear',
      colorStops: [
        { offset: 0, color: Colors.BUTTON_HOVER },    // Bright orange at top
        { offset: 0.5, color: Colors.BUTTON_PRIMARY }, // Medium orange in middle
        { offset: 1, color: Colors.BUTTON_BORDER }    // Dark orange at bottom
      ]
    });
    return gradient;
  },

  /**
   * Create a panel gradient
   */
  createPanelGradient: (width: number, height: number): FillGradient => {
    const gradient = new FillGradient({
      start: { x: 0, y: 0 },
      end: { x: 0, y: height },
      type: 'linear',
      colorStops: [
        { offset: 0, color: Colors.CONTAINER_BACKGROUND }, // Sienna at top
        { offset: 1, color: Colors.PANEL_BACKGROUND }      // Saddle brown at bottom
      ]
    });
    return gradient;
  },

  /**
   * Create a mystical decoration gradient
   */
  createMagicGradient: (width: number, height: number): FillGradient => {
    const gradient = new FillGradient({
      start: { x: 0, y: 0 },
      end: { x: width, y: height },
      type: 'linear',
      colorStops: [
        { offset: 0, color: Colors.DECORATION_MAGIC },     // Dark orange
        { offset: 0.5, color: 0xffa500 },                  // Orange
        { offset: 1, color: Colors.DECORATION_MAGIC }      // Dark orange
      ]
    });
    return gradient;
  },

  /**
   * Dark background gradient for battle scenes
   */
  BACKGROUND_DARK: 0x2d1810,  // Dark brown color
};