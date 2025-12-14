"use client";

import { useState } from "react";
import { HiX } from "react-icons/hi";

interface ShareOption {
  id: string;
  name: string;
  thumbnail?: string;
}

interface ShareScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (optionId: string) => void;
}

export default function ShareScreenModal({
  isOpen,
  onClose,
  onShare,
}: ShareScreenModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Mock share options - in real implementation, these would come from browser API
  const shareOptions: ShareOption[] = [
    { id: "figma", name: "Figma" },
    { id: "fifa-2026", name: "FIFA 2026" },
    { id: "youtube", name: "YouTube - Shxts n..." },
    { id: "whatsapp", name: "WhatsApp" },
    { id: "downloads", name: "Downloads" },
  ];

  if (!isOpen) return null;

  const handleShare = () => {
    if (selectedOption) {
      onShare(selectedOption);
      onClose();
    }
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full md:h-auto max-w-2xl bg-[#131316] md:rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200 z-10"
          aria-label="Close"
        >
          <HiX className="w-5 h-5" />
        </button>

        {/* Title & Description */}
        <div className="text-left mb-8 mt-4 md:mt-0">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Choose What To Share
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            Your viewers will be able to see the contents of your screen.
          </p>
        </div>

        {/* Share Options Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 flex-1 md:flex-none content-start overflow-y-auto">
          {shareOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              className={`relative p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col ${
                selectedOption === option.id
                  ? "border-white bg-white/5"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              <div className="aspect-square mb-3 md:mb-4 bg-black rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Placeholder for window/tab preview */}
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
              </div>
              <p className="text-sm font-medium text-white text-center truncate">
                {option.name}
              </p>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 mt-auto">
          {/* Mobile: "Choose Shared Screen" button */}
          <button
            onClick={handleShare}
            disabled={!selectedOption}
            className="md:hidden w-full py-4 rounded-full bg-white text-black font-semibold text-base hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/50"
          >
            Choose Shared Screen
          </button>

          {/* Desktop: "Share" button */}
          <button
            onClick={handleShare}
            disabled={!selectedOption}
            className="hidden md:block w-full py-4 rounded-full bg-white text-black font-semibold text-base hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/50"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
