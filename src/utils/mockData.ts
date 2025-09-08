import { CharacterRarity, Element, SkillType, RewardType, Difficulty } from '../types';

// ---- Skills ----
export const mockSkills = [
  {
    id: "S1",
    name: "Normal Attack",
    description: "Deals 100% damage to one enemy.",
    skill_type: "normal_attack",
    level: 1,
    actions: [
      {
        type: "damage",
        target_type: "single_enemy",
        amount_min: 100,
        amount_max: 100,
        damage_type: "physical",
        can_crit: true
      }
    ]
  },
  {
    id: "S2",
    name: "Curse Strike",
    description: "Deals 300-350% damage to the enemy with the lowest HP and applies [Curse].",
    skill_type: "active_skill",
    level: 1,
    actions: [
      {
        type: "damage",
        target_type: "lowest_hp",
        amount_min: 300,
        amount_max: 350,
        damage_type: "magical",
        can_crit: true
      },
      {
        type: "debuff",
        target_type: "lowest_hp",
        effect_name: "curse",
        effect_chance: 100,
        effect_duration: 3
      }
    ]
  },
  {
    id: "S3",
    name: "Diamond Skin",
    description: "Atk +90%, HP +50%",
    skill_type: "passive_skill",
    level: 1,
    actions: [
      {
        type: "buff",
        target_type: "self",
        stat: "atk",
        amount_min: 8,
        amount_max: 12
      }
    ]
  }
];

// ---- Characters (Crypto Inspired) ----
export const mockCharacters = [
  {
    id: "1",
    name: "BTC Paladin",
    tokenSymbol: "BTC",
    rarity: CharacterRarity.LEGENDARY,
    level: 12,
    experience: 1800,
    stats: {
      health: 170,
      attack: 32,
      defense: 24,
      speed: 10,
      criticalRate: 8,
      criticalDamage: 120
    },
    skills: [
      { id: "S1", name: "Normal Attack", description: "Deals 100% damage to one enemy.", damage: 100, cooldown: 0, manaCost: 0, type: SkillType.ATTACK },
      { id: "S2", name: "Curse Strike", description: "Deals 300-350% damage to the enemy with the lowest HP and applies [Curse].", damage: 325, cooldown: 3, manaCost: 20, type: SkillType.ATTACK },
      { id: "S3", name: "Diamond Skin", description: "Atk +90%, HP +50%", damage: 0, cooldown: 5, manaCost: 30, type: SkillType.BUFF }
    ],
    element: Element.EARTH,
    position: { x: 0, y: 0, row: 0 }
  },
  {
    id: "2",
    name: "ETH Mage",
    tokenSymbol: "ETH",
    rarity: CharacterRarity.EPIC,
    level: 10,
    experience: 1500,
    stats: {
      health: 110,
      attack: 38,
      defense: 10,
      speed: 14,
      criticalRate: 15,
      criticalDamage: 135
    },
    skills: [
      { id: "S1", name: "Normal Attack", description: "Deals 100% damage to one enemy.", damage: 100, cooldown: 0, manaCost: 0, type: SkillType.ATTACK },
      { id: "S2", name: "Curse Strike", description: "Deals 300-350% damage to the enemy with the lowest HP and applies [Curse].", damage: 325, cooldown: 3, manaCost: 20, type: SkillType.ATTACK }
    ],
    element: Element.FIRE,
    position: { x: 1, y: 0, row: 0 }
  },
  {
    id: "3",
    name: "ADA Guardian",
    tokenSymbol: "ADA",
    rarity: CharacterRarity.RARE,
    level: 11,
    experience: 1400,
    stats: {
      health: 160,
      attack: 24,
      defense: 28,
      speed: 11,
      criticalRate: 8,
      criticalDamage: 125
    },
    skills: [
      { id: "S1", name: "Normal Attack", description: "Deals 100% damage to one enemy.", damage: 100, cooldown: 0, manaCost: 0, type: SkillType.ATTACK },
      { id: "S3", name: "Diamond Skin", description: "Atk +90%, HP +50%", damage: 0, cooldown: 5, manaCost: 30, type: SkillType.BUFF }
    ],
    element: Element.WATER,
    position: { x: 2, y: 0, row: 0 }
  },
  {
    id: "4",
    name: "SOL Archer",
    tokenSymbol: "SOL",
    rarity: CharacterRarity.RARE,
    level: 9,
    experience: 1100,
    stats: {
      health: 105,
      attack: 35,
      defense: 12,
      speed: 18,
      criticalRate: 15,
      criticalDamage: 145
    },
    skills: [
      { id: "S1", name: "Normal Attack", description: "Deals 100% damage to one enemy.", damage: 100, cooldown: 0, manaCost: 0, type: SkillType.ATTACK },
      { id: "S2", name: "Curse Strike", description: "Deals 300-350% damage to the enemy with the lowest HP and applies [Curse].", damage: 325, cooldown: 3, manaCost: 20, type: SkillType.ATTACK }
    ],
    element: Element.AIR,
    position: { x: 0, y: 1, row: 1 }
  },
  {
    id: "5",
    name: "DOGE Warrior",
    tokenSymbol: "DOGE",
    rarity: CharacterRarity.UNCOMMON,
    level: 8,
    experience: 900,
    stats: {
      health: 145,
      attack: 29,
      defense: 19,
      speed: 15,
      criticalRate: 11,
      criticalDamage: 127
    },
    skills: [
      { id: "S1", name: "Normal Attack", description: "Deals 100% damage to one enemy.", damage: 100, cooldown: 0, manaCost: 0, type: SkillType.ATTACK },
      { id: "S3", name: "Diamond Skin", description: "Atk +90%, HP +50%", damage: 0, cooldown: 5, manaCost: 30, type: SkillType.BUFF }
    ],
    element: Element.EARTH,
    position: { x: 1, y: 1, row: 1 }
  },
  {
    id: "6",
    name: "BNB Monk",
    tokenSymbol: "BNB",
    rarity: CharacterRarity.UNCOMMON,
    level: 7,
    experience: 750,
    stats: {
      health: 130,
      attack: 33,
      defense: 18,
      speed: 14,
      criticalRate: 10,
      criticalDamage: 122
    },
    skills: [
      { id: "S1", name: "Normal Attack", description: "Deals 100% damage to one enemy.", damage: 100, cooldown: 0, manaCost: 0, type: SkillType.ATTACK }
    ],
    element: Element.LIGHT,
    position: { x: 2, y: 1, row: 1 }
  },
  {
    id: "7",
    name: "XRP Assassin",
    tokenSymbol: "XRP",
    rarity: CharacterRarity.RARE,
    level: 8,
    experience: 840,
    stats: {
      health: 100,
      attack: 40,
      defense: 9,
      speed: 20,
      criticalRate: 18,
      criticalDamage: 155
    },
    skills: [
      { id: "S1", name: "Normal Attack", description: "Deals 100% damage to one enemy.", damage: 100, cooldown: 0, manaCost: 0, type: SkillType.ATTACK },
      { id: "S2", name: "Curse Strike", description: "Deals 300-350% damage to the enemy with the lowest HP and applies [Curse].", damage: 325, cooldown: 3, manaCost: 20, type: SkillType.ATTACK }
    ],
    element: Element.DARK
  },
  {
    id: "8",
    name: "AVAX Sorceress",
    tokenSymbol: "AVAX",
    rarity: CharacterRarity.EPIC,
    level: 7,
    experience: 700,
    stats: {
      health: 102,
      attack: 36,
      defense: 11,
      speed: 16,
      criticalRate: 13,
      criticalDamage: 140
    },
    skills: [
      { id: "S2", name: "Curse Strike", description: "Deals 300-350% damage to the enemy with the lowest HP and applies [Curse].", damage: 325, cooldown: 3, manaCost: 20, type: SkillType.ATTACK }
    ],
    element: Element.WATER
  },
  {
    id: "9",
    name: "MATIC Ranger",
    tokenSymbol: "MATIC",
    rarity: CharacterRarity.COMMON,
    level: 6,
    experience: 600,
    stats: {
      health: 120,
      attack: 28,
      defense: 15,
      speed: 17,
      criticalRate: 12,
      criticalDamage: 130
    },
    skills: [
      { id: "S1", name: "Normal Attack", description: "Deals 100% damage to one enemy.", damage: 100, cooldown: 0, manaCost: 0, type: SkillType.ATTACK }
    ],
    element: Element.EARTH
  },
  {
    id: "10",
    name: "LTC Berserker",
    tokenSymbol: "LTC",
    rarity: CharacterRarity.UNCOMMON,
    level: 7,
    experience: 690,
    stats: {
      health: 135,
      attack: 39,
      defense: 13,
      speed: 12,
      criticalRate: 14,
      criticalDamage: 138
    },
    skills: [
      { id: "S1", name: "Normal Attack", description: "Deals 100% damage to one enemy.", damage: 100, cooldown: 0, manaCost: 0, type: SkillType.ATTACK },
      { id: "S3", name: "Diamond Skin", description: "Atk +90%, HP +50%", damage: 0, cooldown: 5, manaCost: 30, type: SkillType.BUFF }
    ],
    element: Element.FIRE
  }
];

// ---- Player ----
export const mockPlayer = {
  id: "P1",
  username: "Satoshi",
  level: 15,
  experience: 3500,
  stats: {
    stamina: 12,
    strength: 18,
    agility: 14,
    luck: 9,
    intelligence: 15,
    vitality: 16,
  },
  characters: mockCharacters,
  formation: {
    positions: [
      mockCharacters.find(c => c.id === "1") || null,
      mockCharacters.find(c => c.id === "2") || null,
      null,
      mockCharacters.find(c => c.id === "3") || null,
      null,
      null
    ],
    maxSize: 6
  },
  progress: {
    currentChapter: 1,
    currentStage: 1,
    completedStages: ["stage-1-1", "stage-1-2"],
    unlockedDungeons: ["stage-1", "stage-2"]
  }
};

// ---- Stages ----
export const mockDungeons = [
  {
    id: "stage-1",
    name: "Genesis Valley",
    description: "The first world on your crypto adventure.",
    requiredLevel: 1,
    rewards: [
      { type: RewardType.EXPERIENCE, amount: 1000 },
      { type: RewardType.GOLD, amount: 1000 }
    ],
    chapters: [
      {
        id: "stage-1-1",
        name: "Genesis 1",
        description: "First steps in Genesis Valley.",
        chapterNumber: 1,
        stages: [
          {
            id: "stage-1-1-1",
            name: "Genesis 1 - Stage 1",
            description: "Basic enemies appear.",
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 100 },
              { type: RewardType.GOLD, amount: 50 }
            ],
            stageNumber: 1,
            difficulty: Difficulty.EASY
          },
          {
            id: "stage-1-1-2",
            name: "Genesis 1 - Stage 2",
            description: "Slightly stronger foes.",
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 120 },
              { type: RewardType.GOLD, amount: 60 }
            ],
            stageNumber: 2,
            difficulty: Difficulty.EASY
          }
        ]
      },
      {
        id: "stage-1-2",
        name: "Genesis 2",
        description: "Deeper into Genesis Valley.",
        chapterNumber: 2,
        stages: [
          {
            id: "stage-1-2-1",
            name: "Genesis 2 - Stage 1",
            description: "Monsters grow stronger.",
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 140 },
              { type: RewardType.GOLD, amount: 70 }
            ],
            stageNumber: 1,
            difficulty: Difficulty.NORMAL
          }
        ]
      },
      {
        id: "stage-1-3",
        name: "Genesis 3",
        description: "The final challenge.",
        chapterNumber: 3,
        stages: [
          {
            id: "stage-1-3-1",
            name: "Genesis Boss",
            description: "Face the Genesis Valley Boss!",
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 500 },
              { type: RewardType.GOLD, amount: 400 }
            ],
            stageNumber: 1,
            difficulty: Difficulty.HARD
          }
        ]
      }
    ]
  },
  {
    id: "stage-2",
    name: "Altcoin Archipelago",
    description: "Islands ruled by powerful altcoin spirits.",
    requiredLevel: 10,
    rewards: [
      { type: RewardType.EXPERIENCE, amount: 1200 },
      { type: RewardType.GOLD, amount: 1100 }
    ],
    chapters: [
      {
        id: "stage-2-1",
        name: "Island 1",
        description: "Enter the archipelago.",
        chapterNumber: 1,
        stages: [
          {
            id: "stage-2-1-1",
            name: "Island 1 - Harbor",
            description: "Arrive at the mysterious harbor.",
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 130 },
              { type: RewardType.GOLD, amount: 65 }
            ],
            stageNumber: 1,
            difficulty: Difficulty.NORMAL
          }
        ]
      },
      {
        id: "stage-2-2",
        name: "Island 2",
        description: "Altcoin spirits challenge you.",
        chapterNumber: 2,
        stages: [
          {
            id: "stage-2-2-1",
            name: "Island 2 - Spirit Grounds",
            description: "Face the altcoin spirits.",
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 160 },
              { type: RewardType.GOLD, amount: 80 }
            ],
            stageNumber: 1,
            difficulty: Difficulty.HARD
          }
        ]
      }
    ]
  }
];