import { BattleCard, CardType, CardRarity, CardEffectType, CardTarget } from '../types';

export const mockCards: BattleCard[] = [
  // Attack Cards
  {
    id: 'card_001',
    name: 'Lightning Strike',
    description: 'Deal 30 damage to target enemy',
    energyCost: 2,
    cardType: CardType.ATTACK,
    rarity: CardRarity.COMMON,
    effects: [
      {
        type: CardEffectType.DAMAGE,
        value: 30,
        target: CardTarget.SINGLE_ENEMY
      }
    ]
  },
  {
    id: 'card_002',
    name: 'Flame Burst',
    description: 'Deal 25 damage to all enemies',
    energyCost: 4,
    cardType: CardType.ATTACK,
    rarity: CardRarity.UNCOMMON,
    effects: [
      {
        type: CardEffectType.DAMAGE,
        value: 25,
        target: CardTarget.ALL_ENEMIES
      }
    ]
  },
  {
    id: 'card_003',
    name: 'Ice Shard',
    description: 'Deal 35 damage to target enemy',
    energyCost: 3,
    cardType: CardType.ATTACK,
    rarity: CardRarity.COMMON,
    effects: [
      {
        type: CardEffectType.DAMAGE,
        value: 35,
        target: CardTarget.SINGLE_ENEMY
      }
    ]
  },
  
  // Heal Cards
  {
    id: 'card_004',
    name: 'Healing Potion',
    description: 'Restore 40 HP to target ally',
    energyCost: 2,
    cardType: CardType.HEAL,
    rarity: CardRarity.COMMON,
    effects: [
      {
        type: CardEffectType.HEAL,
        value: 40,
        target: CardTarget.SINGLE_ALLY
      }
    ]
  },
  {
    id: 'card_005',
    name: 'Divine Light',
    description: 'Restore 25 HP to all allies',
    energyCost: 3,
    cardType: CardType.HEAL,
    rarity: CardRarity.RARE,
    effects: [
      {
        type: CardEffectType.HEAL,
        value: 25,
        target: CardTarget.ALL_ALLIES
      }
    ]
  },
  
  // Buff Cards
  {
    id: 'card_006',
    name: 'Strength Boost',
    description: 'Increase ally attack by 15 for 3 turns',
    energyCost: 2,
    cardType: CardType.BUFF,
    rarity: CardRarity.COMMON,
    effects: [
      {
        type: CardEffectType.ATTACK_BUFF,
        value: 15,
        target: CardTarget.SINGLE_ALLY,
        duration: 3
      }
    ]
  },
  {
    id: 'card_007',
    name: 'Shield Wall',
    description: 'Increase ally defense by 20 for 2 turns',
    energyCost: 2,
    cardType: CardType.BUFF,
    rarity: CardRarity.COMMON,
    effects: [
      {
        type: CardEffectType.DEFENSE_BUFF,
        value: 20,
        target: CardTarget.SINGLE_ALLY,
        duration: 2
      }
    ]
  },
  
  // Debuff Cards
  {
    id: 'card_008',
    name: 'Weakness Curse',
    description: 'Reduce enemy attack by 10 for 2 turns',
    energyCost: 1,
    cardType: CardType.DEBUFF,
    rarity: CardRarity.COMMON,
    effects: [
      {
        type: CardEffectType.ATTACK_DEBUFF,
        value: 10,
        target: CardTarget.SINGLE_ENEMY,
        duration: 2
      }
    ]
  },
  {
    id: 'card_009',
    name: 'Armor Break',
    description: 'Reduce enemy defense by 15 for 3 turns',
    energyCost: 2,
    cardType: CardType.DEBUFF,
    rarity: CardRarity.UNCOMMON,
    effects: [
      {
        type: CardEffectType.DEFENSE_DEBUFF,
        value: 15,
        target: CardTarget.SINGLE_ENEMY,
        duration: 3
      }
    ]
  },
  
  // Special Cards
  {
    id: 'card_010',
    name: 'Energy Boost',
    description: 'Gain 2 energy immediately',
    energyCost: 0,
    cardType: CardType.SPECIAL,
    rarity: CardRarity.COMMON,
    effects: [
      {
        type: CardEffectType.ENERGY_GAIN,
        value: 2,
        target: CardTarget.SELF
      }
    ]
  },
  {
    id: 'card_011',
    name: 'Meteor Strike',
    description: 'Deal 50 damage to target enemy',
    energyCost: 5,
    cardType: CardType.ATTACK,
    rarity: CardRarity.EPIC,
    effects: [
      {
        type: CardEffectType.DAMAGE,
        value: 50,
        target: CardTarget.SINGLE_ENEMY
      }
    ]
  },
  {
    id: 'card_012',
    name: 'Greater Heal',
    description: 'Restore 60 HP to target ally',
    energyCost: 4,
    cardType: CardType.HEAL,
    rarity: CardRarity.RARE,
    effects: [
      {
        type: CardEffectType.HEAL,
        value: 60,
        target: CardTarget.SINGLE_ALLY
      }
    ]
  }
];

// Helper function to create a random deck
export function createRandomDeck(cardCount: number = 50): BattleCard[] {
  const deck: BattleCard[] = [];
  
  // Add cards multiple times to reach the desired count
  while (deck.length < cardCount) {
    const remainingSlots = cardCount - deck.length;
    const cardsToAdd = Math.min(remainingSlots, mockCards.length);
    
    // Add each card type at least once, then fill randomly
    for (let i = 0; i < cardsToAdd; i++) {
      deck.push({ ...mockCards[i % mockCards.length], id: `${mockCards[i % mockCards.length].id}_${deck.length}` });
    }
  }
  
  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

// Helper function to draw cards from deck
export function drawCards(deck: BattleCard[], count: number): { drawnCards: BattleCard[], remainingDeck: BattleCard[] } {
  const drawnCards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { drawnCards, remainingDeck };
}