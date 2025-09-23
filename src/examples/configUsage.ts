/**
 * Example of how to use the useMockData configuration
 * 
 * This shows how developers can toggle between mock and real API data
 */

import { config, updateConfig } from '@/config';
import { battleApi } from '@/services/api';

// Example 1: Check current configuration
console.log('Current mock data setting:', config.useMockData);

// Example 2: Use mock data (default behavior)
updateConfig({ useMockData: true });
console.log('Now using mock data');

// Example 3: Switch to real API calls
updateConfig({ useMockData: false });
console.log('Now using real API calls');

// Example 4: In a real scenario, you might want to configure this based on environment
const isProduction = false; // Simplified for demo
const hasApiKey = false; // Simplified for demo

updateConfig({ 
  useMockData: !isProduction || !hasApiKey 
});

// Example 5: Configuration can be changed at runtime for testing
export async function testWithMockData() {
  // Temporarily use mock data
  const originalSetting = config.useMockData;
  updateConfig({ useMockData: true });
  
  try {
    // Now all API calls will use mock data
    const battleState = await battleApi.getBattleState('test_battle');
    console.log('Mock battle state:', battleState);
  } finally {
    // Restore original setting
    updateConfig({ useMockData: originalSetting });
  }
}

export async function testWithRealAPI() {
  // Temporarily use real API
  const originalSetting = config.useMockData;
  updateConfig({ useMockData: false });
  
  try {
    // Now all API calls will attempt real API calls
    const battleState = await battleApi.getBattleState('test_battle');
    console.log('Real API battle state:', battleState);
  } catch (error) {
    console.log('Real API failed (expected if no backend):', error);
  } finally {
    // Restore original setting
    updateConfig({ useMockData: originalSetting });
  }
}