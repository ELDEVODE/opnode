"use client";

import ConnectWalletModal from "@/components/ConnectWalletModal";
import { useWalletModalStore } from "@/stores/walletModalStore";

export function useWalletModal() {
  const { isOpen, openModal, closeModal } = useWalletModalStore();
  return { isOpen, openModal, closeModal };
}

export default function WalletModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, closeModal } = useWalletModalStore();

  return (
    <>
      {children}
      <ConnectWalletModal
        isOpen={isOpen}
        onClose={closeModal}
      />
    </>
  );
}
