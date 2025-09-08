export interface Player {
  id: string;
  username: string;
  level: number;
  experience: number;
  stats: PlayerStats;
  characters: Character[];
  formation: Formation;
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
  position?: FormationPosition;
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

export interface Formation {
  positions: (Character | null)[];
  maxSize: number;
}

export interface FormationPosition {
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