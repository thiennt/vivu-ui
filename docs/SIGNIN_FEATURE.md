# Farcaster Sign-In Feature

## Overview
This document describes the Farcaster authentication implementation in the Vivu UI application.

## Components

### SignInScene (`src/scenes/SignInScene.ts`)
The sign-in screen implements the Sign In With Farcaster (SIWF) flow:
- Sign In with Farcaster button
- QR code placeholder for authentication URL
- Integrates with Farcaster Auth Client SDK
- Displays authentication channel URL for users to scan with their wallet

### Farcaster Service (`src/services/farcaster.ts`)
`FarcasterAuthService` that wraps the `@farcaster/auth-client` SDK:
- `authenticate()` - Creates an auth channel and returns functions to wait for authentication
- `createChannel()` - Creates a new Farcaster Auth relay channel
- `watchStatus(channelToken)` - Polls for authentication completion
- `isAvailable()` - Checks if Farcaster authentication is available
- `signOut()` - Signs out the current user
- `getCurrentUser()` - Gets the current authenticated user from session storage

### Auth API (`src/services/api.ts`)
New `authApi` service with the following method:
- `signIn(farcasterData)` - POST to `/auth/signin` endpoint with Farcaster credentials

## Authentication Flow

1. **App Initialization** (`src/app.ts`)
   - Checks for `authToken` in sessionStorage
   - If no token exists, displays SignInScene
   - If token exists, displays HomeScene

2. **Sign-In Process**
   - User clicks "Sign In with Farcaster" button
   - System creates a Farcaster Auth channel via `farcasterAuth.authenticate()`
   - Authentication URL is displayed (as QR code and/or link)
   - User scans QR code or opens URL in their Farcaster wallet app
   - System polls for authentication completion
   - Once authenticated, receives verified user data from Farcaster
   - API request to POST `/auth/signin` with verified Farcaster data:
     ```json
     {
       "fid": "123456",
       "username": "alice",
       "custody_address": "0x..." (verified custody address)
     }
     ```
   
3. **Success Response**
   - API returns:
     ```json
     {
       "success": true,
       "data": {
         "token": "jwt_token_here",
         "player": { ... }
       }
     }
     ```
   - Token and player data stored in sessionStorage
   - Navigation to HomeScene

4. **HomeScene** (`src/scenes/HomeScene.ts`)
   - Loads player data from sessionStorage
   - Falls back to API call if not in storage

## Session Storage Keys
- `authToken` - JWT authentication token
- `player` - Full player object as JSON string
- `playerId` - Player ID for quick access

## Configuration
Mock data mode can be enabled/disabled in `src/config/index.ts`:
```typescript
const defaultConfig: AppConfig = {
  useMockData: true, // Set to false for production
  apiBaseUrl: 'https://api.vivu.game'
};
```

## Testing
To test the sign-in flow:
1. Clear sessionStorage: `sessionStorage.clear()`
2. Navigate to `/?signin` to force sign-in screen
3. Click "Sign In with Farcaster" button
4. An authentication URL will be displayed in console and alert
5. Open the URL in your Farcaster wallet app (e.g., Warpcast)
6. Sign the authentication request in your wallet
7. The app will automatically complete sign-in once authentication is detected

**Note:** You need a Farcaster account and wallet app to test the full flow.

## API Endpoint
**POST** `/auth/signin`

**Request Body:**
```json
{
  "fid": "string",
  "username": "string",
  "custody_address": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Sign in successful",
  "data": {
    "token": "jwt_token",
    "player": {
      "id": "uuid",
      "username": "string",
      "farcaster_id": "string",
      ...
    }
  }
}
```
