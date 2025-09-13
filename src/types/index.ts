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
  rarity: CharacterRarity;
  level: number;
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
  is_boss_stage: false,
  enemies: Enemy[],
  rewards: Reward[];
  stageNumber: number;
  difficulty: number;
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

// Card Battle System Types
export interface BattleCard {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cardType: CardType;
  rarity: CardRarity;
  effects: CardEffect[];
  artwork?: string;
}

export interface CardEffect {
  type: CardEffectType;
  value: number;
  target: CardTarget;
  duration?: number; // for buffs/debuffs
}

export enum CardType {
  ATTACK = 'attack',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  SPECIAL = 'special'
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
  deck: BattleCard[];
  hand: BattleCard[];
  discardPile: BattleCard[];
}

export interface CardBattleState {
  player1: CardBattlePlayer;
  player2: CardBattlePlayer;
  currentTurn: number;
  activePlayer: number; // 1 or 2
  turnPhase: TurnPhase;
  winner?: number;
}

export enum TurnPhase {
  DRAW = 'draw',
  MAIN = 'main',
  END = 'end'
}