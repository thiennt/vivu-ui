import { Container, Graphics, Text } from 'pixi.js';
import { gsap } from 'gsap';
import { Colors } from '@/utils/colors';
import { 
  CardBattleLog, 
  CardInDeck, 
  BattleActionResult
} from '@/types';

/**
 * Manages all battle animations for the CardBattleScene
 */
export class CardBattleAnimationManager {
  private effectsContainer: Container;
  private gameWidth: number;
  private gameHeight: number;

  constructor(effectsContainer: Container, gameWidth: number, gameHeight: number) {
    this.effectsContainer = effectsContainer;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  async animateActionResult(result: BattleActionResult): Promise<void> {
    console.log('🎨 Animating action result:', result);
    
    // Animate damage if any
    if (result.damage_dealt && result.damage_dealt > 0) {
      await this.animateDamage(result.damage_dealt);
    }
    
    // Animate healing if any
    if (result.healing_done && result.healing_done > 0) {
      await this.animateHealing(result.healing_done);
    }
    
    // Animate status effects if any
    if (result.status_effects_applied && result.status_effects_applied.length > 0) {
      await this.animateStatusEffects(result.status_effects_applied as Array<{ type?: string }>);
    }
    
    // Log the actions performed (fallback for compatibility)
    result.actions_performed.forEach(action => {
      console.log(`📝 Action: ${action.description}`);
    });
  }

  /**
   * Animate a single CardBattleLog entry
   */
  async animateCardBattleLogEntry(logEntry: CardBattleLog): Promise<void> {
    console.log(`🎭 Animating CardBattle log entry: ${logEntry.action_type} - ${logEntry.animation_hint}`);
    
    switch (logEntry.action_type) {
      case 'start_turn':
        await this.animateStartTurn(logEntry);
        break;
      case 'draw_card':
      case 'draw_phase':
        await this.animateDrawPhase(logEntry);
        break;
      case 'play_card':
        await this.animatePlayCard(logEntry);
        break;
      case 'discard_card':
        await this.animateDiscardCard(logEntry);
        break;
      case 'damage':
        await this.animateDamageAction(logEntry);
        break;
      case 'heal':
        await this.animateHealAction(logEntry);
        break;
      case 'effect_trigger':
      case 'status_effect':
        await this.animateStatusEffect(logEntry);
        break;
      case 'energy':
      case 'energy_update':
        await this.animateEnergyUpdate(logEntry);
        break;
      case 'end_turn':
        await this.animateEndTurn();
        break;
      default:
        console.log(`⚠️ Unknown CardBattle log entry type: ${logEntry.action_type}`);
        // Show generic message for unknown types
        await this.showTurnMessage(logEntry.animation_hint || 'Unknown action');
    }
  }

  private async animateDrawPhase(logEntry: CardBattleLog): Promise<void> {
    const drawnCards = logEntry.drawn_cards || [];

    // Animate each drawn card individually
    for (const drawnCard of drawnCards) {
      // Convert CardBattleLogCard to CardInDeck format for animation
      const cardInDeck: CardInDeck = {
        card_id: drawnCard.id,
        card: {
          id: drawnCard.id,
          name: drawnCard.name,
          description: drawnCard.description,
          icon_url: drawnCard.icon_url,
          card_type: drawnCard.card_type,
          energy_cost: drawnCard.energy_cost,
          rarity: drawnCard.rarity,
          group: drawnCard.group,
          actions: drawnCard.actions || []
        }
      };

      await this.animateDrawCard(cardInDeck, logEntry.actor.team);
    }
  }

  private async animatePlayCard(logEntry: CardBattleLog): Promise<void> {
    const playerText = logEntry.actor.team === 1 ? 'Player' : 'AI';
    const cardName = logEntry.card?.name || 'a card';
    
    // Show card play message
    await this.showTurnMessage(`${playerText}: Played ${cardName}`);
  }

  async animateCharacterCardPlay(characterCard: Container, cardType: string): Promise<void> {
    const originalX = characterCard.x;
    const originalY = characterCard.y;
    
    // Different animations based on card type
    switch (cardType.toLowerCase()) {
      case 'attack':
      case 'offensive':
        // Quick forward dash animation
        await gsap.to(characterCard, { 
          x: originalX + 20, 
          duration: 0.1, 
          ease: 'power2.out' 
        });
        await gsap.to(characterCard, { 
          x: originalX, 
          duration: 0.2, 
          ease: 'power2.inOut' 
        });
        break;
      case 'magic':
      case 'spell':
        // Glow and scale effect
        await gsap.to(characterCard.scale, { 
          x: 1.1, 
          y: 1.1, 
          duration: 0.15, 
          ease: 'power2.inOut' 
        });
        await gsap.to(characterCard, { 
          rotation: 0.1, 
          duration: 0.15, 
          yoyo: true, 
          repeat: 1,
          ease: 'power2.inOut' 
        });
        await gsap.to(characterCard.scale, { 
          x: 1, 
          y: 1, 
          duration: 0.15, 
          ease: 'power2.inOut' 
        });
        break;
      case 'support':
      case 'heal':
        // Vertical bob effect
        await gsap.to(characterCard, { 
          y: originalY - 10, 
          duration: 0.2, 
          yoyo: true, 
          repeat: 1,
          ease: 'power2.inOut' 
        });
        break;
      default:
        // Default card play animation
        await gsap.to(characterCard.scale, { 
          x: 1.05, 
          y: 1.05, 
          duration: 0.075, 
          yoyo: true, 
          repeat: 1,
          ease: 'power2.inOut' 
        });
    }

    // Reset position in case of any drift
    characterCard.x = originalX;
    characterCard.y = originalY;
  }

  private async animateDiscardCard(logEntry: CardBattleLog): Promise<void> {
    const playerText = logEntry.actor.team === 1 ? 'Player' : 'AI';
    const cardName = logEntry.card?.name || 'a card';
    
    // If we have the card details, animate it flying to discard pile
    if (logEntry.card) {
      await this.animateCardToDiscardPile(logEntry.card, logEntry.actor.team);
    }
    
    await this.showTurnMessage(`${playerText}: Discarded ${cardName}`);
  }

  private async animateCardToDiscardPile(card: { name: string; id: string }, team: number): Promise<void> {
    // Create temporary card visual
    const tempCard = new Graphics();
    tempCard.roundRect(0, 0, 50, 70, 5)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Start from hand area
    tempCard.x = this.gameWidth / 2;
    tempCard.y = team === 1 ? this.gameHeight - 150 : 50;
    tempCard.alpha = 0.8;
    
    this.effectsContainer.addChild(tempCard);
    
    // Calculate discard pile position (next to deck)
    const discardX = 10 + 80; // Next to deck
    const discardY = team === 1 ? this.gameHeight - 250 : 150;
    
    // Animate card flying to discard pile
    await gsap.to(tempCard, {
      x: discardX,
      y: discardY,
      alpha: 0.5,
      scale: 0.8,
      duration: 0.5,
      ease: 'power2.out'
    });
    
    this.effectsContainer.removeChild(tempCard);
  }

  private async animateDamageAction(logEntry: CardBattleLog): Promise<void> {
    // Show damage message
    const damage = logEntry.animation_hint || 'Damage dealt';
    await this.showTurnMessage(damage);
  }

  private async animateHealAction(logEntry: CardBattleLog): Promise<void> {
    // Show healing message
    const healing = logEntry.animation_hint || 'Healing applied';
    await this.showTurnMessage(healing);
  }

  async animateTargetHit(targetCard: Container, damage: number): Promise<void> {
    const originalX = targetCard.x;
    
    // Shake effect
    await gsap.to(targetCard, {
      x: originalX + 5,
      duration: 0.05,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 3
    });
    
    // Flash red
    const tint = new Graphics();
    tint.rect(0, 0, targetCard.width, targetCard.height)
      .fill({ color: 0xFF0000, alpha: 0.3 });
    targetCard.addChild(tint);
    
    await gsap.to(tint, {
      alpha: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
    
    targetCard.removeChild(tint);
    
    // Show damage number
    await this.showDamageNumber(targetCard, damage);
  }

  async animateTargetHeal(targetCard: Container, healing: number): Promise<void> {
    // Scale up slightly
    await gsap.to(targetCard.scale, {
      x: 1.1,
      y: 1.1,
      duration: 0.15,
      ease: 'power2.inOut'
    });
    
    // Flash green
    const tint = new Graphics();
    tint.rect(0, 0, targetCard.width, targetCard.height)
      .fill({ color: 0x00FF00, alpha: 0.3 });
    targetCard.addChild(tint);
    
    await gsap.to(tint, {
      alpha: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
    
    targetCard.removeChild(tint);
    
    // Scale back
    await gsap.to(targetCard.scale, {
      x: 1,
      y: 1,
      duration: 0.15,
      ease: 'power2.inOut'
    });
    
    // Show healing number
    await this.showHealingNumber(targetCard, healing);
  }

  private async showDamageNumber(targetCard: Container, damage: number): Promise<void> {
    const damageText = new Text({
      text: `-${damage}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fill: 0xFF0000,
        fontWeight: 'bold',
        stroke: { color: 0xFFFFFF, width: 2 }
      }
    });
    
    damageText.anchor.set(0.5);
    damageText.x = targetCard.x + targetCard.width / 2;
    damageText.y = targetCard.y + targetCard.height / 2;
    damageText.alpha = 0;
    
    this.effectsContainer.addChild(damageText);
    
    // Animate damage number
    await gsap.to(damageText, {
      alpha: 1,
      y: damageText.y - 30,
      scale: 1.2,
      duration: 0.5,
      ease: 'power2.out'
    });
    
    await gsap.to(damageText, {
      alpha: 0,
      duration: 0.3,
      ease: 'power2.in'
    });
    
    this.effectsContainer.removeChild(damageText);
  }

  private async showHealingNumber(targetCard: Container, healing: number): Promise<void> {
    const healText = new Text({
      text: `+${healing}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fill: 0x00FF00,
        fontWeight: 'bold',
        stroke: { color: 0xFFFFFF, width: 2 }
      }
    });
    
    healText.anchor.set(0.5);
    healText.x = targetCard.x + targetCard.width / 2;
    healText.y = targetCard.y + targetCard.height / 2;
    healText.alpha = 0;
    
    this.effectsContainer.addChild(healText);
    
    // Animate healing number
    await gsap.to(healText, {
      alpha: 1,
      y: healText.y - 30,
      scale: 1.2,
      duration: 0.5,
      ease: 'power2.out'
    });
    
    await gsap.to(healText, {
      alpha: 0,
      duration: 0.3,
      ease: 'power2.in'
    });
    
    this.effectsContainer.removeChild(healText);
  }

  private async animateStatusEffect(logEntry: CardBattleLog): Promise<void> {
    const effect = logEntry.animation_hint || 'Status effect applied';
    await this.showTurnMessage(effect);
  }

  private async animateEndTurn(): Promise<void> {
    await this.showTurnMessage('Turn ended');
  }

  private async animateStartTurn(logEntry: CardBattleLog): Promise<void> {
    const playerText = logEntry.actor.team === 1 ? 'Player' : 'AI';
    await this.showTurnMessage(`${playerText} turn started`);
  }

  private async animateEnergyUpdate(logEntry: CardBattleLog): Promise<void> {
    const energy = logEntry.animation_hint || 'Energy updated';
    await this.showTurnMessage(energy);
  }

  async animateDrawCard(cardInDeck: CardInDeck, playerNo: number): Promise<void> {
    // Create temporary card visual
    const tempCard = new Graphics();
    tempCard.roundRect(0, 0, 60, 84, 5)
      .fill(Colors.CARD_BACKGROUND)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Start from deck position
    const deckX = 10;
    const deckY = playerNo === 1 ? this.gameHeight - 250 : 150;
    
    tempCard.x = deckX;
    tempCard.y = deckY;
    tempCard.alpha = 0.8;
    
    this.effectsContainer.addChild(tempCard);
    
    // Animate to hand area
    const handX = this.gameWidth / 2;
    const handY = playerNo === 1 ? this.gameHeight - 120 : 50;
    
    await gsap.to(tempCard, {
      x: handX,
      y: handY,
      scale: 1.2,
      duration: 0.5,
      ease: 'power2.out'
    });
    
    await gsap.to(tempCard, {
      alpha: 0,
      scale: 1,
      duration: 0.2,
      ease: 'power2.in'
    });
    
    this.effectsContainer.removeChild(tempCard);
  }

  async showTurnMessage(message: string): Promise<void> {
    const messageText = new Text({
      text: message,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fill: Colors.TEXT_PRIMARY,
        fontWeight: 'bold',
        stroke: { color: Colors.BACKGROUND_PRIMARY, width: 3 },
        align: 'center'
      }
    });
    
    messageText.anchor.set(0.5);
    messageText.x = this.gameWidth / 2;
    messageText.y = this.gameHeight / 2;
    messageText.alpha = 0;
    messageText.scale.set(0.5);
    
    this.effectsContainer.addChild(messageText);
    
    // Animate message appearance
    await gsap.to(messageText, {
      alpha: 1,
      scale: 1,
      duration: 0.3,
      ease: 'back.out(1.7)'
    });
    
    // Hold for a moment
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Animate message disappearance
    await gsap.to(messageText, {
      alpha: 0,
      scale: 0.8,
      duration: 0.3,
      ease: 'power2.in'
    });
    
    this.effectsContainer.removeChild(messageText);
  }

  // Legacy methods for compatibility
  private async animateDamage(damage: number): Promise<void> {
    await this.showTurnMessage(`${damage} damage dealt!`);
  }

  private async animateHealing(healing: number): Promise<void> {
    await this.showTurnMessage(`${healing} HP restored!`);
  }

  private async animateStatusEffects(effects: Array<{ type?: string }>): Promise<void> {
    for (const effect of effects) {
      await this.showTurnMessage(`${effect.type || 'Effect'} applied!`);
    }
  }
}