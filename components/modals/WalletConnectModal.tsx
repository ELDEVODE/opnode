"use client";

import { PiWalletFill } from "react-icons/pi";

type WalletConnectModalProps = {
  isBusy: boolean;
  pendingAction: string | null;
  showConnectingSplash: boolean;
  error: string | null;
  onAction: (actionId: string) => void;
};

export default function WalletConnectModal({
  isBusy,
  pendingAction,
  showConnectingSplash,
  error,
  onAction,
}: WalletConnectModalProps) {
  return (
    <>
      <div className="mb-8 space-y-2 pr-8">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          Connect your wallet
        </h2>
        <p className="text-sm text-white/60">
          If you don't have a wallet, please go and create one.
        </p>
      </div>

      {showConnectingSplash && (
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white">
          Connecting to Breez...
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => onAction("create")}
          disabled={isBusy}
          className="flex w-full items-center gap-4 rounded-full bg-white px-2 py-2 pr-6 text-left transition hover:bg-gray-200 disabled:opacity-70"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
            <PiWalletFill className="h-6 w-6" />
          </div>
          <span className="text-base font-bold text-black">
            Create New Wallet
          </span>
          {pendingAction === "create" && isBusy && (
            <span className="ml-auto text-sm font-medium text-[#FF9100]">
              Processing...
            </span>
          )}
        </button>

        <button
          onClick={() => onAction("resume")}
          disabled={isBusy}
          className="flex w-full items-center gap-4 rounded-full bg-white px-2 py-2 pr-6 text-left transition hover:bg-gray-200 disabled:opacity-70"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
            <PiWalletFill className="h-6 w-6" />
          </div>
          <span className="text-base font-bold text-black">
            <span className="md:hidden">Connect External Wallet</span>
            <span className="hidden md:inline">Restore Wallet</span>
          </span>
          {pendingAction === "resume" && isBusy && (
            <span className="ml-auto text-sm font-medium text-[#FF9100]">
              Processing...
            </span>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </>
  );
}
