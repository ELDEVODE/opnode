"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import PrepStreamModal from "@/components/PrepStreamModal";
import ChooseSetupModal from "@/components/ChooseSetupModal";

interface StreamMetadata {
  title: string;
  tags: string[];
  isPrivate: boolean;
  thumbnailUrl: string | null;
  thumbnailStorageId?: string;
  setupType?: "browser" | "obs";
}

interface PrepStreamContextType {
  openPrepModal: () => void;
  closePrepModal: () => void;
  isOpen: boolean;
  streamMetadata: StreamMetadata | null;
  clearStreamMetadata: () => void;
}

const PrepStreamContext = createContext<PrepStreamContextType | undefined>(
  undefined
);

export function usePrepStream() {
  const context = useContext(PrepStreamContext);
  if (!context) {
    throw new Error("usePrepStream must be used within PrepStreamProvider");
  }
  return context;
}

interface PrepStreamProviderProps {
  children: ReactNode;
  onStreamReady?: (data: {
    title: string;
    tags: string[];
    isPrivate: boolean;
    thumbnailUrl: string | null;
    thumbnailStorageId?: string;
    setupType: "browser" | "obs";
  }) => void;
}

export function PrepStreamProvider({
  children,
  onStreamReady,
}: PrepStreamProviderProps) {
  const [isPrepOpen, setIsPrepOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [streamData, setStreamData] = useState<{
    title: string;
    tags: string[];
    isPrivate: boolean;
    thumbnailUrl: string | null;
    thumbnailFile: File | null;
  } | null>(null);
  const [persistedStreamMetadata, setPersistedStreamMetadata] =
    useState<StreamMetadata | null>(null);
  const router = useRouter();

  const openPrepModal = () => setIsPrepOpen(true);
  const closePrepModal = () => {
    setIsPrepOpen(false);
    setIsSetupOpen(false);
    setStreamData(null);
  };

  const clearStreamMetadata = () => {
    setPersistedStreamMetadata(null);
  };

  const handlePrepNext = (data: {
    title: string;
    tags: string[];
    isPrivate: boolean;
    thumbnailUrl: string | null;
    thumbnailFile: File | null;
  }) => {
    setStreamData(data);
    setIsPrepOpen(false);
    setIsSetupOpen(true);
  };

  const handleSetupBack = () => {
    setIsSetupOpen(false);
    setIsPrepOpen(true);
  };

  const handleSetupNext = async (setupType: "browser" | "obs") => {
    if (streamData) {
      let thumbnailStorageId: string | undefined;
      
      // Upload thumbnail if file exists
      if (streamData.thumbnailFile) {
        try {
          const uploadUrl = await fetch("/api/upload-url").then(r => r.json());
          
          const uploadResponse = await fetch(uploadUrl.uploadUrl, {
            method: "POST",
            headers: { "Content-Type": streamData.thumbnailFile.type },
            body: streamData.thumbnailFile,
          });
          
          if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            thumbnailStorageId = result.storageId;
          }
        } catch (error) {
          console.error("Failed to upload thumbnail:", error);
        }
      }
      
      const metadata: StreamMetadata = {
        title: streamData.title,
        tags: streamData.tags,
        isPrivate: streamData.isPrivate,
        thumbnailUrl: streamData.thumbnailUrl,
        thumbnailStorageId,
        setupType,
      };
      setPersistedStreamMetadata(metadata);

      if (onStreamReady) {
        onStreamReady({
          ...metadata,
          setupType, // setupType is guaranteed to be defined here
        });
      }
    }
    closePrepModal();
    // Navigate to appropriate stream page based on setup type
    if (setupType === "obs") {
      router.push("/stream-obs");
    } else {
      router.push("/stream");
    }
  };
  return (
    <PrepStreamContext.Provider
      value={{
        openPrepModal,
        closePrepModal,
        isOpen: isPrepOpen || isSetupOpen,
        streamMetadata: persistedStreamMetadata,
        clearStreamMetadata,
      }}
    >
      {children}
      <PrepStreamModal
        isOpen={isPrepOpen}
        onClose={closePrepModal}
        onNext={handlePrepNext}
      />
      <ChooseSetupModal
        isOpen={isSetupOpen}
        onBack={handleSetupBack}
        onNext={handleSetupNext}
      />
    </PrepStreamContext.Provider>
  );
}
