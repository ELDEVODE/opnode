# Wallet Modal Refactoring

## Overview

The wallet connection modal has been refactored into separate components with Zustand for state management.

## Structure

### Modal Components (`/components/modals/`)

1. **WalletConnectModal.tsx** - Initial wallet connection screen
   - Shows options to create new wallet or restore existing
   - Displays connection status and errors

2. **WalletSuccessModal.tsx** - Wallet connection success screen
   - Confirms successful wallet connection
   - Button to proceed to profile creation

3. **ChooseUsernameModal.tsx** - Username selection screen
   - Input for username with real-time validation
   - Shows availability status
   - Continue button (disabled until username is available)

4. **CreatingProfileModal.tsx** - Profile creation loading screen
   - Shows animated profile picture with spinning border
   - Displays informational content while processing

5. **AddressCreatedModal.tsx** - Success screen after profile creation
   - Shows profile with success checkmark
   - Displays username and lightning address
   - Final continue button

### State Management (`/stores/walletModalStore.ts`)

Uses Zustand for managing:

- Modal open/close state
- Current step in the flow
- Username and validation status
- Actions for state updates

### Main Component (`/components/ConnectWalletModal.tsx`)

Orchestrates the modal flow:

- Manages wallet connection logic
- Handles step transitions
- Renders appropriate modal component based on current step

## Flow

1. **Connect** → User selects wallet option
2. **Success** → Wallet connected successfully
3. **Username** → User chooses username
4. **Creating** → Profile creation in progress
5. **Address Created** → Success confirmation

## Usage

```tsx
import { useWalletModal } from "@/components/providers/WalletModalProvider";

function Component() {
  const { openModal } = useWalletModal();

  return <button onClick={openModal}>Connect Wallet</button>;
}
```

## Benefits

- **Modularity**: Each modal step is a separate component
- **Maintainability**: Easier to update individual screens
- **Testability**: Components can be tested in isolation
- **State Management**: Centralized state with Zustand
- **Type Safety**: Full TypeScript support
