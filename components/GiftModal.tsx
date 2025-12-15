"use client";

import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaBitcoin } from "react-icons/fa";
import Image from "next/image";
import {toast } from "sonner";

type GiftModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSendGift: (amount: number) => Promise<void>;
  hostUsername?: string;
  isProcessing: boolean;
};

export default function GiftModal({
  isOpen,
  onClose,
  onSendGift,
  hostUsername = "the streamer",
  isProcessing,
}: GiftModalProps) {
  const [giftAmount, setGiftAmount] = useState(100);

  const handleSend = async () => {
    if (giftAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await onSendGift(giftAmount);
      setGiftAmount(100); // Reset
    } catch (error) {
      // Error handling done in parent
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center sm:px-4 bg-[#0B0B10] sm:bg-black/70 sm:backdrop-blur-md">
      <div
        className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md bg-[#0B0B10] px-6 py-8 sm:px-8 sm:py-10 text-white sm:rounded-4xl sm:shadow-[0_35px_60px_rgba(0,0,0,0.35)] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#1B1B21] text-white/80 transition hover:bg-white/20 z-10 disabled:opacity-50"
        >
          <IoClose className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6 h-24 w-24 sm:h-32 sm:w-32">
            <Image
              src="/images/3d-glossy-shape%202.svg"
              alt="Send Gift"
              fill
              className="object-contain"
            />
          </div>
          
          <h2 className="mb-2 text-2xl sm:text-3xl font-semibold">
            Send Gift ⚡
          </h2>
          <p className="mb-6 sm:mb-8 text-sm text-white/60">
            Send sats via Lightning to support <span className="text-white font-medium">{hostUsername}</span>
          </p>

          <div className="w-full space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-left text-sm font-medium text-white/70 mb-2">
                Amount (sats)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={giftAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Keep the input value as-is while typing
                    setGiftAmount(val === '' ? 0 : parseInt(val));
                  }}
                  min="1"
                  disabled={isProcessing}
                  className="w-full bg-[#1A1A1F] border border-white/10 rounded-2xl px-4 py-3 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                  placeholder="Enter amount"
                />
                <FaBitcoin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
              </div>
              
              {/* Quick Select Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[100, 500, 1000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setGiftAmount(amount)}
                    disabled={isProcessing}
                    className={`px-3 py-2 rounded-2xl text-sm font-semibold transition disabled:opacity-50 ${
                      giftAmount === amount
                        ? 'bg-white text-black'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 rounded-2xl bg-white/10 hover:bg-white/20 py-3.5 text-base font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isProcessing || giftAmount <= 0}
                className="flex-1 rounded-2xl bg-white hover:bg-white/90 py-3.5 text-base font-bold text-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin">⚡</span>
                    Sending...
                  </>
                ) : (
                  `Send ${giftAmount} sats`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
