"use client";

import { useState } from "react";
import { HiX } from "react-icons/hi";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import Image from "next/image";

type SceneLayout = "chat" | "general";

interface SceneSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (layout: SceneLayout) => void;
  currentLayout?: SceneLayout;
}

export default function SceneSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  currentLayout = "chat",
}: SceneSelectionModalProps) {
  const [selectedLayout, setSelectedLayout] =
    useState<SceneLayout>(currentLayout);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedLayout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full md:h-auto max-w-md bg-[#131316] md:rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200 z-10"
          aria-label="Close"
        >
          <HiX className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6 mt-4 md:mt-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden transform rotate-12">
            <Image
              src="/images/3d-glossy-shape 2.svg"
              alt="3D Shape"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Scene Selection
          </h2>
          <p className="text-white/60 text-sm">
            Select a layout for your stream and camera
          </p>
        </div>

        {/* Layout Options */}
        <div className="grid grid-cols-2 gap-4 mb-8 flex-1 md:flex-none content-center">
          {/* Chat (Default) Layout */}
          <button
            onClick={() => setSelectedLayout("chat")}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-200 ${
              selectedLayout === "chat"
                ? "border-white bg-white/5"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <div className="aspect-[3/4] mb-4 bg-black rounded-xl flex items-center justify-center relative overflow-hidden">
              {/* Chat Layout Visualization */}
              <div className="absolute inset-0 p-3 flex flex-col">
                {/* Top bar */}
                <div className="h-2 bg-white/40 rounded-full mb-auto w-3/4" />

                {/* Camera in center */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Bottom chat lines */}
                <div className="space-y-1 mt-auto">
                  <div className="h-1 bg-white/40 rounded-full w-1/3" />
                  <div className="h-1 bg-white/40 rounded-full w-full" />
                  <div className="h-1 bg-white/40 rounded-full w-full" />
                </div>
              </div>
            </div>
            <p className="text-sm font-semibold text-white text-center">
              Chat (Default)
            </p>
          </button>

          {/* General Layout */}
          <button
            onClick={() => setSelectedLayout("general")}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-200 ${
              selectedLayout === "general"
                ? "border-white bg-white/5"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <div className="aspect-[3/4] mb-4 bg-black rounded-xl flex items-center justify-center relative overflow-hidden">
              {/* General Layout Visualization */}
              <div className="absolute inset-0 p-3 flex flex-col">
                {/* Top bar with device icon */}
                <div className="h-2 bg-white/40 rounded-full mb-auto w-3/4" />

                {/* Main content area */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-16 h-20 bg-white/30 rounded-lg flex items-center justify-center border-2 border-white/20">
                    <svg
                      className="w-6 h-6 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Camera in corner */}
                <div className="flex justify-start items-end">
                  <div className="w-8 h-8 bg-white/30 rounded flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 ml-2 space-y-1">
                    <div className="h-1 bg-white/40 rounded-full w-2/3" />
                    <div className="h-1 bg-white/40 rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm font-semibold text-white text-center">
              General
            </p>
          </button>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-full bg-white text-black font-semibold text-base hover:bg-white/90 transition-all duration-200 mt-auto"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
