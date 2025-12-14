# Camera & Microphone Permissions Modal

A beautiful, responsive modal component for requesting camera and microphone permissions before users go live.

## Features

✨ **Modern Design**
- Dark theme with glassmorphic effects
- Smooth animations and transitions
- Pulsing logo animation
- Responsive for both mobile and desktop

🎯 **User Experience**
- Clear visual feedback when permissions are granted
- Loading states during permission requests
- Optional skip functionality
- Auto-completion when both permissions are granted

📱 **Responsive**
- Full-screen on mobile devices
- Centered modal on desktop
- Adaptive button sizes and spacing

## Components

### 1. `CameraPermissionsModal.tsx`
The main modal component that handles the UI and permissions logic.

### 2. `CameraPermissionsProvider.tsx`
Context provider that makes the modal available throughout the app.

## Installation

The component is already integrated into your app! It's wrapped in the root layout at `/app/layout.tsx`.

## Usage

### Basic Usage (Sidebar Integration)

The modal is already integrated into the sidebar. When users click "Go Live" with a connected wallet, the permissions modal will appear.

```tsx
// In sidebar.tsx
const { openPermissionsModal } = useCameraPermissions();

const handleGoLiveClick = () => {
  if (isReady) {
    openPermissionsModal();
  } else {
    openModal();
  }
};
```

### Custom Usage

You can trigger the modal from any component:

```tsx
"use client";

import { useCameraPermissions } from "@/components/providers/CameraPermissionsProvider";

export default function YourComponent() {
  const { openPermissionsModal } = useCameraPermissions();

  return (
    <button onClick={openPermissionsModal}>
      Request Permissions
    </button>
  );
}
```

### With Callback Handler

To handle the permissions result in your root layout:

```tsx
<CameraPermissionsProvider
  onPermissionsGranted={(stream, permissions) => {
    console.log("Camera enabled:", permissions.camera);
    console.log("Microphone enabled:", permissions.microphone);
    console.log("Media stream:", stream);
    
    // Do something with the stream
    // For example, attach to a video element
  }}
>
  {children}
</CameraPermissionsProvider>
```

## Testing

Visit `/demo-permissions` to see the modal in action and test the permissions flow.

## Permissions States

The modal handles three states for each permission:

1. **Not Requested** - Initial state, white button
2. **Requesting** - Loading state with "Requesting Access..." text
3. **Granted** - Green background with checkmark icon

## Browser Permissions

The modal uses the native browser `getUserMedia` API:

```javascript
// Request microphone
await navigator.mediaDevices.getUserMedia({ audio: true });

// Request camera
await navigator.mediaDevices.getUserMedia({ video: true });
```

### Handling Denied Permissions

If users deny permissions, an alert will prompt them to enable it in browser settings. You can customize this behavior in `CameraPermissionsModal.tsx`:

```tsx
catch (error) {
  console.error("Camera permission denied:", error);
  // Add your custom error handling here
  alert("Camera access denied. Please enable it in your browser settings.");
}
```

## Customization

### Styling

The modal uses Tailwind CSS classes. Key styling points:

- Background: `bg-[#0A0A0A]` - Pure black with slight lightening
- Border: `border-white/5` - Subtle white border
- Buttons: White by default, green when granted
- Logo animation: `animate-pulse-slow` (3s cycle)

### Animation

The logo pulse animation is defined in `globals.css`:

```css
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.05);
  }
}
```

### Text Content

You can modify the text in `CameraPermissionsModal.tsx`:

```tsx
<h2>Camera &amp; Mic Permissions</h2>
<p>Just a few things before you stream.</p>
```

## API Reference

### `useCameraPermissions` Hook

```tsx
const {
  openPermissionsModal,  // Function to open the modal
  closePermissionsModal, // Function to close the modal
  isOpen                 // Boolean indicating if modal is open
} = useCameraPermissions();
```

### Modal Props

```tsx
interface CameraPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted: (
    stream: MediaStream | null,
    permissions: { camera: boolean; microphone: boolean }
  ) => void;
}
```

## File Structure

```
/components
  ├── CameraPermissionsModal.tsx        # Main modal component
  └── /providers
      └── CameraPermissionsProvider.tsx  # Context provider

/app
  ├── layout.tsx                         # Provider integration
  ├── globals.css                        # Custom animations
  └── /demo-permissions
      └── page.tsx                       # Demo page
```

## Notes

- The modal automatically closes when both permissions are granted (600ms delay for UX)
- Media streams are properly cleaned up on unmount to prevent memory leaks
- The component is fully typed with TypeScript
- Icons from `react-icons/hi` (Heroicons)

## Future Enhancements

Potential improvements you could add:

- [ ] Remember user's permission choices in localStorage
- [ ] Add audio/video preview before going live
- [ ] Custom error messages for different permission denial scenarios
- [ ] Support for screen sharing permissions
- [ ] Animated success state transition
