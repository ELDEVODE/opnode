"use client";

import { useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import Image from "next/image";

interface ChooseSetupModalProps {
  isOpen: boolean;
  onBack: () => void;
  onNext: (setupType: "browser" | "obs") => void;
}

export default function ChooseSetupModal({
  isOpen,
  onBack,
  onNext,
}: ChooseSetupModalProps) {
  const [selectedSetup, setSelectedSetup] = useState<"browser" | "obs" | null>(
    null
  );

  const handleSetupSelect = (type: "browser" | "obs") => {
    setSelectedSetup(type);
  };

  const handleNext = () => {
    if (selectedSetup) {
      onNext(selectedSetup);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black md:bg-transparent md:p-4">
      {/* Backdrop - Desktop only */}
      <div
        className="hidden md:block absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onBack}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[500px] h-full md:h-auto flex flex-col">
        <div className="relative bg-black rounded-none md:rounded-3xl flex-1 md:flex-none flex flex-col">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 md:top-6 md:left-6 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 z-10"
            aria-label="Go back"
          >
            <HiArrowLeft className="w-6 h-6 text-white" />
          </button>

          {/* Content Container */}
          <div className="flex-1 flex flex-col px-6 md:px-12 pt-24 md:pt-20 pb-32 md:pb-12">
            {/* Top Section - Image and Text */}
            <div className="flex flex-col items-center mb-10 md:mb-12">
              {/* Decorative Image */}
              <div className="mb-8 md:mb-10">
                <div className="relative w-28 h-28 md:w-32 md:h-32">
                  <Image
                    src="/images/3d-glossy-shape 2.svg"
                    alt="3D Shape"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Title and Subtitle */}
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-4xl font-bold text-white mb-3 leading-tight">
                  Choose Your Setup
                </h2>
                <p className="text-lg md:text-xl text-white/50 font-normal">
                  How do you want to stream?
                </p>
              </div>
            </div>

            {/* Setup Options */}
            <div className="space-y-4 mb-8 flex-1">
              {/* Browser Option - Now disabled */}
              <button
                onClick={() => handleSetupSelect("browser")}
                disabled
                className="w-full p-6 rounded-2xl text-left transition-all duration-200 bg-white/5 border-2 border-white/10 opacity-60 cursor-not-allowed"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="8"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M21 21l-4.35-4.35"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white/60 text-xl font-semibold mb-2">
                      Use your browser—no downloads.
                    </h3>
                    <p className="text-white/40 text-base">
                      Currently unavailable
                    </p>
                  </div>
                </div>
              </button>

              {/* OBS Studio Option - Now active */}
              <button
                onClick={() => handleSetupSelect("obs")}
                className={`w-full p-6 rounded-2xl text-left transition-all duration-200 ${
                  selectedSetup === "obs"
                    ? "bg-white/15 border-2 border-white/40"
                    : "bg-white/5 border-2 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="8"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M21 21l-4.35-4.35"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-xl font-semibold mb-2">
                      High-quality with OBS Studio.
                    </h3>
                    <p className="text-white/50 text-base">
                      Professional streaming setup.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!selectedSetup}
              className={`w-full mt-auto py-5 md:py-6 px-8 rounded-full font-semibold text-lg md:text-xl transition-all ${
                selectedSetup
                  ? "bg-white text-black hover:bg-white/90 active:scale-[0.98]"
                  : "bg-white/20 text-white/40 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
