/**
 * Centralized color constants for the application
 * All hex color values used throughout the UI should be defined here
 * "Ancient Forest" theme: Deep forest greens with golden accents
 * Optimized for Lư Trung Hỏa (Fire) element alignment for dev born in 1987
 */

export const Colors = {
  // Background colors - Ancient Forest theme
  BACKGROUND_PRIMARY: '#1C3A33',     // Deep Forest Green - main background
  BACKGROUND_SECONDARY: '#2A4C44',   // Emerald Forest - secondary backgrounds

  // Text colors - High contrast for dark green backgrounds
  TEXT_PRIMARY: '#F0F4E8',           // Soft Ivory - main text
  TEXT_SECONDARY: '#A9C1A9',         // Sage Green - secondary text
  TEXT_TERTIARY: '#D4B35F',          // Antique Gold - highlighted text
  TEXT_WHITE: '#FFFFFF',             // Pure White - for maximum contrast
  TEXT_BUTTON: '#F0F4E8',            // Soft Ivory - button text

  // Button colors - Wood and Gold theme
  BUTTON_PRIMARY: '#8B6D31',         // Ancient Gold - primary button
  BUTTON_BORDER: '#4A6C5D',          // Forest Border - button borders
  BUTTON_HOVER: '#A88A45',           // Lighter Gold - hover state

  // Card rarity colors - Natural progression
  RARITY_COMMON: '#729683',          // Forest Stone - common
  RARITY_UNCOMMON: '#5FAD56',        // Vibrant Leaf - uncommon
  RARITY_RARE: '#5792C1',            // Azure Sky - rare (touches of sky through canopy)
  RARITY_EPIC: '#9568A7',            // Mystical Orchid - epic
  RARITY_LEGENDARY: '#D9A441',       // Ancient Gold - legendary

  // Element colors - Natural forces
  ELEMENT_FIRE: '#E05E33',           // Ember Orange - fire
  ELEMENT_WATER: '#4CA5B3',          // Forest Lake - water
  ELEMENT_EARTH: '#5FAD56',          // Vibrant Leaf - earth
  ELEMENT_AIR: '#D4CE8D',            // Golden Wind - air
  ELEMENT_LIGHT: '#F0E68C',          // Sunlight - light
  ELEMENT_DARK: '#2F4F4F',           // Dark Forest - dark
  ELEMENT_DEFAULT: '#729683',        // Forest Stone - default

  // Lineup labels - Position indicators
  LINEUP_FRONT: '#E05E33',           // Ember Orange - front line
  LINEUP_BACK: '#4CA5B3',            // Forest Lake - back line

  // Card borders and backgrounds
  CARD_BORDER: '#3D5A50',            // Deep Forest Border
  CARD_BACKGROUND: '#2A4C44',        // Emerald Forest - card background
  CARD_BACK: '#8B6D31',              // Ancient Gold - card back

  // Panel and container backgrounds
  PANEL_BACKGROUND: '#2A4C44',       // Emerald Forest - panel background
  CONTAINER_BACKGROUND: '#1C3A33',   // Deep Forest - container background

  // UI elements
  ENERGY_ACTIVE: '#D9A441',          // Ancient Gold - active energy
  ENERGY_INACTIVE: '#3D5A50',        // Deep Forest Gray - inactive energy
  HP_BAR_BACKGROUND: '#3D5A50',      // Deep Forest Gray - HP background
  HP_BAR_FILL: '#5FAD56',            // Vibrant Leaf - HP fill
  HP_BAR_BG: '#3D5A50',              // Deep Forest Gray - HP background (alias)
  TEXT_ON_DARK: '#F0F4E8',           // Soft Ivory - text on dark backgrounds

  // Card Battle UI colors
  UI_BACKGROUND: '#2A4C44',          // Emerald Forest - UI background
  UI_BORDER: '#3D5A50',              // Deep Forest Border
  UI_BORDER_GLOW: '#D9A441',         // Ancient Gold - border glow
  CARD_DISCARD: '#3D5A50',           // Deep Forest Gray - discard pile
  TEAM_ALLY: '#5FAD56',              // Vibrant Leaf - ally team
  TEAM_ENEMY: '#E05E33',             // Ember Orange - enemy team
  ENERGY_TEXT: '#D9A441',            // Ancient Gold - energy text
  SUCCESS: '#5FAD56',                // Vibrant Leaf - success message
  ERROR: '#E05E33',                  // Ember Orange - error message

  // Decorative elements
  DECORATION_MAGIC: '#9568A7',       // Mystical Orchid - magical elements
  DECORATION_FRAME: '#D9A441',       // Ancient Gold - frame accents
  DECORATION_INNER_GLOW: '#F0E68C',  // Sunlight - inner glow

  // Battle zone specific colors
  BATTLEFIELD_PRIMARY: '#182D29',    // Darkest Forest - battlefield primary
  BATTLEFIELD_SECONDARY: '#1C3A33',  // Deep Forest - battlefield secondary
  BATTLEFIELD_ACCENT: '#D9A441',     // Ancient Gold - battlefield accent
  BATTLEFIELD_BORDER: '#8B6D31',     // Ancient Gold Dark - battlefield border
  BATTLEFIELD_INNER_GLOW: '#F0E68C', // Sunlight - battlefield inner glow

  // Enhanced battle effects
  BATTLE_MAGIC_AURA: '#9568A7',      // Mystical Orchid - magic aura
  BATTLE_ENERGY_GLOW: '#D9A441',     // Ancient Gold - energy glow
  BATTLE_FRAME_GOLD: '#D9A441',      // Ancient Gold - frame gold
  BATTLE_SHADOW_DEEP: '#121F1D',     // Darkest Shadow - deep shadow

  // Shadow and effects
  SHADOW_COLOR: 'rgba(18, 31, 29, 0.7)', // Darkest Shadow - shadow color
  GLOW_COLOR: '#D9A441',             // Ancient Gold - glow color
  MYSTICAL_GLOW: '#9568A7',          // Mystical Orchid - mystical glow
  EPIC_BORDER_GLOW: '#D4CE8D',       // Golden Wind - epic border glow

  // Stat colors - Core stats
  STAT_HP: '#5FAD56',                // Vibrant Leaf - HP
  STAT_ATK: '#E05E33',               // Ember Orange - Attack
  STAT_DEF: '#4CA5B3',               // Forest Lake - Defense
  STAT_AGI: '#D4CE8D',               // Golden Wind - Agility
  STAT_CRIT_RATE: '#D9A441',         // Ancient Gold - Critical Rate
  STAT_CRIT_DMG: '#9568A7',          // Mystical Orchid - Critical Damage
  STAT_RES: '#729683',               // Forest Stone - Resistance
  STAT_DAMAGE: '#C4502D',            // Deep Ember - Damage
  STAT_MITIGATION: '#3D5A50',        // Deep Forest Border - Mitigation
  STAT_HIT: '#5FAD56',               // Vibrant Leaf - Hit Rate
  STAT_DODGE: '#A9C1A9',             // Sage Green - Dodge

  // Skill type colors
  SKILL_NORMAL: '#729683',           // Forest Stone - Normal attack
  SKILL_ACTIVE: '#4CA5B3',           // Forest Lake - Active skill
  SKILL_PASSIVE: '#5FAD56',          // Vibrant Leaf - Passive skill

  // Difficulty colors
  DIFFICULTY_EASY: '#5FAD56',        // Vibrant Leaf - Easy
  DIFFICULTY_NORMAL: '#D9A441',      // Ancient Gold - Normal
  DIFFICULTY_HARD: '#E05E33',        // Ember Orange - Hard
  DIFFICULTY_NIGHTMARE: '#9568A7',   // Mystical Orchid - Nightmare

  // HP bar colors based on percentage
  HP_HIGH: '#5FAD56',                // Vibrant Leaf - HP > 50%
  HP_MEDIUM: '#D9A441',              // Ancient Gold - HP 25-50%
  HP_LOW: '#E05E33',                 // Ember Orange - HP < 25%
  HP_CRITICAL: '#FF5252',            // Bright Red - Critical HP

  // Energy colors
  ENERGY_BAR: '#4CA5B3',             // Forest Lake - Energy bar
  ENERGY_BAR_FULL: '#5ECCD9',        // Bright Cyan - Full energy bar

  // Overlay and modal colors
  OVERLAY_DARK: 'rgba(18, 31, 29, 0.8)', // Darkest Shadow - overlay
  MODAL_BORDER: '#8B6D31',           // Ancient Gold Dark - modal border

  // Hover and interaction states
  HOVER_TINT: 'rgba(240, 244, 232, 0.05)', // Soft Ivory - hover tint
  HOVER_LIGHT: 'rgba(240, 244, 232, 0.1)',
  HOVER_LIGHTEST: 'rgba(240, 244, 232, 0.15)',
  HOVER_BLUE: '#4CA5B3',             // Forest Lake - blue hover
  ACTIVE_WHITE: '#F0F4E8',           // Soft Ivory - active white

  // Rarity frame colors (for CharacterCard)
  FRAME_LEGENDARY: '#D9A441',        // Ancient Gold - legendary frame
  FRAME_EPIC: '#9568A7',             // Mystical Orchid - epic frame
  FRAME_RARE: '#4CA5B3',             // Forest Lake - rare frame
  FRAME_UNCOMMON: '#5FAD56',         // Vibrant Leaf - uncommon frame
  FRAME_COMMON: '#729683',           // Forest Stone - common frame

  // Card decorative backgrounds
  CARD_DECO_BG: '#182D29',           // Darkest Forest - card decorative background
  CARD_STAT_BG: '#2A4C44',           // Emerald Forest - stat medallion background
  CARD_AVATAR_BG: '#3D5A50',         // Deep Forest Border - avatar background
  CARD_HP_BAR: '#E05E33',            // Ember Orange - HP bar
  CARD_ENERGY_BAR: '#5ECCD9',        // Bright Cyan - energy bar

  // Card back colors (FaceDownCard)
  CARD_BACK_DARK: '#1C3A33',         // Deep Forest - card back dark
  CARD_BACK_PATTERN_1: '#2A4C44',    // Emerald Forest - pattern 1
  CARD_BACK_PATTERN_2: '#3D5A50',    // Deep Forest Border - pattern 2

  // Effect and animation colors
  EFFECT_WHITE: '#F0F4E8',           // Soft Ivory - white effect
  EFFECT_GOLD: '#D9A441',            // Ancient Gold - gold effect
  EFFECT_YELLOW: '#F0E68C',          // Sunlight - yellow effect
  EFFECT_YELLOW_BRIGHT: '#FFEB3B',   // Bright Yellow - bright yellow effect
  EFFECT_FIRE_RED: '#E05E33',        // Ember Orange - fire red
  EFFECT_FIRE_ORANGE: '#FF8800',     // Bright Orange - fire orange
  EFFECT_FIRE_YELLOW: '#FFCC00',     // Fire Yellow - fire yellow
  EFFECT_ICE_BLUE: '#5ECCD9',        // Bright Cyan - ice blue
  EFFECT_ICE_LIGHT: '#A5E8F1',       // Light Cyan - light ice
  EFFECT_DAMAGE_RED: '#FF5252',      // Bright Red - damage red
  EFFECT_DAMAGE_DARK: '#C4502D',     // Deep Ember - dark damage
  EFFECT_DAMAGE_LIGHT: '#FF8A80',    // Light Red - light damage
  EFFECT_HEAL_GREEN: '#77DD77',      // Light Green - heal green
  EFFECT_HEAL_BRIGHT: '#5AFFB9',     // Bright Green - bright heal
  EFFECT_HEAL_PARTICLE: '#A5FFD6',   // Pale Green - heal particle
  EFFECT_HEAL_LIGHT: '#CCFFEB',      // Lightest Green - light heal
  EFFECT_DEBUFF_PURPLE: '#9568A7',   // Mystical Orchid - debuff
  EFFECT_DEBUFF_DARK: '#6B469C',     // Dark Purple - dark debuff
  EFFECT_BUFF_BLUE: '#4CA5B3',       // Forest Lake - buff
  EFFECT_BUFF_CYAN: '#5ECCD9',       // Bright Cyan - cyan buff
  EFFECT_DRAW_GREEN: '#77DD77',      // Light Green - draw green
  EFFECT_DRAW_BLUE: '#66B9FF',       // Light Blue - draw blue
  EFFECT_DISCARD_RED: '#FF8A80',     // Light Red - discard red
  EFFECT_PLAY_ORANGE: '#FFBB66',     // Light Orange - play orange
  EFFECT_STROKE_BLACK: '#121F1D',    // Darkest Shadow - stroke black
  EFFECT_STROKE_DARK_GREEN: '#0F312A', // Darkest Green - dark green stroke

  // Defeated/dimmed state
  DEFEATED_OVERLAY: 'rgba(18, 31, 29, 0.7)', // Darkest Shadow - defeated overlay
  DEFEATED_TEXT: '#D9A441',          // Ancient Gold - defeated text
  DIMMED_OVERLAY: 'rgba(18, 31, 29, 0.6)', // Darkest Shadow - dimmed overlay
  EMPTY_SLOT: '#2A4C44',             // Emerald Forest - empty slot

  // Sheen and lighting effects
  SHEEN_WHITE: 'rgba(240, 244, 232, 0.2)', // Soft Ivory - sheen white
  WHITE_OVERLAY: 'rgba(240, 244, 232, 0.3)', // Soft Ivory - white overlay

  // Battle log zone
  BATTLE_LOG_BG: 'rgba(18, 31, 29, 0.8)', // Darkest Shadow - battle log background

  // Hero card glow
  HERO_GLOW_ORANGE: '#D9A441',       // Ancient Gold - hero card glow

  // Transparent/invisible
  TRANSPARENT: 'rgba(0, 0, 0, 0)',   // True transparent
} as const;

// Type-safe color access
export type ColorKey = keyof typeof Colors;