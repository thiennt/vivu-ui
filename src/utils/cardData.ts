import { BattleCard } from '../types';

export const mockCards = [
  {
    "id": "5d95bf5a-e460-4db4-a075-8f3a0dbe40e6",
    "name": "Firestorm Wave",
    "group": "Control & Debuff",
    "description": "Deals 150-200% damage to all enemies, with a 100% chance to apply [Burning] to them.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "9c88adc2-91a8-42e3-8663-b9a58eca0dbc",
    "name": "Empowerment Heal",
    "group": "Healing & Support",
    "description": "Heals all allies for 150% of the caster's Attack and applies [Attack Buff] to them.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "5d95bf5a-e460-4db4-a075-8f3a0dbe40e6",
    "name": "Firestorm Wave",
    "group": "Control & Debuff",
    "description": "Deals 150-200% damage to all enemies, with a 100% chance to apply [Burning] to them.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "42279d86-7e89-4add-b905-9b46029f4cb4",
    "name": "Crippling Blow",
    "group": "Control & Debuff",
    "description": "Deals 200-250% damage to all enemies. There is an 80% chance to reduce the targets' critical rate by 25%.",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "81d27411-c526-4f1c-a17b-41c3e5793df5",
    "name": "Cleansing Pair",
    "group": "Healing & Support",
    "description": "Heals the two allies with the lowest HP for 150% of the caster's Attack, with a 60% chance to cleanse all debuffs on them.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "81d27411-c526-4f1c-a17b-41c3e5793df5",
    "name": "Cleansing Pair",
    "group": "Healing & Support",
    "description": "Heals the two allies with the lowest HP for 150% of the caster's Attack, with a 60% chance to cleanse all debuffs on them.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "0fbb9d34-ac57-4d9e-a541-097e962eba04",
    "name": "Vampiric Strike",
    "group": "High Damage",
    "description": "Deals 150-200% damage to the enemy with the lowest HP. The caster restores HP equal to 50% of the damage dealt.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "c3cf622d-3892-4190-9e31-dcfe96eacfa3",
    "name": "Stunning Hit",
    "group": "High Damage",
    "description": "Deals 150-200% damage to one random enemy. There is a 30% chance to [Stun] the target.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "33a98f34-40e0-4d16-a978-0a0f687cdeb4",
    "name": "Ignited Crit",
    "group": "High Damage",
    "description": "Deals 150-200% damage to one random enemy. This attack is a guaranteed critical hit if the target is under [Burning].",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "99dd249d-f9d7-47b1-b3ef-7cf921b9666a",
    "name": "Force Strike",
    "group": "High Damage",
    "description": "Deals 200-250% damage to a single enemy.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "cf02304a-69c4-4ba4-a7c0-bbe150ba7594",
    "name": "Grave Strike",
    "group": "Control & Debuff",
    "description": "Deals 100-150% damage to all enemies. Has a 65% chance to apply [Anti-Revive] and a 40% reduction to the targets' healing effects.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "35ad8321-02cb-4b8e-b0cc-95b2c36f4e81",
    "name": "Shielding Balm",
    "group": "Healing & Support",
    "description": "Heals all allies for 110% of the caster's Attack, and applies both [Blocking Shield] and a 30% [Attack Buff] to them.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "f9674d91-d8ff-48e7-ac9d-8d3d4fbe8ab3",
    "name": "Frostbite Wave",
    "group": "Control & Debuff",
    "description": "Deals 200-250% damage to all enemies. Has an 80% chance to apply [Frozen] for 2 rounds, with a 100% chance if the target is under [Slow Down].",
    "card_type": "active",
    "energy_cost": 4
  },
  {
    "id": "1c90eaed-6235-42f8-a8a3-6a2ec487a0f1",
    "name": "Dual Mend",
    "group": "Healing & Support",
    "description": "Restores the HP of the two allies with the lowest HP for 230% of the caster's Attack and applies [Attack Buff] to them.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "b7993110-cb2a-4f5b-9eaf-2362173bfa19",
    "name": "Hexing Stun",
    "group": "Control & Debuff",
    "description": "Deals 150-200% damage to all enemies. There is a 26% chance to [Stun] the targets. There is a 50% chance to dispel a buff on the targets and apply [Curse].",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "9e54e52c-696f-4792-bfe9-13e14f8d74e7",
    "name": "Quick Regen",
    "group": "Healing & Support",
    "description": "Heals one random ally for 110% of the caster's Attack and applies [Sustain Healing].",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "0ed9739e-bc43-46d2-889f-59b2cbe96194",
    "name": "Toxic Cloud",
    "group": "Control & Debuff",
    "description": "Deals 150-200% damage to all enemies. There is a 60% chance to [Poison] the targets.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "33a98f34-40e0-4d16-a978-0a0f687cdeb4",
    "name": "Ignited Crit",
    "group": "High Damage",
    "description": "Deals 150-200% damage to one random enemy. This attack is a guaranteed critical hit if the target is under [Burning].",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "c3cf622d-3892-4190-9e31-dcfe96eacfa3",
    "name": "Stunning Hit",
    "group": "High Damage",
    "description": "Deals 150-200% damage to one random enemy. There is a 30% chance to [Stun] the target.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "da42e473-bdbe-4539-b602-c04014bd576e",
    "name": "Break Armor",
    "group": "High Damage",
    "description": "Deals 300-350% damage to the enemy with the highest Attack. This attack ignores 40% of the target's armor. If the target is under [Armor Break], the damage increases by 25%.",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "22c97746-c1de-4967-ad1f-9ddc0e250489",
    "name": "Purifying Curse",
    "group": "Control & Debuff",
    "description": "Deals 150-200% damage to all enemies and applies [Curse] to them. The caster also cleanses all debuffs on themselves after casting this spell.",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "cc448bf3-7a88-4526-a5d2-e70c7a0d654f",
    "name": "Cleanse Wave",
    "group": "Healing & Support",
    "description": "Cleanses one debuff from the two allies with the highest Attack, then heals all allies for 110% of the caster's Attack.",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "99dd249d-f9d7-47b1-b3ef-7cf921b9666a",
    "name": "Force Strike",
    "group": "High Damage",
    "description": "Deals 200-250% damage to a single enemy.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "35ad8321-02cb-4b8e-b0cc-95b2c36f4e81",
    "name": "Shielding Balm",
    "group": "Healing & Support",
    "description": "Heals all allies for 110% of the caster's Attack, and applies both [Blocking Shield] and a 30% [Attack Buff] to them.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "384123d1-f281-4bc3-98e1-388c9835c895",
    "name": "Leech Wound",
    "group": "High Damage",
    "description": "Deals 300-350% damage to the enemy with the lowest HP. Damage increases by 50% if the target is under the [Bleeding] effect. Restores 25% of the caster's maximum HP if this ability kills an enemy.",
    "card_type": "active",
    "energy_cost": 4
  },
  {
    "id": "eb78b2eb-fae8-4af5-ab57-87b26fea7bf9",
    "name": "Rapid Slash",
    "group": "High Damage",
    "description": "Deals 150-200% damage to a single enemy.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "99dd249d-f9d7-47b1-b3ef-7cf921b9666a",
    "name": "Force Strike",
    "group": "High Damage",
    "description": "Deals 200-250% damage to a single enemy.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "b7993110-cb2a-4f5b-9eaf-2362173bfa19",
    "name": "Hexing Stun",
    "group": "Control & Debuff",
    "description": "Deals 150-200% damage to all enemies. There is a 26% chance to [Stun] the targets. There is a 50% chance to dispel a buff on the targets and apply [Curse].",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "c3cf622d-3892-4190-9e31-dcfe96eacfa3",
    "name": "Stunning Hit",
    "group": "High Damage",
    "description": "Deals 150-200% damage to one random enemy. There is a 30% chance to [Stun] the target.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "9c88adc2-91a8-42e3-8663-b9a58eca0dbc",
    "name": "Empowerment Heal",
    "group": "Healing & Support",
    "description": "Heals all allies for 150% of the caster's Attack and applies [Attack Buff] to them.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "cba1ba16-2011-4a07-bb3f-ca4646641fa4",
    "name": "Swift Revive",
    "group": "Healing & Support",
    "description": "Revives one ally and heals them for 400% of the caster's Attack. If all allies are alive, heals the ally with the lowest HP for 400% of the caster's Attack instead.",
    "card_type": "active",
    "energy_cost": 4
  },
  {
    "id": "9e54e52c-696f-4792-bfe9-13e14f8d74e7",
    "name": "Quick Regen",
    "group": "Healing & Support",
    "description": "Heals one random ally for 110% of the caster's Attack and applies [Sustain Healing].",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "5d95bf5a-e460-4db4-a075-8f3a0dbe40e6",
    "name": "Firestorm Wave",
    "group": "Control & Debuff",
    "description": "Deals 150-200% damage to all enemies, with a 100% chance to apply [Burning] to them.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "a9a3fa9c-b3bc-4531-9404-502725864e0f",
    "name": "Blinding Blaze",
    "group": "Control & Debuff",
    "description": "Deals 100-150% damage to all enemies. Has a 60% chance to apply [Blind], with a 100% chance if the target is under [Burning] or [Ignited].",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "22c97746-c1de-4967-ad1f-9ddc0e250489",
    "name": "Purifying Curse",
    "group": "Control & Debuff",
    "description": "Deals 150-200% damage to all enemies and applies [Curse] to them. The caster also cleanses all debuffs on themselves after casting this spell.",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "81d27411-c526-4f1c-a17b-41c3e5793df5",
    "name": "Cleansing Pair",
    "group": "Healing & Support",
    "description": "Heals the two allies with the lowest HP for 150% of the caster's Attack, with a 60% chance to cleanse all debuffs on them.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "cc448bf3-7a88-4526-a5d2-e70c7a0d654f",
    "name": "Cleanse Wave",
    "group": "Healing & Support",
    "description": "Cleanses one debuff from the two allies with the highest Attack, then heals all allies for 110% of the caster's Attack.",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "5883f163-43a1-45c4-87d3-20f932a00448",
    "name": "Sustain Heal",
    "group": "Healing & Support",
    "description": "Heals all allies for 130% of the caster's Attack. This healing has a 100% chance to apply [Sustain Healing] to the targets.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "da42e473-bdbe-4539-b602-c04014bd576e",
    "name": "Break Armor",
    "group": "High Damage",
    "description": "Deals 300-350% damage to the enemy with the highest Attack. This attack ignores 40% of the target's armor. If the target is under [Armor Break], the damage increases by 25%.",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "22c97746-c1de-4967-ad1f-9ddc0e250489",
    "name": "Purifying Curse",
    "group": "Control & Debuff",
    "description": "Deals 150-200% damage to all enemies and applies [Curse] to them. The caster also cleanses all debuffs on themselves after casting this spell.",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "1c90eaed-6235-42f8-a8a3-6a2ec487a0f1",
    "name": "Dual Mend",
    "group": "Healing & Support",
    "description": "Restores the HP of the two allies with the lowest HP for 230% of the caster's Attack and applies [Attack Buff] to them.",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "9e54e52c-696f-4792-bfe9-13e14f8d74e7",
    "name": "Quick Regen",
    "group": "Healing & Support",
    "description": "Heals one random ally for 110% of the caster's Attack and applies [Sustain Healing].",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "eb78b2eb-fae8-4af5-ab57-87b26fea7bf9",
    "name": "Rapid Slash",
    "group": "High Damage",
    "description": "Deals 150-200% damage to a single enemy.",
    "card_type": "active",
    "energy_cost": 1
  },
  {
    "id": "f9674d91-d8ff-48e7-ac9d-8d3d4fbe8ab3",
    "name": "Frostbite Wave",
    "group": "Control & Debuff",
    "description": "Deals 200-250% damage to all enemies. Has an 80% chance to apply [Frozen] for 2 rounds, with a 100% chance if the target is under [Slow Down].",
    "card_type": "active",
    "energy_cost": 4
  },
  {
    "id": "f9674d91-d8ff-48e7-ac9d-8d3d4fbe8ab3",
    "name": "Frostbite Wave",
    "group": "Control & Debuff",
    "description": "Deals 200-250% damage to all enemies. Has an 80% chance to apply [Frozen] for 2 rounds, with a 100% chance if the target is under [Slow Down].",
    "card_type": "active",
    "energy_cost": 4
  },
  {
    "id": "222e43a5-144a-4b03-9e85-e2fcd01837c5",
    "name": "Ignite Strike",
    "group": "High Damage",
    "description": "Deals 250-300% damage to a single enemy. Damage increases by 50% if the target is under [Burning].",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "b7fa61b9-5054-4dd6-bf7e-b0e9774f0808",
    "name": "Cursed Blow",
    "group": "High Damage",
    "description": "Deals 300-350% damage to the enemy with the lowest HP and applies [Curse] effect.",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "46bc6d7d-b248-4824-8985-0d7a340f18f9",
    "name": "Frozen Nova",
    "group": "High Damage",
    "description": "Deals 120-170% damage to all enemies. Damage increases by 100% if the target is under [Frozen].",
    "card_type": "active",
    "energy_cost": 2
  },
  {
    "id": "b7fa61b9-5054-4dd6-bf7e-b0e9774f0808",
    "name": "Cursed Blow",
    "group": "High Damage",
    "description": "Deals 300-350% damage to the enemy with the lowest HP and applies [Curse] effect.",
    "card_type": "active",
    "energy_cost": 3
  },
  {
    "id": "eb78b2eb-fae8-4af5-ab57-87b26fea7bf9",
    "name": "Rapid Slash",
    "group": "High Damage",
    "description": "Deals 150-200% damage to a single enemy.",
    "card_type": "active",
    "energy_cost": 1
  }
]

// Helper function to draw cards from deck
export function drawCards(deck: BattleCard[], count: number): { drawnCards: BattleCard[], remainingDeck: BattleCard[] } {
  const drawnCards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { drawnCards, remainingDeck };
}