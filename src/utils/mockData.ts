// ---- Skills ----
// NOTE: mockSkills usage has been replaced with API calls for CharacterDetail component

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
          { type: "target_has_effect", value: "slow_down", modifier: { armor_ignore: 30 } },
          { type: "target_has_effect", value: "freeze", modifier: { armor_ignore: 30 } }
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
  characters: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
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
    "id": "87a3290c-7c24-4f77-bbfd-c09fb2b33d06",
    "name": "Floor 1",
    "player_id": "e412b2fe-1118-4bee-9726-f5a683bdd5c3",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Avalanche",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
        "hp": 88,
        "atk": 17,
        "def": 9
      },
      {
        "name": "Cardano",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png",
        "hp": 86,
        "atk": 18,
        "def": 7
      }
    ]
  },
  {
    "id": "140c88cf-682d-46a5-af2b-1975b5cbae64",
    "name": "Floor 2",
    "player_id": "61d5c219-5292-431c-bd44-bea65022a6b8",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Bitcoin Cash",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1831.png",
        "hp": 98,
        "atk": 18,
        "def": 9
      },
      {
        "name": "BNB",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
        "hp": 93,
        "atk": 19,
        "def": 9
      }
    ]
  },
  {
    "id": "ec425c62-83b7-4f29-be27-3bdf7d20ea94",
    "name": "Floor 3",
    "player_id": "567f1b28-d26e-48fb-a57a-573140270afe",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Bitcoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
        "hp": 106,
        "atk": 21,
        "def": 9
      }
    ]
  },
  {
    "id": "ef12edcd-da24-44d1-bbfd-3f5d45c7ba0d",
    "name": "Floor 4",
    "player_id": "8bab427a-d8c7-4338-84a6-bf4502255c2e",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Cronos",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png",
        "hp": 111,
        "atk": 22,
        "def": 10
      },
      {
        "name": "Dogecoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
        "hp": 114,
        "atk": 24,
        "def": 11
      }
    ]
  },
  {
    "id": "091acd13-ac50-46e1-8186-60bcef26983a",
    "name": "Floor 5",
    "player_id": "1dbb9194-5b38-4c2c-bd2b-0b6c68e01f02",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Ethena",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/30171.png",
        "hp": 122,
        "atk": 24,
        "def": 13
      },
      {
        "name": "Polkadot",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
        "hp": 117,
        "atk": 24,
        "def": 14
      }
    ]
  },
  {
    "id": "1978f20a-4b08-4620-89f0-6e2477187d46",
    "name": "Floor 6",
    "player_id": "bc88ffea-07d3-4f4e-b5aa-26e485863453",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Ethereum",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
        "hp": 128,
        "atk": 27,
        "def": 13
      }
    ]
  },
  {
    "id": "16c8dee0-0743-4452-a7da-432c77231fbd",
    "name": "Floor 7",
    "player_id": "3188f8ab-0e20-4da0-aa99-144c0c8c16b5",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Hedera",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/4642.png",
        "hp": 134,
        "atk": 30,
        "def": 16
      },
      {
        "name": "Hyperliquid",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png",
        "hp": 139,
        "atk": 28,
        "def": 15
      }
    ]
  },
  {
    "id": "e0b8883b-50b8-44a4-aeb7-7cc51f4d4ab2",
    "name": "Floor 8",
    "player_id": "2aa20a6f-fa37-49ba-9097-556afce480d6",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Chainlink",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png",
        "hp": 143,
        "atk": 31,
        "def": 17
      }
    ]
  },
  {
    "id": "561b79b6-08fc-4386-8d36-f3681020bbf2",
    "name": "Floor 9",
    "player_id": "114920fc-ca6c-4818-8802-db3526bc522a",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Litecoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2.png",
        "hp": 149,
        "atk": 32,
        "def": 16
      },
      {
        "name": "Mantle",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png",
        "hp": 153,
        "atk": 32,
        "def": 18
      }
    ]
  },
  {
    "id": "7a9bd214-d12e-4278-bdf4-3274d5f84585",
    "name": "Floor 10",
    "player_id": "1011b252-59d9-419d-bda1-a8a666d2209d",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Solana",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
        "hp": 162,
        "atk": 35,
        "def": 20
      },
      {
        "name": "Shiba Inu",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png",
        "hp": 158,
        "atk": 36,
        "def": 20
      }
    ]
  },
  {
    "id": "d52c5b5a-fbd5-4588-ab07-8837705bcbed",
    "name": "Floor 11",
    "player_id": "04af6365-965e-4327-8583-975232c0de9a",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Sui",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
        "hp": 167,
        "atk": 38,
        "def": 20
      }
    ]
  },
  {
    "id": "263e7ef0-618f-4392-9207-fc6683f33680",
    "name": "Floor 12",
    "player_id": "25ae6a70-6aa0-4a16-8431-a850a993788f",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Toncoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
        "hp": 175,
        "atk": 39,
        "def": 21
      },
      {
        "name": "TRON",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
        "hp": 178,
        "atk": 40,
        "def": 21
      }
    ]
  },
  {
    "id": "02b9068e-fb8d-4ce3-aca4-f48d3ab71837",
    "name": "Floor 13",
    "player_id": "6cb559dc-e8c1-4ce5-b21c-831bc6af07fe",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "World Liberty Financial",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/33251.png",
        "hp": 183,
        "atk": 40,
        "def": 21
      },
      {
        "name": "Uniswap",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png",
        "hp": 182,
        "atk": 40,
        "def": 21
      }
    ]
  },
  {
    "id": "12ffb1b3-257c-4f7e-833f-8c55214b1516",
    "name": "Floor 14",
    "player_id": "2cda0cbc-4d88-4954-8eff-066b52548ad5",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Stellar",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/512.png",
        "hp": 194,
        "atk": 43,
        "def": 22
      }
    ]
  },
  {
    "id": "93740f02-586b-4bb9-ae0c-6912d7d6f549",
    "name": "Floor 15",
    "player_id": "a772e00c-2d6e-4aa0-a35c-b1008b1f8565",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Monero",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/328.png",
        "hp": 198,
        "atk": 46,
        "def": 24
      },
      {
        "name": "XRP",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/52.png",
        "hp": 197,
        "atk": 44,
        "def": 26
      }
    ]
  },
  {
    "id": "eb10ac6a-d409-4c8b-8930-49f6b56f4899",
    "name": "Floor 16",
    "player_id": "3e41a420-0444-4f63-942d-8d2e98b5f199",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Cardano",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png",
        "hp": 208,
        "atk": 48,
        "def": 25
      },
      {
        "name": "Avalanche",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
        "hp": 209,
        "atk": 48,
        "def": 27
      },
      {
        "name": "Aave",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7278.png",
        "hp": 211,
        "atk": 47,
        "def": 26
      }
    ]
  },
  {
    "id": "8e160960-90b4-49dd-b043-dd7e40324e68",
    "name": "Floor 17",
    "player_id": "1307f21f-5cc7-4728-89cf-8899aa56d532",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Algorand",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/4030.png",
        "hp": 216,
        "atk": 49,
        "def": 28
      },
      {
        "name": "Aptos",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/21794.png",
        "hp": 219,
        "atk": 49,
        "def": 28
      },
      {
        "name": "Bitcoin Cash",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1831.png",
        "hp": 218,
        "atk": 50,
        "def": 26
      }
    ]
  },
  {
    "id": "bc8b15b9-26a5-4d2d-80b2-ad4a415f705c",
    "name": "Floor 18",
    "player_id": "585dd91f-442c-4a3f-8f35-e5763c6b39a1",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Cosmos",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png",
        "hp": 221,
        "atk": 51,
        "def": 29
      },
      {
        "name": "Bitcoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
        "hp": 223,
        "atk": 51,
        "def": 28
      },
      {
        "name": "Arbitrum",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
        "hp": 224,
        "atk": 52,
        "def": 28
      }
    ]
  },
  {
    "id": "c8318b74-1b3a-4d14-9119-8f0114503d90",
    "name": "Floor 19",
    "player_id": "18b93edd-58f4-4995-a4e3-26ccf5016821",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Dogecoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
        "hp": 234,
        "atk": 52,
        "def": 28
      },
      {
        "name": "Cronos",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png",
        "hp": 232,
        "atk": 54,
        "def": 28
      },
      {
        "name": "Ethereum Classic",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1321.png",
        "hp": 234,
        "atk": 54,
        "def": 30
      }
    ]
  },
  {
    "id": "ac455659-fe6a-4617-a557-cbfc7b2c6456",
    "name": "Floor 20",
    "player_id": "9e1015ae-44cc-4938-ad8a-627be776c8fa",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Internet Computer",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/8916.png",
        "hp": 243,
        "atk": 55,
        "def": 31
      },
      {
        "name": "Ethena",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/30171.png",
        "hp": 239,
        "atk": 54,
        "def": 32
      },
      {
        "name": "Story",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/35626.png",
        "hp": 241,
        "atk": 55,
        "def": 30
      }
    ]
  },
  {
    "id": "b7b5edb2-0492-4fc4-835a-0079cb0e93d7",
    "name": "Floor 21",
    "player_id": "0d4bc6d4-a851-44c2-b027-50ca199c628b",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "MYX Finance",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/36410.png",
        "hp": 248,
        "atk": 56,
        "def": 32
      },
      {
        "name": "Kaspa",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/20396.png",
        "hp": 251,
        "atk": 56,
        "def": 31
      },
      {
        "name": "Ethereum",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
        "hp": 249,
        "atk": 56,
        "def": 31
      }
    ]
  },
  {
    "id": "d7c77ec6-01a2-4b70-85bb-a46751ef8e75",
    "name": "Floor 22",
    "player_id": "6381ccce-3274-4e82-8aa3-13dfa84ae5ec",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "NEAR Protocol",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png",
        "hp": 255,
        "atk": 59,
        "def": 34
      },
      {
        "name": "Hedera",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/4642.png",
        "hp": 253,
        "atk": 59,
        "def": 33
      },
      {
        "name": "Hyperliquid",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png",
        "hp": 258,
        "atk": 59,
        "def": 34
      }
    ]
  },
  {
    "id": "837549fd-32c0-469b-9eb2-594892dbd2ac",
    "name": "Floor 23",
    "player_id": "6d050746-f368-40ec-a6da-03f53c3fa93b",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "OKB",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/3897.png",
        "hp": 261,
        "atk": 62,
        "def": 35
      },
      {
        "name": "Ondo",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/21159.png",
        "hp": 261,
        "atk": 61,
        "def": 34
      },
      {
        "name": "Chainlink",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png",
        "hp": 263,
        "atk": 61,
        "def": 34
      }
    ]
  },
  {
    "id": "376978f7-e26c-4e5d-a1cd-e962c6930fde",
    "name": "Floor 24",
    "player_id": "86fcd43a-c1ba-413b-af8f-2317f379fcbe",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Mantle",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png",
        "hp": 270,
        "atk": 62,
        "def": 35
      },
      {
        "name": "Litecoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/2.png",
        "hp": 274,
        "atk": 64,
        "def": 34
      },
      {
        "name": "Pudgy Penguins",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/34466.png",
        "hp": 272,
        "atk": 62,
        "def": 34
      }
    ]
  },
  {
    "id": "98e999c1-e1ca-45ac-b9a8-9f878873c9cd",
    "name": "Floor 25",
    "player_id": "cc9911ae-e6fb-4053-a475-dd5e11a318a5",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Pepe",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
        "hp": 282,
        "atk": 66,
        "def": 37
      },
      {
        "name": "Solana",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
        "hp": 282,
        "atk": 65,
        "def": 36
      },
      {
        "name": "Pi",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/35697.png",
        "hp": 279,
        "atk": 66,
        "def": 38
      }
    ]
  },
  {
    "id": "8f7b8c64-ec11-40e4-8fdb-347d006055b2",
    "name": "Floor 26",
    "player_id": "e7875282-9b8d-4b38-a691-a55ce2a85a92",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Sui",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
        "hp": 291,
        "atk": 68,
        "def": 37
      },
      {
        "name": "POL (prev. MATIC)",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/28321.png",
        "hp": 290,
        "atk": 66,
        "def": 38
      },
      {
        "name": "Pump.fun",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/36507.png",
        "hp": 290,
        "atk": 66,
        "def": 37
      }
    ]
  },
  {
    "id": "16d789d9-a5c4-4439-b014-b1b1a6f00da0",
    "name": "Floor 27",
    "player_id": "39296d65-1eb1-4388-a8f4-060f65fead50",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Toncoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
        "hp": 296,
        "atk": 70,
        "def": 38
      },
      {
        "name": "TRON",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
        "hp": 293,
        "atk": 68,
        "def": 40
      },
      {
        "name": "Render",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/5690.png",
        "hp": 299,
        "atk": 70,
        "def": 40
      }
    ]
  },
  {
    "id": "c8b3108d-7251-4175-82be-317f4cc93ec4",
    "name": "Floor 28",
    "player_id": "0ad73893-9312-4597-8f44-c874b13c8627",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Uniswap",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png",
        "hp": 305,
        "atk": 70,
        "def": 39
      },
      {
        "name": "World Liberty Financial",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/33251.png",
        "hp": 303,
        "atk": 72,
        "def": 41
      },
      {
        "name": "Bittensor",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/22974.png",
        "hp": 301,
        "atk": 71,
        "def": 41
      }
    ]
  },
  {
    "id": "e026c821-5536-40c2-bcc1-fb1e5b303257",
    "name": "Floor 29",
    "player_id": "8a0b9ecf-dd50-432f-8df8-2bdedffe2226",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Worldcoin",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/13502.png",
        "hp": 311,
        "atk": 74,
        "def": 40
      },
      {
        "name": "Stellar",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/512.png",
        "hp": 313,
        "atk": 74,
        "def": 42
      }
    ]
  },
  {
    "id": "956a25d3-b70d-45c8-a7d6-9752cad11ea5",
    "name": "Floor 30",
    "player_id": "940a9a5b-9919-4166-bd6a-1b59699bc066",
    "rewards": "{\"chest\":1}",
    "is_completed": false,
    "characters": [
      {
        "name": "Arbitrum",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
        "hp": 319,
        "atk": 76,
        "def": 43
      },
      {
        "name": "Internet Computer",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/8916.png",
        "hp": 318,
        "atk": 75,
        "def": 42
      },
      {
        "name": "Pepe",
        "avatar_url": "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
        "hp": 317,
        "atk": 76,
        "def": 42
      }
    ]
  }
];

// ---- Card Battle Mock Data ----
import { CardBattleState, CardBattleCharacter, CardBattleDeck, CardInDeck, BattleRewards } from '../types';
import { mockCards } from './cardData';

// Mock characters for battle
const mockBattleCharacters: CardBattleCharacter[] = [
  {
    id: 'char_001',
    character_id: 'player_char_1',
    name: 'Bitcoin',
    avatar_url: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    rarity: 'legendary',
    team: 1,
    position: 0,
    max_hp: 120,
    current_hp: 120,
    atk: 45,
    def: 25,
    agi: 15,
    crit_rate: 10,
    crit_dmg: 150,
    res: 8,
    damage: 15,
    mitigation: 5,
    hit_rate: 95,
    dodge: 10,
    has_acted: false,
    active_effects: [],
    equipped_skills: ['skill_001', 'skill_002']
  },
  {
    id: 'char_002',
    character_id: 'player_char_2',
    name: 'Ethereum',
    avatar_url: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    rarity: 'epic',
    team: 1,
    position: 1,
    max_hp: 100,
    current_hp: 100,
    atk: 40,
    def: 20,
    agi: 20,
    crit_rate: 12,
    crit_dmg: 160,
    res: 10,
    damage: 12,
    mitigation: 3,
    hit_rate: 92,
    dodge: 15,
    has_acted: false,
    active_effects: [],
    equipped_skills: ['skill_003']
  }
];

const mockEnemyCharacters: CardBattleCharacter[] = [
  {
    id: 'enemy_001',
    character_id: 'enemy_char_1',
    name: 'Cardano',
    avatar_url: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png',
    rarity: 'rare',
    team: 2,
    position: 0,
    max_hp: 90,
    current_hp: 90,
    atk: 35,
    def: 18,
    agi: 18,
    crit_rate: 8,
    crit_dmg: 140,
    res: 6,
    damage: 10,
    mitigation: 4,
    hit_rate: 90,
    dodge: 12,
    has_acted: false,
    active_effects: [],
    equipped_skills: ['skill_004']
  },
  {
    id: 'enemy_002',
    character_id: 'enemy_char_2',
    name: 'Solana',
    avatar_url: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
    rarity: 'uncommon',
    team: 2,
    position: 1,
    max_hp: 85,
    current_hp: 85,
    atk: 32,
    def: 15,
    agi: 22,
    crit_rate: 14,
    crit_dmg: 170,
    res: 5,
    damage: 8,
    mitigation: 2,
    hit_rate: 88,
    dodge: 18,
    has_acted: false,
    active_effects: [],
    equipped_skills: ['skill_005']
  }
];

// Helper function to create deck cards from mockCards
function createMockDeckCards(count: number = 30): CardInDeck[] {
  const deckCards: CardInDeck[] = [];
  for (let i = 0; i < count; i++) {
    const cardIndex = i % mockCards.length;
    deckCards.push({
      card_id: `${mockCards[cardIndex].id}_deck_${i}`,
      position: i + 1,
      card: mockCards[cardIndex]
    });
  }
  return deckCards;
}

function createMockHandCards(count: number = 5): CardInDeck[] {
  const handCards: CardInDeck[] = [];
  for (let i = 0; i < count; i++) {
    const cardIndex = i % mockCards.length;
    handCards.push({
      card_id: `${mockCards[cardIndex].id}_hand_${i}`,
      position: i + 1,
      card: mockCards[cardIndex]
    });
  }
  return handCards;
}

const mockPlayer1Deck: CardBattleDeck = {
  id: 'deck_player_1',
  player_team: 1,
  deck_cards: createMockDeckCards(25),
  hand_cards: createMockHandCards(5),
  discard_cards: [],
  current_energy: 3,
  cards_drawn: 1
};

const mockPlayer2Deck: CardBattleDeck = {
  id: 'deck_player_2',
  player_team: 2,
  deck_cards: createMockDeckCards(25),
  hand_cards: createMockHandCards(5),
  discard_cards: [],
  current_energy: 3,
  cards_drawn: 1
};

export const mockCardBattleState: CardBattleState = {
  id: 'battle_mock_001',
  battle_type: 'pve',
  status: 'ongoing',
  current_turn: 1,
  current_player: 1,
  player1: {
    characters: mockBattleCharacters,
    deck: mockPlayer1Deck
  },
  player2: {
    characters: mockEnemyCharacters,
    deck: mockPlayer2Deck
  },
  phase: 'main_phase'
};

export const mockBattleRewards: BattleRewards = {
  gold: 150,
  experience: 300,
  items: [
    { id: 'item_001', name: 'Health Potion', quantity: 2 },
    { id: 'item_002', name: 'Energy Crystal', quantity: 1 }
  ],
  newLevel: false
};

// ---- Extended Mock Data for Complete Battle Flow ----
import { DrawPhaseResult, BattlePhaseResult, BattleMoveResponse, AIAction, BattleActionResult, BattleLogEntry } from '../types';

export const mockDrawPhaseResult: DrawPhaseResult = {
  success: true,
  drawn_cards: [
    {
      id: 'fire_bolt_001',
      name: 'Fire Bolt',
      group: 'High Damage',
      description: 'Deal 25 fire damage to target enemy',
      card_type: 'attack',
      energy_cost: 2,
      rarity: 'common'
    }
  ],
  updated_hand: [],
  energy: 4,
  status_effects: [],
  actions_performed: [{
    type: 'draw_phase',
    player_team: 1,
    description: 'Drew 1 card and gained 1 energy'
  }]
};

export const mockBattleActionResult: BattleActionResult = {
  success: true,
  damage_dealt: 25,
  actions_performed: [{
    type: 'play_card',
    player_team: 1,
    card_id: 'fire_bolt_001',
    target_ids: ['enemy_char_1'],
    description: 'Fire Bolt dealt 25 damage to enemy'
  }]
};

export const mockPlayCardResponse: BattleMoveResponse = {
  success: true,
  result: mockBattleActionResult
};

export const mockAIActions: AIAction[] = [
  {
    type: 'draw_phase',
    player_team: 2,
    actions_performed: [{
      type: 'draw_phase',
      player_team: 2,
      description: 'AI drew cards and gained energy'
    }]
  },
  {
    type: 'play_card',
    player_team: 2,
    character_id: 'enemy_char_1',
    card_id: 'shadow_strike',
    target_ids: ['player_char_1'],
    result: {
      success: true,
      damage_dealt: 20,
      actions_performed: [{
        type: 'play_card',
        player_team: 2,
        character_id: 'enemy_char_1',
        card_id: 'shadow_strike',
        target_ids: ['player_char_1'],
        description: 'Enemy cast Shadow Strike for 20 damage'
      }]
    },
    actions_performed: [{
      type: 'play_card',
      player_team: 2,
      character_id: 'enemy_char_1',
      card_id: 'shadow_strike',
      target_ids: ['player_char_1'],
      description: 'Enemy cast Shadow Strike for 20 damage'
    }]
  }
];

export const mockEndTurnResult: BattlePhaseResult = {
  success: true,
  phase: 'ai_turn',
  current_turn: 2,
  current_player: 2,
  ai_actions: mockAIActions,
  actions_performed: [{
    type: 'end_turn',
    player_team: 1,
    description: 'Player ended turn'
  }]
};

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