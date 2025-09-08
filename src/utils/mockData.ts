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
    ticker: "BTC",
    avatar_url: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    description: "A resilient knight representing the strength of Bitcoin.",
    c_type: "hero",
    c_class: "paladin",
    team: 1,
    position: 1,
    max_hp: 170, current_hp: 170, current_energy: 0,
    atk: 32, def: 24, agi: 10, crit_rate: 8, crit_dmg: 120, res: 10,
    damage: 0, mitigation: 8, hit_rate: 99, dodge: 7,
    equipped_skills: ["S1", "S2", "S3"], activeEffects: [],
    shields: {}, immunities: ["stun"],
    level: 12, exp: 1800, points: 0, farcaster_id: "btc_fc", username: "BTC Paladin"
  },
  {
    id: "2",
    name: "ETH Mage",
    ticker: "ETH",
    avatar_url: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    description: "Master of arcane energy, channeling Ethereum's power.",
    c_type: "hero", c_class: "mage", team: 1, position: 2,
    max_hp: 110, current_hp: 110, current_energy: 40,
    atk: 38, def: 10, agi: 14, crit_rate: 15, crit_dmg: 135, res: 12,
    damage: 8, mitigation: 2, hit_rate: 97, dodge: 13,
    equipped_skills: ["S1", "S2"], activeEffects: [],
    shields: {}, immunities: [],
    level: 10, exp: 1500, points: 0, farcaster_id: "eth_fc", username: "ETH Mage"
  },
  {
    id: "3",
    name: "ADA Guardian",
    ticker: "ADA",
    avatar_url: "https://cryptologos.cc/logos/cardano-ada-logo.png",
    description: "The steadfast protector, Cardano's shield.",
    c_type: "hero", c_class: "guardian", team: 1, position: 3,
    max_hp: 160, current_hp: 160, current_energy: 20,
    atk: 24, def: 28, agi: 11, crit_rate: 8, crit_dmg: 125, res: 13,
    damage: 0, mitigation: 10, hit_rate: 98, dodge: 9,
    equipped_skills: ["S1", "S3"], activeEffects: [],
    shields: {}, immunities: ["poison"],
    level: 11, exp: 1400, points: 0, farcaster_id: "ada_fc", username: "ADA Guardian"
  },
  {
    id: "4",
    name: "SOL Archer",
    ticker: "SOL",
    avatar_url: "https://cryptologos.cc/logos/solana-sol-logo.png",
    description: "Swift and precise as the Solana network.",
    c_type: "hero", c_class: "archer", team: 1, position: 4,
    max_hp: 105, current_hp: 105, current_energy: 50,
    atk: 35, def: 12, agi: 18, crit_rate: 15, crit_dmg: 145, res: 8,
    damage: 12, mitigation: 3, hit_rate: 99, dodge: 18,
    equipped_skills: ["S1", "S2"], activeEffects: [],
    shields: {}, immunities: [],
    level: 9, exp: 1100, points: 0, farcaster_id: "sol_fc", username: "SOL Archer"
  },
  {
    id: "5",
    name: "DOGE Warrior",
    ticker: "DOGE",
    avatar_url: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
    description: "So strong. Much wow. The people's champion.",
    c_type: "hero", c_class: "warrior", team: 1, position: 5,
    max_hp: 145, current_hp: 145, current_energy: 10,
    atk: 29, def: 19, agi: 15, crit_rate: 11, crit_dmg: 127, res: 10,
    damage: 6, mitigation: 4, hit_rate: 97, dodge: 12,
    equipped_skills: ["S1", "S3"], activeEffects: [],
    shields: {}, immunities: [],
    level: 8, exp: 900, points: 0, farcaster_id: "doge_fc", username: "DOGE Warrior"
  },
  {
    id: "6",
    name: "BNB Monk",
    ticker: "BNB",
    avatar_url: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
    description: "Balanced and reliable, BNB brings order.",
    c_type: "hero", c_class: "monk", team: 1, position: 6,
    max_hp: 130, current_hp: 130, current_energy: 30,
    atk: 33, def: 18, agi: 14, crit_rate: 10, crit_dmg: 122, res: 11,
    damage: 4, mitigation: 5, hit_rate: 96, dodge: 13,
    equipped_skills: ["S1"], activeEffects: [],
    shields: {}, immunities: [],
    level: 7, exp: 750, points: 0, farcaster_id: "bnb_fc", username: "BNB Monk"
  },
  {
    id: "7",
    name: "XRP Assassin",
    ticker: "XRP",
    avatar_url: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
    description: "Deadly and fast, strikes in a flash.",
    c_type: "hero", c_class: "assassin", team: 1, position: 7,
    max_hp: 100, current_hp: 100, current_energy: 60,
    atk: 40, def: 9, agi: 20, crit_rate: 18, crit_dmg: 155, res: 6,
    damage: 14, mitigation: 1, hit_rate: 99, dodge: 22,
    equipped_skills: ["S1", "S2"], activeEffects: [],
    shields: {}, immunities: [],
    level: 8, exp: 840, points: 0, farcaster_id: "xrp_fc", username: "XRP Assassin"
  },
  {
    id: "8",
    name: "AVAX Sorceress",
    ticker: "AVAX",
    avatar_url: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    description: "Mistress of the elements, swift and powerful.",
    c_type: "hero", c_class: "sorceress", team: 1, position: 8,
    max_hp: 102, current_hp: 102, current_energy: 37,
    atk: 36, def: 11, agi: 16, crit_rate: 13, crit_dmg: 140, res: 9,
    damage: 8, mitigation: 2, hit_rate: 98, dodge: 15,
    equipped_skills: ["S2"], activeEffects: [],
    shields: {}, immunities: [],
    level: 7, exp: 700, points: 0, farcaster_id: "avax_fc", username: "AVAX Sorceress"
  },
  {
    id: "9",
    name: "MATIC Ranger",
    ticker: "MATIC",
    avatar_url: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    description: "The versatile scout, traversing any terrain.",
    c_type: "hero", c_class: "ranger", team: 1, position: 9,
    max_hp: 120, current_hp: 120, current_energy: 20,
    atk: 28, def: 15, agi: 17, crit_rate: 12, crit_dmg: 130, res: 8,
    damage: 6, mitigation: 4, hit_rate: 97, dodge: 14,
    equipped_skills: ["S1"], activeEffects: [],
    shields: {}, immunities: [],
    level: 6, exp: 600, points: 0, farcaster_id: "matic_fc", username: "MATIC Ranger"
  },
  {
    id: "10",
    name: "LTC Berserker",
    ticker: "LTC",
    avatar_url: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
    description: "Furious and relentless, brings the Litecoin thunder.",
    c_type: "hero", c_class: "berserker", team: 1, position: 10,
    max_hp: 135, current_hp: 135, current_energy: 10,
    atk: 39, def: 13, agi: 12, crit_rate: 14, crit_dmg: 138, res: 9,
    damage: 10, mitigation: 3, hit_rate: 97, dodge: 10,
    equipped_skills: ["S1", "S3"], activeEffects: [],
    shields: {}, immunities: [],
    level: 7, exp: 690, points: 0, farcaster_id: "ltc_fc", username: "LTC Berserker"
  }
];

// ---- Player ----
export const mockPlayer = {
  id: "P1",
  username: "Satoshi",
  farcaster_id: "player_fc_001",
  level: 15,
  exp: 3500,
  awaking: 2,
  star: 2,
  points: 0,
  created_at: "2025-09-01T00:00:00.000Z",
  updated_at: "2025-09-08T06:00:00.000Z",
  stats: {
    stamina: 12,
    strength: 18,
    agility: 14,
    luck: 9,
    intelligence: 15,
    vitality: 16,
  },
  characters: ["1","2","3","4","5","6","7","8","9","10"],
  formation: {
    positions: ["1", "2", null, null]
  },
  inventory: [
    { id: "I1", name: "Healing Potion", quantity: 5 },
    { id: "I2", name: "Mana Potion", quantity: 3 }
  ]
};

// ---- Stages ----
export const mockDungeons = [
  {
    id: "stage-1",
    name: "Genesis Valley",
    description: "The first world on your crypto adventure.",
    thumbnail_url: "https://example.com/stages/genesis-thumb.jpg",
    background_url: "https://example.com/stages/genesis-bg.jpg",
    music_url: "https://example.com/stages/genesis.mp3",
    created_at: "2025-09-01T00:00:00.000Z",
    updated_at: "2025-09-08T06:00:00.000Z",
    parent_stage_id: null,
    difficulty: 1,
    energy_cost: 5,
    max_attempts: 10,
    rewards: [
      { type: "exp", amount: 1000 },
      { type: "gold", amount: 1000 }
    ],
    is_boss_stage: false,
    battles: [],
    chapters: [
      {
        id: "stage-1-1",
        name: "Genesis 1",
        description: "First steps in Genesis Valley.",
        thumbnail_url: "https://example.com/stages/genesis-1-thumb.jpg",
        background_url: "https://example.com/stages/genesis-bg.jpg",
        music_url: null,
        created_at: "2025-09-01T01:00:00.000Z",
        updated_at: "2025-09-08T06:00:00.000Z",
        parent_stage_id: "stage-1",
        difficulty: 1,
        energy_cost: 5,
        max_attempts: 3,
        rewards: [
          { type: "exp", amount: 100 },
          { type: "gold", amount: 50 }
        ],
        is_boss_stage: false,
        battles: []
      },
      {
        id: "stage-1-2",
        name: "Genesis 2",
        description: "Deeper into Genesis Valley.",
        thumbnail_url: "https://example.com/stages/genesis-2-thumb.jpg",
        background_url: "https://example.com/stages/genesis-bg.jpg",
        music_url: null,
        created_at: "2025-09-01T02:00:00.000Z",
        updated_at: "2025-09-08T06:00:00.000Z",
        parent_stage_id: "stage-1",
        difficulty: 2,
        energy_cost: 5,
        max_attempts: 3,
        rewards: [
          { type: "exp", amount: 120 },
          { type: "gold", amount: 60 }
        ],
        is_boss_stage: false,
        battles: []
      },
      {
        id: "stage-1-3",
        name: "Genesis 3",
        description: "Monsters grow stronger.",
        thumbnail_url: "https://example.com/stages/genesis-3-thumb.jpg",
        background_url: "https://example.com/stages/genesis-bg.jpg",
        music_url: null,
        created_at: "2025-09-01T03:00:00.000Z",
        updated_at: "2025-09-08T06:00:00.000Z",
        parent_stage_id: "stage-1",
        difficulty: 3,
        energy_cost: 5,
        max_attempts: 3,
        rewards: [
          { type: "exp", amount: 140 },
          { type: "gold", amount: 70 }
        ],
        is_boss_stage: false,
        battles: []
      },
      {
        id: "stage-1-4",
        name: "Genesis 4",
        description: "A fateful encounter awaits.",
        thumbnail_url: "https://example.com/stages/genesis-4-thumb.jpg",
        background_url: "https://example.com/stages/genesis-bg.jpg",
        music_url: null,
        created_at: "2025-09-01T04:00:00.000Z",
        updated_at: "2025-09-08T06:00:00.000Z",
        parent_stage_id: "stage-1",
        difficulty: 4,
        energy_cost: 6,
        max_attempts: 2,
        rewards: [
          { type: "exp", amount: 180 },
          { type: "gold", amount: 90 }
        ],
        is_boss_stage: false,
        battles: []
      },
      {
        id: "stage-1-5",
        name: "Genesis Boss",
        description: "Face the Genesis Valley Boss!",
        thumbnail_url: "https://example.com/stages/genesis-boss-thumb.jpg",
        background_url: "https://example.com/stages/genesis-bg.jpg",
        music_url: "https://example.com/stages/genesis-boss.mp3",
        created_at: "2025-09-01T05:00:00.000Z",
        updated_at: "2025-09-08T06:00:00.000Z",
        parent_stage_id: "stage-1",
        difficulty: 5,
        energy_cost: 8,
        max_attempts: 1,
        rewards: [
          { type: "exp", amount: 500 },
          { type: "gold", amount: 400 }
        ],
        is_boss_stage: true,
        battles: []
      }
    ]
  },
  {
    id: "stage-2",
    name: "Altcoin Archipelago",
    description: "Islands ruled by powerful altcoin spirits.",
    thumbnail_url: "https://example.com/stages/altcoin-thumb.jpg",
    background_url: "https://example.com/stages/altcoin-bg.jpg",
    music_url: "https://example.com/stages/altcoin.mp3",
    created_at: "2025-09-02T00:00:00.000Z",
    updated_at: "2025-09-08T06:00:00.000Z",
    parent_stage_id: null,
    difficulty: 2,
    energy_cost: 6,
    max_attempts: 10,
    rewards: [
      { type: "exp", amount: 1200 },
      { type: "gold", amount: 1100 }
    ],
    is_boss_stage: false,
    battles: [],
    chapters: [
      {
        id: "stage-2-1",
        name: "Island 1",
        description: "Enter the archipelago.",
        thumbnail_url: "https://example.com/stages/altcoin-1-thumb.jpg",
        background_url: "https://example.com/stages/altcoin-bg.jpg",
        music_url: null,
        created_at: "2025-09-02T01:00:00.000Z",
        updated_at: "2025-09-08T06:00:00.000Z",
        parent_stage_id: "stage-2",
        difficulty: 2,
        energy_cost: 6,
        max_attempts: 3,
        rewards: [
          { type: "exp", amount: 130 },
          { type: "gold", amount: 65 }
        ],
        is_boss_stage: false,
        battles: []
      },
      {
        id: "stage-2-2",
        name: "Island 2",
        description: "Altcoin spirits challenge you.",
        thumbnail_url: "https://example.com/stages/altcoin-2-thumb.jpg",
        background_url: "https://example.com/stages/altcoin-bg.jpg",
        music_url: null,
        created_at: "2025-09-02T02:00:00.000Z",
        updated_at: "2025-09-08T06:00:00.000Z",
        parent_stage_id: "stage-2",
        difficulty: 3,
        energy_cost: 6,
        max_attempts: 3,
        rewards: [
          { type: "exp", amount: 140 },
          { type: "gold", amount: 70 }
        ],
        is_boss_stage: false,
        battles: []
      },
      {
        id: "stage-2-3",
        name: "Island 3",
        description: "The journey continues.",
        thumbnail_url: "https://example.com/stages/altcoin-3-thumb.jpg",
        background_url: "https://example.com/stages/altcoin-bg.jpg",
        music_url: null,
        created_at: "2025-09-02T03:00:00.000Z",
        updated_at: "2025-09-08T06:00:00.000Z",
        parent_stage_id: "stage-2",
        difficulty: 4,
        energy_cost: 6,
        max_attempts: 3,
        rewards: [
          { type: "exp", amount: 160 },
          { type: "gold", amount: 80 }
        ],
        is_boss_stage: false,
        battles: []
      },
      {
        id: "stage-2-4",
        name: "Island 4",
        description: "Face new perils.",
        thumbnail_url: "https://example.com/stages/altcoin-4-thumb.jpg",
        background_url: "https://example.com/stages/altcoin-bg.jpg",
        music_url: null,
        created_at: "2025-09-02T04:00:00.000Z",
        updated_at: "2025-09-08T06:00:00.000Z",
        parent_stage_id: "stage-2",
        difficulty: 5,
        energy_cost: 7,
        max_attempts: 2,
        rewards: [
          { type: "exp", amount: 180 },
          { type: "gold", amount: 95 }
        ],
        is_boss_stage: false,
        battles: []
      },
      {
        id: "stage-2-5",
        name: "Island Boss",
        description: "Defeat the Altcoin King!",
        thumbnail_url: "https://example.com/stages/altcoin-boss-thumb.jpg",
        background_url: "https://example.com/stages/altcoin-bg.jpg",
        music_url: "https://example.com/stages/altcoin-boss.mp3",
        created_at: "2025-09-02T05:00:00.000Z",
        updated_at: "2025-09-08T06:00:00.000Z",
        parent_stage_id: "stage-2",
        difficulty: 6,
        energy_cost: 10,
        max_attempts: 1,
        rewards: [
          { type: "exp", amount: 600 },
          { type: "gold", amount: 450 }
        ],
        is_boss_stage: true,
        battles: []
      }
    ]
  }
];