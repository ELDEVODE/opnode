"use client";

import Image from "next/image";
import { PiBellSimpleFill } from "react-icons/pi";
import { FaBitcoin } from "react-icons/fa";
import { useWalletModal } from "@/components/providers/WalletModalProvider";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useNotificationPanel } from "@/components/providers/NotificationPanelProvider";
import StreamFilters from "@/components/StreamFilters";
import { useStreamFeedStore } from "@/stores/streamFeedStore";

export default function MobileHeader() {
  const { openModal } = useWalletModal();
  const { status } = useEmbeddedWallet();
  const { openPanel } = useNotificationPanel();
  const isReady = status === "ready";
  const { activeCategory, setActiveCategory } = useStreamFeedStore();

  return (
    <header className="flex flex-col gap-6 px-4 py-6 md:hidden">
      <div className="flex items-center justify-between w-full">
        {/* Left Side: Logo + Balance/Connect */}
        <div className="flex flex-col gap-4 items-start">
          <div className="flex items-center gap-2">
            <Image
              src="/images/Logo.svg"
              alt="OPNODE"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          {isReady ? (
            <div className="flex w-fit items-center gap-3 rounded-full bg-[#1F1F25] pl-1.5 pr-4 py-1.5 text-[13px] font-semibold tracking-wide text-white/80 transition">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF9100] text-white text-[14px]">
                <FaBitcoin />
              </span>
              <span className="uppercase text-[#A0A0A8] mr-1">Balance</span>
              <span className="text-white">79,329 sats</span>
            </div>
          ) : (
            <button
              onClick={openModal}
              className="flex w-fit items-center gap-3 rounded-full bg-[#2C2C35] pl-1.5 pr-6 py-1.5 text-[13px] font-semibold tracking-wide text-[#A0A0A8] transition hover:bg-[#3A3A42]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF9100] text-white text-[14px]">
                <FaBitcoin />
              </span>
              CONNECT WALLET
            </button>
          )}
        </div>

        {/* Right Side: Notifications + Profile */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openPanel}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#53525A] text-white hover:bg-[#63626A] transition"
            aria-label="Notifications"
          >
            <PiBellSimpleFill className="h-6.5 w-6.5" />
          </button>
          <button
            type="button"
            aria-label="Profile"
            className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white bg-white"
          >
            <Image
              src="/images/profile.png"
              alt="Profile"
              fill
              className="object-cover"
            />
          </button>
        </div>
      </div>

      <div className="w-full relative">
        <StreamFilters
          selectedCategory={activeCategory}
          onCategoryChange={(category) => setActiveCategory(category as any)}
          className="pr-12"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-[#050505] to-transparent" />
      </div>
    </header>
  );
}
