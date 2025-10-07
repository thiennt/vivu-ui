# Farcaster Sign-In Feature

## Overview
This document describes the Farcaster authentication implementation in the Vivu UI application.

## Components

### SignInScene (`src/scenes/SignInScene.ts`)
The sign-in screen displays a form for users to authenticate with their Farcaster credentials:
- Farcaster ID input field
- Username input field
- Sign In button

### Auth API (`src/services/api.ts`)
New `authApi` service with the following method:
- `signIn(farcasterData)` - POST to `/auth/signin` endpoint with Farcaster credentials

## Authentication Flow

1. **App Initialization** (`src/app.ts`)
   - Checks for `authToken` in sessionStorage
   - If no token exists, displays SignInScene
   - If token exists, displays HomeScene

2. **Sign-In Process**
   - User enters Farcaster ID and username
   - Clicks "Sign In" button
   - API request to POST `/auth/signin` with:
     ```json
     {
       "fid": "player_fc_001",
       "username": "PlayerOne"
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
3. Or simply reload the app without auth token

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
