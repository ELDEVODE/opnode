"use client";

import { TbCoinBitcoinFilled } from "react-icons/tb";
import { useWalletModal } from "@/components/providers/WalletModalProvider";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useWalletDrawer } from "@/components/providers/WalletDrawerProvider";
import { useEffect, useMemo, useState } from "react";
import { useBitcoinPrice, satsToUSD } from "@/hooks/useBitcoinPrice";

type BalanceComponentProps = {
  className?: string;
};

export default function BalanceComponent({
  className = "",
}: BalanceComponentProps) {
  const { openModal } = useWalletModal();
  const { status, sdk } = useEmbeddedWallet();
  const { openDrawer } = useWalletDrawer();
  const { btcPrice } = useBitcoinPrice();

  const [balanceSats, setBalanceSats] = useState<number | null>(null);

  const isConnected = status === "ready";

  // Fetch balance
  useEffect(() => {
    if (!sdk || status !== "ready") {
      setBalanceSats(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const info = await sdk.getInfo({ ensureSynced: false });
        const balanceMsat = info.balanceSats || 0;
        setBalanceSats(balanceMsat);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };

    fetchBalance();

    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);

    return () => clearInterval(interval);
  }, [sdk, status]);

  const formattedBalance = useMemo(() => {
    if (balanceSats === null) return "---";
    return balanceSats.toLocaleString();
  }, [balanceSats]);

  const usdBalance = useMemo(() => {
    if (balanceSats === null || !btcPrice) return null;
    return satsToUSD(balanceSats, btcPrice);
  }, [balanceSats, btcPrice]);

  return (
    <section className={className}>
      <div className="flex h-full w-full flex-col gap-6 rounded-2xl bg-[#0B0B10]/60 px-6 py-5 text-white shadow-[0_8px_45px_rgba(241,242,245,0.08)]">
        <p className="text-sm font-semibold text-white/70">Balance</p>

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 min-w-[3rem] items-center justify-center rounded-full bg-orange-500/20">
            <TbCoinBitcoinFilled className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold leading-tight">
              {isConnected ? formattedBalance : "---"}
            </span>
            <span className="text-sm text-white/50">
              {isConnected ? "sats" : "Not connected"}
            </span>
            {isConnected && usdBalance && (
              <span className="text-xs text-white/40 mt-0.5">
                ≈ {usdBalance}
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
