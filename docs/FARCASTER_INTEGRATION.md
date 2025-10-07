# Farcaster SDK Integration Guide

## Overview
This document describes how Farcaster authentication is integrated into the Vivu UI application using the `@farcaster/auth-client` SDK.

## Reference
- GitHub Discussion: [@farcasterxyz/protocol/discussions/110](https://github.com/farcasterxyz/protocol/discussions/110)
- Package: [@farcaster/auth-client](https://www.npmjs.com/package/@farcaster/auth-client)

## Installation

The Farcaster Auth Client SDK is included as a dependency:

```bash
npm install @farcaster/auth-client
```

## Architecture

### FarcasterAuthService (`src/services/farcaster.ts`)

A wrapper service around the Farcaster Auth Client SDK that provides:

#### Methods

- **`isAvailable(): boolean`**
  - Checks if Farcaster authentication is available
  - Returns `true` if the SDK initialized successfully

- **`authenticate(fid: string, username: string): Promise<FarcasterUser>`**
  - Authenticates a user with their Farcaster credentials
  - Returns a `FarcasterUser` object with user details
  - In production, this would handle the full Farcaster sign-in flow

- **`signOut(): Promise<void>`**
  - Signs out the current user
  - Clears authentication tokens from session storage

- **`getCurrentUser(): FarcasterUser | null`**
  - Retrieves the currently authenticated user from session storage
  - Returns `null` if no user is authenticated

#### Types

```typescript
export interface FarcasterUser {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  custody_address?: string;
}
```

## Usage in SignInScene

The SignInScene integrates Farcaster authentication as follows:

```typescript
import { farcasterAuth } from '@/services/farcaster';

// During sign-in:
const farcasterUser = await farcasterAuth.authenticate(
  farcasterIdInput,
  usernameInput
);

// Then call backend API with Farcaster data
const response = await authApi.signIn({
  fid: farcasterIdInput,
  username: usernameInput,
  custody_address: farcasterUser.custody_address
});
```

## Production Implementation

The current implementation includes a simplified authentication flow for development. For production, you would need to:

1. **Backend Channel Setup**
   - Set up a backend service to handle Farcaster authentication
   - Implement the sign-in channel as described in the Farcaster protocol

2. **QR Code / Deep Link**
   - Generate a sign-in request using the Farcaster Auth Client
   - Display a QR code or deep link for users to sign with their Farcaster wallet

3. **Signature Verification**
   - Poll for the signature from the Farcaster network
   - Verify the signature on your backend
   - Create an authenticated session

4. **User Data Retrieval**
   - Fetch user profile data from Farcaster
   - Store relevant information in your database

## Configuration

The FarcasterAuthService accepts configuration options:

```typescript
export interface FarcasterAuthConfig {
  domain?: string;        // Defaults to window.location.hostname
  siweUri?: string;       // Defaults to window.location.origin
  rpcUrl?: string;        // Defaults to Optimism mainnet RPC
}
```

## Session Management

Authenticated users are stored in `sessionStorage`:

- `authToken` - JWT authentication token
- `player` - Full player object as JSON
- `playerId` - Player ID for quick access

## Error Handling

The service handles errors gracefully:
- If SDK initialization fails, `isAvailable()` returns `false`
- Authentication errors are caught and logged
- The UI displays error messages to the user via `LoadingStateManager`

## Future Enhancements

1. **Full Farcaster Auth Flow**
   - Implement complete sign-in with QR code
   - Add real-time signature polling
   - Integrate with Farcaster network for user data

2. **Profile Integration**
   - Display Farcaster profile pictures
   - Show verified badges
   - Link to Farcaster profiles

3. **Social Features**
   - Find friends via Farcaster
   - Share achievements to Farcaster
   - Invite friends to battles

## Testing

To test Farcaster integration:

```bash
# Clear session
sessionStorage.clear()

# Navigate to sign-in
window.location.href = '/?signin'

# Enter test credentials
# FID: player_fc_001
# Username: PlayerOne

# Click Sign In
```

The system will authenticate via the Farcaster service and create a session.
