"use client";

import { TbCoinBitcoinFilled } from "react-icons/tb";
import { useWalletModal } from "@/components/providers/WalletModalProvider";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useWalletDrawer } from "@/components/providers/WalletDrawerProvider";
import { useEffect, useMemo, useState } from "react";

type BalanceComponentProps = {
  className?: string;
};

export default function BalanceComponent({
  className = "",
}: BalanceComponentProps) {
  const { openModal } = useWalletModal();
  const { status, sdk } = useEmbeddedWallet();
  const { openDrawer } = useWalletDrawer();

  const [balanceSats, setBalanceSats] = useState<number | null>(null);

  const isConnected = status === "ready" && !!sdk;

  useEffect(() => {
    let cancelled = false;
    if (!isConnected || !sdk) {
      setBalanceSats(null);
      return;
    }

    const loadBalance = async () => {
      try {
        const info = (await sdk.getInfo({ ensureSynced: false })) as any;
        if (!cancelled) {
          setBalanceSats(
            typeof info?.balanceSats === "number" ? info.balanceSats : 0
          );
        }
      } catch (err) {
        console.error("Failed to load Breez balance", err);
        if (!cancelled) {
          setBalanceSats(0);
        }
      }
    };

    loadBalance();

    // Listen for balance refresh events
    const handleRefresh = () => {
      if (!cancelled) {
        loadBalance();
      }
    };
    window.addEventListener('wallet-balance-refresh', handleRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener('wallet-balance-refresh', handleRefresh);
    };
  }, [isConnected, sdk]);

  const formattedBalance = useMemo(() => {
    if (!isConnected) {
      return "0 sats";
    }
    if (balanceSats == null) {
      return "Syncing...";
    }
    return `${balanceSats.toLocaleString()} sats`;
  }, [balanceSats, isConnected]);

  return (
    <section
      className={`flex h-full w-full flex-col gap-8 rounded-4xl bg-[#1F1F25] px-8 py-10 text-white shadow-[0_25px_45px_rgba(0,0,0,0.45)] ${className}`}
    >
      <header className="mb-2 text-[13px] font-semibold uppercase tracking-widest text-[#A2A2B0]">
        <span>BALANCE</span>
      </header>

      <div className="flex flex-1 flex-col justify-center min-h-[60px]">
        <div className="flex items-center gap-3">
          <TbCoinBitcoinFilled className="h-8 w-8 text-[#FF9533] shrink-0" />
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-[56px] font-bold leading-none text-white tracking-tight">
              {isConnected ? (balanceSats !== null ? balanceSats.toLocaleString() : "...") : "0"}
            </span>
            <span className="text-[40px] font-medium leading-none text-white">sats</span>
            {isConnected && balanceSats !== null && (<span className="text-xl font-medium text-[#FF9533] ml-1">
                ~${((balanceSats / 100_000_000) * 45000).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto w-full pt-6">
        {isConnected ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              className="rounded-full bg-[#FF9533] py-4 text-center text-[15px] font-bold text-black shadow-lg transition hover:brightness-110"
              type="button"
              onClick={openDrawer}
            >
              Receive
            </button>
            <button
              className="rounded-full border border-white/10 bg-[#2C2C35] py-4 text-center text-[15px] font-bold text-white transition hover:bg-[#3A3A42]"
              type="button"
              onClick={openDrawer}
            >
              Send
            </button>
          </div>
        ) : (
          <button
            className="w-full rounded-full bg-white py-4 text-[15px] font-bold text-black shadow-lg transition hover:brightness-90"
            type="button"
            onClick={openModal}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </section>
  );
}
