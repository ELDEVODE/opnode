"use client";

import { HiX } from "react-icons/hi";
import Image from "next/image";
import { HiEye, HiClock, HiGift } from "react-icons/hi2";
import { BiCoin } from "react-icons/bi";

interface LiveEndedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  stats: {
    viewers: string;
    followers: number;
    earnings: number;
    gifts: number;
    streamDuration: string;
    streamedTime: string;
  };
}

export default function LiveEndedModal({
  isOpen,
  onClose,
  onContinue,
  stats,
}: LiveEndedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[90%] lg:max-w-[500px] max-h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-[#3a3a3a]/80 hover:bg-[#4a4a4a] flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <HiX className="w-6 h-6 text-white/80" />
        </button>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-12">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 flex items-center justify-center">
              <Image
                src="/images/3d-glossy-shape 2.svg"
                alt="Live Ended"
                width={128}
                height={128}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Title */}
          <div className="mb-2 text-center">
            <h2 className="text-4xl font-bold text-white mb-2">
              Live has Ended
            </h2>
            <p className="text-white/50 text-base">
              Streamed {stats.streamedTime}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mt-8 mb-8 bg-[#1a1a1a] rounded-3xl p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Viewers */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#3a3a3a] flex items-center justify-center flex-shrink-0">
                  <HiEye className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Viewers</p>
                  <p className="text-white text-2xl font-bold">
                    {stats.viewers}
                  </p>
                </div>
              </div>

              {/* Followers */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#3a3a3a] flex items-center justify-center flex-shrink-0">
                  <HiClock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Followers</p>
                  <p className="text-white text-2xl font-bold">
                    {stats.followers}
                  </p>
                </div>
              </div>

              {/* Earnings */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#3a3a3a] flex items-center justify-center flex-shrink-0">
                  <BiCoin className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Earnings</p>
                  <p className="text-white text-2xl font-bold">
                    {stats.earnings}
                  </p>
                </div>
              </div>

              {/* Gifts */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#3a3a3a] flex items-center justify-center flex-shrink-0">
                  <HiGift className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Gifts</p>
                  <p className="text-white text-2xl font-bold">{stats.gifts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stream Duration */}
          <div className="flex items-center justify-center gap-2 mb-8 text-white/60">
            <HiClock className="w-5 h-5" />
            <span className="text-base">Stream - {stats.streamDuration}</span>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full bg-white text-black py-4 rounded-full font-semibold text-lg hover:bg-white/90 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
