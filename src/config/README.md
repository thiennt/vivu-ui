# Mock Data Configuration

This directory contains the global configuration system for the vivu-ui application.

## useMockData Flag

The `useMockData` flag controls whether the application uses mock data or attempts real API calls:

- **`true` (default)**: Uses mock data only, no API calls are made
- **`false`**: Uses real API calls only, no mock data fallback

## Usage

```typescript
import { config, updateConfig } from '@/config';

// Check current setting
console.log(config.useMockData); // true by default

// Switch to real API mode
updateConfig({ useMockData: false });

// Switch back to mock data mode
updateConfig({ useMockData: true });
```

## Benefits

### Clean Implementation
- **CardBattleScene**: No longer has try/catch fallback logic
- **API Layer**: Single point of control for mock vs real data
- **Consistent Behavior**: Either mock-only or real-only, no mixed states

### Easy Development
- **Default Mock Mode**: Developers can work without backend setup
- **Easy Toggle**: Switch to real API mode when backend is available
- **Runtime Control**: Can be changed programmatically for testing

### Production Ready
- **Environment-based**: Can be configured based on deployment environment
- **No Fallback Confusion**: Clear separation between development and production modes

## Implementation Details

The configuration is used by:
1. **API Layer** (`src/services/api.ts`): Checks `config.useMockData` in `apiRequest` function
2. **All Scenes**: Use `isLikelyUsingMockData()` which now checks the configuration
3. **CardBattleScene**: Cleaned up, no longer handles mock fallbacks directly

## Migration from Old System

Before: Mixed logic with try/catch fallbacks
```typescript
try {
  const response = await api.call();
  // use response
} catch (error) {
  // fallback to mock data
  const mockResponse = mockData;
}
```

After: Clean configuration-based approach
```typescript
// API layer handles mock vs real based on configuration
const response = await api.call(); // Returns mock or real data based on config
```