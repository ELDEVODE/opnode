"use client";

import { GoHomeFill, GoPlus } from "react-icons/go";
import { PiWallet, PiMagnifyingGlass } from "react-icons/pi";
import { useWalletDrawer } from "@/components/providers/WalletDrawerProvider";
import { useWalletModal } from "@/components/providers/WalletModalProvider";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useCameraPermissions } from "@/components/providers/CameraPermissionsProvider";

export default function MobileBottomNav() {
  const { openDrawer, closeDrawer, isOpen } = useWalletDrawer();
  const { openModal } = useWalletModal();
  const { status } = useEmbeddedWallet();
  const { openPermissionsModal } = useCameraPermissions();
  const isReady = status === "ready";

  const handleGoLiveClick = () => {
    if (isReady) {
      // If wallet is connected, show camera permissions
      openPermissionsModal();
    } else {
      // Otherwise, show wallet connection modal
      openModal();
    }
  };

  return (
    <>
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-40 bg-linear-to-t from-black/90 via-black/50 to-transparent md:hidden" />
      <div className="fixed bottom-6 left-6 right-6 z-70 md:hidden">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeDrawer}
              className={`flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-lg transition transform active:scale-95 ${
                !isOpen
                  ? "bg-[#FF9100] text-white"
                  : "bg-[#4A4A52] text-white hover:bg-[#5A5A62]"
              }`}
              aria-label="Home"
            >
              <GoHomeFill className="h-7 w-7" />
            </button>

            <button
              type="button"
              onClick={openDrawer}
              className={`flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-lg transition transform active:scale-95 ${
                isOpen
                  ? "bg-[#FF9100] text-white"
                  : "bg-[#4A4A52] text-white hover:bg-[#5A5A62]"
              }`}
              aria-label="Wallet"
            >
              <PiWallet className="h-7 w-7" />
            </button>

            <button
              type="button"
              className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#4A4A52] text-white hover:bg-[#5A5A62] transition transform active:scale-95"
              aria-label="Search"
            >
              <PiMagnifyingGlass className="h-7 w-7" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoLiveClick}
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white text-black shadow-lg transition transform active:scale-95"
            aria-label="Go Live"
          >
            <GoPlus className="h-7 w-7" />
          </button>
        </nav>
      </div>
    </>
  );
}
