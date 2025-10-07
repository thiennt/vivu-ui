# Farcaster Quick Auth Integration Guide

## Overview
This document describes the Farcaster Quick Auth integration for Vivu UI. Quick Auth provides seamless authentication for apps running inside Farcaster clients (like Warpcast), allowing users to sign in with a single click without leaving the app.

## Reference
- Official Documentation: [Quick Auth Documentation](https://miniapps.farcaster.xyz/docs/sdk/quick-auth)
- Package: [@farcaster/frame-sdk](https://www.npmjs.com/package/@farcaster/frame-sdk)

## When to Use Quick Auth vs SIWF

### Quick Auth (Recommended for Mini Apps)
- ✅ User is inside a Farcaster client (Warpcast, etc.)
- ✅ Seamless one-click authentication
- ✅ No QR code scanning needed
- ✅ Instant access to user profile
- ❌ Only works inside Farcaster clients
- ❌ Doesn't provide custody address

### SIWF (For Standalone Web Apps)
- ✅ Works in any browser
- ✅ Provides verified custody address
- ✅ Cryptographic signature verification
- ❌ Requires QR code scanning
- ❌ User needs to switch to wallet app

## Architecture

### FarcasterQuickAuthService (`src/services/farcasterQuickAuth.ts`)

A wrapper service around the Farcaster Frame SDK that provides:

#### Methods

- **`initialize(): Promise<boolean>`**
  - Initializes the Frame SDK
  - Returns `true` if running inside a Farcaster client
  - Must be called before using other methods

- **`isInFarcasterClient(): boolean`**
  - Checks if the app is running inside a Farcaster client
  - Returns `true` if the SDK initialized successfully

- **`getContext(): Promise<QuickAuthContext | null>`**
  - Retrieves the current context from the Farcaster client
  - Includes user information and app location
  - Returns `null` if not in a Farcaster client

- **`authenticate(): Promise<QuickAuthUser | null>`**
  - Main authentication method
  - Returns user information if authenticated
  - Returns `null` if not in Farcaster client or not authenticated

- **`openUrl(url: string): Promise<void>`**
  - Opens a URL in the Farcaster client
  - Falls back to `window.open` if not in client

- **`close(): Promise<void>`**
  - Closes the mini app within the Farcaster client

#### Types

```typescript
export interface QuickAuthUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
}

export interface QuickAuthContext {
  user: QuickAuthUser;
  location?: {
    type: string;
    context?: any;
  };
}
```

## Implementation

### QuickAuthSignInScene (`src/scenes/QuickAuthSignInScene.ts`)

The new sign-in screen provides adaptive authentication:

**When inside Farcaster client:**
- Shows Quick Auth as primary method (one-click sign in)
- Shows SIWF as alternative method (for manual authentication)

**When outside Farcaster client:**
- Shows SIWF as primary method (QR code flow)
- Quick Auth option is hidden

### Authentication Flow

#### Quick Auth Flow (Inside Farcaster Client)

```typescript
// Initialize SDK
await farcasterQuickAuth.initialize();

// Authenticate (gets user from client context)
const user = await farcasterQuickAuth.authenticate();

// User data includes:
// - fid: Farcaster ID
// - username: Username
// - displayName: Display name
// - pfpUrl: Profile picture URL
// - bio: User bio

// Send to backend
const response = await authApi.signIn({
  fid: user.fid.toString(),
  username: user.username || `user${user.fid}`,
});
```

#### SIWF Fallback Flow

When Quick Auth is not available or user prefers QR code method, the SIWF flow is used (same as before).

## Usage in App

The app automatically detects the environment and shows the appropriate authentication method:

```typescript
// In app.ts
if (!isAuthenticated) {
  // Shows QuickAuthSignInScene which adapts based on environment
  await navigation.showScreen(QuickAuthSignInScene);
}
```

## URL Parameters

- `?signin` - Force show QuickAuth sign-in screen
- `?oldauth` - Force show original SIWF-only screen (for testing)

## Testing

### Test Quick Auth (Requires Farcaster Client)

1. Deploy your app as a Farcaster Frame/Mini App
2. Open the app in Warpcast or another Farcaster client
3. Click "Sign In Instantly" button
4. User is authenticated immediately

### Test SIWF Fallback

```bash
# Clear session
sessionStorage.clear()

# Navigate to sign-in
window.location.href = '/?signin'

# If not in Farcaster client, shows QR code method
# If in Farcaster client, shows both methods
```

## Configuration

### Frame SDK Configuration

The Frame SDK is initialized automatically when the app loads. No additional configuration is needed.

### Environment Detection

The service automatically detects if the app is running inside a Farcaster client:

```typescript
const isInClient = await farcasterQuickAuth.initialize();
if (isInClient) {
  // Show Quick Auth option
} else {
  // Show only SIWF
}
```

## Error Handling

The service handles errors gracefully:
- If SDK initialization fails, `initialize()` returns `false`
- If authentication fails, returns `null` and user can try SIWF
- UI shows helpful error messages
- Fallback to SIWF is always available

## Comparison: Quick Auth vs SIWF

| Feature | Quick Auth | SIWF |
|---------|-----------|------|
| Environment | Farcaster clients only | Any browser |
| User Experience | One-click, instant | QR code scanning |
| Setup Required | None (auto-detected) | None |
| Custody Address | ❌ Not provided | ✅ Provided |
| Signature | ❌ Not provided | ✅ Provided |
| User Data | ✅ Profile info | ✅ Profile info + custody |
| Speed | ⚡ Instant | 🐌 Requires scanning |

## Security Considerations

### Quick Auth
- User is already authenticated in their Farcaster client
- No signature verification needed
- Relies on the Farcaster client's security
- Backend should trust the FID from the client

### SIWF
- Cryptographic signature verification
- Custody address is verified
- Backend can verify signature independently
- More secure for critical operations

## Best Practices

1. **Always provide SIWF as fallback**: Not all users will be in a Farcaster client
2. **Detect environment early**: Initialize Quick Auth during app startup
3. **Show appropriate UI**: Adapt UI based on available authentication methods
4. **Handle errors gracefully**: Quick Auth may fail, always have fallback
5. **Consider security needs**: Use SIWF for operations requiring verified custody address

## Future Enhancements

1. **Profile Display**
   - Show user profile picture from Quick Auth
   - Display username and FID in UI

2. **Enhanced Integration**
   - Use Frame SDK actions for sharing
   - Integrate with Farcaster social features

3. **Better UX**
   - Smoother transitions between auth methods
   - Better visual indicators for which method is available

## Migration from SIWF-only

The original SIWF implementation is preserved in `SignInScene.ts` and can be accessed via `?oldauth` URL parameter. The new `QuickAuthSignInScene` provides both methods and should be used as the default.

To switch back to SIWF-only:

```typescript
// In app.ts, change:
await navigation.showScreen(QuickAuthSignInScene);
// To:
await navigation.showScreen(SignInScene);
```
