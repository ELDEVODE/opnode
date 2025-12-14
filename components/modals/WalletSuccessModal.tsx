"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { FiCopy, FiCheck } from "react-icons/fi";

type WalletSuccessModalProps = {
  onCreateProfile: () => void;
  mnemonic?: string;
};

export default function WalletSuccessModal({
  onCreateProfile,
  mnemonic,
}: WalletSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMnemonic = async () => {
    if (!mnemonic) return;
    
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      toast.success("Recovery phrase copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6 h-32 w-32">
        <Image
          src="/images/3d-glossy-shape%202.svg"
          alt="Success"
          fill
          className="object-contain"
        />
      </div>
      <h2 className="mb-2 text-2xl sm:text-3xl font-semibold">
        Wallet Connected Successfully
      </h2>
      <p className="mb-6 text-sm text-white/60">
        Proceed to creating your profile and start streaming
      </p>

      {mnemonic && (
        <div className="w-full mb-6 bg-[#1A1A1F] rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white/80">🔐 Recovery Phrase</p>
            <button
              onClick={handleCopyMnemonic}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition text-xs font-medium"
            >
              {copied ? (
                <>
                  <FiCheck className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <FiCopy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-black/30 rounded-xl p-3 text-left">
            <p className="text-xs font-mono text-white/90 break-all leading-relaxed">
              {mnemonic}
            </p>
          </div>
          <p className="mt-3 text-xs text-orange-400/90 text-left">
            ⚠️ Save this phrase securely. You'll need it to recover your wallet.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onCreateProfile}
        className="w-full rounded-full bg-white py-3.5 text-base font-bold text-black transition hover:bg-gray-200"
      >
        Create Profile
      </button>
    </div>
  );
}
