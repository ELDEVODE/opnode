"use client";

import { IoClose, IoMoon } from "react-icons/io5";
import { TbCoinBitcoinFilled } from "react-icons/tb";
import { GoChevronLeft } from "react-icons/go";
import { FiFileText } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useWalletModal } from "@/components/providers/WalletModalProvider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getOrCreateWalletUserId } from "@/lib/userId";

type WalletDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function WalletDrawer({ isOpen, onClose }: WalletDrawerProps) {
  const { status, sdk } = useEmbeddedWallet();
  const { openModal } = useWalletModal();
  const [balanceSats, setBalanceSats] = useState<number | null>(null);

  const isReady = status === "ready" && !!sdk;
  
  // Only get userId after mount to avoid SSR issues
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(getOrCreateWalletUserId());
    }
  }, []);

  // Fetch real payment history from Convex
  const paymentHistory = useQuery(
    api.payments.getPaymentHistory,
    isReady && userId ? { userId, limit: 10 } : "skip"
  );

  // Fetch user earnings
  const userProfile = useQuery(
    api.users.getProfile,
    isReady && userId ? { userId } : "skip"
  );

  useEffect(() => {
    let cancelled = false;
    if (!isReady || !sdk || !isOpen) {
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

  const formattedBalance = useMemo(() => {
    if (!isReady) return "0";
    if (balanceSats == null) return "...";
    return balanceSats.toLocaleString();
  }, [isReady, balanceSats]);

  const formattedUSD = useMemo(() => {
    if (!isReady || balanceSats == null) return "$0.00";
    return `$${((balanceSats / 100_000_000) * 45000).toFixed(2)}`;
  }, [isReady, balanceSats]);

  if (!isOpen) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-[#4ADE80]";
      case "pending":
        return "text-[#3B82F6]";
      case "failed":
        return "text-[#EF4444]";
      default:
        return "text-white/60";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "received":
        return "Received";
      case "sent":
        return "Sent";
      case "withdrawal":
        return "Withdrawal";
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <section className="relative h-full w-full max-w-[480px] bg-[#0B0B10] text-white shadow-2xl overflow-y-auto pb-32">
        
        {/* Header / Nav */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-6 bg-[#0B0B10]/90 backdrop-blur-md">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-gray-200"
          >
            <GoChevronLeft className="text-lg" />
            Home
          </button>
        </div>

        <div className="px-6 pb-12">
          <h1 className="mb-8 text-4xl font-bold">
            OpNode
            <br />
            Wallet
          </h1>

          {/* Main Balance Card */}
          <div className="relative mb-6 overflow-hidden rounded-[32px] bg-[#15151A] p-6 border border-white/5">
            <div className="mb-6 flex items-center justify-between text-white/60">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                   {/* Placeholder for Breez Icon - using a generic lightning shape */}
                   <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span className="font-medium">Breez SDK</span>
              </div>
              <IoMoon className="text-xl" />
            </div>

            <div className="mb-2 flex items-baseline gap-2 flex-wrap">
              <TbCoinBitcoinFilled className="h-8 w-8 text-[#FF9100]" />
              <span className="text-4xl font-bold text-white">{formattedBalance} sats</span>
              <span className="text-[#FF9100] font-medium">{formattedUSD}</span>
            </div>

            <p className="mb-8 text-sm text-white/40">
              Use the address below or buy bitcoin to get started.
            </p>

            <div className="flex gap-4">
              <button className="flex-1 rounded-full bg-[#FF9100] py-4 text-base font-bold text-black transition hover:brightness-110">
                Send
              </button>
              <button className="flex-1 rounded-full border border-white/10 bg-[#2C2C35] py-4 text-base font-bold text-white transition hover:bg-[#3A3A42]">
                Receive
              </button>
            </div>
          </div>

          {/* Earnings Card */}
          <div className="mb-8 rounded-[32px] bg-[#15151A] p-6 border border-white/5">
            <p className="mb-2 text-base font-medium text-white/60">Earnings</p>
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <TbCoinBitcoinFilled className="h-6 w-6 text-white/20" />
                <span className="text-3xl font-bold text-white/40">
                  {userProfile?.totalEarnings?.toLocaleString() || "0"} sats
                </span>
              </div>
              <span className="text-white/40 font-medium">
                ~${userProfile ? ((userProfile.totalEarnings / 100_000_000) * 45000).toFixed(2) : "0.00"}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/20">All time on OpNode</p>
          </div>

          {/* History */}
          <div>
            <h3 className="mb-6 text-xl font-bold text-white/60">History</h3>
            {!paymentHistory || paymentHistory.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {paymentHistory.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-2xl bg-[#15151A] p-4 border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/60">
                        <FiFileText className="text-lg" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {getTypeLabel(item.type)}
                        </p>
                        <p className="text-xs text-white/40">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <TbCoinBitcoinFilled className="h-4 w-4 text-[#FF9100]" />
                        <span className="font-bold text-white">
                          {item.type === "received" ? "+" : "-"}
                          {item.amountSats} sats
                        </span>
                      </div>
                      <p className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
