# SOS Security Mobile

Expo React Native TypeScript client scaffold for SOS Security.

## Prerequisites

- Node.js 20+
- npm 10+
- Expo Go app (or Android/iOS simulator)

## Run

1. Copy environment template:
   - `cp .env.example .env`
2. Install dependencies:
   - `npm install`
3. Start Expo:
   - `npm run start`

## Notes

- API base URL and socket URL are read from `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_WS_URL`.
- Navigation uses React Navigation stacks (no expo-router).
- State is handled with Zustand; network data with React Query.
