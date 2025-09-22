export interface Player {
  id: string;
  username: string;
  level: number;
  experience: number;
  stats: PlayerStats;
  characters: Character[];
  lineup: Lineup;
  progress: GameProgress;
}

export interface PlayerStats {
  stamina: number;
  strength: number;
  agility: number;
  luck: number;
  intelligence: number;
  vitality: number;
}

export interface Character {
  id: string;
  name: string;
  tokenSymbol: string; // crypto coin/token symbol (e.g., BTC, ETH)
  avatar_url?: string; // URL to character avatar image
  rarity: CharacterRarity;
  level: number;
  hp: number;
  atk: number;
  def: number;
  agi: number;
  experience: number;
  stats: CharacterStats;
  skills: Skill[];
  element: Element;
  position?: LineupPosition;
}

export interface CharacterStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
  criticalRate: number;
  criticalDamage: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  damage: number;
  cooldown: number;
  manaCost: number;
  type: SkillType;
}

export interface Lineup {
  positions: (Character | null)[];
  maxSize: number;
}

export interface LineupPosition {
  x: number;
  y: number;
  row: number; // front, middle, back
}

export interface GameProgress {
  currentChapter: number;
  currentStage: number;
  completedStages: string[];
  unlockedDungeons: string[];
}

export interface Dungeon {
  id: string;
  name: string;
  description: string;
  stages: Stage[];
  requiredLevel: number;
  rewards: Reward[];
}


export interface Stage {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string,
  background_url: string,
  music_url: string | null,
  created_at: string,
  updated_at: string,
  parent_stage_id: string,
  energy_cost: number,
  max_attempts: number,
  is_completed: boolean;
  is_current: boolean;
  enemies: Enemy[],
  rewards: Reward[];
  stageNumber: number;
  difficulty: number;
  characters: Character[]; // Enemies or NPCs in this stage
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  stats: CharacterStats;
  skills: Skill[];
  element: Element;
}

export interface Reward {
  type: RewardType;
  itemId?: string;
  amount: number;
  rarity?: CharacterRarity;
}

export enum CharacterRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum Element {
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  AIR = 'air',
  LIGHT = 'light',
  DARK = 'dark'
}

export enum SkillType {
  ATTACK = 'attack',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff'
}

export enum RewardType {
  EXPERIENCE = 'experience',
  GOLD = 'gold',
  CHARACTER = 'character',
  ITEM = 'item'
}

export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  NIGHTMARE = 'nightmare'
}

export interface Card {
  id: string;
  name: string;
  group: string;
  description: string;
  icon_url?: string;
  card_type: string;
  energy_cost: number;
  rarity?: string;
  actions?: unknown[]; // Define specific actions/effects of the card
}

export interface BattleCard {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  group: CardType;
  rarity: CardRarity;
  effects: CardEffect[];
  cardType?: string; // Optional for backward compatibility
}

export interface CardEffect {
  type: CardEffectType;
  value: number;
  target: CardTarget;
  duration?: number; // for buffs/debuffs
}

export enum CardType {
  ATTACK = 'High Damage',
  HEAL = 'Healing & Support',
  BUFF = 'Buffs & Enhancements',
  DEBUFF = 'Control & Debuff',
  SPECIAL = 'Special'
}

export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum CardEffectType {
  DAMAGE = 'damage',
  HEAL = 'heal',
  SHIELD = 'shield',
  ATTACK_BUFF = 'attack_buff',
  DEFENSE_BUFF = 'defense_buff',
  SPEED_BUFF = 'speed_buff',
  ATTACK_DEBUFF = 'attack_debuff',
  DEFENSE_DEBUFF = 'defense_debuff',
  SPEED_DEBUFF = 'speed_debuff',
  ENERGY_GAIN = 'energy_gain'
}

export enum CardTarget {
  SINGLE_ALLY = 'single_ally',
  SINGLE_ENEMY = 'single_enemy',
  ALL_ALLIES = 'all_allies',
  ALL_ENEMIES = 'all_enemies',
  SELF = 'self',
  RANDOM_ENEMY = 'random_enemy'
}

export interface BattleCharacter {
  id: string;
  name: string;
  ticker: string;
  level: number;
  rarity: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  agi: number;
  currentBuffs: CardEffect[];
  avatar_url?: string;
}

export interface CardBattlePlayer {
  id: string;
  name: string;
  energy: number;
  maxEnergy: number;
  characters: BattleCharacter[];
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
}

export enum TurnPhase {
  DRAW = 'draw',
  MAIN = 'main',
  END = 'end'
}

export interface CardBattleCharacter {
  id: string;
  character_id: string;
  name?: string;
  avatar_url?: string;
  rarity?: string;
  team: number;
  position: number;
  max_hp: number;
  current_hp: number;
  atk: number;
  def: number;
  agi: number;
  crit_rate: number;
  crit_dmg: number;
  res: number;
  damage: number;
  mitigation: number;
  hit_rate: number;
  dodge: number;
  has_acted: boolean;
  active_effects: unknown[];
  equipped_skills: string[];
}

export interface CardInDeck {
  card_id?: string;
  position?: number; // 1-50, shuffled
  card?: Card;
}

export interface CardBattleDeck {
  id: string;
  player_team: number;
  deck_cards: CardInDeck[];
  hand_cards: CardInDeck[];
  discard_cards: CardInDeck[];
  current_energy: number;
  cards_drawn: number;
}

export interface CardBattlePlayerState {
  team: number;                             // 1 or 2 (team number)
  player_id?: string | null;                // Player ID (null for AI/NPC)
  characters: CardBattleCharacter[];        // Characters for this player/team
  deck: CardBattleDeck;                     // Deck state for this player/team
}

export interface CardBattleState {
  id: string;                               // Battle ID
  status: "ongoing" | "completed" | "surrendered" | "timeout";
  battle_type: "pvp" | "pve" | "training";
  current_turn: number;                     // Current turn number
  current_player: number;                   // 1 or 2 (team number)
  phase: 'start_turn' | 'draw_phase' | 'main_phase' | 'end_turn';
  winner_team?: number;                     // 1 or 2 if finished
  created_at: string;
  updated_at: string;
  completed_at?: string;

  players: CardBattlePlayerState[];         // Array for each player/team
}

// Character state for logging and snapshots
export interface CharacterState {
  id: string;
  team: number;
  max_hp: number;
  current_hp: number;
  atk: number;
  def: number;
  agi: number;
  crit_rate: number;
  crit_dmg: number;
  res: number;
  damage: number;
  mitigation: number;
  hit_rate: number;
  dodge: number;
  has_acted: boolean;
  active_effects: unknown[];
  equipped_skills: string[];
}

export type BattlePhaseName =
  | "start_turn"
  | "draw_phase"
  | "main_phase"
  | "end_turn"
  | "ai_turn";

// Enhanced player/actor information
export interface CardBattleLogPlayer {
  team: number;
  character_id?: string; // Null for player-wide actions
  player_id?: string;
}

// Complete card information for animations and UI
export interface CardBattleLogCard {
  id: string;
  name: string;
  group: string;
  description: string;
  icon_url?: string;
  card_type: string;
  energy_cost: number;
  rarity?: string;
  actions?: unknown[]; // full detail of card
}

// Impact event for detailed tracking
export interface LogImpact {
  type: 'damage' | 'heal' | 'effect' | 'energy' | 'status';
  value: number | string | object;
  meta?: unknown; // E.g., crit, miss, resistance, etc.
}

// Target with comprehensive state tracking
export interface CardBattleLogTarget {
  id: string;
  team: number;
  before: CharacterState; // State before effect
  after: CharacterState;  // State after effect
  impacts: LogImpact[];
}

// Action result information
export interface LogResult {
  success: boolean;
  reason?: string; // 'insufficient_energy', 'controlled', etc.
}

// Battle state snapshot for debugging/replay
export interface CardBattleLogBattleSnapshot {
  // For debugging/replay - can be a shallow snapshot
  characters: CharacterState[];
  turn: number;
  phase: string;
  current_player: number;
}

// Main CardBattleLog interface with enhanced structure
export interface CardBattleLog {
  id: string;
  phase: BattlePhaseName;
  action_type: string;                    // 'effect_trigger', 'draw_card', 'play_card', etc.
  actor: CardBattleLogPlayer;
  card?: CardBattleLogCard;
  targets?: CardBattleLogTarget[];
  drawn_cards?: CardBattleLogCard[];      // For draw actions - array of cards drawn
  impacts?: LogImpact[];                  // Top-level impacts for non-target actions
  result?: LogResult;
  before_state?: Partial<CardBattleLogBattleSnapshot>;
  after_state?: Partial<CardBattleLogBattleSnapshot>;
  animation_hint?: string;
  created_at: string;
  updated_at?: string;
}

export interface CardBattlePhaseResponse {
  phase: BattlePhaseName;
  logs: CardBattleLog[];                  // Ordered array for step-by-step animation
  after_state?: CardBattleLogBattleSnapshot; // (Optional) Partial/full battle state after all logs
}

export interface BattleStageResponse {
  battle_id: string;
  stage_id: string;
  player1_id: string;
  status: 'created' | 'active' | 'completed' | 'cancelled';
  cards: Card[];
}

// Legacy interface for backward compatibility - deprecated in favor of CardBattleState
// TODO: Remove this interface after migrating all code to use CardBattleState
// @deprecated Use CardBattleState instead
export interface BattleStateResponse {
  id: string;
  battle_type: string;
  status: string;
  current_turn: number;
  current_player: number;
  characters: Array<{
    id: string;
    character_id: string;
    team: string;
    position: string;
    max_hp: number;
    current_hp: number;
    atk: number;
    def: number;
    agi: number;
    crit_rate: number;
    crit_dmg: number;
    res: number;
    damage: number;
    mitigation: number;
    hit_rate: number;
    dodge: number;
    has_acted: boolean;
    active_effects: Array<unknown>;
    equipped_skills: Array<string>;
  }>;
  decks: Array<{
    id: string;
    player_team: string;
    deck_cards: Array<{
      card_id: string;
      position: number;
    }>;
    hand_cards: Array<string>;
    current_energy: number;
    cards_drawn: number;
   }>;
  phase: string;
};

export interface BattleApiResponse {
  battleId: string;
  status: string;
}

export interface BattleMoveData {
  action: 'play_card' | 'discard_card' | 'end_turn';
  card_id?: string;
  character_id?: string;
  target_ids?: string[];
}

// Standardized API response format for CardBattle APIs
export interface CardBattleApiResponse<T = any> {
  success: boolean;                   // Boolean: was the request successful?
  code: number;                       // HTTP status code (repeated here for clarity)
  message: string;                    // Human-readable message
  data: T | null;                     // Main payload (object, array, or null)
  errors: string[] | null;            // Array of errors, or null if no error
  meta?: any;                         // (Optional) Extra info: pagination, server time, etc.
}

// Updated existing API response types to use the new standardized format
export type BattleMoveResponse = CardBattleApiResponse<CardBattleLog[]>;
export type DrawPhaseResult = CardBattleApiResponse<CardBattleLog[]>;
export type BattlePhaseResult = CardBattleApiResponse<CardBattleLog[]>;

export interface BattleEndData {
  winner: number; // 1 or 2
  reason: 'defeat' | 'surrender' | 'timeout';
  finalState: CardBattleState;
}

export interface BattleRewards {
  gold: number;
  experience: number;
  items: unknown[];
  newLevel?: boolean;
  levelUpRewards?: unknown[];
}

// New interfaces for updated card battle API specification

export interface BattleActionResult {
  success: boolean;
  damage_dealt?: number;
  healing_done?: number;
  status_effects_applied?: unknown[];
  energy_change?: number;
  cards_drawn?: Card[];
  actions_performed: BattleLogEntry[];
  battle_logs?: BattleLogEntry[]; // Legacy support for backward compatibility
}

export interface BattleLogEntry {
  type: 'draw_phase' | 'play_card' | 'discard_card' | 'end_turn' | 'damage' | 'heal' | 'status_effect';
  player_team: number;
  character_id?: string;
  card_id?: string;
  target_ids?: string[];
  result?: unknown;
  timestamp?: string;
  description?: string;
}

export interface AIAction {
  type: 'draw_phase' | 'play_card' | 'discard_card' | 'end_turn';
  player_team: number;
  character_id?: string;
  card_id?: string;
  target_ids?: string[];
  result?: BattleActionResult;
  actions_performed: BattleLogEntry[];
  battle_logs?: BattleLogEntry[]; // Legacy support for backward compatibility
}