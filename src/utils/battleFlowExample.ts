/**
 * Backend Integration Example for vivu-api
 * 
 * This file demonstrates how the Card Battle flow integrates with the vivu-api backend.
 * It shows the key integration points and API calls made during a typical battle.
 */

import { battleApi } from '../services/api';
import { BattleMoveData, BattleEndData } from '../types';

/**
 * Example of a complete battle flow with backend integration
 */
export class BattleFlowExample {
  private battleId: string | null = null;

  /**
   * Step 1: Create a new battle with the backend
   */
  async createBattle() {
    console.log('🔥 Creating battle with backend...');
    
    const battleData = {
      stageId: 'dungeon_1_stage_1',
      playerDeck: ['fire_bolt', 'healing_potion', 'shield_bash'],
      timestamp: Date.now()
    };

    try {
      // Note: createBattle method doesn't exist in the new API spec
      // For demo purposes, we'll use createBattleStage instead
      const response = await battleApi.createBattleStage('stage_001');
      if (response.success && response.data) {
        this.battleId = response.data.battle_id;
        console.log('✅ Battle created:', response);
        return response.data;
      } else {
        console.error('❌ Failed to create battle:', response.message);
        throw new Error(response.message || 'Failed to create battle');
      }
    } catch (error) {
      console.error('❌ Failed to create battle:', error);
      throw error;
    }
  }

  /**
   * Step 2: Play a card and sync with backend
   */
  async playCard(cardId: string, targetCharacterIndex: number) {
    if (!this.battleId) throw new Error('No active battle');

    console.log('🃏 Playing card with backend sync...');
    
    const moveData: BattleMoveData = {
      card_id: cardId,
      target_ids: [`character_${targetCharacterIndex}`],
      action: 'play_card'
    };

    try {
      const response = await battleApi.playAction(this.battleId, moveData);
      console.log('✅ Card played successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to play card:', error);
      throw error;
    }
  }

  /**
   * Step 3: End turn and sync with backend
   */
  async endTurn() {
    if (!this.battleId) throw new Error('No active battle');

    console.log('⏭️ Ending turn with backend sync...');
    
    try {
      const response = await battleApi.endTurn(this.battleId);
      console.log('✅ Turn ended successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to end turn:', error);
      throw error;
    }
  }

  /**
   * Step 4: End battle and collect rewards
   */
  async endBattle(playerWon: boolean) {
    if (!this.battleId) throw new Error('No active battle');

    console.log('🏁 Ending battle and collecting rewards...');
    
    const battleEndData: BattleEndData = {
      winner: playerWon ? 1 : 2,
      reason: 'defeat',
      finalState: {} as any // In real implementation, this would be the actual battle state
    };

    try {
      const response = await battleApi.endBattle(this.battleId, battleEndData);
      console.log('✅ Battle ended with rewards:', response);
      
      // Optionally fetch detailed rewards
      if (response.rewards) {
        console.log('🎁 Rewards received:', response.rewards);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Failed to end battle:', error);
      throw error;
    }
  }

  /**
   * Complete battle flow example
   */
  async runCompleteBattleFlow() {
    try {
      console.log('🚀 Starting complete battle flow...\n');
      
      // 1. Create battle
      await this.createBattle();
      
      // 2. Play some cards
      await this.playCard('fire_bolt', 0);
      await this.playCard('healing_potion', 0);
      
      // 3. End turn
      await this.endTurn();
      
      // 4. End battle (player wins)
      await this.endBattle(true);
      
      console.log('\n🎉 Complete battle flow finished successfully!');
      
    } catch (error) {
      console.error('\n❌ Battle flow failed:', error);
    }
  }
}

/**
 * Usage example:
 * 
 * const battleFlow = new BattleFlowExample();
 * await battleFlow.runCompleteBattleFlow();
 */