"use client";

import { PiWalletFill } from "react-icons/pi";
import { IoClose } from "react-icons/io5";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";

type ConnectWalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const walletOptions = [
  {
    id: "create",
    label: "Create Embedded Wallet",
    description:
      "Provision a Breez Spark wallet and store it securely in Convex",
  },
  {
    id: "resume",
    label: "Resume Saved Wallet",
    description:
      "Load the wallet metadata saved in Convex on previous sessions",
  },
];

export default function ConnectWalletModal({
  isOpen,
  onClose,
}: ConnectWalletModalProps) {
  const { status, connectNewWallet, resumeWallet, error } = useEmbeddedWallet();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showConnectingSplash, setShowConnectingSplash] = useState(false);
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (status === "ready" && !showConnectingSplash) {
      setPendingAction(null);
      onClose();
    }
  }, [isOpen, status, onClose, showConnectingSplash]);

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

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md rounded-4xl bg-[#0B0B10] px-8 py-10 text-white shadow-[0_35px_60px_rgba(0,0,0,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Close connect wallet modal"
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-[#1B1B21] text-white/80 transition hover:bg-white/20"
          onClick={onClose}
        >
          <IoClose className="h-5 w-5" />
        </button>

        <div className="space-y-2 pr-12">
          <h2 className="text-3xl font-semibold">Connect your wallet</h2>
          <p className="text-sm text-white/70">
            If you don’t have a wallet, please go and create one.
          </p>
        </div>

        {showConnectingSplash && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white">
            Connecting to Breez...
          </div>
        )}

        <div className="mt-8 space-y-4">
          {walletOptions.map((option) => {
            const isActionActive = pendingAction === option.id && isBusy;
            return (
              <button
                key={option.id}
                className={`flex w-full flex-col gap-2 rounded-3xl bg-white/10 px-5 py-4 text-left transition hover:bg-white/20 ${
                  isBusy ? "opacity-70" : ""
                }`}
                type="button"
                onClick={() => handleAction(option.id)}
                disabled={isBusy}
              >
                <div className="flex items-center gap-3 text-lg font-semibold text-white">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                    <PiWalletFill className="h-5 w-5" />
                  </span>
                  <span>{option.label}</span>
                  {isActionActive && (
                    <span className="ml-auto text-sm font-medium text-[#FF9100]">
                      Processing...
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/70">{option.description}</p>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
