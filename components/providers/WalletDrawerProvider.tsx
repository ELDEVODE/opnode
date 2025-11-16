"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import WalletDrawer from "@/components/WalletDrawer";

export type WalletDrawerContextValue = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const WalletDrawerContext = createContext<WalletDrawerContextValue | undefined>(
  undefined
);

export function useWalletDrawer() {
  const ctx = useContext(WalletDrawerContext);
  if (!ctx) {
    throw new Error("useWalletDrawer must be used within WalletDrawerProvider");
  }
  return ctx;
}

export default function WalletDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, openDrawer, closeDrawer }), [isOpen, openDrawer, closeDrawer]);

  return (
    <WalletDrawerContext.Provider value={value}>
      {children}
      <WalletDrawer isOpen={isOpen} onClose={closeDrawer} />
    </WalletDrawerContext.Provider>
  );
}
