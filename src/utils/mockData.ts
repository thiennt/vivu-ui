// Mock data fully synced to @thiennt/vivu-api schema (Player, Character, Dungeon, Skill, etc.)
// NOTE: Add/adjust fields as your backend schema evolves.

import { v4 as uuidv4 } from 'uuid';
import { CharacterRarity, Element, SkillType } from '../types';

// ---- Skill Mock ----
export const mockSkills = [
  {
    id: uuidv4(),
    name: "Shield Bash",
    description: "Stuns the enemy with a bash!",
    damage: 70,
    cooldown: 2,
    manaCost: 30,
    type: SkillType.ATTACK
  },
  {
    id: uuidv4(),
    name: "Normal Attack", 
    description: "Basic melee attack.",
    damage: 42,
    cooldown: 0,
    manaCost: 0,
    type: SkillType.ATTACK
  },
  {
    id: uuidv4(),
    name: "Heal",
    description: "Restore health to an ally.",
    damage: 0,
    cooldown: 3,
    manaCost: 25,
    type: SkillType.HEAL
  }
];

// ---- Character Mock ----
export const mockCharacters = [
  {
    id: uuidv4(),
    name: "Aegis",
    tokenSymbol: "BTC",
    rarity: CharacterRarity.RARE,
    level: 10,
    experience: 500,
    stats: {
      health: 150,
      attack: 30,
      defense: 25,
      speed: 8,
      criticalRate: 5,
      criticalDamage: 120
    },
    skills: [mockSkills[0], mockSkills[1]],
    element: Element.EARTH
  },
  {
    id: uuidv4(),
    name: "Blaze",
    tokenSymbol: "ETH", 
    rarity: CharacterRarity.EPIC,
    level: 8,
    experience: 420,
    stats: {
      health: 105,
      attack: 36,
      defense: 12,
      speed: 10,
      criticalRate: 12,
      criticalDamage: 130
    },
    skills: [mockSkills[1]],
    element: Element.FIRE
  },
  {
    id: uuidv4(),
    name: "Seraph",
    tokenSymbol: "SOL",
    rarity: CharacterRarity.LEGENDARY,
    level: 7,
    experience: 350,
    stats: {
      health: 120,
      attack: 15,
      defense: 20,
      speed: 9,
      criticalRate: 6,
      criticalDamage: 110
    },
    skills: [mockSkills[2]],
    element: Element.LIGHT
  }
];

// ---- Player Mock ----
export const mockPlayer = {
  id: uuidv4(),
  username: "PlayerOne",
  level: 1,
  experience: 0,
  stats: {
    stamina: 5,
    strength: 5,
    agility: 5,
    luck: 5,
    intelligence: 5,
    vitality: 5
  },
  characters: mockCharacters,
  progress: {
    currentChapter: 1,
    currentStage: 1,
    completedStages: [],
    unlockedDungeons: ["crypto-caves"]
  },
  formation: {
    positions: [mockCharacters[0], mockCharacters[1], null, mockCharacters[2], null, null],
    maxSize: 6
  }
};

// ---- Dungeon/Stage/Chapter Mock ----
export const mockDungeons = [
  {
    id: "crypto-caves",
    name: "Crypto Caves",
    description: "Deep mysterious caves with hidden treasures.",
    requiredLevel: 1,
    rewards: [
      { type: "EXPERIENCE", amount: 150 },
      { type: "GOLD", amount: 75 }
    ],
    chapters: [
      {
        id: "chapter1",
        name: "Entrance",
        description: "The cave's mysterious entrance.",
        chapterNumber: 1,
        stages: [
          {
            id: "stage1-1",
            name: "Bats Attack",
            description: "Survive a swarm of bats.",
            stageNumber: 1,
            difficulty: "EASY",
            enemies: [],
            rewards: [
              { type: "EXPERIENCE", amount: 50 },
              { type: "GOLD", amount: 25 }
            ]
          },
          {
            id: "stage1-2",
            name: "Tunnel Ambush",
            description: "Venture deeper into the mysterious tunnels.",
            stageNumber: 2,
            difficulty: "EASY",
            enemies: [],
            rewards: [
              { type: "EXPERIENCE", amount: 75 },
              { type: "GOLD", amount: 35 }
            ]
          },
          {
            id: "stage1-3",
            name: "Boss Chamber",
            description: "Face the guardian of the first level.",
            stageNumber: 3,
            difficulty: "NORMAL",
            enemies: [],
            rewards: [
              { type: "EXPERIENCE", amount: 150 },
              { type: "GOLD", amount: 100 },
              { type: "CHARACTER", amount: 1, rarity: "common" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "blockchain-forest",
    name: "Blockchain Forest",
    description: "A mystical forest where digital nature thrives.",
    requiredLevel: 10,
    rewards: [
      { type: "EXPERIENCE", amount: 200 },
      { type: "GOLD", amount: 100 }
    ],
    chapters: [
      {
        id: "chapter2",
        name: "The Sacred Grove",
        description: "Ancient trees hold the secrets of the blockchain.",
        chapterNumber: 1,
        stages: [
          {
            id: "stage2-1",
            name: "Forest Path",
            description: "Follow the winding path through the forest.",
            stageNumber: 1,
            difficulty: "NORMAL",
            enemies: [],
            rewards: [
              { type: "EXPERIENCE", amount: 150 },
              { type: "GOLD", amount: 80 }
            ]
          }
        ]
      }
    ]
  }
];