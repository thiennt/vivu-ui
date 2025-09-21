/**
 * Test script to verify that API calls return mock data when API fails
 * This script will test the main API functions that CardBattleScene uses
 */

// Import API methods
import { battleApi } from './src/services/api.js';

// Mock a network error by setting invalid API base URL
const originalFetch = global.fetch;
global.fetch = () => Promise.reject(new Error('Network error'));

async function testMockFallbacks() {
  console.log('🧪 Testing API mock fallbacks...\n');

  try {
    // Test getBattleState
    console.log('Testing getBattleState...');
    const battleState = await battleApi.getBattleState('test_battle_id');
    console.log('✅ getBattleState returned mock data:', {
      id: battleState.id,
      battle_type: battleState.battle_type,
      status: battleState.status,
      player1_characters: battleState.player1.characters.length,
      player2_characters: battleState.player2.characters.length,
      player1_hand_cards: battleState.player1.deck.hand_cards.length,
      current_energy: battleState.player1.deck.current_energy
    });

    // Test getBattleRewards
    console.log('\nTesting getBattleRewards...');
    const rewards = await battleApi.getBattleRewards('test_battle_id');
    console.log('✅ getBattleRewards returned mock data:', rewards);

    // Test createBattleStage
    console.log('\nTesting createBattleStage...');
    const stageResponse = await battleApi.createBattleStage('test_stage_id');
    console.log('✅ createBattleStage returned mock data:', stageResponse);

    // Test startBattle
    console.log('\nTesting startBattle...');
    const startResult = await battleApi.startBattle('test_battle_id');
    console.log('✅ startBattle completed (no error thrown)');

    // Test playAction
    console.log('\nTesting playAction...');
    const moveData = {
      action: 'play_card',
      card_id: 'test_card',
      character_id: 'test_char',
      target_ids: ['target_1']
    };
    const moveResponse = await battleApi.playAction('test_battle_id', moveData);
    console.log('✅ playAction returned mock data:', {
      success: moveResponse.success,
      damage_dealt: moveResponse.result.damage_dealt,
      actions_count: moveResponse.result.actions_performed.length
    });

    console.log('\n🎉 All API fallbacks working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMockFallbacks();