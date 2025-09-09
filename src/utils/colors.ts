/**
 * Centralized color constants for the application
 * All hex color values used throughout the UI should be defined here
 */

export const Colors = {
  // Background colors
  BACKGROUND_PRIMARY: 0x0d3011,    // Very dark green background (updated from brown)
  BACKGROUND_SECONDARY: 0x1b5e20,  // Dark green secondary background (updated from brown)

  // Text colors
  TEXT_PRIMARY: 0xe8f5e8,      // Light green-tinted text (updated for green theme)
  TEXT_SECONDARY: 0xc8e6c9,    // Light green secondary text (updated for green theme)
  TEXT_TERTIARY: 0xa5d6a7,     // Green-tinted tertiary text (updated for green theme)
  TEXT_WHITE: 0xffffff,        // White text
  TEXT_BUTTON: 0xf1f8e9,       // Light green button text (updated for green theme)

  // Button colors
  BUTTON_PRIMARY: 0x43a047,    // Primary button background (green)
  BUTTON_BORDER: 0x2e7d32,     // Button border (dark green)
  BUTTON_HOVER: 0x66bb6a,      // Button hover state (light green)

  // Card rarity colors
  RARITY_COMMON: 0x4caf50,
  RARITY_UNCOMMON: 0x66bb6a,
  RARITY_RARE: 0x42a5f5,
  RARITY_EPIC: 0xab47bc,
  RARITY_LEGENDARY: 0xff9800,

  // Element colors
  ELEMENT_FIRE: 0xff5722,
  ELEMENT_WATER: 0x2196f3,
  ELEMENT_EARTH: 0x4caf50,
  ELEMENT_AIR: 0xffeb3b,
  ELEMENT_LIGHT: 0xffc107,
  ELEMENT_DARK: 0x9c27b0,
  ELEMENT_DEFAULT: 0x888888,

  // Lineup labels
  LINEUP_FRONT: 0xf44336,
  LINEUP_BACK: 0x2196f3,

  // Card borders
  CARD_BORDER: 0x2e7d32,       // Updated to dark green to match theme

  // Panel and container backgrounds
  PANEL_BACKGROUND: 0x1b5e20,  // Dark green panel background (replaces hardcoded brown)
  CONTAINER_BACKGROUND: 0x263238, // Dark blue-grey for containers that shouldn't be green

  // Decorative elements
  DECORATION_MAGIC: 0x4fc3f7,

  // Shadow and effects
  SHADOW_COLOR: 0x000000,
} as const;

// Type-safe color access
export type ColorKey = keyof typeof Colors;