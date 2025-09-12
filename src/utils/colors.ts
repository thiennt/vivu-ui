/**
 * Centralized color constants for the application
 * All hex color values used throughout the UI should be defined here
 * Orange theme with gradient support
 */

import { FillGradient } from 'pixi.js';

export const Colors = {
  // Background colors - Orange theme
  BACKGROUND_PRIMARY: 0x4a1f0d,     // Very dark orange/brown
  BACKGROUND_SECONDARY: 0x6b2e17,   // Dark orange

  // Text colors - High contrast for orange backgrounds
  TEXT_PRIMARY: 0xfff4e0,           // Primary text (titles) - warm white
  TEXT_SECONDARY: 0xffe0b3,         // Secondary text (subtitles, stats) - light orange
  TEXT_TERTIARY: 0xffb366,          // Tertiary text (skill stats) - medium orange
  TEXT_WHITE: 0xffffff,             // White text
  TEXT_BUTTON: 0xfff8e1,            // Button text - warm white

  // Button colors - Orange gradient theme
  BUTTON_PRIMARY: 0xd2691e,         // Primary button background - chocolate orange
  BUTTON_BORDER: 0x8b4513,          // Button border - saddle brown
  BUTTON_HOVER: 0xff8c00,           // Button hover state - dark orange

  // Card rarity colors - Updated for orange theme
  RARITY_COMMON: 0xd2691e,          // Orange theme common
  RARITY_UNCOMMON: 0x66bb6a,        // Keep green for contrast
  RARITY_RARE: 0x42a5f5,            // Keep blue for contrast
  RARITY_EPIC: 0xab47bc,            // Keep purple for contrast
  RARITY_LEGENDARY: 0xff9800,       // Bright orange

  // Element colors - Maintain variety for gameplay
  ELEMENT_FIRE: 0xff4500,           // Orange-red for fire
  ELEMENT_WATER: 0x2196f3,
  ELEMENT_EARTH: 0x4caf50,
  ELEMENT_AIR: 0xffeb3b,
  ELEMENT_LIGHT: 0xffc107,
  ELEMENT_DARK: 0x9c27b0,
  ELEMENT_DEFAULT: 0x888888,

  // Lineup labels
  LINEUP_FRONT: 0xff6347,           // Tomato orange
  LINEUP_BACK: 0x2196f3,

  // Card borders - Orange theme
  CARD_BORDER: 0x6b2e17,            // Dark orange

  // Panel and container backgrounds - Orange theme
  PANEL_BACKGROUND: 0x8b4513,       // Saddle brown
  CONTAINER_BACKGROUND: 0xa0522d,    // Sienna

  // Decorative elements - Orange theme
  DECORATION_MAGIC: 0xff8c00,       // Dark orange for magical elements

  // Shadow and effects
  SHADOW_COLOR: 0x000000,
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
      type: 'linear',
      x0: 0, y0: 0,
      x1: 0, y1: height,
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
      type: 'linear',
      x0: 0, y0: 0,
      x1: 0, y1: height,
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
      type: 'linear',
      x0: 0, y0: 0,
      x1: 0, y1: height,
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
      type: 'linear',
      x0: 0, y0: 0,
      x1: width, y1: height,
      colorStops: [
        { offset: 0, color: Colors.DECORATION_MAGIC },     // Dark orange
        { offset: 0.5, color: 0xffa500 },                  // Orange
        { offset: 1, color: Colors.DECORATION_MAGIC }      // Dark orange
      ]
    });
    return gradient;
  }
};