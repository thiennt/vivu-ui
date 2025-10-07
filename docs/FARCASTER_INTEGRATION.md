# Farcaster SDK Integration Guide

## Overview
This document describes how Farcaster authentication is integrated into the Vivu UI application using the `@farcaster/auth-client` SDK.

## Reference
- Official Documentation: [Sign In With Farcaster (SIWF)](https://docs.farcaster.xyz/developers/siwf/)
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

- **`createChannel(): Promise<AuthChannel>`**
  - Creates a new Farcaster Auth channel
  - Returns channel token, URL for QR code/deep link, and nonce

- **`watchStatus(channelToken: string, timeout?: number, interval?: number): Promise<FarcasterUser>`**
  - Polls the auth channel for completion
  - Returns user data once authentication is complete
  - Throws an error on timeout or authentication failure

- **`authenticate(): Promise<{ channel: AuthChannel; waitForAuth: () => Promise<FarcasterUser> }>`**
  - Main authentication method implementing the SIWF flow
  - Creates a channel and returns channel info plus a function to wait for authentication
  - This is the recommended method for most use cases

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
  bio?: string;
  verifications?: string[];
}

export interface AuthChannel {
  channelToken: string;
  url: string;
  nonce: string;
}
```

## Usage in SignInScene

The SignInScene integrates Farcaster authentication using the full SIWF flow:

```typescript
import { farcasterAuth } from '@/services/farcaster';

// Create auth channel and wait for authentication
const { channel, waitForAuth } = await farcasterAuth.authenticate();

// Display the channel URL as a QR code or link
console.log('Sign in URL:', channel.url);
// Show QR code to user...

// Wait for user to authenticate via their Farcaster wallet
const farcasterUser = await waitForAuth();

// Then call backend API with Farcaster data
const response = await authApi.signIn({
  fid: farcasterUser.fid.toString(),
  username: farcasterUser.username,
  custody_address: farcasterUser.custody_address
});
```

## Implementation Details

The implementation follows the official SIWF flow:

1. **Channel Creation**
   - Creates a Farcaster Auth channel using `createChannel()`
   - Returns a unique URL for the user to authenticate with

2. **QR Code / Deep Link Display**
   - The channel URL is displayed to the user as a QR code or clickable link
   - Users scan the QR code or click the link with their Farcaster wallet app

3. **Status Polling**
   - The app polls the channel status using `watchStatus()`
   - Waits for the user to complete authentication in their wallet

4. **User Data Retrieval**
   - Once authenticated, receives verified user data including:
     - Farcaster ID (fid)
     - Username
     - Display name
     - Profile picture URL
     - Custody address
     - Bio and verifications
   
5. **Backend Integration**
   - Sends the verified Farcaster data to your backend API
   - Backend can optionally verify the signature for additional security

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

1. **QR Code Display**
   - Add a QR code library to generate visual QR codes
   - Display QR code directly in the UI instead of just showing the URL
   - Add copy-to-clipboard functionality for the auth URL

2. **Profile Integration**
   - Display Farcaster profile pictures in-game
   - Show verified badges for authenticated users
   - Link to Farcaster profiles from user cards

3. **Social Features**
   - Find friends via Farcaster
   - Share achievements to Farcaster
   - Invite friends to battles via Farcaster

## Testing

To test Farcaster integration:

1. **Clear session and navigate to sign-in:**
   ```javascript
   sessionStorage.clear()
   window.location.href = '/?signin'
   ```

2. **Click "Sign In with Farcaster" button**
   - This creates a new auth channel
   - A sign-in URL will be logged to the console
   - An alert will show the URL

3. **Authenticate with your Farcaster wallet:**
   - Scan the QR code or open the URL in your Farcaster wallet app
   - Sign the authentication request
   - The app will automatically detect the authentication and complete sign-in

4. **Backend Testing:**
   - Ensure your backend accepts the Farcaster user data
   - The backend should verify the custody address if needed
   - Store user profile and return an authentication token

Note: You need a Farcaster account and wallet app (like Warpcast) to test the full authentication flow.
