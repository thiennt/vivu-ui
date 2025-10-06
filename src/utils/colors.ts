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

  // Card borders and backgrounds - More realistic card colors
  CARD_BORDER: '#2d1810',            // Darker border for better definition
  CARD_BACKGROUND: '#f5f0e8',        // Cream/parchment color for cards
  CARD_BACK: '#8b4513',             // Card back color

  // Panel and container backgrounds - Orange theme
  PANEL_BACKGROUND: '#8b4513',       // Saddle brown
  CONTAINER_BACKGROUND: '#a0522d',    // Sienna

  // UI elements
  ENERGY_ACTIVE: '#ffa500',          // Active energy color
  ENERGY_INACTIVE: '#808080',        // Inactive energy color
  HP_BAR_BACKGROUND: '#666666',      // HP bar background

  // use green as fill for HP bar to indicate health
  HP_BAR_FILL: '#4caf50',           // HP bar fill
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

  // Stat colors - Core stats
  STAT_HP: '#4caf50',                // HP - Green
  STAT_ATK: '#f44336',               // Attack - Red
  STAT_DEF: '#2196f3',               // Defense - Blue
  STAT_AGI: '#ffeb3b',               // Agility - Yellow
  STAT_CRIT_RATE: '#ff9800',         // Crit Rate - Orange
  STAT_CRIT_DMG: '#9c27b0',          // Crit Damage - Purple
  STAT_RES: '#607d8b',               // Resistance - Blue Grey
  STAT_DAMAGE: '#ff5722',            // Damage - Deep Orange
  STAT_MITIGATION: '#795548',        // Mitigation - Brown
  STAT_HIT: '#4caf50',               // Hit Rate - Green
  STAT_DODGE: '#9e9e9e',             // Dodge - Grey

  // Skill type colors
  SKILL_NORMAL: '#9e9e9e',           // Normal attack - Grey
  SKILL_ACTIVE: '#2196f3',           // Active skill - Blue
  SKILL_PASSIVE: '#4caf50',          // Passive skill - Green

  // Difficulty colors
  DIFFICULTY_EASY: '#4caf50',        // Easy - Green
  DIFFICULTY_NORMAL: '#ff9800',      // Normal - Orange
  DIFFICULTY_HARD: '#ff4500',        // Hard - Orange Red
  DIFFICULTY_NIGHTMARE: '#9c27b0',   // Nightmare - Purple

  // HP bar colors based on percentage
  HP_HIGH: '#4caf50',                // HP > 50% - Green
  HP_MEDIUM: '#ff9800',              // HP 25-50% - Orange
  HP_LOW: '#f44336',                 // HP < 25% - Red
  HP_CRITICAL: '#ff4444',            // Critical HP - Bright Red

  // Energy colors
  ENERGY_BAR: '#2196f3',             // Energy bar - Blue
  ENERGY_BAR_FULL: '#00b8d4',        // Full energy - Cyan

  // Overlay and modal colors
  OVERLAY_DARK: '#000000',           // Dark overlay (used with alpha)
  MODAL_BORDER: '#ff4444',           // Modal border for errors

  // Hover and interaction states
  HOVER_TINT: '#cccccc',             // Hover tint
  HOVER_LIGHT: '#dddddd',            // Light hover
  HOVER_LIGHTEST: '#e8e8e8',         // Lightest hover
  HOVER_BLUE: '#e0e0ff',             // Blue-tinted hover
  ACTIVE_WHITE: '#ffffff',           // Active/normal state

  // Rarity frame colors (for CharacterCard)
  FRAME_LEGENDARY: '#ffd700',        // Gold
  FRAME_EPIC: '#c0c0c0',             // Silver
  FRAME_RARE: '#cd7f32',             // Bronze
  FRAME_UNCOMMON: '#7fffd4',         // Aquamarine
  FRAME_COMMON: '#b0b0b0',           // Gray

  // Card decorative backgrounds
  CARD_DECO_BG: '#1a2337',           // Deep blue decorative background
  CARD_STAT_BG: '#222a38',           // Stat medallion background
  CARD_AVATAR_BG: '#222a38',         // Avatar circle background
  CARD_HP_BAR: '#e53935',            // HP bar fill - red
  CARD_ENERGY_BAR: '#00b8d4',        // Energy bar fill - cyan

  // Card back colors (FaceDownCard)
  CARD_BACK_DARK: '#2c3e50',         // Dark blue-gray
  CARD_BACK_PATTERN_1: '#34495e',    // Pattern color 1
  CARD_BACK_PATTERN_2: '#3d566e',    // Pattern color 2

  // Effect and animation colors
  EFFECT_WHITE: '#ffffff',           // White effect
  EFFECT_GOLD: '#ffd700',            // Gold effect/glow
  EFFECT_YELLOW: '#ffff00',          // Yellow effect
  EFFECT_YELLOW_BRIGHT: '#ffdd00',   // Bright yellow
  EFFECT_FIRE_RED: '#ff0000',        // Fire red
  EFFECT_FIRE_ORANGE: '#ff8800',     // Fire orange
  EFFECT_FIRE_YELLOW: '#ffdd00',     // Fire yellow
  EFFECT_ICE_BLUE: '#88ddff',        // Ice blue
  EFFECT_ICE_LIGHT: '#aaeeFF',       // Light ice
  EFFECT_DAMAGE_RED: '#ff4444',      // Damage red
  EFFECT_DAMAGE_DARK: '#ff3333',     // Dark damage red
  EFFECT_DAMAGE_LIGHT: '#ff6666',    // Light damage red
  EFFECT_HEAL_GREEN: '#44ff88',      // Heal green
  EFFECT_HEAL_BRIGHT: '#44ff44',     // Bright heal green
  EFFECT_HEAL_PARTICLE: '#88ffaa',   // Heal particle
  EFFECT_HEAL_LIGHT: '#aaffcc',      // Light heal
  EFFECT_DEBUFF_PURPLE: '#8844ff',   // Debuff purple
  EFFECT_DEBUFF_DARK: '#6622dd',     // Dark debuff purple
  EFFECT_BUFF_BLUE: '#44aaff',       // Buff blue
  EFFECT_BUFF_CYAN: '#66ccff',       // Buff cyan
  EFFECT_DRAW_GREEN: '#66ff66',      // Card draw green
  EFFECT_DRAW_BLUE: '#6699ff',       // Card draw blue
  EFFECT_DISCARD_RED: '#ff6666',     // Card discard red
  EFFECT_PLAY_ORANGE: '#ff9966',     // Card play orange
  EFFECT_STROKE_BLACK: '#000000',    // Stroke black
  EFFECT_STROKE_DARK_GREEN: '#006633', // Dark green stroke

  // Defeated/dimmed state
  DEFEATED_OVERLAY: '#000000',       // Defeated overlay (used with alpha)
  DEFEATED_TEXT: '#ffd700',          // Defeated text - gold
  DIMMED_OVERLAY: '#000000',         // Dimmed overlay
  EMPTY_SLOT: '#424242',             // Empty equipment slot

  // Sheen and lighting effects
  SHEEN_WHITE: '#ffffff',            // White sheen
  WHITE_OVERLAY: '#ffffff',          // White overlay

  // Battle log zone
  BATTLE_LOG_BG: '#000000',          // Battle log background (used with alpha)

  // Hero card glow
  HERO_GLOW_ORANGE: '#ffa000',       // Hero card orange glow

  // Transparent/invisible
  TRANSPARENT: '#000000',            // Used with alpha: 0 for transparent backgrounds
} as const;

// Type-safe color access
export type ColorKey = keyof typeof Colors;