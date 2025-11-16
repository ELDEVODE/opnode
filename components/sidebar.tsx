"use client";

import { HiOutlineBell } from "react-icons/hi2";
import { GoHomeFill } from "react-icons/go";
import { PiWallet } from "react-icons/pi";
import { useWalletModal } from "@/components/providers/WalletModalProvider";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useCallback } from "react";
import { useWalletDrawer } from "@/components/providers/WalletDrawerProvider";

const navItems = [
  { label: "Home", icon: GoHomeFill, active: true },
  { label: "Wallet", icon: PiWallet, active: false },
  { label: "Notifications", icon: HiOutlineBell, active: false },
];

export default function Sidebar() {
  const { openModal } = useWalletModal();
  const { status, disconnect } = useEmbeddedWallet();
  const { openDrawer } = useWalletDrawer();
  const isConnecting = status === "connecting";
  const isReady = status === "ready";

  const handleDisconnect = useCallback(() => {
    disconnect().catch((err) => console.error("Failed to disconnect wallet", err));
  }, [disconnect]);

  return (
    <aside className="w-[204px] shrink-0 bg-[#050505] px-6 py-8 text-white">
      <button
        type="button"
        onClick={openModal}
        disabled={isConnecting}
        className={`w-[156px] rounded-full bg-white py-3 text-sm font-semibold capitalize tracking-wide text-black shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:translate-y-px ${
          isConnecting ? "opacity-70" : ""
        }`}
      >
        {isConnecting
          ? "Connecting..."
          : isReady
            ? "Go live"
            : "Connect Wallet"}
      </button>
      {/* 
      {isReady && (
        <p className="mt-2 text-center text-xs uppercase tracking-wide text-[#72F3A0]">
          Embedded wallet active
        </p>
      )} */}

      <nav className="mt-12 flex flex-col items-center gap-6">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-white"
            aria-current={active ? "page" : undefined}
            type="button"
            onClick={label === "Wallet" ? openDrawer : undefined}
          >
            <span
              className={`flex h-[68px] w-[68px] items-center justify-center rounded-full ${
                active ? "bg-[#FF9100] text-white" : "bg-[#53525A] text-white"
              }`}
            >
              <Icon className="h-7 w-7" />
            </span>
            <span className={active ? "text-[#FF9100]" : "text-[#A0A0A8]"}>
              {label}
            </span>
          </button>
        ))}
      </nav>

      {isReady && (
        <button
          type="button"
          onClick={handleDisconnect}
          className="mt-10 w-full rounded-3xl border border-white/20 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-red-400 hover:text-red-300"
        >
          Disconnect Wallet
        </button>
      )}
    </aside>
  );
}
