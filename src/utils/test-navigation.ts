// Simple test to verify Characters scene navigation
import { navigation } from '../src/utils/navigation';
import { CharactersScene } from '../src/scenes/CharactersScene';

// This would be used in a proper test environment
// For now, we'll just export the test function for manual verification
export async function testCharactersSceneNavigation() {
  try {
    // Navigate to Characters scene
    await navigation.showScreen(CharactersScene);
    console.log('✅ Characters scene navigation successful');
    return true;
  } catch (error) {
    console.error('❌ Characters scene navigation failed:', error);
    return false;
  }
}

// Export for potential future test runner usage
export { testCharactersSceneNavigation as default };