/**
 * Example: Avatar Skill Effect Usage
 * 
 * This file demonstrates how to use the new animateAvatarSkillEffect method
 * in a battle scene context. Copy and adapt this code to your battle implementation.
 */

import { Container, Assets, Sprite, Graphics, Text } from 'pixi.js';
import { CardBattleEffects, CardGroup } from './src/ui/CardBattleEffects';

/**
 * Example 1: Simple usage with two character cards
 */
async function exampleSimpleUsage() {
  // Setup containers
  const sceneContainer = new Container();
  const effectsContainer = new Container();
  sceneContainer.addChild(effectsContainer);

  // Create mock character cards with avatars
  const attackerCard = await createMockCharacterCard('attacker', 100, 200);
  const targetCard = await createMockCharacterCard('target', 400, 200);
  
  sceneContainer.addChild(attackerCard, targetCard);

  // Play the avatar skill effect with damage type
  await CardBattleEffects.animateAvatarSkillEffect(
    effectsContainer,
    attackerCard,
    targetCard,
    'damage'
  );

  console.log('Avatar skill effect completed!');
}

/**
 * Example 2: Playing effects for different skill types
 */
async function exampleDifferentSkillTypes() {
  const sceneContainer = new Container();
  const effectsContainer = new Container();
  sceneContainer.addChild(effectsContainer);

  const attackerCard = await createMockCharacterCard('attacker', 100, 200);
  const targetCard = await createMockCharacterCard('target', 400, 200);
  sceneContainer.addChild(attackerCard, targetCard);

  // Try different skill types
  const skillTypes: CardGroup[] = ['damage', 'healing', 'debuff', 'other'];
  
  for (const skillType of skillTypes) {
    console.log(`Playing ${skillType} effect...`);
    
    await CardBattleEffects.animateAvatarSkillEffect(
      effectsContainer,
      attackerCard,
      targetCard,
      skillType
    );
    
    // Wait a bit between effects
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Example 3: Combining with other battle effects
 */
async function exampleCombinedEffects() {
  const sceneContainer = new Container();
  const effectsContainer = new Container();
  sceneContainer.addChild(effectsContainer);

  const attackerCard = await createMockCharacterCard('attacker', 100, 200);
  const targetCard = await createMockCharacterCard('target', 400, 200);
  sceneContainer.addChild(attackerCard, targetCard);

  // Step 1: Animate attacker preparation
  console.log('1. Character prepares skill...');
  await CardBattleEffects.animateCharacterSkill(attackerCard, 'damage');

  // Step 2: Launch avatar projectile
  console.log('2. Avatar projectile launches...');
  await CardBattleEffects.animateAvatarSkillEffect(
    effectsContainer,
    attackerCard,
    targetCard,
    'damage'
  );

  // Step 3: Screen shake on impact
  console.log('3. Impact - screen shakes...');
  await CardBattleEffects.shakeScreen(sceneContainer, 10);

  // Step 4: Apply target effect
  console.log('4. Target takes damage...');
  await CardBattleEffects.applyTargetEffect(
    targetCard,
    {
      id: 'target',
      impacts: [{
        type: 'damage',
        value: 50,
        meta: { isCritical: true }
      }]
    },
    'damage'
  );

  console.log('Full combo effect completed!');
}

/**
 * Example 4: Using in CardBattleScene
 */
class ExampleBattleSceneIntegration {
  private effectsContainer: Container;
  private cardContainers: Map<string, Container>;

  constructor() {
    this.effectsContainer = new Container();
    this.cardContainers = new Map();
  }

  /**
   * Execute a skill with avatar projectile effect
   */
  async executeSkillWithAvatar(
    attackerId: string,
    targetId: string,
    cardGroup: CardGroup
  ): Promise<void> {
    const attackerCard = this.cardContainers.get(attackerId);
    const targetCard = this.cardContainers.get(targetId);

    if (!attackerCard || !targetCard) {
      console.warn('Character card not found');
      return;
    }

    // Play combined animation
    await this.playSkillAnimation(attackerCard, targetCard, cardGroup);
  }

  private async playSkillAnimation(
    attackerCard: Container,
    targetCard: Container,
    cardGroup: CardGroup
  ): Promise<void> {
    // 1. Attacker charges up
    await CardBattleEffects.animateCharacterSkill(attackerCard, cardGroup);

    // 2. Avatar flies to target
    await CardBattleEffects.animateAvatarSkillEffect(
      this.effectsContainer,
      attackerCard,
      targetCard,
      cardGroup
    );

    // 3. Impact effect on target
    // Note: You would pass actual impact data here
    await CardBattleEffects.applyTargetEffect(
      targetCard,
      {
        id: 'target',
        impacts: [{ type: 'damage', value: 30 }]
      },
      cardGroup
    );
  }
}

/**
 * Helper: Create a mock character card with avatar for testing
 */
async function createMockCharacterCard(
  name: string,
  x: number,
  y: number
): Promise<Container> {
  const card = new Container();
  card.x = x;
  card.y = y;

  // Card background
  const bg = new Graphics();
  bg.roundRect(0, 0, 100, 120, 8)
    .fill(0x3e2723)
    .stroke({ width: 2, color: 0x8d6e63 });
  card.addChild(bg);

  // Card name
  const nameText = new Text({
    text: name,
    style: {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xFFFFFF
    }
  });
  nameText.anchor.set(0.5);
  nameText.x = 50;
  nameText.y = 15;
  card.addChild(nameText);

  // Load and add avatar sprite
  try {
    const avatarTexture = await Assets.load('https://pixijs.com/assets/bunny.png');
    const avatarSprite = new Sprite(avatarTexture);
    
    // Important: Avatar must have anchor (0.5, 0.5) to be detected
    avatarSprite.anchor.set(0.5);
    avatarSprite.width = 50;
    avatarSprite.height = 50;
    avatarSprite.x = 50;
    avatarSprite.y = 60;
    
    card.addChild(avatarSprite);
  } catch (error) {
    console.warn('Failed to load avatar:', error);
  }

  // Store dimensions for reference
  (card as any).width = 100;
  (card as any).height = 120;

  return card;
}

/**
 * Export examples for use in tests or demos
 */
export {
  exampleSimpleUsage,
  exampleDifferentSkillTypes,
  exampleCombinedEffects,
  ExampleBattleSceneIntegration,
  createMockCharacterCard
};

// Example usage comment:
// To test this in your application:
// 1. Import the example functions
// 2. Call them from your battle scene or test file
// 3. Observe the avatar flying from attacker to target with effects
//
// import { exampleSimpleUsage } from './AVATAR_EFFECT_EXAMPLE';
// await exampleSimpleUsage();
