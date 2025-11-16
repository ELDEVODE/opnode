"use client";

import { IoClose } from "react-icons/io5";
import { TbCoinBitcoinFilled } from "react-icons/tb";
import { useEffect, useMemo, useState } from "react";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useWalletModal } from "@/components/providers/WalletModalProvider";

type WalletDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

function truncate(value?: string | null, threshold = 24) {
  if (!value) return "";
  if (value.length <= threshold) return value;
  return `${value.slice(0, threshold / 2)}…${value.slice(-6)}`;
}

function CopyButton({ value }: { value?: string | null }) {
  const handleCopy = () => {
    if (!value || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    navigator.clipboard
      .writeText(value)
      .catch((err) => console.error("Copy failed", err));
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:border-white disabled:opacity-40"
    >
      Copy
    </button>
  );
}

export default function WalletDrawer({ isOpen, onClose }: WalletDrawerProps) {
  const { status, sdk, walletId, publicKey } = useEmbeddedWallet();
  const { openModal } = useWalletModal();
  const [balanceSats, setBalanceSats] = useState<number | null>(null);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const isReady = status === "ready" && !!sdk;

  useEffect(() => {
    let cancelled = false;
    if (!isReady || !sdk || !isOpen) {
      if (!isOpen) {
        setDepositAddress(null);
        setAddressError(null);
      }
      return () => {
        cancelled = true;
      };
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
        console.error("Failed to load balance", err);
        if (!cancelled) {
          setBalanceSats(0);
        }
      }
    };

    loadBalance();
    return () => {
      cancelled = true;
    };
  }, [isReady, sdk, isOpen]);

  useEffect(() => {
    let cancelled = false;
    if (!isReady || !sdk || !isOpen) {
      setDepositAddress(null);
      return () => {
        cancelled = true;
      };
    }

    const fetchAddress = async () => {
      setIsAddressLoading(true);
      setAddressError(null);
      try {
        const response = (await sdk.receivePayment({
          paymentMethod: { type: "bitcoinAddress" },
        })) as any;
        if (!cancelled) {
          setDepositAddress(response?.paymentRequest ?? null);
        }
      } catch (err) {
        console.error("Failed to get address", err);
        if (!cancelled) {
          setAddressError(
            err instanceof Error ? err.message : "Unable to get address"
          );
        }
      } finally {
        if (!cancelled) {
          setIsAddressLoading(false);
        }
      }
    };

    fetchAddress();
    return () => {
      cancelled = true;
    };
  }, [isReady, sdk, isOpen]);

  const formattedBalance = useMemo(() => {
    if (!isReady) return "Wallet offline";
    if (balanceSats == null) return "Syncing...";
    return `${balanceSats.toLocaleString()} sats`;
  }, [isReady, balanceSats]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <section className="relative h-full w-full max-w-[420px] translate-x-0 bg-[#111116] px-8 py-10 text-white shadow-[0_0_60px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out">
        <button
          aria-label="Close wallet drawer"
          className="absolute right-6 top-6 rounded-full bg-white/10 p-2"
          onClick={onClose}
          type="button"
        >
          <IoClose className="h-5 w-5" />
        </button>

        <div className="mt-6 flex flex-col gap-6">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.5em] text-white/40">
              Breez SDK
            </p>
            <div className="mt-4 flex items-center gap-4">
              <TbCoinBitcoinFilled className="h-10 w-10 text-[#FF8F3F]" />
              <div>
                <p className="text-4xl font-semibold">{formattedBalance}</p>
                <p className="text-sm text-white/60">
                  Use the address below or buy bitcoin to get started.
                </p>
              </div>
            </div>
          </header>

          {isReady ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <button className="flex-1 rounded-3xl bg-[#FF8F3F] py-3 text-lg font-semibold text-black">
                  Buy BTC
                </button>
                <button className="flex-1 rounded-3xl border border-white/20 py-3 text-lg font-semibold text-white">
                  Withdraw
                </button>
              </div>

              <div className="rounded-3xl bg-white/5 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  Deposit Address
                </p>
                <div className="mt-2 flex items-center justify-between gap-3 font-mono text-base">
                  <span className="truncate">
                    {depositAddress ??
                      (isAddressLoading ? "Generating..." : "Unavailable")}
                  </span>
                  <CopyButton value={depositAddress} />
                </div>
                {addressError && (
                  <p className="mt-2 text-xs text-red-300">{addressError}</p>
                )}
              </div>

              <div className="rounded-3xl bg-white/5 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  Wallet ID
                </p>
                <div className="mt-1 flex items-center justify-between gap-3 font-mono text-base">
                  <span className="truncate">{truncate(walletId)}</span>
                  <CopyButton value={walletId} />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  Public Key
                </p>
                <div className="mt-1 flex items-center justify-between gap-3 font-mono text-base">
                  <span className="truncate">{truncate(publicKey)}</span>
                  <CopyButton value={publicKey} />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white/5 px-4 py-6 text-center">
              <p className="text-sm text-white/70">
                Connect a wallet to view deposit addresses and account activity.
              </p>
              <button
                type="button"
                onClick={openModal}
                className="mt-4 w-full rounded-full bg-white py-3 text-sm font-semibold text-black"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
