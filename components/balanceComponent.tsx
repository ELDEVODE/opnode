"use client";

import { TbCoinBitcoinFilled } from "react-icons/tb";
import { useWalletModal } from "@/components/providers/WalletModalProvider";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useEffect, useMemo, useState } from "react";

type BalanceComponentProps = {
  className?: string;
};

export default function BalanceComponent({
  className = "",
}: BalanceComponentProps) {
  const { openModal } = useWalletModal();
  const { status, sdk } = useEmbeddedWallet();

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
          setBalanceSats(typeof info?.balanceSats === "number" ? info.balanceSats : 0);
        }
      } catch (err) {
        console.error("Failed to load Breez balance", err);
        if (!cancelled) {
          setBalanceSats(0);
        }
      }
    };

    loadBalance();
    return () => {
      cancelled = true;
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
      <header className="flex items-center justify-between text-[16px] font-semibold uppercase tracking-widest text-[#A2A2B0]">
        <span>BALANCE</span>
      </header>

      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center">
          <TbCoinBitcoinFilled
            color="#FD9535"
            className="h-7 w-7 text-[#FD9535]"
          />
          <p className="ml-2 text-[56px] font-semibold leading-none sm:text-6xl">
            {formattedBalance}
          </p>
        </div>

        <span className="text-right text-sm font-medium uppercase tracking-[0.2em] text-[#FF9533]">
          {isConnected ? "Wallet Live" : "Wallet Offline"}
        </span>
      </div>

      {isConnected ? (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            className="rounded-3xl bg-[#FF9533] py-3 text-center text-lg font-semibold text-black shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition hover:translate-y-px"
            type="button"
          >
            Buy BTC
          </button>
          <button
            className="rounded-3xl border border-white/20 py-3 text-center text-lg font-semibold text-white transition hover:translate-y-px"
            type="button"
          >
            Withdraw
          </button>
        </div>
      ) : (
        <button
          className="mt-2 w-full rounded-full bg-white py-4 text-lg font-semibold text-black shadow-[0_15px_35px_rgba(0,0,0,0.25)] transition hover:translate-y-px"
          type="button"
          onClick={openModal}
        >
          Connect Wallet
        </button>
      )}
    </section>
  );
}
