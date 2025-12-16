"use client";

import { useState } from "react";
import { HiX } from "react-icons/hi";

type RecoverWalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRecover: (seedPhrase: string) => void;
  isProcessing: boolean;
};

export default function RecoverWalletModal({
  isOpen,
  onClose,
  onRecover,
  isProcessing,
}: RecoverWalletModalProps) {
  const [seedPhrase, setSeedPhrase] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (seedPhrase.trim()) {
      onRecover(seedPhrase.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-[90%] sm:max-w-md bg-[#0B0B10] px-6 py-8 sm:px-8 sm:py-10 text-white sm:rounded-4xl sm:shadow-[0_35px_60px_rgba(0,0,0,0.35)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#1B1B21] text-white/80 transition hover:bg-white/20 disabled:opacity-50"
          aria-label="Close"
        >
          <HiX className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Recover Wallet</h2>
          <p className="text-sm text-white/60">
            Enter your 12-word recovery phrase to restore your wallet
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-white/80">
              Recovery Phrase
            </label>
            <textarea
              value={seedPhrase}
              onChange={(e) => setSeedPhrase(e.target.value)}
              placeholder="word1 word2 word3 ..."
              disabled={isProcessing}
              className="w-full h-32 bg-[#1B1B21] rounded-2xl px-4 py-3 text-white placeholder:text-white/30 border border-white/10 focus:border-white/30 focus:outline-none resize-none disabled:opacity-50"
              required
            />
            <p className="mt-2 text-xs text-white/40">
              Separate each word with a space
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 rounded-full border border-white/10 bg-[#2C2C35] text-white font-semibold transition hover:bg-[#3A3A42] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !seedPhrase.trim()}
              className="flex-1 py-3 rounded-full bg-white text-black font-semibold transition hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Recovering..." : "Recover Wallet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
