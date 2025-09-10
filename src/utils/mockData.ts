// ---- Skills ----
// NOTE: mockSkills usage has been replaced with API calls for CharacterDetail component

import { mock } from "node:test";

// This data is kept for other components that haven't been migrated yet
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
          { type: "target_has_effect", value: "slow_down", modifier: { armor_ignore: 30 }},
          { type: "target_has_effect", value: "freeze", modifier: { armor_ignore: 30 }}
        ]
      }
    ]
  }
];

// ---- Characters (Crypto Inspired) ----
// NOTE: mockCharacters usage has been replaced with API calls for Characters and CharacterDetail components
// This data is kept for other components that haven't been migrated yet
export const mockCharacters = [
  {
    id: "9b4df68d-92cc-48b9-a574-7ee45b571b79",
    name: "Cardano",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png",
    description: "Cardano (ADA) is a cryptocurrency launched in 2017. Cardano has a current supply of 44,994,785,666.317157 with 35,767,053,299.79184 in circulation. The last known price of Cardano is 0.89396995 USD and is up 1.08 over the last 24 hours. It is currently trading on 1578 active market(s) with $1,326,074,753.34 traded over the last 24 hours. More information can be found at https://www.cardano.org.",
    c_type: "player",
    c_class: "support",
    rarity: "legendary",
    hp: 130,
    atk: 25,
    def: 18,
    agi: 16,
    crit_rate: 6,
    crit_dmg: 140,
    res: 15,
    damage: 0,
    mitigation: 8,
    hit_rate: 97,
    dodge: 9,
    level: 1,
    exp: 450,
    created_at: "2025-09-10T14:24:32.751Z",
    updated_at: "2025-09-10T14:24:32.751Z",
    skills: mockSkills
  },
  {
    id: "f5c67bf8-ee85-4943-a155-ef856dc922a0",
    name: "Avalanche",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
    description: "Avalanche (AVAX) is a cryptocurrency launched in 2020. Avalanche has a current supply of 457,277,985.48916084 with 422,275,285.48916084 in circulation. The last known price of Avalanche is 28.35960523 USD and is up 8.49 over the last 24 hours. It is currently trading on 971 active market(s) with $1,372,638,367.94 traded over the last 24 hours. More information can be found at https://avax.network/.",
    c_type: "player",
    c_class: "ranger",
    rarity: "epic",
    hp: 110,
    atk: 30,
    def: 12,
    agi: 22,
    crit_rate: 12,
    crit_dmg: 160,
    res: 8,
    damage: 10,
    mitigation: 4,
    hit_rate: 95,
    dodge: 15,
    level: 1,
    exp: 300,
    created_at: "2025-09-10T14:24:32.887Z",
    updated_at: "2025-09-10T14:24:32.887Z",
    skills: mockSkills
  },
  {
    id: "6e281e2b-7956-4a64-b056-c25c8f9e5f17",
    name: "Bitcoin Cash",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/1831.png",
    description: "Bitcoin Cash (BCH) is a cryptocurrency . Users are able to generate BCH through the process of mining. Bitcoin Cash has a current supply of 19,923,546.875. The last known price of Bitcoin Cash is 587.42264175 USD and is up 0.34 over the last 24 hours. It is currently trading on 1062 active market(s) with $431,763,378.98 traded over the last 24 hours. More information can be found at http://bch.info.",
    c_type: "player",
    c_class: "warrior",
    rarity: "rare",
    hp: 150,
    atk: 35,
    def: 20,
    agi: 10,
    crit_rate: 5,
    crit_dmg: 130,
    res: 10,
    damage: 5,
    mitigation: 6,
    hit_rate: 93,
    dodge: 7,
    level: 1,
    exp: 200,
    created_at: "2025-09-10T14:24:32.902Z",
    updated_at: "2025-09-10T14:24:32.902Z",
    skills: mockSkills
  },
  {
    id: "9c150bb9-20c0-4cee-95e4-a5f82f754318",
    name: "Bitcoin",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
    description: "Bitcoin (BTC) is a cryptocurrency launched in 2009. Users are able to generate BTC through the process of mining. Bitcoin has a current supply of 19,923,587.5. The last known price of Bitcoin is 103387.35131749 USD and is up 2.30 over the last 24 hours. It is currently trading on 12161 active market(s) with $65,283,347,628.44 traded over the last 24 hours. More information can be found at https://bitcoin.org/en/.",
    c_type: "player",
    c_class: "mage",
    rarity: "epic",
    hp: 100,
    atk: 28,
    def: 10,
    agi: 18,
    crit_rate: 10,
    crit_dmg: 150,
    res: 12,
    damage: 15,
    mitigation: 3,
    hit_rate: 96,
    dodge: 12,
    level: 1,
    exp: 320,
    created_at: "2025-09-10T14:24:32.904Z",
    updated_at: "2025-09-10T14:24:32.904Z",
    skills: mockSkills
  },
  {
    id: "88641372-3f51-4109-91f0-37011cf3b6a9",
    name: "Dai",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png",
    description: "Dai (DAI) is a cryptocurrency and operates on the Ethereum platform. Dai has a current supply of 5,441,128,697.333167 with 5,441,128,697.333167 in circulation. The last known price of Dai is 0.99994576 USD and is down -0.01 over the last 24 hours. It is currently trading on 3907 active market(s) with $189,806,687.62 traded over the last 24 hours. More information can be found at https://makerdao.com/.",
    c_type: "player",
    c_class: "assassin",
    rarity: "legendary",
    hp: 105,
    atk: 32,
    def: 11,
    agi: 25,
    crit_rate: 15,
    crit_dmg: 140,
    res: 12,
    damage: 0,
    mitigation: 8,
    hit_rate: 97,
    dodge: 9,
    level: 1,
    exp: 0,
    created_at: "2025-09-10T14:24:32.907Z",
    updated_at: "2025-09-10T14:24:32.907Z",
    skills: mockSkills
  },
  {
    id: "c34ac478-c204-4c90-ba64-feace6a00f24",
    name: "Dogecoin",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
    description: "Dogecoin (DOGE) is a cryptocurrency . Users are able to generate DOGE through the process of mining. Dogecoin has a current supply of 148,177,926,383.70517. The last known price of Dogecoin is 0.24546876 USD and is up 2.67 over the last 24 hours. It is currently trading on 1240 active market(s) with $2,897,149,192.06 traded over the last 24 hours. More information can be found at http://dogecoin.com/.",
    c_type: "player",
    c_class: "tank",
    rarity: "rare",
    hp: 160,
    atk: 20,
    def: 25,
    agi: 8,
    crit_rate: 4,
    crit_dmg: 120,
    res: 18,
    damage: 3,
    mitigation: 10,
    hit_rate: 92,
    dodge: 5,
    level: 1,
    exp: 150,
    created_at: "2025-09-10T14:24:32.910Z",
    updated_at: "2025-09-10T14:24:32.910Z",
    skills: mockSkills
  },
  {
    id: "3f2d36ec-394f-4150-8e6c-c9f4f673b6c2",
    name: "Ethereum",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    description: "Ethereum (ETH) is a cryptocurrency . Ethereum has a current supply of 120,923,737.48125075. The last known price of Ethereum is 3410.78408511 USD and is down -0.41 over the last 24 hours. It is currently trading on 10023 active market(s) with $23,468,212,108.09 traded over the last 24 hours. More information can be found at https://www.ethereum.org/.",
    c_type: "player",
    c_class: "illusionist",
    rarity: "epic",
    hp: 115,
    atk: 26,
    def: 14,
    agi: 20,
    crit_rate: 11,
    crit_dmg: 155,
    res: 10,
    damage: 12,
    mitigation: 4,
    hit_rate: 95,
    dodge: 14,
    level: 1,
    exp: 280,
    created_at: "2025-09-10T14:24:32.912Z",
    updated_at: "2025-09-10T14:24:32.912Z",
    skills: mockSkills
  },
  {
    id: "ef946366-56ef-4126-a2e0-15ff683aa732",
    name: "Chainlink",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png",
    description: "Chainlink (LINK) is a cryptocurrency and operates on the Ethereum platform. Chainlink has a current supply of 1,000,000,000 with 626,849,971.3083414 in circulation. The last known price of Chainlink is 18.35194482 USD and is down -0.62 over the last 24 hours. It is currently trading on 2339 active market(s) with $463,250,149.46 traded over the last 24 hours. More information can be found at https://chain.link/.",
    c_type: "player",
    c_class: "battlemage",
    rarity: "rare",
    hp: 125,
    atk: 29,
    def: 16,
    agi: 15,
    crit_rate: 7,
    crit_dmg: 135,
    res: 14,
    damage: 7,
    mitigation: 5,
    hit_rate: 94,
    dodge: 8,
    level: 1,
    exp: 220,
    created_at: "2025-09-10T14:24:32.933Z",
    updated_at: "2025-09-10T14:24:32.933Z",
    skills: mockSkills
  },
  {
    id: "8c058eb5-8c2a-40fc-8778-f1d25697ce4a",
    name: "Shiba Inu",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png",
    description: "Shiba Inu (SHIB) is a cryptocurrency and operates on the Ethereum platform. Shiba Inu has a current supply of 589,260,548,167,974.6 with 589,260,548,167,974.6 in circulation. The last known price of Shiba Inu is 0.00002939 USD and is up 2.32 over the last 24 hours. It is currently trading on 1075 active market(s) with $1,093,413,058.99 traded over the last 24 hours. More information can be found at https://shibatoken.com/.",
    c_type: "player",
    c_class: "battlemage",
    rarity: "rare",
    hp: 125,
    atk: 29,
    def: 16,
    agi: 15,
    crit_rate: 7,
    crit_dmg: 135,
    res: 14,
    damage: 7,
    mitigation: 5,
    hit_rate: 94,
    dodge: 8,
    level: 1,
    exp: 220,
    created_at: "2025-09-10T14:24:32.935Z",
    updated_at: "2025-09-10T14:24:32.935Z",
    skills: mockSkills
  },
  {
    id: "c8223274-1261-4549-be66-d777dbd128d7",
    name: "Solana",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
    description: "Solana (SOL) is a cryptocurrency launched in 2020. Solana has a current supply of 592,606,276.1118444 with 480,361,413.89088845 in circulation. The last known price of Solana is 216.38489557 USD and is up 0.94 over the last 24 hours. It is currently trading on 985 active market(s) with $4,865,216,820.98 traded over the last 24 hours. More information can be found at https://solana.com.",
    c_type: "player",
    c_class: "illusionist",
    rarity: "epic",
    hp: 115,
    atk: 26,
    def: 14,
    agi: 20,
    crit_rate: 11,
    crit_dmg: 155,
    res: 10,
    damage: 12,
    mitigation: 4,
    hit_rate: 95,
    dodge: 14,
    level: 1,
    exp: 280,
    created_at: "2025-09-10T14:24:32.936Z",
    updated_at: "2025-09-10T14:24:32.936Z",
    skills: mockSkills
  },
  {
    id: "77ce3f89-3701-4999-bd59-709c0c8559a6",
    name: "Toncoin",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
    description: "Toncoin (TON) is a cryptocurrency . Toncoin has a current supply of 5,124,714,726.990672 with 2,708,936,297.9441123 in circulation. The last known price of Toncoin is 7.20114992 USD and is down -0.73 over the last 24 hours. It is currently trading on 670 active market(s) with $349,677,540.64 traded over the last 24 hours. More information can be found at https://ton.org/.",
    c_type: "player",
    c_class: "illusionist",
    rarity: "epic",
    hp: 115,
    atk: 26,
    def: 14,
    agi: 20,
    crit_rate: 11,
    crit_dmg: 155,
    res: 10,
    damage: 12,
    mitigation: 4,
    hit_rate: 95,
    dodge: 14,
    level: 1,
    exp: 280,
    created_at: "2025-09-10T14:24:32.938Z",
    updated_at: "2025-09-10T14:24:32.938Z",
    skills: mockSkills
  },
  {
    id: "cbf39f6c-fddb-4450-8e12-b3b207f6d3ba",
    name: "TRON",
    avatar_url: "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
    description: "TRON (TRX) is a cryptocurrency launched in 2017. TRON has a current supply of 86,028,727,105.10579 with 86,028,726,764.1948 in circulation. The last known price of TRON is 0.19005473 USD and is down -0.22 over the last 24 hours. It is currently trading on 1150 active market(s) with $494,001,824.23 traded over the last 24 hours. More information can be found at https://tron.network/.",
    c_type: "player",
    c_class: "ranger",
    rarity: "epic",
    hp: 110,
    atk: 30,
    def: 12,
    agi: 22,
    crit_rate: 12,
    crit_dmg: 160,
    res: 8,
    damage: 10,
    mitigation: 4,
    hit_rate: 95,
    dodge: 15,
    level: 1,
    exp: 300,
    created_at: "2025-09-10T14:24:32.940Z",
    updated_at: "2025-09-10T14:24:32.940Z",
    skills: mockSkills
  }
];

// ---- Player ----
// NOTE: mockPlayer usage has been replaced with API calls for PlayerDetail component
// This data is kept for other components that haven't been migrated yet
export const mockPlayer = {
  id: "P1",
  username: "Satoshi",
  farcaster_id: "player_fc_001",
  level: 15,
  exp: 3500,
  awaking: 2,
  star: 2,
  points: 5,
  created_at: "2025-09-01T00:00:00.000Z",
  updated_at: "2025-09-08T06:00:00.000Z",
  sta: 12,
  str: 18,
  agi: 14,
  luck: 9,
  characters: ["1","2","3","4","5","6","7","8","9","10"],
  lineup: {
    positions: ["1", "2", null, null]
  },
  inventory: [
    { id: "I1", name: "Healing Potion", quantity: 5 },
    { id: "I2", name: "Mana Potion", quantity: 3 }
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
    is_boss_stage: false,
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
        is_boss_stage: false,
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
        is_boss_stage: false,
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
        is_boss_stage: false,
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
        is_boss_stage: true,
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
    is_boss_stage: false,
    stages: []
  }
];