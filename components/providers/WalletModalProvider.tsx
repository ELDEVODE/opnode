"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import ConnectWalletModal from "@/components/ConnectWalletModal";

type WalletModalContextValue = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const WalletModalContext = createContext<WalletModalContextValue | undefined>(
  undefined
);

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (!context) {
    throw new Error("useWalletModal must be used within WalletModalProvider");
  }
  return context;
}

export default function WalletModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openModal, closeModal }),
    [isOpen, openModal, closeModal]
  );

  return (
    <WalletModalContext.Provider value={value}>
      {children}
      <ConnectWalletModal isOpen={isOpen} onClose={closeModal} />
    </WalletModalContext.Provider>
  );
}
