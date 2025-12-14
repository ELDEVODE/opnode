"use client";

import { HiOutlineBell } from "react-icons/hi2";
import { GoHomeFill } from "react-icons/go";
import { PiWallet } from "react-icons/pi";
import { useWalletModal } from "@/components/providers/WalletModalProvider";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useCallback } from "react";
import { useWalletDrawer } from "@/components/providers/WalletDrawerProvider";
import { useRouter, usePathname } from "next/navigation";
import { useCameraPermissions } from "@/components/providers/CameraPermissionsProvider";
import { useNotificationPanel } from "@/components/providers/NotificationPanelProvider";

const navItems = [
  { label: "Home", icon: GoHomeFill, path: "/dashboard" },
  { label: "Wallet", icon: PiWallet, path: null },
  {
    label: "Notifications",
    icon: HiOutlineBell,
    path: null,
  },
];

export default function Sidebar() {
  const { openModal } = useWalletModal();
  const { status, disconnect } = useEmbeddedWallet();
  const { openDrawer } = useWalletDrawer();
  const { openPanel } = useNotificationPanel();
  const { openPermissionsModal } = useCameraPermissions();
  const router = useRouter();
  const pathname = usePathname();
  const isConnecting = status === "connecting";
  const isReady = status === "ready";

  const handleDisconnect = useCallback(() => {
    disconnect().catch((err) =>
      console.error("Failed to disconnect wallet", err)
    );
  }, [disconnect]);

  const handleGoLiveClick = () => {
    if (isReady) {
      // If wallet is connected, show camera permissions
      openPermissionsModal();
    } else {
      // Otherwise, show wallet connection modal
      openModal();
    }
  };

  const handleNavClick = (label: string, path: string | null) => {
    if (label === "Wallet") {
      openDrawer();
    } else if (label === "Notifications") {
      openPanel();
    } else if (path) {
      router.push(path);
    }
  };

  return (
    <aside className="w-[204px] shrink-0 bg-[#050505] px-6 py-8 text-white flex flex-col items-center">
      <button
        type="button"
        onClick={handleGoLiveClick}
        disabled={isConnecting}
        className={`w-[100px] rounded-full bg-white py-4 text-base font-semibold uppercase tracking-wide text-black shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:translate-y-px ${
          isConnecting ? "opacity-70" : ""
        }`}
      >
        {isConnecting
          ? "Connecting..."
          : isReady
            ? "Go live"
            : "Connect Wallet"}
      </button>

      <nav className="mt-12 flex flex-col items-center gap-6">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path ? pathname === path : false;
          return (
            <button
              key={label}
              className="flex flex-col items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-white"
              aria-current={isActive ? "page" : undefined}
              type="button"
              onClick={() => handleNavClick(label, path)}
            >
              <span
                className={`flex h-[68px] w-[68px] items-center justify-center rounded-full ${
                  isActive
                    ? "bg-[#FF9100] text-white"
                    : "bg-[#53525A] text-white"
                }`}
              >
                <Icon className="h-7 w-7" />
              </span>
              <span className={isActive ? "text-[#FF9100]" : "text-[#A0A0A8]"}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
