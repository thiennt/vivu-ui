import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { HomeScene } from './HomeScene';
import { Colors, Gradients } from '@/utils/colors';
import { gsap } from 'gsap';
import { app } from '@/app';
import { CardDetailPopup } from '@/popups/CardDetailPopup';
import { battleApi } from '@/services/api';
import { 
  CardBattleState, 
  TurnAction,
  Card,
  CardInDeck,
  BattleCard,
  CardType,
  CardRarity,
  BattleActionResult,
  AIAction,
  CardBattleCharacter,
  CardBattleLog,
  CardBattleApiResponse,
} from '@/types';
import { LoadingStateManager } from '@/utils/loadingStateManager';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private battleState: CardBattleState | null = null;
  private gameContainer!: Container;
  private player1Container!: Container;
  private player2Container!: Container;
  private player1HandContainer!: Container;
  private player2HandContainer!: Container;
  private player1EnergyContainer!: Container;
  private player2EnergyContainer!: Container;
  private battleLogContainer!: Container;
  private effectsContainer!: Container;
  
  // Drag and drop
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  private isDragging = false;

  // Fixed variables for each player's game state
  private player1Characters: CardBattleCharacter[] = [];
  private player1HandCards: CardInDeck[] = [];
  private player1DeckCards: CardInDeck[] = [];
  private player1DiscardedCards: CardInDeck[] = [];
  
  private player2Characters: CardBattleCharacter[] = [];
  private player2HandCards: CardInDeck[] = [];
  private player2DeckCards: CardInDeck[] = [];
  private player2DiscardedCards: CardInDeck[] = [];
  
  // Helper functions for card property access
  private getCurrentPlayer(): number {
    return this.battleState?.current_player || 1;
  }

  /**
   * Update fixed variables from the current battle state
   */
  private updateFixedVariables(): void {
    if (!this.battleState) return;

    // Clear existing state
    this.player1Characters = [];
    this.player1HandCards = [];
    this.player1DeckCards = [];
    this.player1DiscardedCards = [];
    this.player2Characters = [];
    this.player2HandCards = [];
    this.player2DeckCards = [];
    this.player2DiscardedCards = [];

    // Update from battle state players
    this.battleState.players.forEach(player => {
      if (player.team === 1) {
        this.player1Characters = [...player.characters];
        this.player1HandCards = [...player.deck.hand_cards];
        this.player1DeckCards = [...player.deck.deck_cards];
        this.player1DiscardedCards = [...player.deck.discard_cards];
      } else if (player.team === 2) {
        this.player2Characters = [...player.characters];
        this.player2HandCards = [...player.deck.hand_cards];
        this.player2DeckCards = [...player.deck.deck_cards];
        this.player2DiscardedCards = [...player.deck.discard_cards];
      }
    });

    console.log('🔄 Fixed variables updated:', {
      player1: {
        characters: this.player1Characters.length,
        hand: this.player1HandCards.length,
        deck: this.player1DeckCards.length,
        discard: this.player1DiscardedCards.length
      },
      player2: {
        characters: this.player2Characters.length,
        hand: this.player2HandCards.length,
        deck: this.player2DeckCards.length,
        discard: this.player2DiscardedCards.length
      }
    });
  }

  /**
   * Get characters for a specific player
   */
  private getPlayerCharacters(playerTeam: number): CardBattleCharacter[] {
    return playerTeam === 1 ? this.player1Characters : this.player2Characters;
  }

  /**
   * Get hand cards for a specific player
   */
  private getPlayerHandCards(playerTeam: number): CardInDeck[] {
    return playerTeam === 1 ? this.player1HandCards : this.player2HandCards;
  }

  /**
   * Get deck cards for a specific player
   */
  private getPlayerDeckCards(playerTeam: number): CardInDeck[] {
    return playerTeam === 1 ? this.player1DeckCards : this.player2DeckCards;
  }

  /**
   * Get discarded cards for a specific player
   */
  private getPlayerDiscardedCards(playerTeam: number): CardInDeck[] {
    return playerTeam === 1 ? this.player1DiscardedCards : this.player2DiscardedCards;
  }

  private async animateActionResult(result: BattleActionResult): Promise<void> {
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
      await this.animateStatusEffects(result.status_effects_applied);
    }
    
    // Log the actions performed (fallback for compatibility)
    result.actions_performed.forEach(action => {
      console.log(`📝 Action: ${action.description}`);
    });
  }

  /**
   * Helper method to process new API response format
   */
  private async processCardBattleApiResponse(response: CardBattleApiResponse<CardBattleLog[]>): Promise<void> {
    if (response.success && response.data) {
      console.log(`✅ API call successful: ${response.message}`);
      await this.processCardBattleLogs(response.data);
    } else {
      console.error(`❌ API call failed (${response.code}): ${response.message}`);
      if (response.errors) {
        response.errors.forEach((error: unknown) => console.error(`   Error: ${error}`));
      }
    }
  }

  /**
   * Centralized method to process CardBattleLogs for animations
   */
  private async processCardBattleLogs(battleLogs: CardBattleLog[]): Promise<void> {
    console.log('🎬 Processing CardBattle logs for animation:', battleLogs);
    
    for (const log of battleLogs) {
      await this.animateCardBattleLogEntry(log);
      
      // Small delay between log animations for better visual flow
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }



  /**
   * Animate a single CardBattleLog entry
   */
  private async animateCardBattleLogEntry(logEntry: CardBattleLog): Promise<void> {
    console.log(`🎭 Animating CardBattle log entry: ${logEntry.action_type} - ${logEntry.animation_hint}`);
    
    switch (logEntry.action_type) {
      case 'start_turn':
        await this.animateCardBattleStartTurn(logEntry);
        break;
      case 'draw_card':
      case 'draw_phase':
        await this.animateCardBattleDrawPhase(logEntry);
        break;
      case 'play_card':
        await this.animateCardBattlePlayCard(logEntry);
        break;
      case 'discard_card':
        await this.animateCardBattleDiscardCard(logEntry);
        break;
      case 'damage':
        await this.animateCardBattleDamage(logEntry);
        break;
      case 'heal':
        await this.animateCardBattleHeal(logEntry);
        break;
      case 'effect_trigger':
      case 'status_effect':
        await this.animateCardBattleStatusEffect(logEntry);
        break;
      case 'energy':
      case 'energy_update':
        await this.animateCardBattleEnergyUpdate(logEntry);
        break;
      case 'end_turn':
        await this.animateCardBattleEndTurn(logEntry);
        break;
      default:
        console.log(`⚠️ Unknown CardBattle log entry type: ${logEntry.action_type}`);
        // Show generic message for unknown types
        await this.showTurnMessage(logEntry.animation_hint || 'Unknown action');
    }
  }





  /**
   * Animation methods for CardBattleLog entries
   */
  private async animateCardBattleDrawPhase(logEntry: CardBattleLog): Promise<void> {
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

  private async animateCardBattlePlayCard(logEntry: CardBattleLog): Promise<void> {
    const playerText = logEntry.actor.team === 1 ? 'Player' : 'AI';
    const cardName = logEntry.card?.name || 'a card';
    
    // Find the actor character if specified
    if (logEntry.actor.character_id) {
      const actorCard = this.findCharacterCard(logEntry.actor.character_id, logEntry.actor.team);
      if (actorCard && logEntry.card) {
        await this.animateCharacterCardPlay(actorCard, logEntry.card.card_type);
      }
    }
    
    // Show card play message
    await this.showTurnMessage(`${playerText}: Played ${cardName}`);
  }

  private async animateCharacterCardPlay(characterCard: Container, cardType: string): Promise<void> {
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

  private async animateCardBattleDiscardCard(logEntry: CardBattleLog): Promise<void> {
    const playerText = logEntry.actor.team === 1 ? 'Player' : 'AI';
    const cardName = logEntry.card?.name || 'a card';
    
    // If we have the card details, animate it flying to discard pile
    if (logEntry.card) {
      await this.animateCardToDiscardPile(logEntry.card, logEntry.actor.team);
    }
    
    await this.showTurnMessage(`${playerText}: Discarded ${cardName}`);
  }

  private async animateCardToDiscardPile(card: any, team: number): Promise<void> {
    // Create temporary card visual
    const tempCard = new Graphics();
    tempCard.roundRect(0, 0, 50, 70, 5)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Start from hand area
    const handContainer = team === 1 ? this.player1HandContainer : this.player2HandContainer;
    tempCard.x = handContainer.x + handContainer.width / 2;
    tempCard.y = handContainer.y + 10;
    tempCard.alpha = 0.8;
    
    this.effectsContainer.addChild(tempCard);
    
    // Calculate discard pile position (next to deck)
    const discardX = this.STANDARD_PADDING + 80; // Next to deck
    const discardY = team === 1 ? 
      this.player1EnergyContainer.y + 50 : 
      this.player2EnergyContainer.y - 50;
    
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

  private async animateCardBattleDamage(logEntry: CardBattleLog): Promise<void> {
    // Find target characters to animate
    if (logEntry.targets && logEntry.targets.length > 0) {
      for (const target of logEntry.targets) {
        const targetCard = this.findCharacterCard(target.id, target.team);
        if (targetCard) {
          // Calculate total damage from impacts
          const damageImpacts = target.impacts.filter(impact => impact.type === 'damage');
          const totalDamage = damageImpacts.reduce((sum, impact) => {
            return sum + (typeof impact.value === 'number' ? impact.value : 0);
          }, 0);
          
          if (totalDamage > 0) {
            await this.animateTargetHit(targetCard, totalDamage);
          }
        }
      }
    }
    
    // Show animation hint as well
    await this.showTurnMessage(`💥 ${logEntry.animation_hint || 'Damage dealt'}`);
  }

  private async animateCardBattleHeal(logEntry: CardBattleLog): Promise<void> {
    // Find target characters to animate
    if (logEntry.targets && logEntry.targets.length > 0) {
      for (const target of logEntry.targets) {
        const targetCard = this.findCharacterCard(target.id, target.team);
        if (targetCard) {
          // Calculate total healing from impacts
          const healImpacts = target.impacts.filter(impact => impact.type === 'heal');
          const totalHealing = healImpacts.reduce((sum, impact) => {
            return sum + (typeof impact.value === 'number' ? impact.value : 0);
          }, 0);
          
          if (totalHealing > 0) {
            await this.animateTargetHeal(targetCard, totalHealing);
          }
        }
      }
    }
    
    // Show animation hint as well
    await this.showTurnMessage(`💚 ${logEntry.animation_hint || 'Healing applied'}`);
  }

  private async animateTargetHit(targetCard: Container, damage: number): Promise<void> {
    // Shake effect for target
    const originalX = targetCard.x;
    await gsap.to(targetCard, { 
      x: originalX - 5, 
      duration: 0.05 
    });
    await gsap.to(targetCard, { 
      x: originalX + 5, 
      duration: 0.05 
    });
    await gsap.to(targetCard, { 
      x: originalX, 
      duration: 0.05 
    });
    
    // Damage number animation
    await this.showDamageNumber(targetCard, damage);
  }

  private async animateTargetHeal(targetCard: Container, healing: number): Promise<void> {
    // Gentle glow effect for healing
    const originalScale = { x: targetCard.scale.x, y: targetCard.scale.y };
    await gsap.to(targetCard.scale, { 
      x: originalScale.x * 1.1, 
      y: originalScale.y * 1.1, 
      duration: 0.2,
      ease: 'power2.out'
    });
    await gsap.to(targetCard.scale, { 
      x: originalScale.x, 
      y: originalScale.y, 
      duration: 0.2,
      ease: 'power2.in'
    });
    
    // Healing number animation
    await this.showHealingNumber(targetCard, healing);
  }

  private async showDamageNumber(targetCard: Container, damage: number): Promise<void> {
    const damageText = new Text({
      text: `-${damage}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xFF4444,
        stroke: { color: 0xFFFFFF, width: 2 }
      }
    });
    
    damageText.anchor.set(0.5);
    damageText.x = targetCard.x + (targetCard.parent?.x || 0) + 50;
    damageText.y = targetCard.y + (targetCard.parent?.y || 0) + 30;
    
    this.effectsContainer.addChild(damageText);
    
    // Animate damage number floating up and fading
    await gsap.to(damageText, { 
      y: damageText.y - 50, 
      alpha: 0, 
      scale: 1.5,
      duration: 1, 
      ease: 'power2.out' 
    });
    
    this.effectsContainer.removeChild(damageText);
  }

  private async showHealingNumber(targetCard: Container, healing: number): Promise<void> {
    const healText = new Text({
      text: `+${healing}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0x44FF44,
        stroke: { color: 0xFFFFFF, width: 2 }
      }
    });
    
    healText.anchor.set(0.5);
    healText.x = targetCard.x + (targetCard.parent?.x || 0) + 50;
    healText.y = targetCard.y + (targetCard.parent?.y || 0) + 30;
    
    this.effectsContainer.addChild(healText);
    
    // Animate heal number floating up and fading
    await gsap.to(healText, { 
      y: healText.y - 50, 
      alpha: 0, 
      scale: 1.5,
      duration: 1, 
      ease: 'power2.out' 
    });
    
    this.effectsContainer.removeChild(healText);
  }

  private async animateCardBattleStatusEffect(logEntry: CardBattleLog): Promise<void> {
    // Find target characters to animate
    if (logEntry.targets && logEntry.targets.length > 0) {
      for (const target of logEntry.targets) {
        const targetCard = this.findCharacterCard(target.id, target.team);
        if (targetCard) {
          // Find status effects from impacts
          const statusImpacts = target.impacts.filter(impact => impact.type === 'status' || impact.type === 'effect');
          if (statusImpacts.length > 0) {
            await this.animateStatusEffectOnTarget(targetCard, statusImpacts);
          }
        }
      }
    }
    
    // Show animation hint as well
    await this.showTurnMessage(`✨ ${logEntry.animation_hint || 'Status effect triggered'}`);
  }

  private async animateStatusEffectOnTarget(targetCard: Container, impacts: any[]): Promise<void> {
    // Create a particle effect for status
    const effect = new Graphics();
    effect.zIndex = 1000; // Ensure effect is on top
    const targetX = targetCard.x + (targetCard.parent?.x || 0) + 50;
    const targetY = targetCard.y + (targetCard.parent?.y || 0) + 60;
    
    // Create sparkle effect for status
    effect.circle(0, 0, 15).fill(0xFFDD44);
    effect.circle(0, 0, 10).fill(0xFFFF88);
    effect.x = targetX;
    effect.y = targetY;
    effect.alpha = 0;
    effect.scale.set(0.5);
    
    this.effectsContainer.addChild(effect);

    // Animate effect
    await gsap.to(effect, { 
      alpha: 1, 
      scale: 1.2, 
      duration: 0.2, 
      ease: 'power2.out' 
    });
    await gsap.to(effect, { 
      alpha: 0, 
      scale: 0.8, 
      duration: 0.3, 
      ease: 'power2.in' 
    });
    
    this.effectsContainer.removeChild(effect);
  }

  private async animateCardBattleEndTurn(logEntry: CardBattleLog): Promise<void> {
    await this.showTurnMessage(`⏭️ ${logEntry.animation_hint || 'Turn ended'}`);
  }

  private async animateCardBattleStartTurn(logEntry: CardBattleLog): Promise<void> {
    const playerText = logEntry.actor.team === 1 ? 'Player' : 'AI';
    await this.showTurnMessage(`🎯 ${playerText} Turn Started`);
  }

  private async animateCardBattleEnergyUpdate(logEntry: CardBattleLog): Promise<void> {
    // Find energy impacts in the log entry
    if (logEntry.impacts) {
      const energyImpacts = logEntry.impacts.filter(impact => impact.type === 'energy');
      if (energyImpacts.length > 0) {
        for (const impact of energyImpacts) {
          await this.animateEnergyChangeVisual(logEntry.actor.team, impact.value);
        }
      }
    }
    
    await this.showTurnMessage(`⚡ ${logEntry.animation_hint || 'Energy updated'}`);
  }

  private async animateEnergyChangeVisual(team: number, energyChange: number | string | object): Promise<void> {
    const energyContainer = team === 1 ? this.player1EnergyContainer : this.player2EnergyContainer;
    
    if (typeof energyChange === 'number' && energyChange !== 0) {
      // Create energy change indicator
      const changeText = new Text({
        text: energyChange > 0 ? `+${energyChange}` : `${energyChange}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fontWeight: 'bold',
          fill: energyChange > 0 ? 0x44FF44 : 0xFF4444,
          stroke: { color: 0xFFFFFF, width: 1 }
        }
      });
      
      changeText.anchor.set(0.5);
      changeText.x = energyContainer.x + 70; // Center of energy display
      changeText.y = energyContainer.y + 15;
      changeText.alpha = 0;
      
      this.effectsContainer.addChild(changeText);
      
      // Animate the energy change floating up
      await gsap.to(changeText, {
        y: changeText.y - 30,
        alpha: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      await gsap.to(changeText, {
        y: changeText.y - 20,
        alpha: 0,
        duration: 0.5,
        ease: 'power2.in'
      });
      
      this.effectsContainer.removeChild(changeText);
    }
  }

  private async animateAIActions(aiActions: AIAction[]): Promise<void> {
    console.log('🤖 Animating AI actions:', aiActions);
    
    for (const action of aiActions) {
      await this.showTurnMessage(`AI: ${action.type.replace('_', ' ')}`);
      
      switch (action.type) {
        case 'draw_phase':
          console.log('🃏 AI drawing cards...');
          break;
        case 'play_card':
          console.log(`🎯 AI playing card ${action.card_id} from ${action.character_id} targeting ${action.target_ids?.join(', ')}`);
          if (action.result) {
            await this.animateActionResult(action.result);
          }
          break;
        case 'discard_card':
          console.log(`🗑️ AI discarding card ${action.card_id}`);
          break;
        case 'end_turn':
          console.log('⏭️ AI ending turn');
          break;
      }
      
      // Small delay between actions for better visual flow
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private async refreshBattleState(): Promise<void> {
    try {
      console.log('🔄 Refreshing battle state...');
      const response = await battleApi.getBattleState(this.battleId);
      if (response.success && response.data) {
        this.battleState = response.data;
        this.updateFixedVariables(); // Update fixed variables when battle state changes
        console.log(`✅ Battle state refreshed: ${response.message}`);
      } else {
        console.error(`❌ Failed to refresh battle state: ${response.message}`);
        if (response.errors) {
          response.errors.forEach((error: any) => console.error(`   Error: ${error}`));
        }
        throw new Error('Failed to refresh battle state');
      }
      this.refreshUI();
    } catch (error) {
      console.error('❌ Error refreshing battle state:', error);
      throw error;
    }
  }



  private async animateDamage(damage: number): Promise<void> {
    console.log(`💥 Animating ${damage} damage`);
    // Placeholder for damage animation
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async animateHealing(healing: number): Promise<void> {
    console.log(`💚 Animating ${healing} healing`);
    // Placeholder for healing animation  
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async animateStatusEffects(effects: any[]): Promise<void> {
    console.log('✨ Animating status effects:', effects);
    // Placeholder for status effect animation
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private async animateCardDraw(cards: Card[]): Promise<void> {
    console.log(`🃏 Animating drawing ${cards.length} cards`);
    // Placeholder for card draw animation
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  private async animateEnergyUpdate(energy: number): Promise<void> {
    console.log(`⚡ Updating energy to ${energy}`);
    // Placeholder for energy update animation
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Helper functions for card property access (still needed for UI display)
  private getEnergyCost(card: Card | BattleCard): number {
    if ('energyCost' in card) {
      return card.energyCost;
    } else {
      return (card as Card).energy_cost;
    }
  }
  
  private getCardType(card: Card | BattleCard): string {
    if ('cardType' in card) {
      return card.cardType || 'special';
    } else {
      return (card as Card).card_type || 'special';
    }
  }
  private dropZones: { area: Container, type: 'character' | 'discard', playerId: number, characterIndex?: number }[] = [];

  private battleId: string;

  private loadingManager: LoadingStateManager;

  constructor(params?: {  battle_id?: string }) {
    super();

    this.container = new Container();
    this.addChild(this.container);

    this.battleId = params?.battle_id || '';

    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
  }

  async prepare(): Promise<void> {
    this.loadingManager.showLoading();

    try {
      console.log('🔄 Preparing CardBattleScene...');
      
      // Load battle state from API (will use mock data if configured)
      console.log('🔄 Loading battle state...');
      const response = await battleApi.getBattleState(this.battleId);
      if (response.success && response.data) {
        this.battleState = response.data;
        this.updateFixedVariables(); // Initialize fixed variables on first load
        console.log(`✅ Battle state loaded: ${response.message}`, this.battleState);
      } else {
        console.error(`❌ Failed to load battle state: ${response.message}`);
        if (response.errors) {
          response.errors.forEach((error: any) => console.error(`   Error: ${error}`));
        }
        throw new Error('Failed to load battle state');
      }
      
      this.loadingManager.hideLoading();
      this.initializeUI();
      
    } catch (error) {
      console.error('❌ Error preparing battle scene:', error);
      this.loadingManager.hideLoading();
      alert('Failed to prepare battle. Please try again.');
      navigation.showScreen(HomeScene);
    }
  }

  private initializeUI(): void {
    this.createBackground();
    this.createGameLayout();
    this.createActionButtons();
    this.updateBottomNavigation();
  }

  private findCharacterCard(characterId: string, team: number): Container | null {
    const playerContainer = team === 1 ? this.player1Container : this.player2Container;
    const characters = this.getPlayerCharacters(team);
    
    if (!playerContainer) return null;
    
    const characterIndex = characters.findIndex(char => char.character_id === characterId);
    if (characterIndex >= 0 && characterIndex < playerContainer.children.length) {
      return playerContainer.children[characterIndex] as Container;
    }
    return null;
  }

  private findCharacterByTeam(team: number, characterIndex: number = 0): Container | null {
    const playerContainer = team === 1 ? this.player1Container : this.player2Container;
    
    if (!playerContainer || characterIndex >= playerContainer.children.length) return null;
    
    return playerContainer.children[characterIndex] as Container;
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
  }

  /** Show the screen with animation */
  async show(): Promise<void> {
    this.startBattleSequence();
  }

  private async startBattleSequence(): Promise<void> {
    console.log('🎯 Starting battle sequence...');
    
    try {
      // Step 1: UI displays both teams, decks, discard piles, energy, and empty hands
      console.log('📋 Displaying battle state - teams, decks, discard piles, energy, hands');
      
      // Give a moment to see the initial setup (teams, decks, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Start the battle turn loop
      await this.startBattleTurnLoop();
      
    } catch (error) {
      console.error('❌ Error in battle sequence:', error);
      alert('Battle sequence failed. Please try again.');
      navigation.showScreen(HomeScene);
    }
  }

  private async startBattleTurnLoop(): Promise<void> {
    console.log('🔄 Starting battle turn loop...');
    
    while (true) {
      // Check for battle end conditions first
      if (this.checkBattleEnd()) {
        return;
      }
      
      // Start player turn - UI highlights player's turn, calls start-turn API
      console.log('👤 Player Turn Phase');
      await this.startPlayerTurn();
      
      // Check for battle end after player turn
      if (this.checkBattleEnd()) {
        return;
      }
      
      // Now waiting for player to interact (play cards, end turn)
      // The turn will continue when player clicks "End Turn" button
      // which calls endTurn() -> handleAITurn() -> startPlayerTurn() 
      console.log('⏭️ Waiting for player to interact and end turn...');
      
      // Exit loop to allow player interaction - the turn flow continues in endTurn()
      break;
    }
  }

  private async startPlayerTurn(): Promise<void> {
    console.log('🎯 Starting player turn...');
    
    // Show "Your Turn" message
    await this.showTurnMessage('Your Turn!');

    // Call the API (will use mock data if configured)
    const turnStartResult = await battleApi.startTurn(this.battleId);
    
    if (!turnStartResult.success) {
      console.error('❌ Failed to start turn:', turnStartResult.message);
      throw new Error('Failed to start turn');
    }

    console.log('📥 Processing turn start result:', turnStartResult);
    
    // Process API response format
    await this.processCardBattleApiResponse(turnStartResult);

    await this.drawCards();
    
    console.log('🎯 Player turn: Main phase - you can now play cards');
  }

  private async drawCards(): Promise<void> {
    if (!this.battleState) return;
    
    const turnAction: TurnAction = {
      type: 'draw_card',
      player_team: this.getCurrentPlayer()
    };

    const drawResult = await battleApi.drawCards(this.battleId, turnAction);
    if (!drawResult.success) {
      console.error('❌ Failed to draw cards:', drawResult.message);
      throw new Error('Failed to draw cards');
    }

    console.log('📥 Processing draw cards result:', drawResult);

    // Process API response format
    await this.processCardBattleApiResponse(drawResult);
  }

  private async showTurnMessage(message: string): Promise<void> {
    const messageContainer = new Container();
    
    const bg = new Graphics()
      .roundRect(0, 0, 300, 80, 15)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY });
    
    const text = new Text({
      text: message,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    text.anchor.set(0.5);
    text.x = 150;
    text.y = 40;
    
    messageContainer.addChild(bg, text);
    messageContainer.x = (this.gameWidth - 300) / 2;
    messageContainer.y = (this.gameHeight - 80) / 2;
    messageContainer.alpha = 0;
    
    this.container.addChild(messageContainer);
    
    // Fade in
    const fadeIn = { alpha: 0 };
    return new Promise(resolve => {
      const animate = () => {
        fadeIn.alpha += 0.05;
        messageContainer.alpha = fadeIn.alpha;
        
        if (fadeIn.alpha >= 1) {
          // Hold for a moment, then fade out
          setTimeout(() => {
            const fadeOut = { alpha: 1 };
            const animateOut = () => {
              fadeOut.alpha -= 0.05;
              messageContainer.alpha = fadeOut.alpha;
              
              if (fadeOut.alpha <= 0) {
                this.container.removeChild(messageContainer);
                resolve();
              } else {
                requestAnimationFrame(animateOut);
              }
            };
            animateOut();
          }, 1500);
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
  }

  private createBackground(): void {
    const bg = new Graphics();
    const availableHeight = this.getContentHeight();
    const backgroundGradient = Gradients.createBackgroundGradient(this.gameWidth, availableHeight);
    bg.rect(0, 0, this.gameWidth, availableHeight).fill(backgroundGradient);
    this.container.addChild(bg);
  }

  private createGameLayout(): void {
    this.gameContainer = new Container();
    
    // Create main containers
    this.player1Container = new Container();
    this.player2Container = new Container();
    this.player1HandContainer = new Container();
    this.player2HandContainer = new Container();
    this.player1EnergyContainer = new Container();
    this.player2EnergyContainer = new Container();
    this.battleLogContainer = new Container();
    this.effectsContainer = new Container();

    // Layout calculations - fit all elements with proper spacing
    const availableHeight = this.getContentHeight();
    const padding = this.STANDARD_PADDING;
    const spacing = this.STANDARD_SPACING;
    
    // Calculate heights for each section
    const handHeight = 80;
    const characterAreaHeight = 100;
    const energyHeight = 35;
    const logHeight = 60;
    
    // Total required height
    const totalRequiredHeight = handHeight + characterAreaHeight + energyHeight + logHeight + energyHeight + characterAreaHeight + handHeight + (spacing * 7) + (padding * 2);
    
    // Adjust spacing if needed to fit everything
    let adjustedSpacing = spacing;
    if (totalRequiredHeight > availableHeight) {
      adjustedSpacing = Math.max(5, (availableHeight - (handHeight * 2 + characterAreaHeight * 2 + energyHeight * 2 + logHeight + padding * 2)) / 7);
    }
    
    let currentY = padding;
    
    // Layout in order according to requirements:
    // 1. Player 2 Hand Area
    this.player2HandContainer.y = currentY;
    this.createHandArea(this.player2HandContainer, 2, false);
    currentY += handHeight + adjustedSpacing;
    
    // 2. Player 2 character cards (with deck + discard pile)
    this.player2Container.y = currentY;
    this.createPlayerArea(this.player2Container, 2);
    currentY += characterAreaHeight + adjustedSpacing;
    
    // 3. Player 2 energy area
    this.player2EnergyContainer.y = currentY;
    this.createEnergyArea(this.player2EnergyContainer, 2);
    currentY += energyHeight + adjustedSpacing;

    // 4. Battle log
    this.battleLogContainer.y = currentY;
    this.createBattleLog();
    currentY += logHeight + adjustedSpacing;
    
    // 5. Player 1 energy area
    this.player1EnergyContainer.y = currentY;
    this.createEnergyArea(this.player1EnergyContainer, 1);
    currentY += energyHeight + adjustedSpacing;
    
    // 6. Player 1 character cards
    this.player1Container.y = currentY;
    this.createPlayerArea(this.player1Container, 1);
    currentY += characterAreaHeight + adjustedSpacing;
    
    // 7. Player 1 hand area
    this.player1HandContainer.y = currentY;
    this.createHandArea(this.player1HandContainer, 1, true);

    this.gameContainer.addChild(
      this.player2HandContainer,
      this.player2Container,
      this.player2EnergyContainer,
      this.battleLogContainer,
      this.player1EnergyContainer,
      this.player1Container,
      this.player1HandContainer,
      this.effectsContainer
    );

    this.container.addChild(this.gameContainer);

    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onDragEnd, this);
    app.stage.on('pointerupoutside', this.onDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  private createEnergyArea(container: Container, playerNo: number): void {
    const player = this.battleState ? this.battleState.players.find(p => p.team === playerNo) : null;

    // Energy display - centered horizontally
    const energyBg = new Graphics();
    energyBg.roundRect(0, 0, 140, 30, 8)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    const energyText = new Text({
      text: `Energy: ${player?.deck.current_energy || 0}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = 70;
    energyText.y = 15;

    container.addChild(energyBg, energyText);
    
    // Center the energy display horizontally
    container.x = (this.gameWidth - 140) / 2;
  }

  private createPlayerArea(container: Container, playerNo: number): void {
    const characterWidth = 80;
    const characterSpacing = 10;
    const padding = this.STANDARD_PADDING;

    const characters = this.getPlayerCharacters(playerNo);
    const deckCards = this.getPlayerDeckCards(playerNo);
    const discardCards = this.getPlayerDiscardedCards(playerNo);
    
    const totalCharacterWidth = characters.length * characterWidth + Math.max(0, characters.length - 1) * characterSpacing;
    const startX = (this.gameWidth - totalCharacterWidth) / 2;

    // Create character cards (energy is now handled separately)
    characters.forEach((character, index) => {
      const x = startX + index * (characterWidth + characterSpacing);
      const y = 10; // Reduced Y offset since energy is separate
      const characterCard = this.createCharacterCard(character, x, y, characterWidth);
      
      this.dropZones.push({
        area: characterCard,
        type: 'character',
        playerId: playerNo,
        characterIndex: index
      });
      
      container.addChild(characterCard);
    });

    // Deck and discard pile
    const deckX = padding;
    const discardX = this.gameWidth - padding - 60;
    const pileY = 10; // Reduced Y offset since energy is separate

    // Deck
    const deckCard = this.createDeckCard(deckX, pileY, deckCards.length);
    container.addChild(deckCard);

    // Discard pile
    const discardCard = this.createDiscardPile(discardX, pileY, discardCards);
    
    this.dropZones.push({
      area: discardCard,
      type: 'discard',
      playerId: playerNo
    });
    
    container.addChild(discardCard);
  }

  private createHandArea(container: Container, playerNo: number, showCards: boolean): void {
    const player = this.battleState ? this.battleState.players.find(p => p.team === playerNo) : null;
    const handCards = this.getPlayerHandCards(playerNo);

    if (!player) return;

    const cardWidth = 60;
    const handCount = handCards.length;
    const padding = this.STANDARD_PADDING;
    const maxVisible = 5;
    let cardSpacing: number;
    let totalWidth: number;
    let startX: number;

    if (handCount <= maxVisible) {
      // Fixed spacing, center the hand
      cardSpacing = cardWidth + 12; // 12px gap between cards
      totalWidth = cardWidth + (handCount - 1) * cardSpacing;
      startX = (this.gameWidth - totalWidth) / 2;
    } else {
      // Overlap so all cards fit between paddings
      cardSpacing = (this.gameWidth - 2 * padding - cardWidth) / (handCount - 1);
      cardSpacing = Math.min(cardSpacing, cardWidth); // Prevent negative/too much overlap
      startX = padding;
    }

    for (let index = 0; index < handCount; index++) {
      const x = startX + index * cardSpacing;
      const y = 10;

      const card = handCards[index];

      const cardContainer = showCards
        ? this.createHandCard(card, x, y, cardWidth)
        : this.createFaceDownCard(x, y, cardWidth);

      // Make player 1 cards draggable
      if (showCards && playerNo === 1) {
        this.makeCardDraggable(cardContainer);
      }

      container.addChild(cardContainer);
    }
  }

  private createCharacterCard(character: CardBattleCharacter, x: number, y: number, width: number): Container {
    const card = new Container();
    const height = 90;
    
    // Background based on rarity
    const rarityColors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill(rarityColors.common)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Character name/ticker
    const nameText = new Text({
      text: character.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = width / 2;
    nameText.y = 12;
    
    // HP Bar
    const hpBarBg = new Graphics();
    hpBarBg.roundRect(5, 25, width - 10, 8, 4)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 1, color: Colors.CARD_BORDER });

    const hpPercentage = character.current_hp / character.max_hp;
    const hpBarFill = new Graphics();
    hpBarFill.roundRect(6, 26, (width - 12) * hpPercentage, 6, 3)
      .fill(hpPercentage > 0.5 ? 0x4caf50 : hpPercentage > 0.25 ? 0xff9800 : 0xf44336);
    
    // HP Text
    const hpText = new Text({
      text: `${character.current_hp}/${character.max_hp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    hpText.anchor.set(0.5);
    hpText.x = width / 2;
    hpText.y = 42;
    
    // Stats
    const statsText = new Text({
      text: `ATK:${character.atk} DEF:${character.def}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 7,
        fill: Colors.TEXT_TERTIARY,
        align: 'center'
      }
    });
    statsText.anchor.set(0.5);
    statsText.x = width / 2;
    statsText.y = 55;

    // Add avatar if available
    if (character.avatar_url) {
      this.createAvatar(character, width, height).then(avatarIcon => {
        avatarIcon.y = 65;
        card.addChild(avatarIcon);
      });
    }
    
    card.addChild(bg, nameText, hpBarBg, hpBarFill, hpText, statsText);
    card.x = x;
    card.y = y;
    
    return card;
  }

  private createHandCard(card: CardInDeck, x: number, y: number, width: number): Container {
    const container = new Container();
    const height = 70;

    if (!card) {
      // Empty card slot
      return container;
    }

    // Card background based on rarity
    const rarityColors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    
    const bg = new Graphics();
    const rarity = card.card?.rarity ?? 'common';
    bg.roundRect(0, 0, width, height, 5)
      .fill(rarityColors[rarity] || rarityColors.common)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    // Energy cost (top left corner)
    const costBg = new Graphics();
    costBg.circle(10, 10, 8)
      .fill(Colors.BACKGROUND_PRIMARY)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    const costText = new Text({
      text: card.card ? this.getEnergyCost(card.card).toString() : '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    costText.anchor.set(0.5);
    costText.x = 10;
    costText.y = 10;
    
    // Card name
    const nameText = new Text({
      text: card.card?.name || 'Unknown',
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = width / 2;
    nameText.y = 25;
    
    // Card type indicator
    const typeText = new Text({
      text: card.card ? this.getCardType(card.card).toUpperCase() : 'UNKNOWN',
      style: {
        fontFamily: 'Kalam',
        fontSize: 6,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    typeText.anchor.set(0.5);
    typeText.x = width / 2;
    typeText.y = 40;

    // Description text
    const descText = new Text({
      text: card.card?.description || '',
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    descText.anchor.set(0.5);
    descText.x = width / 2;
    descText.y = 55;

    container.addChild(bg, costBg, costText, nameText, typeText, descText);
    container.x = x;
    container.y = y;
    
    // Store card reference for drag operations
    (container as any).cardData = card;
    
    return container;
  }

  private createFaceDownCard(x: number, y: number, width: number): Container {
    const container = new Container();
    const height = 70;
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    const backText = new Text({
      text: 'CARD',
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    backText.anchor.set(0.5);
    backText.x = width / 2;
    backText.y = height / 2;
    
    container.addChild(bg, backText);
    container.x = x;
    container.y = y;
    
    return container;
  }

  private createDeckCard(x: number, y: number, cardCount: number): Container {
    const container = new Container();
    const width = 50;
    const height = 70;
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    const deckText = new Text({
      text: 'DECK',
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    deckText.anchor.set(0.5);
    deckText.x = width / 2;
    deckText.y = height / 2 - 8;
    
    const countText = new Text({
      text: cardCount.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    countText.anchor.set(0.5);
    countText.x = width / 2;
    countText.y = height / 2 + 8;
    
    container.addChild(bg, deckText, countText);
    container.x = x;
    container.y = y;
    
    return container;
  }

  private createDiscardPile(x: number, y: number, discardedCards: CardInDeck[]): Container {
    const container = new Container();
    const width = 50;
    const height = 70;
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    const discardText = new Text({
      text: 'DISCARD',
      style: {
        fontFamily: 'Kalam',
        fontSize: 7,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    discardText.anchor.set(0.5);
    discardText.x = width / 2;
    discardText.y = height / 2 - 8;
    
    const countText = new Text({
      text: discardedCards.length.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    countText.anchor.set(0.5);
    countText.x = width / 2;
    countText.y = height / 2 + 8;
    
    // Show top card if any
    if (discardedCards.length > 0) {
      const topCard = discardedCards[discardedCards.length - 1];
      const cardPreview = new Text({
        text: topCard.card?.name.slice(0, 8),
        style: {
          fontFamily: 'Kalam',
          fontSize: 6,
          fill: Colors.TEXT_SECONDARY,
          align: 'center'
        }
      });
      cardPreview.anchor.set(0.5);
      cardPreview.x = width / 2;
      cardPreview.y = 15;
      container.addChild(cardPreview);
    }
    
    container.addChild(bg, discardText, countText);
    container.x = x;
    container.y = y;
    
    return container;
  }

  private createBattleLog(): void {
    const width = this.gameWidth - 2 * this.STANDARD_PADDING;
    const height = 60;
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    const titleText = new Text({
      text: `Turn ${this.battleState?.current_turn} - Player ${this.battleState?.current_player}'s Turn`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    titleText.x = 10;
    titleText.y = 10;
    
    const phaseText = new Text({
      text: `Phase: ${this.battleState?.phase}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY
      }
    });
    phaseText.x = 10;
    phaseText.y = 30;
    
    this.battleLogContainer.addChild(bg, titleText, phaseText);
    this.battleLogContainer.x = this.STANDARD_PADDING;
  }

  private createActionButtons(): void {
    const buttonContainer = new Container();
    const buttonWidth = 120;
    const buttonHeight = 44;

    // End Turn button
    const endTurnButton = this.createButton(
      'End Turn',
      this.gameWidth - buttonWidth - this.STANDARD_PADDING,
      this.getContentHeight() - buttonHeight - 10,
      buttonWidth,
      buttonHeight,
      () => this.endTurn(),
      12
    );
    
    // Back button
    const backButton = this.createButton(
      '← Back',
      this.STANDARD_PADDING,
      this.getContentHeight() - buttonHeight - 10,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene),
      12
    );
    
    buttonContainer.addChild(endTurnButton, backButton);

    this.container.addChild(buttonContainer);
  }

  private makeCardDraggable(cardContainer: Container): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'pointer';

    cardContainer.on('pointerdown', (event) => {
      this.onDragStart(event, cardContainer);
    });
  }

  private showCardDetails(card: CardInDeck): void {
    // Convert CardInDeck to BattleCard for the popup
    const battleCard: BattleCard = {
      id: card.card_id || 'unknown',
      name: card.card?.name || 'Unknown Card',
      description: card.card?.description || 'No description',
      energyCost: card.card ? this.getEnergyCost(card.card) : 0,
      group: CardType.SPECIAL, // Default fallback
      rarity: CardRarity.COMMON, // Default fallback
      effects: [],
      cardType: card.card ? this.getCardType(card.card) : 'special'
    };
    
    navigation.presentPopup(class extends CardDetailPopup {
      constructor() {
        super({ card: battleCard });
      }
    });
  }

  private onDragStart(event: any, cardContainer: Container): void {
    cardContainer.alpha = 0.8;
    this.dragTarget = cardContainer;

    // Calculate and store drag offset
    const globalCardPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    this.dragOffset = {
      x: event.global.x - (globalCardPos?.x || 0),
      y: event.global.y - (globalCardPos?.y || 0)
    };

    // Move card to top layer for dragging
    const globalPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    app.stage.addChild(cardContainer);
    if (globalPos) {
      cardContainer.position.set(globalPos.x, globalPos.y);
    }

    // Attach event listeners
    app.stage.on('pointermove', this.onDragMove, this);
    app.stage.on('pointerup', this.onDragEnd, this);
    app.stage.on('pointerupoutside', this.onDragEnd, this);
  }

  private onDragMove(event: any): void {
    if (this.dragTarget) {
      const parent = this.dragTarget.parent;
      if (parent) {
        const newPos = parent.toLocal({
          x: event.global.x - this.dragOffset.x,
          y: event.global.y - this.dragOffset.y
        });
        this.dragTarget.position.set(newPos.x, newPos.y);
        this.isDragging = true;
      }
    }
  }

  private onDragEnd(event: any): void {
    if (!this.dragTarget) return;

    this.dragTarget.alpha = 1;
    const card = (this.dragTarget as any).cardData as CardInDeck;

    if (this.isDragging) {
      // Check if dropped on a valid target
      const dropTarget = this.getDropTarget(event.global);

      if (dropTarget) {
        if (dropTarget.type === 'character') {
          // Make this async to handle API calls
          this.playCardOnCharacter(card, dropTarget.playerId, dropTarget.characterIndex!).then(() => {
            this.refreshUI();
          });
        } else if (dropTarget.type === 'discard') {
          this.discardCard(card).then(() => {
            // Card discard completed
          });
        }
        // Clean up after successful action
        this.cleanupDrag(true);
      } else {
        // No valid drop target - return card to original position
        this.cleanupDrag(false);
        this.refreshUI();
      }
    } else {
      this.showCardDetails(card);
      // Clean up after showing card details
      this.cleanupDrag(false);
      this.refreshUI();
    }
  }

  private getDropTarget(globalPos: { x: number, y: number }): { type: 'character' | 'discard', playerId: number, characterIndex?: number } | null {
    // Simple collision detection with drop zones
    for (const zone of this.dropZones) {
      const bounds = zone.area.getBounds();
      if (globalPos.x >= bounds.x && globalPos.x <= bounds.x + bounds.width &&
          globalPos.y >= bounds.y && globalPos.y <= bounds.y + bounds.height) {
        return zone;
      }
    }
    return null;
  }

  private async playCardOnCharacter(card: CardInDeck, targetPlayerId: number, characterIndex: number): Promise<void> {
    // Prepare move data for new API
    const turnAction: TurnAction = {
      type: 'play_card',
      player_team: this.getCurrentPlayer(),
      card_id: card.card_id || 'unknown',
      character_id: `player_char_${this.getCurrentPlayer()}`,
      target_ids: [`${targetPlayerId === 1 ? 'player' : 'enemy'}_char_${characterIndex}`]
    };

    console.log('🎮 Playing card...', turnAction);
    
    // Call the API (will use mock data if configured)
    const moveResponse = await battleApi.playAction(this.battleId, turnAction);
    
    if (!moveResponse.success) {
      console.error('❌ Failed to play card:', moveResponse.message);
      throw new Error('Failed to play card');
    }

    // Process API response format
    await this.processCardBattleApiResponse(moveResponse);
    
    // Refresh battle state
    await this.refreshBattleState();
    
    console.log('✅ Card played successfully');
  }

  private async discardCard(card: CardInDeck): Promise<void> {
    // Prepare move data for new API
    const turnAction: TurnAction = {
      type: 'discard_card',
      player_team: this.getCurrentPlayer(),
      card_id: card.card_id || 'unknown',
      character_id: `player_char_${this.getCurrentPlayer()}`
    };

    console.log('🗑️ Discarding card...', turnAction);
    
    // Call the API (will use mock data if configured)
    const moveResponse = await battleApi.playAction(this.battleId, turnAction);
    
    if (!moveResponse.success) {
      console.error('❌ Failed to discard card:', moveResponse.message);
      throw new Error('Failed to discard card');
    }

    // Process API response format
    await this.processCardBattleApiResponse(moveResponse);
    
    // Refresh battle state
    await this.refreshBattleState();
    
    console.log('✅ Card discarded successfully');
  }

  private cleanupDrag(removeCard: boolean = false): void {
    if (this.dragTarget) {
      // Always remove the dragged card from its parent to prevent duplicates
      if (this.dragTarget.parent) {
        this.dragTarget.parent.removeChild(this.dragTarget);
      }
      if (removeCard) {
        // Destroy the card if it was played/discarded
        this.dragTarget.destroy();
      }
    }

    this.dragTarget = null;
    this.isDragging = false;

    // Remove event listeners
    app.stage.off('pointermove', this.onDragMove, this);
    app.stage.off('pointerup', this.onDragEnd, this);
    app.stage.off('pointerupoutside', this.onDragEnd, this);
  }

  private async endTurn(): Promise<void> {
    console.log('🎯 Ending player turn...');
    
    const turnAction: TurnAction = {
      type: 'end_turn',
      player_team: this.getCurrentPlayer(),
      character_id: `player_char_${this.getCurrentPlayer()}`
    };

    const turnResponse = await battleApi.playAction(this.battleId, turnAction);
    
    if (!turnResponse.success) {
      console.error('❌ Failed to end turn:', turnResponse.message);
      throw new Error('Failed to end turn');
    }

    console.log('📥 Processing turn end response:', turnResponse);
    
    // Process API response format
    await this.processCardBattleApiResponse(turnResponse);
    
    // Show turn ending message
    await this.showTurnMessage('Turn Ending...');
    
    // Refresh battle state
    await this.refreshBattleState();
    
    // Check for battle end conditions
    if (this.checkBattleEnd()) {
      return;
    }
    
    // When player ends turn, go to AI turn
    await this.handleAITurn();
    
    // Check for battle end conditions after AI turn
    if (this.checkBattleEnd()) {
      return;
    }
    
    // Start next player turn
    await this.startPlayerTurn();
  }

  private checkBattleEnd(): boolean {
    if (!this.battleState) return false;

    // Check if all characters of each player are defeated using fixed variables
    const player1Characters = this.getPlayerCharacters(1);
    const player2Characters = this.getPlayerCharacters(2);
    const player1Alive = player1Characters.some(char => char.current_hp > 0);
    const player2Alive = player2Characters.some(char => char.current_hp > 0);
    
    if (!player1Alive) {
      this.showBattleEnd(false);
      return true;
    }
    
    if (!player2Alive) {
      this.showBattleEnd(true);
      return true;
    }
    
    return false;
  }

  private async showBattleEnd(playerWon: boolean): Promise<void> {
    console.log('🎯 Battle ended!', playerWon ? 'Player wins!' : 'Player loses!');
    
   
    // Step 2: Display battle end UI
    const message = playerWon ? 'Victory!' : 'Defeat!';
    const color = playerWon ? Colors.RARITY_LEGENDARY : Colors.ELEMENT_FIRE;
    
    const endContainer = new Container();
    
    const bg = new Graphics()
      .roundRect(0, 0, 400, 200, 20)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.95 })
      .stroke({ width: 3, color });
    
    const titleText = new Text({
      text: message,
      style: {
        fontFamily: 'Kalam',
        fontSize: 36,
        fontWeight: 'bold',
        fill: color
      }
    });
    titleText.anchor.set(0.5);
    titleText.x = 200;
    titleText.y = 60;
       
    const continueButton = this.createButton(
      'Continue',
      150,
      150,
      100,
      30,
      () => {
        //navigation.showScreen(this.stageInfo ? StageScene : HomeScene);
      }
    );
    
    endContainer.addChild(bg, titleText, continueButton);
    endContainer.x = (this.gameWidth - 400) / 2;
    endContainer.y = (this.gameHeight - 200) / 2;
    endContainer.alpha = 0;
    
    this.container.addChild(endContainer);
    
    // Fade in
    const fadeIn = { alpha: 0 };
    return new Promise(resolve => {
      const animate = () => {
        fadeIn.alpha += 0.03;
        endContainer.alpha = fadeIn.alpha;
        
        if (fadeIn.alpha >= 1) {
          endContainer.alpha = 1;
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
  }

  private async animateDrawCard(cardInDeck: CardInDeck, playerNo: number): Promise<void> {
    // Find the deck position (where the card should fly from)
    const isPlayer1 = playerNo === 1;
    const handCards = this.getPlayerHandCards(playerNo);
    const deckX = this.STANDARD_PADDING + 25; // Center of deck card
    const deckY = 35 + 35; // Y of deck + half height

    // Create a temporary card sprite at the deck position
    const tempCard = this.createHandCard(cardInDeck, deckX, deckY, 60);
    tempCard.alpha = 0.8;
    this.container.addChild(tempCard);

    // Calculate target position in hand
    // After pushing to hand, the card will be at the end
    const handIndex = handCards.length - 1;
    const handCount = handCards.length;
    const padding = this.STANDARD_PADDING;
    const maxVisible = 5;
    let cardSpacing: number;
    let totalWidth: number;
    let startX: number;

    if (handCount <= maxVisible) {
      cardSpacing = 60 + 12;
      totalWidth = 60 + (handCount - 1) * cardSpacing;
      startX = (this.gameWidth - totalWidth) / 2;
    } else {
      cardSpacing = (this.gameWidth - 2 * padding - 60) / (handCount - 1);
      cardSpacing = Math.min(cardSpacing, 60);
      startX = padding;
    }
    const targetX = startX + handIndex * cardSpacing;
    const targetY = isPlayer1
      ? this.player1HandContainer.y + 10
      : this.player2HandContainer.y + 10;

    // Animate the card flying to the hand
    await gsap.to(tempCard, {
      x: targetX,
      y: targetY,
      alpha: 1,
      duration: 0.4,
      ease: 'power2.out'
    });

    // Remove the temp card (the real card will be rendered in refreshUI)
    this.container.removeChild(tempCard);
  }

  private async handleAITurn(): Promise<void> {
    console.log('🎯 AI Turn starting...');
    
    // Show AI turn message
    await this.showTurnMessage('AI Turn');
      
    // AI thinks for a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
          
    // Show what AI is doing
    await this.showTurnMessage(`AI plays`);

    this.refreshUI();
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('🎯 AI Turn ended');
  }

  private refreshUI(): void {
    // Recreate the entire game layout
    this.gameContainer.removeChildren();
    this.dropZones = [];

    // Clear all containers before re-adding content
    this.player1HandContainer.removeChildren();
    this.player2HandContainer.removeChildren();
    this.player1EnergyContainer.removeChildren();
    this.player2EnergyContainer.removeChildren();
    this.battleLogContainer.removeChildren();
    
    // Recreate all areas
    this.createPlayerArea(this.player1Container, 1);
    this.createPlayerArea(this.player2Container, 2);
    this.createEnergyArea(this.player1EnergyContainer, 1);
    this.createEnergyArea(this.player2EnergyContainer, 2);
    this.createHandArea(this.player1HandContainer, 1, true);
    this.createHandArea(this.player2HandContainer, 2, false);
    this.createBattleLog();

    this.gameContainer.addChild(
      this.player2HandContainer,
      this.player2Container,
      this.player2EnergyContainer,
      this.battleLogContainer,
      this.player1EnergyContainer,
      this.player1Container,
      this.player1HandContainer,
      this.effectsContainer
    );

    this.createActionButtons();
  }

  public update(): void {
    // Update animations or game state if needed
  }
}