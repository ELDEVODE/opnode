"use client";

import { IoClose } from "react-icons/io5";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useWalletModalStore } from "@/stores/walletModalStore";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getOrCreateWalletUserId } from "@/lib/userId";

// Modal Components
import WalletConnectModal from "@/components/modals/WalletConnectModal";
import WalletSuccessModal from "@/components/modals/WalletSuccessModal";
import ChooseUsernameModal from "@/components/modals/ChooseUsernameModal";
import CreatingProfileModal from "@/components/modals/CreatingProfileModal";
import AddressCreatedModal from "@/components/modals/AddressCreatedModal";
import ProfilePreviewModal from "@/components/modals/ProfilePreviewModal";

type ConnectWalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ConnectWalletModal({
  isOpen,
  onClose,
}: ConnectWalletModalProps) {
  const { status, connectNewWallet, resumeWallet, error } = useEmbeddedWallet();

  // Zustand store
  const {
    currentStep,
    username,
    usernameStatus,
    setStep,
    setUsername,
    setUsernameStatus,
    resetModal,
  } = useWalletModalStore();

  // Local state for wallet connection
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showConnectingSplash, setShowConnectingSplash] = useState(false);
  const [profileImages, setProfileImages] = useState<{
    avatarStorageId?: Id<"_storage">;
    bannerStorageId?: Id<"_storage">;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only get userId after mount to avoid SSR issues
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(getOrCreateWalletUserId());
    }
  }, []);

  // Mutation to create profile
  const createProfile = useMutation(api.users.upsertProfile);
  const ensureProfile = useMutation(api.users.ensureProfile);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(value);

    if (value.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    // Status will be managed by the query in ChooseUsernameModal
    setUsernameStatus("checking");
  };

  const handleCreateProfile = async () => {
    setStep("creating");

    try {
      if (!userId) {
        console.error("User ID not available");
        return;
      }

      // Create profile in Convex
      await createProfile({
        userId,
        username,
        displayName: username,
        avatarStorageId: profileImages.avatarStorageId,
        bannerStorageId: profileImages.bannerStorageId,
      });

      // Simulate delay for UX
      setTimeout(() => {
        setStep("addressCreated");
      }, 2000);
    } catch (err) {
      console.error("Profile creation failed:", err);
      // Still proceed for better UX
      setTimeout(() => {
        setStep("addressCreated");
      }, 2000);
    }
  };

  const handleProfileContinue = async (
    avatarStorageId?: Id<"_storage">,
    bannerStorageId?: Id<"_storage">
  ) => {
    setIsSaving(true);
    try {
      setProfileImages({
        avatarStorageId,
        bannerStorageId,
      });

      if (!userId) {
        console.error("User ID not available");
        return;
      }

      // Save profile with images
      await createProfile({
        userId,
        username,
        displayName: username,
        avatarStorageId,
        bannerStorageId,
      });

      // Success - close the modal
      setTimeout(() => {
        resetModal();
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Profile save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalContinue = () => {
    // This is now handled by handleProfileContinue
  };

  const handleAddressCreatedContinue = () => {
    setStep("profile");
  };

  const isBusy = useMemo(() => status === "connecting", [status]);

  const startConnectingSplash = useCallback(() => {
    if (splashTimerRef.current) {
      clearTimeout(splashTimerRef.current);
    }
    setShowConnectingSplash(true);
    splashTimerRef.current = setTimeout(() => {
      setShowConnectingSplash(false);
      splashTimerRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen, resetModal]);

  // Automatically transition to success step when wallet connects
  useEffect(() => {
    const checkAndCreateProfile = async () => {
      if (status === "ready" && currentStep === "connect" && userId) {
        // Ensure user has a default profile
        try {
          await ensureProfile({ userId });
        } catch (err) {
          console.error("Failed to create default profile:", err);
        }

        setStep("success");
      }
    };

    checkAndCreateProfile();
  }, [status, currentStep, setStep, userId, ensureProfile]);

  useEffect(() => {
    return () => {
      if (splashTimerRef.current) {
        clearTimeout(splashTimerRef.current);
      }
    };
  }, []);

  const handleAction = async (actionId: string) => {
    if (isBusy) {
      return;
    }
    setPendingAction(actionId);
    startConnectingSplash();
    try {
      if (actionId === "create") {
        await connectNewWallet();
      } else {
        await resumeWallet();
      }
    } catch (actionError) {
      console.error("Wallet action failed", actionError);
    } finally {
      setPendingAction(null);
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = () => {
    onClose();
  };

  const renderModalContent = () => {
    // Show wallet steps when ready
    if (status === "ready") {
      switch (currentStep) {
        case "success":
          return (
            <div className="flex flex-col h-full">
              <WalletSuccessModal onCreateProfile={() => setStep("username")} />
              <button
                onClick={() => {
                  resetModal();
                  onClose();
                }}
                className="mt-4 text-sm text-gray-400 hover:text-white transition"
              >
                Skip for now
              </button>
            </div>
          );
        case "username":
          return (
            <ChooseUsernameModal
              username={username}
              usernameStatus={usernameStatus}
              onUsernameChange={handleUsernameChange}
              onContinue={handleCreateProfile}
              onStatusChange={setUsernameStatus}
            />
          );
        case "creating":
          return <CreatingProfileModal username={username} />;
        case "addressCreated":
          return (
            <AddressCreatedModal
              username={username}
              onContinue={handleAddressCreatedContinue}
            />
          );
        case "profile":
          return (
            <div className="flex flex-col h-full">
              <ProfilePreviewModal
                username={username}
                onContinue={handleProfileContinue}
                isLoading={isSaving}
              />
              <button
                onClick={() => {
                  resetModal();
                  onClose();
                }}
                className="mt-4 text-sm text-gray-400 hover:text-white transition text-center"
              >
                Skip and finish later
              </button>
            </div>
          );
        default:
          // Fallback for "connect" or any other step when ready
          return (
            <WalletSuccessModal onCreateProfile={() => setStep("username")} />
          );
      }
    }

    // Show wallet connection modal when not ready
    return (
      <WalletConnectModal
        isBusy={isBusy}
        pendingAction={pendingAction}
        showConnectingSplash={showConnectingSplash}
        error={error ?? null}
        onAction={handleAction}
      />
    );
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-100 flex items-center justify-center sm:px-4 bg-[#0B0B10] sm:bg-black/70 sm:backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full h-full sm:h-auto sm:max-w-md bg-[#0B0B10] px-6 py-8 sm:px-8 sm:py-10 text-white sm:rounded-4xl sm:shadow-[0_35px_60px_rgba(0,0,0,0.35)] flex flex-col justify-center sm:block"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Close connect wallet modal"
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#1B1B21] text-white/80 transition hover:bg-white/20"
          onClick={onClose}
        >
          <IoClose className="h-5 w-5" />
        </button>

        {renderModalContent()}
      </div>
    </div>
  );
}
