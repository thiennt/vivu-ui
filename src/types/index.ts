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
  actions?: any[]; // Define specific actions/effects of the card
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
  active_effects: any[];
  equipped_skills: string[];
}

export interface CardInDeck {
  card_id?: string;
  position: number; // 1-50, shuffled
  card?: Card | BattleCard;
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

export interface CardBattleState {
  id: string;
  battle_type: 'pve' | 'pvp';
  status: 'open' | 'ongoing' | 'completed' | 'abandoned';
  current_turn: number;
  current_player: number;
  player1: {
    characters: CardBattleCharacter[];
    deck: CardBattleDeck;
  },
  player2: {
    characters: CardBattleCharacter[];
    deck: CardBattleDeck;
  },
  phase: 'start_turn' | 'draw_phase' | 'main_phase' | 'end_turn';
}

export interface BattleStageResponse {
  battle_id: string;
  stage_id: string;
  player1_id: string;
  status: 'created' | 'active' | 'completed' | 'cancelled';
  cards: Card[];
}

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
    active_effects: Array<any>;
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

export interface BattleMoveResponse {
  success: boolean;
  result: BattleActionResult;
  updated_state?: Partial<CardBattleState>;
  error?: string;
}

export interface BattleEndData {
  winner: number; // 1 or 2
  reason: 'defeat' | 'surrender' | 'timeout';
  finalState: CardBattleState;
}

export interface BattleRewards {
  gold: number;
  experience: number;
  items: any[];
  newLevel?: boolean;
  levelUpRewards?: any[];
}

// New interfaces for updated card battle API specification

export interface BattleActionResult {
  success: boolean;
  damage_dealt?: number;
  healing_done?: number;
  status_effects_applied?: any[];
  energy_change?: number;
  cards_drawn?: Card[];
  actions_performed: BattleLogEntry[];
}

export interface BattleLogEntry {
  type: 'draw_phase' | 'play_card' | 'discard_card' | 'end_turn' | 'damage' | 'heal' | 'status_effect';
  player_team: number;
  character_id?: string;
  card_id?: string;
  target_ids?: string[];
  result?: any;
  timestamp?: string;
  description?: string;
}

export interface DrawPhaseResult {
  success: boolean;
  drawn_cards: Card[];
  updated_hand: Card[];
  energy: number;
  status_effects: any[];
  actions_performed: BattleLogEntry[];
}

export interface BattlePhaseResult {
  success: boolean;
  phase: 'draw' | 'main' | 'end' | 'ai_turn';
  current_turn: number;
  current_player: number;
  ai_actions?: AIAction[];
  updated_state?: Partial<CardBattleState>;
  actions_performed: BattleLogEntry[];
}

export interface AIAction {
  type: 'draw_phase' | 'play_card' | 'discard_card' | 'end_turn';
  player_team: number;
  character_id?: string;
  card_id?: string;
  target_ids?: string[];
  result?: BattleActionResult;
  actions_performed: BattleLogEntry[];
}