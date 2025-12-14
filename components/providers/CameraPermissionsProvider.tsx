"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import CameraPermissionsModal from "@/components/CameraPermissionsModal";
import { usePrepStream } from "@/components/providers/PrepStreamProvider";

interface CameraPermissionsContextType {
  openPermissionsModal: () => void;
  closePermissionsModal: () => void;
  isOpen: boolean;
}

const CameraPermissionsContext = createContext<
  CameraPermissionsContextType | undefined
>(undefined);

export function useCameraPermissions() {
  const context = useContext(CameraPermissionsContext);
  if (!context) {
    throw new Error(
      "useCameraPermissions must be used within CameraPermissionsProvider"
    );
  }
  return context;
}

interface CameraPermissionsProviderProps {
  children: ReactNode;
  onPermissionsGranted?: (
    stream: MediaStream | null,
    permissions: { camera: boolean; microphone: boolean }
  ) => void;
}

export function CameraPermissionsProvider({
  children,
  onPermissionsGranted,
}: CameraPermissionsProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { openPrepModal } = usePrepStream();

  // Check if permissions are already granted
  const checkExistingPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Permissions are granted, return the stream
      return {
        granted: true,
        stream,
        permissions: { camera: true, microphone: true },
      };
    } catch (error) {
      // Permissions not granted or denied
      return {
        granted: false,
        stream: null,
        permissions: { camera: false, microphone: false },
      };
    }
  };

  const openPermissionsModal = async () => {
    // Check if permissions already exist
    const result = await checkExistingPermissions();

    if (result.granted) {
      // Skip modal and proceed directly to prep modal
      handlePermissionsGranted(result.stream, result.permissions);
    } else {
      // Show permissions modal
      setIsOpen(true);
    }
  };

  const closePermissionsModal = () => setIsOpen(false);

  const handlePermissionsGranted = (
    stream: MediaStream | null,
    permissions: { camera: boolean; microphone: boolean }
  ) => {
    if (onPermissionsGranted) {
      onPermissionsGranted(stream, permissions);
    }
    // Open the prep stream modal after permissions are granted
    openPrepModal();
  };

  return (
    <CameraPermissionsContext.Provider
      value={{
        openPermissionsModal,
        closePermissionsModal,
        isOpen,
      }}
    >
      {children}
      <CameraPermissionsModal
        isOpen={isOpen}
        onClose={closePermissionsModal}
        onPermissionsGranted={handlePermissionsGranted}
      />
    </CameraPermissionsContext.Provider>
  );
}
