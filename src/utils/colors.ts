/**
 * Centralized color constants for the application
 * All hex color values used throughout the UI should be defined here
 * 
 * Structure:
 * 1. BASE_COLORS: Core palette colors (single source of truth)
 * 2. Semantic aliases: Descriptive names that reference base colors
 * 
 * Note: Colors are defined in hex format (#RRGGBB) which works in both CSS and PixiJS
 */

export const Colors = {
  // ============================================================================
  // BASE COLOR PALETTE - Single source of truth for all colors
  // ============================================================================
  
  // Neutrals
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GRAY_DARKEST: '#1A1A1A',
  GRAY_DARKER: '#2A2A2A',
  GRAY_DARK: '#3A3A3A',
  GRAY: '#666666',
  GRAY_MID: '#888888',
  GRAY_LIGHT: '#999999',
  GRAY_LIGHTER: '#AAAAAA',
  GRAY_LIGHTEST: '#CCCCCC',
  GRAY_SILVER: '#95A5A6',

  // Golds & Yellows
  GOLD_BRIGHT: '#FFD700',           // Pure gold
  GOLD: '#D4AF37',                  // Standard gold
  GOLD_DARK: '#8B6D31',             // Dark gold
  GOLD_ANTIQUE: '#D4B35F',          // Antique gold
  GOLD_ANCIENT: '#D9A441',          // Ancient gold
  GOLD_LIGHTER: '#A88A45',          // Lighter gold
  GOLD_BRONZE: '#8B6914',           // Bronze gold

  // Browns & Parchment
  PARCHMENT_LIGHTEST: '#F0E6D3',
  PARCHMENT_LIGHT: '#F5E6D3',
  PARCHMENT: '#E8D4B8',
  BROWN_LIGHTEST: '#B87333',
  BROWN_LIGHT: '#A0632A',
  BROWN_COPPER: '#6B4423',
  BROWN: '#8B4513',                 // Saddle brown
  BROWN_WOOD: '#5D4B37',
  BROWN_DARK_WOOD: '#5D4037',
  BROWN_DARKER: '#3D2817',
  BROWN_DARK: '#2A1810',
  BROWN_DARKEST: '#1A0F0A',

  // Ivories & Creams
  IVORY_SOFT: '#F0F4E8',
  SAGE_GREEN: '#A9C1A9',

  // Greens (Forest theme)
  FOREST_DARKEST: '#0F312A',
  FOREST_DARKER: '#182D29',
  FOREST_DARK: '#1C3A33',
  FOREST_EMERALD: '#2A4C44',
  FOREST_BORDER: '#3D5A50',
  FOREST_BORDER_ALT: '#4A6C5D',
  FOREST_STONE: '#729683',
  FOREST_LAKE: '#4CA5B3',
  GREEN_VIBRANT: '#5FAD56',
  GREEN_BRIGHT: '#26DE81',
  GREEN_MINT: '#4ECCA3',
  GREEN_LIGHT: '#90EE90',
  GREEN_DARK: '#2A7D2E',
  GREEN_FOREST_DARK: '#1A9E5A',

  // Blues
  BLUE_NAVY_DARKEST: '#0F0A1A',
  BLUE_NAVY_DARKER: '#0F0F1E',
  BLUE_NAVY_DARK: '#1A1A2E',
  BLUE_NAVY: '#16213E',
  BLUE_NAVY_ALT: '#1A1A3E',
  BLUE_MIDNIGHT: '#0F3460',
  BLUE_STEEL_DARK: '#4A5F7F',
  BLUE_STEEL: '#6B8CAE',
  BLUE_STEEL_LIGHT: '#8B9DC3',
  BLUE_STEEL_LIGHTER: '#5B9BD5',
  BLUE_SKY: '#4A90E2',
  BLUE_BRIGHT: '#3B82F6',
  CYAN_BRIGHT: '#5ECCD9',

  // Purples & Violets
  PURPLE_DARKEST: '#1A0F2E',
  PURPLE_DARKER: '#4A2F5F',
  PURPLE_DARK_ALT: '#6B4A7F',
  PURPLE: '#9B59B6',
  PURPLE_MYSTIC: '#9568A7',
  PURPLE_VIVID: '#B57EDC',
  PURPLE_BRIGHT: '#A55EEA',
  PURPLE_BRIGHTER: '#A855F7',
  LAVENDER_LIGHT: '#F5E6F3',
  LAVENDER: '#E8D4E8',

  // Reds & Oranges
  RED_DARKEST: '#8B1A1A',
  RED_DARK: '#C23616',
  RED_EMBER: '#C4502D',
  RED: '#E74C3C',
  RED_BRIGHT: '#FF6B6B',
  RED_LIGHT: '#FF8A80',
  RED_CRITICAL: '#FF5252',
  ORANGE_RUST_DARK: '#CC6600',
  ORANGE_RUST: '#A0632A',
  ORANGE: '#F39C12',
  ORANGE_EMBER: '#E05E33',
  ORANGE_FIRE: '#FF8800',
  ORANGE_LIGHT: '#FFBB66',
  YELLOW_FIRE: '#FFCC00',
  YELLOW_BRIGHT: '#FFEB3B',
  YELLOW_SUNLIGHT: '#F0E68C',
  YELLOW_GOLDEN_WIND: '#D4CE8D',

  // Teals & Cyans (additional blues/greens)
  TEAL_DARKEST: '#1A3E3E',
  TEAL_DARKER: '#2D2D5F',
  TEAL_PURPLE: '#6A4C93',

  // Special Effect Colors
  CYAN_LIGHT: '#A5E8F1',
  GREEN_HEAL_LIGHT: '#77DD77',
  GREEN_HEAL_BRIGHT: '#5AFFB9',
  GREEN_HEAL_PARTICLE: '#A5FFD6',
  GREEN_HEAL_LIGHTEST: '#CCFFEB',
  PURPLE_DEBUFF_DARK: '#6B469C',
  BLUE_DRAW: '#66B9FF',
  BLUE_RARE: '#5792C1',

  // Robot Theme Colors
  ROBOT_BG_DARK: '#0f111a',          // Dark background
  ROBOT_BG_MID: '#1f2633',           // Mid background
  ROBOT_CONTAINER: '#142229',        // Container background (rgba(20, 34, 41, 0.85))
  ROBOT_ELEMENT: '#222f3e',          // Robot element background
  ROBOT_CYAN: '#0ff3c6',             // Primary cyan
  ROBOT_CYAN_LIGHT: '#aefeff',       // Light cyan text
  ROBOT_CYAN_MID: '#7ee7c7',         // Mid cyan

  // Transparent base
  TRANSPARENT: 'rgba(0, 0, 0, 0)',

  // ============================================================================
  // SEMANTIC COLOR ALIASES - Descriptive names for specific use cases
  // ============================================================================

  // Background colors - Robot theme
  BACKGROUND_PRIMARY: '#0f111a',     // = ROBOT_BG_DARK
  BACKGROUND_SECONDARY: '#1f2633',   // = ROBOT_BG_MID

  // Text colors
  TEXT_PRIMARY: '#aefeff',           // = ROBOT_CYAN_LIGHT
  TEXT_SECONDARY: '#7ee7c7',         // = ROBOT_CYAN_MID
  TEXT_TERTIARY: '#0ff3c6',          // = ROBOT_CYAN
  TEXT_WHITE: '#aefeff',             // = ROBOT_CYAN_LIGHT
  TEXT_BUTTON: '#1f2633',            // = ROBOT_BG_MID (dark on cyan button)
  TEXT_ON_DARK: '#aefeff',           // = ROBOT_CYAN_LIGHT

  // Button colors
  BUTTON_PRIMARY: '#0ff3c6',         // = ROBOT_CYAN
  BUTTON_BORDER: '#0ff3c6',          // = ROBOT_CYAN
  BUTTON_HOVER: '#7ee7c7',           // = ROBOT_CYAN_MID

  // Card rarity colors
  RARITY_COMMON: '#729683',          // = FOREST_STONE
  RARITY_UNCOMMON: '#5FAD56',        // = GREEN_VIBRANT
  RARITY_RARE: '#5792C1',            // = BLUE_RARE
  RARITY_EPIC: '#9568A7',            // = PURPLE_MYSTIC
  RARITY_LEGENDARY: '#D9A441',       // = GOLD_ANCIENT

  // Element colors
  ELEMENT_FIRE: '#E05E33',           // = ORANGE_EMBER
  ELEMENT_WATER: '#4CA5B3',          // = FOREST_LAKE
  ELEMENT_EARTH: '#5FAD56',          // = GREEN_VIBRANT
  ELEMENT_AIR: '#D4CE8D',            // = YELLOW_GOLDEN_WIND
  ELEMENT_LIGHT: '#F0E68C',          // = YELLOW_SUNLIGHT
  ELEMENT_DARK: '#2F4F4F',
  ELEMENT_DEFAULT: '#729683',        // = FOREST_STONE

  // Lineup labels
  LINEUP_FRONT: '#E05E33',           // = ORANGE_EMBER
  LINEUP_BACK: '#4CA5B3',            // = FOREST_LAKE

  // Card elements
  CARD_BORDER: '#0ff3c6',            // = ROBOT_CYAN
  CARD_BACKGROUND: '#222f3e',        // = ROBOT_ELEMENT
  CARD_BACK: '#222f3e',              // = ROBOT_ELEMENT
  CARD_DISCARD: '#0ff3c6',           // = ROBOT_CYAN
  CARD_DECO_BG: '#1f2633',           // = ROBOT_BG_MID
  CARD_STAT_BG: '#222f3e',           // = ROBOT_ELEMENT
  CARD_AVATAR_BG: '#142229',         // = ROBOT_CONTAINER
  CARD_HP_BAR: '#0ff3c6',            // = ROBOT_CYAN
  CARD_ENERGY_BAR: '#0ff3c6',        // = ROBOT_CYAN
  CARD_BACK_DARK: '#0f111a',         // = ROBOT_BG_DARK
  CARD_BACK_PATTERN_1: '#222f3e',    // = ROBOT_ELEMENT
  CARD_BACK_PATTERN_2: '#0ff3c6',    // = ROBOT_CYAN

  // Panel and container backgrounds
  PANEL_BACKGROUND: '#222f3e',       // = ROBOT_ELEMENT
  CONTAINER_BACKGROUND: '#142229',   // = ROBOT_CONTAINER

  // UI elements
  UI_BACKGROUND: '#222f3e',          // = ROBOT_ELEMENT
  UI_BORDER: '#0ff3c6',              // = ROBOT_CYAN
  UI_BORDER_GLOW: '#0ff3c6',         // = ROBOT_CYAN
  ENERGY_ACTIVE: '#0ff3c6',          // = ROBOT_CYAN
  ENERGY_INACTIVE: '#222f3e',        // = ROBOT_ELEMENT
  ENERGY_TEXT: '#0ff3c6',            // = ROBOT_CYAN
  ENERGY_BAR: '#0ff3c6',             // = ROBOT_CYAN
  ENERGY_BAR_FULL: '#7ee7c7',        // = ROBOT_CYAN_MID

  // HP bar colors
  HP_BAR_BACKGROUND: '#3D5A50',      // = FOREST_BORDER
  HP_BAR_FILL: '#5FAD56',            // = GREEN_VIBRANT
  HP_BAR_BG: '#3D5A50',              // = FOREST_BORDER
  HP_HIGH: '#5FAD56',                // = GREEN_VIBRANT
  HP_MEDIUM: '#D9A441',              // = GOLD_ANCIENT
  HP_LOW: '#E05E33',                 // = ORANGE_EMBER
  HP_CRITICAL: '#FF5252',            // = RED_CRITICAL

  // Team colors
  TEAM_ALLY: '#5FAD56',              // = GREEN_VIBRANT
  TEAM_ENEMY: '#E05E33',             // = ORANGE_EMBER

  // Status messages
  SUCCESS: '#5FAD56',                // = GREEN_VIBRANT
  ERROR: '#E05E33',                  // = ORANGE_EMBER

  // Decorative elements
  DECORATION_MAGIC: '#0ff3c6',       // = ROBOT_CYAN
  DECORATION_FRAME: '#0ff3c6',       // = ROBOT_CYAN
  DECORATION_INNER_GLOW: '#7ee7c7',  // = ROBOT_CYAN_MID

  // Battle zone colors
  BATTLEFIELD_PRIMARY: '#0f111a',    // = ROBOT_BG_DARK
  BATTLEFIELD_SECONDARY: '#1f2633',  // = ROBOT_BG_MID
  BATTLEFIELD_ACCENT: '#0ff3c6',     // = ROBOT_CYAN
  BATTLEFIELD_BORDER: '#0ff3c6',     // = ROBOT_CYAN
  BATTLEFIELD_INNER_GLOW: '#7ee7c7', // = ROBOT_CYAN_MID
  BATTLE_MAGIC_AURA: '#0ff3c6',      // = ROBOT_CYAN
  BATTLE_ENERGY_GLOW: '#0ff3c6',     // = ROBOT_CYAN
  BATTLE_FRAME_GOLD: '#0ff3c6',      // = ROBOT_CYAN
  BATTLE_SHADOW_DEEP: '#0f111a',
  BATTLE_LOG_BG: 'rgba(15, 17, 26, 0.8)',

  // Stat colors
  STAT_HP: '#5FAD56',                // = GREEN_VIBRANT
  STAT_ATK: '#E05E33',               // = ORANGE_EMBER
  STAT_DEF: '#4CA5B3',               // = FOREST_LAKE
  STAT_AGI: '#D4CE8D',               // = YELLOW_GOLDEN_WIND
  STAT_CRIT_RATE: '#D9A441',         // = GOLD_ANCIENT
  STAT_CRIT_DMG: '#9568A7',          // = PURPLE_MYSTIC
  STAT_RES: '#729683',               // = FOREST_STONE
  STAT_DAMAGE: '#C4502D',            // = RED_EMBER
  STAT_MITIGATION: '#3D5A50',        // = FOREST_BORDER
  STAT_HIT: '#5FAD56',               // = GREEN_VIBRANT
  STAT_DODGE: '#A9C1A9',             // = SAGE_GREEN

  // Skill type colors
  SKILL_NORMAL: '#729683',           // = FOREST_STONE
  SKILL_ACTIVE: '#4CA5B3',           // = FOREST_LAKE
  SKILL_PASSIVE: '#5FAD56',          // = GREEN_VIBRANT

  // Difficulty colors
  DIFFICULTY_EASY: '#5FAD56',        // = GREEN_VIBRANT
  DIFFICULTY_NORMAL: '#D9A441',      // = GOLD_ANCIENT
  DIFFICULTY_HARD: '#E05E33',        // = ORANGE_EMBER
  DIFFICULTY_NIGHTMARE: '#9568A7',   // = PURPLE_MYSTIC

  // Overlay and modal colors
  OVERLAY_DARK: 'rgba(15, 17, 26, 0.85)',
  MODAL_BORDER: '#0ff3c6',           // = ROBOT_CYAN
  SHADOW_COLOR: 'rgba(15, 17, 26, 0.7)',

  // Hover and interaction states
  HOVER_TINT: 'rgba(15, 243, 198, 0.05)',
  HOVER_LIGHT: 'rgba(15, 243, 198, 0.1)',
  HOVER_LIGHTEST: 'rgba(15, 243, 198, 0.15)',
  HOVER_BLUE: '#0ff3c6',             // = ROBOT_CYAN
  ACTIVE_WHITE: '#aefeff',           // = ROBOT_CYAN_LIGHT

  // Rarity frame colors (for CharacterCard)
  FRAME_LEGENDARY: '#D9A441',        // = GOLD_ANCIENT
  FRAME_EPIC: '#9568A7',             // = PURPLE_MYSTIC
  FRAME_RARE: '#4CA5B3',             // = FOREST_LAKE
  FRAME_UNCOMMON: '#5FAD56',         // = GREEN_VIBRANT
  FRAME_COMMON: '#729683',           // = FOREST_STONE

  // Effect and animation colors
  EFFECT_WHITE: '#F0F4E8',           // = IVORY_SOFT
  EFFECT_GOLD: '#D9A441',            // = GOLD_ANCIENT
  EFFECT_YELLOW: '#F0E68C',          // = YELLOW_SUNLIGHT
  EFFECT_YELLOW_BRIGHT: '#FFEB3B',   // = YELLOW_BRIGHT
  EFFECT_FIRE_RED: '#E05E33',        // = ORANGE_EMBER
  EFFECT_FIRE_ORANGE: '#FF8800',     // = ORANGE_FIRE
  EFFECT_FIRE_YELLOW: '#FFCC00',     // = YELLOW_FIRE
  EFFECT_ICE_BLUE: '#5ECCD9',        // = CYAN_BRIGHT
  EFFECT_ICE_LIGHT: '#A5E8F1',       // = CYAN_LIGHT
  EFFECT_DAMAGE_RED: '#FF5252',      // = RED_CRITICAL
  EFFECT_DAMAGE_DARK: '#C4502D',     // = RED_EMBER
  EFFECT_DAMAGE_LIGHT: '#FF8A80',    // = RED_LIGHT
  EFFECT_HEAL_GREEN: '#77DD77',      // = GREEN_HEAL_LIGHT
  EFFECT_HEAL_BRIGHT: '#5AFFB9',     // = GREEN_HEAL_BRIGHT
  EFFECT_HEAL_PARTICLE: '#A5FFD6',   // = GREEN_HEAL_PARTICLE
  EFFECT_HEAL_LIGHT: '#CCFFEB',      // = GREEN_HEAL_LIGHTEST
  EFFECT_DEBUFF_PURPLE: '#9568A7',   // = PURPLE_MYSTIC
  EFFECT_DEBUFF_DARK: '#6B469C',     // = PURPLE_DEBUFF_DARK
  EFFECT_BUFF_BLUE: '#4CA5B3',       // = FOREST_LAKE
  EFFECT_BUFF_CYAN: '#5ECCD9',       // = CYAN_BRIGHT
  EFFECT_DRAW_GREEN: '#77DD77',      // = GREEN_HEAL_LIGHT
  EFFECT_DRAW_BLUE: '#66B9FF',       // = BLUE_DRAW
  EFFECT_DISCARD_RED: '#FF8A80',     // = RED_LIGHT
  EFFECT_PLAY_ORANGE: '#FFBB66',     // = ORANGE_LIGHT
  EFFECT_STROKE_BLACK: '#121F1D',
  EFFECT_STROKE_DARK_GREEN: '#0F312A', // = FOREST_DARKEST

  // Glow colors
  GLOW_COLOR: '#0ff3c6',             // = ROBOT_CYAN
  MYSTICAL_GLOW: '#0ff3c6',          // = ROBOT_CYAN
  EPIC_BORDER_GLOW: '#7ee7c7',       // = ROBOT_CYAN_MID
  HERO_GLOW_ORANGE: '#0ff3c6',       // = ROBOT_CYAN

  // Defeated/dimmed state
  DEFEATED_OVERLAY: 'rgba(15, 17, 26, 0.7)',
  DEFEATED_TEXT: '#0ff3c6',          // = ROBOT_CYAN
  DIMMED_OVERLAY: 'rgba(15, 17, 26, 0.6)',
  EMPTY_SLOT: '#222f3e',             // = ROBOT_ELEMENT

  // Sheen and lighting effects
  SHEEN_WHITE: 'rgba(240, 244, 232, 0.2)',
  WHITE_OVERLAY: 'rgba(240, 244, 232, 0.3)',
} as const;

// Type-safe color access
export type ColorKey = keyof typeof Colors;