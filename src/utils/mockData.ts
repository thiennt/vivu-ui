import { 
  Player, 
  Character, 
  Dungeon, 
  CharacterRarity, 
  Element, 
  SkillType, 
  Difficulty,
  RewardType 
} from '@/types';

export const mockPlayer: Player = {
  id: 'player1',
  username: 'CryptoWarrior',
  level: 25,
  experience: 12750,
  stats: {
    stamina: 120,
    strength: 85,
    agility: 90,
    luck: 75,
    intelligence: 80,
    vitality: 95
  },
  characters: [],
  formation: {
    positions: [null, null, null, null],
    maxSize: 6
  },
  progress: {
    currentChapter: 2,
    currentStage: 3,
    completedStages: ['1-1', '1-2', '1-3', '2-1', '2-2'],
    unlockedDungeons: ['crypto-caves', 'blockchain-forest']
  }
};

export const mockCharacters: Character[] = [
  {
    id: 'char1',
    name: 'Bitcoin Paladin',
    tokenSymbol: 'BTC',
    rarity: CharacterRarity.LEGENDARY,
    level: 20,
    experience: 8500,
    stats: {
      health: 1200,
      attack: 180,
      defense: 150,
      speed: 85,
      criticalRate: 15,
      criticalDamage: 200
    },
    skills: [
      {
        id: 'skill1',
        name: 'Golden Strike',
        description: 'A powerful attack that deals massive damage',
        damage: 250,
        cooldown: 3,
        manaCost: 40,
        type: SkillType.ATTACK
      },
      {
        id: 'skill2',
        name: 'Diamond Hands',
        description: 'Increases defense and resistance',
        damage: 0,
        cooldown: 5,
        manaCost: 30,
        type: SkillType.BUFF
      }
    ],
    element: Element.LIGHT
  },
  {
    id: 'char2',
    name: 'Ethereum Mage',
    tokenSymbol: 'ETH',
    rarity: CharacterRarity.EPIC,
    level: 18,
    experience: 6200,
    stats: {
      health: 900,
      attack: 200,
      defense: 100,
      speed: 120,
      criticalRate: 20,
      criticalDamage: 180
    },
    skills: [
      {
        id: 'skill3',
        name: 'Smart Contract',
        description: 'Casts a magical spell that damages all enemies',
        damage: 180,
        cooldown: 4,
        manaCost: 50,
        type: SkillType.ATTACK
      }
    ],
    element: Element.FIRE
  },
  {
    id: 'char3',
    name: 'Cardano Guardian',
    tokenSymbol: 'ADA',
    rarity: CharacterRarity.RARE,
    level: 15,
    experience: 4800,
    stats: {
      health: 1000,
      attack: 140,
      defense: 180,
      speed: 95,
      criticalRate: 10,
      criticalDamage: 150
    },
    skills: [
      {
        id: 'skill4',
        name: 'Proof of Stake',
        description: 'Provides protection and healing to allies',
        damage: 0,
        cooldown: 2,
        manaCost: 25,
        type: SkillType.HEAL
      }
    ],
    element: Element.EARTH
  },
  {
    id: 'char4',
    name: 'Solana Archer',
    tokenSymbol: 'SOL',
    rarity: CharacterRarity.UNCOMMON,
    level: 12,
    experience: 3200,
    stats: {
      health: 800,
      attack: 160,
      defense: 90,
      speed: 140,
      criticalRate: 25,
      criticalDamage: 170
    },
    skills: [
      {
        id: 'skill5',
        name: 'Lightning Arrow',
        description: 'Fast attack with high critical chance',
        damage: 120,
        cooldown: 1,
        manaCost: 20,
        type: SkillType.ATTACK
      }
    ],
    element: Element.AIR
  },
  {
    id: 'char5',
    name: 'Dogecoin Warrior',
    tokenSymbol: 'DOGE',
    rarity: CharacterRarity.COMMON,
    level: 10,
    experience: 2100,
    stats: {
      health: 750,
      attack: 110,
      defense: 80,
      speed: 100,
      criticalRate: 12,
      criticalDamage: 140
    },
    skills: [
      {
        id: 'skill6',
        name: 'Much Wow',
        description: 'A cheerful attack that boosts team morale',
        damage: 90,
        cooldown: 2,
        manaCost: 15,
        type: SkillType.ATTACK
      }
    ],
    element: Element.LIGHT
  }
];

export const mockDungeons: Dungeon[] = [
  {
    id: 'crypto-caves',
    name: 'Crypto Caves',
    description: 'Deep underground caverns filled with digital treasures',
    requiredLevel: 1,
    rewards: [
      { type: RewardType.EXPERIENCE, amount: 100 },
      { type: RewardType.GOLD, amount: 50 }
    ],
    chapters: [
      {
        id: 'chapter1',
        name: 'The Mining Tunnels',
        description: 'Explore the abandoned mining tunnels',
        chapterNumber: 1,
        stages: [
          {
            id: 'stage1-1',
            name: 'Entrance',
            description: 'The cave entrance guarded by weak creatures',
            stageNumber: 1,
            difficulty: Difficulty.EASY,
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 50 },
              { type: RewardType.GOLD, amount: 25 }
            ]
          },
          {
            id: 'stage1-2',
            name: 'Deep Tunnel',
            description: 'Venture deeper into the mysterious tunnels',
            stageNumber: 2,
            difficulty: Difficulty.EASY,
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 75 },
              { type: RewardType.GOLD, amount: 35 }
            ]
          },
          {
            id: 'stage1-3',
            name: 'Boss Chamber',
            description: 'Face the guardian of the first level',
            stageNumber: 3,
            difficulty: Difficulty.NORMAL,
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 150 },
              { type: RewardType.GOLD, amount: 100 },
              { type: RewardType.CHARACTER, amount: 1, rarity: CharacterRarity.COMMON }
            ]
          }
        ]
      },
      {
        id: 'chapter2',
        name: 'The Crystal Chamber',
        description: 'A beautiful chamber filled with glowing crystals',
        chapterNumber: 2,
        stages: [
          {
            id: 'stage2-1',
            name: 'Crystal Garden',
            description: 'Navigate through the crystal formations',
            stageNumber: 1,
            difficulty: Difficulty.NORMAL,
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 100 },
              { type: RewardType.GOLD, amount: 60 }
            ]
          },
          {
            id: 'stage2-2',
            name: 'Prism Maze',
            description: 'Solve the light puzzles to proceed',
            stageNumber: 2,
            difficulty: Difficulty.NORMAL,
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 125 },
              { type: RewardType.GOLD, amount: 75 }
            ]
          },
          {
            id: 'stage2-3',
            name: 'Crystal Guardian',
            description: 'Defeat the powerful crystal entity',
            stageNumber: 3,
            difficulty: Difficulty.HARD,
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 250 },
              { type: RewardType.GOLD, amount: 150 },
              { type: RewardType.CHARACTER, amount: 1, rarity: CharacterRarity.UNCOMMON }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'blockchain-forest',
    name: 'Blockchain Forest',
    description: 'A mystical forest where digital nature thrives',
    requiredLevel: 10,
    rewards: [
      { type: RewardType.EXPERIENCE, amount: 200 },
      { type: RewardType.GOLD, amount: 100 }
    ],
    chapters: [
      {
        id: 'chapter3',
        name: 'The Sacred Grove',
        description: 'Ancient trees hold the secrets of the blockchain',
        chapterNumber: 1,
        stages: [
          {
            id: 'stage3-1',
            name: 'Forest Path',
            description: 'Follow the winding path through the forest',
            stageNumber: 1,
            difficulty: Difficulty.NORMAL,
            enemies: [],
            rewards: [
              { type: RewardType.EXPERIENCE, amount: 150 },
              { type: RewardType.GOLD, amount: 80 }
            ]
          }
        ]
      }
    ]
  }
];

// Assign characters to player
mockPlayer.characters = mockCharacters;
mockPlayer.formation.positions[0] = mockCharacters[0];
mockPlayer.formation.positions[1] = mockCharacters[1];
mockPlayer.formation.positions[3] = mockCharacters[2];