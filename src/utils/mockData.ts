// Mock data fully synced to @thiennt/vivu-api schema (Player, Character, Dungeon, Skill, etc.)
// NOTE: Add/adjust fields as your backend schema evolves.

import { v4 as uuidv4 } from 'uuid';

// ---- Skill Mock ----
export const mockSkills = [
  {
    id: uuidv4(),
    name: "Shield Bash",
    description: "Stuns the enemy with a bash!",
    skill_type: "active_skill",
    level: 1,
    actions: [
      {
        type: "damage",
        target_type: "single_enemy",
        amount_min: 60,
        amount_max: 80,
        damage_type: "physical",
        can_crit: true,
        cooldown: 2,
        energy_cost: 30,
        effect_name: "stun",
        effect_chance: 25,
        effect_duration: 1,
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Normal Attack",
    description: "Basic melee attack.",
    skill_type: "normal_attack",
    level: 1,
    actions: [
      {
        type: "damage",
        target_type: "single_enemy",
        amount_min: 35,
        amount_max: 50,
        damage_type: "physical",
        can_crit: true,
      }
    ]
  },
];

// ---- Character Mock ----
export const mockCharacters = [
  {
    id: uuidv4(),
    name: "Aegis",
    avatar_url: "https://example.com/avatars/aegis.jpg",
    description: "A shield maiden with unbreakable will.",
    c_type: "hero",
    c_class: "warrior",
    level: 10,
    exp: 500,
    points: 0,
    sta: 15,
    str: 18,
    agi: 9,
    hp: 150,
    atk: 30,
    def: 25,
    crit_rate: 5,
    crit_dmg: 120,
    res: 10,
    damage: 0,
    mitigation: 5,
    hit_rate: 98,
    dodge: 8,
    farcaster_id: "aegis_fc_001",
    username: "Aegis",
    equipped_skills: [mockSkills[0], mockSkills[1]],
  },
  {
    id: uuidv4(),
    name: "Blaze",
    avatar_url: "https://example.com/avatars/blaze.jpg",
    description: "A fire mage who conjures flames at will.",
    c_type: "hero",
    c_class: "mage",
    level: 8,
    exp: 420,
    points: 0,
    sta: 10,
    str: 8,
    agi: 12,
    hp: 105,
    atk: 36,
    def: 12,
    crit_rate: 12,
    crit_dmg: 130,
    res: 7,
    damage: 5,
    mitigation: 2,
    hit_rate: 96,
    dodge: 10,
    farcaster_id: "blaze_fc_002",
    username: "Blaze",
    equipped_skills: [mockSkills[1]],
  },
  {
    id: uuidv4(),
    name: "Seraph",
    avatar_url: "https://example.com/avatars/seraph.jpg",
    description: "A healer with divine powers.",
    c_type: "hero",
    c_class: "support",
    level: 7,
    exp: 350,
    points: 0,
    sta: 12,
    str: 5,
    agi: 10,
    hp: 120,
    atk: 15,
    def: 20,
    crit_rate: 6,
    crit_dmg: 110,
    res: 15,
    damage: 0,
    mitigation: 8,
    hit_rate: 97,
    dodge: 9,
    farcaster_id: "seraph_fc_004",
    username: "SeraphHealer",
    equipped_skills: [],
  }
];

// ---- Player Mock ----
export const mockPlayer = {
  id: uuidv4(),
  farcaster_id: "player_fc_001",
  username: "PlayerOne",
  sta: 5,
  str: 5,
  agi: 5,
  luck: 5,
  level: 1,
  exp: 0,
  awaking: 1,
  star: 1,
  points: 0,
  created_at: new Date(),
  updated_at: new Date(),
  characters: mockCharacters,
  // Typical game progress
  progress: {
    currentChapter: 1,
    currentStage: 1,
    completedStages: [],
    unlockedDungeons: ["crypto-caves"]
  },
  // Add formation if your UI expects it:
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