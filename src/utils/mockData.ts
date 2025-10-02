import { BattleLogEntry } from '../types';
import { mockCards } from './cardData';

// ---- Skills ----
export const mockSkills = [
  {
    name: "Normal Attack",
    description: "Deals 100% damage to one enemy.",
    icon_url: "https://example.com/normal_attack_icon.png",
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
    name: "Curse Strike",
    description: "Deals 300-350% damage to the enemy with the lowest HP and applies [Curse].",
    icon_url: "https://example.com/curse_strike_icon.png",
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
    name: "Frozen Hunter",
    description: "Deals 300-350% damage to the enemy with the highest HP. If the target is under [Slow Down] or [Freeze], this attack ignores 30% of their defense.",
    icon_url: "https://example.com/frozen_hunter_icon.png",
    skill_type: "active_skill",
    level: 1,
    actions: [
      {
        type: "damage",
        target_type: "highest_hp",
        amount_min: 300,
        amount_max: 350,
        damage_type: "physical",
        can_crit: true,
        conditions: [
          { type: "target_has_effect", value: "slow_down", modifier: { armor_ignore: 30 } },
          { type: "target_has_effect", value: "freeze", modifier: { armor_ignore: 30 } }
        ]
      }
    ]
  }
];

// ---- Characters (Crypto Inspired) ----
export const mockPlayer1Characters = [
  {
    "id": "885f2e07-085a-421c-be16-bfd3f041fa50",
    "character_id": "888be80b-0d34-459d-8337-125c3183d4d7",
    "name": "Bitcoin",
    "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
    "team": 1,
    "position": 1,
    "max_hp": 6079,
    "hp": 6079,
    "atk": 2717,
    "def": 1536,
    "agi": 801,
    "crit_rate": 19,
    "crit_dmg": 330,
    "res": 25,
    "damage": 0,
    "mitigation": 12,
    "hit_rate": 102,
    "dodge": 17,
    "has_acted": false,
    "active_effects": [],
    "equipped_skills": [
      "bcce57f4-5b26-49ff-8950-bee1b0a9336d",
      "a2520721-c08b-46a7-90d4-6f9cbc099418"
    ]
  },
  {
    "id": "624da9bb-5ac3-48b2-a557-51f233f925d3",
    "character_id": "d14fa036-c0fb-4d4c-8060-709c7b7ff034",
    "name": "Ethereum",
    "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    "team": 1,
    "position": 2,
    "max_hp": 5892,
    "hp": 5892,
    "atk": 2627,
    "def": 1490,
    "agi": 772,
    "crit_rate": 18,
    "crit_dmg": 323,
    "res": 24,
    "damage": 0,
    "mitigation": 12,
    "hit_rate": 102,
    "dodge": 16,
    "has_acted": false,
    "active_effects": [],
    "equipped_skills": [
      "bcce57f4-5b26-49ff-8950-bee1b0a9336d",
      "750fb360-fde6-4cc8-901b-fa786dcb3d44"
    ]
  },
  {
    "id": "08fcbeff-2583-4c71-a894-d4254cc4d2e7",
    "character_id": "9fe1866f-00c9-4293-8b7f-cf20c1051a17",
    "name": "BNB",
    "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    "team": 1,
    "position": 3,
    "max_hp": 5895,
    "hp": 5895,
    "atk": 2627,
    "def": 1486,
    "agi": 774,
    "crit_rate": 18,
    "crit_dmg": 323,
    "res": 24,
    "damage": 0,
    "mitigation": 12,
    "hit_rate": 102,
    "dodge": 16,
    "has_acted": false,
    "active_effects": [],
    "equipped_skills": [
      "bcce57f4-5b26-49ff-8950-bee1b0a9336d",
      "986f94de-7be1-47cf-bea0-c5dcbe947705"
    ]
  }
];

export const mockPlayer2Characters = [
  {
    "id": "26c32f59-619d-4c98-b56d-54836f2a0f9a",
    "character_id": "8105fa5a-be33-4444-8243-53a5436d4a15",
    "name": "Celer Network",
    "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
    "team": 2,
    "position": 1,
    "max_hp": 370,
    "hp": 370,
    "atk": 135,
    "def": 74,
    "agi": 44,
    "crit_rate": 6,
    "crit_dmg": 155,
    "res": 8,
    "damage": 0,
    "mitigation": 6,
    "hit_rate": 96,
    "dodge": 8,
    "has_acted": false,
    "active_effects": [],
    "equipped_skills": [
      "bcce57f4-5b26-49ff-8950-bee1b0a9336d",
      "f3fd80b1-15d1-4c21-87ca-09e98938ec5b"
    ]
  },
  {
    "id": "3a3c6da1-2a55-4bcf-ab6d-760892d507e3",
    "character_id": "1cac15a3-3abe-4f0d-a504-2f8bdc42926c",
    "name": "Telcoin",
    "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2394.png",
    "team": 2,
    "position": 2,
    "max_hp": 370,
    "hp": 370,
    "atk": 135,
    "def": 71,
    "agi": 45,
    "crit_rate": 6,
    "crit_dmg": 155,
    "res": 8,
    "damage": 0,
    "mitigation": 6,
    "hit_rate": 96,
    "dodge": 8,
    "has_acted": false,
    "active_effects": [],
    "equipped_skills": [
      "bcce57f4-5b26-49ff-8950-bee1b0a9336d",
      "c0cf1536-3355-4250-92c6-c77acef7e5b2"
    ]
  },
  {
    "id": "217ebccf-b467-4ecc-9bb5-441165345d4a",
    "character_id": "21c4967f-6fa3-4f05-b900-599f100eab0c",
    "name": "Ontology Gas",
    "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3217.png",
    "team": 2,
    "position": 3,
    "max_hp": 371,
    "hp": 371,
    "atk": 131,
    "def": 73,
    "agi": 43,
    "crit_rate": 6,
    "crit_dmg": 155,
    "res": 8,
    "damage": 0,
    "mitigation": 6,
    "hit_rate": 96,
    "dodge": 8,
    "has_acted": false,
    "active_effects": [],
    "equipped_skills": [
      "bcce57f4-5b26-49ff-8950-bee1b0a9336d",
      "62cf745c-ac43-4817-88fe-8a5cbe7d9196"
    ]
  }
];

export const mockCharacters = mockPlayer1Characters.concat(mockPlayer2Characters);

// ---- Player ----
export const mockPlayer = {
  "id": "140b7bcd-9487-449d-a4b4-a9370d955651",
  "username": "PlayerOne",
  "farcaster_id": "player_fc_001",
  "lineup": [
    {
      "id": "888be80b-0d34-459d-8337-125c3183d4d7",
      "name": "Bitcoin",
      "code": "BTC",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
      "hp": 6079,
      "atk": 2717,
      "def": 1536,
      "agi": 801
    },
    {
      "id": "d14fa036-c0fb-4d4c-8060-709c7b7ff034",
      "name": "Ethereum",
      "code": "ETH",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      "hp": 5892,
      "atk": 2627,
      "def": 1490,
      "agi": 772
    },
    {
      "id": "9fe1866f-00c9-4293-8b7f-cf20c1051a17",
      "name": "BNB",
      "code": "BNB",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
      "hp": 5895,
      "atk": 2627,
      "def": 1486,
      "agi": 774
    }
  ],
  "sta": 5,
  "str": 5,
  "agi": 5,
  "luck": 5,
  "level": 1,
  "exp": 0,
  "points": 0,
  "characters": [
    {
      "id": "888be80b-0d34-459d-8337-125c3183d4d7",
      "name": "Bitcoin",
      "code": "BTC",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
      "hp": 6079,
      "atk": 2717,
      "def": 1536,
      "agi": 801
    },
    {
      "id": "d14fa036-c0fb-4d4c-8060-709c7b7ff034",
      "name": "Ethereum",
      "code": "ETH",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      "hp": 5892,
      "atk": 2627,
      "def": 1490,
      "agi": 772
    },
    {
      "id": "9fe1866f-00c9-4293-8b7f-cf20c1051a17",
      "name": "BNB",
      "code": "BNB",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
      "hp": 5895,
      "atk": 2627,
      "def": 1486,
      "agi": 774
    },
    {
      "id": "8bfcad67-fbc7-43bb-8219-992843f38f66",
      "name": "Solana",
      "code": "SOL",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
      "hp": 5892,
      "atk": 2631,
      "def": 1488,
      "agi": 775
    },
    {
      "id": "b16d4678-d825-4e68-85d3-37eca62c6507",
      "name": "XRP",
      "code": "XRP",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/52.png",
      "hp": 5704,
      "atk": 2546,
      "def": 1441,
      "agi": 748
    },
    {
      "id": "3987ba30-4233-4f6e-ae1e-52fc1ac63a30",
      "name": "Toncoin",
      "code": "TON",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
      "hp": 5711,
      "atk": 2546,
      "def": 1441,
      "agi": 751
    },
    {
      "id": "d1f9d537-af01-44d8-b9f3-b01cdc317a36",
      "name": "Dogecoin",
      "code": "DOGE",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
      "hp": 5708,
      "atk": 2546,
      "def": 1439,
      "agi": 750
    },
    {
      "id": "127e8aa1-c507-4524-a05f-7c40abae0650",
      "name": "Cardano",
      "code": "ADA",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png",
      "hp": 5521,
      "atk": 2461,
      "def": 1392,
      "agi": 727
    },
    {
      "id": "eba6b9df-4309-4648-8daa-f82dbdb5f5ba",
      "name": "Shiba Inu",
      "code": "SHIB",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png",
      "hp": 5521,
      "atk": 2459,
      "def": 1392,
      "agi": 725
    },
    {
      "id": "1404bc14-c76c-4a66-bcc4-fa129e6e4c73",
      "name": "Avalanche",
      "code": "AVAX",
      "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
      "hp": 5526,
      "atk": 2460,
      "def": 1391,
      "agi": 726
    }
  ]
};

// ---- Stages ----
// NOTE: mockDungeons usage has been replaced with API calls for Dungeon and Stage components
// This data is kept for other components that haven't been migrated yet
export const mockDungeons = [
  {
    id: "4e285053-c229-4f7c-83d5-ac22c1c24546",
    name: "Ancient Forest",
    description: "A mystical forest filled with ancient secrets and powerful creatures.",
    thumbnail_url: "forest_root_thumbnail.jpg",
    background_url: "forest_root_background.jpg",
    music_url: "forest_root_music.mp3",
    created_at: "2025-09-06T06:46:42.129Z",
    updated_at: "2025-09-06T06:46:42.129Z",
    parent_stage_id: null,
    difficulty: 1,
    energy_cost: 0,
    max_attempts: 999,
    rewards: null,
    stages: [
      {
        id: "b1459c34-4dd6-4ccd-9859-8866fe110d28",
        name: "Forest Clearing",
        description: "A peaceful clearing in the ancient forest, perfect for training and battles.",
        thumbnail_url: "stage_1_thumbnail.jpg",
        background_url: "stage_1_background.jpg",
        music_url: "stage_1_music.mp3",
        created_at: "2025-09-06T06:46:42.132Z",
        updated_at: "2025-09-06T06:46:42.132Z",
        parent_stage_id: "4e285053-c229-4f7c-83d5-ac22c1c24546",
        difficulty: 1,
        energy_cost: 5,
        max_attempts: 3,
        rewards: {
          exp: 50,
          gold: 100,
          items: [
            "Health Potion",
            "Mana Potion"
          ]
        },
        isCompleted: false
      },
      {
        id: "46c9907f-b874-455e-91e3-21c8acee7f01",
        name: "Goblin Cave",
        description: "A dark cave infested with cunning goblins and hidden treasures.",
        thumbnail_url: "stage_2_thumbnail.jpg",
        background_url: "stage_2_background.jpg",
        music_url: "stage_2_music.mp3",
        created_at: "2025-09-06T06:46:42.134Z",
        updated_at: "2025-09-06T06:46:42.134Z",
        parent_stage_id: "4e285053-c229-4f7c-83d5-ac22c1c24546",
        difficulty: 2,
        energy_cost: 8,
        max_attempts: 3,
        rewards: {
          exp: 75,
          gold: 150,
          items: [
            "Iron Sword",
            "Leather Armor"
          ]
        },
        isCompleted: false
      },
      {
        id: "17c37cda-f442-4c4b-9f25-82e2855dcd32",
        name: "Mystic Ruins",
        description: "Ancient ruins filled with magical energy and dangerous spells.",
        thumbnail_url: "stage_3_thumbnail.jpg",
        background_url: "stage_3_background.jpg",
        music_url: "stage_3_music.mp3",
        created_at: "2025-09-06T06:46:42.135Z",
        updated_at: "2025-09-06T06:46:42.135Z",
        parent_stage_id: "4e285053-c229-4f7c-83d5-ac22c1c24546",
        difficulty: 3,
        energy_cost: 12,
        max_attempts: 2,
        rewards: {
          exp: 100,
          gold: 200,
          items: [
            "Magic Staff",
            "Mystic Robe"
          ]
        },
        isCompleted: false
      },
      {
        id: "6d2702f0-1870-4d0f-8a63-fd249478cac1",
        name: "Dragon's Lair",
        description: "The fearsome lair of an ancient dragon, only the bravest dare to enter.",
        thumbnail_url: "stage_4_thumbnail.jpg",
        background_url: "stage_4_background.jpg",
        music_url: "stage_4_music.mp3",
        created_at: "2025-09-06T06:46:42.136Z",
        updated_at: "2025-09-06T06:46:42.136Z",
        parent_stage_id: "4e285053-c229-4f7c-83d5-ac22c1c24546",
        difficulty: 5,
        energy_cost: 20,
        max_attempts: 1,
        rewards: {
          exp: 250,
          gold: 500,
          items: [
            "Dragon Blade",
            "Dragon Scale Armor"
          ]
        },
        isCompleted: false
      }
    ]
  },
  {
    id: "d2f1c4e7-3b6a-4f8e-9f1e-2b5e6c8f9a12",
    name: "Crystal Caverns",
    description: "A dazzling cave system filled with glowing crystals and hidden dangers.",
    thumbnail_url: "crystal_caverns_thumbnail.jpg",
    background_url: "crystal_caverns_background.jpg",
    music_url: "crystal_caverns_music.mp3",
    created_at: "2025-09-06T06:46:42.140Z",
    updated_at: "2025-09-06T06:46:42.140Z",
    parent_stage_id: null,
    difficulty: 2,
    energy_cost: 0,
    max_attempts: 999,
    rewards: null,
    stages: []
  }
];

export const mockStages = [
  {
    "id": "ea176bf6-7273-4c73-91ef-b1de2df9d026",
    "name": "Floor 1",
    "player_id": "0cd5c1ec-dfea-4d8b-bb6f-ebcc471b6cd1",
    "rewards": "{\"chest\":1}",
    "stage_index": 1,
    "is_completed": true,
    "is_current": false,
    "characters": [
      {
        "name": "Function X",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3930.png",
        "hp": 97,
        "atk": 18,
        "def": 9
      },
      {
        "name": "Vulcan Forged PYR",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/9308.png",
        "hp": 96,
        "atk": 19,
        "def": 7
      },
      {
        "name": "Radicle",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/9463.png",
        "hp": 94,
        "atk": 17,
        "def": 7
      }
    ]
  },
  {
    "id": "e03a155a-39cf-40f1-b69a-f16edbbb2381",
    "name": "Floor 2",
    "player_id": "5b74a5e8-e823-45c2-a7e8-1a54e8ebfe9c",
    "rewards": "{\"chest\":1}",
    "stage_index": 2,
    "is_completed": true,
    "is_current": false,
    "characters": [
      {
        "name": "Mango",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/15595.png",
        "hp": 103,
        "atk": 25,
        "def": 14
      },
      {
        "name": "Ren",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2539.png",
        "hp": 108,
        "atk": 22,
        "def": 12
      },
      {
        "name": "MediBloc",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2303.png",
        "hp": 104,
        "atk": 26,
        "def": 10
      }
    ]
  },
  {
    "id": "5fac2f1e-2682-493d-8b28-fdbf8584c1a6",
    "name": "Floor 3",
    "player_id": "acca24ea-b4fa-488a-abb2-acacdae6f5c4",
    "rewards": "{\"chest\":1}",
    "stage_index": 3,
    "is_completed": true,
    "is_current": false,
    "characters": [
      {
        "name": "Vega Protocol",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7276.png",
        "hp": 121,
        "atk": 28,
        "def": 15
      },
      {
        "name": "Orbs",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3835.png",
        "hp": 121,
        "atk": 32,
        "def": 16
      },
      {
        "name": "Augur",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1104.png",
        "hp": 125,
        "atk": 31,
        "def": 15
      }
    ]
  },
  {
    "id": "c45ba63a-cb9b-42fe-ba77-6990b213f279",
    "name": "Floor 4",
    "player_id": "9c6a5cef-65fc-4596-bdf3-e1de0e971db5",
    "rewards": "{\"chest\":1}",
    "stage_index": 4,
    "is_completed": true,
    "is_current": false,
    "characters": [
      {
        "name": "Audius",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7455.png",
        "hp": 142,
        "atk": 40,
        "def": 19
      },
      {
        "name": "Alien Worlds",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/9119.png",
        "hp": 148,
        "atk": 39,
        "def": 17
      },
      {
        "name": "Raydium",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/8526.png",
        "hp": 146,
        "atk": 38,
        "def": 21
      }
    ]
  },
  {
    "id": "9749c646-3dc4-4e65-a8ae-47274a848dae",
    "name": "Floor 5",
    "player_id": "f8dd79d7-b90f-48ae-bc37-6f0f842d4935",
    "rewards": "{\"chest\":1}",
    "stage_index": 5,
    "is_completed": true,
    "is_current": false,
    "characters": [
      {
        "name": "Metis",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/9640.png",
        "hp": 170,
        "atk": 46,
        "def": 26
      },
      {
        "name": "Astar",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/12885.png",
        "hp": 168,
        "atk": 48,
        "def": 25
      },
      {
        "name": "BitShares",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/463.png",
        "hp": 165,
        "atk": 49,
        "def": 26
      }
    ]
  },
  {
    "id": "2e3136f2-dcc1-4444-95ff-02b0b6dd8e9c",
    "name": "Floor 6",
    "player_id": "1f4c535e-97e6-475d-ae00-d823ec7b5dd4",
    "rewards": "{\"chest\":1}",
    "stage_index": 6,
    "is_completed": true,
    "is_current": false,
    "characters": [
      {
        "name": "Orion Protocol",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5639.png",
        "hp": 192,
        "atk": 56,
        "def": 31
      },
      {
        "name": "Rarible",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5647.png",
        "hp": 193,
        "atk": 56,
        "def": 28
      },
      {
        "name": "DODO",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7224.png",
        "hp": 194,
        "atk": 60,
        "def": 30
      }
    ]
  },
  {
    "id": "3935b6f1-fa75-4ebc-8143-f71d0bead58e",
    "name": "Floor 7",
    "player_id": "b1a4c83a-7374-4cef-be49-6d36a3fada2b",
    "rewards": "{\"chest\":1}",
    "stage_index": 7,
    "is_completed": true,
    "is_current": false,
    "characters": [
      {
        "name": "RSK Infrastructure Framework",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3701.png",
        "hp": 221,
        "atk": 68,
        "def": 38
      },
      {
        "name": "Bancor Network",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1727.png",
        "hp": 224,
        "atk": 68,
        "def": 39
      },
      {
        "name": "Origin Protocol",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5117.png",
        "hp": 228,
        "atk": 68,
        "def": 38
      }
    ]
  },
  {
    "id": "6d056b66-0b0f-48a0-a056-d62e6d14e609",
    "name": "Floor 8",
    "player_id": "d9df7c44-5528-4cc8-92fe-3346531812db",
    "rewards": "{\"chest\":1}",
    "stage_index": 8,
    "is_completed": true,
    "is_current": false,
    "characters": [
      {
        "name": "OriginTrail",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2467.png",
        "hp": 261,
        "atk": 85,
        "def": 44
      },
      {
        "name": "Numeraire",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1732.png",
        "hp": 254,
        "atk": 83,
        "def": 43
      },
      {
        "name": "Energy Web Token",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5268.png",
        "hp": 257,
        "atk": 83,
        "def": 43
      }
    ]
  },
  {
    "id": "66de9ec9-2f63-421a-8621-d518d0789ced",
    "name": "Floor 9",
    "player_id": "2041497a-67fb-4d37-b4de-932a7b8d70b8",
    "rewards": "{\"chest\":1}",
    "stage_index": 9,
    "is_completed": true,
    "is_current": false,
    "characters": [
      {
        "name": "WazirX",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5169.png",
        "hp": 294,
        "atk": 101,
        "def": 52
      },
      {
        "name": "Centrifuge",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7461.png",
        "hp": 289,
        "atk": 101,
        "def": 53
      },
      {
        "name": "Everscale",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7505.png",
        "hp": 291,
        "atk": 97,
        "def": 55
      }
    ]
  },
  {
    "id": "18621256-b652-4fa5-9ad6-32d9f5e97c32",
    "name": "Floor 10",
    "player_id": "769545a9-ff84-47da-8e0d-3be50a8489b5",
    "rewards": "{\"chest\":1}",
    "stage_index": 10,
    "is_completed": true,
    "is_current": false,
    "characters": [
      {
        "name": "MX TOKEN",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1808.png",
        "hp": 327,
        "atk": 114,
        "def": 60
      },
      {
        "name": "Civic",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1816.png",
        "hp": 332,
        "atk": 116,
        "def": 60
      },
      {
        "name": "Radix",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7692.png",
        "hp": 331,
        "atk": 114,
        "def": 60
      }
    ]
  },
  {
    "id": "7b78ac28-d884-41db-8db7-f59781b4feaa",
    "name": "Floor 11",
    "player_id": "bd1bb71f-03a4-4d9b-a431-88a8b3a3e056",
    "rewards": "{\"chest\":1}",
    "stage_index": 11,
    "is_completed": false,
    "is_current": true,
    "characters": [
      {
        "name": "Celer Network",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
        "hp": 370,
        "atk": 135,
        "def": 74
      },
      {
        "name": "Telcoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2394.png",
        "hp": 370,
        "atk": 135,
        "def": 71
      },
      {
        "name": "Ontology Gas",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3217.png",
        "hp": 371,
        "atk": 131,
        "def": 73
      }
    ]
  },
  {
    "id": "d33acf7e-048c-41ca-88bb-e524bf8d505a",
    "name": "Floor 12",
    "player_id": "92549a26-cc0d-447b-993f-96969add5733",
    "rewards": "{\"chest\":1}",
    "stage_index": 12,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Fetch.ai",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3773.png",
        "hp": 414,
        "atk": 154,
        "def": 81
      },
      {
        "name": "COTI",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3992.png",
        "hp": 412,
        "atk": 154,
        "def": 82
      },
      {
        "name": "Mask Network",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/8536.png",
        "hp": 421,
        "atk": 151,
        "def": 85
      }
    ]
  },
  {
    "id": "463d5d1d-af29-45b2-9ae5-5d6fd2f741da",
    "name": "Floor 13",
    "player_id": "715ee0a0-11fa-4656-bb89-28fde3a7f127",
    "rewards": "{\"chest\":1}",
    "stage_index": 13,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Band Protocol",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/4679.png",
        "hp": 468,
        "atk": 171,
        "def": 95
      },
      {
        "name": "Dent",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1886.png",
        "hp": 459,
        "atk": 170,
        "def": 92
      },
      {
        "name": "Biconomy",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/11371.png",
        "hp": 460,
        "atk": 173,
        "def": 95
      }
    ]
  },
  {
    "id": "62a78882-be40-4c13-a697-704d7f75ee5c",
    "name": "Floor 14",
    "player_id": "292ffe99-454b-4bae-b34f-d3e668a9c69d",
    "rewards": "{\"chest\":1}",
    "stage_index": 14,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Injective",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7226.png",
        "hp": 516,
        "atk": 194,
        "def": 104
      },
      {
        "name": "Aragon",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1680.png",
        "hp": 516,
        "atk": 192,
        "def": 106
      },
      {
        "name": "Polymesh",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7654.png",
        "hp": 516,
        "atk": 196,
        "def": 104
      }
    ]
  },
  {
    "id": "4f20846f-873c-4328-80a1-e1609b793ebe",
    "name": "Floor 15",
    "player_id": "f2fc9336-a4ae-4e22-8a6f-7cb6a09e0a0a",
    "rewards": "{\"chest\":1}",
    "stage_index": 15,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "UMA",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5617.png",
        "hp": 569,
        "atk": 220,
        "def": 119
      },
      {
        "name": "Ankr",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3783.png",
        "hp": 566,
        "atk": 217,
        "def": 122
      },
      {
        "name": "Decred",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1168.png",
        "hp": 567,
        "atk": 217,
        "def": 122
      }
    ]
  },
  {
    "id": "677761c7-7e17-492d-b231-659e4b7d2ca2",
    "name": "Floor 16",
    "player_id": "fc4e3ed2-530a-4a7f-aa30-c80c3269273e",
    "rewards": "{\"chest\":1}",
    "stage_index": 16,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Reserve Rights",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3964.png",
        "hp": 620,
        "atk": 242,
        "def": 133
      },
      {
        "name": "SushiSwap",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/6758.png",
        "hp": 629,
        "atk": 243,
        "def": 132
      },
      {
        "name": "Celo",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5567.png",
        "hp": 629,
        "atk": 240,
        "def": 134
      }
    ]
  },
  {
    "id": "c85d2e66-6ee9-450f-837d-b19166527444",
    "name": "Floor 17",
    "player_id": "c6e93b91-a32d-4e3e-a6d6-75e688f05efc",
    "rewards": "{\"chest\":1}",
    "stage_index": 17,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "ICON",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2099.png",
        "hp": 689,
        "atk": 270,
        "def": 146
      },
      {
        "name": "SKALE",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5691.png",
        "hp": 684,
        "atk": 266,
        "def": 147
      },
      {
        "name": "Storj",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1772.png",
        "hp": 679,
        "atk": 266,
        "def": 147
      }
    ]
  },
  {
    "id": "cf49f986-62e4-4902-9fbc-d074d5dfcd09",
    "name": "Floor 18",
    "player_id": "8c0b5ded-30dd-480d-9046-e63fd3f76ac0",
    "rewards": "{\"chest\":1}",
    "stage_index": 18,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Ontology",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2566.png",
        "hp": 751,
        "atk": 298,
        "def": 164
      },
      {
        "name": "Balancer",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5728.png",
        "hp": 750,
        "atk": 297,
        "def": 162
      },
      {
        "name": "0x Protocol",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1896.png",
        "hp": 744,
        "atk": 294,
        "def": 166
      }
    ]
  },
  {
    "id": "4884e52d-4967-49c6-bfd0-2f0efcd917aa",
    "name": "Floor 19",
    "player_id": "87a55113-0ce5-44de-9af5-daa7baf62c7a",
    "rewards": "{\"chest\":1}",
    "stage_index": 19,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Ocean Protocol",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3911.png",
        "hp": 811,
        "atk": 325,
        "def": 178
      },
      {
        "name": "Lisk",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1214.png",
        "hp": 809,
        "atk": 324,
        "def": 178
      },
      {
        "name": "Render Token",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5690.png",
        "hp": 810,
        "atk": 327,
        "def": 181
      }
    ]
  },
  {
    "id": "a02402d3-b9c4-4149-94f1-c249d53ca1d2",
    "name": "Floor 20",
    "player_id": "877445f0-5397-41b7-a4d9-dac7dd10c879",
    "rewards": "{\"chest\":1}",
    "stage_index": 20,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Songbird",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/10775.png",
        "hp": 879,
        "atk": 356,
        "def": 199
      },
      {
        "name": "DigiByte",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/109.png",
        "hp": 876,
        "atk": 355,
        "def": 198
      },
      {
        "name": "Holo",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2682.png",
        "hp": 884,
        "atk": 354,
        "def": 196
      }
    ]
  },
  {
    "id": "5070feb6-c947-4acb-95d1-6420b63435e3",
    "name": "Floor 21",
    "player_id": "dc300bee-fb9e-4f54-9d0e-84ded19a3538",
    "rewards": "{\"chest\":1}",
    "stage_index": 21,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Illuvium",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/8719.png",
        "hp": 949,
        "atk": 389,
        "def": 216
      },
      {
        "name": "Chia",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/9258.png",
        "hp": 955,
        "atk": 385,
        "def": 213
      },
      {
        "name": "JasmyCoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/8425.png",
        "hp": 956,
        "atk": 387,
        "def": 215
      }
    ]
  },
  {
    "id": "e9d07b5f-b1e5-47db-b349-95c52c9bb98a",
    "name": "Floor 22",
    "player_id": "a73ace1c-a0ac-4997-8089-4d261f947d6b",
    "rewards": "{\"chest\":1}",
    "stage_index": 22,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Convex Finance",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/9903.png",
        "hp": 1030,
        "atk": 421,
        "def": 234
      },
      {
        "name": "Axelar",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/12885.png",
        "hp": 1031,
        "atk": 420,
        "def": 233
      },
      {
        "name": "Staked Frax Ether",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/26108.png",
        "hp": 1030,
        "atk": 421,
        "def": 234
      }
    ]
  },
  {
    "id": "ddf5ab56-7577-44ee-b528-68b91b98e91f",
    "name": "Floor 23",
    "player_id": "c16da495-8130-4b6f-90a8-03351aa90951",
    "rewards": "{\"chest\":1}",
    "stage_index": 23,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Compound",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5692.png",
        "hp": 1107,
        "atk": 453,
        "def": 254
      },
      {
        "name": "Chiliz",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/4066.png",
        "hp": 1104,
        "atk": 453,
        "def": 255
      },
      {
        "name": "Siacoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1042.png",
        "hp": 1107,
        "atk": 456,
        "def": 252
      }
    ]
  },
  {
    "id": "6e6b85ca-beab-4fdc-9f60-bc5971355cc3",
    "name": "Floor 24",
    "player_id": "2a86eb3a-2500-4e1a-9c23-1a1470445bed",
    "rewards": "{\"chest\":1}",
    "stage_index": 24,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "SafePal",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/9721.png",
        "hp": 1180,
        "atk": 491,
        "def": 275
      },
      {
        "name": "Akash Network",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7431.png",
        "hp": 1182,
        "atk": 491,
        "def": 271
      },
      {
        "name": "Jito",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/27804.png",
        "hp": 1189,
        "atk": 489,
        "def": 271
      }
    ]
  },
  {
    "id": "424b6a94-361f-4d6e-b350-3872cca3fea1",
    "name": "Floor 25",
    "player_id": "99abd05d-e8ec-4f5f-bcf0-27b1f6a495c7",
    "rewards": "{\"chest\":1}",
    "stage_index": 25,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Nervos Network",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/4948.png",
        "hp": 1272,
        "atk": 530,
        "def": 293
      },
      {
        "name": "Trust Wallet",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png",
        "hp": 1269,
        "atk": 527,
        "def": 294
      },
      {
        "name": "Gala",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7080.png",
        "hp": 1263,
        "atk": 527,
        "def": 297
      }
    ]
  },
  {
    "id": "751ca060-46f0-443f-935f-29ab278245bb",
    "name": "Floor 26",
    "player_id": "38064314-26f0-4974-a6f9-64f0fccf7a1d",
    "rewards": "{\"chest\":1}",
    "stage_index": 26,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "SATS (Ordinals)",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/30957.png",
        "hp": 1356,
        "atk": 565,
        "def": 316
      },
      {
        "name": "Zcash",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png",
        "hp": 1349,
        "atk": 564,
        "def": 315
      },
      {
        "name": "Frax",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/6952.png",
        "hp": 1358,
        "atk": 566,
        "def": 314
      }
    ]
  },
  {
    "id": "2eb6e2a0-ba74-4b0b-b1cc-e8502380a3e3",
    "name": "Floor 27",
    "player_id": "5014f039-c146-4051-b7f3-267dfce227e9",
    "rewards": "{\"chest\":1}",
    "stage_index": 27,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Helium",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5665.png",
        "hp": 1449,
        "atk": 605,
        "def": 340
      },
      {
        "name": "Marinade Staked SOL",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/11079.png",
        "hp": 1444,
        "atk": 605,
        "def": 339
      },
      {
        "name": "Dymension",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/28296.png",
        "hp": 1449,
        "atk": 606,
        "def": 338
      }
    ]
  },
  {
    "id": "e58b6deb-12d0-494e-8a31-af45f12fa269",
    "name": "Floor 28",
    "player_id": "a5a55203-bef6-4cd9-8d31-73652eadc50f",
    "rewards": "{\"chest\":1}",
    "stage_index": 28,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Klaytn",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/4256.png",
        "hp": 1535,
        "atk": 650,
        "def": 363
      },
      {
        "name": "WOO",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7501.png",
        "hp": 1539,
        "atk": 646,
        "def": 363
      },
      {
        "name": "ORDI",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/23254.png",
        "hp": 1541,
        "atk": 647,
        "def": 362
      }
    ]
  },
  {
    "id": "43d05c81-cd26-442d-9158-af391ffed0f8",
    "name": "Floor 29",
    "player_id": "fd35273b-66ad-4ef4-9989-aaf470ed1c8f",
    "rewards": "{\"chest\":1}",
    "stage_index": 29,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "EOS",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1765.png",
        "hp": 1630,
        "atk": 689,
        "def": 388
      },
      {
        "name": "Flare",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/6950.png",
        "hp": 1637,
        "atk": 693,
        "def": 387
      },
      {
        "name": "PAX Gold",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/4705.png",
        "hp": 1636,
        "atk": 692,
        "def": 385
      }
    ]
  },
  {
    "id": "b7ed8d4c-4de7-4612-863c-db1f835bbc26",
    "name": "Floor 30",
    "player_id": "fcc66f2a-3ffc-48a8-a2de-a7957439aad5",
    "rewards": "{\"chest\":1}",
    "stage_index": 30,
    "is_completed": false,
    "is_current": false,
    "characters": [
      {
        "name": "Basic Attention Token",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1697.png",
        "hp": 1729,
        "atk": 734,
        "def": 411
      },
      {
        "name": "1inch",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/8104.png",
        "hp": 1726,
        "atk": 735,
        "def": 410
      },
      {
        "name": "Bitcoin SV",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3602.png",
        "hp": 1727,
        "atk": 735,
        "def": 410
      }
    ]
  }
];


export const mockBattleStage = {
  "battle_id": "79c2bcc3-9d38-469f-96ea-208e37cacac4",
  "stage_id": "7b78ac28-d884-41db-8db7-f59781b4feaa",
  "player1_id": "140b7bcd-9487-449d-a4b4-a9370d955651",
  "status": "ongoing",
  "cards": mockCards,
}


// ---- Card Battle Mock Data ----
import { CardBattleState } from '../types';
import { mock } from 'node:test';


export const mockCardBattleState: CardBattleState = {
  "id": "79c2bcc3-9d38-469f-96ea-208e37cacac4",
  "battle_type": "pve",
  "status": "ongoing",
  "current_turn": 1,
  "current_player": 1,
  "phase": "start_turn",
  "created_at": "2025-09-22T07:42:55.170Z",
  "updated_at": "2025-09-23T06:21:59.768Z",
  "players": [
    {
      "team": 1,
      "player_id": "140b7bcd-9487-449d-a4b4-a9370d955651",
      "characters": mockPlayer1Characters,
      "deck": {
        "id": "f8266161-72a2-48a9-b232-82907b03b37e",
        "player_team": 1,
        "deck_cards": [],
        "hand_cards": [],
        "discard_cards": [],
        "current_energy": 0,
        "cards_drawn": 0,
        "remaining_cards": 50
      }
    },
    {
      "team": 2,
      "player_id": "bd1bb71f-03a4-4d9b-a431-88a8b3a3e056",
      "characters": mockPlayer2Characters,
      "deck": {
        "id": "b9e86a2b-f861-4608-bb6c-e25fd49916fa",
        "player_team": 2,
        "deck_cards": [],
        "hand_cards": [],
        "discard_cards": [],
        "current_energy": 0,
        "cards_drawn": 0,
        "remaining_cards": 50
      }
    }
  ]
}


// Mock responses for battle actions - these are used by the API layer
export const mockActionResult = {
  "success": true,
  "code": 200,
  "message": "Turn started successfully",
  "data": [
    {
      "id": "b387b6f1-5deb-4084-a242-d3721d09e408",
      "phase": "start_turn",
      "action_type": "start_turn",
      "actor": {
        "team": 1
      },
      "targets": [],
      "drawn_cards": [],
      "impacts": [],
      "result": {
        "success": true,
        "reason": "Turn 1 started for player 1"
      },
      "before_state": {
        "characters": mockPlayer1Characters,
        "turn": 1,
        "phase": "start_turn",
        "current_player": 1
      },
      "after_state": {
        "characters": mockPlayer1Characters,
        "turn": 1,
        "phase": "start_turn",
        "current_player": 1
      },
      "animation_hint": "turn_start",
      "created_at": "2025-09-23T06:22:00.808Z",
      "updated_at": "2025-09-23T06:22:00.808Z"
    }
  ],
  "errors": null
};

export const mockDrawCardResult = {
    "success": true,
    "code": 200,
    "message": "Action processed successfully",
    "data": [
        {
            "id": "6251eb37-a7c3-4b92-8116-cc8861c52c97",
            "phase": "draw_phase",
            "action_type": "draw_card",
            "actor": {
                "team": 1,
                "player_id": "885f2e07-085a-421c-be16-bfd3f041fa50"
            },
            "card": null,
            "targets": [],
            "drawn_cards": mockCards.slice(0, 5),
            "impacts": [],
            "result": {
                "success": true,
                "reason": "Drew 1 cards"
            },
            "before_state": null,
            "after_state": null,
            "animation_hint": "card_draw",
            "created_at": "2025-09-23T08:12:25.169Z",
            "updated_at": "2025-09-23T08:12:25.169Z"
        }
    ],
    "errors": null
}

export const mockPlayCardResult = {
  "success": true,
  "code": 200,
  "message": "Card played successfully",
  "data": [
      {
          "id": "eab0b24e-3ec4-4f10-9597-ded35ebf0106",
          "card_battle_id": "b205a2bd-4e64-4336-85c5-c950c70d0ca3",
          "turn": 1,
          "phase": "main_phase",
          "action_type": "play_card",
          "actor": {
              "team": 1,
              "character_id": "b8986789-aaa6-4d83-a259-cee923c91069"
          },
          "card": {
              "id": "87e0c450-39a0-4e43-b97c-bd15ba793d22",
              "name": "Ignite Strike",
              "group": "High Damage",
              "description": "Deals 250-300% damage to a single enemy. Damage increases by 50% if the target is under [Burning].",
              "icon_url": "",
              "card_type": "active",
              "energy_cost": 2
          },
          "targets": [
              {
                  "id": mockPlayer2Characters[0].id,
                  "team": 2,
                  "before": {
                      "characterId": mockPlayer2Characters[0].id,
                      "team": 2,
                      "max_hp": 367,
                      "hp": 0,
                      "atk": 131,
                      "def": 70,
                      "agi": 46,
                      "crit_rate": 6,
                      "crit_dmg": 155,
                      "res": 8,
                      "damage": 0,
                      "mitigation": 6,
                      "hit_rate": 96,
                      "dodge": 8,
                      "has_acted": false,
                      "active_effects": [
                          {
                              "name": "Cleanse",
                              "source": {
                                  "type": "skill",
                                  "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                              },
                              "stacks": 1,
                              "effectId": "Cleanse",
                              "customData": {},
                              "instanceId": "effect_1759202486459_wenw6y7",
                              "remainingDuration": 1
                          },
                          {
                              "name": "Cleanse",
                              "source": {
                                  "type": "skill",
                                  "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                              },
                              "stacks": 1,
                              "effectId": "Cleanse",
                              "customData": {},
                              "instanceId": "effect_1759202486459_azc1404",
                              "remainingDuration": 1
                          },
                          {
                              "name": "Cleanse",
                              "source": {
                                  "type": "skill",
                                  "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                              },
                              "stacks": 1,
                              "effectId": "Cleanse",
                              "customData": {},
                              "instanceId": "effect_1759203449163_sy6n001",
                              "remainingDuration": 1
                          },
                          {
                              "name": "Cleanse",
                              "source": {
                                  "type": "skill",
                                  "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                              },
                              "stacks": 1,
                              "effectId": "Cleanse",
                              "customData": {},
                              "instanceId": "effect_1759203449163_7m5jmfg",
                              "remainingDuration": 1
                          },
                          {
                              "name": "Cleanse",
                              "source": {
                                  "type": "skill",
                                  "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                              },
                              "stacks": 1,
                              "effectId": "Cleanse",
                              "customData": {},
                              "instanceId": "effect_1759208100279_zs3jh4n",
                              "remainingDuration": 1
                          }
                      ],
                      "equipped_skills": [
                          "462dcab7-036b-40fc-bab1-6f75b1a40686",
                          "da389554-8aa3-4edc-9452-9606c7cfb728"
                      ],
                      "shields": {},
                      "immunities": []
                  },
                  "after": {
                      "characterId": mockPlayer2Characters[0].id,
                      "team": 2,
                      "max_hp": 367,
                      "hp": 0,
                      "atk": 131,
                      "def": 70,
                      "agi": 46,
                      "crit_rate": 6,
                      "crit_dmg": 155,
                      "res": 8,
                      "damage": 0,
                      "mitigation": 6,
                      "hit_rate": 96,
                      "dodge": 8,
                      "has_acted": false,
                      "active_effects": [
                          {
                              "name": "Cleanse",
                              "source": {
                                  "type": "skill",
                                  "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                              },
                              "stacks": 1,
                              "effectId": "Cleanse",
                              "customData": {},
                              "instanceId": "effect_1759202486459_wenw6y7",
                              "remainingDuration": 1
                          },
                          {
                              "name": "Cleanse",
                              "source": {
                                  "type": "skill",
                                  "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                              },
                              "stacks": 1,
                              "effectId": "Cleanse",
                              "customData": {},
                              "instanceId": "effect_1759202486459_azc1404",
                              "remainingDuration": 1
                          },
                          {
                              "name": "Cleanse",
                              "source": {
                                  "type": "skill",
                                  "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                              },
                              "stacks": 1,
                              "effectId": "Cleanse",
                              "customData": {},
                              "instanceId": "effect_1759203449163_sy6n001",
                              "remainingDuration": 1
                          },
                          {
                              "name": "Cleanse",
                              "source": {
                                  "type": "skill",
                                  "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                              },
                              "stacks": 1,
                              "effectId": "Cleanse",
                              "customData": {},
                              "instanceId": "effect_1759203449163_7m5jmfg",
                              "remainingDuration": 1
                          },
                          {
                              "name": "Cleanse",
                              "source": {
                                  "type": "skill",
                                  "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                              },
                              "stacks": 1,
                              "effectId": "Cleanse",
                              "customData": {},
                              "instanceId": "effect_1759208100279_zs3jh4n",
                              "remainingDuration": 1
                          }
                      ],
                      "equipped_skills": [
                          "462dcab7-036b-40fc-bab1-6f75b1a40686",
                          "da389554-8aa3-4edc-9452-9606c7cfb728"
                      ],
                      "shields": {},
                      "immunities": []
                  },
                  "impacts": [
                      {
                          "type": "damage",
                          "value": 7478,
                          "meta": {
                              "isCritical": true
                          }
                      }
                  ]
              }
          ],
          "drawn_cards": [],
          "impacts": [
              {
                  "type": "damage",
                  "target_id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e",
                  "value": 7478
              }
          ],
          "result": {
              "success": true
          },
          "before_state": {
              "player1": {
                  "characters": [
                      {
                          "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                          "character_id": "198074bc-f3d6-4a2a-a41f-6721352341d4",
                          "name": "Bitcoin",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                          "team": 1,
                          "position": 1,
                          "max_hp": 6085,
                          "hp": 6085,
                          "atk": 2713,
                          "def": 1539,
                          "agi": 797,
                          "crit_rate": 19,
                          "crit_dmg": 330,
                          "res": 25,
                          "damage": 0,
                          "mitigation": 12,
                          "hit_rate": 102,
                          "dodge": 17,
                          "has_acted": false,
                          "active_effects": [],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                          ]
                      },
                      {
                          "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                          "character_id": "cdef6617-ef0d-4f07-b4f8-19c4861d3cb2",
                          "name": "Ethereum",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                          "team": 1,
                          "position": 2,
                          "max_hp": 5888,
                          "hp": 5888,
                          "atk": 2629,
                          "def": 1490,
                          "agi": 774,
                          "crit_rate": 18,
                          "crit_dmg": 323,
                          "res": 24,
                          "damage": 0,
                          "mitigation": 12,
                          "hit_rate": 102,
                          "dodge": 16,
                          "has_acted": false,
                          "active_effects": [],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                          ]
                      },
                      {
                          "id": "c3eefca3-dd92-4114-99eb-3255937cb111",
                          "character_id": "dceb0300-3a8e-48b7-8bf3-78a7647cb6bb",
                          "name": "BNB",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
                          "team": 1,
                          "position": 3,
                          "max_hp": 5890,
                          "hp": 5890,
                          "atk": 2629,
                          "def": 1490,
                          "agi": 773,
                          "crit_rate": 18,
                          "crit_dmg": 323,
                          "res": 24,
                          "damage": 0,
                          "mitigation": 12,
                          "hit_rate": 102,
                          "dodge": 16,
                          "has_acted": true,
                          "active_effects": [],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "7ef20f51-06fa-477b-a68b-1bb074f73802"
                          ]
                      }
                  ],
                  "hand_count": 4,
                  "deck_count": 50,
                  "energy": 97
              },
              "player2": {
                  "characters": [
                      {
                          "id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e",
                          "character_id": "593cf55b-b289-47e8-b319-982ec4d05ee3",
                          "name": "Ontology Gas",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3217.png",
                          "team": 2,
                          "position": 1,
                          "max_hp": 367,
                          "hp": 367,
                          "atk": 131,
                          "def": 70,
                          "agi": 46,
                          "crit_rate": 6,
                          "crit_dmg": 155,
                          "res": 8,
                          "damage": 0,
                          "mitigation": 6,
                          "hit_rate": 96,
                          "dodge": 8,
                          "has_acted": false,
                          "active_effects": [
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759202486459_wenw6y7",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759202486459_azc1404",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759203449163_sy6n001",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759203449163_7m5jmfg",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759208100279_zs3jh4n",
                                  "remainingDuration": 1
                              }
                          ],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "da389554-8aa3-4edc-9452-9606c7cfb728"
                          ]
                      },
                      {
                          "id": "aa5fc107-814d-4c42-9090-5bdf3aef9f73",
                          "character_id": "92c5a2ca-3d55-4f14-8010-3ef207ed2f15",
                          "name": "Telcoin",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2394.png",
                          "team": 2,
                          "position": 2,
                          "max_hp": 374,
                          "hp": 374,
                          "atk": 135,
                          "def": 74,
                          "agi": 43,
                          "crit_rate": 6,
                          "crit_dmg": 155,
                          "res": 8,
                          "damage": 0,
                          "mitigation": 6,
                          "hit_rate": 96,
                          "dodge": 8,
                          "has_acted": false,
                          "active_effects": [
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759202486459_7nzi66j",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759202486459_1osnmjg",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759203449163_y0ec77m",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759203449163_zurgyiw",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759208100280_exz0l1u",
                                  "remainingDuration": 1
                              }
                          ],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                          ]
                      },
                      {
                          "id": "6a45f1fc-6fdb-4963-8b2f-8946a55a7e9e",
                          "character_id": "195b96ff-32cc-4af1-82cc-388c89c835c2",
                          "name": "Celer Network",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
                          "team": 2,
                          "position": 3,
                          "max_hp": 367,
                          "hp": 367,
                          "atk": 131,
                          "def": 70,
                          "agi": 44,
                          "crit_rate": 6,
                          "crit_dmg": 155,
                          "res": 8,
                          "damage": 0,
                          "mitigation": 6,
                          "hit_rate": 96,
                          "dodge": 8,
                          "has_acted": false,
                          "active_effects": [],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                          ]
                      }
                  ],
                  "hand_count": 0,
                  "deck_count": 50,
                  "energy": 100
              }
          },
          "after_state": {
              "player1": {
                  "characters": [
                      {
                          "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                          "character_id": "198074bc-f3d6-4a2a-a41f-6721352341d4",
                          "name": "Bitcoin",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                          "team": 1,
                          "position": 1,
                          "max_hp": 6085,
                          "hp": 6085,
                          "atk": 2713,
                          "def": 1539,
                          "agi": 797,
                          "crit_rate": 19,
                          "crit_dmg": 330,
                          "res": 25,
                          "damage": 0,
                          "mitigation": 12,
                          "hit_rate": 102,
                          "dodge": 17,
                          "has_acted": true,
                          "active_effects": [],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                          ]
                      },
                      {
                          "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                          "character_id": "cdef6617-ef0d-4f07-b4f8-19c4861d3cb2",
                          "name": "Ethereum",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                          "team": 1,
                          "position": 2,
                          "max_hp": 5888,
                          "hp": 5888,
                          "atk": 2629,
                          "def": 1490,
                          "agi": 774,
                          "crit_rate": 18,
                          "crit_dmg": 323,
                          "res": 24,
                          "damage": 0,
                          "mitigation": 12,
                          "hit_rate": 102,
                          "dodge": 16,
                          "has_acted": false,
                          "active_effects": [],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                          ]
                      },
                      {
                          "id": "c3eefca3-dd92-4114-99eb-3255937cb111",
                          "character_id": "dceb0300-3a8e-48b7-8bf3-78a7647cb6bb",
                          "name": "BNB",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
                          "team": 1,
                          "position": 3,
                          "max_hp": 5890,
                          "hp": 5890,
                          "atk": 2629,
                          "def": 1490,
                          "agi": 773,
                          "crit_rate": 18,
                          "crit_dmg": 323,
                          "res": 24,
                          "damage": 0,
                          "mitigation": 12,
                          "hit_rate": 102,
                          "dodge": 16,
                          "has_acted": true,
                          "active_effects": [],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "7ef20f51-06fa-477b-a68b-1bb074f73802"
                          ]
                      }
                  ],
                  "hand_count": 2,
                  "deck_count": 50,
                  "energy": 95
              },
              "player2": {
                  "characters": [
                      {
                          "id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e",
                          "character_id": "593cf55b-b289-47e8-b319-982ec4d05ee3",
                          "name": "Ontology Gas",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3217.png",
                          "team": 2,
                          "position": 1,
                          "max_hp": 367,
                          "hp": 0,
                          "atk": 131,
                          "def": 70,
                          "agi": 46,
                          "crit_rate": 6,
                          "crit_dmg": 155,
                          "res": 8,
                          "damage": 0,
                          "mitigation": 6,
                          "hit_rate": 96,
                          "dodge": 8,
                          "has_acted": false,
                          "active_effects": [
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759202486459_wenw6y7",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759202486459_azc1404",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759203449163_sy6n001",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759203449163_7m5jmfg",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759208100279_zs3jh4n",
                                  "remainingDuration": 1
                              }
                          ],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "da389554-8aa3-4edc-9452-9606c7cfb728"
                          ]
                      },
                      {
                          "id": "aa5fc107-814d-4c42-9090-5bdf3aef9f73",
                          "character_id": "92c5a2ca-3d55-4f14-8010-3ef207ed2f15",
                          "name": "Telcoin",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2394.png",
                          "team": 2,
                          "position": 2,
                          "max_hp": 374,
                          "hp": 374,
                          "atk": 135,
                          "def": 74,
                          "agi": 43,
                          "crit_rate": 6,
                          "crit_dmg": 155,
                          "res": 8,
                          "damage": 0,
                          "mitigation": 6,
                          "hit_rate": 96,
                          "dodge": 8,
                          "has_acted": false,
                          "active_effects": [
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759202486459_7nzi66j",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759202486459_1osnmjg",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759203449163_y0ec77m",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759203449163_zurgyiw",
                                  "remainingDuration": 1
                              },
                              {
                                  "name": "Cleanse",
                                  "source": {
                                      "type": "skill",
                                      "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                  },
                                  "stacks": 1,
                                  "effectId": "Cleanse",
                                  "customData": {},
                                  "instanceId": "effect_1759208100280_exz0l1u",
                                  "remainingDuration": 1
                              }
                          ],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                          ]
                      },
                      {
                          "id": "6a45f1fc-6fdb-4963-8b2f-8946a55a7e9e",
                          "character_id": "195b96ff-32cc-4af1-82cc-388c89c835c2",
                          "name": "Celer Network",
                          "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
                          "team": 2,
                          "position": 3,
                          "max_hp": 367,
                          "hp": 367,
                          "atk": 131,
                          "def": 70,
                          "agi": 44,
                          "crit_rate": 6,
                          "crit_dmg": 155,
                          "res": 8,
                          "damage": 0,
                          "mitigation": 6,
                          "hit_rate": 96,
                          "dodge": 8,
                          "has_acted": false,
                          "active_effects": [],
                          "equipped_skills": [
                              "462dcab7-036b-40fc-bab1-6f75b1a40686",
                              "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                          ]
                      }
                  ],
                  "hand_count": 0,
                  "deck_count": 50,
                  "energy": 100
              }
          },
          "animation_hint": "skill_cast",
          "created_at": "2025-09-30T04:58:04.051Z",
          "updated_at": "2025-09-30T04:58:04.051Z"
      }
  ],
  "errors": null
}

export const mockEndTurnResult = {
  "success": true,
  "code": 200,
  "message": "Turn ended successfully",
  "data": [
      {
          "id": "5de9b77d-e748-41c5-bfb7-16c4f29acad4",
          "card_battle_id": "b205a2bd-4e64-4336-85c5-c950c70d0ca3",
          "turn": 1,
          "phase": "end_turn",
          "action_type": "end_turn",
          "actor": {
              "team": 1,
              "character_id": null
          },
          "targets": [],
          "drawn_cards": [],
          "impacts": [],
          "result": {
              "success": true,
              "reason": "Turn ended, switching to player 2"
          },
          "before_state": null,
          "after_state": null,
          "animation_hint": "turn_transition",
          "created_at": "2025-09-30T06:58:15.473Z",
          "updated_at": "2025-09-30T06:58:15.473Z"
      }
  ],
  "errors": null
}

export const mockAiTurnResult = {
    "success": true,
    "code": 200,
    "message": "AI turn processed successfully",
    "data": [
        {
            "id": "4a9faed8-0dc5-435f-af16-977885a74056",
            "card_battle_id": "b205a2bd-4e64-4336-85c5-c950c70d0ca3",
            "turn": 1,
            "phase": "draw_phase",
            "action_type": "draw_card",
            "actor": {
                "team": 2,
                "player_id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e"
            },
            "card": null,
            "targets": [],
            "drawn_cards": [
                {
                    "id": "2e7c2024-8da3-44b4-93ce-0d21ed13e09f",
                    "name": "Quick Regen",
                    "group": "Healing & Support",
                    "description": "Heals one random ally for 110% of the caster's Attack and applies [Sustain Healing].",
                    "icon_url": "",
                    "card_type": "active",
                    "energy_cost": 1
                },
                {
                    "id": "aab8c2aa-39bc-45cf-89ce-3a64a2a05f61",
                    "name": "Empowerment Heal",
                    "group": "Healing & Support",
                    "description": "Heals all allies for 150% of the caster's Attack and applies [Attack Buff] to them.",
                    "icon_url": "",
                    "card_type": "active",
                    "energy_cost": 2
                },
                {
                    "id": "c51e60f6-5811-4684-aef8-915c27ce6160",
                    "name": "Leech Wound",
                    "group": "High Damage",
                    "description": "Deals 300-350% damage to the enemy with the lowest HP. Damage increases by 50% if the target is under the [Bleeding] effect. Restores 25% of the caster's maximum HP if this ability kills an enemy.",
                    "icon_url": "",
                    "card_type": "active",
                    "energy_cost": 4
                },
                {
                    "id": "dc6f36ff-3812-4b1f-b533-2fdb36181a7e",
                    "name": "Break Armor",
                    "group": "High Damage",
                    "description": "Deals 300-350% damage to the enemy with the highest Attack. This attack ignores 40% of the target's armor. If the target is under [Armor Break], the damage increases by 25%.",
                    "icon_url": "",
                    "card_type": "active",
                    "energy_cost": 3
                },
                {
                    "id": "f8f2c7fe-1362-40d8-943c-facf46dac5ec",
                    "name": "Bypass Strike",
                    "group": "High Damage",
                    "description": "Deals 300-350% damage to the enemy with the highest HP. If the target is under [Slow Down] or [Freeze], this attack ignores 30% of their defense.",
                    "icon_url": "",
                    "card_type": "active",
                    "energy_cost": 3
                }
            ],
            "impacts": [],
            "result": {
                "success": true,
                "reason": "Drew 5 cards"
            },
            "before_state": null,
            "after_state": null,
            "animation_hint": "card_draw",
            "created_at": "2025-09-30T14:42:03.920Z",
            "updated_at": "2025-09-30T14:42:03.920Z"
        },
        {
            "id": "269d2db4-060b-4c3e-ada5-40d002558285",
            "card_battle_id": "b205a2bd-4e64-4336-85c5-c950c70d0ca3",
            "turn": 1,
            "phase": "main_phase",
            "action_type": "play_card",
            "actor": {
                "team": 2,
                "character_id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e",
                "player_id": "49135ce6-92f6-4aef-8e09-97a052241503"
            },
            "card": {
                "id": "2e7c2024-8da3-44b4-93ce-0d21ed13e09f",
                "name": "Quick Regen",
                "group": "Healing & Support",
                "description": "Heals one random ally for 110% of the caster's Attack and applies [Sustain Healing].",
                "icon_url": "",
                "card_type": "active",
                "energy_cost": 1
            },
            "targets": [
                {
                    "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                    "team": 1,
                    "before": {
                        "characterId": "b8986789-aaa6-4d83-a259-cee923c91069",
                        "team": 1,
                        "max_hp": 6085,
                        "hp": 6085,
                        "atk": 2713,
                        "def": 1539,
                        "agi": 797,
                        "crit_rate": 19,
                        "crit_dmg": 330,
                        "res": 25,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 17,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "after": {
                        "characterId": "b8986789-aaa6-4d83-a259-cee923c91069",
                        "team": 1,
                        "max_hp": 6085,
                        "hp": 6085,
                        "atk": 2713,
                        "def": 1539,
                        "agi": 797,
                        "crit_rate": 19,
                        "crit_dmg": 330,
                        "res": 25,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 17,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "impacts": [
                        {
                            "type": "heal",
                            "value": 144
                        }
                    ]
                },
                {
                    "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                    "team": 1,
                    "before": {
                        "characterId": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                        "team": 1,
                        "max_hp": 5888,
                        "hp": 5888,
                        "atk": 2629,
                        "def": 1490,
                        "agi": 774,
                        "crit_rate": 18,
                        "crit_dmg": 323,
                        "res": 24,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 16,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "after": {
                        "characterId": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                        "team": 1,
                        "max_hp": 5888,
                        "hp": 5888,
                        "atk": 2629,
                        "def": 1490,
                        "agi": 774,
                        "crit_rate": 18,
                        "crit_dmg": 323,
                        "res": 24,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 16,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "impacts": [
                        {
                            "type": "heal",
                            "value": 144
                        }
                    ]
                }
            ],
            "drawn_cards": [],
            "impacts": [
                {
                    "type": "healing",
                    "target_id": "b8986789-aaa6-4d83-a259-cee923c91069",
                    "value": 144
                },
                {
                    "type": "healing",
                    "target_id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                    "value": 144
                }
            ],
            "result": {
                "success": true
            },
            "before_state": {
                "player1": {
                    "characters": [
                        {
                            "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                            "character_id": "198074bc-f3d6-4a2a-a41f-6721352341d4",
                            "name": "Bitcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                            "team": 1,
                            "position": 1,
                            "max_hp": 6085,
                            "hp": 6085,
                            "atk": 2713,
                            "def": 1539,
                            "agi": 797,
                            "crit_rate": 19,
                            "crit_dmg": 330,
                            "res": 25,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 17,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                            "character_id": "cdef6617-ef0d-4f07-b4f8-19c4861d3cb2",
                            "name": "Ethereum",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                            "team": 1,
                            "position": 2,
                            "max_hp": 5888,
                            "hp": 5888,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 774,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "c3eefca3-dd92-4114-99eb-3255937cb111",
                            "character_id": "dceb0300-3a8e-48b7-8bf3-78a7647cb6bb",
                            "name": "BNB",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
                            "team": 1,
                            "position": 3,
                            "max_hp": 5890,
                            "hp": 5890,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 773,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "7ef20f51-06fa-477b-a68b-1bb074f73802"
                            ]
                        }
                    ],
                    "hand_count": 0,
                    "deck_count": 50,
                    "energy": 100
                },
                "player2": {
                    "characters": [
                        {
                            "id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e",
                            "character_id": "593cf55b-b289-47e8-b319-982ec4d05ee3",
                            "name": "Ontology Gas",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3217.png",
                            "team": 2,
                            "position": 1,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 46,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": false,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_wenw6y7",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_azc1404",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_sy6n001",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_7m5jmfg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100279_zs3jh4n",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736790_zdep6mo",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_sdliefy",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "da389554-8aa3-4edc-9452-9606c7cfb728"
                            ]
                        },
                        {
                            "id": "aa5fc107-814d-4c42-9090-5bdf3aef9f73",
                            "character_id": "92c5a2ca-3d55-4f14-8010-3ef207ed2f15",
                            "name": "Telcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2394.png",
                            "team": 2,
                            "position": 2,
                            "max_hp": 374,
                            "hp": 374,
                            "atk": 135,
                            "def": 74,
                            "agi": 43,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": false,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_7nzi66j",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_1osnmjg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_y0ec77m",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_zurgyiw",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100280_exz0l1u",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_el5y8zh",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_t9a7hzi",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        },
                        {
                            "id": "6a45f1fc-6fdb-4963-8b2f-8946a55a7e9e",
                            "character_id": "195b96ff-32cc-4af1-82cc-388c89c835c2",
                            "name": "Celer Network",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
                            "team": 2,
                            "position": 3,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 44,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        }
                    ],
                    "hand_count": 5,
                    "deck_count": 50,
                    "energy": 100
                }
            },
            "after_state": {
                "player1": {
                    "characters": [
                        {
                            "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                            "character_id": "198074bc-f3d6-4a2a-a41f-6721352341d4",
                            "name": "Bitcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                            "team": 1,
                            "position": 1,
                            "max_hp": 6085,
                            "hp": 6085,
                            "atk": 2713,
                            "def": 1539,
                            "agi": 797,
                            "crit_rate": 19,
                            "crit_dmg": 330,
                            "res": 25,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 17,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                            "character_id": "cdef6617-ef0d-4f07-b4f8-19c4861d3cb2",
                            "name": "Ethereum",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                            "team": 1,
                            "position": 2,
                            "max_hp": 5888,
                            "hp": 5888,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 774,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "c3eefca3-dd92-4114-99eb-3255937cb111",
                            "character_id": "dceb0300-3a8e-48b7-8bf3-78a7647cb6bb",
                            "name": "BNB",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
                            "team": 1,
                            "position": 3,
                            "max_hp": 5890,
                            "hp": 5890,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 773,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "7ef20f51-06fa-477b-a68b-1bb074f73802"
                            ]
                        }
                    ],
                    "hand_count": 0,
                    "deck_count": 50,
                    "energy": 100
                },
                "player2": {
                    "characters": [
                        {
                            "id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e",
                            "character_id": "593cf55b-b289-47e8-b319-982ec4d05ee3",
                            "name": "Ontology Gas",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3217.png",
                            "team": 2,
                            "position": 1,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 46,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": true,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_wenw6y7",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_azc1404",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_sy6n001",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_7m5jmfg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100279_zs3jh4n",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736790_zdep6mo",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_sdliefy",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "da389554-8aa3-4edc-9452-9606c7cfb728"
                            ]
                        },
                        {
                            "id": "aa5fc107-814d-4c42-9090-5bdf3aef9f73",
                            "character_id": "92c5a2ca-3d55-4f14-8010-3ef207ed2f15",
                            "name": "Telcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2394.png",
                            "team": 2,
                            "position": 2,
                            "max_hp": 374,
                            "hp": 374,
                            "atk": 135,
                            "def": 74,
                            "agi": 43,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": false,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_7nzi66j",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_1osnmjg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_y0ec77m",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_zurgyiw",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100280_exz0l1u",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_el5y8zh",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_t9a7hzi",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        },
                        {
                            "id": "6a45f1fc-6fdb-4963-8b2f-8946a55a7e9e",
                            "character_id": "195b96ff-32cc-4af1-82cc-388c89c835c2",
                            "name": "Celer Network",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
                            "team": 2,
                            "position": 3,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 44,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        }
                    ],
                    "hand_count": 4,
                    "deck_count": 50,
                    "energy": 99
                }
            },
            "animation_hint": "skill_cast",
            "created_at": "2025-09-30T14:42:04.126Z",
            "updated_at": "2025-09-30T14:42:04.126Z"
        },
        {
            "id": "d82c1f49-bc7b-4e3f-9461-15dfad0d2e44",
            "card_battle_id": "b205a2bd-4e64-4336-85c5-c950c70d0ca3",
            "turn": 1,
            "phase": "main_phase",
            "action_type": "play_card",
            "actor": {
                "team": 2,
                "character_id": "aa5fc107-814d-4c42-9090-5bdf3aef9f73",
                "player_id": "49135ce6-92f6-4aef-8e09-97a052241503"
            },
            "card": {
                "id": "aab8c2aa-39bc-45cf-89ce-3a64a2a05f61",
                "name": "Empowerment Heal",
                "group": "Healing & Support",
                "description": "Heals all allies for 150% of the caster's Attack and applies [Attack Buff] to them.",
                "icon_url": "",
                "card_type": "active",
                "energy_cost": 2
            },
            "targets": [
                {
                    "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                    "team": 1,
                    "before": {
                        "characterId": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                        "team": 1,
                        "max_hp": 5888,
                        "hp": 5888,
                        "atk": 2629,
                        "def": 1490,
                        "agi": 774,
                        "crit_rate": 18,
                        "crit_dmg": 323,
                        "res": 24,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 16,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "after": {
                        "characterId": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                        "team": 1,
                        "max_hp": 5888,
                        "hp": 5888,
                        "atk": 2629,
                        "def": 1490,
                        "agi": 774,
                        "crit_rate": 18,
                        "crit_dmg": 323,
                        "res": 24,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 16,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "impacts": [
                        {
                            "type": "heal",
                            "value": 202
                        }
                    ]
                },
                {
                    "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                    "team": 1,
                    "before": {
                        "characterId": "b8986789-aaa6-4d83-a259-cee923c91069",
                        "team": 1,
                        "max_hp": 6085,
                        "hp": 6085,
                        "atk": 2713,
                        "def": 1539,
                        "agi": 797,
                        "crit_rate": 19,
                        "crit_dmg": 330,
                        "res": 25,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 17,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "after": {
                        "characterId": "b8986789-aaa6-4d83-a259-cee923c91069",
                        "team": 1,
                        "max_hp": 6085,
                        "hp": 6085,
                        "atk": 2713,
                        "def": 1539,
                        "agi": 797,
                        "crit_rate": 19,
                        "crit_dmg": 330,
                        "res": 25,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 17,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "impacts": [
                        {
                            "type": "heal",
                            "value": 202
                        }
                    ]
                }
            ],
            "drawn_cards": [],
            "impacts": [
                {
                    "type": "healing",
                    "target_id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                    "value": 202
                },
                {
                    "type": "healing",
                    "target_id": "b8986789-aaa6-4d83-a259-cee923c91069",
                    "value": 202
                }
            ],
            "result": {
                "success": true
            },
            "before_state": {
                "player1": {
                    "characters": [
                        {
                            "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                            "character_id": "198074bc-f3d6-4a2a-a41f-6721352341d4",
                            "name": "Bitcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                            "team": 1,
                            "position": 1,
                            "max_hp": 6085,
                            "hp": 6085,
                            "atk": 2713,
                            "def": 1539,
                            "agi": 797,
                            "crit_rate": 19,
                            "crit_dmg": 330,
                            "res": 25,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 17,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                            "character_id": "cdef6617-ef0d-4f07-b4f8-19c4861d3cb2",
                            "name": "Ethereum",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                            "team": 1,
                            "position": 2,
                            "max_hp": 5888,
                            "hp": 5888,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 774,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "c3eefca3-dd92-4114-99eb-3255937cb111",
                            "character_id": "dceb0300-3a8e-48b7-8bf3-78a7647cb6bb",
                            "name": "BNB",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
                            "team": 1,
                            "position": 3,
                            "max_hp": 5890,
                            "hp": 5890,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 773,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "7ef20f51-06fa-477b-a68b-1bb074f73802"
                            ]
                        }
                    ],
                    "hand_count": 0,
                    "deck_count": 50,
                    "energy": 100
                },
                "player2": {
                    "characters": [
                        {
                            "id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e",
                            "character_id": "593cf55b-b289-47e8-b319-982ec4d05ee3",
                            "name": "Ontology Gas",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3217.png",
                            "team": 2,
                            "position": 1,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 46,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": true,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_wenw6y7",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_azc1404",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_sy6n001",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_7m5jmfg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100279_zs3jh4n",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736790_zdep6mo",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_sdliefy",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "da389554-8aa3-4edc-9452-9606c7cfb728"
                            ]
                        },
                        {
                            "id": "aa5fc107-814d-4c42-9090-5bdf3aef9f73",
                            "character_id": "92c5a2ca-3d55-4f14-8010-3ef207ed2f15",
                            "name": "Telcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2394.png",
                            "team": 2,
                            "position": 2,
                            "max_hp": 374,
                            "hp": 374,
                            "atk": 135,
                            "def": 74,
                            "agi": 43,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": false,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_7nzi66j",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_1osnmjg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_y0ec77m",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_zurgyiw",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100280_exz0l1u",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_el5y8zh",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_t9a7hzi",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        },
                        {
                            "id": "6a45f1fc-6fdb-4963-8b2f-8946a55a7e9e",
                            "character_id": "195b96ff-32cc-4af1-82cc-388c89c835c2",
                            "name": "Celer Network",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
                            "team": 2,
                            "position": 3,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 44,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        }
                    ],
                    "hand_count": 4,
                    "deck_count": 50,
                    "energy": 99
                }
            },
            "after_state": {
                "player1": {
                    "characters": [
                        {
                            "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                            "character_id": "198074bc-f3d6-4a2a-a41f-6721352341d4",
                            "name": "Bitcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                            "team": 1,
                            "position": 1,
                            "max_hp": 6085,
                            "hp": 6085,
                            "atk": 2713,
                            "def": 1539,
                            "agi": 797,
                            "crit_rate": 19,
                            "crit_dmg": 330,
                            "res": 25,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 17,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                            "character_id": "cdef6617-ef0d-4f07-b4f8-19c4861d3cb2",
                            "name": "Ethereum",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                            "team": 1,
                            "position": 2,
                            "max_hp": 5888,
                            "hp": 5888,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 774,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "c3eefca3-dd92-4114-99eb-3255937cb111",
                            "character_id": "dceb0300-3a8e-48b7-8bf3-78a7647cb6bb",
                            "name": "BNB",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
                            "team": 1,
                            "position": 3,
                            "max_hp": 5890,
                            "hp": 5890,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 773,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "7ef20f51-06fa-477b-a68b-1bb074f73802"
                            ]
                        }
                    ],
                    "hand_count": 0,
                    "deck_count": 50,
                    "energy": 100
                },
                "player2": {
                    "characters": [
                        {
                            "id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e",
                            "character_id": "593cf55b-b289-47e8-b319-982ec4d05ee3",
                            "name": "Ontology Gas",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3217.png",
                            "team": 2,
                            "position": 1,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 46,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": true,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_wenw6y7",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_azc1404",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_sy6n001",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_7m5jmfg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100279_zs3jh4n",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736790_zdep6mo",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_sdliefy",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "da389554-8aa3-4edc-9452-9606c7cfb728"
                            ]
                        },
                        {
                            "id": "aa5fc107-814d-4c42-9090-5bdf3aef9f73",
                            "character_id": "92c5a2ca-3d55-4f14-8010-3ef207ed2f15",
                            "name": "Telcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2394.png",
                            "team": 2,
                            "position": 2,
                            "max_hp": 374,
                            "hp": 374,
                            "atk": 135,
                            "def": 74,
                            "agi": 43,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": true,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_7nzi66j",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_1osnmjg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_y0ec77m",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_zurgyiw",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100280_exz0l1u",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_el5y8zh",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_t9a7hzi",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        },
                        {
                            "id": "6a45f1fc-6fdb-4963-8b2f-8946a55a7e9e",
                            "character_id": "195b96ff-32cc-4af1-82cc-388c89c835c2",
                            "name": "Celer Network",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
                            "team": 2,
                            "position": 3,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 44,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        }
                    ],
                    "hand_count": 3,
                    "deck_count": 50,
                    "energy": 97
                }
            },
            "animation_hint": "skill_cast",
            "created_at": "2025-09-30T14:42:04.159Z",
            "updated_at": "2025-09-30T14:42:04.159Z"
        },
        {
            "id": "09c2c768-360b-4c58-9dac-c2046b147dd2",
            "card_battle_id": "b205a2bd-4e64-4336-85c5-c950c70d0ca3",
            "turn": 1,
            "phase": "main_phase",
            "action_type": "play_card",
            "actor": {
                "team": 2,
                "character_id": "6a45f1fc-6fdb-4963-8b2f-8946a55a7e9e",
                "player_id": "49135ce6-92f6-4aef-8e09-97a052241503"
            },
            "card": {
                "id": "c51e60f6-5811-4684-aef8-915c27ce6160",
                "name": "Leech Wound",
                "group": "High Damage",
                "description": "Deals 300-350% damage to the enemy with the lowest HP. Damage increases by 50% if the target is under the [Bleeding] effect. Restores 25% of the caster's maximum HP if this ability kills an enemy.",
                "icon_url": "",
                "card_type": "active",
                "energy_cost": 4
            },
            "targets": [
                {
                    "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                    "team": 1,
                    "before": {
                        "characterId": "b8986789-aaa6-4d83-a259-cee923c91069",
                        "team": 1,
                        "max_hp": 6085,
                        "hp": 6085,
                        "atk": 2713,
                        "def": 1539,
                        "agi": 797,
                        "crit_rate": 19,
                        "crit_dmg": 330,
                        "res": 25,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 17,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "after": {
                        "characterId": "b8986789-aaa6-4d83-a259-cee923c91069",
                        "team": 1,
                        "max_hp": 6085,
                        "hp": 6084,
                        "atk": 2713,
                        "def": 1539,
                        "agi": 797,
                        "crit_rate": 19,
                        "crit_dmg": 330,
                        "res": 25,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 17,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "impacts": [
                        {
                            "type": "damage",
                            "value": 1,
                            "meta": {
                                "isCritical": true
                            }
                        }
                    ]
                },
                {
                    "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                    "team": 1,
                    "before": {
                        "characterId": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                        "team": 1,
                        "max_hp": 5888,
                        "hp": 5888,
                        "atk": 2629,
                        "def": 1490,
                        "agi": 774,
                        "crit_rate": 18,
                        "crit_dmg": 323,
                        "res": 24,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 16,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "after": {
                        "characterId": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                        "team": 1,
                        "max_hp": 5888,
                        "hp": 5887,
                        "atk": 2629,
                        "def": 1490,
                        "agi": 774,
                        "crit_rate": 18,
                        "crit_dmg": 323,
                        "res": 24,
                        "damage": 0,
                        "mitigation": 12,
                        "hit_rate": 102,
                        "dodge": 16,
                        "has_acted": false,
                        "active_effects": [],
                        "equipped_skills": [
                            "462dcab7-036b-40fc-bab1-6f75b1a40686",
                            "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                        ],
                        "shields": {},
                        "immunities": []
                    },
                    "impacts": [
                        {
                            "type": "damage",
                            "value": 1,
                            "meta": {
                                "isCritical": true
                            }
                        }
                    ]
                }
            ],
            "drawn_cards": [],
            "impacts": [
                {
                    "type": "damage",
                    "target_id": "b8986789-aaa6-4d83-a259-cee923c91069",
                    "value": 1
                },
                {
                    "type": "damage",
                    "target_id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                    "value": 1
                }
            ],
            "result": {
                "success": true
            },
            "before_state": {
                "player1": {
                    "characters": [
                        {
                            "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                            "character_id": "198074bc-f3d6-4a2a-a41f-6721352341d4",
                            "name": "Bitcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                            "team": 1,
                            "position": 1,
                            "max_hp": 6085,
                            "hp": 6085,
                            "atk": 2713,
                            "def": 1539,
                            "agi": 797,
                            "crit_rate": 19,
                            "crit_dmg": 330,
                            "res": 25,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 17,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                            "character_id": "cdef6617-ef0d-4f07-b4f8-19c4861d3cb2",
                            "name": "Ethereum",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                            "team": 1,
                            "position": 2,
                            "max_hp": 5888,
                            "hp": 5888,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 774,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "c3eefca3-dd92-4114-99eb-3255937cb111",
                            "character_id": "dceb0300-3a8e-48b7-8bf3-78a7647cb6bb",
                            "name": "BNB",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
                            "team": 1,
                            "position": 3,
                            "max_hp": 5890,
                            "hp": 5890,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 773,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "7ef20f51-06fa-477b-a68b-1bb074f73802"
                            ]
                        }
                    ],
                    "hand_count": 0,
                    "deck_count": 50,
                    "energy": 100
                },
                "player2": {
                    "characters": [
                        {
                            "id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e",
                            "character_id": "593cf55b-b289-47e8-b319-982ec4d05ee3",
                            "name": "Ontology Gas",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3217.png",
                            "team": 2,
                            "position": 1,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 46,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": true,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_wenw6y7",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_azc1404",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_sy6n001",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_7m5jmfg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100279_zs3jh4n",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736790_zdep6mo",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_sdliefy",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "da389554-8aa3-4edc-9452-9606c7cfb728"
                            ]
                        },
                        {
                            "id": "aa5fc107-814d-4c42-9090-5bdf3aef9f73",
                            "character_id": "92c5a2ca-3d55-4f14-8010-3ef207ed2f15",
                            "name": "Telcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2394.png",
                            "team": 2,
                            "position": 2,
                            "max_hp": 374,
                            "hp": 374,
                            "atk": 135,
                            "def": 74,
                            "agi": 43,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": true,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_7nzi66j",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_1osnmjg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_y0ec77m",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_zurgyiw",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100280_exz0l1u",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_el5y8zh",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_t9a7hzi",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        },
                        {
                            "id": "6a45f1fc-6fdb-4963-8b2f-8946a55a7e9e",
                            "character_id": "195b96ff-32cc-4af1-82cc-388c89c835c2",
                            "name": "Celer Network",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
                            "team": 2,
                            "position": 3,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 44,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        }
                    ],
                    "hand_count": 3,
                    "deck_count": 50,
                    "energy": 97
                }
            },
            "after_state": {
                "player1": {
                    "characters": [
                        {
                            "id": "b8986789-aaa6-4d83-a259-cee923c91069",
                            "character_id": "198074bc-f3d6-4a2a-a41f-6721352341d4",
                            "name": "Bitcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                            "team": 1,
                            "position": 1,
                            "max_hp": 6085,
                            "hp": 6084,
                            "atk": 2713,
                            "def": 1539,
                            "agi": 797,
                            "crit_rate": 19,
                            "crit_dmg": 330,
                            "res": 25,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 17,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "a22f95fc-41cd-45eb-84fd-b0aba2423a78",
                            "character_id": "cdef6617-ef0d-4f07-b4f8-19c4861d3cb2",
                            "name": "Ethereum",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                            "team": 1,
                            "position": 2,
                            "max_hp": 5888,
                            "hp": 5887,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 774,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e9c25efc-8de5-4d7e-9882-1b370613ac88"
                            ]
                        },
                        {
                            "id": "c3eefca3-dd92-4114-99eb-3255937cb111",
                            "character_id": "dceb0300-3a8e-48b7-8bf3-78a7647cb6bb",
                            "name": "BNB",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
                            "team": 1,
                            "position": 3,
                            "max_hp": 5890,
                            "hp": 5890,
                            "atk": 2629,
                            "def": 1490,
                            "agi": 773,
                            "crit_rate": 18,
                            "crit_dmg": 323,
                            "res": 24,
                            "damage": 0,
                            "mitigation": 12,
                            "hit_rate": 102,
                            "dodge": 16,
                            "has_acted": false,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "7ef20f51-06fa-477b-a68b-1bb074f73802"
                            ]
                        }
                    ],
                    "hand_count": 0,
                    "deck_count": 50,
                    "energy": 100
                },
                "player2": {
                    "characters": [
                        {
                            "id": "c40255a7-fd56-48d3-8d39-c4ad052d1a3e",
                            "character_id": "593cf55b-b289-47e8-b319-982ec4d05ee3",
                            "name": "Ontology Gas",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3217.png",
                            "team": 2,
                            "position": 1,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 46,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": true,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_wenw6y7",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_azc1404",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_sy6n001",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_7m5jmfg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100279_zs3jh4n",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736790_zdep6mo",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_sdliefy",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "da389554-8aa3-4edc-9452-9606c7cfb728"
                            ]
                        },
                        {
                            "id": "aa5fc107-814d-4c42-9090-5bdf3aef9f73",
                            "character_id": "92c5a2ca-3d55-4f14-8010-3ef207ed2f15",
                            "name": "Telcoin",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2394.png",
                            "team": 2,
                            "position": 2,
                            "max_hp": 374,
                            "hp": 374,
                            "atk": 135,
                            "def": 74,
                            "agi": 43,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": true,
                            "active_effects": [
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_7nzi66j",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759202486459_1osnmjg",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_y0ec77m",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759203449163_zurgyiw",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759208100280_exz0l1u",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_el5y8zh",
                                    "remainingDuration": 1
                                },
                                {
                                    "name": "Cleanse",
                                    "source": {
                                        "type": "skill",
                                        "characterId": "c3eefca3-dd92-4114-99eb-3255937cb111"
                                    },
                                    "stacks": 1,
                                    "effectId": "Cleanse",
                                    "customData": {},
                                    "instanceId": "effect_1759236736803_t9a7hzi",
                                    "remainingDuration": 1
                                }
                            ],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        },
                        {
                            "id": "6a45f1fc-6fdb-4963-8b2f-8946a55a7e9e",
                            "character_id": "195b96ff-32cc-4af1-82cc-388c89c835c2",
                            "name": "Celer Network",
                            "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
                            "team": 2,
                            "position": 3,
                            "max_hp": 367,
                            "hp": 367,
                            "atk": 131,
                            "def": 70,
                            "agi": 44,
                            "crit_rate": 6,
                            "crit_dmg": 155,
                            "res": 8,
                            "damage": 0,
                            "mitigation": 6,
                            "hit_rate": 96,
                            "dodge": 8,
                            "has_acted": true,
                            "active_effects": [],
                            "equipped_skills": [
                                "462dcab7-036b-40fc-bab1-6f75b1a40686",
                                "e8c71e5d-c48d-41ff-9cd9-fd501ccf1e89"
                            ]
                        }
                    ],
                    "hand_count": 2,
                    "deck_count": 50,
                    "energy": 93
                }
            },
            "animation_hint": "skill_cast",
            "created_at": "2025-09-30T14:42:04.212Z",
            "updated_at": "2025-09-30T14:42:04.212Z"
        },
        {
            "id": "6db8450b-722f-45a4-9284-127a08790f70",
            "card_battle_id": "b205a2bd-4e64-4336-85c5-c950c70d0ca3",
            "turn": 1,
            "phase": "end_turn",
            "action_type": "end_turn",
            "actor": {
                "team": 2,
                "character_id": null
            },
            "targets": [],
            "drawn_cards": [],
            "impacts": [],
            "result": {
                "success": true,
                "reason": "Turn ended, switching to player 1"
            },
            "before_state": null,
            "after_state": null,
            "animation_hint": "turn_transition",
            "created_at": "2025-09-30T14:42:04.221Z",
            "updated_at": "2025-09-30T14:42:04.221Z"
        }
    ],
    "errors": null
}

// ---- Battle Log Data ----
export const mockBattleLogs: BattleLogEntry[] = [
  {
    type: 'draw_phase',
    player_team: 1,
    description: 'Battle started - Player 1 draws initial cards'
  },
  {
    type: 'play_card',
    player_team: 1,
    card_id: 'fire_bolt_001',
    target_ids: ['enemy_char_1'],
    description: 'Player cast Fire Bolt'
  },
  {
    type: 'end_turn',
    player_team: 1,
    description: 'Player ended turn'
  },
  {
    type: 'play_card',
    player_team: 2,
    card_id: 'shadow_strike',
    target_ids: ['player_char_1'],
    description: 'Enemy cast Shadow Strike'
  }
];
